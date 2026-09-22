package com.evpredictor.service;

import com.evpredictor.model.*;
import com.evpredictor.repository.DemandRecordRepository;
import com.evpredictor.repository.StationRepository;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class DataService implements CommandLineRunner {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private DemandRecordRepository demandRecordRepository;

    @Override
    public void run(String... args) throws Exception {
        if (zoneRepository.count() == 0) {
            seedData();
        }
    }

    public void seedData() {
        System.out.println("====== SEEDING DATABASE WITH SYNTHETIC EV CHARGING DATA ======");

        // 1. Create Zones
        List<Zone> zones = new ArrayList<>();
        zones.add(new Zone(null, "Tech Park", 4500.0, 8500, new ArrayList<>(), new ArrayList<>()));
        zones.add(new Zone(null, "Residential Area A", 2800.0, 2200, new ArrayList<>(), new ArrayList<>()));
        zones.add(new Zone(null, "Commercial Hub", 5200.0, 6500, new ArrayList<>(), new ArrayList<>()));
        zones.add(new Zone(null, "Highway Corridor", 200.0, 12000, new ArrayList<>(), new ArrayList<>()));
        zones.add(new Zone(null, "Downtown Business District", 6000.0, 7500, new ArrayList<>(), new ArrayList<>()));
        zones.add(new Zone(null, "Suburban Zone", 800.0, 1500, new ArrayList<>(), new ArrayList<>()));
        zones = zoneRepository.saveAll(zones);

        // Helper references
        Zone techPark = zones.get(0);
        Zone residential = zones.get(1);
        Zone commercial = zones.get(2);
        Zone highway = zones.get(3);
        Zone downtown = zones.get(4);
        Zone suburban = zones.get(5);

        // 2. Create Stations (Polymorphic)
        List<Station> stations = new ArrayList<>();

        // Tech Park: High growth, needs capacity. Currently under-served.
        stations.add(new FastChargingStation(null, techPark, 150.0, 4, true, 40)); // Capacity = 40 sessions
        stations.add(new SlowChargingStation(null, techPark, 22.0, 2, true, 20));    // Capacity = 20 sessions
        // Total Tech Park Capacity = 60 sessions/day. (We will make demand average ~65 sessions/day to show under-served status)

        // Residential Area A: Stable demand.
        stations.add(new SlowChargingStation(null, residential, 22.0, 4, true, 20));
        stations.add(new SolarChargingStation(null, residential, 50.0, 4, true, 30));
        // Total Residential Capacity = 50 sessions/day. (Demand ~22 sessions/day -> Adequate)

        // Commercial Hub: Moderate growing demand.
        stations.add(new FastChargingStation(null, commercial, 120.0, 4, true, 40));
        stations.add(new SlowChargingStation(null, commercial, 22.0, 2, true, 20));
        // Total Commercial Capacity = 60 sessions/day. (Demand ~35 sessions/day -> Adequate)

        // Highway Corridor: High traffic, highly under-served.
        stations.add(new FastChargingStation(null, highway, 150.0, 4, true, 40));
        // Total Highway Capacity = 40 sessions/day. (Demand ~48 sessions/day -> Highly under-served)

        // Downtown Business District: Well served.
        stations.add(new FastChargingStation(null, downtown, 150.0, 4, true, 40));
        stations.add(new FastChargingStation(null, downtown, 120.0, 4, true, 40));
        stations.add(new SlowChargingStation(null, downtown, 22.0, 4, true, 20));
        stations.add(new SolarChargingStation(null, downtown, 50.0, 4, true, 30));
        // Total Downtown Capacity = 130 sessions/day. (Demand ~55 sessions/day -> Adequate)

        // Suburban Zone: Low demand.
        stations.add(new SlowChargingStation(null, suburban, 11.0, 2, true, 20));
        // Total Suburban Capacity = 20 sessions/day. (Demand ~4 sessions/day -> Adequate)

        stationRepository.saveAll(stations);

        // 3. Create 90 days of historical demand records with seasonality, growth, and noise
        List<DemandRecord> records = new ArrayList<>();
        LocalDate startDate = LocalDate.now().minusDays(90);
        Random rand = new Random(42); // Fixed seed for reproducible output

        for (int day = 0; day < 90; day++) {
            LocalDate date = startDate.plusDays(day);
            boolean isWeekend = date.getDayOfWeek().getValue() >= 6;

            // Seed records for each zone
            for (Zone zone : zones) {
                int baseDemand = 0;
                int peakHour = 12;
                double growthFactor = day * 0.15; // Represents EV adoption over 90 days

                if (zone.getName().equals("Tech Park")) {
                    // Office zone: high on weekdays, low on weekends
                    baseDemand = isWeekend ? 25 : 55;
                    peakHour = isWeekend ? 14 : 9; // Morning rush hour in office area
                } else if (zone.getName().equals("Residential Area A")) {
                    // Residential: high on weekends, evening peaks
                    baseDemand = isWeekend ? 30 : 15;
                    peakHour = 19; // Evening peak
                } else if (zone.getName().equals("Commercial Hub")) {
                    // Commercial: higher on weekends, afternoon/evening peaks
                    baseDemand = isWeekend ? 40 : 25;
                    peakHour = isWeekend ? 17 : 18;
                } else if (zone.getName().equals("Highway Corridor")) {
                    // Highway: high on weekends/holidays, afternoon peaks
                    baseDemand = isWeekend ? 50 : 30;
                    peakHour = 15;
                    growthFactor = day * 0.25; // Highway EV adoption is fast
                } else if (zone.getName().equals("Downtown Business District")) {
                    // Downtown: fairly high all week, mid-day peak
                    baseDemand = isWeekend ? 35 : 50;
                    peakHour = 13;
                } else if (zone.getName().equals("Suburban Zone")) {
                    // Suburban: low demand
                    baseDemand = 3;
                    peakHour = 18;
                    growthFactor = day * 0.02;
                }

                // Add gradual growth and random variance (-15% to +15%)
                double varianceFactor = 0.85 + (rand.nextDouble() * 0.30);
                int sessionsCount = (int) Math.round((baseDemand + growthFactor) * varianceFactor);
                sessionsCount = Math.max(0, sessionsCount);

                // Compute wait time based on session counts compared to capacity
                double capacity = zone.getStations().stream()
                        .filter(Station::isOperational)
                        .mapToDouble(Station::getDailySessionCapacity)
                        .sum();

                double avgWaitTime = 5.0;
                if (capacity > 0) {
                    double congestion = (double) sessionsCount / capacity;
                    if (congestion > 1.2) {
                        avgWaitTime = 25.0 + (rand.nextDouble() * 20.0); // very congested
                    } else if (congestion > 0.8) {
                        avgWaitTime = 12.0 + (rand.nextDouble() * 10.0); // moderately busy
                    } else {
                        avgWaitTime = 3.0 + (rand.nextDouble() * 5.0);   // light
                    }
                }

                DemandRecord record = new DemandRecord(
                        null,
                        date,
                        zone,
                        sessionsCount,
                        peakHour,
                        avgWaitTime
                );
                records.add(record);
            }
        }

        demandRecordRepository.saveAll(records);
        System.out.println("====== SEEDING COMPLETED SUCCESSFULLY. SEEDED 540 RECORDS ======");
    }
}

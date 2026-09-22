package com.evpredictor.service;

import com.evpredictor.dto.SimulationResult;
import com.evpredictor.dto.ZoneGapAnalysis;
import com.evpredictor.exception.InvalidZoneException;
import com.evpredictor.model.*;
import com.evpredictor.repository.StationRepository;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SimulationService {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    // Standard session capacity defaults for simulated stations
    private static final int FAST_CAPACITY = 40;
    private static final int SLOW_CAPACITY = 20;
    private static final int SOLAR_CAPACITY = 30;

    private static final double FAST_RATE = 150.0; // kW
    private static final double SLOW_RATE = 22.0;  // kW
    private static final double SOLAR_RATE = 50.0; // kW

    private static final int FAST_PORTS = 4;
    private static final int SLOW_PORTS = 2;
    private static final int SOLAR_PORTS = 3;

    public SimulationResult runSimulation(Long zoneId, String stationType, int count) {
        return calculateSimulation(zoneId, stationType, count, false);
    }

    @Transactional
    public SimulationResult commitSimulation(Long zoneId, String stationType, int count) {
        return calculateSimulation(zoneId, stationType, count, true);
    }

    private SimulationResult calculateSimulation(Long zoneId, String stationType, int count, boolean persist) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new InvalidZoneException("Zone not found with ID: " + zoneId));

        // Get current analysis
        ZoneGapAnalysis before = gapAnalysisService.analyzeZone(zone, 7, 7);

        // Determine capacity increase
        int capacityIncrement = 0;
        double baseRate = 0;
        int numPorts = 0;

        switch (stationType.toUpperCase()) {
            case "FAST":
                capacityIncrement = FAST_CAPACITY * count;
                baseRate = FAST_RATE;
                numPorts = FAST_PORTS;
                break;
            case "SLOW":
                capacityIncrement = SLOW_CAPACITY * count;
                baseRate = SLOW_RATE;
                numPorts = SLOW_PORTS;
                break;
            case "SOLAR":
                capacityIncrement = SOLAR_CAPACITY * count;
                baseRate = SOLAR_RATE;
                numPorts = SOLAR_PORTS;
                break;
            default:
                throw new IllegalArgumentException("Unknown station type: " + stationType);
        }

        double afterCapacity = before.getTotalCapacity() + capacityIncrement;
        double afterGap = before.getAvgForecastDemand() - afterCapacity;
        String afterStatus = afterGap > 0 ? "UNDER-SERVED" : "ADEQUATE";

        if (persist) {
            for (int i = 0; i < count; i++) {
                Station newStation;
                if (stationType.equalsIgnoreCase("FAST")) {
                    newStation = new FastChargingStation(null, zone, baseRate, numPorts, true, FAST_CAPACITY);
                } else if (stationType.equalsIgnoreCase("SLOW")) {
                    newStation = new SlowChargingStation(null, zone, baseRate, numPorts, true, SLOW_CAPACITY);
                } else {
                    newStation = new SolarChargingStation(null, zone, baseRate, numPorts, true, SOLAR_CAPACITY);
                }
                stationRepository.save(newStation);
            }
            // Trigger cache eviction or reload by fetching the zone again
            zone = zoneRepository.findById(zoneId).get();
        }

        return new SimulationResult(
                zoneId,
                zone.getName(),
                stationType,
                count,
                before.getAvgForecastDemand(),
                before.getTotalCapacity(),
                before.getDemandGap(),
                before.getStatus(),
                afterCapacity,
                afterGap,
                afterStatus
        );
    }
}

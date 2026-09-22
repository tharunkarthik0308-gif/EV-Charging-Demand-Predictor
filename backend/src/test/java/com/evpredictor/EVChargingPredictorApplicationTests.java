package com.evpredictor;

import com.evpredictor.exception.InsufficientDataException;
import com.evpredictor.forecast.MovingAverageModel;
import com.evpredictor.forecast.WeightedMovingAverageModel;
import com.evpredictor.forecast.LinearRegressionModel;
import com.evpredictor.model.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EVChargingPredictorApplicationTests {

    @Test
    void testSimpleMovingAverage() {
        // SMA: 10, 20, 30, 40, 50
        double[] historical = { 10.0, 20.0, 30.0, 40.0, 50.0 };
        MovingAverageModel model = new MovingAverageModel(5);
        
        double[] forecast = model.forecast(historical, 1);
        
        assertNotNull(forecast);
        assertEquals(1, forecast.length);
        // Expected average = (10 + 20 + 30 + 40 + 50) / 5 = 150 / 5 = 30.0
        assertEquals(30.0, forecast[0], 0.001);
    }

    @Test
    void testWeightedMovingAverage() {
        // WMA: 10, 20, 30
        double[] historical = { 10.0, 20.0, 30.0 };
        WeightedMovingAverageModel model = new WeightedMovingAverageModel(3);
        
        double[] forecast = model.forecast(historical, 1);
        
        assertNotNull(forecast);
        assertEquals(1, forecast.length);
        // Expected WMA = (10*1 + 20*2 + 30*3) / (1 + 2 + 3) = 140 / 6 = 23.333333333333332
        assertEquals(23.33, forecast[0], 0.01);
    }

    @Test
    void testLinearRegression() {
        // Linear Regression: x = 1,2,3,4,5, y = 10,20,30,40,50
        // We verify that Day 6 predicts 60.0
        double[] historical = { 10.0, 20.0, 30.0, 40.0, 50.0 };
        LinearRegressionModel model = new LinearRegressionModel(5);
        
        // We project day 6 (horizon = 1)
        double[] forecast = model.forecast(historical, 1);
        
        assertNotNull(forecast);
        assertEquals(1, forecast.length);
        // Slope = 10, Intercept = 0. y(6) = 10 * 6 + 0 = 60
        assertEquals(60.0, forecast[0], 0.001);
    }

    @Test
    void testInsufficientDataException() {
        double[] historical = { 10.0, 20.0 }; // only 2 points
        MovingAverageModel model = new MovingAverageModel(5); // window of 5
        
        assertThrows(InsufficientDataException.class, () -> {
            model.forecast(historical, 1);
        });
    }

    @Test
    void testVehicleRequiredEnergy() {
        // Required energy = Battery Capacity * (Target SoC - Current SoC)
        Vehicle vehicle = new Vehicle(1L, "SUV", 75.0, 0.20, 0.80);
        double energy = vehicle.getRequiredEnergy();
        // 75.0 * (0.80 - 0.20) = 75.0 * 0.60 = 45.0
        assertEquals(45.0, energy, 0.001);
    }

    @Test
    void testStationPolymorphism() {
        Zone mockZone = new Zone(1L, "Test Zone", 1000, 5000, null, null);
        Vehicle lowSocVehicle = new Vehicle(1L, "Sedan", 60.0, 0.10, 0.80); // Required Energy = 60 * 0.7 = 42 kWh
        Vehicle highSocVehicle = new Vehicle(2L, "Sedan", 60.0, 0.85, 1.00); // Required Energy = 60 * 0.15 = 9 kWh

        // Fast Charger: base rate = 100kW.
        // For low SoC (< 0.80), efficiency is 90% (effective rate = 90kW).
        // For high SoC (>= 0.80), efficiency is 40% (effective rate = 40kW).
        Station fastStation = new FastChargingStation(1L, mockZone, 100.0, 4, true, 24);
        
        double fastTimeLowSoc = fastStation.calculateChargingTime(lowSocVehicle);
        // Required = 42kWh, Effective Rate = 90kW. Time = 42 / 90 = 0.4667 hours
        assertEquals(42.0 / 90.0, fastTimeLowSoc, 0.001);

        double fastTimeHighSoc = fastStation.calculateChargingTime(highSocVehicle);
        // Required = 9kWh, Effective Rate = 40kW. Time = 9 / 40 = 0.225 hours
        assertEquals(9.0 / 40.0, fastTimeHighSoc, 0.001);

        // Slow Charger: base rate = 10kW. Constant 85% efficiency.
        Station slowStation = new SlowChargingStation(2L, mockZone, 10.0, 2, true, 8);
        double slowTime = slowStation.calculateChargingTime(lowSocVehicle);
        // Required = 42kWh, Effective Rate = 8.5kW. Time = 42 / 8.5 = 4.941 hours
        assertEquals(42.0 / 8.5, slowTime, 0.001);

        // Solar Charger: base rate = 20kW. Peak = 95% efficiency, Off-peak = 45% efficiency.
        Station solarStation = new SolarChargingStation(3L, mockZone, 20.0, 3, true, 12);
        double solarTime = solarStation.calculateChargingTime(lowSocVehicle);
        int currentHour = java.time.LocalTime.now().getHour();
        boolean isPeakSolar = (currentHour >= 10 && currentHour <= 16);
        double expectedRate = 20.0 * (isPeakSolar ? 0.95 : 0.45);
        assertEquals(42.0 / expectedRate, solarTime, 0.001);
    }

    @Test
    void testGapAnalysis() {
        Zone zone = new Zone();
        zone.setId(1L);
        zone.setName("Tech Park");
        zone.setPopulationDensity(4500.0);
        zone.setAvgDailyTraffic(8500);

        Station s1 = new FastChargingStation(1L, zone, 150.0, 4, true, 40);
        zone.getStations().add(s1);

        double totalCapacity = zone.getStations().stream()
                .filter(Station::isOperational)
                .mapToDouble(Station::getDailySessionCapacity)
                .sum();
        double avgForecastDemand = 60.0;
        double gap = avgForecastDemand - totalCapacity;
        String status = gap > 0 ? "UNDER-SERVED" : "ADEQUATE";

        assertEquals(40.0, totalCapacity);
        assertEquals(20.0, gap);
        assertEquals("UNDER-SERVED", status);
    }

    @Test
    void testPriorityQueueAndPositiveGapFiltering() {
        com.evpredictor.dto.ZoneGapAnalysis zone1 = new com.evpredictor.dto.ZoneGapAnalysis(1L, "Tech Park", 4500.0, 8500, 1, 40.0, 60.0, 20.0, "UNDER-SERVED");
        com.evpredictor.dto.ZoneGapAnalysis zone2 = new com.evpredictor.dto.ZoneGapAnalysis(2L, "Residential A", 2800.0, 2200, 2, 50.0, 25.0, -25.0, "ADEQUATE");

        java.util.List<com.evpredictor.dto.ZoneGapAnalysis> list = new java.util.ArrayList<>();
        list.add(zone1);
        list.add(zone2);

        java.util.PriorityQueue<com.evpredictor.dto.ZoneGapAnalysis> pq = new java.util.PriorityQueue<>(
            (a, b) -> Double.compare(b.getDemandGap(), a.getDemandGap())
        );

        for (com.evpredictor.dto.ZoneGapAnalysis gap : list) {
            if (gap.getDemandGap() > 0) {
                pq.add(gap);
            }
        }

        assertEquals(1, pq.size());
        assertEquals("Tech Park", pq.peek().getZoneName());
        assertEquals(20.0, pq.peek().getDemandGap());
    }

    @Test
    void testRecommendationCalculation() {
        double gap = 50.0;
        int capacityPerStation = 40;
        int stationsNeeded = (int) Math.ceil(gap / capacityPerStation);
        assertEquals(2, stationsNeeded);
    }

    @Test
    void testWhatIfSimulation() {
        double beforeCapacity = 60.0;
        double avgForecastDemand = 75.0;
        double beforeGap = avgForecastDemand - beforeCapacity;

        int simulatedCapacityAdded = 40;
        double afterCapacity = beforeCapacity + simulatedCapacityAdded;
        double afterGap = avgForecastDemand - afterCapacity;
        String afterStatus = afterGap > 0 ? "UNDER-SERVED" : "ADEQUATE";

        assertEquals(15.0, beforeGap);
        assertEquals(100.0, afterCapacity);
        assertEquals(-25.0, afterGap);
        assertEquals("ADEQUATE", afterStatus);
    }
}

package com.evpredictor.service;

import com.evpredictor.dto.ZoneGapAnalysis;
import com.evpredictor.forecast.ForecastResult;
import com.evpredictor.model.Station;
import com.evpredictor.model.Zone;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class GapAnalysisService {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private ForecastService forecastService;

    // Use default values for window size and forecast horizon
    private static final int DEFAULT_WINDOW = 7;
    private static final int DEFAULT_HORIZON = 7;

    public ZoneGapAnalysis analyzeZone(Zone zone, int windowSize, int horizon) {
        // Calculate daily session capacity of all operational stations in the zone
        double totalCapacity = zone.getStations().stream()
                .filter(Station::isOperational)
                .mapToDouble(Station::getDailySessionCapacity)
                .sum();

        // Run forecast
        ForecastResult forecastResult = forecastService.runForecast(zone.getId(), windowSize, horizon);
        double[] finalForecast = forecastResult.getFinalForecast();

        // Average Forecasted Demand
        double sumForecast = 0.0;
        for (double val : finalForecast) {
            sumForecast += val;
        }
        double avgForecastDemand = sumForecast / horizon;

        // Gap = Demand - Capacity
        double gap = avgForecastDemand - totalCapacity;
        String status = gap > 0 ? "UNDER-SERVED" : "ADEQUATE";

        return new ZoneGapAnalysis(
                zone.getId(),
                zone.getName(),
                zone.getPopulationDensity(),
                zone.getAvgDailyTraffic(),
                zone.getStations().size(),
                totalCapacity,
                avgForecastDemand,
                gap,
                status
        );
    }

    public List<ZoneGapAnalysis> analyzeAllZones() {
        return analyzeAllZones(DEFAULT_WINDOW, DEFAULT_HORIZON);
    }

    public List<ZoneGapAnalysis> analyzeAllZones(int windowSize, int horizon) {
        List<Zone> zones = zoneRepository.findAll();
        List<ZoneGapAnalysis> analyses = new ArrayList<>();
        for (Zone zone : zones) {
            try {
                analyses.add(analyzeZone(zone, windowSize, horizon));
            } catch (Exception e) {
                // If there's insufficient data for some zone, skip or log it, but for seeding we will make sure it's valid.
                // We'll let it bubble up, or handle it cleanly. Bubble up is fine for endpoints.
                throw e;
            }
        }
        return analyses;
    }
}

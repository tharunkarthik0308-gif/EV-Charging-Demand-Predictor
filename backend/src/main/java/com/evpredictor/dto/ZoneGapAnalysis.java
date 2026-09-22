package com.evpredictor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ZoneGapAnalysis {
    private Long zoneId;
    private String zoneName;
    private double populationDensity;
    private int avgDailyTraffic;
    private int existingStationsCount;
    private double totalCapacity;
    private double avgForecastDemand;
    private double demandGap;
    private String status; // "UNDER-SERVED" or "ADEQUATE"
}

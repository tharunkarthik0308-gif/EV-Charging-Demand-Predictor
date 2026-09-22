package com.evpredictor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RankedZone {
    private int rank;
    private Long zoneId;
    private String zoneName;
    private double avgForecastDemand;
    private double capacity;
    private double demandGap;
    private double priorityScore;
    private String priorityLevel; // "HIGH", "MEDIUM", "LOW"
    private String recommendation;
}

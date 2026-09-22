package com.evpredictor.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResult {
    private Long zoneId;
    private String zoneName;
    private String stationTypeAdded;
    private int countAdded;
    private double avgForecastDemand;
    private double beforeCapacity;
    private double beforeGap;
    private String beforeStatus;
    private double afterCapacity;
    private double afterGap;
    private String afterStatus;
}

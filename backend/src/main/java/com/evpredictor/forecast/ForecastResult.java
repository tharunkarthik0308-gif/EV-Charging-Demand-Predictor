package com.evpredictor.forecast;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResult {
    private Long zoneId;
    private String zoneName;
    private int windowSize;
    private int horizon;
    private double[] historicalDemand;
    private String[] historicalDates;
    private double[] smaForecast;
    private double[] wmaForecast;
    private double[] lrForecast;
    private double[] finalForecast;
    private String[] forecastDates;
}

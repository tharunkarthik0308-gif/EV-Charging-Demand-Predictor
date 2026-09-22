package com.evpredictor.forecast;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class PredictionModel implements Forecastable {

    private String modelName;
    private String modelDescription;
    private int windowSize;

    public PredictionModel(String modelName, String modelDescription, int windowSize) {
        this.modelName = modelName;
        this.modelDescription = modelDescription;
        this.windowSize = windowSize;
    }
}

package com.evpredictor.forecast;

public interface Forecastable {
    /**
     * Predicts future values based on historical data.
     * 
     * @param historicalData the array of historical demand values
     * @param horizon the number of days to predict into the future
     * @return an array of size horizon containing predicted demand values
     */
    double[] forecast(double[] historicalData, int horizon);
}

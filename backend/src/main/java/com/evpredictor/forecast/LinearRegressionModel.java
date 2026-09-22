package com.evpredictor.forecast;

import com.evpredictor.exception.InsufficientDataException;

public class LinearRegressionModel extends PredictionModel {

    public LinearRegressionModel(int windowSize) {
        super("Linear Regression", "Fits a least-squares linear trend on the latest N data points and projects it forward", windowSize);
    }

    @Override
    public double[] forecast(double[] historicalData, int horizon) {
        int N = getWindowSize();
        if (historicalData == null || historicalData.length < N) {
            throw new InsufficientDataException("Insufficient historical data. Required: " + N + " points, available: " + (historicalData == null ? 0 : historicalData.length));
        }

        // We use the latest window of size N
        int startIndex = historicalData.length - N;
        double sumX = 0.0;
        double sumY = 0.0;
        double sumXY = 0.0;
        double sumXX = 0.0;

        // x indices will be 1 to N
        for (int i = 0; i < N; i++) {
            double x = i + 1;
            double y = historicalData[startIndex + i];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        // Compute slope (m) and intercept (c)
        double denominator = (N * sumXX) - (sumX * sumX);
        double m;
        double c;
        if (denominator == 0) {
            // Avoid division by zero in case of constant x (should not happen with x = 1..N)
            m = 0.0;
            c = sumY / N;
        } else {
            m = ((N * sumXY) - (sumX * sumY)) / denominator;
            c = (sumY - (m * sumX)) / N;
        }

        // Generate forecast for future horizon days (x = N + 1, N + 2, ..., N + horizon)
        double[] predictions = new double[horizon];
        for (int h = 0; h < horizon; h++) {
            double xVal = N + (h + 1);
            predictions[h] = (m * xVal) + c;
            // Prevent negative predictions for physical demand quantity
            if (predictions[h] < 0) {
                predictions[h] = 0.0;
            }
        }

        return predictions;
    }
}

package com.evpredictor.forecast;

import com.evpredictor.exception.InsufficientDataException;
import java.util.Arrays;

public class WeightedMovingAverageModel extends PredictionModel {

    public WeightedMovingAverageModel(int windowSize) {
        super("Weighted Moving Average", "Applies linear weights to the latest N data points, giving more importance to recent values", windowSize);
    }

    @Override
    public double[] forecast(double[] historicalData, int horizon) {
        int N = getWindowSize();
        if (historicalData == null || historicalData.length < N) {
            throw new InsufficientDataException("Insufficient historical data. Required: " + N + " points, available: " + (historicalData == null ? 0 : historicalData.length));
        }

        // Calculate sum of weights: 1 + 2 + ... + N
        double weightSum = 0;
        for (int i = 1; i <= N; i++) {
            weightSum += i;
        }

        double[] predictions = new double[horizon];
        // Create rolling window starting with the last N elements of historicalData
        double[] rollingWindow = Arrays.copyOfRange(historicalData, historicalData.length - N, historicalData.length);

        for (int h = 0; h < horizon; h++) {
            double weightedSum = 0.0;
            // Weights are 1 to N, where rollingWindow[0] gets weight 1 and rollingWindow[N-1] gets weight N
            for (int i = 0; i < N; i++) {
                weightedSum += rollingWindow[i] * (i + 1);
            }
            double wmaValue = weightedSum / weightSum;
            predictions[h] = wmaValue;

            // Shift the rolling window: discard the first element and append the new prediction
            System.arraycopy(rollingWindow, 1, rollingWindow, 0, N - 1);
            rollingWindow[N - 1] = wmaValue;
        }

        return predictions;
    }
}

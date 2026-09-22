package com.evpredictor.forecast;

import com.evpredictor.exception.InsufficientDataException;
import java.util.Arrays;

public class MovingAverageModel extends PredictionModel {

    public MovingAverageModel(int windowSize) {
        super("Simple Moving Average", "Averages the latest N data points to predict the next point recursively", windowSize);
    }

    @Override
    public double[] forecast(double[] historicalData, int horizon) {
        int N = getWindowSize();
        if (historicalData == null || historicalData.length < N) {
            throw new InsufficientDataException("Insufficient historical data. Required: " + N + " points, available: " + (historicalData == null ? 0 : historicalData.length));
        }

        double[] predictions = new double[horizon];
        // We create a rolling window starting with the last N elements of historicalData
        double[] rollingWindow = Arrays.copyOfRange(historicalData, historicalData.length - N, historicalData.length);

        for (int i = 0; i < horizon; i++) {
            double sum = 0.0;
            for (double val : rollingWindow) {
                sum += val;
            }
            double average = sum / N;
            predictions[i] = average;

            // Shift the rolling window: discard the first element and append the new prediction
            System.arraycopy(rollingWindow, 1, rollingWindow, 0, N - 1);
            rollingWindow[N - 1] = average;
        }

        return predictions;
    }
}

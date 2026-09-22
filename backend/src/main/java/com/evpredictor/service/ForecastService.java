package com.evpredictor.service;

import com.evpredictor.exception.InvalidZoneException;
import com.evpredictor.exception.InsufficientDataException;
import com.evpredictor.forecast.ForecastResult;
import com.evpredictor.forecast.MovingAverageModel;
import com.evpredictor.forecast.WeightedMovingAverageModel;
import com.evpredictor.forecast.LinearRegressionModel;
import com.evpredictor.model.DemandRecord;
import com.evpredictor.model.Zone;
import com.evpredictor.repository.DemandRecordRepository;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ForecastService {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private DemandRecordRepository demandRecordRepository;

    public ForecastResult runForecast(Long zoneId, int windowSize, int horizon) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new InvalidZoneException("Zone not found with ID: " + zoneId));

        List<DemandRecord> records = demandRecordRepository.findByZoneIdOrderByDateAsc(zoneId);
        if (records == null || records.size() < windowSize) {
            throw new InsufficientDataException("Insufficient historical data for zone: " + zone.getName() 
                + ". Required: at least " + windowSize + " days, but had " + (records == null ? 0 : records.size()) + " days.");
        }

        // Extract historical values
        int count = records.size();
        double[] historicalDemand = new double[count];
        String[] historicalDates = new String[count];
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 0; i < count; i++) {
            historicalDemand[i] = records.get(i).getSessionsCount();
            historicalDates[i] = records.get(i).getDate().format(formatter);
        }

        // Initialize forecasting models
        MovingAverageModel smaModel = new MovingAverageModel(windowSize);
        WeightedMovingAverageModel wmaModel = new WeightedMovingAverageModel(windowSize);
        LinearRegressionModel lrModel = new LinearRegressionModel(windowSize);

        // Compute individual forecasts
        double[] smaForecast = smaModel.forecast(historicalDemand, horizon);
        double[] wmaForecast = wmaModel.forecast(historicalDemand, horizon);
        double[] lrForecast = lrModel.forecast(historicalDemand, horizon);

        // Compute final forecast as average of SMA, WMA, and Linear Regression
        double[] finalForecast = new double[horizon];
        for (int i = 0; i < horizon; i++) {
            finalForecast[i] = (smaForecast[i] + wmaForecast[i] + lrForecast[i]) / 3.0;
        }

        // Generate future dates
        String[] forecastDates = new String[horizon];
        LocalDate lastDate = records.get(count - 1).getDate();
        for (int i = 0; i < horizon; i++) {
            forecastDates[i] = lastDate.plusDays(i + 1).format(formatter);
        }

        return new ForecastResult(
                zoneId,
                zone.getName(),
                windowSize,
                horizon,
                historicalDemand,
                historicalDates,
                smaForecast,
                wmaForecast,
                lrForecast,
                finalForecast,
                forecastDates
        );
    }
}

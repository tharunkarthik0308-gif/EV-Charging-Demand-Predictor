package com.evpredictor.controller;

import com.evpredictor.forecast.ForecastResult;
import com.evpredictor.service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*")
public class ForecastController {

    @Autowired
    private ForecastService forecastService;

    @PostMapping
    public ForecastResult getForecast(@RequestBody ForecastRequest request) {
        int window = request.getWindowSize() > 0 ? request.getWindowSize() : 7;
        int horizon = request.getHorizon() > 0 ? request.getHorizon() : 7;
        return forecastService.runForecast(request.getZoneId(), window, horizon);
    }

    // Static request DTO for forecast inputs
    public static class ForecastRequest {
        private Long zoneId;
        private int windowSize;
        private int horizon;

        public Long getZoneId() {
            return zoneId;
        }

        public void setZoneId(Long zoneId) {
            this.zoneId = zoneId;
        }

        public int getWindowSize() {
            return windowSize;
        }

        public void setWindowSize(int windowSize) {
            this.windowSize = windowSize;
        }

        public int getHorizon() {
            return horizon;
        }

        public void setHorizon(int horizon) {
            this.horizon = horizon;
        }
    }
}

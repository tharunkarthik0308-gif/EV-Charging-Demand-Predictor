package com.evpredictor.controller;

import com.evpredictor.dto.SimulationResult;
import com.evpredictor.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation")
@CrossOrigin(origins = "*")
public class SimulationController {

    @Autowired
    private SimulationService simulationService;

    @PostMapping
    public SimulationResult runSimulation(@RequestBody SimulationRequest request) {
        if (request.isCommit()) {
            return simulationService.commitSimulation(request.getZoneId(), request.getStationType(), request.getCount());
        } else {
            return simulationService.runSimulation(request.getZoneId(), request.getStationType(), request.getCount());
        }
    }

    public static class SimulationRequest {
        private Long zoneId;
        private String stationType;
        private int count;
        private boolean commit; // If true, permanently saves the stations to database

        public Long getZoneId() {
            return zoneId;
        }

        public void setZoneId(Long zoneId) {
            this.zoneId = zoneId;
        }

        public String getStationType() {
            return stationType;
        }

        public void setStationType(String stationType) {
            this.stationType = stationType;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public boolean isCommit() {
            return commit;
        }

        public void setCommit(boolean commit) {
            this.commit = commit;
        }
    }
}

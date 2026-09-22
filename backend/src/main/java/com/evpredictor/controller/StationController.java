package com.evpredictor.controller;

import com.evpredictor.model.Station;
import com.evpredictor.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    @Autowired
    private StationRepository stationRepository;

    @GetMapping
    public List<Station> getAllStations() {
        return stationRepository.findAll();
    }

    @GetMapping("/zone/{zoneId}")
    public List<Station> getStationsByZone(@PathVariable Long zoneId) {
        return stationRepository.findByZoneId(zoneId);
    }
}

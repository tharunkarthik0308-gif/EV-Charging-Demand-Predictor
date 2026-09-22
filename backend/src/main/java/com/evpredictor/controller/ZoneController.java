package com.evpredictor.controller;

import com.evpredictor.exception.InvalidZoneException;
import com.evpredictor.model.Zone;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@CrossOrigin(origins = "*")
public class ZoneController {

    @Autowired
    private ZoneRepository zoneRepository;

    @GetMapping
    public List<Zone> getAllZones() {
        return zoneRepository.findAll();
    }

    @GetMapping("/{id}")
    public Zone getZoneById(@PathVariable Long id) {
        return zoneRepository.findById(id)
                .orElseThrow(() -> new InvalidZoneException("Zone not found with ID: " + id));
    }
}

package com.evpredictor.controller;

import com.evpredictor.model.DemandRecord;
import com.evpredictor.repository.DemandRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demand")
@CrossOrigin(origins = "*")
public class DemandController {

    @Autowired
    private DemandRecordRepository demandRecordRepository;

    @GetMapping("/{zoneId}")
    public List<DemandRecord> getDemandByZone(@PathVariable Long zoneId) {
        return demandRecordRepository.findByZoneIdOrderByDateAsc(zoneId);
    }
}

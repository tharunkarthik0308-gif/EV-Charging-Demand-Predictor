package com.evpredictor.controller;

import com.evpredictor.dto.RankedZone;
import com.evpredictor.dto.ZoneGapAnalysis;
import com.evpredictor.service.GapAnalysisService;
import com.evpredictor.service.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private RankingService rankingService;

    @GetMapping("/gaps")
    public List<ZoneGapAnalysis> getGapAnalysis(
            @RequestParam(defaultValue = "7") int window,
            @RequestParam(defaultValue = "7") int horizon) {
        return gapAnalysisService.analyzeAllZones(window, horizon);
    }

    @GetMapping("/priority")
    public List<RankedZone> getPriorityRanking(
            @RequestParam(defaultValue = "7") int window,
            @RequestParam(defaultValue = "7") int horizon) {
        return rankingService.getPriorityRanking(window, horizon);
    }
}

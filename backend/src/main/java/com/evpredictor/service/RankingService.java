package com.evpredictor.service;

import com.evpredictor.dto.RankedZone;
import com.evpredictor.dto.ZoneGapAnalysis;
import com.evpredictor.model.Zone;
import com.evpredictor.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RankingService {

    @Autowired
    private ZoneRepository zoneRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private RecommendationService recommendationService;

    private static final int DEFAULT_WINDOW = 7;
    private static final int DEFAULT_HORIZON = 7;

    public List<RankedZone> getPriorityRanking() {
        return getPriorityRanking(DEFAULT_WINDOW, DEFAULT_HORIZON);
    }

    public List<RankedZone> getPriorityRanking(int windowSize, int horizon) {
        List<Zone> allZones = zoneRepository.findAll();
        Map<Long, ZoneGapAnalysis> analysisMap = new HashMap<>();

        // Create a PriorityQueue of Zone using a custom comparator.
        // Gaps are pre-calculated to avoid duplicate heavy forecasting runs.
        PriorityQueue<Zone> pq = new PriorityQueue<>((z1, z2) -> {
            double gap1 = analysisMap.get(z1.getId()).getDemandGap();
            double gap2 = analysisMap.get(z2.getId()).getDemandGap();
            return Double.compare(gap2, gap1); // Sort Descending: Highest deficit to lowest
        });

        // Filter and add only zones with a positive demand gap > 0 to the priority queue
        for (Zone z : allZones) {
            ZoneGapAnalysis analysis = gapAnalysisService.analyzeZone(z, windowSize, horizon);
            if (analysis.getDemandGap() > 0) {
                analysisMap.put(z.getId(), analysis);
                pq.add(z);
            }
        }

        List<RankedZone> rankedList = new ArrayList<>();
        int rank = 1;

        while (!pq.isEmpty()) {
            Zone zone = pq.poll();
            ZoneGapAnalysis analysis = analysisMap.get(zone.getId());

            double gap = analysis.getDemandGap();
            double density = zone.getPopulationDensity();
            double traffic = zone.getAvgDailyTraffic();
            int existingStations = zone.getStations().size();

            // Dynamic Priority Score Calculation
            // Deficit has the highest weight, with density and traffic as secondary factors.
            // Existing station count acts as a negative modifier.
            double priorityScore = (gap * 1.5) + (density * 0.04) + (traffic * 0.002) - (existingStations * 1.0);
            priorityScore = Math.max(0.0, priorityScore); // Avoid negative scores

            String priorityLevel;
            if (priorityScore >= 60.0) {
                priorityLevel = "HIGH";
            } else if (priorityScore >= 20.0) {
                priorityLevel = "MEDIUM";
            } else {
                priorityLevel = "LOW";
            }

            String recommendation = recommendationService.generateRecommendation(zone, analysis);

            rankedList.add(new RankedZone(
                    rank++,
                    zone.getId(),
                    zone.getName(),
                    analysis.getAvgForecastDemand(),
                    analysis.getTotalCapacity(),
                    gap,
                    priorityScore,
                    priorityLevel,
                    recommendation
            ));
        }

        return rankedList;
    }
}

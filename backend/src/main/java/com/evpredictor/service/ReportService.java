package com.evpredictor.service;

import com.evpredictor.dto.RankedZone;
import com.evpredictor.dto.ZoneGapAnalysis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private RankingService rankingService;

    public String generateCsvReport() {
        StringBuilder csv = new StringBuilder();
        // CSV Header
        csv.append("Rank,Zone,Average Forecast Demand (sessions/day),Capacity (sessions/day),Demand Gap,Status,Priority Level,Recommendation\n");

        List<RankedZone> ranked = rankingService.getPriorityRanking();
        List<ZoneGapAnalysis> allGaps = gapAnalysisService.analyzeAllZones();

        // Track who is already ranked (under-served)
        int currentRank = 1;
        for (ZoneGapAnalysis gap : allGaps) {
            // Find if this zone is in the ranked list
            RankedZone matchingRanked = ranked.stream()
                    .filter(rz -> rz.getZoneId().equals(gap.getZoneId()))
                    .findFirst()
                    .orElse(null);

            if (matchingRanked != null) {
                csv.append(String.format("%d,%s,%.2f,%.2f,%.2f,%s,%s,\"%s\"\n",
                        matchingRanked.getRank(),
                        gap.getZoneName(),
                        gap.getAvgForecastDemand(),
                        gap.getTotalCapacity(),
                        gap.getDemandGap(),
                        gap.getStatus(),
                        matchingRanked.getPriorityLevel(),
                        matchingRanked.getRecommendation()
                ));
            } else {
                csv.append(String.format("-,%s,%.2f,%.2f,%.2f,%s,NONE,\"No action required.\"\n",
                        gap.getZoneName(),
                        gap.getAvgForecastDemand(),
                        gap.getTotalCapacity(),
                        gap.getDemandGap(),
                        gap.getStatus()
                ));
            }
        }
        return csv.toString();
    }

    public String generateTxtReport() {
        StringBuilder txt = new StringBuilder();
        txt.append("=========================================================================================================\n");
        txt.append("                                   EV CHARGING INFRASTRUCTURE REPORT                                    \n");
        txt.append("=========================================================================================================\n");
        txt.append(String.format("Generated on: %s\n", java.time.LocalDateTime.now().toString()));
        txt.append("Project: B.E. CSE OOPJ Group Project - EV Charging Demand Predictor\n");
        txt.append("---------------------------------------------------------------------------------------------------------\n\n");

        txt.append("1. HIGH PRIORITY UNDER-SERVED ZONES RANKING\n");
        txt.append("---------------------------------------------------------------------------------------------------------\n");
        txt.append(String.format("%-5s %-20s %-18s %-12s %-12s %-10s %-12s\n", "Rank", "Zone", "Forecast Demand", "Capacity", "Gap", "Priority", "Status"));
        txt.append("---------------------------------------------------------------------------------------------------------\n");

        List<RankedZone> ranked = rankingService.getPriorityRanking();
        for (RankedZone r : ranked) {
            txt.append(String.format("%-5d %-20s %-18.2f %-12.2f %-12.2f %-10s %-12s\n",
                    r.getRank(),
                    r.getZoneName(),
                    r.getAvgForecastDemand(),
                    r.getCapacity(),
                    r.getDemandGap(),
                    r.getPriorityLevel(),
                    "UNDER-SERVED"
            ));
        }
        if (ranked.isEmpty()) {
            txt.append("No zones are currently under-served.\n");
        }
        txt.append("---------------------------------------------------------------------------------------------------------\n\n");

        txt.append("2. DETAILED INFRASTRUCTURE RECOMMENDATIONS\n");
        txt.append("---------------------------------------------------------------------------------------------------------\n");
        for (RankedZone r : ranked) {
            txt.append(String.format("Zone: %s\n", r.getZoneName()));
            txt.append(String.format("  - Priority Level: %s\n", r.getPriorityLevel()));
            txt.append(String.format("  - Deficit Gap:    %.2f sessions/day\n", r.getDemandGap()));
            txt.append(String.format("  - Action Needed:  %s\n\n", r.getRecommendation()));
        }
        if (ranked.isEmpty()) {
            txt.append("All zones have adequate charging capacities. No action recommended.\n");
        }
        txt.append("---------------------------------------------------------------------------------------------------------\n\n");

        txt.append("3. ALL CITIES ZONE METRICS METRIC OVERVIEW\n");
        txt.append("---------------------------------------------------------------------------------------------------------\n");
        txt.append(String.format("%-22s %-18s %-12s %-12s %-15s\n", "Zone Name", "Forecast Demand", "Capacity", "Gap", "Status"));
        txt.append("---------------------------------------------------------------------------------------------------------\n");
        List<ZoneGapAnalysis> allGaps = gapAnalysisService.analyzeAllZones();
        for (ZoneGapAnalysis gap : allGaps) {
            txt.append(String.format("%-22s %-18.2f %-12.2f %-12.2f %-15s\n",
                    gap.getZoneName(),
                    gap.getAvgForecastDemand(),
                    gap.getTotalCapacity(),
                    gap.getDemandGap(),
                    gap.getStatus()
            ));
        }
        txt.append("=========================================================================================================\n");

        return txt.toString();
    }
}

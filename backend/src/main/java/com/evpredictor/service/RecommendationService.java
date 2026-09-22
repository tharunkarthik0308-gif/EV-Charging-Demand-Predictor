package com.evpredictor.service;

import com.evpredictor.dto.ZoneGapAnalysis;
import com.evpredictor.model.Zone;
import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    public String generateRecommendation(Zone zone, ZoneGapAnalysis analysis) {
        double gap = analysis.getDemandGap();
        if (gap <= 0) {
            return "No infrastructure expansion required. Existing capacity is adequate.";
        }

        // Determine the recommended station type dynamically
        String recommendedType;
        int capacityPerStation;
        
        double density = zone.getPopulationDensity();
        int traffic = zone.getAvgDailyTraffic();

        if (density >= 4000 && traffic >= 5000) {
            recommendedType = "Fast Charging";
            capacityPerStation = 40; // High speed, high throughput (40 sessions/day)
        } else if (traffic >= 2000) {
            recommendedType = "Slow Charging";
            capacityPerStation = 20; // Regular charging (20 sessions/day)
        } else {
            recommendedType = "Solar Charging";
            capacityPerStation = 30; // Eco-friendly, solar-aligned charging (30 sessions/day)
        }

        // Calculate count of stations needed
        int stationsNeeded = (int) Math.ceil(gap / capacityPerStation);

        return String.format("Add %d %s Station%s (Total capacity increase: +%d sessions/day) to resolve the deficit of %.1f sessions/day.",
                stationsNeeded,
                recommendedType,
                stationsNeeded > 1 ? "s" : "",
                stationsNeeded * capacityPerStation,
                gap
        );
    }
}

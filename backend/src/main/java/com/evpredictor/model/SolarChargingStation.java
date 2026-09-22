package com.evpredictor.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("SOLAR")
@NoArgsConstructor
public class SolarChargingStation extends Station {

    public SolarChargingStation(Long id, Zone zone, double baseChargingRate, int numPorts, boolean operational, int dailySessionCapacity) {
        super(id, zone, baseChargingRate, numPorts, operational, dailySessionCapacity);
    }

    @Override
    public double calculateChargingTime(Vehicle vehicle) {
        double requiredEnergy = vehicle.getRequiredEnergy();
        if (requiredEnergy <= 0) {
            return 0.0;
        }

        // Simple solar availability logic:
        // Peak solar hours (10:00 - 16:00) yield 95% efficiency.
        // Off-peak hours yield 45% efficiency (battery buffer / low light).
        int currentHour = java.time.LocalTime.now().getHour();
        boolean isPeakSolar = (currentHour >= 10 && currentHour <= 16);
        
        double efficiency = isPeakSolar ? 0.95 : 0.45;
        double effectiveRate = getBaseChargingRate() * efficiency;
        return requiredEnergy / effectiveRate;
    }
}

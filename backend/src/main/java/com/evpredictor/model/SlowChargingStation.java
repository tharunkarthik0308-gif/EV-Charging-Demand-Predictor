package com.evpredictor.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("SLOW")
@NoArgsConstructor
public class SlowChargingStation extends Station {

    public SlowChargingStation(Long id, Zone zone, double baseChargingRate, int numPorts, boolean operational, int dailySessionCapacity) {
        super(id, zone, baseChargingRate, numPorts, operational, dailySessionCapacity);
    }

    @Override
    public double calculateChargingTime(Vehicle vehicle) {
        double requiredEnergy = vehicle.getRequiredEnergy();
        if (requiredEnergy <= 0) {
            return 0.0;
        }

        // Slow chargers run at a constant speed with a basic efficiency factor
        double effectiveRate = getBaseChargingRate() * 0.85; // 85% efficiency
        return requiredEnergy / effectiveRate;
    }
}

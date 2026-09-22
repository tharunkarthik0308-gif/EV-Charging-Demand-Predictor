package com.evpredictor.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("FAST")
@NoArgsConstructor
public class FastChargingStation extends Station {

    public FastChargingStation(Long id, Zone zone, double baseChargingRate, int numPorts, boolean operational, int dailySessionCapacity) {
        super(id, zone, baseChargingRate, numPorts, operational, dailySessionCapacity);
    }

    @Override
    public double calculateChargingTime(Vehicle vehicle) {
        double requiredEnergy = vehicle.getRequiredEnergy();
        if (requiredEnergy <= 0) {
            return 0.0;
        }

        // Fast chargers are very efficient but slow down if current SoC is high (>= 80%)
        double effectiveRate;
        if (vehicle.getCurrentSoC() < 0.8) {
            effectiveRate = getBaseChargingRate() * 0.90; // 90% efficiency
        } else {
            effectiveRate = getBaseChargingRate() * 0.40; // Slows down to 40% to protect the battery
        }

        return requiredEnergy / effectiveRate;
    }
}

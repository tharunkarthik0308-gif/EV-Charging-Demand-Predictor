package com.evpredictor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(name = "battery_capacity", nullable = false)
    private double batteryCapacity; // In kWh

    @Column(name = "current_soc", nullable = false)
    private double currentSoC; // Fraction 0.0 to 1.0

    @Column(name = "target_soc", nullable = false)
    private double targetSoC; // Fraction 0.0 to 1.0

    public double getRequiredEnergy() {
        return batteryCapacity * (targetSoC - currentSoC);
    }
}

package com.evpredictor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonSubTypes;

@Entity
@Table(name = "stations")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "station_type", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "stationType"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = FastChargingStation.class, name = "FAST"),
    @JsonSubTypes.Type(value = SlowChargingStation.class, name = "SLOW"),
    @JsonSubTypes.Type(value = SolarChargingStation.class, name = "SOLAR")
})
public abstract class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    @JsonBackReference("zone-stations")
    private Zone zone;

    @Column(name = "base_charging_rate", nullable = false)
    private double baseChargingRate; // In kW

    @Column(name = "num_ports", nullable = false)
    private int numPorts;

    @Column(nullable = false)
    private boolean operational;

    @Column(name = "daily_session_capacity", nullable = false)
    private int dailySessionCapacity; // Maximum charging sessions per day

    // Polymorphic method to calculate charging time in hours
    public abstract double calculateChargingTime(Vehicle vehicle);

    @com.fasterxml.jackson.annotation.JsonProperty("zoneId")
    public Long getZoneId() {
        return zone != null ? zone.getId() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("zoneName")
    public String getZoneName() {
        return zone != null ? zone.getName() : null;
    }
}

package com.evpredictor.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDate;

@Entity
@Table(name = "demand_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DemandRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    @JsonBackReference("zone-demand")
    private Zone zone;

    @Column(name = "sessions_count", nullable = false)
    private int sessionsCount;

    @Column(name = "peak_hour", nullable = false)
    private int peakHour; // 0 - 23

    @Column(name = "avg_wait_time_minutes", nullable = false)
    private double averageWaitTimeMinutes;
}

package com.evpredictor.repository;

import com.evpredictor.model.DemandRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandRecordRepository extends JpaRepository<DemandRecord, Long> {
    List<DemandRecord> findByZoneIdOrderByDateAsc(Long zoneId);
}

package com.campusguard.repository;

import com.campusguard.entity.Incident;
import com.campusguard.entity.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentOrderByCreatedAtAsc(Incident incident);
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}

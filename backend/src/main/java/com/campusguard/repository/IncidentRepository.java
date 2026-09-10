package com.campusguard.repository;

import com.campusguard.entity.Incident;
import com.campusguard.entity.User;
import com.campusguard.enums.IncidentStatus;
import com.campusguard.enums.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long>, JpaSpecificationExecutor<Incident> {

    Optional<Incident> findByIncidentNumber(String incidentNumber);

    Page<Incident> findByReportedBy(User reportedBy, Pageable pageable);

    Page<Incident> findByAssignedOfficer(User assignedOfficer, Pageable pageable);

    @Query("SELECT i FROM Incident i WHERE i.status IN (:statuses) ORDER " +
           "BY CASE WHEN i.severity = 'CRITICAL' THEN 1 WHEN i.severity = 'HIGH' THEN 2 WHEN i.severity = 'MEDIUM' THEN 3 ELSE 4 END ASC, " +
           "i.createdAt DESC")
    List<Incident> findActiveIncidentsSorted(@Param("statuses") List<IncidentStatus> statuses);

    List<Incident> findTop10ByStatusInOrderByCreatedAtDesc(List<IncidentStatus> statuses);

    long countByStatusIn(List<IncidentStatus> statuses);

    long countBySeverityAndStatusIn(Severity severity, List<IncidentStatus> statuses);

    long countByStatusAndResolvedAtAfter(IncidentStatus status, LocalDateTime dateTime);

    long countByAssignedOfficer(User assignedOfficer);

    @Query("SELECT i.type, COUNT(i) FROM Incident i GROUP BY i.type")
    List<Object[]> countGroupedByType();

    @Query("SELECT i.severity, COUNT(i) FROM Incident i GROUP BY i.severity")
    List<Object[]> countGroupedBySeverity();

    @Query("SELECT i.location.building, COUNT(i) FROM Incident i GROUP BY i.location.building")
    List<Object[]> countGroupedByBuilding();

    @Modifying
    @Query("UPDATE Incident i SET i.location = null WHERE i.location.id = :locationId")
    void nullifyLocationReference(@Param("locationId") Long locationId);
}

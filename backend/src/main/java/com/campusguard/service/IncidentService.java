package com.campusguard.service;

import com.campusguard.dto.*;
import com.campusguard.entity.User;
import com.campusguard.enums.IncidentStatus;
import com.campusguard.enums.IncidentType;
import com.campusguard.enums.Severity;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IncidentService {
    IncidentResponse createIncident(IncidentCreateRequest request, User reporter);
    IncidentResponse getIncidentById(Long id, User currentUser);
    IncidentResponse getIncidentByNumber(String incidentNumber, User currentUser);
    
    PageResponse<IncidentResponse> getIncidents(
            IncidentStatus status,
            Severity severity,
            IncidentType type,
            Long locationId,
            String search,
            User currentUser,
            Pageable pageable
    );

    List<IncidentResponse> getActiveIncidents();

    IncidentResponse updateStatus(Long id, IncidentStatusRequest request, User currentUser);
    IncidentResponse assignOfficer(Long id, IncidentAssignmentRequest request, User currentUser);
    
    List<IncidentHistoryResponse> getIncidentHistory(Long incidentId, User currentUser);

    DashboardStatsResponse getDashboardStats();

    void cancelIncident(Long id, User student);
}

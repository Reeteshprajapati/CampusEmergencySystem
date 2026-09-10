package com.campusguard.service.impl;

import com.campusguard.dto.*;
import com.campusguard.entity.*;
import com.campusguard.enums.*;
import com.campusguard.exception.BadRequestException;
import com.campusguard.exception.ResourceNotFoundException;
import com.campusguard.repository.*;
import com.campusguard.service.AuditLogService;
import com.campusguard.service.IncidentService;
import com.campusguard.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final IncidentHistoryRepository incidentHistoryRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public IncidentServiceImpl(IncidentRepository incidentRepository, LocationRepository locationRepository, UserRepository userRepository, IncidentHistoryRepository incidentHistoryRepository, NotificationService notificationService, AuditLogService auditLogService) {
        this.incidentRepository = incidentRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.incidentHistoryRepository = incidentHistoryRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public IncidentResponse createIncident(IncidentCreateRequest request, User reporter) {
        Location location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId())
                    .orElse(null);
        }

        if (location == null && request.getBuilding() != null && !request.getBuilding().isBlank()) {
            location = Location.builder()
                    .building(request.getBuilding())
                    .area(request.getArea() != null ? request.getArea() : "Main Campus")
                    .floor(request.getFloor())
                    .room(request.getRoom())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .build();
            location = locationRepository.save(location);
        }

        String incidentNumber = generateIncidentNumber();

        Incident incident = Incident.builder()
                .incidentNumber(incidentNumber)
                .type(request.getType())
                .severity(request.getSeverity())
                .description(request.getDescription())
                .status(IncidentStatus.REPORTED)
                .reportedBy(reporter)
                .location(location)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        Incident savedIncident = incidentRepository.save(incident);

        recordHistory(savedIncident, null, IncidentStatus.REPORTED, reporter, "Incident emergency alert reported by " + reporter.getFullName());

        String notifTitle = "🚨 New " + savedIncident.getSeverity() + " Emergency Reported!";
        String notifMsg = savedIncident.getIncidentNumber() + ": " + savedIncident.getType() + " at " +
                (location != null ? location.getBuilding() + " " + (location.getRoom() != null ? location.getRoom() : "") : "Campus Location");
        notificationService.notifySecurityTeam(savedIncident, notifTitle, notifMsg, NotificationType.INCIDENT_CREATED);

        notificationService.createNotification(
                reporter,
                savedIncident,
                "Emergency Alert Submitted",
                "Incident " + savedIncident.getIncidentNumber() + " has been registered. Security team has been notified.",
                NotificationType.INCIDENT_CREATED
        );

        auditLogService.log(reporter, "INCIDENT_CREATED", "Incident", savedIncident.getId().toString(), "Reported " + savedIncident.getSeverity() + " " + savedIncident.getType());

        return mapToResponse(savedIncident);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponse getIncidentById(Long id, User currentUser) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        validateUserAccess(incident, currentUser);
        return mapToResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public IncidentResponse getIncidentByNumber(String incidentNumber, User currentUser) {
        Incident incident = incidentRepository.findByIncidentNumber(incidentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with number: " + incidentNumber));

        validateUserAccess(incident, currentUser);
        return mapToResponse(incident);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<IncidentResponse> getIncidents(
            IncidentStatus status,
            Severity severity,
            IncidentType type,
            Long locationId,
            String search,
            User currentUser,
            Pageable pageable
    ) {
        Specification<Incident> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (currentUser.getRole() == Role.STUDENT) {
                predicates.add(cb.equal(root.get("reportedBy").get("id"), currentUser.getId()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (severity != null) {
                predicates.add(cb.equal(root.get("severity"), severity));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (locationId != null) {
                predicates.add(cb.equal(root.get("location").get("id"), locationId));
            }
            if (search != null && !search.isBlank()) {
                String searchLike = "%" + search.toLowerCase() + "%";
                Predicate searchNum = cb.like(cb.lower(root.get("incidentNumber")), searchLike);
                Predicate searchDesc = cb.like(cb.lower(root.get("description")), searchLike);
                predicates.add(cb.or(searchNum, searchDesc));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Incident> page = incidentRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponse> getActiveIncidents() {
        List<IncidentStatus> activeStatuses = Arrays.asList(
                IncidentStatus.REPORTED,
                IncidentStatus.ACKNOWLEDGED,
                IncidentStatus.ASSIGNED,
                IncidentStatus.IN_PROGRESS
        );

        List<Incident> activeIncidents = incidentRepository.findActiveIncidentsSorted(activeStatuses);
        return activeIncidents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public IncidentResponse updateStatus(Long id, IncidentStatusRequest request, User currentUser) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        IncidentStatus prevStatus = incident.getStatus();
        IncidentStatus newStatus = request.getStatus();

        validateStatusTransition(incident, prevStatus, newStatus, currentUser);

        incident.setStatus(newStatus);

        if (request.getOfficerNotes() != null && !request.getOfficerNotes().isBlank()) {
            incident.setOfficerNotes(request.getOfficerNotes());
        }

        if (newStatus == IncidentStatus.RESOLVED) {
            incident.setResolvedAt(LocalDateTime.now());
            if (request.getResolutionSummary() != null) {
                incident.setResolutionSummary(request.getResolutionSummary());
            }
        } else if (newStatus == IncidentStatus.CLOSED) {
            incident.setClosedAt(LocalDateTime.now());
        }

        Incident updated = incidentRepository.save(incident);

        String remarks = request.getRemarks() != null ? request.getRemarks() : "Status updated to " + newStatus;
        recordHistory(updated, prevStatus, newStatus, currentUser, remarks);

        String notifMsg = "Incident " + updated.getIncidentNumber() + " status changed to " + newStatus;
        notificationService.createNotification(
                updated.getReportedBy(),
                updated,
                "Incident Status Updated: " + newStatus,
                notifMsg,
                newStatus == IncidentStatus.RESOLVED ? NotificationType.INCIDENT_RESOLVED : NotificationType.STATUS_UPDATED
        );

        auditLogService.log(currentUser, "STATUS_CHANGED", "Incident", updated.getId().toString(), "Changed status from " + prevStatus + " to " + newStatus);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public IncidentResponse assignOfficer(Long id, IncidentAssignmentRequest request, User currentUser) {
        if (currentUser.getRole() != Role.SECURITY_OFFICER && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only security personnel or admins can assign incidents");
        }

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        User officer = userRepository.findById(request.getOfficerId())
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + request.getOfficerId()));

        if (officer.getRole() != Role.SECURITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new BadRequestException("Assigned user must be a security officer or admin");
        }

        IncidentStatus prevStatus = incident.getStatus();
        incident.setAssignedOfficer(officer);
        
        if (prevStatus == IncidentStatus.REPORTED || prevStatus == IncidentStatus.ACKNOWLEDGED) {
            incident.setStatus(IncidentStatus.ASSIGNED);
        }

        Incident updated = incidentRepository.save(incident);

        String remarks = request.getRemarks() != null ? request.getRemarks() : "Assigned officer: " + officer.getFullName();
        recordHistory(updated, prevStatus, updated.getStatus(), currentUser, remarks);

        notificationService.createNotification(
                officer,
                updated,
                "Assigned to Incident " + updated.getIncidentNumber(),
                "You have been assigned to handle " + updated.getSeverity() + " incident: " + updated.getType(),
                NotificationType.OFFICER_ASSIGNED
        );

        notificationService.createNotification(
                updated.getReportedBy(),
                updated,
                "Officer Assigned to Your Incident",
                "Security officer " + officer.getFullName() + " has been assigned to your report " + updated.getIncidentNumber(),
                NotificationType.OFFICER_ASSIGNED
        );

        auditLogService.log(currentUser, "OFFICER_ASSIGNED", "Incident", updated.getId().toString(), "Assigned incident to " + officer.getFullName());

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentHistoryResponse> getIncidentHistory(Long incidentId, User currentUser) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        validateUserAccess(incident, currentUser);

        List<IncidentHistory> historyList = incidentHistoryRepository.findByIncidentOrderByCreatedAtAsc(incident);
        return historyList.stream().map(this::mapHistoryToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelIncident(Long id, User student) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found"));

        if (!incident.getReportedBy().getId().equals(student.getId()) && student.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You can only cancel your own emergency alerts");
        }

        if (incident.getStatus() != IncidentStatus.REPORTED && incident.getStatus() != IncidentStatus.ACKNOWLEDGED) {
            throw new BadRequestException("Cannot cancel incident that is already in progress or resolved");
        }

        IncidentStatus prev = incident.getStatus();
        incident.setStatus(IncidentStatus.CANCELLED);
        Incident updated = incidentRepository.save(incident);

        recordHistory(updated, prev, IncidentStatus.CANCELLED, student, "Alert cancelled by student");
        auditLogService.log(student, "INCIDENT_CANCELLED", "Incident", updated.getId().toString(), "Cancelled emergency alert");
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        List<IncidentStatus> activeStatuses = Arrays.asList(
                IncidentStatus.REPORTED,
                IncidentStatus.ACKNOWLEDGED,
                IncidentStatus.ASSIGNED,
                IncidentStatus.IN_PROGRESS
        );

        long total = incidentRepository.count();
        long active = incidentRepository.countByStatusIn(activeStatuses);
        long critical = incidentRepository.countBySeverityAndStatusIn(Severity.CRITICAL, activeStatuses);
        long resolvedToday = incidentRepository.countByStatusAndResolvedAtAfter(
                IncidentStatus.RESOLVED, LocalDateTime.now().minusDays(1)
        );

        List<Object[]> typeCounts = incidentRepository.countGroupedByType();
        List<Map<String, Object>> catDist = typeCounts.stream().map(arr -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", arr[0].toString());
            map.put("count", arr[1]);
            return map;
        }).collect(Collectors.toList());

        List<Object[]> sevCounts = incidentRepository.countGroupedBySeverity();
        List<Map<String, Object>> sevDist = sevCounts.stream().map(arr -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", arr[0].toString());
            map.put("count", arr[1]);
            return map;
        }).collect(Collectors.toList());

        List<Object[]> locCounts = incidentRepository.countGroupedByBuilding();
        List<Map<String, Object>> locDist = locCounts.stream().map(arr -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", arr[0] != null ? arr[0].toString() : "Unknown Location");
            map.put("count", arr[1]);
            return map;
        }).collect(Collectors.toList());

        List<User> officers = userRepository.findByRole(Role.SECURITY_OFFICER);
        List<Map<String, Object>> officerPerf = officers.stream().map(officer -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", officer.getFullName());
            long assigned = incidentRepository.countByAssignedOfficer(officer);
            map.put("assignedIncidents", assigned);
            return map;
        }).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalIncidents(total)
                .activeIncidents(active)
                .criticalIncidents(critical)
                .resolvedToday(resolvedToday)
                .categoryDistribution(catDist)
                .severityDistribution(sevDist)
                .locationDistribution(locDist)
                .officerPerformance(officerPerf)
                .build();
    }

    private void validateUserAccess(Incident incident, User currentUser) {
        if (currentUser.getRole() == Role.STUDENT && !incident.getReportedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You can only view your own incident reports");
        }
    }

    private void validateStatusTransition(Incident incident, IncidentStatus prev, IncidentStatus target, User user) {
        if (prev == target) return;

        if (target == IncidentStatus.CLOSED && user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can close resolved incidents");
        }

        if (target == IncidentStatus.RESOLVED) {
            boolean isAssigned = incident.getAssignedOfficer() != null && incident.getAssignedOfficer().getId().equals(user.getId());
            boolean isAdmin = user.getRole() == Role.ADMIN;
            if (!isAssigned && !isAdmin) {
                throw new AccessDeniedException("Only the assigned officer or an administrator can resolve this incident");
            }
        }

        if (user.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Students cannot directly change incident status");
        }
    }

    private void recordHistory(Incident incident, IncidentStatus prevStatus, IncidentStatus newStatus, User changedBy, String remarks) {
        IncidentHistory history = IncidentHistory.builder()
                .incident(incident)
                .previousStatus(prevStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .remarks(remarks)
                .build();
        incidentHistoryRepository.save(history);
    }

    private String generateIncidentNumber() {
        int year = LocalDateTime.now().getYear();
        long nextId = incidentRepository.count() + 101;
        return String.format("INC-%d-%06d", year, nextId);
    }

    private IncidentResponse mapToResponse(Incident incident) {
        UserResponse reporterRes = incident.getReportedBy() != null ? mapUserToResponse(incident.getReportedBy()) : null;
        UserResponse officerRes = incident.getAssignedOfficer() != null ? mapUserToResponse(incident.getAssignedOfficer()) : null;

        LocationDTO locDTO = null;
        if (incident.getLocation() != null) {
            Location loc = incident.getLocation();
            locDTO = LocationDTO.builder()
                    .id(loc.getId())
                    .building(loc.getBuilding())
                    .area(loc.getArea())
                    .floor(loc.getFloor())
                    .room(loc.getRoom())
                    .latitude(loc.getLatitude())
                    .longitude(loc.getLongitude())
                    .createdAt(loc.getCreatedAt())
                    .build();
        }

        return IncidentResponse.builder()
                .id(incident.getId())
                .incidentNumber(incident.getIncidentNumber())
                .type(incident.getType())
                .severity(incident.getSeverity())
                .description(incident.getDescription())
                .status(incident.getStatus())
                .reportedBy(reporterRes)
                .assignedOfficer(officerRes)
                .location(locDTO)
                .latitude(incident.getLatitude())
                .longitude(incident.getLongitude())
                .officerNotes(incident.getOfficerNotes())
                .resolutionSummary(incident.getResolutionSummary())
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .resolvedAt(incident.getResolvedAt())
                .closedAt(incident.getClosedAt())
                .build();
    }

    private IncidentHistoryResponse mapHistoryToResponse(IncidentHistory h) {
        UserResponse userRes = h.getChangedBy() != null ? mapUserToResponse(h.getChangedBy()) : null;
        return IncidentHistoryResponse.builder()
                .id(h.getId())
                .incidentId(h.getIncident().getId())
                .previousStatus(h.getPreviousStatus())
                .newStatus(h.getNewStatus())
                .changedBy(userRes)
                .remarks(h.getRemarks())
                .createdAt(h.getCreatedAt())
                .build();
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

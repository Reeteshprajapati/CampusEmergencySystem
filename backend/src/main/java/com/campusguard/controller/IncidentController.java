package com.campusguard.controller;

import com.campusguard.dto.*;
import com.campusguard.entity.User;
import com.campusguard.enums.IncidentStatus;
import com.campusguard.enums.IncidentType;
import com.campusguard.enums.Severity;
import com.campusguard.repository.UserRepository;
import com.campusguard.security.UserPrincipal;
import com.campusguard.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incident Management", description = "Endpoints for Reporting, Monitoring, Polling, and Managing Incidents")
public class IncidentController {

    private final IncidentService incidentService;
    private final UserRepository userRepository;

    public IncidentController(IncidentService incidentService, UserRepository userRepository) {
        this.incidentService = incidentService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User session invalid"));
    }

    @PostMapping
    @Operation(summary = "Report Emergency Incident", description = "Create a new emergency alert with severity, location, and description")
    public ResponseEntity<ApiResponse<IncidentResponse>> createIncident(
            @Valid @RequestBody IncidentCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User reporter = getAuthenticatedUser(userPrincipal);
        IncidentResponse response = incidentService.createIncident(request, reporter);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Emergency alert submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get Paginated Incidents", description = "Filter, search, sort, and paginate incidents")
    public ResponseEntity<ApiResponse<PageResponse<IncidentResponse>>> getIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) IncidentType type,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<IncidentResponse> incidents = incidentService.getIncidents(
                status, severity, type, locationId, search, user, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Incidents retrieved successfully", incidents));
    }

    @GetMapping("/active")
    @Operation(summary = "Get Active Incidents (Polled)", description = "Polled every 5 seconds by Security Officers for near real-time updates")
    public ResponseEntity<ApiResponse<List<IncidentResponse>>> getActiveIncidents() {
        List<IncidentResponse> active = incidentService.getActiveIncidents();
        return ResponseEntity.ok(ApiResponse.success("Active incidents retrieved", active));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SECURITY_OFFICER', 'ADMIN')")
    @Operation(summary = "Get Dashboard Analytics", description = "Retrieve metrics, category distributions, and officer performance")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = incidentService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Incident Details", description = "Retrieve detailed information for a specific incident by ID")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        IncidentResponse incident = incidentService.getIncidentById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Incident retrieved successfully", incident));
    }

    @GetMapping("/number/{incidentNumber}")
    @Operation(summary = "Get Incident by Number", description = "Lookup incident by formatted number (e.g. INC-2026-000124)")
    public ResponseEntity<ApiResponse<IncidentResponse>> getIncidentByNumber(
            @PathVariable String incidentNumber,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        IncidentResponse incident = incidentService.getIncidentByNumber(incidentNumber, user);
        return ResponseEntity.ok(ApiResponse.success("Incident retrieved successfully", incident));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SECURITY_OFFICER', 'ADMIN')")
    @Operation(summary = "Update Incident Status", description = "Acknowledge, Start Response, Resolve, or Close an incident")
    public ResponseEntity<ApiResponse<IncidentResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody IncidentStatusRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        IncidentResponse updated = incidentService.updateStatus(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Incident status updated successfully", updated));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('SECURITY_OFFICER', 'ADMIN')")
    @Operation(summary = "Assign Officer to Incident", description = "Assign or reassign a security officer to an incident")
    public ResponseEntity<ApiResponse<IncidentResponse>> assignOfficer(
            @PathVariable Long id,
            @Valid @RequestBody IncidentAssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        IncidentResponse updated = incidentService.assignOfficer(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Officer assigned successfully", updated));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel Incident", description = "Cancel an emergency alert (Student reporter or Admin)")
    public ResponseEntity<ApiResponse<Void>> cancelIncident(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        incidentService.cancelIncident(id, user);
        return ResponseEntity.ok(ApiResponse.success("Incident cancelled successfully"));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get Incident History Timeline", description = "Retrieve timeline audit history of status changes for an incident")
    public ResponseEntity<ApiResponse<List<IncidentHistoryResponse>>> getIncidentHistory(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        List<IncidentHistoryResponse> history = incidentService.getIncidentHistory(id, user);
        return ResponseEntity.ok(ApiResponse.success("Incident history retrieved", history));
    }
}

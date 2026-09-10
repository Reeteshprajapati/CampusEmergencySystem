package com.campusguard.dto;

import com.campusguard.enums.IncidentStatus;
import com.campusguard.enums.IncidentType;
import com.campusguard.enums.Severity;
import java.time.LocalDateTime;

public class IncidentResponse {
    private Long id;
    private String incidentNumber;
    private IncidentType type;
    private Severity severity;
    private String description;
    private IncidentStatus status;

    private UserResponse reportedBy;
    private UserResponse assignedOfficer;
    private LocationDTO location;

    private Double latitude;
    private Double longitude;

    private String officerNotes;
    private String resolutionSummary;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    public IncidentResponse() {}

    public IncidentResponse(Long id, String incidentNumber, IncidentType type, Severity severity, String description, IncidentStatus status, UserResponse reportedBy, UserResponse assignedOfficer, LocationDTO location, Double latitude, Double longitude, String officerNotes, String resolutionSummary, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime resolvedAt, LocalDateTime closedAt) {
        this.id = id;
        this.incidentNumber = incidentNumber;
        this.type = type;
        this.severity = severity;
        this.description = description;
        this.status = status;
        this.reportedBy = reportedBy;
        this.assignedOfficer = assignedOfficer;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.officerNotes = officerNotes;
        this.resolutionSummary = resolutionSummary;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
        this.closedAt = closedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIncidentNumber() { return incidentNumber; }
    public void setIncidentNumber(String incidentNumber) { this.incidentNumber = incidentNumber; }
    public IncidentType getType() { return type; }
    public void setType(IncidentType type) { this.type = type; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
    public UserResponse getReportedBy() { return reportedBy; }
    public void setReportedBy(UserResponse reportedBy) { this.reportedBy = reportedBy; }
    public UserResponse getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(UserResponse assignedOfficer) { this.assignedOfficer = assignedOfficer; }
    public LocationDTO getLocation() { return location; }
    public void setLocation(LocationDTO location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getOfficerNotes() { return officerNotes; }
    public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }
    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String incidentNumber;
        private IncidentType type;
        private Severity severity;
        private String description;
        private IncidentStatus status;
        private UserResponse reportedBy;
        private UserResponse assignedOfficer;
        private LocationDTO location;
        private Double latitude;
        private Double longitude;
        private String officerNotes;
        private String resolutionSummary;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime resolvedAt;
        private LocalDateTime closedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder incidentNumber(String incidentNumber) { this.incidentNumber = incidentNumber; return this; }
        public Builder type(IncidentType type) { this.type = type; return this; }
        public Builder severity(Severity severity) { this.severity = severity; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(IncidentStatus status) { this.status = status; return this; }
        public Builder reportedBy(UserResponse reportedBy) { this.reportedBy = reportedBy; return this; }
        public Builder assignedOfficer(UserResponse assignedOfficer) { this.assignedOfficer = assignedOfficer; return this; }
        public Builder location(LocationDTO location) { this.location = location; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder officerNotes(String officerNotes) { this.officerNotes = officerNotes; return this; }
        public Builder resolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }
        public Builder closedAt(LocalDateTime closedAt) { this.closedAt = closedAt; return this; }
        public IncidentResponse build() { return new IncidentResponse(id, incidentNumber, type, severity, description, status, reportedBy, assignedOfficer, location, latitude, longitude, officerNotes, resolutionSummary, createdAt, updatedAt, resolvedAt, closedAt); }
    }
}

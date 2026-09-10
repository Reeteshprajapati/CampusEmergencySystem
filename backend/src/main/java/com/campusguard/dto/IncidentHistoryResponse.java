package com.campusguard.dto;

import com.campusguard.enums.IncidentStatus;
import java.time.LocalDateTime;

public class IncidentHistoryResponse {
    private Long id;
    private Long incidentId;
    private IncidentStatus previousStatus;
    private IncidentStatus newStatus;
    private UserResponse changedBy;
    private String remarks;
    private LocalDateTime createdAt;

    public IncidentHistoryResponse() {}

    public IncidentHistoryResponse(Long id, Long incidentId, IncidentStatus previousStatus, IncidentStatus newStatus, UserResponse changedBy, String remarks, LocalDateTime createdAt) {
        this.id = id;
        this.incidentId = incidentId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIncidentId() { return incidentId; }
    public void setIncidentId(Long incidentId) { this.incidentId = incidentId; }
    public IncidentStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(IncidentStatus previousStatus) { this.previousStatus = previousStatus; }
    public IncidentStatus getNewStatus() { return newStatus; }
    public void setNewStatus(IncidentStatus newStatus) { this.newStatus = newStatus; }
    public UserResponse getChangedBy() { return changedBy; }
    public void setChangedBy(UserResponse changedBy) { this.changedBy = changedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private Long incidentId;
        private IncidentStatus previousStatus;
        private IncidentStatus newStatus;
        private UserResponse changedBy;
        private String remarks;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder incidentId(Long incidentId) { this.incidentId = incidentId; return this; }
        public Builder previousStatus(IncidentStatus previousStatus) { this.previousStatus = previousStatus; return this; }
        public Builder newStatus(IncidentStatus newStatus) { this.newStatus = newStatus; return this; }
        public Builder changedBy(UserResponse changedBy) { this.changedBy = changedBy; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public IncidentHistoryResponse build() { return new IncidentHistoryResponse(id, incidentId, previousStatus, newStatus, changedBy, remarks, createdAt); }
    }
}

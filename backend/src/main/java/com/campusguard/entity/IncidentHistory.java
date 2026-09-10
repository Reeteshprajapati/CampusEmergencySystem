package com.campusguard.entity;

import com.campusguard.enums.IncidentStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_history")
public class IncidentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private IncidentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false)
    private IncidentStatus newStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public IncidentHistory() {}

    public IncidentHistory(Long id, Incident incident, IncidentStatus previousStatus, IncidentStatus newStatus, User changedBy, String remarks, LocalDateTime createdAt) {
        this.id = id;
        this.incident = incident;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Incident getIncident() { return incident; }
    public void setIncident(Incident incident) { this.incident = incident; }
    public IncidentStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(IncidentStatus previousStatus) { this.previousStatus = previousStatus; }
    public IncidentStatus getNewStatus() { return newStatus; }
    public void setNewStatus(IncidentStatus newStatus) { this.newStatus = newStatus; }
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private Incident incident;
        private IncidentStatus previousStatus;
        private IncidentStatus newStatus;
        private User changedBy;
        private String remarks;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder incident(Incident incident) { this.incident = incident; return this; }
        public Builder previousStatus(IncidentStatus previousStatus) { this.previousStatus = previousStatus; return this; }
        public Builder newStatus(IncidentStatus newStatus) { this.newStatus = newStatus; return this; }
        public Builder changedBy(User changedBy) { this.changedBy = changedBy; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public IncidentHistory build() { return new IncidentHistory(id, incident, previousStatus, newStatus, changedBy, remarks, createdAt); }
    }
}

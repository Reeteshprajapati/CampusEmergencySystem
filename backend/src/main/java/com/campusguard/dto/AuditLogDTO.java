package com.campusguard.dto;

import java.time.LocalDateTime;

public class AuditLogDTO {
    private Long id;
    private UserResponse user;
    private String action;
    private String entityType;
    private String entityId;
    private String description;
    private LocalDateTime createdAt;

    public AuditLogDTO() {}

    public AuditLogDTO(Long id, UserResponse user, String action, String entityType, String entityId, String description, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.description = description;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private UserResponse user;
        private String action;
        private String entityType;
        private String entityId;
        private String description;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(UserResponse user) { this.user = user; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder entityType(String entityType) { this.entityType = entityType; return this; }
        public Builder entityId(String entityId) { this.entityId = entityId; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AuditLogDTO build() { return new AuditLogDTO(id, user, action, entityType, entityId, description, createdAt); }
    }
}

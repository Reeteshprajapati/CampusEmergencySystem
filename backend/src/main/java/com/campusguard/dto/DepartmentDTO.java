package com.campusguard.dto;

import com.campusguard.enums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class DepartmentDTO {
    private Long id;
    @NotBlank(message = "Department name is required")
    private String name;
    private String description;
    private UserStatus status;
    private LocalDateTime createdAt;

    public DepartmentDTO() {}

    public DepartmentDTO(Long id, String name, String description, UserStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private UserStatus status;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(UserStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public DepartmentDTO build() { return new DepartmentDTO(id, name, description, status, createdAt); }
    }
}

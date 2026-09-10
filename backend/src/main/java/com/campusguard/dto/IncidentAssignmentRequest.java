package com.campusguard.dto;

import jakarta.validation.constraints.NotNull;

public class IncidentAssignmentRequest {

    @NotNull(message = "Officer ID is required")
    private Long officerId;

    private String remarks;

    public IncidentAssignmentRequest() {}

    public Long getOfficerId() { return officerId; }
    public void setOfficerId(Long officerId) { this.officerId = officerId; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

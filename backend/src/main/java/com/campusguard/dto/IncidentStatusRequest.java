package com.campusguard.dto;

import com.campusguard.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public class IncidentStatusRequest {

    @NotNull(message = "New status is required")
    private IncidentStatus status;

    private String remarks;
    private String officerNotes;
    private String resolutionSummary;

    public IncidentStatusRequest() {}

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getOfficerNotes() { return officerNotes; }
    public void setOfficerNotes(String officerNotes) { this.officerNotes = officerNotes; }
    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }
}

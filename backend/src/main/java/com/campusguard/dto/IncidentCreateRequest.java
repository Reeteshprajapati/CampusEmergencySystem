package com.campusguard.dto;

import com.campusguard.enums.IncidentType;
import com.campusguard.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class IncidentCreateRequest {

    @NotNull(message = "Incident type is required")
    private IncidentType type;

    @NotNull(message = "Severity level is required")
    private Severity severity;

    @NotBlank(message = "Description is required")
    private String description;

    private Long locationId;
    private String building;
    private String area;
    private String floor;
    private String room;
    private Double latitude;
    private Double longitude;
    private String contactNumber;

    public IncidentCreateRequest() {}

    public IncidentType getType() { return type; }
    public void setType(IncidentType type) { this.type = type; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
}

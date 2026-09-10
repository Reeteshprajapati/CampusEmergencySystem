package com.campusguard.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class LocationDTO {
    private Long id;
    @NotBlank(message = "Building is required")
    private String building;
    @NotBlank(message = "Area is required")
    private String area;
    private String floor;
    private String room;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;

    public LocationDTO() {}

    public LocationDTO(Long id, String building, String area, String floor, String room, Double latitude, Double longitude, LocalDateTime createdAt) {
        this.id = id;
        this.building = building;
        this.area = area;
        this.floor = floor;
        this.room = room;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String building;
        private String area;
        private String floor;
        private String room;
        private Double latitude;
        private Double longitude;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder building(String building) { this.building = building; return this; }
        public Builder area(String area) { this.area = area; return this; }
        public Builder floor(String floor) { this.floor = floor; return this; }
        public Builder room(String room) { this.room = room; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LocationDTO build() { return new LocationDTO(id, building, area, floor, room, latitude, longitude, createdAt); }
    }
}

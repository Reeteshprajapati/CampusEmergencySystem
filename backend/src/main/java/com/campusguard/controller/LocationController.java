package com.campusguard.controller;

import com.campusguard.dto.ApiResponse;
import com.campusguard.dto.LocationDTO;
import com.campusguard.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@Tag(name = "Campus Locations", description = "Endpoints for campus buildings, areas, and rooms")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    @Operation(summary = "Get All Campus Locations", description = "Retrieve list of all campus buildings and rooms")
    public ResponseEntity<ApiResponse<List<LocationDTO>>> getAllLocations() {
        List<LocationDTO> locations = locationService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success("Locations retrieved successfully", locations));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Location by ID")
    public ResponseEntity<ApiResponse<LocationDTO>> getLocationById(@PathVariable Long id) {
        LocationDTO location = locationService.getLocationById(id);
        return ResponseEntity.ok(ApiResponse.success("Location retrieved successfully", location));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Location", description = "Add a new campus building or room (Admin only)")
    public ResponseEntity<ApiResponse<LocationDTO>> createLocation(@Valid @RequestBody LocationDTO dto) {
        LocationDTO created = locationService.createLocation(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Location created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Location")
    public ResponseEntity<ApiResponse<LocationDTO>> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationDTO dto) {
        LocationDTO updated = locationService.updateLocation(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Location")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success("Location deleted successfully"));
    }
}

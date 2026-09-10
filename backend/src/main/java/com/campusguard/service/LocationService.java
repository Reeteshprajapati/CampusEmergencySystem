package com.campusguard.service;

import com.campusguard.dto.LocationDTO;

import java.util.List;

public interface LocationService {
    List<LocationDTO> getAllLocations();
    LocationDTO getLocationById(Long id);
    LocationDTO createLocation(LocationDTO dto);
    LocationDTO updateLocation(Long id, LocationDTO dto);
    void deleteLocation(Long id);
}

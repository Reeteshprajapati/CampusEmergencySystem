package com.campusguard.service.impl;

import com.campusguard.dto.LocationDTO;
import com.campusguard.entity.Location;
import com.campusguard.exception.ResourceNotFoundException;
import com.campusguard.repository.IncidentRepository;
import com.campusguard.repository.LocationRepository;
import com.campusguard.service.LocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final IncidentRepository incidentRepository;

    public LocationServiceImpl(LocationRepository locationRepository, IncidentRepository incidentRepository) {
        this.locationRepository = locationRepository;
        this.incidentRepository = incidentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDTO> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LocationDTO getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
        return mapToDTO(location);
    }

    @Override
    @Transactional
    public LocationDTO createLocation(LocationDTO dto) {
        Location location = Location.builder()
                .building(dto.getBuilding())
                .area(dto.getArea())
                .floor(dto.getFloor())
                .room(dto.getRoom())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        return mapToDTO(locationRepository.save(location));
    }

    @Override
    @Transactional
    public LocationDTO updateLocation(Long id, LocationDTO dto) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        location.setBuilding(dto.getBuilding());
        location.setArea(dto.getArea());
        location.setFloor(dto.getFloor());
        location.setRoom(dto.getRoom());
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());

        return mapToDTO(locationRepository.save(location));
    }

    @Override
    @Transactional
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location not found with id: " + id);
        }
        incidentRepository.nullifyLocationReference(id);
        locationRepository.deleteById(id);
    }

    private LocationDTO mapToDTO(Location loc) {
        return LocationDTO.builder()
                .id(loc.getId())
                .building(loc.getBuilding())
                .area(loc.getArea())
                .floor(loc.getFloor())
                .room(loc.getRoom())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .createdAt(loc.getCreatedAt())
                .build();
    }
}

package com.campusguard.service;

import com.campusguard.dto.IncidentCreateRequest;
import com.campusguard.dto.IncidentResponse;
import com.campusguard.entity.Incident;
import com.campusguard.entity.Location;
import com.campusguard.entity.User;
import com.campusguard.enums.IncidentStatus;
import com.campusguard.enums.IncidentType;
import com.campusguard.enums.Role;
import com.campusguard.enums.Severity;
import com.campusguard.repository.IncidentHistoryRepository;
import com.campusguard.repository.IncidentRepository;
import com.campusguard.repository.LocationRepository;
import com.campusguard.repository.UserRepository;
import com.campusguard.service.impl.IncidentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private IncidentHistoryRepository incidentHistoryRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private IncidentServiceImpl incidentService;

    private User studentUser;
    private Location sampleLocation;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(10L)
                .fullName("Jane Doe")
                .email("jane@campusguard.com")
                .role(Role.STUDENT)
                .build();

        sampleLocation = Location.builder()
                .id(5L)
                .building("Engineering Block")
                .room("Room 204")
                .build();
    }

    @Test
    void testCreateIncidentSuccess() {
        IncidentCreateRequest req = new IncidentCreateRequest();
        req.setType(IncidentType.MEDICAL_EMERGENCY);
        req.setSeverity(Severity.CRITICAL);
        req.setDescription("Medical emergency reported");
        req.setLocationId(5L);

        when(locationRepository.findById(5L)).thenReturn(Optional.of(sampleLocation));
        when(incidentRepository.count()).thenReturn(10L);
        when(incidentRepository.save(any(Incident.class))).thenAnswer(invocation -> {
            Incident inc = invocation.getArgument(0);
            inc.setId(100L);
            return inc;
        });

        IncidentResponse response = incidentService.createIncident(req, studentUser);

        assertNotNull(response);
        assertEquals(IncidentType.MEDICAL_EMERGENCY, response.getType());
        assertEquals(Severity.CRITICAL, response.getSeverity());
        assertEquals(IncidentStatus.REPORTED, response.getStatus());
        assertTrue(response.getIncidentNumber().startsWith("INC-"));

        verify(notificationService, times(1)).notifySecurityTeam(any(), any(), any(), any());
        verify(auditLogService, times(1)).log(eq(studentUser), eq("INCIDENT_CREATED"), any(), any(), any());
    }
}

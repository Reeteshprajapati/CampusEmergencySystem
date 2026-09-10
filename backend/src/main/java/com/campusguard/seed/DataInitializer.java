package com.campusguard.seed;

import com.campusguard.dto.IncidentAssignmentRequest;
import com.campusguard.dto.IncidentCreateRequest;
import com.campusguard.dto.IncidentStatusRequest;
import com.campusguard.entity.*;
import com.campusguard.enums.*;
import com.campusguard.repository.*;
import com.campusguard.service.IncidentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final IncidentService incidentService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, DepartmentRepository departmentRepository, LocationRepository locationRepository, IncidentService incidentService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.incidentService = incidentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        userRepository.findByEmail("admin@campusguard.com").ifPresent(u -> {
            u.setPassword("Admin@123");
            userRepository.save(u);
        });
        userRepository.findByEmail("security@campusguard.com").ifPresent(u -> {
            u.setPassword("Security@123");
            userRepository.save(u);
        });
        userRepository.findByEmail("student@campusguard.com").ifPresent(u -> {
            u.setPassword("Student@123");
            userRepository.save(u);
        });

        if (userRepository.count() > 0) {
            log.info("Database initialized with plain text passwords.");
            return;
        }

        log.info("Seeding CampusGuard initial demo data...");

        // 1. Departments
        Department secDept = departmentRepository.save(Department.builder().name("Campus Security & Safety").description("Primary emergency response team").build());
        Department csDept = departmentRepository.save(Department.builder().name("Computer Science & Engineering").description("Academic CS department").build());
        Department facDept = departmentRepository.save(Department.builder().name("Facilities Management").description("Campus infrastructure and upkeep").build());

        // 2. Locations
        Location locEng = locationRepository.save(Location.builder().building("Engineering Block A").area("North Campus").floor("2nd Floor").room("Room 204").latitude(12.9716).longitude(77.5946).build());
        Location locSci = locationRepository.save(Location.builder().building("Science Complex").area("South Campus").floor("1st Floor").room("Lab 102").latitude(12.9720).longitude(77.5950).build());
        Location locLib = locationRepository.save(Location.builder().building("Central Library").area("Main Plaza").floor("Ground Floor").room("Reading Hall B").latitude(12.9710).longitude(77.5940).build());
        Location locHst = locationRepository.save(Location.builder().building("Hostel Block 4").area("Residential Zone").floor("3rd Floor").room("Room 312").latitude(12.9700).longitude(77.5930).build());

        // 3. Demo Users (Admin, Security Officer, Student)
        User admin = userRepository.save(User.builder()
                .fullName("System Administrator")
                .email("admin@campusguard.com")
                .password("Admin@123")
                .phone("+1 (555) 019-2831")
                .role(Role.ADMIN)
                .department(secDept)
                .status(UserStatus.ACTIVE)
                .build());

        User officer1 = userRepository.save(User.builder()
                .fullName("Officer John Marcus")
                .email("security@campusguard.com")
                .password("Security@123")
                .phone("+1 (555) 014-9922")
                .role(Role.SECURITY_OFFICER)
                .department(secDept)
                .status(UserStatus.ACTIVE)
                .build());

        User officer2 = userRepository.save(User.builder()
                .fullName("Officer Sarah Jenkins")
                .email("officer.jenkins@campusguard.com")
                .password("Officer@123")
                .phone("+1 (555) 014-8833")
                .role(Role.SECURITY_OFFICER)
                .department(secDept)
                .status(UserStatus.ACTIVE)
                .build());

        User student = userRepository.save(User.builder()
                .fullName("Alex Rivera")
                .email("student@campusguard.com")
                .password("Student@123")
                .phone("+1 (555) 018-7744")
                .role(Role.STUDENT)
                .department(csDept)
                .status(UserStatus.ACTIVE)
                .build());

        log.info("Demo Accounts Created:");
        log.info("ADMIN: admin@campusguard.com / Admin@123");
        log.info("SECURITY: security@campusguard.com / Security@123");
        log.info("STUDENT: student@campusguard.com / Student@123");

        // 4. Sample Incidents
        // Incident 1: Critical Medical Emergency (Active / REPORTED)
        IncidentCreateRequest req1 = new IncidentCreateRequest();
        req1.setType(IncidentType.MEDICAL_EMERGENCY);
        req1.setSeverity(Severity.CRITICAL);
        req1.setDescription("Student collapsed in Room 204 during lecture. Severe shortness of breath and unresponsiveness.");
        req1.setLocationId(locEng.getId());
        req1.setLatitude(12.9716);
        req1.setLongitude(77.5946);
        req1.setContactNumber("+1 (555) 018-7744");
        var inc1 = incidentService.createIncident(req1, student);

        // Incident 2: High Fire Hazard (ACKNOWLEDGED)
        IncidentCreateRequest req2 = new IncidentCreateRequest();
        req2.setType(IncidentType.FIRE);
        req2.setSeverity(Severity.HIGH);
        req2.setDescription("Smoke smell and flickering electrical wiring near Chemistry Lab 102.");
        req2.setLocationId(locSci.getId());
        req2.setLatitude(12.9720);
        req2.setLongitude(77.5950);
        req2.setContactNumber("+1 (555) 018-7744");
        var inc2 = incidentService.createIncident(req2, student);

        IncidentStatusRequest ackReq = new IncidentStatusRequest();
        ackReq.setStatus(IncidentStatus.ACKNOWLEDGED);
        ackReq.setRemarks("Dispatching patrol unit to inspect wiring immediately.");
        incidentService.updateStatus(inc2.getId(), ackReq, officer1);

        // Incident 3: Suspicious Activity (IN_PROGRESS)
        IncidentCreateRequest req3 = new IncidentCreateRequest();
        req3.setType(IncidentType.SUSPICIOUS_ACTIVITY);
        req3.setSeverity(Severity.MEDIUM);
        req3.setDescription("Unattended backpack left in Central Library Reading Hall for over 2 hours.");
        req3.setLocationId(locLib.getId());
        var inc3 = incidentService.createIncident(req3, student);

        IncidentStatusRequest progReq = new IncidentStatusRequest();
        progReq.setStatus(IncidentStatus.IN_PROGRESS);
        progReq.setOfficerNotes("Officer Marcus on scene inspecting baggage with K9 unit.");
        progReq.setRemarks("Assigned officer responding.");
        incidentService.updateStatus(inc3.getId(), progReq, officer1);

        // Incident 4: Infrastructure Hazard (RESOLVED)
        IncidentCreateRequest req4 = new IncidentCreateRequest();
        req4.setType(IncidentType.INFRASTRUCTURE_HAZARD);
        req4.setSeverity(Severity.LOW);
        req4.setDescription("Broken glass panel near Hostel Block 4 entrance steps.");
        req4.setLocationId(locHst.getId());
        var inc4 = incidentService.createIncident(req4, student);

        IncidentAssignmentRequest assignReq = new IncidentAssignmentRequest();
        assignReq.setOfficerId(officer1.getId());
        assignReq.setRemarks("Assigned officer Marcus for repair oversight.");
        incidentService.assignOfficer(inc4.getId(), assignReq, officer1);

        IncidentStatusRequest resReq = new IncidentStatusRequest();
        resReq.setStatus(IncidentStatus.RESOLVED);
        resReq.setResolutionSummary("Maintenance crew cleaned up broken glass and replaced barrier safety tape.");
        resReq.setOfficerNotes("Area secure and danger cleared.");
        incidentService.updateStatus(inc4.getId(), resReq, officer1);

        log.info("CampusGuard initial seed completed successfully!");
    }
}

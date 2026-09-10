package com.campusguard.service.impl;

import com.campusguard.dto.PageResponse;
import com.campusguard.dto.UserRequest;
import com.campusguard.dto.UserResponse;
import com.campusguard.entity.Department;
import com.campusguard.entity.User;
import com.campusguard.enums.Role;
import com.campusguard.enums.UserStatus;
import com.campusguard.exception.BadRequestException;
import com.campusguard.exception.ResourceNotFoundException;
import com.campusguard.repository.DepartmentRepository;
import com.campusguard.repository.UserRepository;
import com.campusguard.service.AuditLogService;
import com.campusguard.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserServiceImpl(UserRepository userRepository, DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return PageResponse.from(page.map(this::mapToUserResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email address already in use!");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().isBlank()
                ? request.getPassword().trim() : "CampusGuard@123";

        User user = User.builder()
                .fullName(request.getFullName() != null ? request.getFullName().trim() : "")
                .email(cleanEmail)
                .password(rawPassword)
                .phone(request.getPhone() != null ? request.getPhone().trim() : "")
                .role(request.getRole())
                .department(department)
                .status(request.getStatus() != null ? request.getStatus() : UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        auditLogService.log(null, "USER_CREATED", "User", savedUser.getId().toString(), "Created user: " + savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getRole() != null) user.setRole(request.getRole());

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String cleanEmail = request.getEmail().trim().toLowerCase();
            if (!cleanEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(cleanEmail)) {
                throw new BadRequestException("Email address already in use!");
            }
            user.setEmail(cleanEmail);
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword().trim());
        }

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
            user.setDepartment(dept);
        }

        User updatedUser = userRepository.save(user);

        auditLogService.log(null, "USER_UPDATED", "User", updatedUser.getId().toString(), "Updated user details for: " + updatedUser.getEmail());

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(status);
        User updatedUser = userRepository.save(user);

        auditLogService.log(null, "USER_STATUS_CHANGED", "User", id.toString(),
                "Changed status of user " + user.getEmail() + " to " + status);

        return mapToUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);

        auditLogService.log(null, "USER_DEACTIVATED", "User", id.toString(), "Deactivated user account");
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

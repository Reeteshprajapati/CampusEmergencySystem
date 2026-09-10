package com.campusguard.service.impl;

import com.campusguard.dto.LoginRequest;
import com.campusguard.dto.LoginResponse;
import com.campusguard.dto.RegisterRequest;
import com.campusguard.dto.UserResponse;
import com.campusguard.entity.Department;
import com.campusguard.entity.User;
import com.campusguard.enums.UserStatus;
import com.campusguard.exception.BadRequestException;
import com.campusguard.exception.ResourceNotFoundException;
import com.campusguard.repository.DepartmentRepository;
import com.campusguard.repository.UserRepository;
import com.campusguard.security.JwtTokenProvider;
import com.campusguard.service.AuditLogService;
import com.campusguard.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthServiceImpl(AuthenticationManager authenticationManager, UserRepository userRepository, DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("User account is inactive. Please contact system administrator.");
        }

        auditLogService.log(user, "USER_LOGIN", "User", user.getId().toString(), "User logged in successfully");

        UserResponse userResponse = mapToUserResponse(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("Email address already in use!");
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        User user = User.builder()
                .fullName(request.getFullName() != null ? request.getFullName().trim() : "")
                .email(cleanEmail)
                .password(request.getPassword())
                .phone(request.getPhone())
                .role(request.getRole())
                .department(department)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        auditLogService.log(savedUser, "USER_REGISTER", "User", savedUser.getId().toString(), "New user account registered: " + savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        String cleanEmail = email != null ? email.trim().toLowerCase() : "";
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + cleanEmail));
        return mapToUserResponse(user);
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

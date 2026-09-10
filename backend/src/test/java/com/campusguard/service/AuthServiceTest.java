package com.campusguard.service;

import com.campusguard.dto.LoginRequest;
import com.campusguard.dto.LoginResponse;
import com.campusguard.dto.RegisterRequest;
import com.campusguard.dto.UserResponse;
import com.campusguard.entity.User;
import com.campusguard.enums.Role;
import com.campusguard.enums.UserStatus;
import com.campusguard.exception.BadRequestException;
import com.campusguard.repository.DepartmentRepository;
import com.campusguard.repository.UserRepository;
import com.campusguard.security.JwtTokenProvider;
import com.campusguard.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Test Student")
                .email("student@campusguard.com")
                .password("encoded_pass")
                .phone("+15550192831")
                .role(Role.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void testLoginSuccess() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("student@campusguard.com");
        loginRequest.setPassword("Student@123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock_jwt_token");
        when(userRepository.findByEmail("student@campusguard.com")).thenReturn(Optional.of(sampleUser));

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("student@campusguard.com", response.getUser().getEmail());
        verify(auditLogService, times(1)).log(any(), eq("USER_LOGIN"), any(), any(), any());
    }

    @Test
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("student@campusguard.com");
        registerRequest.setFullName("Duplicate User");
        registerRequest.setPassword("Pass@123");
        registerRequest.setPhone("+15550000000");
        registerRequest.setRole(Role.STUDENT);

        when(userRepository.existsByEmail("student@campusguard.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
    }
}

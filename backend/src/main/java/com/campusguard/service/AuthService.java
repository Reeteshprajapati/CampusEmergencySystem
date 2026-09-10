package com.campusguard.service;

import com.campusguard.dto.LoginRequest;
import com.campusguard.dto.LoginResponse;
import com.campusguard.dto.RegisterRequest;
import com.campusguard.dto.UserResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserResponse register(RegisterRequest request);
    UserResponse getCurrentUser(String email);
}

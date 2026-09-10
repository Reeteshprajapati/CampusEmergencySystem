package com.campusguard.service;

import com.campusguard.dto.PageResponse;
import com.campusguard.dto.UserRequest;
import com.campusguard.dto.UserResponse;
import com.campusguard.enums.Role;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    PageResponse<UserResponse> getAllUsers(Pageable pageable);
    List<UserResponse> getUsersByRole(Role role);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    UserResponse toggleUserStatus(Long id, com.campusguard.enums.UserStatus status);
    void deleteUser(Long id);
}

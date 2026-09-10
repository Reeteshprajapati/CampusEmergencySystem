package com.campusguard.repository;

import com.campusguard.entity.User;
import com.campusguard.enums.Role;
import com.campusguard.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndStatus(Role role, UserStatus status);
}

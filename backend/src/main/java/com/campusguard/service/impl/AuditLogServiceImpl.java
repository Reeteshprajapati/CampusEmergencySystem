package com.campusguard.service.impl;

import com.campusguard.dto.AuditLogDTO;
import com.campusguard.dto.PageResponse;
import com.campusguard.dto.UserResponse;
import com.campusguard.entity.AuditLog;
import com.campusguard.entity.User;
import com.campusguard.repository.AuditLogRepository;
import com.campusguard.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void log(User user, String action, String entityType, String entityId, String description) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();

        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogDTO> getAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page.map(this::mapToDTO));
    }

    private AuditLogDTO mapToDTO(AuditLog log) {
        UserResponse userResponse = null;
        if (log.getUser() != null) {
            userResponse = UserResponse.builder()
                    .id(log.getUser().getId())
                    .fullName(log.getUser().getFullName())
                    .email(log.getUser().getEmail())
                    .role(log.getUser().getRole())
                    .build();
        }

        return AuditLogDTO.builder()
                .id(log.getId())
                .user(userResponse)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}

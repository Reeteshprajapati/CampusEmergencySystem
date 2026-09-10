package com.campusguard.service;

import com.campusguard.dto.AuditLogDTO;
import com.campusguard.dto.PageResponse;
import com.campusguard.entity.User;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    void log(User user, String action, String entityType, String entityId, String description);
    PageResponse<AuditLogDTO> getAuditLogs(Pageable pageable);
}

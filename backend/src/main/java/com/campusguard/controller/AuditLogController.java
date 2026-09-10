package com.campusguard.controller;

import com.campusguard.dto.ApiResponse;
import com.campusguard.dto.AuditLogDTO;
import com.campusguard.dto.PageResponse;
import com.campusguard.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Endpoints for System Audit Logs and Activity Tracking (Admin only)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Get Audit Logs", description = "Retrieve paginated system audit logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDTO>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<AuditLogDTO> auditLogs = auditLogService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", auditLogs));
    }
}

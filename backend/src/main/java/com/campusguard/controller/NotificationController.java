package com.campusguard.controller;

import com.campusguard.dto.ApiResponse;
import com.campusguard.dto.NotificationResponse;
import com.campusguard.dto.PageResponse;
import com.campusguard.entity.User;
import com.campusguard.repository.UserRepository;
import com.campusguard.security.UserPrincipal;
import com.campusguard.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for User Notifications and Alerts (Polled)")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User session invalid"));
    }

    @GetMapping
    @Operation(summary = "Get User Notifications", description = "Retrieve list of user notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        List<NotificationResponse> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get User Notifications (Paged)")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getUserNotificationsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<NotificationResponse> notifications = notificationService.getUserNotificationsPaged(user, pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Notification Count", description = "Polled by UI badge every few seconds")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        long unread = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", unread));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark All Notifications as Read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        User user = getAuthenticatedUser(userPrincipal);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}

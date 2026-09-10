package com.campusguard.service;

import com.campusguard.dto.NotificationResponse;
import com.campusguard.dto.PageResponse;
import com.campusguard.entity.Incident;
import com.campusguard.entity.User;
import com.campusguard.enums.NotificationType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, Incident incident, String title, String message, NotificationType type);
    void notifySecurityTeam(Incident incident, String title, String message, NotificationType type);
    List<NotificationResponse> getUserNotifications(User user);
    PageResponse<NotificationResponse> getUserNotificationsPaged(User user, Pageable pageable);
    long getUnreadCount(User user);
    void markAsRead(Long notificationId, User user);
    void markAllAsRead(User user);
}

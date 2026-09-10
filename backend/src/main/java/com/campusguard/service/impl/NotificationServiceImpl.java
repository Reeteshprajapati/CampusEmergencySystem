package com.campusguard.service.impl;

import com.campusguard.dto.NotificationResponse;
import com.campusguard.dto.PageResponse;
import com.campusguard.entity.Incident;
import com.campusguard.entity.Notification;
import com.campusguard.entity.User;
import com.campusguard.enums.NotificationType;
import com.campusguard.enums.Role;
import com.campusguard.exception.ResourceNotFoundException;
import com.campusguard.repository.NotificationRepository;
import com.campusguard.repository.UserRepository;
import com.campusguard.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void createNotification(User user, Incident incident, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .incident(incident)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifySecurityTeam(Incident incident, String title, String message, NotificationType type) {
        List<User> officersAndAdmins = userRepository.findByRole(Role.SECURITY_OFFICER);
        officersAndAdmins.addAll(userRepository.findByRole(Role.ADMIN));

        for (User user : officersAndAdmins) {
            createNotification(user, incident, title, message, type);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getUserNotificationsPaged(User user, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return PageResponse.from(page.map(this::mapToResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsReadForUser(user);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .incidentId(notification.getIncident() != null ? notification.getIncident().getId() : null)
                .incidentNumber(notification.getIncident() != null ? notification.getIncident().getIncidentNumber() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

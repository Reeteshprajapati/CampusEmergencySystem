-- ====================================================================
-- CampusGuard - Real-Time Campus Safety Management System
-- Full MySQL / SQL Database Setup Script (DDL & Seed Data)
-- ====================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `campusguard_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `campusguard_db`;

-- Disable Foreign Key Checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 2. Table Structures
-- --------------------------------------------------------------------

-- Drop existing tables
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `incident_history`;
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `departments`;

-- Departments Table
CREATE TABLE `departments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table
CREATE TABLE `locations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `building` VARCHAR(100) NOT NULL,
  `area` VARCHAR(100) NOT NULL,
  `floor` VARCHAR(50) DEFAULT NULL,
  `room` VARCHAR(50) DEFAULT NULL,
  `latitude` DOUBLE DEFAULT NULL,
  `longitude` DOUBLE DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users Table
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `role` VARCHAR(30) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  `department_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incidents Table
CREATE TABLE `incidents` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `incident_number` VARCHAR(50) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `severity` VARCHAR(20) NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
  `description` TEXT NOT NULL,
  `location_id` BIGINT DEFAULT NULL,
  `reported_by` BIGINT NOT NULL,
  `assigned_officer` BIGINT DEFAULT NULL,
  `officer_notes` TEXT DEFAULT NULL,
  `resolution_summary` TEXT DEFAULT NULL,
  `latitude` DOUBLE DEFAULT NULL,
  `longitude` DOUBLE DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `closed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_incidents_number` (`incident_number`),
  CONSTRAINT `fk_incidents_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_incidents_reporter` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_incidents_officer` FOREIGN KEY (`assigned_officer`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Incident History Audit Table
CREATE TABLE `incident_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `incident_id` BIGINT NOT NULL,
  `updated_by` BIGINT DEFAULT NULL,
  `previous_status` VARCHAR(30) DEFAULT NULL,
  `new_status` VARCHAR(30) NOT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_history_incident` FOREIGN KEY (`incident_id`) REFERENCES `incidents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_history_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE `notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Audit Logs Table
CREATE TABLE `audit_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT DEFAULT NULL,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enable Foreign Key Checks
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 3. Initial Seed Data (Departments, Locations, Demo Users)
-- --------------------------------------------------------------------

-- Insert Departments
INSERT INTO `departments` (`id`, `name`, `description`, `status`) VALUES
(1, 'Campus Security & Safety', 'Primary emergency response team', 'ACTIVE'),
(2, 'Computer Science & Engineering', 'Academic CS department', 'ACTIVE'),
(3, 'Facilities Management', 'Campus infrastructure and upkeep', 'ACTIVE');

-- Insert Locations
INSERT INTO `locations` (`id`, `building`, `area`, `floor`, `room`, `latitude`, `longitude`) VALUES
(1, 'Engineering Block A', 'North Campus', '2nd Floor', 'Room 204', 12.9716, 77.5946),
(2, 'Science Complex', 'South Campus', '1st Floor', 'Lab 102', 12.9720, 77.5950),
(3, 'Central Library', 'Main Plaza', 'Ground Floor', 'Reading Hall B', 12.9710, 77.5940),
(4, 'Hostel Block 4', 'Residential Zone', '3rd Floor', 'Room 312', 12.9700, 77.5930);

-- Insert Demo Users (Plain text passwords stored directly)
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `role`, `status`, `department_id`) VALUES
(1, 'System Administrator', 'admin@campusguard.com', 'Admin@123', '+1 (555) 019-2831', 'ADMIN', 'ACTIVE', 1),
(2, 'Officer John Marcus', 'security@campusguard.com', 'Security@123', '+1 (555) 014-9922', 'SECURITY_OFFICER', 'ACTIVE', 1),
(3, 'Officer Sarah Jenkins', 'officer.jenkins@campusguard.com', 'Officer@123', '+1 (555) 014-8833', 'SECURITY_OFFICER', 'ACTIVE', 1),
(4, 'Alex Rivera', 'student@campusguard.com', 'Student@123', '+1 (555) 018-7744', 'STUDENT', 'ACTIVE', 2);

-- Insert Sample Incidents
INSERT INTO `incidents` (`id`, `incident_number`, `type`, `severity`, `status`, `description`, `location_id`, `reported_by`, `assigned_officer`, `officer_notes`, `resolution_summary`, `latitude`, `longitude`) VALUES
(1, 'INC-20260908-001', 'MEDICAL_EMERGENCY', 'CRITICAL', 'REPORTED', 'Student collapsed in Room 204 during lecture. Severe shortness of breath and unresponsiveness.', 1, 4, NULL, NULL, NULL, 12.9716, 77.5946),
(2, 'INC-20260908-002', 'FIRE', 'HIGH', 'ACKNOWLEDGED', 'Smoke smell and flickering electrical wiring near Chemistry Lab 102.', 2, 4, NULL, 'Dispatching patrol unit to inspect wiring immediately.', NULL, 12.9720, 77.5950),
(3, 'INC-20260908-003', 'SUSPICIOUS_ACTIVITY', 'MEDIUM', 'IN_PROGRESS', 'Unattended backpack left in Central Library Reading Hall for over 2 hours.', 3, 4, 2, 'Officer Marcus on scene inspecting baggage with K9 unit.', NULL, 12.9710, 77.5940);

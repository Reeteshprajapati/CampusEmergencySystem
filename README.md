# 🚨 CampusGuard — Real-Time Campus Safety & Incident Management System

**CampusGuard** is a production-style, enterprise safety management platform designed for modern college and university campuses. It provides real-time emergency reporting for students, incident dispatching and response management for security personnel, and executive analytics for campus administrators.

> **Architecture Note**: Per system constraints, CampusGuard relies strictly on **REST APIs + periodic background polling** (`usePolling` hook calling `GET /api/incidents/active` every 5 seconds). No WebSockets, Socket.IO, SSE, or Firebase Realtime Databases are used.

---

## 🌟 Key Features

- **🚨 Prominent Emergency Reporting**: One-tap emergency broadcast supporting incident category, severity level, location tagging, description, and **Browser Geolocation API** capture.
- **⚡ Near Real-Time Security Polling**: Security dashboard automatically polls active incidents every 5 seconds with zero WebSocket dependencies and automatic lifecycle cleanup.
- **🔄 Enforced Incident State Machine**:
  `REPORTED` ➔ `ACKNOWLEDGED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED` (or student `CANCELLED`).
- **🛡️ Role-Based Access Control (RBAC)**: Fine-grained Spring Security + JWT authorization for `STUDENT`, `SECURITY_OFFICER`, and `ADMIN`.
- **📊 Executive Analytics & Charts**: Interactive Recharts breakdown of incident trends, severity distributions, building locations, and security officer performance.
- **📜 Complete Audit System & History**: Automatic audit logging (`audit_logs`) and timeline audit history (`incident_history`) for every state change.
- **🐳 One-Command Docker Deployment**: Complete multi-container orchestration with MySQL 8.0, Spring Boot backend, and Nginx-served React frontend.

---

## 🛠️ Technology Stack

### Backend
- **Language & Framework**: Java 17+, Spring Boot 3.2.3
- **Security & Auth**: Spring Security, JWT (JSON Web Tokens), BCrypt Password Encoding
- **Data Persistence**: Spring Data JPA, Hibernate, MySQL 8.0, H2 Embedded Database (Dev)
- **Validation & API Docs**: Bean Validation (`@NotBlank`, `@NotNull`, `@Email`), SpringDoc OpenAPI 3 (Swagger UI)
- **Testing**: JUnit 5, Mockito, Spring Security Test

### Frontend
- **Framework & Build**: React.js, Vite
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons
- **Charts & Visuals**: Recharts
- **HTTP Client**: Axios (with Bearer Token interceptor)
- **Routing**: React Router DOM v6

---

## 🔑 Demo Credentials

The system comes pre-seeded with development demo accounts for instant testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusguard.com` | `Admin@123` | Full System Management, User CRUD, Analytics, Audit Logs |
| **Security Officer** | `security@campusguard.com` | `Security@123` | Live Dashboard Polling, Acknowledge & Assign, Status Updates |
| **Student** | `student@campusguard.com` | `Student@123` | Report Emergency, My Incidents, Track Status |

---

## 🏛️ System Architecture

```
                   ┌─────────────────────┐
                   │      React UI       │
                   │                     │
                   │ Student Dashboard   │
                   │ Security Dashboard  │
                   │ Admin Dashboard     │
                   └──────────┬──────────┘
                              │
                         REST / Axios
                              │
                              ▼
                   ┌─────────────────────┐
                   │   Spring Boot API   │
                   │                     │
                   │ Controllers         │
                   │ Services            │
                   │ Security (JWT)      │
                   │ Validation          │
                   └──────────┬──────────┘
                              │
                       Spring Data JPA
                              │
                              ▼
                   ┌─────────────────────┐
                   │       MySQL / H2    │
                   │                     │
                   │ Users               │
                   │ Incidents           │
                   │ History             │
                   │ Notifications       │
                   │ Audit Logs          │
                   └─────────────────────┘

        React Security Dashboard
                  │
                  │ Every 5 seconds
                  ▼
       GET /api/incidents/active
                  │
                  ▼
            Updated UI
```

---

## 📋 REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate and receive JWT access token.
- `POST /api/auth/register`: Register new student or security account.
- `GET /api/auth/me`: Get authenticated user profile.

### Incident Management (`/api/incidents`)
- `POST /api/incidents`: Report emergency incident.
- `GET /api/incidents`: Query, search, filter, and paginate incidents.
- `GET /api/incidents/active`: **Polled endpoint** returning active incidents sorted by severity.
- `GET /api/incidents/stats`: Retrieve executive dashboard analytics.
- `GET /api/incidents/{id}`: Get detailed incident info.
- `PATCH /api/incidents/{id}/status`: Transition incident status.
- `PATCH /api/incidents/{id}/assign`: Assign security officer.
- `PATCH /api/incidents/{id}/cancel`: Student alert cancellation.
- `GET /api/incidents/{id}/history`: Retrieve timeline audit history.

### User Management (`/api/users`)
- `GET /api/users`: List users (Admin).
- `GET /api/users/officers`: List security officers.
- `POST /api/users`: Create user account (Admin).
- `PUT /api/users/{id}`: Update user (Admin).
- `DELETE /api/users/{id}`: Deactivate user account (Admin).

### Notifications & Locations (`/api/notifications`, `/api/locations`)
- `GET /api/notifications`: List user notifications.
- `GET /api/notifications/unread-count`: **Polled endpoint** for unread badge count.
- `PATCH /api/notifications/read-all`: Mark all notifications as read.
- `GET /api/locations`: List campus buildings and rooms.

---

## 🚀 Running the Project Locally

### 1. Run Backend Service
```powershell
cd backend
# Runs on H2 memory database out-of-the-box (no MySQL setup required for dev!)
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- H2 Database Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:campusguarddb`, username: `sa`, password: empty)

### 2. Run Backend Unit & Integration Tests
```powershell
cd backend
mvn clean test
```

### 3. Run Frontend Service
```powershell
cd frontend
npm install
npm run dev
```
- App URL: `http://localhost:3000`

---

## 🐳 Docker Setup

Run the entire fullstack application (MySQL database + Spring Boot API + Nginx React Frontend) with Docker Compose:

```powershell
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost` (Port 80)
- **Backend REST API**: `http://localhost:8080` (Port 8080)
- **MySQL Database**: `localhost:3306`

---

## 💼 Business Rules Implemented

1. **Student Privilege**: Students can report incidents and view only their own reported incidents.
2. **Alert Cancellation**: Students can cancel their own alerts if they are still in `REPORTED` or `ACKNOWLEDGED` state.
3. **Security Privilege**: Security Officers can view all active incidents, acknowledge new alerts, assign officers, and update response notes.
4. **Resolution Rule**: Only the assigned officer or an Admin can mark an incident as `RESOLVED`.
5. **Closure Rule**: Only an Admin can transition a resolved incident to `CLOSED`.
6. **Priority Ordering**: Active incidents automatically sort `CRITICAL` > `HIGH` > `MEDIUM` > `LOW` emergencies.
7. **Audit Traceability**: Every status change creates an `incident_history` entry and system `audit_log`.

---

## 📜 License
CampusGuard is released under the [Apache 2.0 License](LICENSE).

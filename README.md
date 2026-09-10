# 🚨 CampusGuard — Real-Time Campus Safety & Incident Management System

**CampusGuard** is a production-style, enterprise safety management platform designed for modern college and university campuses. It provides real-time emergency reporting for students, incident dispatching and response management for security personnel, and executive analytics for campus administrators.

> **Architecture Note**: Per system constraints, CampusGuard relies strictly on **REST APIs + periodic background polling** (`usePolling` hook calling `GET /api/incidents/active` every 5 seconds). No WebSockets, Socket.IO, SSE, or Firebase Realtime Databases are used.

---

## 🌐 Live Deployments & Cloud URLs

| Component | Platform | URL / Endpoint |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | `https://campussecuritysystem.vercel.app` |
| **Backend REST API** | Render | `https://campusemergencysystem-2.onrender.com` |
| **Swagger UI Docs** | Render | `https://campusemergencysystem-2.onrender.com/swagger-ui.html` |
| **H2 Web Database Console** | Render | `https://campusemergencysystem-2.onrender.com/h2-console` |

---

## 🌟 Key Features

- **🚨 Prominent Emergency Reporting**: One-tap emergency broadcast supporting incident category, severity level, location tagging, description, and **Browser Geolocation API** capture.
- **⚡ Near Real-Time Security Polling**: Security dashboard automatically polls active incidents every 5 seconds with zero WebSocket dependencies and automatic lifecycle cleanup.
- **🔄 Enforced Incident State Machine**:
  `REPORTED` ➔ `ACKNOWLEDGED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED` (or student `CANCELLED`).
- **🛡️ Role-Based Access Control (RBAC)**: Fine-grained Spring Security + JWT authorization for `STUDENT`, `SECURITY_OFFICER`, and `ADMIN`.
- **📊 Executive Analytics & Charts**: Interactive Recharts breakdown of incident trends, severity distributions, building locations, and security officer performance.
- **📜 Complete Audit System & History**: Automatic audit logging (`audit_logs`) and timeline audit history (`incident_history`) for every state change.
- **🐳 Multi-Platform Cloud Deployment**: Pre-configured Docker setup for Render (Backend) and static SPA configuration for Vercel (Frontend).

---

## 🔑 Demo Credentials

The system comes pre-seeded with development demo accounts for instant testing:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campusguard.com` | `Admin@123` | Full System Management, User CRUD, Analytics, Audit Logs |
| **Security Officer** | `security@campusguard.com` | `Security@123` | Live Dashboard Polling, Acknowledge & Assign, Status Updates |
| **Student** | `student@campusguard.com` | `Student@123` | Report Emergency, My Incidents, Track Status |

---

## 🗄️ Checking Registered Users & Database

There are **two ways** to view newly registered users and database records:

### 1. In-App Admin Dashboard (Easiest)
1. Log in with the **Admin Account** (`admin@campusguard.com` / `Admin@123`).
2. Navigate to **User Management** (`/admin/users`).
3. View, create, update, or deactivate any student or security officer account in real-time.

### 2. Live H2 Database Console
1. Open `https://campusemergencysystem-2.onrender.com/h2-console` in your browser.
2. Enter the connection settings:
   - **Driver Class**: `org.h2.Driver`
   - **JDBC URL**: `jdbc:h2:file:./data/campusguarddb`
   - **User Name**: `sa`
   - **Password**: *(leave blank)*
3. Click **Connect** and run SQL queries like:
   ```sql
   SELECT * FROM USERS;
   SELECT * FROM INCIDENTS;
   ```

---

## ⚙️ Cloud Deployment & Environment Variables Guide

### 1. Backend Deployment (Render.com)
The backend is deployed on **Render** using the root multi-stage `Dockerfile` and `render.yaml`.

- **Build Runtime**: Docker
- **Build Context**: `./`
- **Environment Variables**:
  - `PORT`: `8080`
  - `SPRING_PROFILES_ACTIVE`: `dev`

### 2. Frontend Deployment (Vercel)
The frontend React application is deployed on **Vercel**.

- **Framework Preset**: Vite
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Environment Variables**:
  - **Type**: `Config` *(Not Secret)*
  - **Key**: `VITE_API_BASE_URL`
  - **Value**: `https://campusemergencysystem-2.onrender.com/api`

---

## 🛠️ Technology Stack

### Backend
- **Language & Framework**: Java 17+, Spring Boot 3.2.3
- **Security & Auth**: Spring Security, JWT (JSON Web Tokens), BCrypt Password Encoding
- **Data Persistence**: Spring Data JPA, Hibernate, MySQL 8.0 / Embedded H2 Database
- **Validation & API Docs**: Bean Validation, SpringDoc OpenAPI 3 (Swagger UI)
- **Testing**: JUnit 5, Mockito, Spring Security Test

### Frontend
- **Framework & Build**: React.js, Vite
- **Styling & UI**: Tailwind CSS v4, Lucide React Icons
- **Charts & Visuals**: Recharts
- **HTTP Client**: Axios (with Bearer Token interceptor)
- **Routing**: React Router DOM v6 (with SPA `vercel.json` rewrites)

---

## 🚀 Running the Project Locally

### 1. Run Backend Service
```powershell
cd backend
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/campusguarddb`, username: `sa`, password: empty)

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

Run fullstack application via Docker Compose:

```powershell
docker-compose up --build -d
```

- **Frontend Application**: `http://localhost` (Port 80)
- **Backend REST API**: `http://localhost:8080` (Port 8080)
- **MySQL Database**: `localhost:3306`

---

## 📜 License
CampusGuard is released under the [Apache 2.0 License](LICENSE).

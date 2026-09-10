import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { ReportEmergency } from '../pages/student/ReportEmergency';
import { MyIncidents } from '../pages/student/MyIncidents';

// Security Pages
import { SecurityDashboard } from '../pages/security/SecurityDashboard';
import { ActiveIncidents } from '../pages/security/ActiveIncidents';
import { IncidentDetailsPage } from '../pages/security/IncidentDetailsPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersPage } from '../pages/admin/UsersPage';
import { LocationsPage } from '../pages/admin/LocationsPage';
import { ReportsPage, SettingsPage } from '../pages/admin/ReportsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';

// Root redirect handler based on user role
const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RootRedirect />} />

        {/* Student Routes */}
        <Route
          path="student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/report-emergency"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ReportEmergency />
            </ProtectedRoute>
          }
        />
        <Route
          path="student/my-incidents"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <MyIncidents />
            </ProtectedRoute>
          }
        />

        {/* Security Officer & Admin Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="incidents/active"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="incidents/my-assigned"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <ActiveIncidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="incidents/resolved"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <ActiveIncidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="incidents/history"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <ActiveIncidents />
            </ProtectedRoute>
          }
        />
        <Route
          path="incidents/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'SECURITY_OFFICER', 'ADMIN']}>
              <IncidentDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard & Controls */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/security-team"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="locations"
          element={
            <ProtectedRoute allowedRoles={['SECURITY_OFFICER', 'ADMIN']}>
              <LocationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* General Notifications & Profile */}
        <Route path="notifications" element={<ActiveIncidents />} />
        <Route path="profile" element={<StudentDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

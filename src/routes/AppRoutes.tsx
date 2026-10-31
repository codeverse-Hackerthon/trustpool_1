import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { OwnerLayout } from '../layouts/OwnerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { DiscoverResources } from '../pages/student/DiscoverResources';
import { ResourceDetails } from '../pages/student/ResourceDetails';
import { MyBookings } from '../pages/student/MyBookings';
import { FairAllocation } from '../pages/student/FairAllocation';
import { QRAccess } from '../pages/student/QRAccess';
import { ConditionReports } from '../pages/student/ConditionReports';
import { BookingHistory } from '../pages/student/BookingHistory';

// Owner Pages
import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { MyResources } from '../pages/owner/MyResources';
import { BookingRequests } from '../pages/owner/BookingRequests';
import { ActiveBookings } from '../pages/owner/ActiveBookings';
import { ReturnsPage } from '../pages/owner/ReturnsPage';
import { OwnerIncidents } from '../pages/owner/OwnerIncidents';
import { OwnerAnalytics } from '../pages/owner/OwnerAnalytics';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { VerificationPage } from '../pages/admin/VerificationPage';
import { ResourceMonitoring } from '../pages/admin/ResourceMonitoring';
import { BookingMonitoring } from '../pages/admin/BookingMonitoring';
import { AdminIncidents } from '../pages/admin/AdminIncidents';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';

// Not Found
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ================= STUDENT ROUTES ================= */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="resources" element={<DiscoverResources />} />
        <Route path="resources/:id" element={<ResourceDetails />} />
        <Route path="bookings" element={<MyBookings />} />
        <Route path="allocation" element={<FairAllocation />} />
        <Route path="qr-access" element={<QRAccess />} />
        <Route path="condition-reports" element={<ConditionReports />} />
        <Route path="history" element={<BookingHistory />} />
      </Route>

      {/* ================= OWNER ROUTES ================= */}
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<Navigate to="/owner/dashboard" replace />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="resources" element={<MyResources />} />
        <Route path="requests" element={<BookingRequests />} />
        <Route path="active-bookings" element={<ActiveBookings />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="incidents" element={<OwnerIncidents />} />
        <Route path="analytics" element={<OwnerAnalytics />} />
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="resources" element={<ResourceMonitoring />} />
        <Route path="bookings" element={<BookingMonitoring />} />
        <Route path="incidents" element={<AdminIncidents />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* ================= 404 CATCH-ALL ================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};


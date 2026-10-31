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
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage';
import { EmailVerificationPage } from '../pages/public/EmailVerificationPage';
import { ProtectedRoute } from './ProtectedRoute';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { DiscoverResources } from '../pages/student/DiscoverResources';
import { ResourceDetails } from '../pages/student/ResourceDetails';
import { MyBookings } from '../pages/student/MyBookings';
import { FairAllocation } from '../pages/student/FairAllocation';
import { QRAccess } from '../pages/student/QRAccess';
import { ConditionReports } from '../pages/student/ConditionReports';
import { BookingHistory } from '../pages/student/BookingHistory';
import { StudentIncidents } from '../pages/student/StudentIncidents';

// Owner Pages
import { OwnerDashboard } from '../pages/owner/OwnerDashboard';
import { MyResources } from '../pages/owner/MyResources';
import { AddResourcePage } from '../pages/owner/AddResourcePage';
import { BookingRequests } from '../pages/owner/BookingRequests';
import { ActiveBookings } from '../pages/owner/ActiveBookings';
import { ReturnsPage } from '../pages/owner/ReturnsPage';
import { OwnerAvailability } from '../pages/owner/OwnerAvailability';
import { OwnerIncidents } from '../pages/owner/OwnerIncidents';
import { OwnerAnalytics } from '../pages/owner/OwnerAnalytics';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { VerificationPage } from '../pages/admin/VerificationPage';
import { ResourceMonitoring } from '../pages/admin/ResourceMonitoring';
import { BookingMonitoring } from '../pages/admin/BookingMonitoring';
import { AdminIncidents } from '../pages/admin/AdminIncidents';
import { DisputesPage } from '../pages/admin/DisputesPage';
import { AuditLogs } from '../pages/admin/AuditLogs';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Shared Pages
import { ProfilePage } from '../pages/common/ProfilePage';
import { NotificationsPage } from '../pages/common/NotificationsPage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ================= STUDENT ROUTES ================= */}
      <Route element={<ProtectedRoute allow={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="resources" element={<DiscoverResources />} />
          <Route path="explore" element={<Navigate to="/student/resources" replace />} />
          <Route path="resources/:id" element={<ResourceDetails />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="my-bookings" element={<Navigate to="/student/bookings" replace />} />
          <Route path="active-bookings" element={<MyBookings />} />
          <Route path="waitlist" element={<FairAllocation />} />
          <Route path="allocation" element={<FairAllocation />} />
          <Route path="qr-access" element={<QRAccess />} />
          <Route path="qr-checkin" element={<QRAccess />} />
          <Route path="condition-reports" element={<ConditionReports />} />
          <Route path="history" element={<BookingHistory />} />
          <Route path="incidents" element={<StudentIncidents />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ================= OWNER ROUTES ================= */}
      <Route element={<ProtectedRoute allow={['owner']} />}>
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="resources" element={<MyResources />} />
          <Route path="resources/add" element={<AddResourcePage />} />
          <Route path="resources/:id" element={<AddResourcePage />} />
          <Route path="requests" element={<BookingRequests />} />
          <Route path="active-bookings" element={<ActiveBookings />} />
          <Route path="bookings" element={<ActiveBookings />} />
          <Route path="active-resources" element={<ActiveBookings />} />
          <Route path="availability" element={<OwnerAvailability />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="incidents" element={<OwnerIncidents />} />
          <Route path="analytics" element={<OwnerAnalytics />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ================= ADMIN ROUTES ================= */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="owners" element={<UserManagement />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="verifications" element={<VerificationPage />} />
          <Route path="resources" element={<ResourceMonitoring />} />
          <Route path="bookings" element={<BookingMonitoring />} />
          <Route path="incidents" element={<AdminIncidents />} />
          <Route path="disputes" element={<DisputesPage />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* ================= 404 CATCH-ALL ================= */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

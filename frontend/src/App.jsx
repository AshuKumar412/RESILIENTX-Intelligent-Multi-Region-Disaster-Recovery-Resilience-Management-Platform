import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DRProvider } from './context/DRContext';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { DashboardPage } from './pages/DashboardPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { RegionsPage } from './pages/RegionsPage';
import { RecoveryPlansPage } from './pages/RecoveryPlansPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { RecoveryOperationsPage } from './pages/RecoveryOperationsPage';
import { DataContinuityPage } from './pages/DataContinuityPage';
import { MetricsPage } from './pages/MetricsPage';
import { RecoveryHistoryPage } from './pages/RecoveryHistoryPage';
import { AuditPage } from './pages/AuditPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ReadinessPage } from './pages/ReadinessPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <DRProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Enterprise Control Plane Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/regions" element={<RegionsPage />} />
              <Route path="/recovery-plans" element={<RecoveryPlansPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/recovery-operations" element={<RecoveryOperationsPage />} />
              <Route path="/data-continuity" element={<DataContinuityPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/recovery-history" element={<RecoveryHistoryPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DRProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

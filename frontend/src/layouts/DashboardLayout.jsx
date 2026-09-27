import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { HumanApprovalModal } from '../components/HumanApprovalModal';
import { SimulateFailureModal } from '../components/SimulateFailureModal';
import { PresenterGuidedTour } from '../components/PresenterGuidedTour';
import { FailbackModal } from '../components/FailbackModal';
import { Shield, RefreshCw } from 'lucide-react';

export const DashboardLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 animate-pulse">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Validating Enterprise Control Plane Session...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive DR Modals */}
      <HumanApprovalModal />
      <SimulateFailureModal />
      <FailbackModal />
      <PresenterGuidedTour />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDR } from '../context/DRContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Play, RefreshCw, AlertTriangle, User, LogOut, Settings, ChevronDown, CheckCircle2 } from 'lucide-react';

export const Header = () => {
  const { isSimulatingFailure, setIsSimulateModalOpen, setDemoTourActive, refreshState } = useDR();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const primaryRole = (user?.roles && user.roles.length > 0) 
    ? user.roles[0].replace('ROLE_', '') 
    : 'OPERATOR';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg select-none">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg tracking-wider text-white">RESILIENT<span className="text-cyan-400">X</span></span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                CONTROL PLANE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Intelligent Multi-Region Disaster Recovery</p>
          </div>
        </Link>

        {/* Global Business System Status */}
        <div className="hidden lg:flex items-center space-x-2 pl-6 border-l border-slate-800">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-amber-400">SYSTEM STATUS: UNVERIFIED</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Resilience Engine Status Badge */}
        <div className="hidden sm:flex items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 space-x-2 text-xs font-mono">
          <span className="text-slate-400">RESILIENCE ENGINE:</span>
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            UNVERIFIED
          </span>
        </div>

        {/* 5-Min Presenter Guided Demo Button */}
        <button
          onClick={() => setDemoTourActive(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-medium shadow-md shadow-purple-500/20 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="hidden md:inline">5-Min Demo Tour</span>
          <span className="md:hidden">Demo</span>
        </button>

        {/* Simulate Regional Incident Button */}
        <button
          onClick={() => setIsSimulateModalOpen(true)}
          disabled={isSimulatingFailure}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">SIMULATE INCIDENT</span>
          <span className="md:hidden">Simulate</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={refreshState}
          title="Refresh Telemetry &amp; State"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User profile dropdown */}
        <div className="relative pl-3 border-l border-slate-800" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-cyan-400/30">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'OP'}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs text-white font-semibold block leading-tight">
                {user?.fullName || user?.username || 'Operator'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 block leading-tight">
                {primaryRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user?.fullName || user?.username || 'Operator'}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email || 'operator@resilientx.io'}</p>
                <div className="mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {primaryRole}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/audit"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Audit Logs</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

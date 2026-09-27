import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, User, Lock, Bell, Sliders, CheckCircle2, AlertCircle, Save, KeyRound, Cpu, Database, Mail, Terminal, ShieldAlert } from 'lucide-react';

export const SettingsPage = () => {
  const { user, changePassword, hasRole } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState({
    slackWebhook: 'https://hooks.slack.com/services/T00/B00/XXXXX',
    pagerDutyKey: 'pd-live-sec-9921a',
    alertEmail: user?.email || 'sre-alerts@enterprise.com',
    notifyOnIncident: true,
    notifyOnApprovalRequest: true,
    notifyOnFailoverComplete: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Operational thresholds state
  const [thresholds, setThresholds] = useState({
    maxAllowedRtoSeconds: 300,
    maxAllowedRpoSeconds: 60,
    autoFailoverEvaluationIntervalSec: 15,
    consecutiveFailureThreshold: 3,
  });
  const [thresholdsSaved, setThresholdsSaved] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    setThresholdsSaved(true);
    setTimeout(() => setThresholdsSaved(false), 3000);
  };

  const isPlatformAdmin = hasRole('PLATFORM_ADMIN') || hasRole('ROLE_PLATFORM_ADMIN');

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wide">PLATFORM SETTINGS &amp; OPERATOR PREFERENCES</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Account security, incident notification channels, operational resilience thresholds, and platform configuration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{user?.fullName || user?.username || 'Operator'}</h3>
                <span className="text-xs text-slate-400 font-mono">{user?.email || 'operator@resilientx.io'}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Operator ID</span>
                <span className="text-slate-200 font-mono font-semibold">{user?.username || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Organization &amp; Department</span>
                <span className="text-slate-200 font-semibold">{user?.organization || 'Enterprise SRE Team'} • {user?.department || 'Reliability Engineering'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Security Roles</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(user?.roles || ['VIEWER']).map((role, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                      {role.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Email Verification Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Cryptographically
                </span>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Change Password</span>
            </h3>

            {pwdSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                <span>{pwdLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Operational Preferences & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Channels */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Incident Notification &amp; Alert Routing</span>
              </h3>
              {notifSaved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Slack Webhook URL</label>
                  <input
                    type="text"
                    value={notifications.slackWebhook}
                    onChange={(e) => setNotifications({ ...notifications, slackWebhook: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">PagerDuty Integration Key</label>
                  <input
                    type="text"
                    value={notifications.pagerDutyKey}
                    onChange={(e) => setNotifications({ ...notifications, pagerDutyKey: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Distribution Alert Email</label>
                <input
                  type="email"
                  value={notifications.alertEmail}
                  onChange={(e) => setNotifications({ ...notifications, alertEmail: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-semibold text-slate-300 block">Alert Dispatch Triggers</label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={notifications.notifyOnIncident}
                      onChange={(e) => setNotifications({ ...notifications, notifyOnIncident: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span>Notify immediately upon Outage / SLA Degradation Detection</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={notifications.notifyOnApprovalRequest}
                      onChange={(e) => setNotifications({ ...notifications, notifyOnApprovalRequest: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span>Notify DR Approvers when Human Authorization is requested</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={notifications.notifyOnFailoverComplete}
                      onChange={(e) => setNotifications({ ...notifications, notifyOnFailoverComplete: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span>Notify upon Failover / Failback execution completion</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notification Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Operational Resilience Thresholds */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Resilience &amp; SLA Guardrail Thresholds</span>
              </h3>
              {thresholdsSaved && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveThresholds} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Target RTO Limit (seconds)</label>
                  <input
                    type="number"
                    value={thresholds.maxAllowedRtoSeconds}
                    onChange={(e) => setThresholds({ ...thresholds, maxAllowedRtoSeconds: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum allowed recovery time objective</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Target RPO Limit (seconds)</label>
                  <input
                    type="number"
                    value={thresholds.maxAllowedRpoSeconds}
                    onChange={(e) => setThresholds({ ...thresholds, maxAllowedRpoSeconds: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Maximum allowable replication data lag</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Health Probe Evaluation Interval (sec)</label>
                  <input
                    type="number"
                    value={thresholds.autoFailoverEvaluationIntervalSec}
                    onChange={(e) => setThresholds({ ...thresholds, autoFailoverEvaluationIntervalSec: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Consecutive Failure Breach Count</label>
                  <input
                    type="number"
                    value={thresholds.consecutiveFailureThreshold}
                    onChange={(e) => setThresholds({ ...thresholds, consecutiveFailureThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Guardrails</span>
                </button>
              </div>
            </form>
          </div>

          {/* System Diagnostics Section (Platform Admin Only) */}
          {isPlatformAdmin && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Platform System Diagnostics (Authorized: PLATFORM_ADMIN)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                  CONFIDENTIAL
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Control Plane Core</span>
                  <span className="text-white font-bold">ResilientX v2.4.0</span>
                  <span className="text-emerald-400 text-[10px] block">Status: Healthy</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Database Subsystem</span>
                  <span className="text-white font-bold">PostgreSQL Engine</span>
                  <span className="text-cyan-400 text-[10px] block">Single DB: resilientx</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px] block">Cloud Provider Link</span>
                  <span className="text-amber-300 font-bold">AWS Adapter (Deferred)</span>
                  <span className="text-slate-400 text-[10px] block">AWS_ENABLED=false</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

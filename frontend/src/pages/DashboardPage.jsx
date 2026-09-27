import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDR } from '../context/DRContext';
import { LiveTopologyMap } from '../components/LiveTopologyMap';
import {
  Layers,
  Activity,
  AlertOctagon,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Flame,
  RotateCcw,
  Sparkles,
  Database,
  ShieldAlert
} from 'lucide-react';
import { organizationService, recoveryService, dataContinuityService } from '../services/allServices';

export const DashboardPage = () => {
  const { activeRecovery, setIsSimulateModalOpen, setIsFailbackModalOpen, runDrill } = useDR();
  const [apps, setApps] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [metricsSummary, setMetricsSummary] = useState(null);
  const [latestTxn, setLatestTxn] = useState(null);
  const [dataError, setDataError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    organizationService.getApplications().then(setApps).catch(() => setDataError(true));
    recoveryService.getIncidents().then(setIncidents).catch(() => setDataError(true));
    recoveryService.getMetricsSummary().then(setMetricsSummary).catch(() => setDataError(true));
    dataContinuityService.getTransactions().then(txns => {
      if (txns && txns.length > 0) setLatestTxn(txns[0]);
      else setLatestTxn(null);
    }).catch(() => setDataError(true));
  }, []);

  const formatSeconds = (sec) => {
    if (sec === null || sec === undefined) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  const activeIncidentsCount = incidents.filter(i => i.status === 'OPEN' || i.status === 'RECOVERING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="text-xl font-black tracking-tight text-white">RESILIENT<span className="text-brand-500">X</span> CONTROL PLANE</span>
            <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {dataError ? 'UNAVAILABLE' : 'STATUS UNVERIFIED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-Region Pilot Light Disaster Recovery Orchestration</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>SIMULATE FAILURE</span>
          </button>
          <button
            onClick={runDrill}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>RUN DR DRILL</span>
          </button>
          <button
            onClick={() => setIsFailbackModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>FAILBACK</span>
          </button>
        </div>
      </div>

      {dataError && (
        <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          Operational information could not be retrieved. Displayed values may be incomplete.
        </div>
      )}

      {/* Metrics Row - Derived Strictly from Database */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Protected Workloads</span>
            <Layers className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{dataError ? '—' : apps.length}</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            {dataError ? 'Data unavailable' : (apps.length > 0 ? `${apps[0].tier || 'Not classified'} Protected` : 'No applications configured')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Incidents</span>
            <AlertOctagon className={`w-4 h-4 ${activeIncidentsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {dataError ? '—' : activeIncidentsCount}
          </div>
          <span className="text-[11px] font-mono mt-1 block text-slate-400">
            {dataError ? 'Data unavailable' : (activeIncidentsCount === 0 ? 'No active incidents' : `${activeIncidentsCount} requiring triage`)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Target RTO / RPO SLA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white">Not available</div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">No verified policy data</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Measured RTO (Last Operation)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metricsSummary?.latestRtoSeconds !== null && metricsSummary?.latestRtoSeconds !== undefined
              ? formatSeconds(metricsSummary.latestRtoSeconds)
              : <span className="text-sm font-normal text-slate-500">No RTO data available</span>}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            {metricsSummary?.rtoSlaCompliancePercentage !== null && metricsSummary?.rtoSlaCompliancePercentage !== undefined
              ? `${metricsSummary.rtoSlaCompliancePercentage}% SLA Compliance`
              : 'No recovery operations'}
          </span>
        </div>
      </div>

      {/* Main Live Topology View */}
      <LiveTopologyMap />

      {/* Two Column Section: Active Recoveries & Quick Workload Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active DR Operation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">ACTIVE RECOVERY PIPELINE</h3>
            </div>
            <button
              onClick={() => navigate('/recovery-operations')}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeRecovery ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-white">{activeRecovery.operationCode}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{activeRecovery.operationType} &bull; {activeRecovery.executionMode}</span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                  activeRecovery.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : activeRecovery.status === 'WAITING_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                    : 'bg-brand-500/20 text-brand-400'
                }`}>
                  {activeRecovery.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">Current Phase: <strong className="text-brand-400">{activeRecovery.currentPhase}</strong></p>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              No recovery operations active. System is in steady-state standby.
            </div>
          )}
        </div>

        {/* Data Continuity Ledger Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">DATA CONTINUITY LEDGER</h3>
            </div>
            <button
              onClick={() => navigate('/data-continuity')}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>Manage Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestTxn ? (
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Sample Customer:</span>
                <span className="text-white font-bold">{latestTxn.customerName || 'Not available'} ({latestTxn.customerId || 'Not available'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latest Transaction:</span>
                <span className="text-emerald-400 font-bold">{latestTxn.id} ({latestTxn.currency} {latestTxn.amount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Integrity Checksum:</span>
                <span className="text-slate-300 font-mono text-[10px] truncate max-w-[200px]">{latestTxn.checksumHash || 'Calculated on commit'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs font-mono">
              Replication data unavailable. No transactions recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

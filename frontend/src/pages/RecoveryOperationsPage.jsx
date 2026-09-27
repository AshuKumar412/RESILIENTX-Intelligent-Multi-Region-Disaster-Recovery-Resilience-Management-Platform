import React, { useState, useEffect } from 'react';
import { useDR } from '../context/DRContext';
import { recoveryService } from '../services/allServices';
import {
  Activity,
  Flame,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Server,
  ArrowRight,
  Database,
  Radio,
  Play,
  Check,
  AlertCircle
} from 'lucide-react';

export const RecoveryOperationsPage = () => {
  const {
    activeRecovery,
    setIsSimulateModalOpen,
    setIsApprovalModalOpen,
    setIsFailbackModalOpen,
    runDrill,
    regions,
    mode
  } = useDR();

  const [recoveries, setRecoveries] = useState([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    recoveryService.getRecoveries().then(setRecoveries).catch(() => setLoadError(true));
  }, [activeRecovery]);

  const steps = activeRecovery?.steps || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">DISASTER RECOVERY CONTROL CENTER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Deterministic State-Machine Failover &amp; Orchestration Engine</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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

      {loadError && (
        <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          Unable to retrieve recovery operations.
        </div>
      )}

      {/* Active Pipeline Status Banner */}
      {activeRecovery ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-mono font-black text-white">{activeRecovery.operationCode}</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  activeRecovery.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : activeRecovery.status === 'WAITING_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                    : 'bg-brand-500/20 text-brand-400'
                }`}>
                  {activeRecovery.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Type: {activeRecovery.operationType} &bull; Phase: <strong className="text-brand-400">{activeRecovery.currentPhase}</strong>
              </p>
            </div>

            {activeRecovery.status === 'WAITING_APPROVAL' && (
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 animate-bounce cursor-pointer flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>AUTHORIZE RECOVERY GATE</span>
              </button>
            )}
          </div>

          {/* Sequential 7-Phase Runbook Tracker */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              RECOVERY RUNBOOK EXECUTION PHASES
            </h3>

            <div className="space-y-2">
              {steps.map((step) => {
                const isCompleted = step.status === 'COMPLETED';
                const isRunning = step.status === 'RUNNING';
                const isWaiting = step.status === 'WAITING_APPROVAL';

                return (
                  <div
                    key={step.id || step.stepNumber}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-mono transition-all ${
                      isCompleted
                        ? 'bg-slate-950/90 border-emerald-500/30 text-slate-200'
                        : isRunning
                        ? 'bg-brand-950/20 border-brand-500/50 text-white shadow-lg'
                        : isWaiting
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isRunning
                          ? 'bg-brand-500 text-white animate-pulse'
                          : isWaiting
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : step.stepNumber}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{step.name}</span>
                        {step.details && <span className="text-[11px] text-slate-400 block">{step.details}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted ? 'text-emerald-400' : isRunning ? 'text-brand-400' : isWaiting ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {step.status}
                      </span>
                      {step.durationMs && (
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {(step.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono space-y-3">
          <Activity className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Active Recovery Operations</h3>
          <p className="max-w-md mx-auto text-slate-400">
            The platform is in steady-state standby. To test disaster recovery failover, click "SIMULATE FAILURE" or "RUN DR DRILL" above.
          </p>
        </div>
      )}

      {/* Historical Operations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 pb-3 border-b border-slate-800">
          ALL RECOVERY OPERATIONS IN DATABASE ({recoveries.length})
        </h3>

        {!loadError && recoveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">CODE</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">ACTUAL RTO</th>
                  <th className="p-3">ACTUAL RPO</th>
                  <th className="p-3">STARTED</th>
                  <th className="p-3">COMPLETED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recoveries.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-850/50">
                    <td className="p-3 font-bold text-white">{op.operationCode}</td>
                    <td className="p-3 text-slate-300">{op.operationType}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        op.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'
                      }`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400">{op.actualRtoSeconds ? `${op.actualRtoSeconds}s` : '—'}</td>
                    <td className="p-3 text-emerald-400">{op.actualRpoSeconds !== null && op.actualRpoSeconds !== undefined ? `${op.actualRpoSeconds}s` : '—'}</td>
                    <td className="p-3 text-slate-400">{op.startedAt ? new Date(op.startedAt).toLocaleTimeString() : '—'}</td>
                    <td className="p-3 text-slate-400">{op.completedAt ? new Date(op.completedAt).toLocaleTimeString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
            No recovery operations recorded in database.
          </div>
        )}
      </div>
    </div>
  );
};

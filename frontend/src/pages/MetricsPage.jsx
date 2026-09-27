import React, { useState, useEffect } from 'react';
import { useDR } from '../context/DRContext';
import { Gauge, Clock, CheckCircle2, ShieldCheck, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { recoveryService } from '../services/allServices';

export const MetricsPage = () => {
  const { activeRecovery, setIsFailbackModalOpen } = useDR();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    recoveryService.getMetricsSummary().then(setSummary).catch(() => setSummary(null));
  }, [activeRecovery]);

  const actualRto = activeRecovery?.actualRtoSeconds ?? summary?.latestRtoSeconds ?? null;
  const actualRpo = activeRecovery?.actualRpoSeconds ?? summary?.latestRpoSeconds ?? null;

  const formatSecs = (totalSecs) => {
    if (totalSecs === null || totalSecs === undefined) return null;
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Gauge className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">DISASTER RECOVERY METRICS &amp; SLA PERFORMANCE</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">Calculated Recovery Time Objective (RTO) and Recovery Point Objective (RPO) from persisted timestamps</p>
        </div>

        <button
          onClick={() => setIsFailbackModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/30 transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>EXECUTE FAILBACK</span>
        </button>
      </div>

      {/* Target vs Actual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* RTO CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-400">RECOVERY TIME OBJECTIVE (RTO)</span>
            {actualRto !== null ? (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-400">
                {summary?.rtoSlaCompliancePercentage !== null ? `${summary?.rtoSlaCompliancePercentage}% COMPLIANT` : 'CALCULATED'}
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-slate-800 text-slate-400">
                NO DATA
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Target SLA:</span>
              <span className="text-2xl font-bold font-mono text-slate-300">15m 00s</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Actual Measured RTO:</span>
              {actualRto !== null ? (
                <span className="text-3xl font-black font-mono text-emerald-400">{formatSecs(actualRto)}</span>
              ) : (
                <span className="text-lg font-bold font-mono text-slate-500">No RTO data available</span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 font-mono">
            {actualRto !== null
              ? `Actual RTO = Recovery Verified At (${activeRecovery?.completedAt ? new Date(activeRecovery.completedAt).toLocaleTimeString() : 'persisted'}) minus Incident Detected At (${activeRecovery?.startedAt ? new Date(activeRecovery.startedAt).toLocaleTimeString() : 'persisted'}).`
              : 'Calculation: Actual RTO = Recovery Verified At minus Incident Detected At (Requires completed operation).'}
          </p>
        </div>

        {/* RPO CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-400">RECOVERY POINT OBJECTIVE (RPO)</span>
            {actualRpo !== null ? (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-400">
                CALCULATED
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-slate-800 text-slate-400">
                NO DATA
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Target SLA:</span>
              <span className="text-2xl font-bold font-mono text-slate-300">05m 00s</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Actual Measured RPO:</span>
              {actualRpo !== null ? (
                <span className="text-3xl font-black font-mono text-emerald-400">{formatSecs(actualRpo)}</span>
              ) : (
                <span className="text-lg font-bold font-mono text-slate-500">Replication data unavailable</span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 font-mono">
            Calculation: Actual RPO = Failure Detected At minus Last Successful Replication Checkpoint Timestamp.
          </p>
        </div>
      </div>

      {/* Operation History / Phase Details */}
      {activeRecovery?.steps && activeRecovery.steps.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 pb-3 border-b border-slate-800">
            RECORDED RECOVERY PHASE DURATIONS ({activeRecovery.operationCode})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-mono">
            {activeRecovery.steps.map((step) => (
              <div key={step.id || step.stepNumber} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">{step.stepNumber}. {step.name}</span>
                <div className="flex items-center justify-between">
                  <span className={step.status === 'COMPLETED' ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                    {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : step.status}
                  </span>
                  <span className="text-[10px] text-slate-500">{step.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

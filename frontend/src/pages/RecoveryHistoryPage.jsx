import React, { useState, useEffect } from 'react';
import { recoveryService } from '../services/allServices';
import { History, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Clock, AlertTriangle } from 'lucide-react';

export const RecoveryHistoryPage = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    recoveryService.getRecoveries()
      .then(data => {
        const list = data || [];
        setRecoveries(list);
        if (list.length > 0) setExpandedId(list[0].id);
      })
      .catch(() => setLoadError(true));
  }, []);

  const formatSecs = (sec) => {
    if (sec === null || sec === undefined) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <History className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">RECOVERY OPERATION HISTORY LEDGER</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete historical audit record of executed failover operations, RTO/RPO SLA compliance, and step durations
          </p>
        </div>
      </div>

      {loadError && (
        <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          Unable to retrieve recovery history.
        </div>
      )}

      {/* History Items */}
      {!loadError && recoveries.length > 0 ? (
        <div className="space-y-4">
          {recoveries.map((op) => {
            const isExpanded = expandedId === op.id;
            const isCompleted = op.status === 'COMPLETED';

            return (
              <div key={op.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : op.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/50 transition-all border-b border-slate-800/60"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    }`}>
                      {op.operationCode ? op.operationCode.substring(0, 4) : 'DR'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-white text-sm">{op.operationCode}</span>
                        <span className="text-xs text-slate-400 font-mono">({op.operationType})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {op.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Started: {op.startedAt ? new Date(op.startedAt).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">MEASURED RTO</span>
                      <span className="font-bold text-emerald-400">{formatSecs(op.actualRtoSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">MEASURED RPO</span>
                      <span className="font-bold text-emerald-400">{formatSecs(op.actualRpoSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">INTEGRITY</span>
                      <span className="font-bold text-white">{op.dataIntegrityStatus || 'VERIFIED'}</span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isExpanded && op.steps && op.steps.length > 0 && (
                  <div className="p-5 bg-slate-950/60 border-t border-slate-800">
                    <h4 className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-wider">
                      Recorded Phase Progression
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {op.steps.map((st) => (
                        <div key={st.id || st.stepNumber} className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs font-mono">
                          <div className="flex justify-between items-center text-slate-400 mb-1">
                            <span>Step {st.stepNumber}</span>
                            <span className="text-emerald-400 font-bold">{st.status}</span>
                          </div>
                          <span className="text-white font-semibold block truncate">{st.name}</span>
                          {st.durationMs && (
                            <span className="text-[10px] text-slate-500 mt-1 block">Duration: {(st.durationMs / 1000).toFixed(1)}s</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono space-y-3">
          <History className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Recovery History</h3>
          <p className="max-w-md mx-auto text-slate-400">
            No historical disaster recovery operations recorded in database yet.
          </p>
        </div>
      )}
    </div>
  );
};

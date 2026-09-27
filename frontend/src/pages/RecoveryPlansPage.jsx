import React, { useState, useEffect } from 'react';
import { policyService } from '../services/allServices';
import { FileCheck2, ShieldCheck, CheckCircle2, Clock, Cpu, RefreshCw } from 'lucide-react';

export const RecoveryPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    policyService.getRecoveryPlans().then(setPlans).catch(() => setLoadError(true));
    policyService.getPolicies().then(setPolicies).catch(() => setLoadError(true));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">RESILIENCE POLICIES &amp; RECOVERY PLANS</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Declarative DR recovery workflows, SLA objectives, database promotion strategies, and traffic cutover policies
          </p>
        </div>
      </div>

      {loadError && (
        <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          Unable to retrieve recovery policy information.
        </div>
      )}

      {/* Policies List */}
      {!loadError && policies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((pol) => (
            <div key={pol.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white">{pol.name}</h3>
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-amber-500/20 text-amber-400">
                  {pol.recoveryStrategy}
                </span>
              </div>
              <p className="text-xs text-slate-300">{pol.description}</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Target RTO:</span>
                  <strong className="text-white">{Math.floor(pol.rtoTargetSeconds / 60)} Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Target RPO:</span>
                  <strong className="text-white">{Math.floor(pol.rpoTargetSeconds / 60)} Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Operator Approval Gate:</span>
                  <strong className="text-emerald-400">{pol.approvalRequired ? 'REQUIRED (Enabled)' : 'AUTOMATIC'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Policies Configured</h3>
          <p className="max-w-md mx-auto text-slate-400">
            No disaster recovery policies or plans recorded in database.
          </p>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useDR } from '../context/DRContext';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

export const HumanApprovalModal = () => {
  const { isApprovalModalOpen, setIsApprovalModalOpen, approveRecovery, cancelRecovery, activeRecovery } = useDR();

  if (!isApprovalModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-amber-500/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">RECOVERY APPROVAL REQUIRED</h3>
            <p className="text-xs text-amber-400/90 font-mono">CRITICAL DISASTER RECOVERY STAGE GATE</p>
          </div>
        </div>

        {/* Gate Details Card */}
        <div className="space-y-4 text-xs font-mono mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Primary Region Outage:</span>
            <span className="text-rose-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>us-east-1 🔴 FAILED</span>
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Target Recovery Region:</span>
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>us-east-2 🟡 PILOT LIGHT</span>
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">Secondary Database Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recovery database ready (PROMOTED)</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Data Replication Integrity:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified (0 un-replicated records)</span>
            </span>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200/90 mb-6 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Approving this step will trigger <strong>Pilot Light compute activation (ECS 0 &rarr; 3 tasks)</strong>, run health checks, and execute <strong>100% global traffic cutover</strong> to us-east-2.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={cancelRecovery}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Operation</span>
          </button>
          <button
            onClick={() => approveRecovery('Authorized by Chief Reliability Officer')}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE RECOVERY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

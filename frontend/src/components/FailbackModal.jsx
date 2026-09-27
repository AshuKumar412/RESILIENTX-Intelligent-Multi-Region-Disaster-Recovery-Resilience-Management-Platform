import React, { useState } from 'react';
import { useDR } from '../context/DRContext';
import { RotateCcw, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const FailbackModal = () => {
  const { isFailbackModalOpen, setIsFailbackModalOpen, executeFailback } = useDR();
  const [inProgress, setInProgress] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  if (!isFailbackModalOpen) return null;

  const failbackSteps = [
    'Primary region (us-east-1) infrastructure & health verified',
    'Data reverse synchronization verified (us-east-2 -> us-east-1)',
    'Primary ECS compute activated (3/3 tasks running)',
    'Primary application health & API validation passed',
    'Global ingress traffic switched back to us-east-1 (100%)',
    'Secondary region (us-east-2) compute scaled down to Pilot Light (0 tasks)'
  ];

  const handleStartFailback = async () => {
    setInProgress(true);
    for (let i = 0; i < failbackSteps.length; i++) {
      setActiveStep(i);
      await new Promise(r => setTimeout(r, 700));
    }
    await executeFailback();
    setInProgress(false);
    setIsFailbackModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-brand-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-brand-500/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-brand-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">FAILBACK TO PRIMARY REGION</h3>
            <p className="text-xs text-brand-400 font-mono">Restoring Steady-State Active / Pilot Light Architecture</p>
          </div>
        </div>

        {/* 6-Step Restoration Visualizer */}
        <div className="space-y-2.5 mb-6">
          {failbackSteps.map((step, idx) => {
            const isDone = inProgress ? activeStep > idx : false;
            const isCurrent = inProgress && activeStep === idx;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center space-x-3 transition-all ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-brand-950/30 border-brand-500 text-brand-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950'
                    : isCurrent
                    ? 'bg-brand-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </span>
                <span className="font-mono">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setIsFailbackModalOpen(false)}
            disabled={inProgress}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStartFailback}
            disabled={inProgress}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-brand-600/30 cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{inProgress ? 'EXECUTING RESTORATION...' : 'EXECUTE FAILBACK'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

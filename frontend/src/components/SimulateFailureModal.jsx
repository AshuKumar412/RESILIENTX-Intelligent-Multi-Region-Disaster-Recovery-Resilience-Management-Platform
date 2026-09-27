import React, { useState } from 'react';
import { useDR } from '../context/DRContext';
import { AlertTriangle, Flame, ServerCrash, Database, WifiOff } from 'lucide-react';

export const SimulateFailureModal = () => {
  const { isSimulateModalOpen, setIsSimulateModalOpen, simulateRegionFailure, isSimulatingFailure } = useDR();
  const [failureType, setFailureType] = useState('REGIONAL_OUTAGE');

  if (!isSimulateModalOpen) return null;

  const handleSimulate = async () => {
    await simulateRegionFailure(failureType);
    setIsSimulateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-500/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">DR DRILL / REGIONAL INCIDENT SIMULATION</h3>
            <p className="text-xs text-rose-400 font-mono">Inject Controlled Outage Scenario on us-east-1</p>
          </div>
        </div>

        {/* Failure Type Options */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-mono text-slate-400 block uppercase">Select DR Drill Scenario:</label>
          
          <div
            onClick={() => setFailureType('REGIONAL_OUTAGE')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
              failureType === 'REGIONAL_OUTAGE'
                ? 'bg-rose-950/30 border-rose-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <ServerCrash className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-white">Full Regional Availability Zone Outage (Recommended)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Primary region us-east-1 compute, API, and database become entirely unresponsive.</div>
            </div>
          </div>

          <div
            onClick={() => setFailureType('DATABASE_CRASH')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
              failureType === 'DATABASE_CRASH'
                ? 'bg-rose-950/30 border-rose-500 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-white">Primary Database Failure</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Primary DB crashes, triggering replication lag alarms and promotion to us-east-2.</div>
            </div>
          </div>
        </div>

        {/* Modal Summary Metadata */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 mb-6 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Target Primary:</span>
            <span className="text-rose-400 font-bold">us-east-1 (N. Virginia)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Recovery:</span>
            <span className="text-emerald-400 font-bold">us-east-2 (Ohio)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Exercise Type:</span>
            <span className="text-cyan-400 font-bold">CONTROLLED DR DRILL</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setIsSimulateModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSimulatingFailure}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>TRIGGER DR DRILL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

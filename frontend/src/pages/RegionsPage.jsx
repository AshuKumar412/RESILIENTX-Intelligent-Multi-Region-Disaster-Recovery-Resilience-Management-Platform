import React from 'react';
import { useDR } from '../context/DRContext';
import { LiveTopologyMap } from '../components/LiveTopologyMap';
import { Globe, Server, Database, Activity, RefreshCw } from 'lucide-react';

export const RegionsPage = () => {
  const { regions, refreshState } = useDR();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Globe className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">REGIONAL TOPOLOGY &amp; PILOT LIGHT RECOVERY</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configurable Primary &amp; Standby AWS Regional pairs with real-time compute and database status
          </p>
        </div>
        <button
          onClick={refreshState}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Topology</span>
        </button>
      </div>

      {/* Main Interactive Map */}
      <LiveTopologyMap />

      {/* Region Details Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">
          REGISTERED REGIONAL DEPLOYMENTS
        </h3>

        {regions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {regions.map((reg) => (
              <div key={reg.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{reg.name} ({reg.code})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    reg.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {reg.status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Architectural Role:</span>
                  <strong className="text-white">{reg.role}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Compute Capacity:</span>
                  <strong className="text-white">{reg.computeCapacity ?? 0} Tasks</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Database Status:</span>
                  <strong className="text-brand-400">{reg.databaseRole || 'Unassigned'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Traffic Allocation:</span>
                  <strong className="text-emerald-400">{reg.trafficPercentage ?? 0}%</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No regional deployments registered in database.
          </div>
        )}
      </div>
    </div>
  );
};

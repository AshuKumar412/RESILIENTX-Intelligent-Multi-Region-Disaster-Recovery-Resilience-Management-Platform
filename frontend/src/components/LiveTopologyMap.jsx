import React from 'react';
import { useDR } from '../context/DRContext';
import { Globe, Server, Database, ArrowRight, ShieldCheck, AlertOctagon, Cpu, Wifi, Activity } from 'lucide-react';

export const LiveTopologyMap = () => {
  const { regions, replicationLag, mode } = useDR();
  const primary = regions.find(r => r.id === 'us-east-1') || regions[0] || null;
  const recovery = regions.find(r => r.id === 'us-east-2') || regions[1] || null;

  if (!primary || !recovery) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs font-mono">
        <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p>No regional topology configured. Initialize regions in database or Settings.</p>
      </div>
    );
  }

  const isPrimaryFailed = primary.status === 'FAILED';
  const isRecoveryActive = recovery.role === 'ACTIVE_FAILOVER' || (recovery.computeCapacity && recovery.computeCapacity > 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold tracking-wide text-white">LIVE MULTI-REGION TOPOLOGY</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Active / Pilot Light Architectural Model</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
            CONTROL PLANE: <strong className="text-cyan-400">ACTIVE</strong>
          </span>
          <span className={`px-2.5 py-1 rounded bg-slate-950 border border-slate-800 flex items-center space-x-1.5 ${
            replicationLag !== null ? 'text-emerald-400' : 'text-slate-400'
          }`}>
            {replicationLag !== null ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>REPLICATION: ACTIVE ({replicationLag}ms)</span>
              </>
            ) : (
              <span>REPLICATION: Standby</span>
            )}
          </span>
        </div>
      </div>

      {/* Global Ingress Layer */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="bg-slate-950 border border-slate-700 rounded-lg px-6 py-3 shadow-lg flex items-center space-x-3 text-center">
          <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Global Ingress / Traffic Routing</span>
            <span className="text-xs font-bold text-white">Route 53 / ARC Routing Controls</span>
          </div>
        </div>

        {/* Dynamic Animated Traffic Split Lines */}
        <div className="w-full max-w-2xl flex justify-between items-center px-12 mt-2">
          <div className="flex-1 flex flex-col items-center">
            <div className={`h-8 w-0.5 ${isPrimaryFailed ? 'bg-rose-500/50' : 'bg-cyan-500 animate-pulse'}`} />
            <span className={`text-[11px] font-mono font-bold mt-1 ${isPrimaryFailed ? 'text-rose-400 line-through' : 'text-cyan-400'}`}>
              {primary.trafficPercentage ?? 100}% TRAFFIC
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className={`h-8 w-0.5 ${isRecoveryActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className={`text-[11px] font-mono font-bold mt-1 ${isRecoveryActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {recovery.trafficPercentage ?? 0}% TRAFFIC
            </span>
          </div>
        </div>
      </div>

      {/* Two Regional Enclosures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* PRIMARY REGION */}
        <div className={`rounded-xl border p-5 transition-all relative ${
          isPrimaryFailed
            ? 'bg-rose-950/20 border-rose-500/50 shadow-rose-950/50 shadow-2xl'
            : 'bg-slate-950/80 border-slate-700 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPrimaryFailed ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span className="font-bold text-sm text-white">{primary.code || primary.id}</span>
                <span className="text-xs text-slate-400">({primary.name || 'Primary'})</span>
              </div>
              <span className={`text-[11px] font-mono font-semibold uppercase ${isPrimaryFailed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {primary.role}: {isPrimaryFailed ? 'FAILED' : 'ACTIVE'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-200 block">{primary.trafficPercentage ?? 100}% INGRESS</span>
              <span className="text-[10px] text-slate-400 font-mono">STATUS: {primary.status}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>ECS Fargate Compute</span>
              </div>
              <span className="font-mono font-bold text-slate-200">
                {isPrimaryFailed ? '0 Tasks (Offline)' : `${primary.computeCapacity ?? 3} Active Tasks`}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>DocumentDB Database</span>
              </div>
              <span className={`font-mono font-bold ${isPrimaryFailed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isPrimaryFailed ? 'UNREACHABLE' : (primary.databaseRole || 'PRIMARY WRITER')}
              </span>
            </div>
          </div>
        </div>

        {/* RECOVERY REGION: STANDBY PILOT LIGHT */}
        <div className={`rounded-xl border p-5 transition-all relative ${
          isRecoveryActive
            ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/50 shadow-2xl'
            : 'bg-slate-950/80 border-slate-700 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRecoveryActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="font-bold text-sm text-white">{recovery.code || recovery.id}</span>
                <span className="text-xs text-slate-400">({recovery.name || 'Standby'})</span>
              </div>
              <span className={`text-[11px] font-mono font-semibold uppercase ${isRecoveryActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {recovery.role}: {isRecoveryActive ? 'ACTIVE (FAILOVER)' : 'PILOT LIGHT'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-200 block">{recovery.trafficPercentage ?? 0}% INGRESS</span>
              <span className="text-[10px] text-slate-400 font-mono">STATUS: {recovery.status}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>ECS Fargate Compute</span>
              </div>
              <span className="font-mono font-bold text-slate-200">
                {recovery.computeCapacity ?? 0} Tasks ({isRecoveryActive ? 'Scaled Active' : '0 Capacity Standby'})
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/90 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>DocumentDB Database</span>
              </div>
              <span className={`font-mono font-bold ${isRecoveryActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {recovery.databaseRole || 'REPLICA (READ-ONLY)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

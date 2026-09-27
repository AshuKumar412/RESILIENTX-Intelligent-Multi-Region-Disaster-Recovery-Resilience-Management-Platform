import React from 'react';
import { Workflow, Layers, Database, Globe, Server, ShieldCheck, Activity, Cpu, ArrowRight, CheckCircle2, Lock, GitFork, Radio, RefreshCw, FileText } from 'lucide-react';

export const ArchitecturePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Workflow className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-black text-white tracking-wide">RESILIENTX OPERATIONS ARCHITECTURE</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Multi-Region Disaster Recovery Control Plane &amp; Automated Resilience Lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping" />
            Control Plane Active
          </span>
        </div>
      </div>

      {/* Resilience Lifecycle Tier Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase text-slate-300 mb-1">
            Disaster Recovery &amp; Resilience Operations Flow
          </h3>
          <p className="text-xs text-slate-400">
            End-to-end operational pipeline from workload telemetry through automated failover orchestration to immutable audit records.
          </p>
        </div>

        {/* Operational Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stage 1: Applications & Workloads */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-cyan-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                Stage 01
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Applications &amp; Workloads</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Mission-critical workloads across tier-1 services with defined RTO/RPO recovery targets and multi-region deployment topologies.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tier-1 Application Registry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active &amp; Standby Region Bindings</span>
              </div>
            </div>
          </div>

          {/* Stage 2: Health Probing & Readiness Engine */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-blue-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                Stage 02
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Health &amp; Readiness Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Continuous regional health probing, synthetic traffic verification, and pilot light standby readiness checks.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Synthetic Endpoint Probes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Standby Capacity Validation</span>
              </div>
            </div>
          </div>

          {/* Stage 3: Incident Detection & Decision Engine */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-amber-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Radio className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                Stage 03
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Detection &amp; Decision Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Real-time failure classification, SLO violation analysis, and automated recommendation of verified recovery plans.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Regional Outage Classification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Policy-Driven Recovery Triggering</span>
              </div>
            </div>
          </div>

          {/* Stage 4: Orchestration & Approval Gate */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-emerald-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                Stage 04
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Recovery Orchestration Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Deterministic multi-step state machine with dual-authorization human approval gates and rollback capabilities.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cryptographic Approval Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Step-by-Step State Transition</span>
              </div>
            </div>
          </div>

          {/* Stage 5: Data Continuity & Replication */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-purple-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                Stage 05
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Data Continuity &amp; Sync</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Cross-region continuous replication tracking, lag verification, checkpoint validation, and replica promotion to primary.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Zero-Data-Loss Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Instant Standby Promotion</span>
              </div>
            </div>
          </div>

          {/* Stage 6: Traffic Recovery & Audit */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative group hover:border-indigo-500/50 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                Stage 06
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Traffic Recovery &amp; SRE Audit</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Regional traffic redirection, zero-downtime routing switchover, and tamper-evident audit logging for regulatory compliance.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Gradual &amp; Instant Traffic Shifting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Immutable SRE Audit Trail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Region Pilot Light Blueprint Architecture */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Multi-Region Pilot Light Recovery Blueprint</h4>
              <p className="text-xs text-slate-400 mt-0.5">Architectural topology separating Active Production from Standby Pilot Light</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Active (100% Traffic)</span>
              <span className="flex items-center gap-1.5 ml-3"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Pilot Light (0% Traffic)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Region Architecture */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-white">Primary Production Region</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40">
                  Primary Routing Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Compute Cluster</span>
                  <span className="font-mono text-emerald-400 font-semibold">Running &amp; Auto-Scaled</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Database Cluster</span>
                  <span className="font-mono text-emerald-400 font-semibold">Read/Write Primary</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Edge Ingress / Load Balancer</span>
                  <span className="font-mono text-emerald-400 font-semibold">100% Ingress Routing</span>
                </div>
              </div>
            </div>

            {/* Standby Region Architecture */}
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-bold text-white">Secondary Pilot Light Region</span>
                </div>
                <span className="text-xs font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/40">
                  Standby Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Compute Cluster</span>
                  <span className="font-mono text-amber-400 font-semibold">Minimal Warm Standby</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Database Cluster</span>
                  <span className="font-mono text-amber-400 font-semibold">Continuous Read Replica</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Edge Ingress / Load Balancer</span>
                  <span className="font-mono text-amber-400 font-semibold">0% Standby Routing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

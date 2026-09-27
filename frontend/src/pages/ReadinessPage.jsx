import React, { useState, useEffect } from 'react';
import { useDR } from '../context/DRContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  Database,
  Globe,
  FileCode,
  Lock,
  Clock,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { policyService } from '../services/allServices';

const ICON_MAP = {
  compute: Server,
  database: Database,
  traffic: Globe,
  runbook: FileCode,
  security: Lock,
  backups: Clock
};

export const ReadinessPage = () => {
  const { mode } = useDR();
  const [readinessData, setReadinessData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [lastAssessed, setLastAssessed] = useState(null);

  const fetchReadiness = async () => {
    try {
      setEvaluating(true);
      const data = await policyService.getReadiness();
      setReadinessData(data);
      setLastAssessed(new Date().toLocaleTimeString());
    } catch {
      setReadinessData({
        status: 'INSUFFICIENT_DATA',
        readinessScore: null,
        message: 'Readiness: Insufficient data',
        pillars: []
      });
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const hasScore = readinessData?.readinessScore !== null && readinessData?.readinessScore !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Disaster Recovery Readiness Assessment
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic 6-pillar evaluation of cross-region standby infrastructure, policies, and failover runbooks derived from real-time resilience telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {lastAssessed && (
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 block font-mono">LAST EVALUATED</span>
              <span className="text-xs text-slate-200 font-mono font-medium">{lastAssessed}</span>
            </div>
          )}
          <button
            onClick={fetchReadiness}
            disabled={evaluating}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating Standby...' : 'Re-evaluate Readiness'}</span>
          </button>
        </div>
      </div>

      {/* Resilience Score Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Overall Resilience Score
            </span>
            <div className="mt-4 flex items-baseline space-x-3">
              {hasScore ? (
                <>
                  <span className={`text-6xl font-black tracking-tight font-mono ${readinessData.readinessScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {readinessData.readinessScore}
                  </span>
                  <span className="text-slate-500 text-lg font-mono">/ 100</span>
                </>
              ) : (
                <div className="py-2">
                  <span className="text-xl font-bold text-slate-400 font-mono">Insufficient Data</span>
                </div>
              )}
            </div>
            
            <p className="mt-2 text-xs font-medium flex items-center space-x-1">
              {hasScore ? (
                readinessData.readinessScore >= 80 ? (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{readinessData.message}</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{readinessData.message}</span>
                  </span>
                )
              ) : (
                <span className="text-slate-500">No recovery policies or plans configured</span>
              )}
            </p>

            <div className="mt-5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Calculation Methodology:</span>
              <p className="font-mono text-[10px] text-slate-400">
                Score = 1/6 &times; (&Sigma; Compute + Database + Traffic + SLA + Governance + Validation)
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 uppercase block text-[10px]">Target RTO SLA</span>
              <span className="font-bold text-white">15m 00s</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase block text-[10px]">Target RPO SLA</span>
              <span className="font-bold text-white">05m 00s</span>
            </div>
          </div>
        </div>

        {/* Pillar Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {readinessData?.pillars && readinessData.pillars.length > 0 ? (
            readinessData.pillars.map((item) => {
              const Icon = ICON_MAP[item.id] || Server;
              const isReady = item.status === 'READY';
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                        {item.category}
                      </span>
                      <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        isReady
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isReady ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{item.status} ({item.score}%)</span>
                      </span>
                    </div>
                    <div className="flex items-start space-x-3 mt-1">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{item.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs font-mono">
              No readiness criteria available. Configure recovery plans and policies in the Resilience section.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

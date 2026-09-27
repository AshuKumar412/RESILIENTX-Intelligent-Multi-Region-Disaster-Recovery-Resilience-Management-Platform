import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Globe2,
  FileCheck2,
  AlertOctagon,
  Activity,
  Database,
  Gauge,
  History,
  FileText,
  Workflow,
  Settings,
  ShieldCheck
} from 'lucide-react';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Incidents', path: '/incidents', icon: AlertOctagon },
      { name: 'Recovery Operations', path: '/recovery-operations', icon: Activity },
      { name: 'Applications', path: '/applications', icon: Layers },
    ]
  },
  {
    title: 'Resilience',
    items: [
      { name: 'Readiness Assessment', path: '/readiness', icon: ShieldCheck },
      { name: 'Live Topology', path: '/regions', icon: Globe2 },
      { name: 'Data Continuity', path: '/data-continuity', icon: Database },
      { name: 'Recovery Plans', path: '/recovery-plans', icon: FileCheck2 },
    ]
  },
  {
    title: 'Governance & Administration',
    items: [
      { name: 'RTO / RPO Metrics', path: '/metrics', icon: Gauge },
      { name: 'Recovery History', path: '/recovery-history', icon: History },
      { name: 'Tamper-Evident Audit', path: '/audit', icon: FileText },
      { name: 'Platform Architecture', path: '/architecture', icon: Workflow },
      { name: 'Platform Settings', path: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900/95 backdrop-blur border-r border-slate-800 flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0 shadow-lg select-none">
      <div className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              {group.title}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Target SRE SLA Guardrails Footer Card */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2 mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Target Architecture</span>
          <span className="text-amber-400 font-mono font-semibold">PILOT LIGHT</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Target RTO Limit</span>
          <span className="text-slate-300 font-mono font-semibold">Not available</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Target RPO Limit</span>
          <span className="text-slate-300 font-mono font-semibold">Not available</span>
        </div>
      </div>
    </aside>
  );
};

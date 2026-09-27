import React, { useState, useEffect } from 'react';
import { recoveryService } from '../services/allServices';
import { AlertOctagon, Flame, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

export const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    recoveryService.getIncidents().then(setIncidents).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">DISASTER INCIDENTS &amp; OUTAGES</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-region failure detection, impact assessment, and incident lifecycle logs
          </p>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">INCIDENT ID</th>
              <th className="p-4">SEVERITY</th>
              <th className="p-4">TRIGGER</th>
              <th className="p-4">FAILED REGION</th>
              <th className="p-4">RECOVERY REGION</th>
              <th className="p-4">STATUS</th>
              <th className="p-4">DETECTED AT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {incidents.length > 0 ? (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-850/50">
                  <td className="p-4 font-bold text-white">{inc.id}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{inc.triggerType}</td>
                  <td className="p-4 text-rose-400">{inc.primaryRegionId || 'us-east-1'}</td>
                  <td className="p-4 text-emerald-400">{inc.recoveryRegionId || 'us-east-2'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      inc.status === 'RECOVERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{new Date(inc.detectedAt).toLocaleTimeString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No active incidents recorded. System is operating normally.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/allServices';
import { Layers, Plus, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const ApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [criticality, setCriticality] = useState('CRITICAL');

  const loadApps = () => {
    organizationService.getApplications().then(setApps).catch(() => {});
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    throw new Error('Organization, environment, and recovery regions must be configured before registration.');
    setName('');
    setShowAddModal(false);
    loadApps();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">PROTECTED APPLICATION REGISTRY</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Workload resiliency configuration, multi-region routing pairs, and criticality classification
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Application</span>
        </button>
      </div>

      {/* Applications Grid */}
      {apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 block">{app.id}</span>
                  <h3 className="font-bold text-sm text-white">{app.name}</h3>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {app.criticality}
                </span>
              </div>

              <p className="text-xs text-slate-300">{app.description || 'Core high-availability service'}</p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>Primary Region:</span>
                  <strong className="text-white">{app.primaryRegionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Recovery Region:</span>
                  <strong className="text-amber-400">{app.recoveryRegionId} (Pilot Light)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-emerald-400">{app.status}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs font-mono space-y-3">
          <Layers className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Applications Configured</h3>
          <p className="max-w-md mx-auto text-slate-400">
            No protected applications found in database. Click "Register Application" above to add your first workload.
          </p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Register New Application</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="font-mono text-slate-400 block mb-1">Application Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Identity &amp; Auth Engine"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="font-mono text-slate-400 block mb-1">Criticality</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="CRITICAL">CRITICAL (15m RTO / 5m RPO)</option>
                  <option value="HIGH">HIGH (1hr RTO / 15m RPO)</option>
                  <option value="MEDIUM">MEDIUM (4hr RTO / 1hr RPO)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-bold"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

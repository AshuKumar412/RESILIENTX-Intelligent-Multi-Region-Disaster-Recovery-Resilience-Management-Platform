import React, { useState, useEffect } from 'react';
import { auditService } from '../services/allServices';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const AuditPage = () => {
  const [events, setEvents] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadAudit = async () => {
    try {
      const data = await auditService.getAuditEvents();
      setEvents(data || []);
    } catch {
      setLoadError(true);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const res = await auditService.verifyChain();
      setChainStatus(res);
    } catch {
      setChainStatus({ status: 'ERROR', message: 'Verification failed to reach audit service' });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">IMMUTABLE AUDIT COMPLIANCE LOG</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident cryptographic SHA-256 audit trail &amp; immutable regulatory compliance ledger
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Verifying Hashes...' : 'VERIFY HASH CHAIN'}</span>
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-amber-950/30 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs">
          Unable to retrieve audit events.
        </div>
      )}

      {/* Cryptographic Chain Status Callout */}
      {chainStatus && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
          chainStatus.status === 'VERIFIED'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center space-x-3">
            {chainStatus.status === 'VERIFIED' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                AUDIT HASH CHAIN: {chainStatus.status} ({chainStatus.verifiedEventCount || 0}/{chainStatus.totalEvents || 0} EVENTS)
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-xl">
                Tip Hash: {chainStatus.lastHash || 'Genesis'} &bull; Algorithm: {chainStatus.algorithm || 'SHA-256'}
              </span>
            </div>
          </div>
          <span className={`px-2.5 py-1 font-bold rounded ${
            chainStatus.status === 'VERIFIED' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
          }`}>
            {chainStatus.status}
          </span>
        </div>
      )}

      {/* Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">AUDIT ID</th>
              <th className="p-4">OPERATOR</th>
              <th className="p-4">ACTION</th>
              <th className="p-4">RESOURCE</th>
              <th className="p-4">CORRELATION ID</th>
              <th className="p-4">RESULT</th>
              <th className="p-4">TIMESTAMP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {!loadError && events.length > 0 ? (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-850/50">
                  <td className="p-4 font-bold text-white">{evt.id}</td>
                  <td className="p-4 text-cyan-400">{evt.username}</td>
                  <td className="p-4 font-bold text-white">{evt.action}</td>
                  <td className="p-4 text-slate-300">{evt.resourceType} ({evt.resourceId})</td>
                  <td className="p-4 text-slate-400">{evt.correlationId}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {evt.result}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-10 text-center text-slate-500">
                  No audit events recorded in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useDR } from '../context/DRContext';
import { dataContinuityService } from '../services/allServices';
import { Database, CheckCircle2, RefreshCw, Plus, ArrowRight, ShieldCheck, Hash, User, DollarSign, AlertCircle } from 'lucide-react';

export const DataContinuityPage = () => {
  const { replicationLag, lastReplicatedTime } = useDR();
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newCustName, setNewCustName] = useState('');
  const [newCustId, setNewCustId] = useState('');
  const [newTxnId, setNewTxnId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const custs = await dataContinuityService.getCustomers();
      const txns = await dataContinuityService.getTransactions();
      setCustomers(custs || []);
      setTransactions(txns || []);
    } catch {
      setVerificationResult({ status: 'UNAVAILABLE', message: 'Unable to retrieve continuity data.' });
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName) return;
    setLoading(true);
    try {
      await dataContinuityService.createCustomer({
        id: newCustId,
        name: newCustName,
        email: `${newCustName.toLowerCase().replace(' ', '.')}@example.com`,
        regionCreated: null
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!newAmount) return;
    setLoading(true);
    try {
      await dataContinuityService.createTransaction({
        id: newTxnId,
        customerId: newCustId,
        customerName: newCustName,
        amount: Number(newAmount),
        currency: 'INR'
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setLoading(true);
    try {
      const res = await dataContinuityService.verifyDataContinuity();
      setVerificationResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">CROSS-REGION DATA CONTINUITY</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous multi-region continuous replication stream verification between Primary (us-east-1) &amp; Recovery (us-east-2)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleVerifyIntegrity}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'VERIFY DATA INTEGRITY'}</span>
          </button>
        </div>
      </div>

      {/* Live Replication Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block mb-1">REPLICATION STATUS</span>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${replicationLag !== null ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            <span className={`text-lg font-bold font-mono ${replicationLag !== null ? 'text-emerald-400' : 'text-slate-400'}`}>
              {replicationLag !== null ? 'ACTIVE & SYNCED' : 'Standby'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Engine: ResilientX Control Plane</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block mb-1">MEASURED REPLICATION LAG</span>
          <div className="text-2xl font-bold font-mono text-white">
            {replicationLag !== null ? `${replicationLag} ms` : <span className="text-sm font-normal text-slate-500">Replication data unavailable</span>}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">RPO target unavailable without configured policy data</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-mono block mb-1">LAST REPLICATED TIMESTAMP</span>
          <div className="text-xs font-bold font-mono text-slate-200 mt-2">
            {lastReplicatedTime ? new Date(lastReplicatedTime).toLocaleTimeString() : 'No replication events'}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Continuous checkpointing</span>
        </div>
      </div>

      {/* Interactive Creation Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Record Banking Customer</span>
          </h3>
          <form onSubmit={handleCreateCustomer} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Customer ID</label>
              <input
                type="text"
                value={newCustId}
                onChange={(e) => setNewCustId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Customer in configured primary</span>
            </button>
          </form>
        </div>

        {/* Transaction Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span>Commit Core Ledger Transaction</span>
          </h3>
          <form onSubmit={handleCreateTransaction} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Transaction ID</label>
              <input
                type="text"
                value={newTxnId}
                onChange={(e) => setNewTxnId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Amount (₹ INR)</label>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Commit Transaction (₹{Number(newAmount || 0).toLocaleString()})</span>
            </button>
          </form>
        </div>
      </div>

      {/* Verification Results Callout */}
      {verificationResult && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-mono ${verificationResult.status === 'VERIFIED' ? 'bg-emerald-950/30 border border-emerald-500/40' : 'bg-amber-950/30 border border-amber-500/40'}`}>
          <div className={`flex items-center space-x-3 ${verificationResult.status === 'VERIFIED' ? 'text-emerald-300' : 'text-amber-300'}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">DATA CONTINUITY: {verificationResult.status}</span>
              <span className="text-[11px] mt-0.5">{verificationResult.message || 'No independent integrity evidence is available.'}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-700 text-slate-200 font-bold rounded">{verificationResult.status}</span>
        </div>
      )}

      {/* Primary vs Recovery Regional Data Ledger Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PRIMARY REGION DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white">CONFIGURED PRIMARY LEDGER</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded font-semibold">
              R/W MASTER ({transactions.length} Records)
            </span>
          </div>

          <div className="space-y-2.5">
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <div key={txn.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>{txn.id} &bull; {txn.customerName}</span>
                    <span className="text-emerald-400">₹{Number(txn.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Status: <strong className="text-emerald-400">{txn.status}</strong></span>
                    <span className="truncate max-w-[150px]">SHA: {txn.checksumHash ? txn.checksumHash.substring(0, 16) : 'Generated on save'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                No transactions recorded in primary region.
              </div>
            )}
          </div>
        </div>

        {/* RECOVERY REGION DATA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white">CONFIGURED RECOVERY STATE</span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-300 rounded font-semibold">
              REPLICA SYNCED ({transactions.length} Records)
            </span>
          </div>

          <div className="space-y-2.5">
            {transactions.length > 0 ? (
              transactions.map((txn) => (
                <div key={txn.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                  <div className="flex justify-between font-bold text-white mb-1">
                    <span>{txn.id} &bull; {txn.customerName}</span>
                    <span className="text-emerald-400">₹{Number(txn.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Replication: <strong className="text-slate-400">Not independently verified</strong></span>
                    <span>Lag: <strong className="text-white">{replicationLag !== null ? `${replicationLag}ms` : 'Syncing'}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs font-mono">
                No transactions replicated to recovery region.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

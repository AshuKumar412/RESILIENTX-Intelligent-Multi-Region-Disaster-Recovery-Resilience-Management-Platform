import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDR } from '../context/DRContext';
import { Play, Check, ChevronRight, X, Sparkles, Clock, Globe, Database, Flame, CheckCircle, RotateCcw } from 'lucide-react';

export const PresenterGuidedTour = () => {
  const {
    demoTourActive,
    setDemoTourActive,
    demoStep,
    setDemoStep,
    setIsSimulateModalOpen,
    setIsApprovalModalOpen,
    setIsFailbackModalOpen
  } = useDR();
  const navigate = useNavigate();

  if (!demoTourActive) return null;

  const milestones = [
    {
      time: '0:00 - 0:45',
      title: 'Live Topology & Pilot Light',
      desc: 'Explain the active primary region (us-east-1, 3 tasks, 100% traffic) vs the Pilot Light standby region (us-east-2, 0 tasks, continuous DB replication).',
      path: '/regions',
      actionLabel: 'Navigate to Topology',
      action: () => navigate('/regions')
    },
    {
      time: '0:45 - 1:30',
      title: 'Establish Data Continuity',
      desc: 'Create customer Ashu Kumar (CUST-1001) & transaction TXN-1001 (₹10,000). Show measured replication lag and cryptographic verification.',
      path: '/data-continuity',
      actionLabel: 'Go to Data Continuity',
      action: () => navigate('/data-continuity')
    },
    {
      time: '1:30 - 2:30',
      title: 'Simulate Region Failure & Gate',
      desc: 'Inject simulated regional failure into us-east-1. Observe real-time state machine progression and human approval gate.',
      path: '/recovery-operations',
      actionLabel: 'Simulate Disaster Outage',
      action: () => {
        navigate('/recovery-operations');
        setIsSimulateModalOpen(true);
      }
    },
    {
      time: '2:30 - 3:45',
      title: 'Recovery Execution & Traffic Switch',
      desc: 'Watch secondary DB promotion, ECS scale-up (0 to 3 tasks), health verification, dynamic traffic rerouting, and data continuity check.',
      path: '/recovery-operations',
      actionLabel: 'View Recovery Execution',
      action: () => navigate('/recovery-operations')
    },
    {
      time: '3:45 - 5:00',
      title: 'RTO / RPO Metrics & Failback',
      desc: 'Review actual measured RTO and RPO against target requirements. Execute clean failback restoration to return to baseline Pilot Light.',
      path: '/metrics',
      actionLabel: 'Inspect Metrics & Failback',
      action: () => {
        navigate('/metrics');
      }
    }
  ];

  const current = milestones[demoStep] || milestones[0];

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md w-full bg-slate-900/95 backdrop-blur-md border border-purple-500/40 rounded-2xl p-5 shadow-2xl shadow-purple-500/10 animate-in slide-in-from-bottom-5">
      {/* Tour Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide">5-MINUTE HACKATHON DEMO GUIDE</span>
            <span className="text-[10px] font-mono text-purple-400 block">Step {demoStep + 1} of {milestones.length} &bull; {current.time}</span>
          </div>
        </div>
        <button
          onClick={() => setDemoTourActive(false)}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="py-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <span>{current.title}</span>
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{current.desc}</p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex items-center space-x-1.5">
          {milestones.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDemoStep(i);
                milestones[i].action();
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                demoStep === i ? 'bg-purple-500 w-5' : demoStep > i ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {demoStep > 0 && (
            <button
              onClick={() => {
                const prev = demoStep - 1;
                setDemoStep(prev);
                milestones[prev].action();
              }}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={() => {
              current.action();
              if (demoStep < milestones.length - 1) {
                setDemoStep(demoStep + 1);
              }
            }}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            <span>{demoStep === milestones.length - 1 ? 'Finish Script' : 'Execute & Next'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

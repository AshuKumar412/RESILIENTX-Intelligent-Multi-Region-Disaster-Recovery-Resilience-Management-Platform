import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizationService, regionService, recoveryService, dataContinuityService } from '../services/allServices';

const DRContext = createContext(null);

export const DRProvider = ({ children }) => {
  const [mode, setMode] = useState('LOCAL');
  const [regions, setRegions] = useState([]);
  const [protectedApplication, setProtectedApplication] = useState(null);
  const [activeRecovery, setActiveRecovery] = useState(null);
  const [replicationLag, setReplicationLag] = useState(null);
  const [lastReplicatedTime, setLastReplicatedTime] = useState(null);
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isFailbackModalOpen, setIsFailbackModalOpen] = useState(false);
  const [demoTourActive, setDemoTourActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Poll active recovery status, live topology, and replication status
  const refreshState = useCallback(async () => {
    try {
      const applications = await organizationService.getApplications();
      setProtectedApplication(applications && applications.length > 0 ? applications[0] : null);
    } catch {
      setProtectedApplication(null);
    }

    try {
      const top = await regionService.getTopology();
      if (top && top.regions && top.regions.length > 0) {
        setRegions(top.regions);
      }
    } catch {
      // Backend offline or starting
    }

    try {
      if (!protectedApplication?.id) {
        setReplicationLag(null);
        return;
      }
      const rep = await dataContinuityService.getReplicationStatus(protectedApplication.id);
      if (rep && rep.replicationLagMs !== undefined) {
        setReplicationLag(Number(rep.replicationLagMs));
        setLastReplicatedTime(rep.lastReplicatedAt || rep.updatedAt);
      } else {
        setReplicationLag(null);
      }
    } catch {
      setReplicationLag(null);
    }

    try {
      if (!protectedApplication?.id) {
        setActiveRecovery(null);
        return;
      }
      const recs = await recoveryService.getRecoveries(protectedApplication.id);
      if (recs && recs.length > 0) {
        const running = recs.find(r => r.status === 'RUNNING' || r.status === 'WAITING_APPROVAL');
        const latest = running || recs[0];
        setActiveRecovery(latest);

        if (latest.status === 'WAITING_APPROVAL') {
          setIsApprovalModalOpen(true);
        }
      } else {
        setActiveRecovery(null);
      }
    } catch {
      setActiveRecovery(null);
    }
  }, [protectedApplication]);

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 3000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const simulateRegionFailure = async (failureType = 'REGIONAL_OUTAGE') => {
    if (!protectedApplication?.id || !protectedApplication.primaryRegionId || !protectedApplication.recoveryRegionId) {
      throw new Error('No configured application and recovery regions are available.');
    }
    setIsSimulatingFailure(true);
    try {
      const op = await recoveryService.initiateRecovery({
        applicationId: protectedApplication.id,
        primaryRegion: protectedApplication.primaryRegionId,
        recoveryRegion: protectedApplication.recoveryRegionId,
        failureReason: 'Operator-reported regional service failure',
        triggerType: failureType,
        mode: mode,
        triggeredBy: 'lead-sre'
      });

      setActiveRecovery(op);
      await refreshState();
      return op;
    } finally {
      setIsSimulatingFailure(false);
    }
  };

  const approveRecovery = async (reason = 'Operator authorized Pilot Light recovery') => {
    if (!activeRecovery) return;
    const op = await recoveryService.approveRecovery(activeRecovery.id, 'Chief Reliability Officer', reason);
    setActiveRecovery(op);
    setIsApprovalModalOpen(false);
    await refreshState();
    return op;
  };

  const cancelRecovery = async () => {
    if (!activeRecovery) return;
    const op = await recoveryService.cancelRecovery(activeRecovery.id, 'lead-sre', 'Cancelled by operator');
    setActiveRecovery(op);
    setIsApprovalModalOpen(false);
    await refreshState();
    return op;
  };

  const executeFailback = async () => {
    if (!activeRecovery) return;
    const fb = await recoveryService.executeFailback(activeRecovery.id, 'lead-sre');
    setActiveRecovery(fb);
    await refreshState();
    return fb;
  };

  const runDrill = async () => {
    if (!protectedApplication?.id || !protectedApplication.primaryRegionId || !protectedApplication.recoveryRegionId) {
      throw new Error('No configured application and recovery regions are available.');
    }
    const drill = await recoveryService.runDrill({
      applicationId: protectedApplication.id,
      primaryRegion: protectedApplication.primaryRegionId,
      recoveryRegion: protectedApplication.recoveryRegionId,
      mode
    });
    setActiveRecovery(drill);
    await refreshState();
    return drill;
  };

  return (
    <DRContext.Provider
      value={{
        mode,
        setMode,
        regions,
        setRegions,
        activeRecovery,
        setActiveRecovery,
        replicationLag,
        lastReplicatedTime,
        isSimulatingFailure,
        simulateRegionFailure,
        approveRecovery,
        cancelRecovery,
        executeFailback,
        runDrill,
        isApprovalModalOpen,
        setIsApprovalModalOpen,
        isSimulateModalOpen,
        setIsSimulateModalOpen,
        isFailbackModalOpen,
        setIsFailbackModalOpen,
        demoTourActive,
        setDemoTourActive,
        demoStep,
        setDemoStep,
        refreshState
      }}
    >
      {children}
    </DRContext.Provider>
  );
};

export const useDR = () => useContext(DRContext);

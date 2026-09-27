package com.resilientx.recovery.strategy;

import com.resilientx.recovery.entity.RecoveryOperation;
import com.resilientx.recovery.entity.RecoveryOperationStep;
import org.springframework.stereotype.Component;

@Component("simulationExecutionStrategy")
public class SimulationExecutionStrategy implements RecoveryExecutionStrategy {

    @Override
    public String getMode() {
        return "SIMULATION";
    }

    @Override
    public void executeDatabasePromotion(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("Recovery infrastructure is not connected.");
    }

    @Override
    public void executeComputeActivation(RecoveryOperation op, RecoveryOperationStep step, int desiredCapacity) throws Exception {
        throw new IllegalStateException("Recovery infrastructure is not connected.");
    }

    @Override
    public void executeHealthValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("Recovery infrastructure is not connected.");
    }

    @Override
    public void executeTrafficSwitch(RecoveryOperation op, RecoveryOperationStep step, String targetRegion) throws Exception {
        throw new IllegalStateException("Traffic recovery is not configured.");
    }

    @Override
    public void executeDataIntegrityValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("Data integrity verification is not configured.");
    }

    @Override
    public void executeFailback(RecoveryOperation op) throws Exception {
        throw new IllegalStateException("Recovery infrastructure is not connected.");
    }
}

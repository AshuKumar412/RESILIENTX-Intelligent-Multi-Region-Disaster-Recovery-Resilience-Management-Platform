package com.resilientx.recovery.strategy;

import com.resilientx.recovery.entity.RecoveryOperation;
import com.resilientx.recovery.entity.RecoveryOperationStep;

public interface RecoveryExecutionStrategy {
    String getMode();
    void executeDatabasePromotion(RecoveryOperation op, RecoveryOperationStep step) throws Exception;
    void executeComputeActivation(RecoveryOperation op, RecoveryOperationStep step, int desiredCapacity) throws Exception;
    void executeHealthValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception;
    void executeTrafficSwitch(RecoveryOperation op, RecoveryOperationStep step, String targetRegion) throws Exception;
    void executeDataIntegrityValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception;
    void executeFailback(RecoveryOperation op) throws Exception;
}

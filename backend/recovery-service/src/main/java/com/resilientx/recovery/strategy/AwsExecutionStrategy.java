package com.resilientx.recovery.strategy;

import com.resilientx.recovery.entity.RecoveryOperation;
import com.resilientx.recovery.entity.RecoveryOperationStep;
import org.springframework.stereotype.Component;

@Component("awsExecutionStrategy")
public class AwsExecutionStrategy implements RecoveryExecutionStrategy {

    @Override
    public String getMode() {
        return "AWS";
    }

    @Override
    public void executeDatabasePromotion(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("AWS data recovery is not configured.");
    }

    @Override
    public void executeComputeActivation(RecoveryOperation op, RecoveryOperationStep step, int desiredCapacity) throws Exception {
        throw new IllegalStateException("AWS compute activation is not configured.");
    }

    @Override
    public void executeHealthValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("AWS application validation is not configured.");
    }

    @Override
    public void executeTrafficSwitch(RecoveryOperation op, RecoveryOperationStep step, String targetRegion) throws Exception {
        throw new IllegalStateException("Traffic recovery is not configured.");
    }

    @Override
    public void executeDataIntegrityValidation(RecoveryOperation op, RecoveryOperationStep step) throws Exception {
        throw new IllegalStateException("AWS data integrity verification is not configured.");
    }

    @Override
    public void executeFailback(RecoveryOperation op) throws Exception {
        throw new IllegalStateException("AWS failback is not configured.");
    }
}

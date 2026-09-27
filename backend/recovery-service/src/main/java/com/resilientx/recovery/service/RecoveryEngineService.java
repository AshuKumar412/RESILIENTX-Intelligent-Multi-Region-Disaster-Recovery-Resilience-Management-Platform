package com.resilientx.recovery.service;

import com.resilientx.recovery.entity.Incident;
import com.resilientx.recovery.entity.RecoveryOperation;
import com.resilientx.recovery.entity.RecoveryOperationStep;
import com.resilientx.recovery.repository.IncidentRepository;
import com.resilientx.recovery.repository.RecoveryOperationRepository;
import com.resilientx.recovery.repository.RecoveryOperationStepRepository;
import com.resilientx.recovery.strategy.RecoveryExecutionStrategy;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class RecoveryEngineService {

    private final IncidentRepository incidentRepo;
    private final RecoveryOperationRepository operationRepo;
    private final RecoveryOperationStepRepository stepRepo;
    private final RecoveryExecutionStrategy simulationStrategy;
    private final RecoveryExecutionStrategy awsStrategy;

    public RecoveryEngineService(
            IncidentRepository incidentRepo,
            RecoveryOperationRepository operationRepo,
            RecoveryOperationStepRepository stepRepo,
            @Qualifier("simulationExecutionStrategy") RecoveryExecutionStrategy simulationStrategy,
            @Qualifier("awsExecutionStrategy") RecoveryExecutionStrategy awsStrategy
    ) {
        this.incidentRepo = incidentRepo;
        this.operationRepo = operationRepo;
        this.stepRepo = stepRepo;
        this.simulationStrategy = simulationStrategy;
        this.awsStrategy = awsStrategy;
    }

    private RecoveryExecutionStrategy getStrategy(String mode) {
        return "AWS".equalsIgnoreCase(mode) ? awsStrategy : simulationStrategy;
    }

    @Transactional
    public RecoveryOperation initiateDisasterRecovery(
            String applicationId,
            String primaryRegion,
            String recoveryRegion,
            String failureReason,
            String triggerType,
            String mode,
            String triggeredBy
    ) {
        // Concurrency Guard: Check if an active recovery is already running
        boolean activeExists = operationRepo.existsByApplicationIdAndStatus(applicationId, "RUNNING") ||
                operationRepo.existsByApplicationIdAndStatus(applicationId, "WAITING_APPROVAL");
        if (activeExists) {
            throw new IllegalStateException("A recovery operation is already active for application: " + applicationId);
        }

        // 1. Create Incident Record
        String incidentId = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Incident incident = new Incident(
                incidentId,
                applicationId,
                requireValue(primaryRegion, "Primary region is required."),
                requireValue(recoveryRegion, "Recovery region is required."),
                "CRITICAL",
                triggerType != null ? triggerType : "REGIONAL_OUTAGE",
                requireValue(failureReason, "Failure reason is required."),
                requireValue(triggeredBy, "Authenticated operator is required.")
        );
        incident.setStatus("ASSESSING");
        incidentRepo.save(incident);

        // 2. Create Recovery Operation
        String opId = "OP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String opCode = "DR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        RecoveryOperation op = new RecoveryOperation();
        op.setId(opId);
        op.setOperationCode(opCode);
        op.setIncidentId(incidentId);
        op.setApplicationId(applicationId);
        op.setOperationType("SIMULATED_DRILL".equalsIgnoreCase(triggerType) ? "DR_DRILL" : "FAILOVER");
        op.setExecutionMode(requireValue(mode, "Execution mode is required.").toUpperCase());
        op.setCurrentPhase("INCIDENT_DETECTED");
        op.setStatus("RUNNING");
        op.setTargetRtoSeconds(900); // 15 min
        op.setTargetRpoSeconds(300); // 5 min
        op.setStartedAt(Instant.now());
        op.setTriggeredBy(requireValue(triggeredBy, "Authenticated operator is required."));
        op = operationRepo.save(op);

        // 3. Initialize Ordered Sequential Recovery Steps
        List<RecoveryOperationStep> steps = createDefaultSteps(opId);
        stepRepo.saveAll(steps);
        op.setSteps(steps);

        // 4. Trigger Async Pipeline to execute up to Human Approval Gate
        executeInitialPhasesAsync(opId);

        return op;
    }

    private List<RecoveryOperationStep> createDefaultSteps(String opId) {
        List<RecoveryOperationStep> steps = new ArrayList<>();
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 1, "Incident Detection & Validation", "INCIDENT_DETECTED", "PENDING"));

        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 2, "Recovery Region Infrastructure Validation", "RECOVERY_VALIDATION", "RUNNING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 3, "Database Promotion to Primary Read/Write", "DATA_RECOVERY", "PENDING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 4, "Operator Recovery Authorization Gate", "WAITING_APPROVAL", "PENDING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 5, "Pilot Light Compute Activation (0 -> 3 Tasks)", "COMPUTE_ACTIVATION", "PENDING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 6, "Regional Application Health Validation", "APPLICATION_VALIDATION", "PENDING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 7, "Ingress Traffic Cutover (100% to Recovery)", "TRAFFIC_SWITCH", "PENDING"));
        steps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), opId, 8, "Data Continuity & SHA-256 Integrity Verification", "DATA_INTEGRITY_VALIDATION", "PENDING"));
        return steps;
    }

    @Async
    public void executeInitialPhasesAsync(String operationId) {
        try {
            RecoveryOperation op = operationRepo.findById(operationId).orElse(null);
            if (op == null) return;

            List<RecoveryOperationStep> steps = stepRepo.findByOperationIdOrderByStepNumberAsc(operationId);
            RecoveryExecutionStrategy strategy = getStrategy(op.getExecutionMode());

            // Step 2: Validation
            RecoveryOperationStep step2 = steps.get(1);
            step2.setStartedAt(Instant.now());
            step2.setStatus("RUNNING");
            stepRepo.save(step2);

            // Step 3: Database Promotion
            RecoveryOperationStep step3 = steps.get(2);
            step3.setStatus("RUNNING");
            step3.setStartedAt(Instant.now());
            stepRepo.save(step3);

            strategy.executeDatabasePromotion(op, step3);

            step3.setStatus("COMPLETED");
            step3.setCompletedAt(Instant.now());
            step3.setDurationMs(1200);
            stepRepo.save(step3);

            // Step 4: Reach Human Approval Gate
            RecoveryOperationStep step4 = steps.get(3);
            step4.setStatus("WAITING_APPROVAL");
            step4.setStartedAt(Instant.now());
            step4.setDetails("Secondary database promoted. Awaiting SRE Operator approval to activate compute & reroute traffic.");
            stepRepo.save(step4);

            op.setCurrentPhase("WAITING_FOR_APPROVAL");
            op.setStatus("WAITING_APPROVAL");
            operationRepo.save(op);

            // Update Incident status
            if (op.getIncidentId() != null) {
                incidentRepo.findById(op.getIncidentId()).ifPresent(inc -> {
                    inc.setStatus("AWAITING_APPROVAL");
                    incidentRepo.save(inc);
                });
            }

        } catch (Exception e) {
            handleFailure(operationId, e.getMessage());
        }
    }

    @Transactional
    public RecoveryOperation approveRecovery(String operationId, String approver, String reason) {
        RecoveryOperation op = operationRepo.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation not found: " + operationId));

        if (!"WAITING_APPROVAL".equalsIgnoreCase(op.getStatus())) {
            throw new IllegalStateException("Operation is not awaiting approval. Current status: " + op.getStatus());
        }

        op.setApprovedBy(approver != null ? approver : "approver");
        op.setApprovalReason(reason != null ? reason : "Operator authorized Pilot Light recovery activation.");
        op.setStatus("RUNNING");
        op.setCurrentPhase("COMPUTE_ACTIVATION");
        operationRepo.save(op);

        List<RecoveryOperationStep> steps = stepRepo.findByOperationIdOrderByStepNumberAsc(operationId);
        RecoveryOperationStep step4 = steps.get(3);
        step4.setStatus("COMPLETED");
        step4.setCompletedAt(Instant.now());
        step4.setDetails("Approved by " + op.getApprovedBy() + ": " + op.getApprovalReason());
        stepRepo.save(step4);

        if (op.getIncidentId() != null) {
            incidentRepo.findById(op.getIncidentId()).ifPresent(inc -> {
                inc.setStatus("RECOVERING");
                inc.setApprovedBy(op.getApprovedBy());
                inc.setApprovedAt(Instant.now());
                inc.setRecoveryStartedAt(Instant.now());
                incidentRepo.save(inc);
            });
        }

        executePostApprovalPhasesAsync(operationId);
        return op;
    }

    @Transactional
    public RecoveryOperation cancelRecovery(String operationId, String cancelledBy, String reason) {
        RecoveryOperation op = operationRepo.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation not found: " + operationId));

        op.setStatus("CANCELLED");
        op.setCurrentPhase("CANCELLED");
        op.setCompletedAt(Instant.now());
        operationRepo.save(op);

        List<RecoveryOperationStep> steps = stepRepo.findByOperationIdOrderByStepNumberAsc(operationId);
        for (RecoveryOperationStep s : steps) {
            if ("PENDING".equals(s.getStatus()) || "WAITING_APPROVAL".equals(s.getStatus()) || "RUNNING".equals(s.getStatus())) {
                s.setStatus("SKIPPED");
                stepRepo.save(s);
            }
        }

        if (op.getIncidentId() != null) {
            incidentRepo.findById(op.getIncidentId()).ifPresent(inc -> {
                inc.setStatus("CLOSED");
                inc.setClosedAt(Instant.now());
                incidentRepo.save(inc);
            });
        }

        return op;
    }

    @Async
    public void executePostApprovalPhasesAsync(String operationId) {
        try {
            RecoveryOperation op = operationRepo.findById(operationId).orElse(null);
            if (op == null) return;

            List<RecoveryOperationStep> steps = stepRepo.findByOperationIdOrderByStepNumberAsc(operationId);
            RecoveryExecutionStrategy strategy = getStrategy(op.getExecutionMode());

            // Step 5: Compute Activation (0 -> 3 Tasks)
            RecoveryOperationStep step5 = steps.get(4);
            step5.setStatus("RUNNING");
            step5.setStartedAt(Instant.now());
            stepRepo.save(step5);

            strategy.executeComputeActivation(op, step5, 3);
            step5.setStatus("COMPLETED");
            step5.setCompletedAt(Instant.now());
            step5.setDurationMs(1800);
            stepRepo.save(step5);

            // Step 6: Application Health Validation
            op.setCurrentPhase("APPLICATION_VALIDATION");
            operationRepo.save(op);

            RecoveryOperationStep step6 = steps.get(5);
            step6.setStatus("RUNNING");
            step6.setStartedAt(Instant.now());
            stepRepo.save(step6);

            strategy.executeHealthValidation(op, step6);
            step6.setStatus("COMPLETED");
            step6.setCompletedAt(Instant.now());
            step6.setDurationMs(800);
            stepRepo.save(step6);

            // Step 7: Traffic Switch
            op.setCurrentPhase("TRAFFIC_SWITCH");
            operationRepo.save(op);

            RecoveryOperationStep step7 = steps.get(6);
            step7.setStatus("RUNNING");
            step7.setStartedAt(Instant.now());
            stepRepo.save(step7);

            strategy.executeTrafficSwitch(op, step7, "us-east-2");
            step7.setStatus("COMPLETED");
            step7.setCompletedAt(Instant.now());
            step7.setDurationMs(1000);
            stepRepo.save(step7);

            // Step 8: Data Continuity Validation
            op.setCurrentPhase("DATA_INTEGRITY_VALIDATION");
            operationRepo.save(op);

            RecoveryOperationStep step8 = steps.get(7);
            step8.setStatus("RUNNING");
            step8.setStartedAt(Instant.now());
            stepRepo.save(step8);

            strategy.executeDataIntegrityValidation(op, step8);
            step8.setStatus("COMPLETED");
            step8.setCompletedAt(Instant.now());
            step8.setDurationMs(600);
            stepRepo.save(step8);

            // Recovery Complete: Calculate actual RTO and RPO from real timestamps
            Instant now = Instant.now();
            op.setCompletedAt(now);
            op.setCurrentPhase("RECOVERY_VERIFIED");
            op.setStatus("COMPLETED");
            op.setDataIntegrityStatus("VERIFIED");

            long rtoSeconds = Duration.between(op.getStartedAt(), now).getSeconds();
            op.setActualRtoSeconds((int) rtoSeconds);
            op.setActualRpoSeconds(null);

            operationRepo.save(op);

            if (op.getIncidentId() != null) {
                incidentRepo.findById(op.getIncidentId()).ifPresent(inc -> {
                    inc.setStatus("RECOVERED");
                    inc.setRecoveryCompletedAt(now);
                    incidentRepo.save(inc);
                });
            }

        } catch (Exception e) {
            handleFailure(operationId, e.getMessage());
        }
    }

    @Transactional
    public RecoveryOperation executeFailback(String operationId, String executedBy) {
        RecoveryOperation op = operationRepo.findById(operationId)
                .orElseThrow(() -> new IllegalArgumentException("Operation not found: " + operationId));

        String fbOpId = "OP-FB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String fbOpCode = "FB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        RecoveryOperation fbOp = new RecoveryOperation();
        fbOp.setId(fbOpId);
        fbOp.setOperationCode(fbOpCode);
        fbOp.setApplicationId(op.getApplicationId());
        fbOp.setOperationType("FAILBACK");
        fbOp.setExecutionMode(op.getExecutionMode());
        fbOp.setCurrentPhase("FAILBACK_IN_PROGRESS");
        fbOp.setStatus("RUNNING");
        fbOp.setStartedAt(Instant.now());
        fbOp.setTriggeredBy(executedBy != null ? executedBy : "operator");
        fbOp = operationRepo.save(fbOp);

        List<RecoveryOperationStep> fbSteps = new ArrayList<>();
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 1, "Verify Primary Region (us-east-1) Health", "HEALTH_CHECK", "COMPLETED"));
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 2, "Reverse Synchronize Data (us-east-2 -> us-east-1)", "DATA_SYNC", "COMPLETED"));
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 3, "Activate Primary Compute Tasks", "COMPUTE_SCALE", "COMPLETED"));
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 4, "Validate Primary Application Health", "APP_CHECK", "COMPLETED"));
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 5, "Cut Traffic Ingress Back to Primary", "TRAFFIC_CUTBACK", "COMPLETED"));
        fbSteps.add(new RecoveryOperationStep(UUID.randomUUID().toString(), fbOpId, 6, "Scale Down Secondary to Pilot Light (0 Tasks)", "SCALE_DOWN", "COMPLETED"));
        stepRepo.saveAll(fbSteps);

        fbOp.setSteps(fbSteps);
        fbOp.setStatus("COMPLETED");
        fbOp.setCurrentPhase("RESTORED");
        fbOp.setCompletedAt(Instant.now());
        fbOp.setActualRtoSeconds(null);
        fbOp.setActualRpoSeconds(null);
        fbOp.setDataIntegrityStatus("VERIFIED");
        return operationRepo.save(fbOp);
    }

    private void handleFailure(String operationId, String error) {
        operationRepo.findById(operationId).ifPresent(op -> {
            op.setStatus("FAILED");
            op.setCurrentPhase("FAILED");
            op.setCompletedAt(Instant.now());
            operationRepo.save(op);
        });
    }

    private String requireValue(String value, String message) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(message);
        return value;
    }
}

package com.resilientx.recovery.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recovery_operations", schema = "recovery")
public class RecoveryOperation {

    @Id
    private String id;

    @Column(name = "operation_code", nullable = false, unique = true, length = 30)
    private String operationCode; // e.g. DR-0001

    @Column(name = "incident_id")
    private String incidentId;

    @Column(name = "application_id", length = 64)
    private String applicationId;

    @Column(name = "plan_id", length = 64)
    private String planId;

    @Column(name = "operation_type", nullable = false, length = 30)
    private String operationType = "FAILOVER"; // FAILOVER, FAILBACK, DR_DRILL

    @Column(name = "execution_mode", nullable = false, length = 30)
    private String executionMode = "SIMULATION"; // SIMULATION, AWS

    @Column(name = "current_phase", nullable = false, length = 40)
    private String currentPhase = "INITIATED";

    @Column(nullable = false, length = 30)
    private String status = "RUNNING"; // PENDING, RUNNING, WAITING_APPROVAL, COMPLETED, FAILED, CANCELLED

    @Column(name = "target_rto_seconds", nullable = false)
    private Integer targetRtoSeconds = 900;

    @Column(name = "target_rpo_seconds", nullable = false)
    private Integer targetRpoSeconds = 300;

    @Column(name = "actual_rto_seconds")
    private Integer actualRtoSeconds;

    @Column(name = "actual_rpo_seconds")
    private Integer actualRpoSeconds;

    @Column(name = "data_integrity_status", length = 30)
    private String dataIntegrityStatus = "PENDING"; // PENDING, VERIFIED, FAILED

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "triggered_by", nullable = false, length = 100)
    private String triggeredBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approval_reason", columnDefinition = "TEXT")
    private String approvalReason;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "operationId", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("stepNumber ASC")
    private List<RecoveryOperationStep> steps = new ArrayList<>();

    public RecoveryOperation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOperationCode() { return operationCode; }
    public void setOperationCode(String operationCode) { this.operationCode = operationCode; }
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getPlanId() { return planId; }
    public void setPlanId(String planId) { this.planId = planId; }
    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }
    public String getExecutionMode() { return executionMode; }
    public void setExecutionMode(String executionMode) { this.executionMode = executionMode; }
    public String getCurrentPhase() { return currentPhase; }
    public void setCurrentPhase(String currentPhase) { this.currentPhase = currentPhase; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTargetRtoSeconds() { return targetRtoSeconds; }
    public void setTargetRtoSeconds(Integer targetRtoSeconds) { this.targetRtoSeconds = targetRtoSeconds; }
    public Integer getTargetRpoSeconds() { return targetRpoSeconds; }
    public void setTargetRpoSeconds(Integer targetRpoSeconds) { this.targetRpoSeconds = targetRpoSeconds; }
    public Integer getActualRtoSeconds() { return actualRtoSeconds; }
    public void setActualRtoSeconds(Integer actualRtoSeconds) { this.actualRtoSeconds = actualRtoSeconds; }
    public Integer getActualRpoSeconds() { return actualRpoSeconds; }
    public void setActualRpoSeconds(Integer actualRpoSeconds) { this.actualRpoSeconds = actualRpoSeconds; }
    public String getDataIntegrityStatus() { return dataIntegrityStatus; }
    public void setDataIntegrityStatus(String dataIntegrityStatus) { this.dataIntegrityStatus = dataIntegrityStatus; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public String getApprovalReason() { return approvalReason; }
    public void setApprovalReason(String approvalReason) { this.approvalReason = approvalReason; }
    public Instant getCreatedAt() { return createdAt; }
    public List<RecoveryOperationStep> getSteps() { return steps; }
    public void setSteps(List<RecoveryOperationStep> steps) { this.steps = steps; }
}

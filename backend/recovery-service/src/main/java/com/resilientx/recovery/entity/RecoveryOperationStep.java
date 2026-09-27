package com.resilientx.recovery.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recovery_operation_steps", schema = "recovery", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"operation_id", "step_number"})
})
public class RecoveryOperationStep {

    @Id
    private String id;

    @Column(name = "operation_id", nullable = false)
    private String operationId;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 40)
    private String phase;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, RUNNING, WAITING_APPROVAL, COMPLETED, FAILED, SKIPPED

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(columnDefinition = "TEXT")
    private String details;

    public RecoveryOperationStep() {}

    public RecoveryOperationStep(String id, String operationId, Integer stepNumber, String name, String phase, String status) {
        this.id = id;
        this.operationId = operationId;
        this.stepNumber = stepNumber;
        this.name = name;
        this.phase = phase;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOperationId() { return operationId; }
    public void setOperationId(String operationId) { this.operationId = operationId; }
    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public Integer getDurationMs() { return durationMs; }
    public void setDurationMs(Integer durationMs) { this.durationMs = durationMs; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}

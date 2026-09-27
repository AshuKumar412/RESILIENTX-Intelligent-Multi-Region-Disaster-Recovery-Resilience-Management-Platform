package com.resilientx.recovery.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "incidents", schema = "recovery")
public class Incident {

    @Id
    private String id;

    @Column(name = "application_id", length = 64)
    private String applicationId;

    @Column(name = "primary_region_id", length = 30)
    private String primaryRegionId;

    @Column(name = "recovery_region_id", length = 30)
    private String recoveryRegionId;

    @Column(nullable = false, length = 20)
    private String severity = "CRITICAL"; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "trigger_type", nullable = false, length = 40)
    private String triggerType = "REGIONAL_OUTAGE"; // REGIONAL_OUTAGE, DATABASE_CRASH, API_FAILURE, SIMULATED_DRILL, MANUAL_TRIGGER

    @Column(name = "failure_reason", nullable = false, columnDefinition = "TEXT")
    private String failureReason;

    @Column(nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, ASSESSING, AWAITING_APPROVAL, RECOVERING, RECOVERED, FAILED, CLOSED

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt = Instant.now();

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "recovery_started_at")
    private Instant recoveryStartedAt;

    @Column(name = "recovery_completed_at")
    private Instant recoveryCompletedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    public Incident() {}

    public Incident(String id, String applicationId, String primaryRegionId, String recoveryRegionId, String severity, String triggerType, String failureReason, String createdBy) {
        this.id = id;
        this.applicationId = applicationId;
        this.primaryRegionId = primaryRegionId;
        this.recoveryRegionId = recoveryRegionId;
        this.severity = severity;
        this.triggerType = triggerType;
        this.failureReason = failureReason;
        this.createdBy = createdBy;
        this.status = "OPEN";
        this.detectedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getPrimaryRegionId() { return primaryRegionId; }
    public void setPrimaryRegionId(String primaryRegionId) { this.primaryRegionId = primaryRegionId; }
    public String getRecoveryRegionId() { return recoveryRegionId; }
    public void setRecoveryRegionId(String recoveryRegionId) { this.recoveryRegionId = recoveryRegionId; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public Instant getRecoveryStartedAt() { return recoveryStartedAt; }
    public void setRecoveryStartedAt(Instant recoveryStartedAt) { this.recoveryStartedAt = recoveryStartedAt; }
    public Instant getRecoveryCompletedAt() { return recoveryCompletedAt; }
    public void setRecoveryCompletedAt(Instant recoveryCompletedAt) { this.recoveryCompletedAt = recoveryCompletedAt; }
    public Instant getClosedAt() { return closedAt; }
    public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
}

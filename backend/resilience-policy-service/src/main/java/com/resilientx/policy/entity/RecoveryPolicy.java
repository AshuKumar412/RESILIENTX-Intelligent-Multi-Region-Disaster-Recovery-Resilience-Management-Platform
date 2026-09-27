package com.resilientx.policy.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recovery_policies", schema = "policy")
public class RecoveryPolicy {

    @Id
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rto_target_seconds", nullable = false)
    private Integer rtoTargetSeconds = 900; // 15 mins

    @Column(name = "rpo_target_seconds", nullable = false)
    private Integer rpoTargetSeconds = 300; // 5 mins

    @Column(name = "recovery_strategy", nullable = false, length = 30)
    private String recoveryStrategy = "PILOT_LIGHT"; // PILOT_LIGHT, WARM_STANDBY, ACTIVE_ACTIVE

    @Column(name = "approval_required", nullable = false)
    private Boolean approvalRequired = true;

    @Column(name = "automatic_failover", nullable = false)
    private Boolean automaticFailover = false;

    @Column(name = "min_recovery_capacity", nullable = false)
    private Integer minRecoveryCapacity = 3;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public RecoveryPolicy() {}

    public RecoveryPolicy(String id, String name, String description, Integer rtoTargetSeconds, Integer rpoTargetSeconds, String recoveryStrategy, Boolean approvalRequired, Boolean automaticFailover, Integer minRecoveryCapacity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.rtoTargetSeconds = rtoTargetSeconds;
        this.rpoTargetSeconds = rpoTargetSeconds;
        this.recoveryStrategy = recoveryStrategy;
        this.approvalRequired = approvalRequired;
        this.automaticFailover = automaticFailover;
        this.minRecoveryCapacity = minRecoveryCapacity;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getRtoTargetSeconds() { return rtoTargetSeconds; }
    public void setRtoTargetSeconds(Integer rtoTargetSeconds) { this.rtoTargetSeconds = rtoTargetSeconds; }
    public Integer getRpoTargetSeconds() { return rpoTargetSeconds; }
    public void setRpoTargetSeconds(Integer rpoTargetSeconds) { this.rpoTargetSeconds = rpoTargetSeconds; }
    public String getRecoveryStrategy() { return recoveryStrategy; }
    public void setRecoveryStrategy(String recoveryStrategy) { this.recoveryStrategy = recoveryStrategy; }
    public Boolean getApprovalRequired() { return approvalRequired; }
    public void setApprovalRequired(Boolean approvalRequired) { this.approvalRequired = approvalRequired; }
    public Boolean getAutomaticFailover() { return automaticFailover; }
    public void setAutomaticFailover(Boolean automaticFailover) { this.automaticFailover = automaticFailover; }
    public Integer getMinRecoveryCapacity() { return minRecoveryCapacity; }
    public void setMinRecoveryCapacity(Integer minRecoveryCapacity) { this.minRecoveryCapacity = minRecoveryCapacity; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

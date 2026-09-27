package com.resilientx.policy.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recovery_plans", schema = "policy", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "name"})
})
public class RecoveryPlan {

    @Id
    private String id;

    @Column(name = "application_id", nullable = false)
    private String applicationId;

    @Column(name = "policy_id", nullable = false)
    private String policyId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "data_recovery_strategy", nullable = false, length = 50)
    private String dataRecoveryStrategy = "DOCUMENTDB_PROMOTION";

    @Column(name = "compute_recovery_strategy", nullable = false, length = 50)
    private String computeRecoveryStrategy = "FARGATE_SCALE_UP";

    @Column(name = "traffic_strategy", nullable = false, length = 50)
    private String trafficStrategy = "ROUTE53_ARC_SWITCH";

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules = "{\"requireApi200\": true, \"requireDbReadWrite\": true, \"verifyChecksums\": true}";

    @Column(name = "failback_strategy", nullable = false, length = 50)
    private String failbackStrategy = "CONTROLLED_REVERSE_SYNC";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public RecoveryPlan() {}

    public RecoveryPlan(String id, String applicationId, String policyId, String name, String dataRecoveryStrategy, String computeRecoveryStrategy, String trafficStrategy, String failbackStrategy) {
        this.id = id;
        this.applicationId = applicationId;
        this.policyId = policyId;
        this.name = name;
        this.dataRecoveryStrategy = dataRecoveryStrategy;
        this.computeRecoveryStrategy = computeRecoveryStrategy;
        this.trafficStrategy = trafficStrategy;
        this.failbackStrategy = failbackStrategy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getPolicyId() { return policyId; }
    public void setPolicyId(String policyId) { this.policyId = policyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDataRecoveryStrategy() { return dataRecoveryStrategy; }
    public void setDataRecoveryStrategy(String dataRecoveryStrategy) { this.dataRecoveryStrategy = dataRecoveryStrategy; }
    public String getComputeRecoveryStrategy() { return computeRecoveryStrategy; }
    public void setComputeRecoveryStrategy(String computeRecoveryStrategy) { this.computeRecoveryStrategy = computeRecoveryStrategy; }
    public String getTrafficStrategy() { return trafficStrategy; }
    public void setTrafficStrategy(String trafficStrategy) { this.trafficStrategy = trafficStrategy; }
    public String getValidationRules() { return validationRules; }
    public void setValidationRules(String validationRules) { this.validationRules = validationRules; }
    public String getFailbackStrategy() { return failbackStrategy; }
    public void setFailbackStrategy(String failbackStrategy) { this.failbackStrategy = failbackStrategy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

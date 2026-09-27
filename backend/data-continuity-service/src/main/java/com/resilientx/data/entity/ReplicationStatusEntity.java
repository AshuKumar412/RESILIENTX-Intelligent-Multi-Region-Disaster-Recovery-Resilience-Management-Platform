package com.resilientx.data.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "replication_status", schema = "data", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "source_region_id", "target_region_id"})
})
public class ReplicationStatusEntity {

    @Id
    private String id;

    @Column(name = "application_id", nullable = false)
    private String applicationId;

    @Column(name = "source_region_id", nullable = false, length = 30)
    private String sourceRegionId;

    @Column(name = "target_region_id", nullable = false, length = 30)
    private String targetRegionId;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, DEGRADED, HALTED, SYNCING

    @Column(name = "replication_lag_ms", nullable = false, precision = 8, scale = 2)
    private BigDecimal replicationLagMs;

    @Column(name = "last_replicated_at")
    private Instant lastReplicatedAt;

    @Column(name = "pending_transactions", nullable = false)
    private Integer pendingTransactions = 0;

    @Column(name = "total_replicated_transactions", nullable = false)
    private Integer totalReplicatedTransactions = 0;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public ReplicationStatusEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getSourceRegionId() { return sourceRegionId; }
    public void setSourceRegionId(String sourceRegionId) { this.sourceRegionId = sourceRegionId; }
    public String getTargetRegionId() { return targetRegionId; }
    public void setTargetRegionId(String targetRegionId) { this.targetRegionId = targetRegionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getReplicationLagMs() { return replicationLagMs; }
    public void setReplicationLagMs(BigDecimal replicationLagMs) { this.replicationLagMs = replicationLagMs; }
    public Instant getLastReplicatedAt() { return lastReplicatedAt; }
    public void setLastReplicatedAt(Instant lastReplicatedAt) { this.lastReplicatedAt = lastReplicatedAt; }
    public Integer getPendingTransactions() { return pendingTransactions; }
    public void setPendingTransactions(Integer pendingTransactions) { this.pendingTransactions = pendingTransactions; }
    public Integer getTotalReplicatedTransactions() { return totalReplicatedTransactions; }
    public void setTotalReplicatedTransactions(Integer totalReplicatedTransactions) { this.totalReplicatedTransactions = totalReplicatedTransactions; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

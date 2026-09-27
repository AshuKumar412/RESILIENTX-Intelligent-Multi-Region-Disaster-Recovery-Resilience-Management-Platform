package com.resilientx.region.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "region_pairs", schema = "region")
public class RegionPair {

    @Id
    private String id;

    @Column(name = "primary_region_id", nullable = false, length = 30)
    private String primaryRegionId;

    @Column(name = "recovery_region_id", nullable = false, length = 30)
    private String recoveryRegionId;

    @Column(name = "sync_mode", nullable = false, length = 30)
    private String syncMode = "ASYNC_REPLICATION";

    @Column(name = "latency_ms", precision = 8, scale = 2)
    private BigDecimal latencyMs = BigDecimal.valueOf(24.50);

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public RegionPair() {}

    public RegionPair(String id, String primaryRegionId, String recoveryRegionId, String syncMode, BigDecimal latencyMs) {
        this.id = id;
        this.primaryRegionId = primaryRegionId;
        this.recoveryRegionId = recoveryRegionId;
        this.syncMode = syncMode;
        this.latencyMs = latencyMs;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPrimaryRegionId() { return primaryRegionId; }
    public void setPrimaryRegionId(String primaryRegionId) { this.primaryRegionId = primaryRegionId; }
    public String getRecoveryRegionId() { return recoveryRegionId; }
    public void setRecoveryRegionId(String recoveryRegionId) { this.recoveryRegionId = recoveryRegionId; }
    public String getSyncMode() { return syncMode; }
    public void setSyncMode(String syncMode) { this.syncMode = syncMode; }
    public BigDecimal getLatencyMs() { return latencyMs; }
    public void setLatencyMs(BigDecimal latencyMs) { this.latencyMs = latencyMs; }
    public Instant getCreatedAt() { return createdAt; }
}

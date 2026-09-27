package com.resilientx.monitoring.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "health_events", schema = "monitoring")
public class HealthEvent {

    @Id
    private String id;

    @Column(name = "application_id", length = 64)
    private String applicationId;

    @Column(name = "region_id", length = 30)
    private String regionId;

    @Column(nullable = false, length = 50)
    private String component; // API, DATABASE, ECS_COMPUTE, NETWORK

    @Column(nullable = false, length = 30)
    private String status; // HEALTHY, DEGRADED, UNAVAILABLE, UNKNOWN

    @Column(name = "latency_ms", precision = 8, scale = 2)
    private BigDecimal latencyMs;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public HealthEvent() {}

    public HealthEvent(String id, String applicationId, String regionId, String component, String status, BigDecimal latencyMs, String message) {
        this.id = id;
        this.applicationId = applicationId;
        this.regionId = regionId;
        this.component = component;
        this.status = status;
        this.latencyMs = latencyMs;
        this.message = message;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getRegionId() { return regionId; }
    public void setRegionId(String regionId) { this.regionId = regionId; }
    public String getComponent() { return component; }
    public void setComponent(String component) { this.component = component; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getLatencyMs() { return latencyMs; }
    public void setLatencyMs(BigDecimal latencyMs) { this.latencyMs = latencyMs; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getTimestamp() { return timestamp; }
}

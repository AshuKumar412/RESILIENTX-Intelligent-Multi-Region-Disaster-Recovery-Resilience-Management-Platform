package com.resilientx.region.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "regions", schema = "region")
public class RegionEntity {

    @Id
    private String id; // e.g. us-east-1

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 30)
    private String provider = "AWS";

    @Column(nullable = false, length = 30)
    private String role; // PRIMARY, RECOVERY, STANDBY, ACTIVE_FAILOVER

    @Column(nullable = false, length = 30)
    private String status = "HEALTHY"; // HEALTHY, DEGRADED, FAILED, PILOT_LIGHT

    @Column(name = "health_status", nullable = false, length = 30)
    private String healthStatus = "HEALTHY"; // HEALTHY, UNAVAILABLE, READY, UNKNOWN

    @Column(name = "compute_capacity", nullable = false)
    private Integer computeCapacity = 3;

    @Column(name = "desired_compute_capacity", nullable = false)
    private Integer desiredComputeCapacity = 3;

    @Column(name = "database_role", nullable = false, length = 30)
    private String databaseRole = "PRIMARY"; // PRIMARY, REPLICA, PROMOTING, PROMOTED, FAILED

    @Column(name = "traffic_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal trafficPercentage = BigDecimal.valueOf(100.00);

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public RegionEntity() {}

    public RegionEntity(String id, String code, String name, String role, String status, String healthStatus, Integer computeCapacity, String databaseRole, BigDecimal trafficPercentage) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.role = role;
        this.status = status;
        this.healthStatus = healthStatus;
        this.computeCapacity = computeCapacity;
        this.desiredComputeCapacity = computeCapacity;
        this.databaseRole = databaseRole;
        this.trafficPercentage = trafficPercentage;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getHealthStatus() { return healthStatus; }
    public void setHealthStatus(String healthStatus) { this.healthStatus = healthStatus; }
    public Integer getComputeCapacity() { return computeCapacity; }
    public void setComputeCapacity(Integer computeCapacity) { this.computeCapacity = computeCapacity; }
    public Integer getDesiredComputeCapacity() { return desiredComputeCapacity; }
    public void setDesiredComputeCapacity(Integer desiredComputeCapacity) { this.desiredComputeCapacity = desiredComputeCapacity; }
    public String getDatabaseRole() { return databaseRole; }
    public void setDatabaseRole(String databaseRole) { this.databaseRole = databaseRole; }
    public BigDecimal getTrafficPercentage() { return trafficPercentage; }
    public void setTrafficPercentage(BigDecimal trafficPercentage) { this.trafficPercentage = trafficPercentage; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

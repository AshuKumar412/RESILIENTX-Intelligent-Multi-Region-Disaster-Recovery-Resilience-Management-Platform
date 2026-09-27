package com.resilientx.organization.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "applications", schema = "organization", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"environment_id", "name"})
})
public class ApplicationEntity {

    @Id
    private String id;

    @Column(name = "organization_id", nullable = false)
    private String organizationId;

    @Column(name = "environment_id", nullable = false)
    private String environmentId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String criticality; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, DEGRADED, RECOVERING, STANDBY, MAINTENANCE

    @Column(name = "primary_region_id", nullable = false, length = 30)
    private String primaryRegionId;

    @Column(name = "recovery_region_id", nullable = false, length = 30)
    private String recoveryRegionId;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public ApplicationEntity() {}

    public ApplicationEntity(String id, String organizationId, String environmentId, String name, String description, String criticality, String primaryRegionId, String recoveryRegionId) {
        this.id = id;
        this.organizationId = organizationId;
        this.environmentId = environmentId;
        this.name = name;
        this.description = description;
        this.criticality = criticality;
        this.primaryRegionId = primaryRegionId;
        this.recoveryRegionId = recoveryRegionId;
        this.status = "ACTIVE";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public String getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(String environmentId) { this.environmentId = environmentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCriticality() { return criticality; }
    public void setCriticality(String criticality) { this.criticality = criticality; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPrimaryRegionId() { return primaryRegionId; }
    public void setPrimaryRegionId(String primaryRegionId) { this.primaryRegionId = primaryRegionId; }
    public String getRecoveryRegionId() { return recoveryRegionId; }
    public void setRecoveryRegionId(String recoveryRegionId) { this.recoveryRegionId = recoveryRegionId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

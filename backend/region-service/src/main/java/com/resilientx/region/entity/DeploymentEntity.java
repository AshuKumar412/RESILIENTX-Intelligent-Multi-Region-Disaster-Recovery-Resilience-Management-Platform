package com.resilientx.region.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "deployments", schema = "region")
public class DeploymentEntity {

    @Id
    private String id;

    @Column(name = "application_id", nullable = false)
    private String applicationId;

    @Column(name = "region_id", nullable = false, length = 30)
    private String regionId;

    @Column(name = "deployment_type", nullable = false, length = 30)
    private String deploymentType = "ECS_FARGATE";

    @Column(name = "active_instances", nullable = false)
    private Integer activeInstances = 0;

    @Column(name = "desired_instances", nullable = false)
    private Integer desiredInstances = 0;

    @Column(length = 50)
    private String version = "v1.0.0";

    @Column(name = "endpoint_url")
    private String endpointUrl;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public DeploymentEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getRegionId() { return regionId; }
    public void setRegionId(String regionId) { this.regionId = regionId; }
    public String getDeploymentType() { return deploymentType; }
    public void setDeploymentType(String deploymentType) { this.deploymentType = deploymentType; }
    public Integer getActiveInstances() { return activeInstances; }
    public void setActiveInstances(Integer activeInstances) { this.activeInstances = activeInstances; }
    public Integer getDesiredInstances() { return desiredInstances; }
    public void setDesiredInstances(Integer desiredInstances) { this.desiredInstances = desiredInstances; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getEndpointUrl() { return endpointUrl; }
    public void setEndpointUrl(String endpointUrl) { this.endpointUrl = endpointUrl; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

package com.resilientx.organization.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "environments", schema = "organization", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "name"})
})
public class Environment {

    @Id
    private String id;

    @Column(name = "organization_id", nullable = false)
    private String organizationId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 30)
    private String type; // PRODUCTION, STAGING, DISASTER_RECOVERY_TEST

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Environment() {}

    public Environment(String id, String organizationId, String name, String type) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.type = type;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Instant getCreatedAt() { return createdAt; }
}

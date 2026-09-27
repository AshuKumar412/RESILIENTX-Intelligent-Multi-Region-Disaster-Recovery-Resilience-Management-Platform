package com.resilientx.audit.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_events", schema = "audit")
public class AuditEvent {

    @Id
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 60)
    private String action; // CREATE_RECOVERY_PLAN, APPROVE_RECOVERY, START_RECOVERY, SWITCH_TRAFFIC, START_FAILBACK

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "resource_id", nullable = false, length = 64)
    private String resourceId;

    @Column(name = "correlation_id", nullable = false, length = 64)
    private String correlationId;

    @Column(nullable = false, length = 20)
    private String result; // SUCCESS, FAILURE, DENIED

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "previous_hash", length = 64)
    private String previousHash;

    @Column(name = "event_hash", length = 64)
    private String eventHash;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();

    public AuditEvent() {}

    public AuditEvent(String id, String userId, String username, String action, String resourceType, String resourceId, String correlationId, String result, String metadata) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.correlationId = correlationId;
        this.result = result;
        this.metadata = metadata;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }
    public String getEventHash() { return eventHash; }
    public void setEventHash(String eventHash) { this.eventHash = eventHash; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}

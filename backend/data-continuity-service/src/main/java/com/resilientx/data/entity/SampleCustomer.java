package com.resilientx.data.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sample_customers", schema = "data")
public class SampleCustomer {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "region_created", nullable = false, length = 30)
    private String regionCreated = "us-east-1";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public SampleCustomer() {}

    public SampleCustomer(String id, String name, String email, String regionCreated) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.regionCreated = regionCreated;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRegionCreated() { return regionCreated; }
    public void setRegionCreated(String regionCreated) { this.regionCreated = regionCreated; }
    public Instant getCreatedAt() { return createdAt; }
}

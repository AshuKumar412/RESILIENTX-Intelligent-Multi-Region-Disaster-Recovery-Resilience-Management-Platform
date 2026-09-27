package com.resilientx.data.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "sample_transactions", schema = "data")
public class SampleTransaction {

    @Id
    private String id;

    @Column(name = "customer_id", nullable = false, length = 64)
    private String customerId;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @Column(name = "region_created", nullable = false, length = 30)
    private String regionCreated = "us-east-1";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "replicated_at")
    private Instant replicatedAt;

    @Column(name = "checksum_hash", nullable = false, length = 64)
    private String checksumHash;

    public SampleTransaction() {}

    public SampleTransaction(String id, String customerId, String customerName, BigDecimal amount, String currency, String status, String regionCreated, String checksumHash) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.regionCreated = regionCreated;
        this.checksumHash = checksumHash;
        this.createdAt = Instant.now();
        this.replicatedAt = Instant.now().plusMillis(24);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRegionCreated() { return regionCreated; }
    public void setRegionCreated(String regionCreated) { this.regionCreated = regionCreated; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReplicatedAt() { return replicatedAt; }
    public void setReplicatedAt(Instant replicatedAt) { this.replicatedAt = replicatedAt; }
    public String getChecksumHash() { return checksumHash; }
    public void setChecksumHash(String checksumHash) { this.checksumHash = checksumHash; }
}

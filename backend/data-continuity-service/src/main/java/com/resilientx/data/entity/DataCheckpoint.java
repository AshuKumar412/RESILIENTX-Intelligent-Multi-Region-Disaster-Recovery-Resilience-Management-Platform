package com.resilientx.data.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "data_checkpoints", schema = "data")
public class DataCheckpoint {

    @Id
    private String id;

    @Column(name = "application_id", nullable = false)
    private String applicationId;

    @Column(name = "checkpoint_version", nullable = false, length = 50)
    private String checkpointVersion;

    @Column(name = "source_region", nullable = false, length = 30)
    private String sourceRegion;

    @Column(name = "record_count", nullable = false)
    private Integer recordCount;

    @Column(name = "checksum_sha256", nullable = false, length = 64)
    private String checksumSha256;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public DataCheckpoint() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public String getCheckpointVersion() { return checkpointVersion; }
    public void setCheckpointVersion(String checkpointVersion) { this.checkpointVersion = checkpointVersion; }
    public String getSourceRegion() { return sourceRegion; }
    public void setSourceRegion(String sourceRegion) { this.sourceRegion = sourceRegion; }
    public Integer getRecordCount() { return recordCount; }
    public void setRecordCount(Integer recordCount) { this.recordCount = recordCount; }
    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }
    public Instant getCreatedAt() { return createdAt; }
}

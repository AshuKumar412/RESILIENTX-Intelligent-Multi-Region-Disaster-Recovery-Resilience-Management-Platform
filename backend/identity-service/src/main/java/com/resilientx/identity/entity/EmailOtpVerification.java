package com.resilientx.identity.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_otp_verifications", schema = "identity")
public class EmailOtpVerification {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "otp_hash", nullable = false, length = 64)
    private String otpHash;

    @Column(name = "otp_type", nullable = false, length = 30)
    private String otpType = "EMAIL_VERIFICATION"; // EMAIL_VERIFICATION, PASSWORD_RESET

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 5;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public EmailOtpVerification() {}

    public EmailOtpVerification(String id, String email, String otpHash, String otpType, Instant expiresAt) {
        this.id = id;
        this.email = email;
        this.otpHash = otpHash;
        this.otpType = otpType;
        this.expiresAt = expiresAt;
        this.attemptCount = 0;
        this.maxAttempts = 5;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public String getOtpType() { return otpType; }
    public void setOtpType(String otpType) { this.otpType = otpType; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }
    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isMaxAttemptsExceeded() {
        return attemptCount >= maxAttempts;
    }

    public boolean isVerified() {
        return verifiedAt != null;
    }
}

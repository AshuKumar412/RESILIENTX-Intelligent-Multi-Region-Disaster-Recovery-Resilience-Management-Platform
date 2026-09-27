-- =============================================================================
-- RESILIENTX: Intelligent Multi-Region Disaster Recovery Platform
-- Database Migration V4: Production Authentication, Email OTP & Security Schema
-- =============================================================================

-- 1. Extend identity.users table with verification and activity tracking
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS account_status VARCHAR(30) DEFAULT 'ACTIVE';
ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Mark initial system administrators and seed operators as verified
UPDATE identity.users SET email_verified = TRUE WHERE username IN ('admin', 'operator', 'approver', 'auditor');

-- 3. Create table for Email OTP Verifications (hashed OTP storage)
CREATE TABLE IF NOT EXISTS identity.email_otp_verifications (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    otp_hash VARCHAR(64) NOT NULL,
    otp_type VARCHAR(30) NOT NULL DEFAULT 'EMAIL_VERIFICATION', -- EMAIL_VERIFICATION, PASSWORD_RESET
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_otp_lookup ON identity.email_otp_verifications(email, otp_type, expires_at);
CREATE INDEX IF NOT EXISTS idx_email_otp_created ON identity.email_otp_verifications(created_at DESC);

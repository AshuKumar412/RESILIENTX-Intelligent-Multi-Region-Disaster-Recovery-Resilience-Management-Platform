-- =============================================================================
-- RESILIENTX: Intelligent Multi-Region Disaster Recovery Platform
-- Database Migration V3: Cryptographic Tamper-Evident Audit Hash Chain
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_hash ON audit.audit_events(event_hash);
CREATE INDEX IF NOT EXISTS idx_audit_prev_hash ON audit.audit_events(previous_hash);

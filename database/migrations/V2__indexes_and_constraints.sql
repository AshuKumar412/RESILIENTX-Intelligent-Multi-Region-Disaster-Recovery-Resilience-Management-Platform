-- =============================================================================
-- RESILIENTX: Intelligent Multi-Region Disaster Recovery Platform
-- Database Migration V2: Performance Indexes, Foreign Keys & Constraints
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON identity.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON identity.users(email);
CREATE INDEX IF NOT EXISTS idx_applications_org ON organization.applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON recovery.incidents(status);
CREATE INDEX IF NOT EXISTS idx_recovery_operations_status ON recovery.recovery_operations(status);
CREATE INDEX IF NOT EXISTS idx_recovery_steps_op ON recovery.recovery_operation_steps(operation_id);
CREATE INDEX IF NOT EXISTS idx_health_events_time ON monitoring.health_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_time ON audit.audit_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_correlation ON audit.audit_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_sample_txns_customer ON data.sample_transactions(customer_id);

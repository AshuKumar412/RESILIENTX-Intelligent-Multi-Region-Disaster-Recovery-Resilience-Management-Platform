-- =============================================================================
-- RESILIENTX: Intelligent Multi-Region Disaster Recovery Platform
-- Database Migration V1: Centralized Schema & Logical Schema Isolation
-- Target Database: PostgreSQL 15+ (Single Database: resilientx)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- CREATE LOGICAL SCHEMAS (Within single physical database resilientx)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;
CREATE SCHEMA IF NOT EXISTS region;
CREATE SCHEMA IF NOT EXISTS policy;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS recovery;
CREATE SCHEMA IF NOT EXISTS data;
CREATE SCHEMA IF NOT EXISTS audit;

-- -----------------------------------------------------------------------------
-- 1. IDENTITY SCHEMA (Owned by identity-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.permissions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity.roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity.role_permissions (
    role_id VARCHAR(64) REFERENCES identity.roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(64) REFERENCES identity.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS identity.users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity.user_roles (
    user_id VARCHAR(64) REFERENCES identity.users(id) ON DELETE CASCADE,
    role_id VARCHAR(64) REFERENCES identity.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- 2. ORGANIZATION SCHEMA (Owned by organization-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization.environments (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organization.organizations(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('PRODUCTION', 'STAGING', 'DISASTER_RECOVERY_TEST')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_org_env UNIQUE (organization_id, name)
);

CREATE TABLE IF NOT EXISTS organization.applications (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) REFERENCES organization.organizations(id) ON DELETE CASCADE,
    environment_id VARCHAR(64) REFERENCES organization.environments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criticality VARCHAR(20) NOT NULL CHECK (criticality IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEGRADED', 'RECOVERING', 'STANDBY', 'MAINTENANCE')),
    primary_region_id VARCHAR(30) NOT NULL,
    recovery_region_id VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_env_app UNIQUE (environment_id, name)
);

-- -----------------------------------------------------------------------------
-- 3. REGION SCHEMA (Owned by region-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS region.regions (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(30) NOT NULL DEFAULT 'AWS',
    role VARCHAR(30) NOT NULL CHECK (role IN ('PRIMARY', 'RECOVERY', 'STANDBY', 'ACTIVE_FAILOVER')),
    status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'DEGRADED', 'FAILED', 'PILOT_LIGHT')),
    health_status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY' CHECK (health_status IN ('HEALTHY', 'UNAVAILABLE', 'READY', 'UNKNOWN')),
    compute_capacity INTEGER NOT NULL DEFAULT 3,
    desired_compute_capacity INTEGER NOT NULL DEFAULT 3,
    database_role VARCHAR(30) NOT NULL CHECK (database_role IN ('PRIMARY', 'REPLICA', 'PROMOTING', 'PROMOTED', 'FAILED')),
    traffic_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.00 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS region.region_pairs (
    id VARCHAR(64) PRIMARY KEY,
    primary_region_id VARCHAR(30) REFERENCES region.regions(id),
    recovery_region_id VARCHAR(30) REFERENCES region.regions(id),
    sync_mode VARCHAR(30) NOT NULL DEFAULT 'ASYNC_REPLICATION',
    latency_ms NUMERIC(8, 2) DEFAULT 24.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_region_pair UNIQUE (primary_region_id, recovery_region_id)
);

CREATE TABLE IF NOT EXISTS region.deployments (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id) ON DELETE CASCADE,
    region_id VARCHAR(30) REFERENCES region.regions(id),
    deployment_type VARCHAR(30) NOT NULL CHECK (deployment_type IN ('ECS_FARGATE', 'KUBERNETES', 'LAMBDA', 'VIRTUAL_MACHINE')),
    active_instances INTEGER NOT NULL DEFAULT 0,
    desired_instances INTEGER NOT NULL DEFAULT 0,
    version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
    endpoint_url VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. POLICY SCHEMA (Owned by resilience-policy-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS policy.recovery_policies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    rto_target_seconds INTEGER NOT NULL DEFAULT 900, -- 15 mins SLA
    rpo_target_seconds INTEGER NOT NULL DEFAULT 300, -- 5 mins SLA
    recovery_strategy VARCHAR(30) NOT NULL DEFAULT 'PILOT_LIGHT' CHECK (recovery_strategy IN ('PILOT_LIGHT', 'WARM_STANDBY', 'ACTIVE_ACTIVE', 'BACKUP_RESTORE')),
    approval_required BOOLEAN NOT NULL DEFAULT TRUE,
    automatic_failover BOOLEAN NOT NULL DEFAULT FALSE,
    min_recovery_capacity INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS policy.recovery_plans (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id) ON DELETE CASCADE,
    policy_id VARCHAR(64) REFERENCES policy.recovery_policies(id),
    name VARCHAR(100) NOT NULL,
    data_recovery_strategy VARCHAR(50) NOT NULL DEFAULT 'DOCUMENTDB_PROMOTION',
    compute_recovery_strategy VARCHAR(50) NOT NULL DEFAULT 'FARGATE_SCALE_UP',
    traffic_strategy VARCHAR(50) NOT NULL DEFAULT 'ROUTE53_ARC_SWITCH',
    validation_rules JSONB,
    failback_strategy VARCHAR(50) NOT NULL DEFAULT 'CONTROLLED_REVERSE_SYNC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_app_plan UNIQUE (application_id, name)
);

-- -----------------------------------------------------------------------------
-- 5. MONITORING SCHEMA (Owned by monitoring-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring.health_events (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id),
    region_id VARCHAR(30) REFERENCES region.regions(id),
    component VARCHAR(50) NOT NULL, -- 'API', 'DATABASE', 'ECS_COMPUTE', 'NETWORK'
    status VARCHAR(30) NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN')),
    latency_ms NUMERIC(8, 2),
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. RECOVERY SCHEMA (Owned by recovery-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recovery.incidents (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id),
    primary_region_id VARCHAR(30) REFERENCES region.regions(id),
    recovery_region_id VARCHAR(30) REFERENCES region.regions(id),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    trigger_type VARCHAR(40) NOT NULL CHECK (trigger_type IN ('REGIONAL_OUTAGE', 'DATABASE_CRASH', 'API_FAILURE', 'SIMULATED_DRILL', 'MANUAL_TRIGGER')),
    failure_reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSESSING', 'AWAITING_APPROVAL', 'RECOVERING', 'RECOVERED', 'FAILED', 'CLOSED')),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    recovery_started_at TIMESTAMP WITH TIME ZONE,
    recovery_completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS recovery.recovery_operations (
    id VARCHAR(64) PRIMARY KEY,
    operation_code VARCHAR(30) NOT NULL UNIQUE, -- e.g. DR-0001
    incident_id VARCHAR(64) REFERENCES recovery.incidents(id),
    application_id VARCHAR(64) REFERENCES organization.applications(id),
    plan_id VARCHAR(64) REFERENCES policy.recovery_plans(id),
    operation_type VARCHAR(30) NOT NULL DEFAULT 'FAILOVER' CHECK (operation_type IN ('FAILOVER', 'FAILBACK', 'DR_DRILL')),
    execution_mode VARCHAR(30) NOT NULL DEFAULT 'SIMULATION' CHECK (execution_mode IN ('SIMULATION', 'AWS')),
    current_phase VARCHAR(40) NOT NULL DEFAULT 'INITIATED',
    status VARCHAR(30) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('PENDING', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED')),
    target_rto_seconds INTEGER NOT NULL DEFAULT 900,
    target_rpo_seconds INTEGER NOT NULL DEFAULT 300,
    actual_rto_seconds INTEGER,
    actual_rpo_seconds INTEGER,
    data_integrity_status VARCHAR(30) DEFAULT 'PENDING' CHECK (data_integrity_status IN ('PENDING', 'VERIFIED', 'FAILED')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    approval_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery.recovery_operation_steps (
    id VARCHAR(64) PRIMARY KEY,
    operation_id VARCHAR(64) REFERENCES recovery.recovery_operations(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    phase VARCHAR(40) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'SKIPPED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    details TEXT,
    CONSTRAINT uk_op_step UNIQUE (operation_id, step_number)
);

-- -----------------------------------------------------------------------------
-- 7. DATA CONTINUITY SCHEMA (Owned by data-continuity-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data.replication_status (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id) ON DELETE CASCADE,
    source_region_id VARCHAR(30) REFERENCES region.regions(id),
    target_region_id VARCHAR(30) REFERENCES region.regions(id),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEGRADED', 'HALTED', 'SYNCING')),
    replication_lag_ms NUMERIC(8, 2) NOT NULL DEFAULT 24.50,
    last_replicated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pending_transactions INTEGER NOT NULL DEFAULT 0,
    total_replicated_transactions INTEGER NOT NULL DEFAULT 142,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_app_replication UNIQUE (application_id, source_region_id, target_region_id)
);

CREATE TABLE IF NOT EXISTS data.data_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) REFERENCES organization.applications(id) ON DELETE CASCADE,
    checkpoint_version VARCHAR(50) NOT NULL,
    source_region VARCHAR(30) NOT NULL,
    record_count INTEGER NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data.sample_customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    region_created VARCHAR(30) NOT NULL DEFAULT 'us-east-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data.sample_transactions (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES data.sample_customers(id),
    customer_name VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    region_created VARCHAR(30) NOT NULL DEFAULT 'us-east-1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    replicated_at TIMESTAMP WITH TIME ZONE,
    checksum_hash VARCHAR(64) NOT NULL
);

-- -----------------------------------------------------------------------------
-- 8. AUDIT SCHEMA (Owned by audit-service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit.audit_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    username VARCHAR(100) NOT NULL,
    action VARCHAR(60) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(64) NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('SUCCESS', 'FAILURE', 'DENIED')),
    metadata JSONB,
    previous_hash VARCHAR(64),
    event_hash VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- BASELINE DEVELOPMENT & TEST SEED FIXTURES
-- (Provides initial RBAC roles, tenant structure, and sample test dataset.
--  NOT live AWS telemetry, NOT live cloud metrics, NOT fake recovery history.)
-- -----------------------------------------------------------------------------

-- Permissions
INSERT INTO identity.permissions (id, name, description) VALUES
('PERM_APP_VIEW', 'APPLICATION_VIEW', 'View applications and deployments'),
('PERM_APP_MANAGE', 'APPLICATION_MANAGE', 'Create and modify applications'),
('PERM_REG_VIEW', 'REGION_VIEW', 'View region status and topology'),
('PERM_REG_MANAGE', 'REGION_MANAGE', 'Modify region configurations'),
('PERM_POL_VIEW', 'POLICY_VIEW', 'View resilience policies and plans'),
('PERM_POL_MANAGE', 'POLICY_MANAGE', 'Create and modify resilience policies'),
('PERM_INC_VIEW', 'INCIDENT_VIEW', 'View disaster incidents'),
('PERM_REC_VIEW', 'RECOVERY_VIEW', 'View recovery operations and telemetry'),
('PERM_REC_EXEC', 'RECOVERY_EXECUTE', 'Initiate disaster failover and drills'),
('PERM_REC_APPR', 'RECOVERY_APPROVE', 'Authorize recovery execution gates'),
('PERM_FBK_EXEC', 'FAILBACK_EXECUTE', 'Execute controlled failback to primary'),
('PERM_AUD_VIEW', 'AUDIT_VIEW', 'View immutable audit trails')
ON CONFLICT (id) DO NOTHING;

-- Roles
INSERT INTO identity.roles (id, name, description) VALUES
('ROLE_ADMIN', 'PLATFORM_ADMIN', 'Full administrative access to ResilientX'),
('ROLE_OPERATOR', 'DR_OPERATOR', 'Disaster Recovery Operator capable of executing DR'),
('ROLE_APPROVER', 'DR_APPROVER', 'Authorized executive approver for DR execution gates'),
('ROLE_AUDITOR', 'DR_AUDITOR', 'Auditor with read-only access to audit logs and metrics'),
('ROLE_VIEWER', 'VIEWER', 'Read-only viewer for dashboard and monitoring')
ON CONFLICT (id) DO NOTHING;

-- Map Role Permissions
INSERT INTO identity.role_permissions (role_id, permission_id) VALUES
('ROLE_ADMIN', 'PERM_APP_VIEW'), ('ROLE_ADMIN', 'PERM_APP_MANAGE'),
('ROLE_ADMIN', 'PERM_REG_VIEW'), ('ROLE_ADMIN', 'PERM_REG_MANAGE'),
('ROLE_ADMIN', 'PERM_POL_VIEW'), ('ROLE_ADMIN', 'PERM_POL_MANAGE'),
('ROLE_ADMIN', 'PERM_INC_VIEW'), ('ROLE_ADMIN', 'PERM_REC_VIEW'),
('ROLE_ADMIN', 'PERM_REC_EXEC'), ('ROLE_ADMIN', 'PERM_REC_APPR'),
('ROLE_ADMIN', 'PERM_FBK_EXEC'), ('ROLE_ADMIN', 'PERM_AUD_VIEW'),
('ROLE_OPERATOR', 'PERM_APP_VIEW'), ('ROLE_OPERATOR', 'PERM_REG_VIEW'),
('ROLE_OPERATOR', 'PERM_POL_VIEW'), ('ROLE_OPERATOR', 'PERM_INC_VIEW'),
('ROLE_OPERATOR', 'PERM_REC_VIEW'), ('ROLE_OPERATOR', 'PERM_REC_EXEC'),
('ROLE_OPERATOR', 'PERM_FBK_EXEC'),
('ROLE_APPROVER', 'PERM_APP_VIEW'), ('ROLE_APPROVER', 'PERM_REC_VIEW'),
('ROLE_APPROVER', 'PERM_REC_APPR'),
('ROLE_AUDITOR', 'PERM_AUD_VIEW'), ('ROLE_AUDITOR', 'PERM_REC_VIEW'),
('ROLE_VIEWER', 'PERM_APP_VIEW'), ('ROLE_VIEWER', 'PERM_REG_VIEW')
ON CONFLICT DO NOTHING;

-- Default Users (Password: ResilientX@2026)
INSERT INTO identity.users (id, username, email, password_hash, full_name) VALUES
('USR-ADMIN-01', 'admin', 'admin@resilientx.io', '$2a$10$w8uR1e7f9KzP4r5m8T2yQ.xL1eN8f6B4u0V2M4P6O8j0e2kLmOpQr', 'Global SRE Administrator'),
('USR-OPERATOR-01', 'operator', 'operator@resilientx.io', '$2a$10$w8uR1e7f9KzP4r5m8T2yQ.xL1eN8f6B4u0V2M4P6O8j0e2kLmOpQr', 'Lead DR Engineer'),
('USR-APPROVER-01', 'approver', 'approver@resilientx.io', '$2a$10$w8uR1e7f9KzP4r5m8T2yQ.xL1eN8f6B4u0V2M4P6O8j0e2kLmOpQr', 'Chief Reliability Officer')
ON CONFLICT (id) DO NOTHING;

INSERT INTO identity.user_roles (user_id, role_id) VALUES
('USR-ADMIN-01', 'ROLE_ADMIN'),
('USR-OPERATOR-01', 'ROLE_OPERATOR'),
('USR-APPROVER-01', 'ROLE_APPROVER')
ON CONFLICT DO NOTHING;

-- Regions (Pilot Light Architecture: us-east-1 Active, us-east-2 Pilot Light)
INSERT INTO region.regions (id, code, name, provider, role, status, health_status, compute_capacity, desired_compute_capacity, database_role, traffic_percentage) VALUES
('us-east-1', 'us-east-1', 'US East (N. Virginia)', 'AWS', 'PRIMARY', 'HEALTHY', 'HEALTHY', 3, 3, 'PRIMARY', 100.00),
('us-east-2', 'us-east-2', 'US East (Ohio)', 'AWS', 'RECOVERY', 'PILOT_LIGHT', 'READY', 0, 0, 'REPLICA', 0.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO region.region_pairs (id, primary_region_id, recovery_region_id, sync_mode, latency_ms) VALUES
('PAIR-USE1-USE2', 'us-east-1', 'us-east-2', 'ASYNC_REPLICATION', 24.50)
ON CONFLICT (id) DO NOTHING;

-- Organization & Environment
INSERT INTO organization.organizations (id, name, slug, description, contact_email) VALUES
('ORG-ACME-01', 'Acme Global Financial', 'acme-financial', 'Tier-1 High Availability Enterprise Financial Group', 'sre@acme.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization.environments (id, organization_id, name, type) VALUES
('ENV-PROD-01', 'ORG-ACME-01', 'Production', 'PRODUCTION')
ON CONFLICT (id) DO NOTHING;

-- Applications (Realistic enterprise services)
INSERT INTO organization.applications (id, organization_id, environment_id, name, description, criticality, status, primary_region_id, recovery_region_id) VALUES
('APP-LEDGER-01', 'ORG-ACME-01', 'ENV-PROD-01', 'Core Transaction Ledger', 'Mission-critical transaction ledger and account balance engine', 'CRITICAL', 'ACTIVE', 'us-east-1', 'us-east-2'),
('APP-PAYMENT-02', 'ORG-ACME-01', 'ENV-PROD-01', 'Payment Gateway Platform', 'Cross-border payment processing and settlement service', 'CRITICAL', 'ACTIVE', 'us-east-1', 'us-east-2'),
('APP-CUSTOMER-03', 'ORG-ACME-01', 'ENV-PROD-01', 'Customer Authentication & Identity', 'Customer profile and single sign-on authentication service', 'HIGH', 'ACTIVE', 'us-east-1', 'us-east-2')
ON CONFLICT (id) DO NOTHING;

-- Resilience Policies & Recovery Plans
INSERT INTO policy.recovery_policies (id, name, description, rto_target_seconds, rpo_target_seconds, recovery_strategy, approval_required, automatic_failover, min_recovery_capacity) VALUES
('POL-TIER1-PILOT', 'Production Critical Pilot Light Policy', 'Standard 15m RTO / 5m RPO Pilot Light DR policy with human approval gate', 900, 300, 'PILOT_LIGHT', TRUE, FALSE, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO policy.recovery_plans (id, application_id, policy_id, name, data_recovery_strategy, compute_recovery_strategy, traffic_strategy, validation_rules, failback_strategy) VALUES
('PLAN-LEDGER-DR', 'APP-LEDGER-01', 'POL-TIER1-PILOT', 'Core Ledger Multi-Region Pilot Light Plan', 'DOCUMENTDB_PROMOTION', 'FARGATE_SCALE_UP', 'ROUTE53_ARC_SWITCH', '{"requireApi200": true, "requireDbReadWrite": true, "verifyChecksums": true}'::jsonb, 'CONTROLLED_REVERSE_SYNC')
ON CONFLICT (id) DO NOTHING;

-- Replication Status
INSERT INTO data.replication_status (id, application_id, source_region_id, target_region_id, status, replication_lag_ms, last_replicated_at, pending_transactions, total_replicated_transactions) VALUES
('REP-APP-01', 'APP-LEDGER-01', 'us-east-1', 'us-east-2', 'ACTIVE', 24.50, CURRENT_TIMESTAMP, 0, 142)
ON CONFLICT (id) DO NOTHING;

-- Demo Workload Ledger Seed Data
INSERT INTO data.sample_customers (id, name, email, region_created) VALUES
('CUST-1001', 'Ashu Kumar', 'ashu.kumar@example.com', 'us-east-1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO data.sample_transactions (id, customer_id, customer_name, amount, currency, status, region_created, checksum_hash) VALUES
('TXN-1001', 'CUST-1001', 'Ashu Kumar', 10000.00, 'INR', 'COMPLETED', 'us-east-1', 'a8f3b4c9e1204d88e7a6b2c3d4e5f6a7')
ON CONFLICT (id) DO NOTHING;

-- Initial Seed Audit Entry with Genesis Hash
INSERT INTO audit.audit_events (id, user_id, username, action, resource_type, resource_id, correlation_id, result, metadata, previous_hash, event_hash) VALUES
('AUD-GENESIS-01', 'USR-ADMIN-01', 'admin', 'INITIALIZE_CONTROL_PLANE', 'SYSTEM', 'resilientx', 'RX-SYS-INIT', 'SUCCESS', '{"version": "2.0.0", "mode": "ENTERPRISE"}'::jsonb, '0000000000000000000000000000000000000000000000000000000000000000', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
ON CONFLICT (id) DO NOTHING;

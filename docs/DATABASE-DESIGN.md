# ResilientX — Centralized Database Architecture

## 1. Single Database Mandate
ResilientX strictly enforces **EXACTLY ONE Centralized PostgreSQL Database**:

```text
Database Name: resilientx
Engine: PostgreSQL 15+ / 16
Connection Port: 5432
Logical Schema Architecture: 8 Isolated Domain Schemas
```

There are **no** separate database instances for microservices (no `auth_db`, `recovery_db`, `region_db`). All 8 domain services connect to the same PostgreSQL database instance `resilientx`, utilizing dedicated logical schemas for domain isolation.

---

## 2. Logical Schema & Table Ownership Map

| Domain Service | Logical Schema | Owned Tables | Purpose & Constraints |
| :--- | :--- | :--- | :--- |
| **`identity-service`** | `identity` | `users`, `roles`, `permissions`, `user_roles`, `role_permissions` | RBAC access control, BCrypt hashes, unique constraints on `username` and `email`. |
| **`organization-service`** | `organization` | `organizations`, `environments`, `applications` | Multi-tenant hierarchies, application criticality tiers (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`). |
| **`region-service`** | `region` | `regions`, `region_pairs`, `deployments` | AWS multi-region infrastructure records, compute task allocations, traffic split percentages ($0.00\% - 100.00\%$). |
| **`resilience-policy-service`** | `policy` | `recovery_policies`, `recovery_plans` | SLA definitions (Target RTO/RPO), Pilot Light recovery strategies, gate configurations. |
| **`monitoring-service`** | `monitoring` | `health_events` | Multi-region probe events across API, Database, Compute, and Network. |
| **`recovery-service`** | `recovery` | `incidents`, `recovery_operations`, `recovery_operation_steps` | Disaster incident records, state-machine tracking, step timestamps, dynamic RTO calculations. |
| **`data-continuity-service`** | `data` | `replication_status`, `data_checkpoints`, `sample_customers`, `sample_transactions` | Replication lag telemetry in milliseconds, SHA-256 cryptographic checkpoints and ledger transactions (`Ashu Kumar`, `TXN-1001`, `₹10,000`). |
| **`audit-service`** | `audit` | `audit_events` | Immutable security audit logs with cryptographic SHA-256 hash chaining ($H_n = \text{SHA-256}(H_{n-1} + \text{data})$). |

---

## 3. Cryptographic Tamper-Evident Hash Chain
In `audit.audit_events`, every event stores:
- `previous_hash`: The SHA-256 hash of the preceding event in the chain (Genesis hash: `0000000000000000000000000000000000000000000000000000000000000000`).
- `event_hash`: The SHA-256 checksum computed over $(previous\_hash + id + username + action + resourceType + resourceId + correlationId + result + timestamp)$.
- **Verification Endpoint:** `GET /api/audit/verify-chain` traverses all events chronologically, validates pointer integrity, and detects any unauthorized tampering.

---

## 4. Cross-Service Isolation Rules
1. **No Cross-Service Direct Table Manipulation:** Services interact via RESTful HTTP APIs and OpenFeign proxies, never by directly modifying tables outside their logical schema.
2. **Local Transactions:** Each service manages local database transactions scoped exclusively to its owned JPA entities, mapped with `@Table(name = "...", schema = "...")`.
3. **Database Constraints:** Relational foreign keys (`ON DELETE CASCADE`), unique constraints (`uk_org_env`, `uk_app_plan`, `uk_region_pair`), and check constraints (`traffic_percentage >= 0 AND <= 100`) ensure absolute data integrity.

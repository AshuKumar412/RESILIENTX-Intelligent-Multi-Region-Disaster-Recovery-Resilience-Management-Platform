# RESILIENTX

## Intelligent Multi-Region Disaster Recovery & Resilience Management Platform

> **Tagline:** *Detect. Decide. Recover. Prove.*  
> **Target Architecture:** AWS Multi-Region Pilot Light (Active: `us-east-1` | Pilot Light Standby: `us-east-2`)

---

## 1. Overview
**ResilientX** is an enterprise-oriented Disaster Recovery (DR) and Resilience Management Control Plane. It provides centralized multi-region workload observability, failure detection, deterministic DR state-machine failover orchestration, human approval gates, dynamic traffic cutover, cryptographic data continuity verification, real-time RTO/RPO calculation, and 6-step controlled failback.

---

## 2. Technology Stack

### Frontend (SRE Operations Console)
* **React 18 + JavaScript (`.js`, `.jsx`) + Vite + Tailwind CSS + React Router + Axios + Lucide Icons**
* Dark-mode SRE dashboard, animated traffic flow topology, interactive approval gates, and built-in **5-Minute Guided Presenter Mode**.

### Backend (Microservice Control Plane)
* **Java 17+ / Spring Boot 3 + Spring Cloud + Spring Security + JWT + Spring Data JPA + OpenFeign + Maven**
* **`eureka-server` (Port 8761):** Dynamic service discovery registry
* **`api-gateway` (Port 8080):** Ingress routing, CORS, and correlation ID (`X-Correlation-ID`) tracking
* **`identity-service` (Port 8081):** RBAC security and authentication
* **`organization-service` (Port 8082):** Tenant & application catalog
* **`region-service` (Port 8083):** Multi-region topology & traffic split management
* **`resilience-policy-service` (Port 8084):** Declarative DR policies (15m RTO / 5m RPO SLAs)
* **`monitoring-service` (Port 8085):** Continuous multi-region health observability
* **`recovery-service` (Port 8086):** State Machine Engine, Human Approval Gate, Strategy Pattern (`SimulationExecutionStrategy` & `AwsExecutionStrategy`)
* **`data-continuity-service` (Port 8087):** Real-time replication lag tracking & SHA-256 ledger checksum verification
* **`audit-service` (Port 8088):** Tamper-evident immutable audit logs

### Database
* **EXACTLY ONE Centralized PostgreSQL Database:** `resilientx` on port `5432` with logical table ownership.

---

## 3. Quick Start (Local Docker & Native)

### 1. Launch Central PostgreSQL & Frontend via Docker Compose
```bash
docker-compose up -d
```
* **PostgreSQL:** `localhost:5432` (Database: `resilientx`, user: `postgres`, password: `postgrespassword`)
* **Frontend SRE Console:** `http://localhost:3000`

### 2. Launch Backend Microservices
```bash
cd backend
# Run Eureka Server
mvn -pl eureka-server spring-boot:run

# Run API Gateway
mvn -pl api-gateway spring-boot:run

# Run Domain Microservices
mvn -pl identity-service spring-boot:run
mvn -pl organization-service spring-boot:run
mvn -pl region-service spring-boot:run
mvn -pl resilience-policy-service spring-boot:run
mvn -pl monitoring-service spring-boot:run
mvn -pl recovery-service spring-boot:run
mvn -pl data-continuity-service spring-boot:run
mvn -pl audit-service spring-boot:run
```

---

## 4. 5-Minute Hackathon Demo Script ($0:00 \to 5:00$)
1. **0:00–0:45 (Live Topology):** Present `us-east-1` (Active, 3 Tasks, 100% Traffic) vs `us-east-2` (Pilot Light, 0 Tasks, DB Replicating).
2. **0:45–1:30 (Data Continuity):** Create customer `Ashu Kumar` (`CUST-1001`) & transaction `TXN-1001` (`₹10,000`). Show continuous replication lag ($<30\text{ms}$).
3. **1:30–2:30 (Simulate Region Failure):** Trigger **`[ SIMULATE FAILURE ]`** on `us-east-1`. Observe state machine progression to **Stage 4: Human Approval Gate**. Click **`[ APPROVE RECOVERY ]`**.
4. **2:30–3:45 (Recovery Execution):** Watch Pilot Light ECS compute scaling ($0 \to 3$ tasks), health validation, dynamic traffic switch ($100\% \to 0\%$ and $0\% \to 100\%$), and SHA-256 data integrity verification.
5. **3:45–5:00 (Metrics & Failback):** Inspect measured RTO (`03m 38s` vs `15m` target) & RPO (`00m 14s` vs `5m` target). Click **`[ FAILBACK ]`** to execute 6-step restoration back to Pilot Light baseline.

---

## 5. Documentation Map
* [`docs/ARCHITECTURE.md`](file:///c:/Users/HP/Documents/AWS%20Updated/docs/ARCHITECTURE.md) — Architectural Blueprint
* [`docs/DATABASE-DESIGN.md`](file:///c:/Users/HP/Documents/AWS%20Updated/docs/DATABASE-DESIGN.md) — Single PostgreSQL Database & Logical Ownership
* [`docs/RECOVERY-ENGINE.md`](file:///c:/Users/HP/Documents/AWS%20Updated/docs/RECOVERY-ENGINE.md) — State Machine & RTO/RPO Metrics
* [`docs/AWS-COST-GUIDE.md`](file:///c:/Users/HP/Documents/AWS%20Updated/docs/AWS-COST-GUIDE.md) — AWS Cost Breakdown & Guardrails

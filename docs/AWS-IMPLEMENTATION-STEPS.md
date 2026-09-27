# RESILIENTX — Future AWS Implementation & Deployment Guide

> **IMPORTANT ARCHITECTURAL NOTICE:**
> **AWS IMPLEMENTATION IS DEFERRED IN THIS PHASE.**
> No live AWS infrastructure is deployed, no AWS APIs are invoked, and zero AWS credits have been consumed.
> ResilientX currently operates on the **Local PostgreSQL Control Plane (`resilientx`)**.
> 
> This document provides the complete, authoritative **20-step execution playbook** for when live AWS infrastructure is connected in a future phase.

---

## Prerequisites & Environment Variables

When ready to connect AWS, configure the following environment variables:

```bash
# AWS Credentials & Profile Configuration
export AWS_PROFILE="resilientx-prod"
export AWS_DEFAULT_REGION="us-east-1"
export AWS_RECOVERY_REGION="us-east-2"

# Enable AWS Integration in ResilientX
export RESILIENTX_AWS_ENABLED=true
export RESILIENTX_INFRASTRUCTURE_PROVIDER="AWS"

# Multi-Region Resource Identifiers
export PRIMARY_VPC_ID="vpc-0a1b2c3d4e5f67890"
export RECOVERY_VPC_ID="vpc-0f9e8d7c6b5a43210"
export PRIMARY_ECS_CLUSTER="resilientx-primary-cluster"
export RECOVERY_ECS_CLUSTER="resilientx-recovery-cluster"
export DOCDB_GLOBAL_CLUSTER_ID="resilientx-global-docdb"
export ARC_ROUTING_CONTROL_PRIMARY_ARN="arn:aws:route53-recovery-control::123456789012:control/primary-rc"
export ARC_ROUTING_CONTROL_RECOVERY_ARN="arn:aws:route53-recovery-control::123456789012:control/recovery-rc"
```

---

## The 20-Step Future Deployment Playbook

### Step 1: Create AWS Account & Configure Budget Controls
- Establish dedicated AWS Organization account with Multi-Factor Authentication (MFA).
- Set AWS Budgets zero-spend / threshold alerts to prevent unexpected expenditure.
```bash
aws budgets create-budget \
    --account-id 123456789012 \
    --budget file://infrastructure/aws/budget-definition.json
```

### Step 2: Configure IAM Least-Privilege Access & Roles
- Create IAM Service Role for ResilientX with fine-grained permissions:
  - `ecs:UpdateService`, `ecs:DescribeServices`
  - `rds:FailoverGlobalCluster`, `rds:DescribeDBClusters`
  - `route53recoverycontrolconfig:UpdateRoutingControlStates`
  - `cloudwatch:GetMetricData`, `cloudwatch:DescribeAlarms`

### Step 3: Configure AWS CLI & Multi-Region Profiles
```bash
aws configure set region us-east-1 --profile resilientx-prod
aws configure set output json --profile resilientx-prod
```

### Step 4: Configure Primary Region (`us-east-1`)
- Verify regional service availability for ECS Fargate, DocumentDB, ALB, Route 53 ARC.

### Step 5: Configure Recovery Region (`us-east-2`)
- Ensure parity in VPC CIDR blocks, Subnet structures, and Security Groups.

### Step 6: Deploy Networking Stacks
- Deploy VPCs, Internet Gateways, NAT Gateways, and Route Tables via CloudFormation:
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/networking.yaml \
    --stack-name resilientx-network-primary \
    --region us-east-1 \
    --parameter-overrides VpcCIDR=10.0.0.0/16

aws cloudformation deploy \
    --template-file infrastructure/aws/networking.yaml \
    --stack-name resilientx-network-recovery \
    --region us-east-2 \
    --parameter-overrides VpcCIDR=10.1.0.0/16
```

### Step 7: Deploy Amazon Elastic Container Registry (ECR)
- Create multi-region replication ECR repository:
```bash
aws ecr create-repository --repository-name resilientx/core-workload --region us-east-1
```

### Step 8: Build and Push Application Containers
- Build multi-arch container image and tag for ECR:
```bash
docker build -t 123456789012.dkr.ecr.us-east-1.amazonaws.com/resilientx/core-workload:v1.0 .
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/resilientx/core-workload:v1.0
```

### Step 9: Deploy ECS Fargate (Pilot Light Configuration)
- Deploy Primary Cluster with 3 desired tasks:
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/compute-ecs.yaml \
    --stack-name resilientx-compute-primary \
    --region us-east-1 \
    --parameter-overrides DesiredCount=3
```
- Deploy Standby Cluster in `us-east-2` with **0 desired tasks** (Pilot Light):
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/compute-ecs.yaml \
    --stack-name resilientx-compute-recovery \
    --region us-east-2 \
    --parameter-overrides DesiredCount=0
```

### Step 10: Configure CloudWatch Monitoring & Composite Alarms
- Deploy health check probes and composite failure alarms:
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/monitoring.yaml \
    --stack-name resilientx-monitoring \
    --region us-east-1
```

### Step 11: Configure DocumentDB Global Database Replication
- Deploy DocumentDB Global Cluster with cross-region read replica in `us-east-2`:
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/database.yaml \
    --stack-name resilientx-database \
    --region us-east-1
```

### Step 12: Configure Route 53 ARC Traffic Management
- Deploy Application Recovery Controller Control Panel and Routing Controls:
```bash
aws cloudformation deploy \
    --template-file infrastructure/aws/traffic-arc.yaml \
    --stack-name resilientx-traffic-arc \
    --region us-east-1
```

### Step 13: Connect ResilientX AWS Provider
- Update ResilientX configuration: `resilientx.aws.enabled=true`.
- The `AwsInfrastructureProvider` bean activates and registers with `RecoveryEngineService`.

### Step 14: Run AWS Connectivity Verification
- Invoke ResilientX AWS Connectivity Check:
```bash
curl -X GET http://localhost:8080/api/regions/topology
```
- Verify status reflects live AWS credentials and region endpoints.

### Step 15: Run Read-Only Health Verification
- Confirm that primary region reports healthy ECS tasks (3 running), active DocumentDB writer, and 100% ARC routing control.
- Confirm standby region reports 0 ECS tasks, DocumentDB read replica, and 0% ARC routing control.

### Step 16: Run Controlled DR Drill (Scheduled Exercise)
- Trigger DR Drill through ResilientX UI or API:
```bash
curl -X POST http://localhost:8080/api/recoveries/drill \
    -H "Content-Type: application/json" \
    -d '{"applicationId":"APP-LEDGER-01","mode":"AWS"}'
```

### Step 17: Run Production Recovery After Authorization
- Operator approves 2-person recovery gate:
```bash
curl -X POST http://localhost:8080/api/recoveries/DR-0001/approve \
    -H "Content-Type: application/json" \
    -d '{"approver":"Lead SRE","reason":"Authorized regional outage recovery"}'
```
- Orchestrator executes:
  1. `rds:FailoverGlobalCluster` -> promotes `us-east-2` to primary.
  2. `ecs:UpdateService` -> scales `us-east-2` desired tasks from 0 to 3.
  3. `route53recoverycontrolconfig:UpdateRoutingControlStates` -> diverts traffic to `us-east-2`.

### Step 18: Verify Actual RTO & RPO
- ResilientX dynamically computes:
  $$\text{Actual RTO} = t_{\text{recovery\_verified}} - t_{\text{incident\_detected}}$$
  $$\text{Actual RPO} = t_{\text{incident\_detected}} - t_{\text{last\_replicated\_checkpoint}}$$
- Verify metrics against SLA thresholds (RTO $\le 900\text{s}$, RPO $\le 300\text{s}$).

### Step 19: Verify Data Integrity
- ResilientX executes cryptographic SHA-256 verification on ledger transactions.
- Confirms zero data loss across regions.

### Step 20: Verify Failback to Primary Region
- When primary region is restored, execute controlled failback:
```bash
curl -X POST http://localhost:8080/api/recoveries/DR-0001/failback \
    -H "Content-Type: application/json" \
    -d '{"executedBy":"Lead SRE"}'
```
- Synchronize reverse delta, test health, switch ARC routing controls back to `us-east-1`, and scale standby compute back to 0 (Pilot Light).

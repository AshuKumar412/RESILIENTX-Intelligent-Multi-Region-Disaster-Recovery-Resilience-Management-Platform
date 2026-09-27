# ResilientX — AWS Cost Management & Financial Guardrails Guide

> **CURRENT STATUS: NO AWS RESOURCES DEPLOYED**
> In this implementation phase, ResilientX runs entirely on the **Local PostgreSQL Control Plane (`resilientx`)**.
> - **AWS Resources Created in this Phase:** 0
> - **AWS Credits Consumed in this Phase:** $0.00
> - **Live Cloud Connectivity:** Deferred (`AWS_ENABLED=false`)

---

## 1. Resource Pricing Classification (For Future Deployment)

| AWS Service | Cost Tier | Estimated Run Rate | Pricing Details & Free-Tier Coverage |
| :--- | :--- | :--- | :--- |
| **VPC & Subnets** | **FREE** | \$0.00 | Free default and custom VPCs |
| **AWS CloudFormation** | **FREE** | \$0.00 | Free stack management |
| **Amazon CloudWatch** | **LOW / FREE-TIER** | < \$0.50 / month | 10 free metrics & 10 free alarms included |
| **Amazon ECR** | **LOW / FREE-TIER** | < \$0.10 / month | 500MB free storage tier |
| **ECS Fargate** | **LOW (PILOT LIGHT)** | ~\$0.012 / task-hr | Primary (3 tasks = ~\$0.86/day). Recovery region = **\$0.00** (0 tasks) until activated. |
| **Application Load Balancer** | **MODERATE** | ~\$0.0225 / hr / region | ~\$16.20/month per ALB. (Deploy only during live evaluations). |
| **Amazon DocumentDB Global Cluster** | **HIGH ⚠️** | ~\$0.27 / hr / instance | ~\$400/month for multi-region `db.t3.medium` instances. **Use Local PostgreSQL mode for development.** |
| **AWS ARC Routing Controls** | **MODERATE** | ~\$0.75 / hr / control state | Route 53 Application Recovery Controller routing controls. |

---

## 2. Cost Guardrail Rules for Future Deployment
1. **Pilot Light Compute Zero-Cost Standby:** Standby ECS tasks in `us-east-2` remain set to `DesiredCount: 0`, consuming zero compute credits until failover is triggered.
2. **Interactive Confirmation Before Provisioning:** High-cost services (DocumentDB Global Clusters, NAT Gateways, multi-region ALBs) will never be created without prior cost disclosure and interactive authorization.
3. **Automated Teardown Playbooks:** When AWS is deployed for live evaluation, delete CloudFormation stacks immediately following testing to prevent orphaned billable assets.

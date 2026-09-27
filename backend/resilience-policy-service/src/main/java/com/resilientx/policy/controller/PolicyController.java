package com.resilientx.policy.controller;

import com.resilientx.policy.entity.RecoveryPlan;
import com.resilientx.policy.entity.RecoveryPolicy;
import com.resilientx.policy.repository.RecoveryPlanRepository;
import com.resilientx.policy.repository.RecoveryPolicyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PolicyController {

    private final RecoveryPolicyRepository policyRepo;
    private final RecoveryPlanRepository planRepo;

    public PolicyController(RecoveryPolicyRepository policyRepo, RecoveryPlanRepository planRepo) {
        this.policyRepo = policyRepo;
        this.planRepo = planRepo;
    }

    // --- Policies ---
    @GetMapping("/policies")
    public ResponseEntity<List<RecoveryPolicy>> getAllPolicies() {
        return ResponseEntity.ok(policyRepo.findAll());
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<?> getPolicyById(@PathVariable String id) {
        return policyRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/policies")
    public ResponseEntity<RecoveryPolicy> createPolicy(@RequestBody RecoveryPolicy policy) {
        if (policy.getId() == null || policy.getId().isBlank()) {
            policy.setId("POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(policyRepo.save(policy));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<?> updatePolicy(@PathVariable String id, @RequestBody RecoveryPolicy update) {
        return policyRepo.findById(id).map(policy -> {
            if (update.getName() != null) policy.setName(update.getName());
            if (update.getDescription() != null) policy.setDescription(update.getDescription());
            if (update.getRtoTargetSeconds() != null) policy.setRtoTargetSeconds(update.getRtoTargetSeconds());
            if (update.getRpoTargetSeconds() != null) policy.setRpoTargetSeconds(update.getRpoTargetSeconds());
            if (update.getRecoveryStrategy() != null) policy.setRecoveryStrategy(update.getRecoveryStrategy());
            if (update.getApprovalRequired() != null) policy.setApprovalRequired(update.getApprovalRequired());
            if (update.getAutomaticFailover() != null) policy.setAutomaticFailover(update.getAutomaticFailover());
            if (update.getMinRecoveryCapacity() != null) policy.setMinRecoveryCapacity(update.getMinRecoveryCapacity());
            policy.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(policyRepo.save(policy));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Recovery Plans ---
    @GetMapping("/recovery-plans")
    public ResponseEntity<List<RecoveryPlan>> getRecoveryPlans(@RequestParam(required = false) String applicationId) {
        if (applicationId != null && !applicationId.isBlank()) {
            return ResponseEntity.ok(planRepo.findByApplicationId(applicationId));
        }
        return ResponseEntity.ok(planRepo.findAll());
    }

    @GetMapping("/recovery-plans/{id}")
    public ResponseEntity<?> getRecoveryPlanById(@PathVariable String id) {
        return planRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/recovery-plans")
    public ResponseEntity<RecoveryPlan> createRecoveryPlan(@RequestBody RecoveryPlan plan) {
        if (plan.getId() == null || plan.getId().isBlank()) {
            plan.setId("PLAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(planRepo.save(plan));
    }

    @GetMapping("/readiness")
    public ResponseEntity<java.util.Map<String, Object>> evaluateReadiness() {
        List<RecoveryPolicy> policies = policyRepo.findAll();
        List<RecoveryPlan> plans = planRepo.findAll();

        if (policies.isEmpty() && plans.isEmpty()) {
            java.util.Map<String, Object> empty = new java.util.HashMap<>();
            empty.put("status", "INSUFFICIENT_DATA");
            empty.put("readinessScore", null);
            empty.put("message", "Readiness: Insufficient data");
            empty.put("pillars", java.util.List.of());
            empty.put("calculatedAt", Instant.now().toString());
            return ResponseEntity.ok(empty);
        }

        int computeScore = plans.stream().anyMatch(p -> p.getComputeRecoveryStrategy() != null && !p.getComputeRecoveryStrategy().isBlank()) ? 95 : 0;
        int dataScore = plans.stream().anyMatch(p -> p.getDataRecoveryStrategy() != null && !p.getDataRecoveryStrategy().isBlank()) ? 95 : 0;
        int trafficScore = plans.stream().anyMatch(p -> p.getTrafficStrategy() != null && !p.getTrafficStrategy().isBlank()) ? 90 : 0;
        int policyScore = policies.stream().anyMatch(p -> p.getRtoTargetSeconds() != null && p.getRtoTargetSeconds() > 0) ? 100 : 0;
        int governanceScore = policies.stream().anyMatch(RecoveryPolicy::getApprovalRequired) ? 95 : 50;
        int validationScore = plans.stream().anyMatch(p -> p.getValidationRules() != null) ? 90 : 60;

        int overallScore = (computeScore + dataScore + trafficScore + policyScore + governanceScore + validationScore) / 6;

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("status", overallScore >= 80 ? "READY" : "DEGRADED");
        result.put("readinessScore", overallScore);
        result.put("message", overallScore >= 80 ? "Pilot Light Standby Configured" : "Configuration Incomplete");
        result.put("totalPlans", plans.size());
        result.put("totalPolicies", policies.size());
        result.put("calculatedAt", Instant.now().toString());

        java.util.List<java.util.Map<String, Object>> pillars = java.util.List.of(
            java.util.Map.of("id", "compute", "name", "Compute Recovery Strategy", "category", "Compute & Capacity", "score", computeScore, "status", computeScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Compute activation strategy configured in recovery plan"),
            java.util.Map.of("id", "database", "name", "Data Recovery Strategy", "category", "Data Continuity", "score", dataScore, "status", dataScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Data promotion and synchronization strategy defined"),
            java.util.Map.of("id", "traffic", "name", "Traffic Routing Strategy", "category", "Traffic Routing", "score", trafficScore, "status", trafficScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Traffic routing control switch policy verified"),
            java.util.Map.of("id", "runbook", "name", "Policy SLA Definition", "category", "Recovery Orchestration", "score", policyScore, "status", policyScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Target RTO and RPO SLA thresholds registered"),
            java.util.Map.of("id", "security", "name", "Approval Gate & Governance", "category", "Access & Governance", "score", governanceScore, "status", governanceScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Two-person human approval gate enabled"),
            java.util.Map.of("id", "backups", "name", "Validation Rules", "category", "Integrity & Verification", "score", validationScore, "status", validationScore > 0 ? "READY" : "NOT_CONFIGURED", "details", "Post-recovery validation and integrity rules bound")
        );
        result.put("pillars", pillars);

        return ResponseEntity.ok(result);
    }
}

package com.resilientx.recovery.controller;

import com.resilientx.recovery.entity.RecoveryOperation;
import com.resilientx.recovery.repository.RecoveryOperationRepository;
import com.resilientx.recovery.service.RecoveryEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recoveries")
public class RecoveryController {

    private final RecoveryOperationRepository operationRepo;
    private final RecoveryEngineService recoveryEngine;

    public RecoveryController(RecoveryOperationRepository operationRepo, RecoveryEngineService recoveryEngine) {
        this.operationRepo = operationRepo;
        this.recoveryEngine = recoveryEngine;
    }

    @GetMapping
    public ResponseEntity<List<RecoveryOperation>> getAllRecoveries(@RequestParam(value = "applicationId", required = false) String applicationId) {
        if (applicationId != null && !applicationId.isBlank()) {
            return ResponseEntity.ok(operationRepo.findByApplicationIdOrderByStartedAtDesc(applicationId));
        }
        return ResponseEntity.ok(operationRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecoveryById(@PathVariable("id") String id) {
        return operationRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('DR_OPERATOR', 'PLATFORM_ADMIN')")
    public ResponseEntity<?> initiateRecovery(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            String appId = (String) body.get("applicationId");
            String primary = (String) body.get("primaryRegion");
            String recovery = (String) body.get("recoveryRegion");
            String reason = (String) body.get("failureReason");
            String triggerType = (String) body.get("triggerType");
            String mode = (String) body.get("mode");
            String triggeredBy = authentication.getName();

            RecoveryOperation op = recoveryEngine.initiateDisasterRecovery(
                    appId, primary, recovery, reason, triggerType, mode, triggeredBy
            );
            return ResponseEntity.status(201).body(op);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(Map.of(
                    "status", 409,
                    "code", "RECOVERY_ALREADY_RUNNING",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('DR_APPROVER', 'PLATFORM_ADMIN')")
    public ResponseEntity<?> approveRecovery(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> body, Authentication authentication) {
        try {
            String reason = body != null ? body.getOrDefault("reason", "Approved recovery activation") : "Approved recovery activation";
            return ResponseEntity.ok(recoveryEngine.approveRecovery(id, authentication.getName(), reason));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DR_OPERATOR', 'DR_APPROVER', 'PLATFORM_ADMIN')")
    public ResponseEntity<?> cancelRecovery(@PathVariable("id") String id, @RequestBody(required = false) Map<String, String> body, Authentication authentication) {
        try {
            String reason = body != null ? body.getOrDefault("reason", "Cancelled by operator") : "Cancelled by operator";
            return ResponseEntity.ok(recoveryEngine.cancelRecovery(id, authentication.getName(), reason));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/failback")
    @PreAuthorize("hasAnyRole('DR_OPERATOR', 'DR_APPROVER', 'PLATFORM_ADMIN')")
    public ResponseEntity<?> executeFailback(@PathVariable("id") String id, Authentication authentication) {
        try {
            return ResponseEntity.ok(recoveryEngine.executeFailback(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/drill")
    @PreAuthorize("hasAnyRole('DR_OPERATOR', 'PLATFORM_ADMIN')")
    public ResponseEntity<?> runDrill(@RequestBody(required = false) Map<String, Object> body, Authentication authentication) {
        String appId = body != null ? (String) body.get("applicationId") : null;
        String mode = body != null ? (String) body.get("mode") : null;
        String primary = body != null ? (String) body.get("primaryRegion") : null;
        String recovery = body != null ? (String) body.get("recoveryRegion") : null;

        RecoveryOperation op = recoveryEngine.initiateDisasterRecovery(
                appId, primary, recovery, "Recovery drill requested by operator", "SIMULATED_DRILL", mode, authentication.getName()
        );
        return ResponseEntity.status(201).body(op);
    }

    @GetMapping("/metrics/summary")
    public ResponseEntity<Map<String, Object>> getMetricsSummary() {
        List<RecoveryOperation> ops = operationRepo.findAll();
        List<RecoveryOperation> completed = ops.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .sorted((a, b) -> b.getCompletedAt().compareTo(a.getCompletedAt()))
                .toList();

        Map<String, Object> res = new java.util.HashMap<>();
        res.put("totalOperations", ops.size());
        res.put("completedOperations", completed.size());

        if (completed.isEmpty()) {
            res.put("hasHistoricalData", false);
            res.put("latestRtoSeconds", null);
            res.put("latestRpoSeconds", null);
            res.put("avgRtoSeconds", null);
            res.put("rtoSlaCompliancePercentage", null);
            res.put("lastDrillDate", null);
            res.put("message", "No recovery operations executed yet");
        } else {
            res.put("hasHistoricalData", true);
            RecoveryOperation latest = completed.get(0);
            res.put("latestRtoSeconds", latest.getActualRtoSeconds());
            res.put("latestRpoSeconds", latest.getActualRpoSeconds());
            
            double avgRto = completed.stream()
                    .filter(o -> o.getActualRtoSeconds() != null)
                    .mapToInt(RecoveryOperation::getActualRtoSeconds)
                    .average()
                    .orElse(0.0);
            res.put("avgRtoSeconds", (int) avgRto);

            long compliantCount = completed.stream()
                    .filter(o -> o.getActualRtoSeconds() != null && o.getActualRtoSeconds() <= o.getTargetRtoSeconds())
                    .count();
            double compliance = ((double) compliantCount / completed.size()) * 100.0;
            res.put("rtoSlaCompliancePercentage", (int) compliance);
            res.put("lastDrillDate", latest.getCompletedAt() != null ? latest.getCompletedAt().toString() : null);
        }

        return ResponseEntity.ok(res);
    }
}

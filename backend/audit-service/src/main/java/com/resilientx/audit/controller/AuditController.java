package com.resilientx.audit.controller;

import com.resilientx.audit.entity.AuditEvent;
import com.resilientx.audit.repository.AuditEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditEventRepository auditRepo;

    public AuditController(AuditEventRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DR_AUDITOR', 'PLATFORM_ADMIN')")
    public ResponseEntity<List<AuditEvent>> getAuditEvents(
            @RequestParam(required = false) String correlationId,
            @RequestParam(required = false) String resourceId
    ) {
        if (correlationId != null && !correlationId.isBlank()) {
            return ResponseEntity.ok(auditRepo.findByCorrelationIdOrderByTimestampAsc(correlationId));
        }
        if (resourceId != null && !resourceId.isBlank()) {
            return ResponseEntity.ok(auditRepo.findByResourceIdOrderByTimestampDesc(resourceId));
        }
        return ResponseEntity.ok(auditRepo.findTop100ByOrderByTimestampDesc());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DR_OPERATOR', 'DR_APPROVER', 'DR_AUDITOR', 'PLATFORM_ADMIN')")
    public ResponseEntity<AuditEvent> recordAuditEvent(@RequestBody AuditEvent event, Authentication authentication) {
        event.setUsername(authentication.getName());
        if (event.getId() == null || event.getId().isBlank()) {
            event.setId("AUD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (event.getCorrelationId() == null || event.getCorrelationId().isBlank()) {
            event.setCorrelationId("RX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Cryptographic Hash Chaining
        var lastEventOpt = auditRepo.findTopByOrderByTimestampDesc();
        String prevHash = lastEventOpt.map(AuditEvent::getEventHash).orElse("0000000000000000000000000000000000000000000000000000000000000000");
        event.setPreviousHash(prevHash);

        String payload = (prevHash != null ? prevHash : "") + "|" +
                event.getId() + "|" +
                (event.getUsername() != null ? event.getUsername() : "") + "|" +
                (event.getAction() != null ? event.getAction() : "") + "|" +
                (event.getResourceType() != null ? event.getResourceType() : "") + "|" +
                (event.getResourceId() != null ? event.getResourceId() : "") + "|" +
                (event.getCorrelationId() != null ? event.getCorrelationId() : "") + "|" +
                (event.getResult() != null ? event.getResult() : "") + "|" +
                (event.getTimestamp() != null ? event.getTimestamp().toString() : "");

        event.setEventHash(computeSha256(payload));

        return ResponseEntity.status(201).body(auditRepo.save(event));
    }

    @GetMapping("/verify-chain")
    @PreAuthorize("hasAnyRole('DR_AUDITOR', 'PLATFORM_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> verifyAuditChain() {
        List<AuditEvent> events = auditRepo.findAllByOrderByTimestampAsc();
        boolean valid = true;
        String currentPrevHash = "0000000000000000000000000000000000000000000000000000000000000000";
        int verifiedCount = 0;
        String failureReason = null;

        for (int i = 0; i < events.size(); i++) {
            AuditEvent ev = events.get(i);
            if (i > 0 && ev.getPreviousHash() != null && !ev.getPreviousHash().equalsIgnoreCase(currentPrevHash)) {
                valid = false;
                failureReason = "Broken chain link at event ID: " + ev.getId() + ". Expected prevHash: " + currentPrevHash + ", but found: " + ev.getPreviousHash();
                break;
            }
            if (ev.getEventHash() != null) {
                currentPrevHash = ev.getEventHash();
            }
            verifiedCount++;
        }

        java.util.Map<String, Object> resp = new java.util.HashMap<>();
        resp.put("status", valid ? "VERIFIED" : "TAMPERED");
        resp.put("verifiedEventCount", verifiedCount);
        resp.put("totalEvents", events.size());
        resp.put("lastHash", currentPrevHash);
        resp.put("algorithm", "SHA-256");
        resp.put("failureReason", failureReason);
        resp.put("checkedAt", java.time.Instant.now().toString());

        return ResponseEntity.ok(resp);
    }

    private String computeSha256(String data) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return "HASH_ERROR_" + UUID.randomUUID();
        }
    }
}

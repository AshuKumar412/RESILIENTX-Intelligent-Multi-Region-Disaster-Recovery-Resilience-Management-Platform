package com.resilientx.data.controller;

import com.resilientx.data.entity.DataCheckpoint;
import com.resilientx.data.entity.ReplicationStatusEntity;
import com.resilientx.data.entity.SampleCustomer;
import com.resilientx.data.entity.SampleTransaction;
import com.resilientx.data.repository.DataCheckpointRepository;
import com.resilientx.data.repository.ReplicationStatusRepository;
import com.resilientx.data.repository.SampleCustomerRepository;
import com.resilientx.data.repository.SampleTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DataContinuityController {

    private final ReplicationStatusRepository replicationRepo;
    private final DataCheckpointRepository checkpointRepo;
    private final SampleCustomerRepository customerRepo;
    private final SampleTransactionRepository transactionRepo;

    public DataContinuityController(
            ReplicationStatusRepository replicationRepo,
            DataCheckpointRepository checkpointRepo,
            SampleCustomerRepository customerRepo,
            SampleTransactionRepository transactionRepo
    ) {
        this.replicationRepo = replicationRepo;
        this.checkpointRepo = checkpointRepo;
        this.customerRepo = customerRepo;
        this.transactionRepo = transactionRepo;
    }

    // --- Replication Telemetry ---
    @GetMapping("/data/replication/{applicationId}")
    public ResponseEntity<?> getReplicationStatus(@PathVariable("applicationId") String applicationId) {
        return replicationRepo.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/data/checkpoints/{applicationId}")
    public ResponseEntity<List<DataCheckpoint>> getCheckpoints(@PathVariable("applicationId") String applicationId) {
        return ResponseEntity.ok(checkpointRepo.findByApplicationIdOrderByCreatedAtDesc(applicationId));
    }

    @GetMapping("/data/rpo/{applicationId}")
    public ResponseEntity<Map<String, Object>> calculateRpo(
            @PathVariable String applicationId,
            @RequestParam Instant failureDetectedAt
    ) {
        Map<String, Object> result = new HashMap<>();
        return replicationRepo.findByApplicationId(applicationId)
                .map(replication -> {
                    if (replication.getLastReplicatedAt() == null) {
                        result.put("status", "NOT_AVAILABLE");
                        result.put("rpoSeconds", null);
                    } else {
                        result.put("status", "AVAILABLE");
                        result.put("rpoSeconds", Duration.between(replication.getLastReplicatedAt(), failureDetectedAt).getSeconds());
                        result.put("lastSuccessfulReplicationAt", replication.getLastReplicatedAt());
                        result.put("failureDetectedAt", failureDetectedAt);
                    }
                    return ResponseEntity.ok(result);
                })
                .orElseGet(() -> {
                    result.put("status", "NOT_AVAILABLE");
                    result.put("rpoSeconds", null);
                    return ResponseEntity.ok(result);
                });
    }

    @PostMapping("/data/validate/{recoveryId}")
    public ResponseEntity<Map<String, Object>> validateRecoveryData(@PathVariable("recoveryId") String recoveryId) {
        Map<String, Object> result = new HashMap<>();
        result.put("recoveryId", recoveryId);
        result.put("status", "NOT_CONFIGURED");
        result.put("checksumMatch", null);
        result.put("message", "Independent recovery data comparison is not configured.");
        result.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(result);
    }

    // --- Sample Workload Ledger Endpoints ---
    @GetMapping("/ledger/customers")
    public ResponseEntity<List<SampleCustomer>> getCustomers() {
        return ResponseEntity.ok(customerRepo.findAll());
    }

    @PostMapping("/ledger/customers")
    public ResponseEntity<SampleCustomer> createCustomer(@RequestBody SampleCustomer customer) {
        if (customer.getId() == null || customer.getId().isBlank()) {
            customer.setId("CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(customerRepo.save(customer));
    }

    @GetMapping("/ledger/transactions")
    public ResponseEntity<List<SampleTransaction>> getTransactions() {
        return ResponseEntity.ok(transactionRepo.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/ledger/transactions")
    public ResponseEntity<SampleTransaction> createTransaction(@RequestBody Map<String, Object> body) {
        String customerId = (String) body.get("customerId");
        String customerName = (String) body.get("customerName");
        String currency = (String) body.get("currency");
        if (customerId == null || customerName == null || currency == null || body.get("amount") == null) {
            throw new IllegalArgumentException("Customer, amount, currency, and customer name are required.");
        }
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String explicitId = (String) body.get("id");
        String id = explicitId != null && !explicitId.isBlank() ? explicitId : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String hash = generateChecksum(id + ":" + customerId + ":" + amount);

        SampleTransaction txn = new SampleTransaction(
                id, customerId, customerName, amount, currency, "COMPLETED", "us-east-1", hash
        );

        SampleTransaction saved = transactionRepo.save(txn);

        // Update replication status stats
        replicationRepo.findByApplicationId(customerId).ifPresent(rep -> {
            rep.setTotalReplicatedTransactions((rep.getTotalReplicatedTransactions() == null ? 0 : rep.getTotalReplicatedTransactions()) + 1);
            rep.setLastReplicatedAt(Instant.now());
            rep.setUpdatedAt(Instant.now());
            replicationRepo.save(rep);
        });

        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/ledger/continuity/verify")
    public ResponseEntity<Map<String, Object>> verifyContinuity() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "NOT_CONFIGURED");
        res.put("checksumMatch", null);
        res.put("dataIntegrity", "NOT_CONFIGURED");
        res.put("message", "Independent primary and recovery data sources are not configured.");
        res.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(res);
    }

    private String generateChecksum(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 32);
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }
}

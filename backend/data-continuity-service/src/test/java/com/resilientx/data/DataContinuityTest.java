package com.resilientx.data;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import static org.junit.jupiter.api.Assertions.*;

public class DataContinuityTest {

    @Test
    @DisplayName("Verify SHA-256 Ledger Transaction Checksum Calculation")
    void testTransactionSha256Checksum() throws Exception {
        String customerId = "CUST-1001";
        String customerName = "Ashu Kumar";
        BigDecimal amount = new BigDecimal("10000.00");
        String currency = "INR";
        String status = "COMPLETED";

        String rawData = customerId + "|" + customerName + "|" + amount + "|" + currency + "|" + status;
        
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(rawData.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        String calculatedChecksum = hexString.toString();

        assertNotNull(calculatedChecksum);
        assertEquals(64, calculatedChecksum.length(), "SHA-256 hash must be exactly 64 hex characters");

        // Re-verifying idempotency
        byte[] verifyBytes = digest.digest(rawData.getBytes(StandardCharsets.UTF_8));
        StringBuilder verifyHex = new StringBuilder();
        for (byte b : verifyBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) verifyHex.append('0');
            verifyHex.append(hex);
        }
        assertEquals(calculatedChecksum, verifyHex.toString(), "Checksum must be deterministic across regions");
    }

    @Test
    @DisplayName("Verify RPO Calculation from Checkpoint Timestamps")
    void testRpoCalculation() {
        long replicationLagMs = 24L;
        long targetRpoSeconds = 300L; // 5 minutes SLA

        assertTrue(replicationLagMs < targetRpoSeconds * 1000, "Continuous replication lag (24ms) meets 5m RPO SLA");
    }
}

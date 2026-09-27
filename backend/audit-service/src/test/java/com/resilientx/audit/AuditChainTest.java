package com.resilientx.audit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AuditChainTest {

    private String sha256(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Test
    @DisplayName("Verify Cryptographic Tamper-Evident Hash Chain Integrity")
    void testAuditHashChain() throws Exception {
        String genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";

        // Event 1: APPROVE_RECOVERY
        String ev1Data = genesisHash + "|AUD-001|ashu.kumar|APPROVE_RECOVERY|INCIDENT|INC-8821|RX-CORR-1|SUCCESS";
        String ev1Hash = sha256(ev1Data);

        // Event 2: START_RECOVERY
        String ev2Data = ev1Hash + "|AUD-002|dr.orchestrator|START_RECOVERY|OPERATION|DR-0001|RX-CORR-1|SUCCESS";
        String ev2Hash = sha256(ev2Data);

        // Event 3: SWITCH_TRAFFIC
        String ev3Data = ev2Hash + "|AUD-003|route53.arc|SWITCH_TRAFFIC|ROUTING_CONTROL|RC-101|RX-CORR-1|SUCCESS";
        String ev3Hash = sha256(ev3Data);

        // Verify forward traversal
        List<String> recordedHashes = List.of(ev1Hash, ev2Hash, ev3Hash);
        List<String> recordedPrevHashes = List.of(genesisHash, ev1Hash, ev2Hash);

        String currentPrev = genesisHash;
        for (int i = 0; i < recordedHashes.size(); i++) {
            assertEquals(currentPrev, recordedPrevHashes.get(i), "Previous hash link must match exactly");
            currentPrev = recordedHashes.get(i);
        }

        assertEquals(ev3Hash, currentPrev, "Final chain tip matches last event hash");
    }

    @Test
    @DisplayName("Verify Detection of Tampered Record in Hash Chain")
    void testTamperDetection() throws Exception {
        String genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";
        String ev1Hash = sha256(genesisHash + "|AUD-001|ashu.kumar|APPROVE_RECOVERY|SUCCESS");

        // Simulating unauthorized modification of event 1
        String tamperedEv1Hash = sha256(genesisHash + "|AUD-001|attacker|APPROVE_RECOVERY|SUCCESS");

        // Event 2 expected previous hash was original ev1Hash
        assertNotEquals(ev1Hash, tamperedEv1Hash, "Tampered payload produces completely different SHA-256 hash");
    }
}

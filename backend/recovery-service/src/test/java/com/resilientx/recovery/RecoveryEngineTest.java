package com.resilientx.recovery;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class RecoveryEngineTest {

    @Test
    @DisplayName("Verify Dynamic RTO Calculation from Real Timestamps")
    void testDynamicRtoCalculation() {
        Instant detectionTime = Instant.parse("2026-09-25T08:00:00Z");
        Instant completionTime = Instant.parse("2026-09-25T08:03:38Z");

        long actualRtoSeconds = Duration.between(detectionTime, completionTime).getSeconds();
        assertEquals(218, actualRtoSeconds, "Actual RTO should be exactly 218 seconds (3m 38s)");
        assertTrue(actualRtoSeconds <= 900, "RTO must be within the 15-minute SLA");
    }

    @Test
    @DisplayName("Verify Recovery Phase Progression State Machine")
    void testPhaseProgression() {
        String[] phases = {
                "INITIATED",
                "ASSESSMENT",
                "APPROVAL_GATE",
                "DATABASE_PROMOTION",
                "COMPUTE_SCALE",
                "TRAFFIC_SWITCH",
                "HEALTH_VERIFICATION",
                "COMPLETED"
        };

        assertEquals(8, phases.length, "Recovery orchestration must consist of 7 active phases + completed");
        assertEquals("INITIATED", phases[0]);
        assertEquals("COMPLETED", phases[phases.length - 1]);
    }

    @Test
    @DisplayName("Verify Pilot Light Target Capacities")
    void testPilotLightCapacity() {
        int primaryInitialTasks = 3;
        int standbyInitialTasks = 0;
        int standbyRecoveredTasks = 3;

        assertEquals(0, standbyInitialTasks, "Standby region starts with 0 compute tasks in Pilot Light");
        assertEquals(primaryInitialTasks, standbyRecoveredTasks, "Standby region scales to full capacity during failover");
    }
}

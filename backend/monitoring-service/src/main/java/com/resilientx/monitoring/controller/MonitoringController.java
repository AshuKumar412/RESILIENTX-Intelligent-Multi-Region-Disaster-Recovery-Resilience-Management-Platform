package com.resilientx.monitoring.controller;

import com.resilientx.monitoring.entity.HealthEvent;
import com.resilientx.monitoring.repository.HealthEventRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final HealthEventRepository healthRepo;

    public MonitoringController(HealthEventRepository healthRepo) {
        this.healthRepo = healthRepo;
    }

    @GetMapping("/events")
    public ResponseEntity<List<HealthEvent>> getHealthEvents(@RequestParam(required = false) String applicationId) {
        if (applicationId != null && !applicationId.isBlank()) {
            return ResponseEntity.ok(healthRepo.findByApplicationIdOrderByTimestampDesc(applicationId));
        }
        return ResponseEntity.ok(healthRepo.findTop50ByOrderByTimestampDesc());
    }

    @PostMapping("/events")
    public ResponseEntity<HealthEvent> recordHealthEvent(@RequestBody HealthEvent event) {
        if (event.getId() == null || event.getId().isBlank()) {
            event.setId("HLT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(healthRepo.save(event));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getOverallHealth() {
        // Returns real DB-backed event counts. Service-to-service health is NOT independently verified here.
        Map<String, Object> health = new HashMap<>();
        long eventCount = healthRepo.count();
        health.put("status", "MONITORING_SERVICE_UP");
        health.put("dbHealthEventsRecorded", eventCount);
        health.put("note", "Use /actuator/health on each service for individual status.");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }

    @GetMapping("/assess/{applicationId}")
    public ResponseEntity<Map<String, Object>> assessApplicationImpact(@PathVariable String applicationId) {
        List<HealthEvent> events = healthRepo.findByApplicationIdOrderByTimestampDesc(applicationId);
        Map<String, Object> assessment = new HashMap<>();
        assessment.put("applicationId", applicationId);

        if (events.isEmpty()) {
            assessment.put("status", "NO_DATA");
            assessment.put("message", "No health events recorded for this application. Monitoring data unavailable.");
        } else {
            HealthEvent latest = events.get(0);
            assessment.put("status", latest.getStatus());
            assessment.put("latestEventComponent", latest.getComponent());
            assessment.put("latestEventMessage", latest.getMessage());
            assessment.put("latestEventTimestamp", latest.getTimestamp().toString());
            assessment.put("totalEventsRecorded", events.size());
            long degradedCount = events.stream().filter(e -> "DEGRADED".equals(e.getStatus()) || "UNAVAILABLE".equals(e.getStatus())).count();
            assessment.put("degradedEventCount", degradedCount);
            assessment.put("impactLevel", degradedCount > 0 ? "DEGRADED" : "UNKNOWN");
            assessment.put("note", "Impact level derived from recorded health events only. Real-time AWS telemetry requires AWS integration.");
        }

        assessment.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(assessment);
    }

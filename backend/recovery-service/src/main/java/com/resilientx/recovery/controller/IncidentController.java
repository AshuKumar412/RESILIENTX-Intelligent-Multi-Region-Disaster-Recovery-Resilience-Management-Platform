package com.resilientx.recovery.controller;

import com.resilientx.recovery.entity.Incident;
import com.resilientx.recovery.repository.IncidentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentRepository incidentRepo;

    public IncidentController(IncidentRepository incidentRepo) {
        this.incidentRepo = incidentRepo;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(@RequestParam(required = false) String applicationId) {
        if (applicationId != null && !applicationId.isBlank()) {
            return ResponseEntity.ok(incidentRepo.findByApplicationIdOrderByDetectedAtDesc(applicationId));
        }
        return ResponseEntity.ok(incidentRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable String id) {
        return incidentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

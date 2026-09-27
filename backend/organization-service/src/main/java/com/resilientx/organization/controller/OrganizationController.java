package com.resilientx.organization.controller;

import com.resilientx.organization.entity.ApplicationEntity;
import com.resilientx.organization.entity.Environment;
import com.resilientx.organization.entity.Organization;
import com.resilientx.organization.repository.ApplicationRepository;
import com.resilientx.organization.repository.EnvironmentRepository;
import com.resilientx.organization.repository.OrganizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class OrganizationController {

    private final OrganizationRepository orgRepo;
    private final EnvironmentRepository envRepo;
    private final ApplicationRepository appRepo;

    public OrganizationController(OrganizationRepository orgRepo, EnvironmentRepository envRepo, ApplicationRepository appRepo) {
        this.orgRepo = orgRepo;
        this.envRepo = envRepo;
        this.appRepo = appRepo;
    }

    // --- Organizations ---
    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> getAllOrganizations() {
        return ResponseEntity.ok(orgRepo.findAll());
    }

    @PostMapping("/organizations")
    public ResponseEntity<Organization> createOrganization(@RequestBody Organization org) {
        if (org.getId() == null || org.getId().isBlank()) {
            org.setId("ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(orgRepo.save(org));
    }

    // --- Environments ---
    @GetMapping("/environments")
    public ResponseEntity<List<Environment>> getEnvironments(@RequestParam(required = false) String organizationId) {
        if (organizationId != null && !organizationId.isBlank()) {
            return ResponseEntity.ok(envRepo.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(envRepo.findAll());
    }

    @PostMapping("/environments")
    public ResponseEntity<Environment> createEnvironment(@RequestBody Environment env) {
        if (env.getId() == null || env.getId().isBlank()) {
            env.setId("ENV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(envRepo.save(env));
    }

    // --- Applications ---
    @GetMapping("/applications")
    public ResponseEntity<List<ApplicationEntity>> getApplications(@RequestParam(required = false) String organizationId) {
        if (organizationId != null && !organizationId.isBlank()) {
            return ResponseEntity.ok(appRepo.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(appRepo.findAll());
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable String id) {
        return appRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/applications")
    public ResponseEntity<ApplicationEntity> createApplication(@RequestBody ApplicationEntity app) {
        if (app.getId() == null || app.getId().isBlank()) {
            app.setId("APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return ResponseEntity.status(201).body(appRepo.save(app));
    }

    @PutMapping("/applications/{id}")
    public ResponseEntity<?> updateApplication(@PathVariable String id, @RequestBody ApplicationEntity update) {
        return appRepo.findById(id).map(app -> {
            if (update.getName() != null) app.setName(update.getName());
            if (update.getDescription() != null) app.setDescription(update.getDescription());
            if (update.getCriticality() != null) app.setCriticality(update.getCriticality());
            if (update.getStatus() != null) app.setStatus(update.getStatus());
            if (update.getPrimaryRegionId() != null) app.setPrimaryRegionId(update.getPrimaryRegionId());
            if (update.getRecoveryRegionId() != null) app.setRecoveryRegionId(update.getRecoveryRegionId());
            return ResponseEntity.ok(appRepo.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }
}

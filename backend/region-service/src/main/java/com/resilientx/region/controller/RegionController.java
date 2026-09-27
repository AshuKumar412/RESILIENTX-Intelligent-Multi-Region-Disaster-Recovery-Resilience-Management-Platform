package com.resilientx.region.controller;

import com.resilientx.region.entity.DeploymentEntity;
import com.resilientx.region.entity.RegionEntity;
import com.resilientx.region.entity.RegionPair;
import com.resilientx.region.repository.DeploymentRepository;
import com.resilientx.region.repository.RegionPairRepository;
import com.resilientx.region.repository.RegionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/regions")
public class RegionController {

    private final RegionRepository regionRepo;
    private final RegionPairRepository pairRepo;
    private final DeploymentRepository deployRepo;

    public RegionController(RegionRepository regionRepo, RegionPairRepository pairRepo, DeploymentRepository deployRepo) {
        this.regionRepo = regionRepo;
        this.pairRepo = pairRepo;
        this.deployRepo = deployRepo;
    }

    @GetMapping
    public ResponseEntity<List<RegionEntity>> getAllRegions() {
        return ResponseEntity.ok(regionRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRegionById(@PathVariable String id) {
        return regionRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RegionEntity> createRegion(@RequestBody RegionEntity region) {
        return ResponseEntity.status(201).body(regionRepo.save(region));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRegion(@PathVariable String id, @RequestBody RegionEntity update) {
        return regionRepo.findById(id).map(region -> {
            if (update.getName() != null) region.setName(update.getName());
            if (update.getRole() != null) region.setRole(update.getRole());
            if (update.getStatus() != null) region.setStatus(update.getStatus());
            if (update.getHealthStatus() != null) region.setHealthStatus(update.getHealthStatus());
            if (update.getComputeCapacity() != null) region.setComputeCapacity(update.getComputeCapacity());
            if (update.getDesiredComputeCapacity() != null) region.setDesiredComputeCapacity(update.getDesiredComputeCapacity());
            if (update.getDatabaseRole() != null) region.setDatabaseRole(update.getDatabaseRole());
            if (update.getTrafficPercentage() != null) region.setTrafficPercentage(update.getTrafficPercentage());
            region.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(regionRepo.save(region));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pairs")
    public ResponseEntity<List<RegionPair>> getRegionPairs() {
        return ResponseEntity.ok(pairRepo.findAll());
    }

    @GetMapping("/topology")
    public ResponseEntity<Map<String, Object>> getLiveTopology() {
        List<RegionEntity> regions = regionRepo.findAll();
        List<RegionPair> pairs = pairRepo.findAll();

        Map<String, Object> topology = new HashMap<>();
        topology.put("regions", regions);
        topology.put("pairs", pairs);
        topology.put("activeTrafficSplit", regions.stream().collect(
                HashMap::new,
                (m, r) -> m.put(r.getId(), r.getTrafficPercentage()),
                HashMap::putAll
        ));
        topology.put("timestamp", Instant.now().toString());

        return ResponseEntity.ok(topology);
    }
}

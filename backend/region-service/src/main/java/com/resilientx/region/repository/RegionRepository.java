package com.resilientx.region.repository;

import com.resilientx.region.entity.RegionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<RegionEntity, String> {
    Optional<RegionEntity> findByCode(String code);
}

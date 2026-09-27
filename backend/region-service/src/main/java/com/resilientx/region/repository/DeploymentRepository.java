package com.resilientx.region.repository;

import com.resilientx.region.entity.DeploymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeploymentRepository extends JpaRepository<DeploymentEntity, String> {
    List<DeploymentEntity> findByApplicationId(String applicationId);
    List<DeploymentEntity> findByRegionId(String regionId);
}

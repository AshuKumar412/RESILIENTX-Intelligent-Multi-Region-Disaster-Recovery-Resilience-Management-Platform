package com.resilientx.policy.repository;

import com.resilientx.policy.entity.RecoveryPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecoveryPlanRepository extends JpaRepository<RecoveryPlan, String> {
    List<RecoveryPlan> findByApplicationId(String applicationId);
    Optional<RecoveryPlan> findByApplicationIdAndName(String applicationId, String name);
}

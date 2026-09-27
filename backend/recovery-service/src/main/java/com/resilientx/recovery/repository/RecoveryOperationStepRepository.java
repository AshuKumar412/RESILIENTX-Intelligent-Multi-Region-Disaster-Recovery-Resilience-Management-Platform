package com.resilientx.recovery.repository;

import com.resilientx.recovery.entity.RecoveryOperationStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryOperationStepRepository extends JpaRepository<RecoveryOperationStep, String> {
    List<RecoveryOperationStep> findByOperationIdOrderByStepNumberAsc(String operationId);
}

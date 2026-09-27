package com.resilientx.recovery.repository;

import com.resilientx.recovery.entity.RecoveryOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecoveryOperationRepository extends JpaRepository<RecoveryOperation, String> {
    Optional<RecoveryOperation> findByOperationCode(String operationCode);
    List<RecoveryOperation> findByStatusOrderByStartedAtDesc(String status);
    List<RecoveryOperation> findByApplicationIdOrderByStartedAtDesc(String applicationId);
    boolean existsByApplicationIdAndStatus(String applicationId, String status);
}

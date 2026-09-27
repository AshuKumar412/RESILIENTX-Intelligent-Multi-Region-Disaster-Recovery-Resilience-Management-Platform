package com.resilientx.policy.repository;

import com.resilientx.policy.entity.RecoveryPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecoveryPolicyRepository extends JpaRepository<RecoveryPolicy, String> {
    Optional<RecoveryPolicy> findByName(String name);
}

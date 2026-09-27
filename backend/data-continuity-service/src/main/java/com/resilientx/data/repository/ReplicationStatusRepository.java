package com.resilientx.data.repository;

import com.resilientx.data.entity.ReplicationStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReplicationStatusRepository extends JpaRepository<ReplicationStatusEntity, String> {
    Optional<ReplicationStatusEntity> findByApplicationId(String applicationId);
}

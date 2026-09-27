package com.resilientx.data.repository;

import com.resilientx.data.entity.DataCheckpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataCheckpointRepository extends JpaRepository<DataCheckpoint, String> {
    List<DataCheckpoint> findByApplicationIdOrderByCreatedAtDesc(String applicationId);
}

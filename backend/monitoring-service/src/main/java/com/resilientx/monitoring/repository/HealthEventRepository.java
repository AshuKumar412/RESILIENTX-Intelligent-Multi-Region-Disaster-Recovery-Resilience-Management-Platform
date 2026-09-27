package com.resilientx.monitoring.repository;

import com.resilientx.monitoring.entity.HealthEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthEventRepository extends JpaRepository<HealthEvent, String> {
    List<HealthEvent> findByApplicationIdOrderByTimestampDesc(String applicationId);
    List<HealthEvent> findTop50ByOrderByTimestampDesc();
}

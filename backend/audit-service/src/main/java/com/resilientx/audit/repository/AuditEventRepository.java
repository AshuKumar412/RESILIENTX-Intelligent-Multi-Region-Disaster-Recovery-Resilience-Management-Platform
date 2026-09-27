package com.resilientx.audit.repository;

import com.resilientx.audit.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, String> {
    List<AuditEvent> findTop100ByOrderByTimestampDesc();
    List<AuditEvent> findByCorrelationIdOrderByTimestampAsc(String correlationId);
    List<AuditEvent> findByResourceIdOrderByTimestampDesc(String resourceId);
    java.util.Optional<AuditEvent> findTopByOrderByTimestampDesc();
    List<AuditEvent> findAllByOrderByTimestampAsc();
}

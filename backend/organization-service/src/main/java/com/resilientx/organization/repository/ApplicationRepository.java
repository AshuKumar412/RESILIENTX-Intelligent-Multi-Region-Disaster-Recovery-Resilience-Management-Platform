package com.resilientx.organization.repository;

import com.resilientx.organization.entity.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, String> {
    List<ApplicationEntity> findByOrganizationId(String organizationId);
    List<ApplicationEntity> findByEnvironmentId(String environmentId);
}

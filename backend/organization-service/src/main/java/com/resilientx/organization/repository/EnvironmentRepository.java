package com.resilientx.organization.repository;

import com.resilientx.organization.entity.Environment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentRepository extends JpaRepository<Environment, String> {
    List<Environment> findByOrganizationId(String organizationId);
}

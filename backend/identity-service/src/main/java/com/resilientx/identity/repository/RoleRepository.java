package com.resilientx.identity.repository;

import com.resilientx.identity.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByName(String name);
    Optional<Role> findByIdOrName(String id, String name);
}

package com.resilientx.data.repository;

import com.resilientx.data.entity.SampleCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SampleCustomerRepository extends JpaRepository<SampleCustomer, String> {}

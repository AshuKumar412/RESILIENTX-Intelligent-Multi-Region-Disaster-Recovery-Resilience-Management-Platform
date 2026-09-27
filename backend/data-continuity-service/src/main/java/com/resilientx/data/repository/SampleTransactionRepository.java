package com.resilientx.data.repository;

import com.resilientx.data.entity.SampleTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SampleTransactionRepository extends JpaRepository<SampleTransaction, String> {
    List<SampleTransaction> findAllByOrderByCreatedAtDesc();
}

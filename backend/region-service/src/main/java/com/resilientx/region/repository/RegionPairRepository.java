package com.resilientx.region.repository;

import com.resilientx.region.entity.RegionPair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionPairRepository extends JpaRepository<RegionPair, String> {}

package com.resilientx.identity.repository;

import com.resilientx.identity.entity.EmailOtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailOtpVerificationRepository extends JpaRepository<EmailOtpVerification, String> {

    Optional<EmailOtpVerification> findTopByEmailAndOtpTypeOrderByCreatedAtDesc(String email, String otpType);

    Optional<EmailOtpVerification> findTopByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, String otpType, Instant now
    );

    long countByEmailAndCreatedAtAfter(String email, Instant after);

    List<EmailOtpVerification> findAllByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfter(
            String email, String otpType, Instant now
    );
}

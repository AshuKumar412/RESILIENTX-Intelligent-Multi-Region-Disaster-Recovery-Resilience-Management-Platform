package com.resilientx.identity.service;

import com.resilientx.identity.email.EmailService;
import com.resilientx.identity.entity.EmailOtpVerification;
import com.resilientx.identity.repository.EmailOtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_RESENDS_PER_HOUR = 5;
    private static final int MAX_ATTEMPTS = 5;

    private final EmailOtpVerificationRepository otpRepo;
    private final EmailService emailService;

    public OtpService(EmailOtpVerificationRepository otpRepo, EmailService emailService) {
        this.otpRepo = otpRepo;
        this.emailService = emailService;
    }

    @Transactional
    public void generateAndSendOtp(String email, String userName, String otpType) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email address is required.");
        }
        String normalizedEmail = email.trim().toLowerCase();
        Instant now = Instant.now();

        // 1. Rate-limit check: Max 5 resend requests per hour
        Instant oneHourAgo = now.minus(Duration.ofHours(1));
        long countPastHour = otpRepo.countByEmailAndCreatedAtAfter(normalizedEmail, oneHourAgo);
        if (countPastHour >= MAX_RESENDS_PER_HOUR) {
            throw new IllegalStateException("Maximum verification code requests exceeded for this hour (limit: " 
                    + MAX_RESENDS_PER_HOUR + "). Please try again later.");
        }

        // 2. Rate-limit check: 60-second cooldown
        Optional<EmailOtpVerification> latestOpt = otpRepo.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(normalizedEmail, otpType);
        if (latestOpt.isPresent()) {
            EmailOtpVerification latest = latestOpt.get();
            long secondsSince = Duration.between(latest.getCreatedAt(), now).getSeconds();
            if (secondsSince < RESEND_COOLDOWN_SECONDS) {
                long remaining = RESEND_COOLDOWN_SECONDS - secondsSince;
                throw new IllegalStateException("Please wait " + remaining + " seconds before requesting a new code.");
            }
        }

        // 3. Invalidate all previous unverified OTPs for this email and type
        List<EmailOtpVerification> activeOtps = otpRepo.findAllByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfter(
                normalizedEmail, otpType, now
        );
        for (EmailOtpVerification oldOtp : activeOtps) {
            oldOtp.setExpiresAt(now.minusSeconds(1)); // Invalidate immediately
            otpRepo.save(oldOtp);
        }

        // 4. Generate cryptographically secure 6-digit OTP (100000 - 999999) using SecureRandom
        int code = 100000 + SECURE_RANDOM.nextInt(900000);
        String otpCode = String.valueOf(code);

        // 5. Compute SHA-256 secure digest for storage (Never store plaintext)
        String hash = computeSha256(otpCode + "|" + normalizedEmail);

        Instant expiresAt = now.plus(Duration.ofMinutes(OTP_EXPIRY_MINUTES));
        String id = "OTP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        EmailOtpVerification verification = new EmailOtpVerification(id, normalizedEmail, hash, otpType, expiresAt);
        otpRepo.save(verification);

        // 6. Dispatch through Gmail SMTP EmailService
        emailService.sendOtpEmail(normalizedEmail, userName, otpCode, otpType, OTP_EXPIRY_MINUTES);
    }

    @Transactional
    public boolean verifyOtp(String email, String rawOtpCode, String otpType) {
        if (email == null || rawOtpCode == null || rawOtpCode.trim().length() != 6) {
            return false;
        }

        String normalizedEmail = email.trim().toLowerCase();
        Instant now = Instant.now();

        Optional<EmailOtpVerification> otpOpt = otpRepo
                .findTopByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(normalizedEmail, otpType, now);

        if (otpOpt.isEmpty()) {
            return false;
        }

        EmailOtpVerification record = otpOpt.get();

        // Check if maximum verification attempts exceeded
        if (record.getAttemptCount() >= MAX_ATTEMPTS) {
            return false;
        }

        record.setAttemptCount(record.getAttemptCount() + 1);

        String expectedHash = computeSha256(rawOtpCode.trim() + "|" + normalizedEmail);
        if (MessageDigest.isEqual(record.getOtpHash().getBytes(StandardCharsets.UTF_8), expectedHash.getBytes(StandardCharsets.UTF_8))) {
            record.setVerifiedAt(Instant.now());
            otpRepo.save(record);
            return true;
        }

        otpRepo.save(record);
        return false;
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing cryptographic SHA-256 digest", e);
        }
    }
}

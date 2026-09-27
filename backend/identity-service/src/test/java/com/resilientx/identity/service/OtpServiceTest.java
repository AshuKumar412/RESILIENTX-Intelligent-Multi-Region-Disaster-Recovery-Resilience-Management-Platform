package com.resilientx.identity.service;

import com.resilientx.identity.email.EmailService;
import com.resilientx.identity.entity.EmailOtpVerification;
import com.resilientx.identity.repository.EmailOtpVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OtpServiceTest {

    private EmailOtpVerificationRepository otpRepo;
    private EmailService emailService;
    private OtpService otpService;

    @BeforeEach
    void setUp() {
        otpRepo = mock(EmailOtpVerificationRepository.class);
        emailService = mock(EmailService.class);
        otpService = new OtpService(otpRepo, emailService);
    }

    @Test
    @DisplayName("generateAndSendOtp generates 6-digit code, hashes it with SHA-256 and calls EmailService")
    void testGenerateAndSendOtpSuccess() {
        String email = "sre.operator@enterprise.com";
        String userName = "Jane Doe";
        String otpType = "EMAIL_VERIFICATION";

        when(otpRepo.countByEmailAndCreatedAtAfter(eq(email), any(Instant.class))).thenReturn(0L);
        when(otpRepo.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(eq(email), eq(otpType))).thenReturn(Optional.empty());
        when(otpRepo.findAllByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfter(eq(email), eq(otpType), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        otpService.generateAndSendOtp(email, userName, otpType);

        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService, times(1)).sendOtpEmail(eq(email), eq(userName), otpCaptor.capture(), eq(otpType), eq(10));

        String rawOtp = otpCaptor.getValue();
        assertNotNull(rawOtp);
        assertEquals(6, rawOtp.length());
        assertTrue(rawOtp.matches("\\d{6}"));

        ArgumentCaptor<EmailOtpVerification> entityCaptor = ArgumentCaptor.forClass(EmailOtpVerification.class);
        verify(otpRepo, times(1)).save(entityCaptor.capture());

        EmailOtpVerification savedEntity = entityCaptor.getValue();
        assertNotNull(savedEntity.getOtpHash());
        // Verify plaintext is NEVER stored
        assertNotEquals(rawOtp, savedEntity.getOtpHash());
        assertEquals(64, savedEntity.getOtpHash().length()); // SHA-256 hex length
    }

    @Test
    @DisplayName("generateAndSendOtp throws exception when 60-second cooldown is violated")
    void testResendCooldownEnforced() {
        String email = "sre.operator@enterprise.com";
        String otpType = "EMAIL_VERIFICATION";

        EmailOtpVerification recentOtp = new EmailOtpVerification("OTP-1", email, "hash", otpType, Instant.now().plus(10, ChronoUnit.MINUTES));
        recentOtp.setCreatedAt(Instant.now().minus(20, ChronoUnit.SECONDS)); // Created 20s ago (less than 60s)

        when(otpRepo.countByEmailAndCreatedAtAfter(eq(email), any(Instant.class))).thenReturn(1L);
        when(otpRepo.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(eq(email), eq(otpType))).thenReturn(Optional.of(recentOtp));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                otpService.generateAndSendOtp(email, "Operator", otpType)
        );
        assertTrue(ex.getMessage().contains("Please wait"));
    }

    @Test
    @DisplayName("generateAndSendOtp throws exception when max 5 resends per hour is reached")
    void testMaxResendsPerHourEnforced() {
        String email = "sre.operator@enterprise.com";
        String otpType = "EMAIL_VERIFICATION";

        when(otpRepo.countByEmailAndCreatedAtAfter(eq(email), any(Instant.class))).thenReturn(5L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                otpService.generateAndSendOtp(email, "Operator", otpType)
        );
        assertTrue(ex.getMessage().contains("Maximum verification code requests exceeded"));
    }

    @Test
    @DisplayName("verifyOtp correctly verifies matching OTP and rejects invalid code")
    void testVerifyOtpSuccessAndFailure() {
        String email = "sre.operator@enterprise.com";
        String otpType = "EMAIL_VERIFICATION";

        when(otpRepo.countByEmailAndCreatedAtAfter(eq(email), any(Instant.class))).thenReturn(0L);
        when(otpRepo.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(eq(email), eq(otpType))).thenReturn(Optional.empty());
        when(otpRepo.findAllByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfter(eq(email), eq(otpType), any(Instant.class)))
                .thenReturn(Collections.emptyList());

        ArgumentCaptor<EmailOtpVerification> entityCaptor = ArgumentCaptor.forClass(EmailOtpVerification.class);
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);

        otpService.generateAndSendOtp(email, "Jane", otpType);
        verify(emailService).sendOtpEmail(eq(email), eq("Jane"), otpCaptor.capture(), eq(otpType), eq(10));
        verify(otpRepo).save(entityCaptor.capture());

        String correctOtp = otpCaptor.getValue();
        EmailOtpVerification savedVerification = entityCaptor.getValue();

        when(otpRepo.findTopByEmailAndOtpTypeAndVerifiedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(email), eq(otpType), any(Instant.class)
        )).thenReturn(Optional.of(savedVerification));

        // Wrong code fails
        assertFalse(otpService.verifyOtp(email, "000000", otpType));

        // Correct code succeeds
        assertTrue(otpService.verifyOtp(email, correctOtp, otpType));
        assertNotNull(savedVerification.getVerifiedAt());
    }
}

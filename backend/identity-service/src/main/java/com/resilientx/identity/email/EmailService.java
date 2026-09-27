package com.resilientx.identity.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailProvider emailProvider;

    public EmailService(@Qualifier("smtpEmailProvider") EmailProvider emailProvider) {
        this.emailProvider = emailProvider;
    }

    public void sendOtpEmail(String toEmail, String userName, String otpCode, String otpType, int expiryMinutes) {
        emailProvider.sendOtpEmail(toEmail, userName, otpCode, otpType, expiryMinutes);
    }
}

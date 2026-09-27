package com.resilientx.identity.email;

public interface EmailProvider {

    String getProviderName();

    void sendOtpEmail(String toEmail, String userName, String otpCode, String otpType, int expiryMinutes);
}

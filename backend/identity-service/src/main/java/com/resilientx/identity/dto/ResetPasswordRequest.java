package com.resilientx.identity.dto;

public class ResetPasswordRequest {
    private String email;
    private String token;
    private String otpCode;
    private String newPassword;
    private String confirmPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String email, String token, String newPassword, String confirmPassword) {
        this.email = email;
        this.token = token;
        this.otpCode = token;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getToken() { return token != null ? token : otpCode; }
    public void setToken(String token) {
        this.token = token;
        if (this.otpCode == null) this.otpCode = token;
    }

    public String getOtpCode() { return otpCode != null ? otpCode : token; }
    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
        if (this.token == null) this.token = otpCode;
    }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}

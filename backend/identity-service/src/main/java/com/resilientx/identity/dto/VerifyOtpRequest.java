package com.resilientx.identity.dto;

public class VerifyOtpRequest {
    private String email;
    private String otpCode;
    private String otpType = "EMAIL_VERIFICATION"; // EMAIL_VERIFICATION, PASSWORD_RESET

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String email, String otpCode, String otpType) {
        this.email = email;
        this.otpCode = otpCode;
        this.otpType = otpType != null ? otpType : "EMAIL_VERIFICATION";
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    public String getOtpType() { return otpType; }
    public void setOtpType(String otpType) { this.otpType = otpType; }
}

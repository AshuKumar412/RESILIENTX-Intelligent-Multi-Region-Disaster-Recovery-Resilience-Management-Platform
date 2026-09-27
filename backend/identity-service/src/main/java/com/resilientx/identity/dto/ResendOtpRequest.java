package com.resilientx.identity.dto;

public class ResendOtpRequest {
    private String email;
    private String otpType = "EMAIL_VERIFICATION";

    public ResendOtpRequest() {}

    public ResendOtpRequest(String email, String otpType) {
        this.email = email;
        this.otpType = otpType != null ? otpType : "EMAIL_VERIFICATION";
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtpType() { return otpType; }
    public void setOtpType(String otpType) { this.otpType = otpType; }
}

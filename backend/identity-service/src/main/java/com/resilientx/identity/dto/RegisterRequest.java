package com.resilientx.identity.dto;

public class RegisterRequest {
    private String username;
    private String fullName;
    private String email;
    private String password;
    private String confirmPassword;
    private String organization;
    private String department;

    public RegisterRequest() {}

    public RegisterRequest(String username, String fullName, String email, String password, String confirmPassword) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

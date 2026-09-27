package com.resilientx.identity.dto;

import java.util.Set;

public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private Boolean isActive;
    private Set<String> roles;
    private Set<String> permissions;

    public UserDTO() {}

    public UserDTO(String id, String username, String email, String fullName, Boolean isActive, Set<String> roles, Set<String> permissions) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.isActive = isActive;
        this.roles = roles;
        this.permissions = permissions;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public Set<String> getPermissions() { return permissions; }
    public void setPermissions(Set<String> permissions) { this.permissions = permissions; }
}

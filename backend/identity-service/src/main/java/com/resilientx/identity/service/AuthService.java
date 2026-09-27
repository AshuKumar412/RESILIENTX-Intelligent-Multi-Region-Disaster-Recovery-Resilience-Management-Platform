package com.resilientx.identity.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.resilientx.identity.dto.AuthRequest;
import com.resilientx.identity.dto.AuthResponse;
import com.resilientx.identity.dto.ChangePasswordRequest;
import com.resilientx.identity.dto.ForgotPasswordRequest;
import com.resilientx.identity.dto.RegisterRequest;
import com.resilientx.identity.dto.ResendOtpRequest;
import com.resilientx.identity.dto.ResetPasswordRequest;
import com.resilientx.identity.dto.UserDTO;
import com.resilientx.identity.dto.VerifyOtpRequest;
import com.resilientx.identity.entity.Permission;
import com.resilientx.identity.entity.Role;
import com.resilientx.identity.entity.User;
import com.resilientx.identity.exception.DuplicateResourceException;
import com.resilientx.identity.exception.RateLimitException;
import com.resilientx.identity.repository.RoleRepository;
import com.resilientx.identity.repository.UserRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        // 1. Identify user by username or email
        String identifier = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername().trim()
                : (request.getEmail() != null ? request.getEmail().trim() : "");

        if (identifier.isBlank() || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Please enter your operator username/email and password.");
        }

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials. Please verify your details."));

        // 2. Email Verification Gate
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            log.warn("Login blocked: email not verified for user {}", user.getUsername());
            throw new IllegalStateException("EMAIL_NOT_VERIFIED: Your corporate email address must be verified via OTP before signing in.");
        }

        // 3. Verify Password with BCrypt
        boolean matches = user.getPasswordHash() != null
            && passwordEncoder.matches(request.getPassword(), user.getPasswordHash());

        if (!matches) {
            log.warn("Login failed: password mismatch for operator {}", user.getUsername());
            throw new IllegalArgumentException("Invalid credentials. Please verify your details.");
        }

        // 4. Update last login timestamp
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        // 5. Build JWT Claims
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        if (roles.isEmpty()) {
            roles = Set.of("ROLE_VIEWER");
        }

        Set<String> permissions = new HashSet<>();
        for (Role r : user.getRoles()) {
            for (Permission p : r.getPermissions()) {
                permissions.add(p.getName());
            }
        }
        if (permissions.isEmpty()) {
            permissions.add("PERM_APP_VIEW");
            permissions.add("PERM_REG_VIEW");
        }

        String token = jwtService.generateToken(user.getUsername(), roles, permissions);
        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getIsActive(),
                roles,
                permissions
        );

        log.info("Operator {} logged in successfully with roles {}", user.getUsername(), roles);
        return new AuthResponse(token, userDTO);
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isBlank()) {
            throw new IllegalArgumentException("Please enter your full name.");
        }
        if (request.getEmail() == null || !EMAIL_PATTERN.matcher(request.getEmail().trim()).matches()) {
            throw new IllegalArgumentException("Please enter a valid corporate email address.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long.");
        }
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String username = (request.getUsername() != null && !request.getUsername().trim().isEmpty())
                ? request.getUsername().trim()
                : email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");

        if (username.length() < 3) {
            username = username + UUID.randomUUID().toString().substring(0, 4);
        }

        // Check duplicates with HTTP 409
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email address already exists.");
        }
        if (userRepository.existsByUsername(username)) {
            username = username + "_" + UUID.randomUUID().toString().substring(0, 6);
        }

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User(userId, username, email, passwordHash, request.getFullName().trim());
        user.setEmailVerified(false);
        user.setIsActive(true);
        user.setAccountStatus("PENDING_VERIFICATION");

        // Assign safe non-privileged role: ROLE_VIEWER (seeded as id=ROLE_VIEWER, name=VIEWER)
        Role viewerRole = roleRepository.findByIdOrName("ROLE_VIEWER", "VIEWER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_VIEWER", "VIEWER", "Default read-only viewer role")));
        user.setRoles(Set.of(viewerRole));

        userRepository.save(user);
        log.info("Registration: user {} created, dispatching OTP", username);

        // Generate and dispatch OTP via Gmail SMTP
        try {
            otpService.generateAndSendOtp(email, user.getFullName(), "EMAIL_VERIFICATION");
        } catch (IllegalStateException rateEx) {
            // OTP rate limit hit — re-throw as RateLimitException so controller maps to 429
            throw new RateLimitException(rateEx.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", 201);
        response.put("email", email);
        response.put("maskedEmail", maskEmail(email));
        response.put("message", "Verification code sent to your email.");
        return response;
    }

    @Transactional
    public AuthResponse verifyEmailOtp(VerifyOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (request.getOtpCode() == null || request.getOtpCode().trim().length() != 6) {
            throw new IllegalArgumentException("Please enter a valid 6-digit verification code.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String otpType = request.getOtpType() != null ? request.getOtpType() : "EMAIL_VERIFICATION";
        boolean valid = otpService.verifyOtp(email, request.getOtpCode().trim(), otpType);

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired verification code. Please check and try again.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        user.setEmailVerified(true);
        user.setAccountStatus("ACTIVE");
        user.setUpdatedAt(Instant.now());
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        log.info("Email verified successfully for user {}", user.getUsername());

        // Automatically log in user after verification
        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        if (roles.isEmpty()) roles = Set.of("ROLE_VIEWER");

        Set<String> permissions = new HashSet<>();
        for (Role r : user.getRoles()) {
            for (Permission p : r.getPermissions()) {
                permissions.add(p.getName());
            }
        }
        if (permissions.isEmpty()) {
            permissions.add("PERM_APP_VIEW");
            permissions.add("PERM_REG_VIEW");
        }

        String token = jwtService.generateToken(user.getUsername(), roles, permissions);
        UserDTO userDTO = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getIsActive(),
                roles,
                permissions
        );

        return new AuthResponse(token, userDTO);
    }

    @Transactional
    public Map<String, Object> resendOtp(ResendOtpRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String otpType = request.getOtpType() != null ? request.getOtpType() : "EMAIL_VERIFICATION";

        Optional<User> userOpt = userRepository.findByEmail(email);
        String userName = userOpt.map(User::getFullName).orElse("Operator");

        otpService.generateAndSendOtp(email, userName, otpType);

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "A new verification code has been sent to your email.");
        return response;
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Please enter your email address.");
        }

        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        // Generic response to prevent account enumeration
        if (userOpt.isPresent()) {
            try {
                User user = userOpt.get();
                otpService.generateAndSendOtp(email, user.getFullName(), "PASSWORD_RESET");
            } catch (Exception e) {
                log.warn("Forgot password OTP generation throttled/failed: {}", e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "If an account exists with this email, a password reset code has been sent.");
        return response;
    }

    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        String rawToken = request.getToken() != null ? request.getToken() : request.getOtpCode();
        if (rawToken == null || rawToken.trim().length() != 6) {
            throw new IllegalArgumentException("Please enter the 6-digit reset code.");
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }
        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        String email = request.getEmail().trim().toLowerCase();
        boolean valid = otpService.verifyOtp(email, rawToken.trim(), "PASSWORD_RESET");

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired reset code. Please request a new one.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found."));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        log.info("Password reset completed successfully for operator {}", user.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "Password reset successfully. You can now sign in with your new password.");
        return response;
    }

    @Transactional
    public Map<String, Object> changePassword(String username, ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long.");
        }
        if (request.getConfirmPassword() != null && !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        boolean currentMatches = passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash());

        if (!currentMatches) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "Password updated successfully.");
        return response;
    }

    public UserDTO getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        if (roles.isEmpty()) roles = Set.of("ROLE_VIEWER");

        Set<String> permissions = new HashSet<>();
        for (Role r : user.getRoles()) {
            for (Permission p : r.getPermissions()) {
                permissions.add(p.getName());
            }
        }
        if (permissions.isEmpty()) permissions.add("PERM_APP_VIEW");

        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getIsActive(),
                roles,
                permissions
        );
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Set<String> roles = u.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
            Set<String> permissions = new HashSet<>();
            for (Role r : u.getRoles()) {
                for (Permission p : r.getPermissions()) {
                    permissions.add(p.getName());
                }
            }
            return new UserDTO(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(), u.getIsActive(), roles, permissions);
        }).collect(Collectors.toList());
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***@***";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) return name.charAt(0) + "***@" + domain;
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }
}

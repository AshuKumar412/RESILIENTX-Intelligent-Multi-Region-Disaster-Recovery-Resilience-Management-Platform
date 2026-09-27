package com.resilientx.identity.email;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component("smtpEmailProvider")
public class GmailSmtpEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(GmailSmtpEmailProvider.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:${MAIL_USERNAME:}}")
    private String mailUsername;

    @Value("${spring.mail.password:${MAIL_PASSWORD:}}")
    private String mailPassword;

    @Value("${resilientx.mail.from:${MAIL_FROM:}}")
    private String mailFrom;

    public GmailSmtpEmailProvider(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    @Override
    public String getProviderName() {
        return "GMAIL_SMTP";
    }

    @Override
    public void sendOtpEmail(String toEmail, String userName, String otpCode, String otpType, int expiryMinutes) {
        String recipientName = (userName != null && !userName.trim().isEmpty()) ? userName.trim() : "Operator";
        String cleanUsername = (mailUsername != null) ? mailUsername.trim() : "";
        String cleanPassword = (mailPassword != null) ? mailPassword.replaceAll("\\s+", "") : "";
        String senderAddress = (mailFrom != null && !mailFrom.trim().isEmpty()) ? mailFrom.trim() : cleanUsername;

        // Verify credentials configuration
        if (cleanUsername.isEmpty() || cleanPassword.isEmpty() || mailSender == null) {
            log.warn("Gmail SMTP credentials not configured. Please configure MAIL_USERNAME and MAIL_PASSWORD.");
            throw new IllegalStateException("Unable to send verification email. SMTP email delivery is not configured.");
        }

        try {
            // Ensure JavaMailSenderImpl has sanitized credentials if dynamically injected
            if (mailSender instanceof JavaMailSenderImpl impl) {
                impl.setUsername(cleanUsername);
                impl.setPassword(cleanPassword);
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderAddress, "RESILIENTX Control Plane");
            helper.setTo(toEmail);
            helper.setSubject("Verify your RESILIENTX account");

            String plainText = "Hello " + recipientName + ",\n\n" +
                    "Your RESILIENTX verification code is:\n\n" +
                    otpCode + "\n\n" +
                    "This code expires in " + expiryMinutes + " minutes.\n\n" +
                    "If you did not request this verification code, you can safely ignore this email.\n\n" +
                    "RESILIENTX\n" +
                    "Disaster Recovery & Resilience Control Plane";

            String htmlText = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head><meta charset='utf-8'></head>" +
                    "<body style='margin:0;padding:0;background-color:#020617;font-family:Arial,sans-serif;color:#f8fafc;'>" +
                    "  <div style='max-width:560px;margin:30px auto;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);'>" +
                    "    <div style='padding:30px;background:linear-gradient(135deg,#0e7490,#1d4ed8);text-align:center;'>" +
                    "      <h1 style='margin:0;font-size:24px;font-weight:900;letter-spacing:2px;color:#ffffff;'>RESILIENT<span style='color:#38bdf8;'>X</span></h1>" +
                    "      <p style='margin:6px 0 0 0;font-size:12px;color:#e2e8f0;letter-spacing:1px;'>DISASTER RECOVERY & RESILIENCE CONTROL PLANE</p>" +
                    "    </div>" +
                    "    <div style='padding:32px 30px;'>" +
                    "      <p style='font-size:15px;line-height:1.6;color:#e2e8f0;margin:0 0 16px 0;'>Hello <strong>" + recipientName + "</strong>,</p>" +
                    "      <p style='font-size:14px;line-height:1.6;color:#94a3b8;margin:0 0 24px 0;'>Your RESILIENTX verification code is:</p>" +
                    "      <div style='background-color:#020617;border:1px solid #334155;border-radius:12px;padding:18px;text-align:center;margin:0 0 24px 0;'>" +
                    "        <span style='font-family:monospace;font-size:32px;font-weight:800;letter-spacing:8px;color:#38bdf8;'>" + otpCode + "</span>" +
                    "      </div>" +
                    "      <p style='font-size:13px;line-height:1.6;color:#94a3b8;margin:0 0 20px 0;'>This code expires in <strong>" + expiryMinutes + " minutes</strong>.</p>" +
                    "      <p style='font-size:12px;line-height:1.6;color:#64748b;margin:0 0 28px 0;'>If you did not request this verification code, you can safely ignore this email.</p>" +
                    "      <div style='border-top:1px solid #1e293b;padding-top:20px;font-size:12px;color:#64748b;'>" +
                    "        <p style='margin:0 0 4px 0;font-weight:700;color:#94a3b8;'>RESILIENTX</p>" +
                    "        <p style='margin:0;'>Disaster Recovery &amp; Resilience Control Plane</p>" +
                    "      </div>" +
                    "    </div>" +
                    "  </div>" +
                    "</body>" +
                    "</html>";

            helper.setText(plainText, htmlText);

            mailSender.send(message);
            log.info("Dispatched verification email to recipient");
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to dispatch verification email via Gmail SMTP: {}", e.getClass().getSimpleName());
            throw new RuntimeException("Unable to send verification email. Please try again later.");
        }
    }
}

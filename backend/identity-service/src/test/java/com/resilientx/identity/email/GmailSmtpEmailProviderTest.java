package com.resilientx.identity.email;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GmailSmtpEmailProviderTest {

    private JavaMailSender mailSender;
    private ObjectProvider<JavaMailSender> mailSenderProvider;
    private GmailSmtpEmailProvider provider;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        mailSenderProvider = mock(ObjectProvider.class);
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        provider = new GmailSmtpEmailProvider(mailSenderProvider);
    }

    @Test
    @DisplayName("Throws clean exception when Gmail SMTP credentials are not configured")
    void testMissingCredentialsThrowsCleanException() {
        ReflectionTestUtils.setField(provider, "mailUsername", "");
        ReflectionTestUtils.setField(provider, "mailPassword", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                provider.sendOtpEmail("test@example.com", "Operator", "123456", "EMAIL_VERIFICATION", 10)
        );
        assertTrue(ex.getMessage().contains("SMTP email delivery is not configured"));
    }

    @Test
    @DisplayName("Sends formatted MimeMessage when credentials and sender are properly configured")
    void testSendOtpEmailSuccess() {
        ReflectionTestUtils.setField(provider, "mailUsername", "resilientx.sre@gmail.com");
        ReflectionTestUtils.setField(provider, "mailPassword", "xxxx-xxxx-xxxx-xxxx");
        ReflectionTestUtils.setField(provider, "mailFrom", "resilientx.sre@gmail.com");

        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        assertDoesNotThrow(() ->
                provider.sendOtpEmail("operator@enterprise.com", "Alex", "654321", "EMAIL_VERIFICATION", 10)
        );

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}

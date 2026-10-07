package com.metrony.auth;

import org.springframework.stereotype.Component;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class PasswordPolicy {
    private static final Pattern USERNAME = Pattern.compile("[a-z0-9][a-z0-9._-]{2,59}");
    private static final Set<String> BLOCKED = Set.of("password", "password123", "administrador",
            "administrator", "metro123456789", "qwerty1234567890", "1234567890123456");

    public String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }

    public String validateUsername(String username) {
        String normalized = normalizeUsername(username);
        if (!USERNAME.matcher(normalized).matches()) {
            throw new IllegalArgumentException("El usuario debe tener entre 3 y 60 caracteres ASCII validos.");
        }
        return normalized;
    }

    public void validateNewPassword(String rawPassword, String normalizedUsername) {
        if (rawPassword == null || rawPassword.length() < 16 || rawPassword.length() > 128) {
            throw new IllegalArgumentException("La contrasena debe tener entre 16 y 128 caracteres.");
        }
        String lower = rawPassword.toLowerCase(Locale.ROOT);
        if (!normalizedUsername.isBlank() && lower.contains(normalizedUsername)) {
            throw new IllegalArgumentException("La contrasena no puede contener el nombre de usuario.");
        }
        if (BLOCKED.contains(lower)) throw new IllegalArgumentException("La contrasena seleccionada no esta permitida.");
    }
}

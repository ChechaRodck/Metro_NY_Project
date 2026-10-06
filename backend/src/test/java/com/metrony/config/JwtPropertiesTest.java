package com.metrony.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Duration;
import static org.assertj.core.api.Assertions.*;

class JwtPropertiesTest {
    @Test void validatesBase64SecretAndTtlBounds() {
        JwtProperties valid = properties(); assertThatCode(valid::validate).doesNotThrowAnyException();
        JwtProperties shortSecret = properties(); shortSecret.setSecret(java.util.Base64.getEncoder()
                .encodeToString("corta".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        assertThatThrownBy(shortSecret::validate).isInstanceOf(IllegalStateException.class);
        JwtProperties longTtl = properties(); longTtl.setAccessTokenTtl(Duration.ofMinutes(31));
        assertThatThrownBy(longTtl::validate).isInstanceOf(IllegalStateException.class);
    }

    @Test void configuredPasswordEncoderUsesBcryptCostTwelve() {
        AuthProperties auth = new AuthProperties(); auth.setBcryptCost(12);
        String hash = new com.metrony.security.SecurityConfig().passwordEncoder(auth).encode("Clave-Larga-Segura-2026");
        assertThat(hash).startsWith("$2a$12$");
        assertThat(new BCryptPasswordEncoder(12).matches("Clave-Larga-Segura-2026", hash)).isTrue();
    }

    private JwtProperties properties() {
        JwtProperties value = new JwtProperties();
        value.setSecret(java.util.Base64.getEncoder().encodeToString(
                "clave-de-prueba-32-bytes-segura!".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        value.setIssuer("metro-ny"); value.setAudience("metro-ny-api"); return value;
    }
}

package com.metrony.auth;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class PasswordPolicyTest {
    private final PasswordPolicy policy = new PasswordPolicy();

    @Test void normalizesWithLocaleIndependentLowercaseAndTrim() {
        assertThat(policy.validateUsername("  Operaciones.Demo ")).isEqualTo("operaciones.demo");
    }

    @Test void rejectsWeakContainedAndMalformedValues() {
        assertThatThrownBy(() -> policy.validateUsername("x")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> policy.validateNewPassword("password123", "usuario"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> policy.validateNewPassword("Clave-usuario-segura-2026", "usuario"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatCode(() -> policy.validateNewPassword("Clave-Larga-Segura-2026", "usuario"))
                .doesNotThrowAnyException();
    }

    @Test void acceptsTheExactSharedDemoCredentials() {
        String username = policy.validateUsername("demo_admin");

        assertThat(username).isEqualTo("demo_admin");
        assertThatCode(() -> policy.validateNewPassword("TrenSeguro#2026!", username))
                .doesNotThrowAnyException();
    }
}

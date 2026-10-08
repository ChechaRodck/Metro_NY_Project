package com.metrony.config;

import com.metrony.auth.PasswordPolicy;
import com.metrony.auth.UserStatus;
import com.metrony.repository.AuthRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AdminBootstrapRunnerTest {
    @Test void disabledBootstrapDoesNothing() {
        AuthProperties properties = new AuthProperties();
        AuthRepository repository = mock(AuthRepository.class);
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), mock(PasswordEncoder.class),
                new MockEnvironment())
                .run(new DefaultApplicationArguments());
        verifyNoInteractions(repository);
    }

    @Test void demoProfileRunsEvenWhenTheGenericBootstrapFlagIsOverriddenOff() {
        AuthProperties properties = new AuthProperties();
        properties.getBootstrap().setUsername("demo_admin");
        properties.getBootstrap().setPassword("TrenSeguro#2026!");
        properties.getBootstrap().setDisplayName("Administrador Demo");
        AuthRepository repository = mock(AuthRepository.class);
        when(repository.bootstrapAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new AuthRepository.BootstrapResult(8, true));
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("TrenSeguro#2026!")).thenReturn("bcrypt-hash");

        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), encoder,
                new MockEnvironment().withProperty("spring.profiles.active", "demo"))
                .run(new DefaultApplicationArguments());

        verify(repository).bootstrapAdmin("demo_admin", "Administrador Demo", "bcrypt-hash",
                "BOOTSTRAP_DEMO");
    }

    @Test void enabledBootstrapRefusesToOverwriteExistingUsers() {
        AuthProperties properties = enabled("Administrador-Seguro-2026");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(1L);
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), mock(PasswordEncoder.class),
                new MockEnvironment())
                .run(new DefaultApplicationArguments());
        verify(repository).countUsers(); verifyNoMoreInteractions(repository);
    }

    @Test void enabledBootstrapRejectsWeakCredentialsBeforeWriting() {
        AuthProperties properties = enabled("corta");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(0L);
        assertThatThrownBy(() -> new AdminBootstrapRunner(properties, repository, new PasswordPolicy(),
                mock(PasswordEncoder.class), new MockEnvironment()).run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalArgumentException.class);
        verify(repository).countUsers(); verify(repository, never()).bootstrapAdmin(anyString(), anyString(), anyString(), anyString());
    }

    @Test void enabledBootstrapRejectsMissingDisplayName() {
        AuthProperties properties = enabled("Administrador-Seguro-2026");
        properties.getBootstrap().setDisplayName(" ");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(0L);
        assertThatThrownBy(() -> new AdminBootstrapRunner(properties, repository, new PasswordPolicy(),
                mock(PasswordEncoder.class), new MockEnvironment()).run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class);
        verify(repository, never()).bootstrapAdmin(anyString(), anyString(), anyString(), anyString());
    }

    @Test void enabledBootstrapHashesAtApplicationBoundaryAndCreatesOnce() {
        AuthProperties properties = enabled("Administrador-Seguro-2026");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(0L);
        when(repository.bootstrapAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new AuthRepository.BootstrapResult(1, true));
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("Administrador-Seguro-2026")).thenReturn("bcrypt-hash");
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), encoder, new MockEnvironment())
                .run(new DefaultApplicationArguments());
        verify(repository).bootstrapAdmin("admin.inicial", "Administrador inicial", "bcrypt-hash", "BOOTSTRAP");
    }

    @Test void demoProfileCreatesAdminWithBcryptHashWithoutInspectingOtherUsers() {
        AuthProperties properties = enabled("TrenSeguro#2026!");
        properties.getBootstrap().setUsername("demo_admin");
        properties.getBootstrap().setDisplayName("Administrador Demo");
        AuthRepository repository = mock(AuthRepository.class);
        when(repository.bootstrapAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new AuthRepository.BootstrapResult(8, true));
        PasswordEncoder encoder = new BCryptPasswordEncoder(12);

        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), encoder,
                new MockEnvironment().withProperty("spring.profiles.active", "demo"))
                .run(new DefaultApplicationArguments());

        var hash = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(repository, never()).countUsers();
        verify(repository).bootstrapAdmin(eq("demo_admin"), eq("Administrador Demo"), hash.capture(),
                eq("BOOTSTRAP_DEMO"));
        verify(repository, never()).changePassword(anyString(), anyString(), anyString());
        verify(repository, never()).changeState(anyString(), any(), anyString());
        assertThat(hash.getValue()).startsWith("$2a$12$").isNotEqualTo("TrenSeguro#2026!");
        assertThat(encoder.matches("TrenSeguro#2026!", hash.getValue())).isTrue();
    }

    @Test void demoProfileDelegatesIdempotentlyToTheAdminBootstrap() {
        AuthProperties properties = enabled("TrenSeguro#2026!");
        properties.getBootstrap().setUsername("demo_admin");
        properties.getBootstrap().setDisplayName("Administrador Demo");
        AuthRepository repository = mock(AuthRepository.class);
        when(repository.bootstrapAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(new AuthRepository.BootstrapResult(8, true),
                        new AuthRepository.BootstrapResult(8, false));
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("TrenSeguro#2026!")).thenReturn("bcrypt-hash");
        AdminBootstrapRunner runner = new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), encoder,
                new MockEnvironment().withProperty("spring.profiles.active", "demo"));

        runner.run(new DefaultApplicationArguments());
        runner.run(new DefaultApplicationArguments());

        verify(repository, times(2)).bootstrapAdmin("demo_admin", "Administrador Demo", "bcrypt-hash",
                "BOOTSTRAP_DEMO");
        verify(repository).changePassword("demo_admin", "bcrypt-hash", "BOOTSTRAP_DEMO");
        verify(repository).changeState("demo_admin", UserStatus.ACTIVO, "BOOTSTRAP_DEMO");
    }

    private AuthProperties enabled(String password) {
        AuthProperties properties = new AuthProperties();
        properties.getBootstrap().setEnabled(true); properties.getBootstrap().setUsername("admin.inicial");
        properties.getBootstrap().setDisplayName("Administrador inicial");
        properties.getBootstrap().setPassword(password); return properties;
    }
}

package com.metrony.config;

import com.metrony.auth.PasswordPolicy;
import com.metrony.repository.AuthRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AdminBootstrapRunnerTest {
    @Test void disabledBootstrapDoesNothing() {
        AuthProperties properties = new AuthProperties();
        AuthRepository repository = mock(AuthRepository.class);
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), mock(PasswordEncoder.class))
                .run(new DefaultApplicationArguments());
        verifyNoInteractions(repository);
    }

    @Test void enabledBootstrapRefusesToOverwriteExistingUsers() {
        AuthProperties properties = enabled("Administrador-Seguro-2026");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(1L);
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), mock(PasswordEncoder.class))
                .run(new DefaultApplicationArguments());
        verify(repository).countUsers(); verifyNoMoreInteractions(repository);
    }

    @Test void enabledBootstrapRejectsWeakCredentialsBeforeWriting() {
        AuthProperties properties = enabled("corta");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(0L);
        assertThatThrownBy(() -> new AdminBootstrapRunner(properties, repository, new PasswordPolicy(),
                mock(PasswordEncoder.class)).run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalArgumentException.class);
        verify(repository).countUsers(); verify(repository, never()).bootstrapAdmin(anyString(), anyString(), anyString(), anyString());
    }

    @Test void enabledBootstrapRejectsMissingDisplayName() {
        AuthProperties properties = enabled("Administrador-Seguro-2026");
        properties.getBootstrap().setDisplayName(" ");
        AuthRepository repository = mock(AuthRepository.class); when(repository.countUsers()).thenReturn(0L);
        assertThatThrownBy(() -> new AdminBootstrapRunner(properties, repository, new PasswordPolicy(),
                mock(PasswordEncoder.class)).run(new DefaultApplicationArguments()))
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
        new AdminBootstrapRunner(properties, repository, new PasswordPolicy(), encoder)
                .run(new DefaultApplicationArguments());
        verify(repository).bootstrapAdmin("admin.inicial", "Administrador inicial", "bcrypt-hash", "BOOTSTRAP");
    }

    private AuthProperties enabled(String password) {
        AuthProperties properties = new AuthProperties();
        properties.getBootstrap().setEnabled(true); properties.getBootstrap().setUsername("admin.inicial");
        properties.getBootstrap().setDisplayName("Administrador inicial");
        properties.getBootstrap().setPassword(password); return properties;
    }
}

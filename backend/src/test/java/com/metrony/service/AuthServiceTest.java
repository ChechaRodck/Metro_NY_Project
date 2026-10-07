package com.metrony.service;

import com.metrony.auth.*;
import com.metrony.auth.AuthDtos.LoginRequest;
import com.metrony.exception.AuthenticationFailedException;
import com.metrony.exception.LoginRateLimitedException;
import com.metrony.repository.AuthRepository;
import com.metrony.security.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.OptionalLong;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private AuthRepository repository;
    private PasswordEncoder encoder;
    private LoginAttemptLimiter limiter;
    private JwtTokenService tokens;
    private AuthService service;
    private MockHttpServletRequest request;

    @BeforeEach void setUp() {
        repository = mock(AuthRepository.class); encoder = mock(PasswordEncoder.class);
        limiter = mock(LoginAttemptLimiter.class); tokens = mock(JwtTokenService.class);
        when(encoder.encode(anyString())).thenReturn("dummy-hash");
        when(limiter.retryAfter(anyString(), anyString())).thenReturn(OptionalLong.empty());
        when(limiter.recordFailure(anyString(), anyString())).thenReturn(OptionalLong.empty());
        service = new AuthService(repository, encoder, new PasswordPolicy(), limiter, tokens,
                Clock.fixed(Instant.parse("2026-10-06T12:00:00Z"), ZoneOffset.UTC));
        request = new MockHttpServletRequest(); request.setRemoteAddr("10.0.0.7");
        request.addHeader("X-Forwarded-For", "203.0.113.50");
    }

    @Test void validLoginResetsPersistedAndLocalUsernameStateAndReturnsSafeIdentity() {
        AuthUser user = user(UserStatus.ACTIVO, null);
        when(repository.findByUsername("operaciones.demo")).thenReturn(Optional.of(user));
        when(encoder.matches("correcta", "stored-hash")).thenReturn(true);
        when(tokens.issue(user)).thenReturn(new JwtTokenService.IssuedToken("token",
                Instant.parse("2026-10-06T12:15:00Z"), 900));

        var response = service.login(new LoginRequest(" Operaciones.Demo ", "correcta"), request);

        assertThat(response.accessToken()).isEqualTo("token");
        assertThat(response.expiresAt()).isEqualTo(Instant.parse("2026-10-06T12:15:00Z"));
        assertThat(response.user().username()).isEqualTo("operaciones.demo");
        verify(repository).registerSuccess(7L); verify(limiter).recordSuccess("operaciones.demo");
        verify(limiter).retryAfter("operaciones.demo", "10.0.0.7");
        verify(tokens).issue(user); verifyNoMoreInteractions(tokens);
    }

    @Test void unknownWrongDisabledAndLockedAccountsUseTheSameGenericFailure() {
        when(repository.findByUsername("desconocido")).thenReturn(Optional.empty());
        assertGenericFailure("desconocido");

        when(repository.findByUsername("incorrecto")).thenReturn(Optional.of(user(UserStatus.ACTIVO, null)));
        when(encoder.matches("mala", "stored-hash")).thenReturn(false);
        assertGenericFailure("incorrecto");

        when(repository.findByUsername("deshabilitado")).thenReturn(Optional.of(user(UserStatus.DESHABILITADO, null)));
        assertGenericFailure("deshabilitado");

        when(repository.findByUsername("bloqueado")).thenReturn(Optional.of(user(UserStatus.BLOQUEADO,
                Instant.parse("2026-10-06T12:10:00Z"))));
        assertGenericFailure("bloqueado");
        verify(encoder).matches("mala", "dummy-hash");
    }

    @Test void limiterFailureReturnsRetryAfterAndDoesNotConsultDatabase() {
        when(limiter.retryAfter("operaciones.demo", "10.0.0.7")).thenReturn(OptionalLong.of(321));
        assertThatThrownBy(() -> service.login(new LoginRequest("operaciones.demo", "mala"), request))
                .isInstanceOfSatisfying(LoginRateLimitedException.class,
                        error -> assertThat(error.getRetryAfterSeconds()).isEqualTo(321));
        verifyNoInteractions(repository);
    }

    private void assertGenericFailure(String username) {
        assertThatThrownBy(() -> service.login(new LoginRequest(username, "mala"), request))
                .isExactlyInstanceOf(AuthenticationFailedException.class)
                .hasMessage("Authentication failed");
    }

    private AuthUser user(UserStatus status, Instant lockedUntil) {
        return new AuthUser(7L, "operaciones.demo", "Operador", "stored-hash", status,
                0, null, lockedUntil, null, Instant.parse("2026-10-06T11:00:00Z"),
                Set.of(AuthRole.OPERACIONES), 1);
    }
}

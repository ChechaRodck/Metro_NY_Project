package com.metrony.service;

import com.metrony.auth.AuthDtos.LoginRequest;
import com.metrony.auth.AuthDtos.LoginResponse;
import com.metrony.auth.AuthDtos.UserIdentityResponse;
import com.metrony.auth.AuthUser;
import com.metrony.auth.LoginAttemptLimiter;
import com.metrony.auth.PasswordPolicy;
import com.metrony.auth.UserStatus;
import com.metrony.exception.AuthenticationFailedException;
import com.metrony.exception.LoginRateLimitedException;
import com.metrony.repository.AuthRepository;
import com.metrony.security.JwtTokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.OptionalLong;

@Service
public class AuthService {
    private final AuthRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;
    private final LoginAttemptLimiter limiter;
    private final JwtTokenService tokens;
    private final Clock clock;
    private final String dummyHash;

    public AuthService(AuthRepository repository, PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy,
                       LoginAttemptLimiter limiter, JwtTokenService tokens) {
        this(repository, passwordEncoder, passwordPolicy, limiter, tokens, Clock.systemUTC());
    }

    AuthService(AuthRepository repository, PasswordEncoder passwordEncoder, PasswordPolicy passwordPolicy,
                LoginAttemptLimiter limiter, JwtTokenService tokens, Clock clock) {
        this.repository = repository; this.passwordEncoder = passwordEncoder; this.passwordPolicy = passwordPolicy;
        this.limiter = limiter; this.tokens = tokens; this.clock = clock;
        this.dummyHash = passwordEncoder.encode("comparacion-constante-sin-usuario");
    }

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest servletRequest) {
        String username = passwordPolicy.normalizeUsername(request.username());
        String clientAddress = directClientAddress(servletRequest);
        enforceLimit(username, clientAddress);

        AuthUser user = repository.findByUsername(username).orElse(null);
        String comparisonHash = user == null ? dummyHash : user.passwordHash();
        boolean passwordMatches = passwordEncoder.matches(request.password(), comparisonHash);
        boolean temporaryLockExpired = user != null && user.status() == UserStatus.BLOQUEADO
                && user.lockedUntil() != null && !clock.instant().isBefore(user.lockedUntil());
        boolean active = user != null && (user.status() == UserStatus.ACTIVO || temporaryLockExpired)
                && (user.lockedUntil() == null || !clock.instant().isBefore(user.lockedUntil()));

        if (!passwordMatches || !active) {
            if (user != null && user.status() == UserStatus.ACTIVO && !passwordMatches) repository.registerFailure(user.id());
            OptionalLong retry = limiter.recordFailure(username, clientAddress);
            if (retry.isPresent()) throw new LoginRateLimitedException(retry.getAsLong());
            throw new AuthenticationFailedException();
        }

        repository.registerSuccess(user.id());
        limiter.recordSuccess(username);
        JwtTokenService.IssuedToken token = tokens.issue(user);
        return new LoginResponse(token.value(), "Bearer", token.expiresAt(), token.expiresInSeconds(),
                new UserIdentityResponse(user.username(), user.displayName(), user.roles()));
    }

    private void enforceLimit(String username, String clientAddress) {
        OptionalLong retry = limiter.retryAfter(username, clientAddress);
        if (retry.isPresent()) throw new LoginRateLimitedException(retry.getAsLong());
    }

    private String directClientAddress(HttpServletRequest request) {
        String address = request.getRemoteAddr();
        return address == null || address.isBlank() ? "unknown" : address;
    }
}

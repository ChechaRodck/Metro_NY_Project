package com.metrony.security;

import com.metrony.auth.AuthRole;
import com.metrony.auth.AuthUserState;
import com.metrony.auth.UserStatus;
import com.metrony.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class JwtUserStateValidator implements OAuth2TokenValidator<Jwt> {
    private static final OAuth2Error INVALID = new OAuth2Error("invalid_token",
            "El token de acceso no es valido.", null);
    private final AuthRepository repository;
    private final Clock clock;

    @Autowired
    public JwtUserStateValidator(AuthRepository repository) { this(repository, Clock.systemUTC()); }
    JwtUserStateValidator(AuthRepository repository, Clock clock) { this.repository = repository; this.clock = clock; }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        String username = token.getSubject();
        Instant issuedAt = token.getIssuedAt();
        List<String> roleClaims = token.getClaimAsStringList("roles");
        if (username == null || username.isBlank() || issuedAt == null || roleClaims == null) return failure();

        AuthUserState state;
        try {
            state = repository.findStateByUsername(username).orElse(null);
        } catch (RuntimeException exception) {
            return failure();
        }
        if (state == null || state.status() != UserStatus.ACTIVO) return failure();
        if (state.lockedUntil() != null && clock.instant().isBefore(state.lockedUntil())) return failure();
        String tokenCredentialsUpdated = token.getClaimAsString(JwtTokenService.CREDENTIALS_UPDATED_CLAIM);
        if (!sameCredentialVersion(state.credentialsUpdatedAt(), tokenCredentialsUpdated)) return failure();

        Set<AuthRole> tokenRoles = new HashSet<>();
        try { roleClaims.forEach(role -> tokenRoles.add(AuthRole.valueOf(role))); }
        catch (IllegalArgumentException exception) { return failure(); }
        return tokenRoles.equals(state.roles()) ? OAuth2TokenValidatorResult.success() : failure();
    }

    private OAuth2TokenValidatorResult failure() { return OAuth2TokenValidatorResult.failure(INVALID); }

    private boolean sameCredentialVersion(Instant databaseValue, String tokenValue) {
        if (databaseValue == null) return tokenValue == null;
        if (tokenValue == null) return false;
        try {
            return databaseValue.equals(Instant.parse(tokenValue));
        } catch (RuntimeException exception) {
            return false;
        }
    }
}

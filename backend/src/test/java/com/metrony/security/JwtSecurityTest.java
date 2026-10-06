package com.metrony.security;

import com.metrony.auth.*;
import com.metrony.config.JwtProperties;
import com.metrony.repository.AuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtSecurityTest {
    private static final String SECRET = encoded("clave-de-prueba-32-bytes-segura!");
    private JwtProperties properties;
    private AuthRepository repository;
    private SecurityConfig config;

    @BeforeEach void setUp() {
        properties = properties(SECRET, "metro-ny", "metro-ny-api");
        repository = mock(AuthRepository.class); config = new SecurityConfig();
    }

    @Test void validTokenContainsOnlyApprovedClaimsAndDecodes() {
        Instant now = Instant.now();
        AuthUser user = new AuthUser(1, "operaciones.demo", "Operador", "hash", UserStatus.ACTIVO,
                0, null, null, null, now.minusSeconds(60), Set.of(AuthRole.OPERACIONES), 0);
        when(repository.findStateByUsername(user.username())).thenReturn(Optional.of(state(user, now.minusSeconds(60))));
        JwtTokenService service = new JwtTokenService(config.jwtEncoder(properties), properties);
        Jwt decoded = config.jwtDecoder(properties, new JwtUserStateValidator(repository)).decode(service.issue(user).value());

        assertThat(decoded.getClaims().keySet()).containsExactlyInAnyOrder("iss", "sub", "aud", "iat", "exp", "jti", "roles");
        assertThat(decoded.getSubject()).isEqualTo("operaciones.demo");
    }

    @Test void rejectsExpiredWrongIssuerWrongAudienceAndBadSignature() {
        Instant now = Instant.now();
        when(repository.findStateByUsername("usuario.demo")).thenReturn(Optional.of(new AuthUserState(
                "usuario.demo", UserStatus.ACTIVO, null, now.minusSeconds(3600), Set.of(AuthRole.CONSULTA))));
        JwtDecoder decoder = config.jwtDecoder(properties, new JwtUserStateValidator(repository));

        assertRejected(decoder, token(config.jwtEncoder(properties), "metro-ny", "metro-ny-api",
                now.minusSeconds(1200), now.minusSeconds(600)));
        assertRejected(decoder, token(config.jwtEncoder(properties), "otro", "metro-ny-api", now, now.plusSeconds(600)));
        assertRejected(decoder, token(config.jwtEncoder(properties), "metro-ny", "otra", now, now.plusSeconds(600)));
        JwtProperties other = properties(encoded("otra-clave-de-prueba-para-firma-32-bytes"), "metro-ny", "metro-ny-api");
        assertRejected(decoder, token(config.jwtEncoder(other), "metro-ny", "metro-ny-api", now, now.plusSeconds(600)));
    }

    @Test void databaseStateImmediatelyInvalidatesDisabledChangedCredentialsAndChangedRoles() {
        Instant issued = Instant.now().minusSeconds(30);
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "HS256").subject("usuario.demo")
                .issuedAt(issued).expiresAt(issued.plusSeconds(900)).claim("roles", List.of("CONSULTA")).build();
        JwtUserStateValidator validator = new JwtUserStateValidator(repository);

        when(repository.findStateByUsername("usuario.demo")).thenReturn(Optional.of(new AuthUserState(
                "usuario.demo", UserStatus.DESHABILITADO, null, issued.minusSeconds(60), Set.of(AuthRole.CONSULTA))));
        assertThat(validator.validate(jwt).hasErrors()).isTrue();
        when(repository.findStateByUsername("usuario.demo")).thenReturn(Optional.of(new AuthUserState(
                "usuario.demo", UserStatus.BLOQUEADO, issued.plusSeconds(600), issued.minusSeconds(60), Set.of(AuthRole.CONSULTA))));
        assertThat(validator.validate(jwt).hasErrors()).isTrue();
        when(repository.findStateByUsername("usuario.demo")).thenReturn(Optional.of(new AuthUserState(
                "usuario.demo", UserStatus.ACTIVO, null, issued.plusSeconds(1), Set.of(AuthRole.CONSULTA))));
        assertThat(validator.validate(jwt).hasErrors()).isTrue();
        when(repository.findStateByUsername("usuario.demo")).thenReturn(Optional.of(new AuthUserState(
                "usuario.demo", UserStatus.ACTIVO, null, issued.minusSeconds(60), Set.of(AuthRole.OPERACIONES))));
        assertThat(validator.validate(jwt).hasErrors()).isTrue();
    }

    private String token(JwtEncoder encoder, String issuer, String audience, Instant issued, Instant expires) {
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).audience(List.of(audience)).subject("usuario.demo")
                .issuedAt(issued).expiresAt(expires).id("id-prueba").claim("roles", List.of("CONSULTA")).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
    }

    private void assertRejected(JwtDecoder decoder, String token) {
        assertThatThrownBy(() -> decoder.decode(token)).isInstanceOf(JwtException.class);
    }

    private AuthUserState state(AuthUser user, Instant credentialsUpdated) {
        return new AuthUserState(user.username(), user.status(), user.lockedUntil(), credentialsUpdated, user.roles());
    }

    private JwtProperties properties(String secret, String issuer, String audience) {
        JwtProperties value = new JwtProperties(); value.setSecret(secret); value.setIssuer(issuer); value.setAudience(audience); return value;
    }

    private static String encoded(String value) {
        return java.util.Base64.getEncoder().encodeToString(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}

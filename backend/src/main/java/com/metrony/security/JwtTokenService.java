package com.metrony.security;

import com.metrony.auth.AuthUser;
import com.metrony.config.JwtProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
public class JwtTokenService {
    static final String CREDENTIALS_UPDATED_CLAIM = "credentialsUpdatedAt";
    private final JwtEncoder encoder;
    private final JwtProperties properties;
    private final Clock clock;

    @Autowired
    public JwtTokenService(JwtEncoder encoder, JwtProperties properties) {
        this(encoder, properties, Clock.systemUTC());
    }

    JwtTokenService(JwtEncoder encoder, JwtProperties properties, Clock clock) {
        this.encoder = encoder; this.properties = properties; this.clock = clock;
    }

    public IssuedToken issue(AuthUser user) {
        Instant issuedAt = clock.instant();
        Instant expiresAt = issuedAt.plus(properties.getAccessTokenTtl());
        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer(properties.getIssuer()).audience(java.util.List.of(properties.getAudience()))
                .subject(user.username()).issuedAt(issuedAt).expiresAt(expiresAt).id(UUID.randomUUID().toString())
                .claim("roles", user.roles().stream().map(Enum::name).sorted().toList());
        if (user.credentialsUpdatedAt() != null) {
            claims.claim(CREDENTIALS_UPDATED_CLAIM, user.credentialsUpdatedAt().toString());
        }
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
        return new IssuedToken(token, expiresAt, properties.getAccessTokenTtl().toSeconds());
    }

    public record IssuedToken(String value, Instant expiresAt, long expiresInSeconds) {
        @Override public String toString() {
            return "IssuedToken[value=[PROTECTED], expiresAt=" + expiresAt
                    + ", expiresInSeconds=" + expiresInSeconds + "]";
        }
    }
}

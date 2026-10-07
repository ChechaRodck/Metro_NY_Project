package com.metrony.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.Base64;

@ConfigurationProperties("app.jwt")
public class JwtProperties {
    private String secret;
    private String issuer;
    private String audience;
    private Duration accessTokenTtl = Duration.ofMinutes(15);
    private Duration clockSkew = Duration.ofSeconds(30);

    @PostConstruct
    void validate() {
        requireText(secret, "JWT_SECRET");
        requireText(issuer, "JWT_ISSUER");
        requireText(audience, "JWT_AUDIENCE");
        byte[] decoded;
        try {
            decoded = Base64.getDecoder().decode(secret);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("JWT_SECRET debe estar codificado en Base64", exception);
        }
        if (decoded.length < 32) throw new IllegalStateException("JWT_SECRET debe contener al menos 32 bytes aleatorios");
        if (accessTokenTtl.compareTo(Duration.ofMinutes(5)) < 0
                || accessTokenTtl.compareTo(Duration.ofMinutes(30)) > 0) {
            throw new IllegalStateException("JWT_ACCESS_TOKEN_TTL debe estar entre 5 y 30 minutos");
        }
        if (clockSkew.isNegative() || clockSkew.compareTo(Duration.ofMinutes(1)) > 0) {
            throw new IllegalStateException("El margen de reloj JWT no es valido");
        }
    }

    private void requireText(String value, String environmentName) {
        if (value == null || value.isBlank()) throw new IllegalStateException(environmentName + " es obligatorio");
    }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }
    public Duration getAccessTokenTtl() { return accessTokenTtl; }
    public void setAccessTokenTtl(Duration accessTokenTtl) { this.accessTokenTtl = accessTokenTtl; }
    public Duration getClockSkew() { return clockSkew; }
    public void setClockSkew(Duration clockSkew) { this.clockSkew = clockSkew; }
}

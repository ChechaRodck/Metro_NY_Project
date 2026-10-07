package com.metrony.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.metrony.auth.AuthRole;
import com.metrony.auth.AuthUser;
import com.metrony.auth.AuthUserState;
import com.metrony.auth.LoginAttemptLimiter;
import com.metrony.auth.PasswordPolicy;
import com.metrony.auth.UserStatus;
import com.metrony.config.CorsConfig;
import com.metrony.controller.AuthController;
import com.metrony.repository.AuthRepository;
import com.metrony.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({AuthController.class, AuthenticationRoundTripTest.LineasProbeController.class})
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
@Import({SecurityConfig.class, EndpointAuthorizationPolicy.class, SecurityErrorWriter.class,
        CorsConfig.class, AuthService.class, PasswordPolicy.class, LoginAttemptLimiter.class,
        JwtTokenService.class, JwtUserStateValidator.class, AuthenticationRoundTripTest.LineasProbeController.class})
@TestPropertySource(properties = {
        "app.jwt.issuer=metro-ny", "app.jwt.audience=metro-ny-api",
        "app.cors.allowed-origins=http://localhost:5173"
})
class AuthenticationRoundTripTest {
    private static final String USERNAME = "admin.runtime";
    private static final String PASSWORD = "Prueba-Runtime-Segura-2026";

    @DynamicPropertySource
    static void jwtSecret(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> java.util.Base64.getEncoder().encodeToString(
                "clave-de-prueba-32-bytes-segura!".getBytes(StandardCharsets.UTF_8)));
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired PasswordEncoder passwordEncoder;
    @MockBean AuthRepository repository;

    @Test
    void oracleUtcTimestampIsNotShiftedByTheJvmDefaultTimeZone() throws Exception {
        Instant expected = Instant.parse("2026-10-07T01:30:00.123456Z");

        assertThat(mapLikeAuthRepository(expected)).isEqualTo(expected);
    }

    @Test
    void freshlyIssuedLoginTokenAuthenticatesProtectedRequestWithOracleUtcTimestamp() throws Exception {
        Instant credentialsUpdated = Instant.now().minusSeconds(60).truncatedTo(ChronoUnit.MICROS);
        Instant mappedCredentialsUpdated = mapLikeAuthRepository(credentialsUpdated);
        AuthUser user = new AuthUser(1L, USERNAME, "Administrador de prueba",
                passwordEncoder.encode(PASSWORD), UserStatus.ACTIVO, 0, null, null,
                null, mappedCredentialsUpdated, Set.of(AuthRole.ADMIN), 0L);

        when(repository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(repository.findStateByUsername(USERNAME)).thenReturn(Optional.of(new AuthUserState(
                USERNAME, UserStatus.ACTIVO, null, mappedCredentialsUpdated, Set.of(AuthRole.ADMIN))));

        String loginBody = objectMapper.writeValueAsString(Map.of("username", USERNAME, "password", PASSWORD));
        String loginResponse = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(loginResponse).get("accessToken").asText();

        mvc.perform(get("/api/lineas").header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true));
    }

    private Instant mapLikeAuthRepository(Instant utcInstant) throws Exception {
        TimeZone original = TimeZone.getDefault();
        try {
            TimeZone.setDefault(TimeZone.getTimeZone("America/Guatemala"));
            Timestamp oracleTimestamp = Timestamp.valueOf(LocalDateTime.ofInstant(utcInstant, ZoneOffset.UTC));
            Method mapper = AuthRepository.class.getDeclaredMethod("instant", Timestamp.class);
            mapper.setAccessible(true);
            return (Instant) mapper.invoke(null, oracleTimestamp);
        } finally {
            TimeZone.setDefault(original);
        }
    }

    @RestController
    public static class LineasProbeController {
        @GetMapping("/api/lineas")
        Map<String, Boolean> lineas() {
            return Map.of("authenticated", true);
        }
    }
}

package com.metrony.security;

import com.metrony.config.CorsConfig;
import com.metrony.controller.AuthController;
import com.metrony.controller.HealthController;
import com.metrony.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({HealthController.class, AuthController.class})
@Import({SecurityConfig.class, EndpointAuthorizationPolicy.class, SecurityErrorWriter.class,
        CorsConfig.class})
@TestPropertySource(properties = {
        "app.jwt.issuer=metro-ny", "app.jwt.audience=metro-ny-api",
        "app.cors.allowed-origins=http://localhost:5173"
})
class SecurityFilterChainTest {
    @DynamicPropertySource
    static void jwtSecret(DynamicPropertyRegistry registry) {
        registry.add("app.jwt.secret", () -> java.util.Base64.getEncoder().encodeToString(
                "clave-de-prueba-32-bytes-segura!".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    @Autowired MockMvc mvc;
    @MockBean JwtUserStateValidator userStateValidator;
    @MockBean AuthService authService;

    @Test void healthIsPublicAndMinimal() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk())
                .andExpect(content().json("{\"status\":\"UP\"}"));
    }

    @Test void loginIsPublic() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"usuario.demo\",\"password\":\"valor-local-seguro\"}"))
                .andExpect(status().isOk());
    }

    @Test void missingAndMalformedBearerUseStableAuthenticationErrors() throws Exception {
        mvc.perform(get("/api/lineas")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
        mvc.perform(get("/api/lineas").header(HttpHeaders.AUTHORIZATION, "Bearer no-es-jwt"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("INVALID_ACCESS_TOKEN"));
    }

    @Test void insufficientRoleAndUnknownRouteUseDifferent403Errors() throws Exception {
        mvc.perform(get("/api/admin/usuarios").with(jwt().authorities(() -> "ROLE_CONSULTA")))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
        mvc.perform(get("/api/ruta-desconocida").with(jwt().authorities(() -> "ROLE_ADMIN")))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ROUTE_DENIED"));
    }

    @Test void csrfIsDisabledForHeaderBearerRequests() throws Exception {
        mvc.perform(post("/api/admin/usuarios").with(jwt().authorities(() -> "ROLE_ADMIN"))
                        .contentType("application/json").content("{}"))
                .andExpect(result -> org.assertj.core.api.Assertions.assertThat(result.getResponse().getStatus())
                        .as("la solicitud no debe ser rechazada por CSRF").isNotEqualTo(403));
    }

    @Test void authorizationHeaderPreflightIsPublicForAllowedOrigin() throws Exception {
        mvc.perform(options("/api/lineas").header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        org.hamcrest.Matchers.containsStringIgnoringCase("Authorization")));
    }

    @Test void corsRejectsUnconfiguredOrigin() throws Exception {
        mvc.perform(options("/api/lineas").header(HttpHeaders.ORIGIN, "https://malicioso.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }
}

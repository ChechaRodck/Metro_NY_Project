package com.metrony.controller;

import com.metrony.auth.AuthDtos.LoginResponse;
import com.metrony.auth.AuthDtos.UserIdentityResponse;
import com.metrony.auth.AuthRole;
import com.metrony.exception.AuthenticationFailedException;
import com.metrony.exception.LoginRateLimitedException;
import com.metrony.exception.ManejadorErrores;
import com.metrony.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest {
    private AuthService service;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        service = mock(AuthService.class);
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper()
                .findAndRegisterModules().disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(service))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(mapper))
                .setControllerAdvice(new ManejadorErrores()).build();
    }

    @Test void validLoginUsesExactSafeContractAndNoStore() throws Exception {
        when(service.login(any(), any())).thenReturn(new LoginResponse("token", "Bearer",
                Instant.parse("2026-10-06T12:15:00Z"), 900,
                new UserIdentityResponse("operaciones.demo", "Operador de demostracion", Set.of(AuthRole.OPERACIONES))));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"operaciones.demo\",\"password\":\"valor-local\"}"))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("no-store")))
                .andExpect(jsonPath("$.accessToken").value("token"))
                .andExpect(jsonPath("$.expiresAt").value("2026-10-06T12:15:00Z"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.user.username").value("operaciones.demo"))
                .andExpect(jsonPath("$.user.id").doesNotExist());
    }

    @Test void everyCredentialFailureUsesGeneric401() throws Exception {
        when(service.login(any(), any())).thenThrow(new AuthenticationFailedException());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"desconocido\",\"password\":\"valor-local\"}"))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTHENTICATION_FAILED"))
                .andExpect(jsonPath("$.message").value("Las credenciales proporcionadas no son validas."));
    }

    @Test void throttlingReturnsIntegerRetryAfterAndStable429() throws Exception {
        when(service.login(any(), any())).thenThrow(new LoginRateLimitedException(77));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"usuario.demo\",\"password\":\"valor-local\"}"))
                .andExpect(status().isTooManyRequests()).andExpect(header().string("Retry-After", "77"))
                .andExpect(jsonPath("$.code").value("AUTH_RATE_LIMITED"));
    }
}

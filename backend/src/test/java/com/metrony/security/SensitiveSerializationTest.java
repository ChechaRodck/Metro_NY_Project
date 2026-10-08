package com.metrony.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.metrony.auth.AuthDtos.AdminUserResponse;
import com.metrony.auth.AuthDtos.LoginResponse;
import com.metrony.auth.AuthDtos.UserIdentityResponse;
import com.metrony.auth.AuthRole;
import com.metrony.auth.AuthDtos.LoginRequest;
import com.metrony.auth.AuthDtos.ChangePasswordRequest;
import com.metrony.auth.UserStatus;
import com.metrony.exception.ApiErrorFactory;
import com.metrony.dto.OperationalResponses.CardSummaryResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SensitiveSerializationTest {
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

    @Test void loginAdminAndErrorDtosNeverSerializeSecretFieldsOrInternals() throws Exception {
        LoginResponse login = new LoginResponse("opaque", "Bearer", Instant.now().plusSeconds(900), 900,
                new UserIdentityResponse("usuario.demo", "Usuario", Set.of(AuthRole.CONSULTA)));
        AdminUserResponse admin = new AdminUserResponse(1, "usuario.demo", "Usuario", UserStatus.ACTIVO,
                0, null, null, Instant.now(), Set.of(AuthRole.CONSULTA), 0);
        String json = mapper.writeValueAsString(java.util.List.of(login, admin,
                ApiErrorFactory.create(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", "Error seguro", Map.of())));

        assertThat(json).doesNotContain("password", "contrasena", "hashContrasena", "stackTrace", "SQLException", "ORA-", "SELECT ");
        assertThat(mapper.writeValueAsString(admin)).doesNotContain("opaque", "hash");
        assertThat(new LoginRequest("usuario.demo", "secreto-local").toString()).doesNotContain("secreto-local");
        assertThat(new ChangePasswordRequest("otra-clave-local").toString()).doesNotContain("otra-clave-local");
        assertThat(login.toString()).doesNotContain("opaque");
    }

    @Test void cardContractsContainOnlyTheMaskedPresentationNumber() throws Exception {
        CardSummaryResponse card = new CardSummaryResponse("**** **** **** 4242", 7L, "Pasajero QA",
                "VI-REG", "Viaje individual", "VIAJE_INDIVIDUAL", new BigDecimal("25.00"),
                LocalDate.of(2026, 1, 1), LocalDate.of(2031, 1, 1), "ACTIVA");

        String json = mapper.writeValueAsString(card);

        assertThat(json).contains("**** **** **** 4242");
        assertThat(json).doesNotContain("1234567890124242", "numeroTarjeta");
    }
}

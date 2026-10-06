package com.metrony.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.sql.SQLException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class ManejadorErroresTest {

    private static final String SENSITIVE_CARD = String.join("", "4000", "0000", "0000", "0007");

    private final ManejadorErrores handler = new ManejadorErrores();
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void serializesKnownDatabaseErrorWithoutOracleSqlOrSensitiveValues() throws Exception {
        SQLException sqlException = new SQLException(
                "ORA-00001: restriccion SECRET_CONSTRAINT; SELECT password FROM users; tarjeta=" + SENSITIVE_CARD,
                "23000",
                1
        );
        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "JdbcTemplate failed with DB_PASSWORD=exposed", sqlException
        );

        ResponseEntity<ManejadorErrores.ErrorResponse> response = handler.errorBaseDatos(exception);
        String json = objectMapper.writeValueAsString(response.getBody());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(json)
                .contains("\"status\":409")
                .contains("\"code\":\"DUPLICATE_RESOURCE\"")
                .contains("\"correlationId\"")
                .contains("\"fieldErrors\":{}")
                .doesNotContain("ORA-")
                .doesNotContain("SELECT")
                .doesNotContain("SECRET_CONSTRAINT")
                .doesNotContain("codigoOracle")
                .doesNotContain("SQLException")
                .doesNotContain("stackTrace")
                .doesNotContain("at com.metrony")
                .doesNotContain("DB_PASSWORD")
                .doesNotContain(SENSITIVE_CARD);
    }

    @Test
    void returnsGenericServerErrorWithCorrelationIdForUnknownDatabaseCode() throws Exception {
        SQLException sqlException = new SQLException(
                "ORA-12514: connection descriptor and workstation details",
                "66000",
                12514
        );
        DataAccessResourceFailureException exception = new DataAccessResourceFailureException(
                "Connection failed for user and password", sqlException
        );

        ResponseEntity<ManejadorErrores.ErrorResponse> response = handler.errorBaseDatos(exception);
        ManejadorErrores.ErrorResponse body = response.getBody();
        String json = objectMapper.writeValueAsString(body);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(body).isNotNull();
        assertThat(body.code()).isEqualTo("DATABASE_ERROR");
        assertThatCode(() -> UUID.fromString(body.correlationId())).doesNotThrowAnyException();
        assertThat(json)
                .doesNotContain("ORA-12514")
                .doesNotContain("connection descriptor")
                .doesNotContain("DataAccessResourceFailureException")
                .doesNotContain("stackTrace")
                .doesNotContain("password");
    }

    @Test
    void doesNotEchoMalformedRequestOrMissingResourceMessages() throws Exception {
        ResponseEntity<ManejadorErrores.ErrorResponse> malformed = handler.peticionMala(
                new IllegalArgumentException("SELECT * FROM TARJETA WHERE numero=" + SENSITIVE_CARD)
        );
        ResponseEntity<ManejadorErrores.ErrorResponse> missing = handler.noEncontrado(
                new NoEncontradoException("No existe la tarjeta " + SENSITIVE_CARD)
        );

        String malformedJson = objectMapper.writeValueAsString(malformed.getBody());
        String missingJson = objectMapper.writeValueAsString(missing.getBody());

        assertThat(malformed.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(missing.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(malformedJson).doesNotContain("SELECT").doesNotContain(SENSITIVE_CARD);
        assertThat(missingJson).doesNotContain(SENSITIVE_CARD);
    }
}

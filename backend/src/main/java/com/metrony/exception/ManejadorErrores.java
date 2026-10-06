package com.metrony.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Convierte los fallos en un contrato estable sin exponer mensajes del driver,
 * SQL, restricciones, clases internas ni datos de conexion.
 */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);
    private static final String GENERIC_DATABASE_MESSAGE =
            "No fue posible completar la operacion en este momento.";
    private static final String GENERIC_SERVER_MESSAGE =
            "Ocurrio un error inesperado. Use el identificador de correlacion al solicitar ayuda.";

    private final OracleErrorCatalog oracleErrorCatalog = new OracleErrorCatalog();

    @ExceptionHandler(NoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> noEncontrado(NoEncontradoException ignored) {
        return response(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND",
                "No se encontro el recurso solicitado.", Map.of());
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> errorBaseDatos(DataAccessException exception) {
        String correlationId = newCorrelationId();
        SQLException sqlException = findSqlException(exception);

        if (sqlException == null) {
            log.error("Fallo de acceso a datos. correlacion={}, codigoSql=no-disponible", correlationId);
            return response(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR",
                    GENERIC_DATABASE_MESSAGE, Map.of(), correlationId);
        }

        int oracleCode = sqlException.getErrorCode();
        String sqlState = safeSqlState(sqlException.getSQLState());
        return oracleErrorCatalog.find(oracleCode)
                .map(error -> {
                    log.warn("Fallo de base de datos controlado. correlacion={}, codigoSql={}, estadoSql={}",
                            correlationId, oracleCode, sqlState);
                    return response(error.status(), error.applicationCode(), error.message(),
                            Map.of(), correlationId);
                })
                .orElseGet(() -> {
                    log.error("Fallo de base de datos no catalogado. correlacion={}, codigoSql={}, estadoSql={}",
                            correlationId, oracleCode, sqlState);
                    return response(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR",
                            GENERIC_DATABASE_MESSAGE, Map.of(), correlationId);
                });
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> validacion(MethodArgumentNotValidException exception) {
        Map<String, String> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        ignored -> "Valor invalido.",
                        (first, ignored) -> first,
                        LinkedHashMap::new
                ));
        return response(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR",
                "Uno o mas campos no cumplen las reglas requeridas.", fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> restriccionValidacion(ConstraintViolationException ignored) {
        return response(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR",
                "Uno o mas valores no cumplen las reglas requeridas.", Map.of());
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiErrorResponse> peticionMala(Exception ignored) {
        return response(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST",
                "La solicitud no tiene un formato valido.", Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> errorInesperado(Exception exception) {
        String correlationId = newCorrelationId();
        logUnexpected(exception, correlationId);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                GENERIC_SERVER_MESSAGE, Map.of(), correlationId);
    }

    @ExceptionHandler(AuthenticationFailedException.class)
    public ResponseEntity<ApiErrorResponse> autenticacionFallida(AuthenticationFailedException ignored) {
        return response(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED",
                "Las credenciales proporcionadas no son validas.", Map.of());
    }

    @ExceptionHandler(LoginRateLimitedException.class)
    public ResponseEntity<ApiErrorResponse> limiteInicioSesion(LoginRateLimitedException exception) {
        ApiErrorResponse body = ApiErrorFactory.create(HttpStatus.TOO_MANY_REQUESTS,
                "AUTH_RATE_LIMITED", "Demasiados intentos. Intente nuevamente mas tarde.", Map.of());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(exception.getRetryAfterSeconds()))
                .body(body);
    }

    private ResponseEntity<ApiErrorResponse> response(HttpStatus status, String code, String message,
                                                   Map<String, String> fieldErrors) {
        return response(status, code, message, fieldErrors, newCorrelationId());
    }

    private ResponseEntity<ApiErrorResponse> response(HttpStatus status, String code, String message,
                                                   Map<String, String> fieldErrors, String correlationId) {
        ApiErrorResponse body = ApiErrorFactory.create(status, code, message, fieldErrors, correlationId);
        return ResponseEntity.status(status).body(body);
    }

    private SQLException findSqlException(Throwable exception) {
        Throwable current = exception;
        while (current != null) {
            if (current instanceof SQLException sqlException) {
                return sqlException;
            }
            current = current.getCause();
        }
        return null;
    }

    private String safeSqlState(String sqlState) {
        return sqlState == null || sqlState.isBlank() ? "no-disponible" : sqlState;
    }

    private void logUnexpected(Exception exception, String correlationId) {
        StackTraceElement[] trace = exception.getStackTrace();
        if (trace.length == 0) {
            log.error("Fallo inesperado. correlacion={}, tipo={}",
                    correlationId, exception.getClass().getSimpleName());
            return;
        }

        StackTraceElement origin = trace[0];
        log.error("Fallo inesperado. correlacion={}, tipo={}, origen={}.{}:{}",
                correlationId,
                exception.getClass().getSimpleName(),
                origin.getClassName(),
                origin.getMethodName(),
                origin.getLineNumber());
    }

    private String newCorrelationId() {
        return UUID.randomUUID().toString();
    }
}

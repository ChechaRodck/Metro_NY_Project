package com.metrony.exception;

import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public final class ApiErrorFactory {

    private ApiErrorFactory() {
    }

    public static ApiErrorResponse create(HttpStatus status, String code, String message,
                                          Map<String, String> fieldErrors) {
        return create(status, code, message, fieldErrors, UUID.randomUUID().toString());
    }

    public static ApiErrorResponse create(HttpStatus status, String code, String message,
                                          Map<String, String> fieldErrors, String correlationId) {
        Map<String, String> safeFields = Collections.unmodifiableMap(new LinkedHashMap<>(fieldErrors));
        return new ApiErrorResponse(
                Instant.now(), status.value(), code, message, correlationId, safeFields
        );
    }
}

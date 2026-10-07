package com.metrony.exception;

import java.time.Instant;
import java.util.Map;

/** Contrato de error comun para MVC y la cadena de Spring Security. */
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String message,
        String correlationId,
        Map<String, String> fieldErrors
) {
}

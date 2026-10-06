package com.metrony.exception;

import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Catalogo cerrado de codigos Oracle y codigos de negocio definidos por los
 * scripts canonicos. Ningun mensaje procedente del driver llega al cliente.
 */
public final class OracleErrorCatalog {

    private static final OracleError BUSINESS_RULE = new OracleError(
            HttpStatus.UNPROCESSABLE_ENTITY,
            "BUSINESS_RULE_VIOLATION",
            "La operacion no cumple una regla de negocio."
    );
    private static final OracleError RESOURCE_NOT_FOUND = new OracleError(
            HttpStatus.NOT_FOUND,
            "RESOURCE_NOT_FOUND",
            "No se encontro el recurso solicitado."
    );
    private static final OracleError RESOURCE_CONFLICT = new OracleError(
            HttpStatus.CONFLICT,
            "RESOURCE_CONFLICT",
            "La operacion entra en conflicto con el estado actual del recurso."
    );
    private static final OracleError INVALID_STATE_TRANSITION = new OracleError(
            HttpStatus.CONFLICT,
            "INVALID_STATE_TRANSITION",
            "El cambio de estado solicitado no esta permitido."
    );

    private static final Set<Integer> APPLICATION_CODES = Set.of(
            20001, 20002, 20003, 20004, 20005, 20006,
            20010, 20011, 20012, 20013, 20014, 20015, 20016, 20017,
            20020, 20021, 20022, 20023, 20024, 20025, 20026,
            20030, 20031, 20032, 20033, 20034, 20035, 20036, 20037, 20038, 20039, 20040,
            20050, 20051, 20052, 20053, 20054, 20055, 20056, 20057, 20058, 20059,
            20060, 20061, 20062, 20063, 20064, 20065, 20066, 20067, 20068,
            20070, 20071, 20072, 20073, 20074, 20075, 20076, 20077,
            20080, 20081, 20082, 20083, 20084, 20085, 20086, 20087, 20088, 20089,
            20090, 20091, 20092, 20093, 20094, 20095, 20096, 20097, 20098, 20099,
            20100, 20101,
            20110, 20111, 20112, 20113, 20114, 20115, 20116,
            20150, 20151, 20152, 20153, 20154,
            20160, 20161, 20162, 20163, 20164, 20165, 20166, 20167,
            20170, 20171, 20172, 20173, 20174, 20175, 20176, 20177, 20178, 20179
    );

    private static final Set<Integer> NOT_FOUND_CODES = Set.of(
            20001, 20002, 20010, 20013, 20030, 20050, 20053, 20060,
            20066, 20071, 20080, 20083, 20090, 20094, 20098, 20171
    );

    private static final Set<Integer> CONFLICT_CODES = Set.of(
            20003, 20006, 20012, 20023, 20024, 20026, 20056, 20057,
            20063, 20064, 20085, 20096, 20150, 20170, 20175
    );

    private static final Set<Integer> INVALID_TRANSITION_CODES = Set.of(
            20014, 20016, 20031, 20032, 20033, 20034, 20036, 20037,
            20051, 20052, 20054, 20055, 20058, 20059, 20061, 20067,
            20072, 20073, 20077, 20081, 20082, 20084, 20086, 20088,
            20091, 20095, 20100, 20101, 20110, 20111, 20151, 20152,
            20153, 20160, 20161, 20162, 20163, 20164, 20165, 20166, 20167,
            20174, 20176, 20177, 20178
    );

    private static final Map<Integer, OracleError> ERRORS = createErrors();

    public Optional<OracleError> find(int oracleCode) {
        return Optional.ofNullable(ERRORS.get(oracleCode));
    }

    private static Map<Integer, OracleError> createErrors() {
        Map<Integer, OracleError> errors = new HashMap<>();

        errors.put(1, new OracleError(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE",
                "Ya existe un registro con los mismos datos."));
        errors.put(1403, RESOURCE_NOT_FOUND);
        errors.put(2291, new OracleError(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_REFERENCE",
                "La operacion hace referencia a un recurso inexistente."));
        errors.put(2292, new OracleError(HttpStatus.CONFLICT, "RESOURCE_IN_USE",
                "El recurso tiene relaciones activas y no puede modificarse o eliminarse."));
        errors.put(2290, new OracleError(HttpStatus.UNPROCESSABLE_ENTITY, "CONSTRAINT_VIOLATION",
                "Uno o mas valores no cumplen las reglas requeridas."));
        errors.put(1400, new OracleError(HttpStatus.UNPROCESSABLE_ENTITY, "REQUIRED_FIELD_MISSING",
                "Falta un valor obligatorio."));
        errors.put(12899, new OracleError(HttpStatus.UNPROCESSABLE_ENTITY, "VALUE_TOO_LONG",
                "Uno o mas valores exceden la longitud permitida."));

        OracleError invalidFormat = new OracleError(HttpStatus.BAD_REQUEST, "INVALID_DATA_FORMAT",
                "La solicitud contiene un formato de dato invalido.");
        register(errors, Set.of(1722, 1858, 1861, 6502), invalidFormat);

        register(errors, APPLICATION_CODES, BUSINESS_RULE);
        register(errors, NOT_FOUND_CODES, RESOURCE_NOT_FOUND);
        register(errors, CONFLICT_CODES, RESOURCE_CONFLICT);
        register(errors, INVALID_TRANSITION_CODES, INVALID_STATE_TRANSITION);

        return Map.copyOf(errors);
    }

    private static void register(Map<Integer, OracleError> errors, Set<Integer> codes, OracleError error) {
        codes.forEach(code -> errors.put(code, error));
    }

    public record OracleError(HttpStatus status, String applicationCode, String message) {
    }
}

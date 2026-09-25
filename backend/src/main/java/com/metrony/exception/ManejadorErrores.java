package com.metrony.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Convierte los errores en respuestas JSON entendibles para el frontend.
 * Los errores que lanzan los procedimientos (RAISE_APPLICATION_ERROR -20xxx)
 * son reglas de negocio, entonces se devuelven como 400 con el mensaje de Oracle.
 */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(NoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> noEncontrado(NoEncontradoException e) {
        return respuesta(HttpStatus.NOT_FOUND, e.getMessage(), null);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> errorBaseDatos(DataAccessException e) {
        SQLException sql = buscarSQLException(e);
        if (sql == null) {
            log.error("Error de base de datos", e);
            return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Error en la base de datos", null);
        }

        int codigo = sql.getErrorCode();
        String mensajeOracle = primeraLinea(sql.getMessage());

        // errores de negocio lanzados desde PL/SQL
        if (codigo >= 20000 && codigo <= 20999) {
            return respuesta(HttpStatus.BAD_REQUEST, quitarPrefijo(mensajeOracle), codigo);
        }

        return switch (codigo) {
            case 1 -> respuesta(HttpStatus.CONFLICT, "Ya existe un registro con esos datos (" + mensajeOracle + ")", codigo);
            case 2291 -> respuesta(HttpStatus.BAD_REQUEST, "Se hace referencia a un registro que no existe (" + mensajeOracle + ")", codigo);
            case 2292 -> respuesta(HttpStatus.CONFLICT, "El registro tiene datos relacionados y no se puede modificar/eliminar", codigo);
            case 2290 -> respuesta(HttpStatus.BAD_REQUEST, "Algun valor no es valido (" + mensajeOracle + ")", codigo);
            case 1400 -> respuesta(HttpStatus.BAD_REQUEST, "Falta un campo obligatorio (" + mensajeOracle + ")", codigo);
            case 1722, 1858, 1861, 6502 -> respuesta(HttpStatus.BAD_REQUEST, "Formato de dato invalido (" + mensajeOracle + ")", codigo);
            case 12899 -> respuesta(HttpStatus.BAD_REQUEST, "Un valor es demasiado largo (" + mensajeOracle + ")", codigo);
            default -> {
                log.error("Error de Oracle no controlado", e);
                yield respuesta(HttpStatus.INTERNAL_SERVER_ERROR, mensajeOracle, codigo);
            }
        };
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(MethodArgumentNotValidException e) {
        String detalle = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return respuesta(HttpStatus.BAD_REQUEST, "Datos invalidos -> " + detalle, null);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, Object>> peticionMala(Exception e) {
        return respuesta(HttpStatus.BAD_REQUEST, "Peticion invalida: " + primeraLinea(e.getMessage()), null);
    }

    private ResponseEntity<Map<String, Object>> respuesta(HttpStatus estado, String mensaje, Integer codigoOracle) {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("fecha", LocalDateTime.now());
        cuerpo.put("estado", estado.value());
        cuerpo.put("error", mensaje);
        if (codigoOracle != null) {
            cuerpo.put("codigoOracle", codigoOracle);
        }
        return ResponseEntity.status(estado).body(cuerpo);
    }

    /**
     * El driver de Oracle envuelve el error en varias capas; la mas profunda es una
     * clase interna (OracleDatabaseException) que no es SQLException. Por eso se busca
     * la primera SQLException de la cadena, que es la que trae el codigo ORA-xxxxx.
     */
    private SQLException buscarSQLException(Throwable e) {
        Throwable actual = e;
        while (actual != null) {
            if (actual instanceof SQLException sql) {
                return sql;
            }
            actual = actual.getCause();
        }
        return null;
    }

    private String primeraLinea(String texto) {
        if (texto == null) return "";
        int salto = texto.indexOf('\n');
        return (salto > 0 ? texto.substring(0, salto) : texto).trim();
    }

    // "ORA-20081: La tarjeta esta BLOQUEADA" -> "La tarjeta esta BLOQUEADA"
    private String quitarPrefijo(String mensaje) {
        return mensaje.replaceFirst("^ORA-\\d{5}:\\s*", "");
    }
}

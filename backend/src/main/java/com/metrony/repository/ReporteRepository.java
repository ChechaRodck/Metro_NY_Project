package com.metrony.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Consultas y reportes (las 15 consultas minimas del enunciado estan aqui
 * o en los otros repositorios, ver README del backend).
 */
@Repository
public class ReporteRepository extends BaseRepository {

    public ReporteRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    /** Numeros generales para la pantalla principal. */
    public Map<String, Object> resumen() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("lineasActivas", contar("SELECT COUNT(*) FROM LINEA WHERE estado_operativo = 'ACTIVA'"));
        r.put("estacionesCerradas", contar("SELECT COUNT(*) FROM ESTACION WHERE estado_operativo <> 'OPERATIVA'"));
        r.put("viajesEnCurso", contar("SELECT COUNT(*) FROM VIAJE_PROGRAMADO WHERE estado_viaje = 'EN_CURSO'"));
        r.put("viajesHoy", contar("SELECT COUNT(*) FROM VIAJE_PROGRAMADO WHERE TRUNC(salida_programada) = TRUNC(SYSDATE)"));
        r.put("trenesDisponibles", contar("SELECT COUNT(*) FROM VW_TRENES_DISPONIBLES"));
        r.put("trenesMantenimiento", contar("SELECT COUNT(*) FROM TREN WHERE estado_operativo IN ('EN_MANTENIMIENTO','FUERA_SERVICIO')"));
        r.put("incidentesAbiertos", contar("SELECT COUNT(*) FROM INCIDENTE WHERE estado <> 'CERRADO'"));
        r.put("ordenesPendientes", contar("SELECT COUNT(*) FROM ORDEN_MANTENIMIENTO WHERE estado IN ('SOLICITADA','PROGRAMADA','EN_EJECUCION')"));
        r.put("certificacionesPorVencer", contar("SELECT COUNT(*) FROM VW_CERTIFICACIONES_POR_VENCER"));
        r.put("recaudadoHoy", jdbc.queryForObject(
                "SELECT NVL(SUM(monto_cobrado), 0) FROM VIAJE_PASAJERO WHERE TRUNC(fecha_hora_ingreso) = TRUNC(SYSDATE) AND estado <> 'ANULADO'",
                Object.class));
        return r;
    }

    // Consulta 9: pasajeros por linea en un periodo
    public List<Map<String, Object>> pasajerosPorLinea(LocalDate desde, LocalDate hasta) {
        return listar("""
                SELECT l.id_linea, l.nombre, FN_PASAJEROS_LINEA(l.id_linea, ?, ?) AS pasajeros
                  FROM LINEA l
                 ORDER BY pasajeros DESC
                """, desde, hasta);
    }

    // Consulta 10: recaudacion por dia, estacion y tipo de tarifa
    public List<Map<String, Object>> recaudacion(LocalDate desde, LocalDate hasta) {
        return listar("""
                SELECT TRUNC(vp.fecha_hora_ingreso) AS fecha, e.id_estacion, e.nombre AS estacion,
                       t.tipo_producto, COUNT(*) AS viajes, SUM(vp.monto_cobrado) AS total
                  FROM VIAJE_PASAJERO vp
                  JOIN ESTACION e ON e.id_estacion = vp.id_estacion_ingreso
                  JOIN TARIFA t ON t.codigo_tarifa = vp.codigo_tarifa
                 WHERE vp.estado <> 'ANULADO'
                   AND (? IS NULL OR vp.fecha_hora_ingreso >= ?)
                   AND (? IS NULL OR vp.fecha_hora_ingreso < ? + 1)
                 GROUP BY TRUNC(vp.fecha_hora_ingreso), e.id_estacion, e.nombre, t.tipo_producto
                 ORDER BY fecha, estacion, t.tipo_producto
                """, desde, desde, hasta, hasta);
    }

    public List<Map<String, Object>> ingresosPorLinea(LocalDate desde, LocalDate hasta) {
        return listar("""
                SELECT * FROM VW_INGRESOS_DIARIOS_LINEA
                 WHERE (? IS NULL OR fecha >= ?)
                   AND (? IS NULL OR fecha <= ?)
                 ORDER BY fecha, id_linea
                """, desde, desde, hasta, hasta);
    }

    public Map<String, Object> ingresosEstacion(Long idEstacion, LocalDate desde, LocalDate hasta) {
        Object total = consultarValor("SELECT FN_INGRESOS_ESTACION(?, ?, ?) FROM DUAL", idEstacion, desde, hasta);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("idEstacion", idEstacion);
        r.put("desde", desde);
        r.put("hasta", hasta);
        r.put("total", total);
        return r;
    }

    // Consulta 11: estaciones con mayor flujo
    public List<Map<String, Object>> estacionesMayorFlujo(int limite) {
        return listar("SELECT * FROM VW_ESTACIONES_FLUJO ORDER BY posicion FETCH FIRST ? ROWS ONLY", limite);
    }

    // Consulta 13: linea con mas retrasos
    public List<Map<String, Object>> retrasosPorLinea() {
        return listar("""
                SELECT r.id_linea,
                       COUNT(*) AS viajes_con_retraso,
                       ROUND(SUM(FN_MINUTOS_RETRASO(v.numero_viaje)), 1) AS minutos_acumulados,
                       ROUND(AVG(FN_MINUTOS_RETRASO(v.numero_viaje)), 1) AS promedio_min
                  FROM VIAJE_PROGRAMADO v
                  JOIN RUTA r ON r.id_ruta = v.id_ruta
                 WHERE v.estado_viaje IN ('COMPLETADO','EN_CURSO','RETRASADO')
                   AND FN_MINUTOS_RETRASO(v.numero_viaje) > 0
                 GROUP BY r.id_linea
                 ORDER BY minutos_acumulados DESC
                """);
    }

    // Consulta 7: trenes con inspeccion vencida
    public List<Map<String, Object>> trenesInspeccionVencida() {
        return listar("""
                SELECT t.codigo_tren, m.nombre_modelo AS modelo, t.estado_operativo, t.fecha_proxima_inspeccion,
                       TRUNC(SYSDATE) - t.fecha_proxima_inspeccion AS dias_vencido
                  FROM TREN t JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
                 WHERE t.fecha_proxima_inspeccion < TRUNC(SYSDATE)
                   AND t.estado_operativo <> 'RETIRADO'
                 ORDER BY dias_vencido DESC
                """);
    }

    // Consulta 8: conductor asignado a cada viaje
    public List<Map<String, Object>> conductoresPorViaje(LocalDate fecha) {
        return listar("""
                SELECT v.numero_viaje, r.codigo_ruta, v.salida_programada, v.estado_viaje, v.codigo_tren,
                       NVL(e.nombres || ' ' || e.apellidos, '(sin asignar)') AS conductor
                  FROM VIAJE_PROGRAMADO v
                  JOIN RUTA r ON r.id_ruta = v.id_ruta
                  LEFT JOIN EMPLEADO e ON e.id_empleado = v.id_conductor
                 WHERE (? IS NULL OR TRUNC(v.salida_programada) = ?)
                 ORDER BY v.salida_programada
                """, fecha, fecha);
    }

    // Consulta 14: tarjetas bloqueadas o vencidas
    public List<Map<String, Object>> tarjetasBloqueadasVencidas() {
        return listar("""
                SELECT tj.numero_tarjeta, NVL(p.nombres || ' ' || p.apellidos, 'ANONIMA') AS pasajero,
                       tj.estado, tj.fecha_vencimiento, tj.saldo
                  FROM TARJETA tj
                  LEFT JOIN PASAJERO p ON p.id_pasajero = tj.id_pasajero
                 WHERE tj.estado IN ('BLOQUEADA','VENCIDA','PERDIDA')
                    OR tj.fecha_vencimiento < TRUNC(SYSDATE)
                 ORDER BY tj.estado
                """);
    }

    // ------------------------- BITACORA -------------------------

    public List<Map<String, Object>> bitacora(String tabla, String tipo, int limite) {
        return listar("""
                SELECT * FROM BITACORA
                 WHERE (? IS NULL OR tabla = ?)
                   AND (? IS NULL OR tipo = ?)
                 ORDER BY id_bitacora DESC
                 FETCH FIRST ? ROWS ONLY
                """, tabla, tabla, tipo, tipo, limite);
    }

    private Long contar(String sql) {
        return jdbc.queryForObject(sql, Long.class);
    }
}

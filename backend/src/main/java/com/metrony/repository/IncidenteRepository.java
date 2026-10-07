package com.metrony.repository;

import com.metrony.dto.Peticiones.CerrarIncidenteRequest;
import com.metrony.dto.Peticiones.ElementoRequest;
import com.metrony.dto.Peticiones.IncidenteRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Types;
import java.util.List;
import java.util.Map;

/**
 * Modulo 7: incidentes y elementos afectados.
 */
@Repository
public class IncidenteRepository extends BaseRepository {

    public IncidenteRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    public List<Map<String, Object>> listarIncidentes(String estado, String severidad, String tipo) {
        return listar("""
                SELECT i.numero_incidente, i.tipo_incidente, i.descripcion, i.fecha_hora_inicio, i.fecha_hora_fin,
                       i.lugar_afectado, i.severidad, i.estado, i.pasajeros_afectados,
                       FN_DURACION_INCIDENTE(i.numero_incidente) AS duracion_min
                  FROM INCIDENTE i
                 WHERE (? IS NULL OR i.estado = ?)
                   AND (? IS NULL OR i.severidad = ?)
                   AND (? IS NULL OR i.tipo_incidente = ?)
                 ORDER BY i.fecha_hora_inicio DESC
                """, estado, estado, severidad, severidad, tipo, tipo);
    }

    public List<Map<String, Object>> incidentesAbiertos() {
        return listar("SELECT * FROM VW_INCIDENTES_ABIERTOS ORDER BY fecha_hora_inicio");
    }

    public Map<String, Object> buscarIncidente(Long numero) {
        Map<String, Object> inc = buscarUno("""
                SELECT i.*, e.nombres || ' ' || e.apellidos AS empleado_reporta,
                       FN_DURACION_INCIDENTE(i.numero_incidente) AS duracion_min
                  FROM INCIDENTE i
                  LEFT JOIN EMPLEADO e ON e.id_empleado = i.id_empleado_reporta
                 WHERE i.numero_incidente = ?
                """, "No existe el incidente " + numero, numero);
        inc.put("elementos", elementosDeIncidente(numero));
        return inc;
    }

    public List<Map<String, Object>> elementosDeIncidente(Long numero) {
        return listar("""
                SELECT ie.*,
                       CASE ie.tipo_elemento
                         WHEN 'ESTACION'   THEN (SELECT nombre FROM ESTACION WHERE id_estacion = ie.id_estacion)
                         WHEN 'PLATAFORMA' THEN (SELECT e.nombre || ' - ' || p.codigo_plataforma
                                                   FROM PLATAFORMA p JOIN ESTACION e ON e.id_estacion = p.id_estacion
                                                  WHERE p.id_plataforma = ie.id_plataforma)
                         WHEN 'TREN'       THEN ie.codigo_tren
                         WHEN 'RUTA'       THEN (SELECT codigo_ruta FROM RUTA WHERE id_ruta = ie.id_ruta)
                         WHEN 'EQUIPO'     THEN ie.id_equipo
                         WHEN 'VIAJE'      THEN 'Viaje #' || ie.numero_viaje
                         WHEN 'TRAMO'      THEN 'Linea ' || ie.id_linea || ': '
                                                || (SELECT nombre FROM ESTACION WHERE id_estacion = ie.id_estacion)
                                                || ' - '
                                                || (SELECT nombre FROM ESTACION WHERE id_estacion = ie.id_estacion_fin)
                       END AS elemento
                  FROM INCIDENTE_ELEMENTO ie
                 WHERE ie.numero_incidente = ?
                 ORDER BY ie.id_elemento
                """, numero);
    }

    /**
     * Registra el incidente y despues cada elemento afectado.
     * Es una sola transaccion: si algun elemento falla no se guarda nada.
     */
    @Transactional
    public Long registrarIncidente(IncidenteRequest r) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_INCIDENTE",
                params(r.tipoIncidente(), r.descripcion(), r.fechaHoraInicio(), r.lugarAfectado(), r.severidad(),
                        r.idEmpleadoReporta(), r.reportadoPor(), r.causa(), r.pasajerosAfectados(),
                        null, null, null),
                Types.NUMERIC);
        Long numero = aLong(out.get(0));

        if (r.elementos() != null) {
            for (ElementoRequest el : r.elementos()) {
                agregarElemento(numero, el);
            }
        }
        return numero;
    }

    public void agregarElemento(Long numero, ElementoRequest el) {
        llamar("SP_AGREGAR_ELEMENTO_INCIDENTE", numero, el.tipoElemento(), el.idElemento(), el.efecto(),
                el.idEstacionIni(), el.idEstacionFin(), el.minutosRetraso(), el.descripcion());
    }

    public void registrarAccion(Long numero, String accion) {
        llamar("SP_REGISTRAR_ACCION_INCIDENTE", numero, accion);
    }

    public void cerrarIncidente(Long numero, CerrarIncidenteRequest r) {
        boolean restablecer = r == null || r.restablecer() == null || r.restablecer();
        llamar("SP_CERRAR_INCIDENTE", numero,
                r == null ? null : r.fechaFin(),
                r == null ? null : r.causa(),
                restablecer ? "S" : "N");
    }

    public void cambiarSeveridad(Long numero, String severidad) {
        actualizarUno("UPDATE INCIDENTE SET severidad = ? WHERE numero_incidente = ? AND estado <> 'CERRADO'",
                "El incidente no existe o ya esta cerrado", severidad, numero);
    }

    /** Resumen para el tablero: cuantos incidentes hay por tipo y severidad y cuanto duran en promedio. */
    public List<Map<String, Object>> estadisticas() {
        return listar("""
                SELECT tipo_incidente, severidad,
                       COUNT(*) AS total,
                       SUM(CASE WHEN estado <> 'CERRADO' THEN 1 ELSE 0 END) AS abiertos,
                       ROUND(AVG(FN_DURACION_INCIDENTE(numero_incidente)), 1) AS duracion_promedio_min,
                       SUM(pasajeros_afectados) AS pasajeros_afectados
                  FROM INCIDENTE
                 GROUP BY tipo_incidente, severidad
                 ORDER BY total DESC
                """);
    }
}

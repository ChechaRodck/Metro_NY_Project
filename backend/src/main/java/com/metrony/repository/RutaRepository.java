package com.metrony.repository;

import com.metrony.dto.Peticiones.HorarioRequest;
import com.metrony.dto.Peticiones.ParadaRequest;
import com.metrony.dto.Peticiones.RutaRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Modulo 2 (parte 1): rutas, paradas de cada ruta y horarios.
 */
@Repository
public class RutaRepository extends BaseRepository {

    public RutaRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    public List<Map<String, Object>> listarRutas(String idLinea, String estado) {
        return listar("""
                SELECT r.*, eo.nombre AS estacion_origen, ed.nombre AS estacion_destino,
                       FN_RUTA_OPERATIVA(r.id_ruta) AS operativa
                  FROM RUTA r
                  JOIN ESTACION eo ON eo.id_estacion = r.id_estacion_origen
                  JOIN ESTACION ed ON ed.id_estacion = r.id_estacion_destino
                 WHERE (? IS NULL OR r.id_linea = ?)
                   AND (? IS NULL OR r.estado = ?)
                 ORDER BY r.id_linea, r.codigo_ruta
                """, idLinea, idLinea, estado, estado);
    }

    public Map<String, Object> buscarRuta(Long id) {
        return buscarUno("""
                SELECT r.*, eo.nombre AS estacion_origen, ed.nombre AS estacion_destino,
                       FN_RUTA_OPERATIVA(r.id_ruta) AS operativa
                  FROM RUTA r
                  JOIN ESTACION eo ON eo.id_estacion = r.id_estacion_origen
                  JOIN ESTACION ed ON ed.id_estacion = r.id_estacion_destino
                 WHERE r.id_ruta = ?
                """, "No existe la ruta " + id, id);
    }

    public Long crearRuta(RutaRequest r) {
        Long id = siguienteId("SEQ_RUTA");
        ejecutar("""
                INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido,
                                  tipo_servicio, distancia_total_km, duracion_estimada_min, estado,
                                  fecha_vigencia_inicio, fecha_vigencia_fin)
                VALUES (?, ?, ?, ?, ?, ?, ?, NVL(?, 0), ?, 'ACTIVA', NVL(?, TRUNC(SYSDATE)), ?)
                """,
                id, r.codigoRuta(), r.idLinea(), r.idEstacionOrigen(), r.idEstacionDestino(), r.sentido(),
                r.tipoServicio(), r.distanciaTotalKm(), r.duracionEstimadaMin(),
                r.fechaVigenciaInicio(), r.fechaVigenciaFin());
        return id;
    }

    public void actualizarRuta(Long id, RutaRequest r) {
        actualizarUno("""
                UPDATE RUTA
                   SET codigo_ruta = ?, id_estacion_origen = ?, id_estacion_destino = ?, sentido = ?,
                       tipo_servicio = ?, distancia_total_km = NVL(?, distancia_total_km),
                       duracion_estimada_min = ?, fecha_vigencia_inicio = NVL(?, fecha_vigencia_inicio),
                       fecha_vigencia_fin = ?
                 WHERE id_ruta = ?
                """, "No existe la ruta " + id,
                r.codigoRuta(), r.idEstacionOrigen(), r.idEstacionDestino(), r.sentido(), r.tipoServicio(),
                r.distanciaTotalKm(), r.duracionEstimadaMin(), r.fechaVigenciaInicio(), r.fechaVigenciaFin(), id);
    }

    public void cambiarEstadoRuta(Long id, String estado) {
        actualizarUno("UPDATE RUTA SET estado = ? WHERE id_ruta = ?", "No existe la ruta " + id, estado, id);
    }

    // ------------------------- PARADAS -------------------------

    public List<Map<String, Object>> paradasDeRuta(Long idRuta) {
        return listar("""
                SELECT re.orden, re.id_estacion, e.nombre AS estacion, e.estado_operativo,
                       re.minutos_llegada, re.minutos_salida, re.distancia_anterior_km,
                       re.tiempo_anterior_min, re.se_detiene
                  FROM RUTA_ESTACION re
                  JOIN ESTACION e ON e.id_estacion = re.id_estacion
                 WHERE re.id_ruta = ?
                 ORDER BY re.orden
                """, idRuta);
    }

    public void agregarParada(Long idRuta, ParadaRequest r) {
        llamar("SP_AGREGAR_PARADA_RUTA", idRuta, r.idEstacion(), r.orden(), r.minutosLlegada(),
                r.minutosSalida(), r.distanciaKm(), r.tiempoMin(), r.seDetiene());
    }

    public void quitarParada(Long idRuta, Long idEstacion) {
        actualizarUno("DELETE FROM RUTA_ESTACION WHERE id_ruta = ? AND id_estacion = ?",
                "La estacion no es parada de la ruta " + idRuta, idRuta, idEstacion);
    }

    // ------------------------- HORARIOS -------------------------

    public List<Map<String, Object>> horariosDeRuta(Long idRuta) {
        return listar("SELECT * FROM HORARIO WHERE id_ruta = ? ORDER BY dia_semana, hora_inicio", idRuta);
    }

    public Long crearHorario(Long idRuta, HorarioRequest r) {
        Long id = siguienteId("SEQ_HORARIO");
        ejecutar("""
                INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min,
                                     tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, NVL(?, TRUNC(SYSDATE)), ?, 'ACTIVO')
                """,
                id, idRuta, r.diaSemana(), r.horaInicio(), r.horaFin(), r.frecuenciaMin(), r.tipoServicio(),
                r.fechaInicioVigor(), r.fechaFinVigor());
        return id;
    }

    public void actualizarHorario(Long idHorario, HorarioRequest r) {
        actualizarUno("""
                UPDATE HORARIO
                   SET dia_semana = ?, hora_inicio = ?, hora_fin = ?, frecuencia_min = ?, tipo_servicio = ?,
                       fecha_inicio_vigor = NVL(?, fecha_inicio_vigor), fecha_fin_vigor = ?
                 WHERE id_horario = ?
                """, "No existe el horario " + idHorario,
                r.diaSemana(), r.horaInicio(), r.horaFin(), r.frecuenciaMin(), r.tipoServicio(),
                r.fechaInicioVigor(), r.fechaFinVigor(), idHorario);
    }

    public void cambiarEstadoHorario(Long idHorario, String estado) {
        actualizarUno("UPDATE HORARIO SET estado = ? WHERE id_horario = ?",
                "No existe el horario " + idHorario, estado, idHorario);
    }

    public List<Map<String, Object>> rutasAfectadas() {
        return listar("SELECT * FROM VW_RUTAS_AFECTADAS ORDER BY id_linea, codigo_ruta");
    }
}

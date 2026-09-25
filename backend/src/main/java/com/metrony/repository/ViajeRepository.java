package com.metrony.repository;

import com.metrony.dto.Peticiones.CancelarAfectadosRequest;
import com.metrony.dto.Peticiones.ProgramarViajeRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Types;
import java.util.List;
import java.util.Map;

/**
 * Modulo 2 (parte 2): viajes programados.
 * Todo lo que cambia estados pasa por los procedimientos (ahi estan las validaciones).
 */
@Repository
public class ViajeRepository extends BaseRepository {

    private static final String SELECT_VIAJE = """
            SELECT v.numero_viaje, v.id_ruta, r.codigo_ruta, r.id_linea, r.sentido,
                   eo.nombre AS origen, ed.nombre AS destino,
                   v.salida_programada, v.llegada_programada, v.salida_real, v.llegada_real,
                   v.codigo_tren, v.id_conductor, e.nombres || ' ' || e.apellidos AS conductor,
                   v.estado_viaje, v.pasajeros_estimados, v.motivo_cancelacion, v.id_horario,
                   FN_MINUTOS_RETRASO(v.numero_viaje) AS minutos_retraso,
                   FN_DURACION_VIAJE(v.numero_viaje) AS duracion_real_min
              FROM VIAJE_PROGRAMADO v
              JOIN RUTA r ON r.id_ruta = v.id_ruta
              JOIN ESTACION eo ON eo.id_estacion = r.id_estacion_origen
              JOIN ESTACION ed ON ed.id_estacion = r.id_estacion_destino
              LEFT JOIN EMPLEADO e ON e.id_empleado = v.id_conductor
            """;

    public ViajeRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    /** Todos los filtros son opcionales. */
    public List<Map<String, Object>> listarViajes(LocalDate fecha, Long idRuta, String idLinea, String estado) {
        return listar(SELECT_VIAJE + """
                 WHERE (? IS NULL OR TRUNC(v.salida_programada) = ?)
                   AND (? IS NULL OR v.id_ruta = ?)
                   AND (? IS NULL OR r.id_linea = ?)
                   AND (? IS NULL OR v.estado_viaje = ?)
                 ORDER BY v.salida_programada
                 FETCH FIRST 500 ROWS ONLY
                """, fecha, fecha, idRuta, idRuta, idLinea, idLinea, estado, estado);
    }

    public Map<String, Object> buscarViaje(Long numero) {
        return buscarUno(SELECT_VIAJE + " WHERE v.numero_viaje = ?", "No existe el viaje " + numero, numero);
    }

    public List<Map<String, Object>> viajesRetrasados(Integer minimoMinutos) {
        return listar("SELECT * FROM VW_VIAJES_RETRASADOS WHERE minutos_retraso > NVL(?, 0) ORDER BY minutos_retraso DESC",
                minimoMinutos);
    }

    public Long programarViaje(ProgramarViajeRequest r) {
        List<Object> out = llamarProcedimiento("SP_PROGRAMAR_VIAJE",
                params(r.idRuta(), r.salida(), r.codigoTren(), r.idConductor(), r.pasajerosEstimados()),
                Types.NUMERIC);
        return aLong(out.get(0));
    }

    public Long generarViajes(Long idHorario, LocalDate fecha) {
        List<Object> out = llamarProcedimiento("SP_GENERAR_VIAJES", params(idHorario, fecha), Types.NUMERIC);
        return aLong(out.get(0));
    }

    public void asignarTrenConductor(Long numero, String codigoTren, Long idConductor) {
        llamar("SP_ASIGNAR_TREN_CONDUCTOR", numero, codigoTren, idConductor);
    }

    public void cancelarViaje(Long numero, String motivo) {
        llamar("SP_CANCELAR_VIAJE", numero, motivo);
    }

    public void reprogramarViaje(Long numero, LocalDateTime nuevaSalida) {
        llamar("SP_REPROGRAMAR_VIAJE", numero, nuevaSalida);
    }

    public void iniciarViaje(Long numero, LocalDateTime hora) {
        llamar("SP_INICIAR_VIAJE", numero, hora);
    }

    public void finalizarViaje(Long numero, LocalDateTime hora, Integer pasajeros) {
        llamar("SP_FINALIZAR_VIAJE", numero, hora, pasajeros);
    }

    /** Marca un viaje como retrasado (por ejemplo cuando el centro de control lo reporta). */
    public void marcarRetrasado(Long numero) {
        actualizarUno("""
                UPDATE VIAJE_PROGRAMADO SET estado_viaje = 'RETRASADO'
                 WHERE numero_viaje = ? AND estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','EN_CURSO')
                """, "El viaje no existe o no se puede marcar como retrasado", numero);
    }

    public Long cancelarViajesAfectados(CancelarAfectadosRequest r) {
        List<Object> out = llamarProcedimiento("SP_CANCELAR_VIAJES_AFECTADOS",
                params(r.tipo(), r.id(), r.desde(), r.hasta(), r.motivo(), r.numeroIncidente()),
                Types.NUMERIC);
        return aLong(out.get(0));
    }

    /** Para llenar los combos del frontend al asignar: trenes y conductores que si se pueden usar. */
    public Map<String, Object> opcionesAsignacion(Long numero) {
        Map<String, Object> viaje = buscarViaje(numero);
        Object salida = viaje.get("salidaProgramada");
        Object llegada = viaje.get("llegadaProgramada");

        List<Map<String, Object>> trenes = listar("""
                SELECT t.codigo_tren, m.nombre_modelo AS modelo
                  FROM TREN t JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
                 WHERE FN_TREN_DISPONIBLE(t.codigo_tren, ?, ?, ?) = 'S'
                 ORDER BY t.codigo_tren
                """, salida, llegada, numero);

        List<Map<String, Object>> conductores = listar("""
                SELECT e.id_empleado, e.nombres || ' ' || e.apellidos AS nombre,
                       (SELECT LISTAGG(m.nombre_modelo, ',') WITHIN GROUP (ORDER BY m.nombre_modelo)
                          FROM CERTIFICACION c
                          JOIN CERTIFICACION_MODELO cm ON cm.id_certificacion = c.id_certificacion
                          JOIN MODELO_TREN m ON m.id_modelo = cm.id_modelo
                         WHERE c.id_empleado = e.id_empleado AND c.estado = 'VIGENTE'
                           AND c.fecha_vencimiento >= TRUNC(?)) AS modelos_habilitados
                  FROM EMPLEADO e
                  JOIN CARGO ca ON ca.id_cargo = e.id_cargo
                 WHERE ca.codigo_cargo = 'CONDUCTOR'
                   AND e.estado_laboral = 'ACTIVO'
                   AND NOT EXISTS (SELECT 1 FROM VIAJE_PROGRAMADO v
                                    WHERE v.id_conductor = e.id_empleado
                                      AND v.numero_viaje <> ?
                                      AND v.estado_viaje NOT IN ('CANCELADO','COMPLETADO')
                                      AND v.salida_programada < ? AND v.llegada_programada > ?)
                   AND NOT EXISTS (SELECT 1 FROM AUSENCIA a
                                    WHERE a.id_empleado = e.id_empleado AND a.estado = 'APROBADA'
                                      AND TRUNC(?) BETWEEN a.fecha_inicio AND a.fecha_fin)
                 ORDER BY nombre
                """, salida, numero, llegada, salida, salida);

        return Map.of("viaje", viaje, "trenes", trenes, "conductores", conductores);
    }
}

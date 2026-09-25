package com.metrony.repository;

import com.metrony.dto.Peticiones.EstacionLineaRequest;
import com.metrony.dto.Peticiones.EstacionRequest;
import com.metrony.dto.Peticiones.LineaRequest;
import com.metrony.dto.Peticiones.PlataformaRequest;
import com.metrony.dto.Peticiones.ServicioEstacionRequest;
import com.metrony.dto.Peticiones.TransferenciaRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.List;
import java.util.Map;

/**
 * Modulo 1: lineas, estaciones, plataformas, servicios y transferencias.
 */
@Repository
public class RedRepository extends BaseRepository {

    public RedRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // ------------------------- LINEAS -------------------------

    public List<Map<String, Object>> listarLineas() {
        return listar("SELECT * FROM VW_ESTADO_LINEAS ORDER BY id_linea");
    }

    public Map<String, Object> buscarLinea(String idLinea) {
        return buscarUno("SELECT * FROM VW_ESTADO_LINEAS WHERE id_linea = ?",
                "No existe la linea " + idLinea, idLinea);
    }

    public void crearLinea(LineaRequest r) {
        ejecutar("""
                INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino,
                                   estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
                VALUES (?, ?, ?, ?, ?, NVL(?, 'ACTIVA'), ?, ?, ?, ?)
                """,
                r.idLinea(), r.nombre(), r.colorMapa(), r.idTerminalOrigen(), r.idTerminalDestino(),
                r.estadoOperativo(), r.tipoServicio(), r.fechaInauguracion(), r.longitudKm(), r.operadorResponsable());
    }

    public void actualizarLinea(String idLinea, LineaRequest r) {
        actualizarUno("""
                UPDATE LINEA
                   SET nombre = ?, color_mapa = ?, id_terminal_origen = ?, id_terminal_destino = ?,
                       tipo_servicio = ?, fecha_inauguracion = ?, longitud_km = ?, operador_responsable = ?
                 WHERE id_linea = ?
                """, "No existe la linea " + idLinea,
                r.nombre(), r.colorMapa(), r.idTerminalOrigen(), r.idTerminalDestino(),
                r.tipoServicio(), r.fechaInauguracion(), r.longitudKm(), r.operadorResponsable(), idLinea);
    }

    public void cambiarEstadoLinea(String idLinea, String estado) {
        actualizarUno("UPDATE LINEA SET estado_operativo = ? WHERE id_linea = ?",
                "No existe la linea " + idLinea, estado, idLinea);
    }

    /** Desactiva la linea, sus rutas y cancela los viajes futuros. */
    public Map<String, Object> desactivarLinea(String idLinea) {
        List<Object> out = llamarProcedimiento("SP_DESACTIVAR_LINEA", params(idLinea), Types.NUMERIC);
        return Map.of("idLinea", idLinea, "viajesCancelados", aLong(out.get(0)));
    }

    public List<Map<String, Object>> estacionesDeLinea(String idLinea) {
        return listar("SELECT * FROM VW_ESTACIONES_LINEA WHERE id_linea = ? ORDER BY orden", idLinea);
    }

    public void agregarEstacionALinea(String idLinea, EstacionLineaRequest r) {
        llamar("SP_AGREGAR_ESTACION_LINEA", idLinea, r.idEstacion(), r.orden(), r.distanciaKm(), r.tiempoMin());
    }

    public void quitarEstacionDeLinea(String idLinea, Long idEstacion) {
        Integer orden = jdbc.query("SELECT orden FROM LINEA_ESTACION WHERE id_linea = ? AND id_estacion = ?",
                rs -> rs.next() ? rs.getInt(1) : null, idLinea, idEstacion);
        if (orden == null) {
            throw new com.metrony.exception.NoEncontradoException("La estacion no pertenece a la linea " + idLinea);
        }
        ejecutar("DELETE FROM LINEA_ESTACION WHERE id_linea = ? AND id_estacion = ?", idLinea, idEstacion);
        // se corren las que estaban despues para que no quede un hueco en el orden
        ejecutar("UPDATE LINEA_ESTACION SET orden = orden - 1 WHERE id_linea = ? AND orden > ?", idLinea, orden);
    }

    // ------------------------- ESTACIONES -------------------------

    public List<Map<String, Object>> listarEstaciones(String distrito, String estado) {
        return listar("""
                SELECT e.*,
                       (SELECT LISTAGG(le.id_linea, ',') WITHIN GROUP (ORDER BY le.id_linea)
                          FROM LINEA_ESTACION le WHERE le.id_estacion = e.id_estacion) AS lineas
                  FROM ESTACION e
                 WHERE (? IS NULL OR e.distrito = ?)
                   AND (? IS NULL OR e.estado_operativo = ?)
                 ORDER BY e.nombre
                """, distrito, distrito, estado, estado);
    }

    public Map<String, Object> buscarEstacion(Long id) {
        return buscarUno("SELECT * FROM ESTACION WHERE id_estacion = ?", "No existe la estacion " + id, id);
    }

    public Long crearEstacion(EstacionRequest r) {
        Long id = siguienteId("SEQ_ESTACION");
        ejecutar("""
                INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud,
                                      fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion,
                                      estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NVL(?, 1), NVL(?, 2), ?, NVL(?, 'OPERATIVA'),
                        NVL(?, '00:00'), NVL(?, '23:59'), NVL(?, 'N'))
                """,
                id, r.codigoEstacion(), r.nombre(), r.direccion(), r.distrito(), r.latitud(), r.longitud(),
                r.fechaInauguracion(), r.cantidadAccesos(), r.cantidadPlataformas(), r.tipoEstacion(),
                r.estadoOperativo(), r.horaApertura(), r.horaCierre(), r.accesibleDiscapacidad());
        return id;
    }

    public void actualizarEstacion(Long id, EstacionRequest r) {
        actualizarUno("""
                UPDATE ESTACION
                   SET codigo_estacion = ?, nombre = ?, direccion = ?, distrito = ?, latitud = ?, longitud = ?,
                       fecha_inauguracion = ?, cantidad_accesos = NVL(?, cantidad_accesos),
                       cantidad_plataformas = NVL(?, cantidad_plataformas), tipo_estacion = ?,
                       hora_apertura = NVL(?, hora_apertura), hora_cierre = NVL(?, hora_cierre),
                       accesible_discapacidad = NVL(?, accesible_discapacidad)
                 WHERE id_estacion = ?
                """, "No existe la estacion " + id,
                r.codigoEstacion(), r.nombre(), r.direccion(), r.distrito(), r.latitud(), r.longitud(),
                r.fechaInauguracion(), r.cantidadAccesos(), r.cantidadPlataformas(), r.tipoEstacion(),
                r.horaApertura(), r.horaCierre(), r.accesibleDiscapacidad(), id);
    }

    public void cambiarEstadoEstacion(Long id, String estado) {
        actualizarUno("UPDATE ESTACION SET estado_operativo = ? WHERE id_estacion = ?",
                "No existe la estacion " + id, estado, id);
    }

    public List<Map<String, Object>> lineasDeEstacion(Long idEstacion) {
        return listar("""
                SELECT l.id_linea, l.nombre, l.color_mapa, l.tipo_servicio, l.estado_operativo, le.orden
                  FROM LINEA_ESTACION le
                  JOIN LINEA l ON l.id_linea = le.id_linea
                 WHERE le.id_estacion = ?
                 ORDER BY l.id_linea
                """, idEstacion);
    }

    public List<Map<String, Object>> proximasSalidas(Long idEstacion, int limite) {
        return listar("""
                SELECT * FROM VW_PROXIMAS_SALIDAS
                 WHERE id_estacion = ?
                 ORDER BY hora_estimada
                 FETCH FIRST ? ROWS ONLY
                """, idEstacion, limite);
    }

    // ------------------------- PLATAFORMAS -------------------------

    public List<Map<String, Object>> plataformasDeEstacion(Long idEstacion) {
        return listar("SELECT * FROM PLATAFORMA WHERE id_estacion = ? ORDER BY codigo_plataforma", idEstacion);
    }

    public Long crearPlataforma(Long idEstacion, PlataformaRequest r) {
        Long id = siguienteId("SEQ_PLATAFORMA");
        ejecutar("""
                INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje,
                                        capacidad_aprox, estado_operativo)
                VALUES (?, ?, ?, ?, ?, NVL(?, 'OPERATIVA'))
                """, id, idEstacion, r.codigoPlataforma(), r.direccionViaje(), r.capacidadAprox(), r.estadoOperativo());
        return id;
    }

    public void cambiarEstadoPlataforma(Long idPlataforma, String estado) {
        actualizarUno("UPDATE PLATAFORMA SET estado_operativo = ? WHERE id_plataforma = ?",
                "No existe la plataforma " + idPlataforma, estado, idPlataforma);
    }

    // ------------------------- SERVICIOS -------------------------

    public List<Map<String, Object>> listarServicios() {
        return listar("SELECT * FROM SERVICIO ORDER BY nombre");
    }

    public List<Map<String, Object>> serviciosDeEstacion(Long idEstacion) {
        return listar("""
                SELECT s.id_servicio, s.nombre, es.observacion
                  FROM ESTACION_SERVICIO es
                  JOIN SERVICIO s ON s.id_servicio = es.id_servicio
                 WHERE es.id_estacion = ?
                 ORDER BY s.nombre
                """, idEstacion);
    }

    public void agregarServicio(Long idEstacion, ServicioEstacionRequest r) {
        ejecutar("INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio, observacion) VALUES (?, ?, ?)",
                idEstacion, r.idServicio(), r.observacion());
    }

    public void quitarServicio(Long idEstacion, Long idServicio) {
        actualizarUno("DELETE FROM ESTACION_SERVICIO WHERE id_estacion = ? AND id_servicio = ?",
                "La estacion no tiene ese servicio", idEstacion, idServicio);
    }

    public List<Map<String, Object>> equiposDeEstacion() {
        return listar("SELECT * FROM VW_EQUIPOS_ESTACION ORDER BY estacion");
    }

    // ------------------------- TRANSFERENCIAS -------------------------

    public List<Map<String, Object>> listarTransferencias(Long idEstacion) {
        return listar("""
                SELECT t.id_transferencia, t.id_estacion, e.nombre AS estacion,
                       t.id_linea_a, t.id_linea_b, t.tiempo_estimado_min, t.observacion
                  FROM TRANSFERENCIA t
                  JOIN ESTACION e ON e.id_estacion = t.id_estacion
                 WHERE (? IS NULL OR t.id_estacion = ?)
                 ORDER BY e.nombre, t.id_linea_a, t.id_linea_b
                """, idEstacion, idEstacion);
    }

    public Long registrarTransferencia(TransferenciaRequest r) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_TRANSFERENCIA",
                params(r.idEstacion(), r.lineaA(), r.lineaB(), r.tiempoMin()), Types.NUMERIC);
        return aLong(out.get(0));
    }

    public void eliminarTransferencia(Long id) {
        actualizarUno("DELETE FROM TRANSFERENCIA WHERE id_transferencia = ?", "No existe la transferencia " + id, id);
    }
}

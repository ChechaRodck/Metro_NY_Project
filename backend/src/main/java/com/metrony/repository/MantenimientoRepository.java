package com.metrony.repository;

import com.metrony.dto.Peticiones.EquipoRequest;
import com.metrony.dto.Peticiones.OrdenRequest;
import com.metrony.dto.Peticiones.RepuestoRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Types;
import java.util.List;
import java.util.Map;

/**
 * Modulo 6: equipos, ordenes de mantenimiento, tecnicos y repuestos.
 */
@Repository
public class MantenimientoRepository extends BaseRepository {

    public MantenimientoRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // ------------------------- EQUIPOS -------------------------

    public List<Map<String, Object>> listarEquipos(String tipo, String estado, Long idEstacion) {
        return listar("""
                SELECT q.*, e.nombre AS estacion
                  FROM EQUIPO q
                  LEFT JOIN ESTACION e ON e.id_estacion = q.id_estacion
                 WHERE (? IS NULL OR q.tipo_equipo = ?)
                   AND (? IS NULL OR q.estado = ?)
                   AND (? IS NULL OR q.id_estacion = ?)
                 ORDER BY q.tipo_equipo, q.id_equipo
                """, tipo, tipo, estado, estado, idEstacion, idEstacion);
    }

    public Map<String, Object> buscarEquipo(String id) {
        return buscarUno("""
                SELECT q.*, e.nombre AS estacion
                  FROM EQUIPO q LEFT JOIN ESTACION e ON e.id_estacion = q.id_estacion
                 WHERE q.id_equipo = ?
                """, "No existe el equipo " + id, id);
    }

    public void crearEquipo(EquipoRequest r) {
        ejecutar("""
                INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma,
                                    codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie,
                                    fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision,
                                    frecuencia_revision_dias)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NVL(?, TRUNC(SYSDATE)), 'OPERATIVO', NULL,
                        NVL(?, TRUNC(SYSDATE) + ?), ?)
                """,
                r.idEquipo(), r.tipoEquipo(), r.descripcionUbicacion(), r.idEstacion(), r.idPlataforma(),
                r.codigoTren(), r.numeroSerieVagon(), r.fabricante(), r.modelo(), r.numeroSerie(),
                r.fechaInstalacion(), r.fechaProximaRevision(), r.frecuenciaRevisionDias(), r.frecuenciaRevisionDias());
    }

    public void cambiarEstadoEquipo(String id, String estado) {
        actualizarUno("UPDATE EQUIPO SET estado = ? WHERE id_equipo = ?", "No existe el equipo " + id, estado, id);
    }

    public List<Map<String, Object>> equiposConRevisionVencida() {
        return listar("SELECT * FROM VW_MANTENIMIENTOS_VENCIDOS ORDER BY dias_vencido DESC");
    }

    public List<Map<String, Object>> historialDeEquipo(String id) {
        return listar("""
                SELECT o.numero_orden, o.tipo_mantenimiento, o.descripcion, o.fecha_solicitud, o.fecha_fin,
                       o.estado, FN_COSTO_ORDEN(o.numero_orden) AS costo_total
                  FROM ORDEN_MANTENIMIENTO o
                 WHERE o.id_equipo = ?
                 ORDER BY o.fecha_solicitud DESC
                """, id);
    }

    // ------------------------- ORDENES -------------------------

    public List<Map<String, Object>> listarOrdenes(String estado, String prioridad) {
        return listar("""
                SELECT o.numero_orden, o.id_equipo, q.tipo_equipo, q.descripcion_ubicacion,
                       o.tipo_mantenimiento, o.descripcion, o.fecha_solicitud, o.fecha_programada,
                       o.fecha_inicio, o.fecha_fin, o.prioridad, o.estado,
                       e.nombres || ' ' || e.apellidos AS responsable,
                       FN_COSTO_ORDEN(o.numero_orden) AS costo_total
                  FROM ORDEN_MANTENIMIENTO o
                  JOIN EQUIPO q ON q.id_equipo = o.id_equipo
                  JOIN EMPLEADO e ON e.id_empleado = o.id_tecnico_responsable
                 WHERE (? IS NULL OR o.estado = ?)
                   AND (? IS NULL OR o.prioridad = ?)
                 ORDER BY DECODE(o.prioridad, 'URGENTE', 1, 'ALTA', 2, 'MEDIA', 3, 4), o.fecha_solicitud
                """, estado, estado, prioridad, prioridad);
    }

    public Map<String, Object> buscarOrden(Long numero) {
        Map<String, Object> orden = buscarUno("""
                SELECT o.*, q.tipo_equipo, q.descripcion_ubicacion,
                       e.nombres || ' ' || e.apellidos AS responsable,
                       FN_COSTO_ORDEN(o.numero_orden) AS costo_total
                  FROM ORDEN_MANTENIMIENTO o
                  JOIN EQUIPO q ON q.id_equipo = o.id_equipo
                  JOIN EMPLEADO e ON e.id_empleado = o.id_tecnico_responsable
                 WHERE o.numero_orden = ?
                """, "No existe la orden " + numero, numero);
        orden.put("tecnicos", tecnicosDeOrden(numero));
        orden.put("repuestos", repuestosDeOrden(numero));
        return orden;
    }

    public Long crearOrden(OrdenRequest r) {
        List<Object> out = llamarProcedimiento("SP_CREAR_ORDEN_MANTENIMIENTO",
                params(r.idEquipo(), r.tipoMantenimiento(), r.descripcion(), r.fechaProgramada(),
                        r.prioridad(), r.idTecnico(), r.costoManoObra()),
                Types.NUMERIC);
        return aLong(out.get(0));
    }

    public void cambiarEstadoOrden(Long numero, String estado) {
        llamar("SP_CAMBIAR_ESTADO_ORDEN", numero, estado);
    }

    public List<Map<String, Object>> tecnicosDeOrden(Long numero) {
        return listar("""
                SELECT ot.id_empleado, e.nombres || ' ' || e.apellidos AS tecnico, ot.rol, ot.horas_trabajadas
                  FROM ORDEN_TECNICO ot JOIN EMPLEADO e ON e.id_empleado = ot.id_empleado
                 WHERE ot.numero_orden = ?
                 ORDER BY ot.rol DESC, tecnico
                """, numero);
    }

    public void asignarTecnico(Long numero, Long idEmpleado, String rol) {
        llamar("SP_ASIGNAR_TECNICO", numero, idEmpleado, rol);
    }

    public void registrarHoras(Long numero, Long idEmpleado, BigDecimal horas) {
        actualizarUno("UPDATE ORDEN_TECNICO SET horas_trabajadas = ? WHERE numero_orden = ? AND id_empleado = ?",
                "El tecnico no esta asignado a la orden", horas, numero, idEmpleado);
    }

    public List<Map<String, Object>> repuestosDeOrden(Long numero) {
        return listar("""
                SELECT orp.id_repuesto, r.nombre, orp.cantidad, orp.costo_unitario,
                       orp.cantidad * orp.costo_unitario AS subtotal
                  FROM ORDEN_REPUESTO orp JOIN REPUESTO r ON r.id_repuesto = orp.id_repuesto
                 WHERE orp.numero_orden = ?
                 ORDER BY r.nombre
                """, numero);
    }

    public void registrarRepuesto(Long numero, Long idRepuesto, Integer cantidad) {
        llamar("SP_REGISTRAR_REPUESTO", numero, idRepuesto, cantidad);
    }

    // ------------------------- REPUESTOS -------------------------

    public List<Map<String, Object>> listarRepuestos() {
        return listar("SELECT * FROM REPUESTO ORDER BY nombre");
    }

    public Long crearRepuesto(RepuestoRequest r) {
        Long id = siguienteId("SEQ_REPUESTO");
        ejecutar("INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock) VALUES (?, ?, ?, ?, ?)",
                id, r.nombre(), r.descripcion(), r.costoUnitario(), r.stock());
        return id;
    }

    public void agregarStock(Long idRepuesto, Integer cantidad) {
        actualizarUno("UPDATE REPUESTO SET stock = stock + ? WHERE id_repuesto = ?",
                "No existe el repuesto " + idRepuesto, cantidad, idRepuesto);
    }
}

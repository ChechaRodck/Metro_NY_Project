package com.metrony.repository;

import com.metrony.dto.Peticiones.AusenciaRequest;
import com.metrony.dto.Peticiones.CertificacionRequest;
import com.metrony.dto.Peticiones.EmpleadoRequest;
import com.metrony.dto.Peticiones.TurnoRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Types;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Modulo 4: empleados, certificaciones, turnos y ausencias.
 */
@Repository
public class PersonalRepository extends BaseRepository {

    public PersonalRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // ------------------------- EMPLEADOS -------------------------

    public List<Map<String, Object>> listarEmpleados(String codigoCargo, String estado) {
        return listar("""
                SELECT e.id_empleado, e.nombres, e.apellidos, e.telefono, e.correo, e.fecha_contratacion,
                       e.turno, e.estado_laboral, c.codigo_cargo, c.nombre_cargo,
                       s.nombres || ' ' || s.apellidos AS supervisor
                  FROM EMPLEADO e
                  JOIN CARGO c ON c.id_cargo = e.id_cargo
                  LEFT JOIN EMPLEADO s ON s.id_empleado = e.id_supervisor
                 WHERE (? IS NULL OR c.codigo_cargo = ?)
                   AND (? IS NULL OR e.estado_laboral = ?)
                 ORDER BY e.apellidos, e.nombres
                """, codigoCargo, codigoCargo, estado, estado);
    }

    public Map<String, Object> buscarEmpleado(Long id) {
        return buscarUno("""
                SELECT e.*, c.codigo_cargo, c.nombre_cargo, s.nombres || ' ' || s.apellidos AS supervisor
                  FROM EMPLEADO e
                  JOIN CARGO c ON c.id_cargo = e.id_cargo
                  LEFT JOIN EMPLEADO s ON s.id_empleado = e.id_supervisor
                 WHERE e.id_empleado = ?
                """, "No existe el empleado " + id, id);
    }

    public Long crearEmpleado(EmpleadoRequest r) {
        Long id = siguienteId("SEQ_EMPLEADO");
        ejecutar("""
                INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo,
                                      fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NVL(?, 'ACTIVO'), ?)
                """,
                id, r.nombres(), r.apellidos(), r.fechaNacimiento(), r.direccion(), r.telefono(), r.correo(),
                r.fechaContratacion(), r.idCargo(), r.turno(), r.salario(), r.estadoLaboral(), r.idSupervisor());
        return id;
    }

    public void actualizarEmpleado(Long id, EmpleadoRequest r) {
        actualizarUno("""
                UPDATE EMPLEADO
                   SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, direccion = ?, telefono = ?, correo = ?,
                       fecha_contratacion = ?, id_cargo = ?, turno = ?, salario = ?, id_supervisor = ?
                 WHERE id_empleado = ?
                """, "No existe el empleado " + id,
                r.nombres(), r.apellidos(), r.fechaNacimiento(), r.direccion(), r.telefono(), r.correo(),
                r.fechaContratacion(), r.idCargo(), r.turno(), r.salario(), r.idSupervisor(), id);
    }

    public void cambiarEstadoEmpleado(Long id, String estado) {
        actualizarUno("UPDATE EMPLEADO SET estado_laboral = ? WHERE id_empleado = ?",
                "No existe el empleado " + id, estado, id);
    }

    public List<Map<String, Object>> listarCargos() {
        return listar("SELECT * FROM CARGO ORDER BY nombre_cargo");
    }

    // ------------------------- CERTIFICACIONES -------------------------

    public List<Map<String, Object>> certificacionesDeEmpleado(Long idEmpleado) {
        return listar("""
                SELECT c.*,
                       (SELECT LISTAGG(m.nombre_modelo, ',') WITHIN GROUP (ORDER BY m.nombre_modelo)
                          FROM CERTIFICACION_MODELO cm JOIN MODELO_TREN m ON m.id_modelo = cm.id_modelo
                         WHERE cm.id_certificacion = c.id_certificacion) AS modelos
                  FROM CERTIFICACION c
                 WHERE c.id_empleado = ?
                 ORDER BY c.fecha_vencimiento DESC
                """, idEmpleado);
    }

    /** Guarda la certificacion y los modelos de tren que habilita (todo o nada). */
    @Transactional
    public Long crearCertificacion(Long idEmpleado, CertificacionRequest r) {
        Long id = siguienteId("SEQ_CERTIFICACION");
        ejecutar("""
                INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision,
                                           fecha_vencimiento, institucion_emisora, estado)
                VALUES (?, ?, ?, ?, ?, ?, 'VIGENTE')
                """, id, idEmpleado, r.tipoCertificacion(), r.fechaEmision(), r.fechaVencimiento(), r.institucionEmisora());
        if (r.modelos() != null) {
            for (Long idModelo : r.modelos()) {
                ejecutar("INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo) VALUES (?, ?)", id, idModelo);
            }
        }
        return id;
    }

    public void cambiarEstadoCertificacion(Long idCertificacion, String estado) {
        actualizarUno("UPDATE CERTIFICACION SET estado = ? WHERE id_certificacion = ?",
                "No existe la certificacion " + idCertificacion, estado, idCertificacion);
    }

    public List<Map<String, Object>> certificacionesPorVencer() {
        return listar("SELECT * FROM VW_CERTIFICACIONES_POR_VENCER ORDER BY dias_restantes");
    }

    // ------------------------- TURNOS -------------------------

    public List<Map<String, Object>> listarTurnos(LocalDate fecha, Long idEmpleado) {
        return listar("""
                SELECT t.*, e.nombres || ' ' || e.apellidos AS empleado, c.nombre_cargo AS cargo,
                       CASE t.tipo_lugar
                         WHEN 'ESTACION' THEN (SELECT nombre FROM ESTACION WHERE id_estacion = t.id_estacion)
                         WHEN 'DEPOSITO' THEN (SELECT nombre FROM DEPOSITO WHERE id_deposito = t.id_deposito)
                         WHEN 'RUTA'     THEN (SELECT codigo_ruta FROM RUTA WHERE id_ruta = t.id_ruta)
                         WHEN 'TREN'     THEN t.codigo_tren
                         ELSE 'Centro de control'
                       END AS lugar
                  FROM TURNO t
                  JOIN EMPLEADO e ON e.id_empleado = t.id_empleado
                  JOIN CARGO c ON c.id_cargo = e.id_cargo
                 WHERE (? IS NULL OR TRUNC(t.hora_inicio) = ?)
                   AND (? IS NULL OR t.id_empleado = ?)
                 ORDER BY t.hora_inicio, empleado
                """, fecha, fecha, idEmpleado, idEmpleado);
    }

    public Long programarTurno(TurnoRequest r) {
        List<Object> out = llamarProcedimiento("SP_PROGRAMAR_TURNO",
                params(r.idEmpleado(), r.horaInicio(), r.horaFin(), r.tipoLugar(), r.idLugar(), r.funcion()),
                Types.NUMERIC);
        return aLong(out.get(0));
    }

    public void marcarAsistencia(Long idTurno, String estado) {
        actualizarUno("UPDATE TURNO SET estado_asistencia = ? WHERE id_turno = ?",
                "No existe el turno " + idTurno, estado, idTurno);
    }

    public Long sustituirTurno(Long idTurno, Long idSustituto) {
        List<Object> out = llamarProcedimiento("SP_SUSTITUIR_TURNO", params(idTurno, idSustituto), Types.NUMERIC);
        return aLong(out.get(0));
    }

    /** Turnos que quedaron sin cubrir por una ausencia/permiso y todavia no tienen sustituto. */
    public List<Map<String, Object>> turnosSinCubrir() {
        return listar("""
                SELECT t.id_turno, t.hora_inicio, t.hora_fin, t.tipo_lugar, t.funcion, t.estado_asistencia,
                       e.id_empleado, e.nombres || ' ' || e.apellidos AS empleado, e.id_cargo
                  FROM TURNO t
                  JOIN EMPLEADO e ON e.id_empleado = t.id_empleado
                 WHERE t.estado_asistencia IN ('AUSENTE','PERMISO','VACACIONES')
                   AND t.hora_inicio >= TRUNC(SYSDATE)
                   AND NOT EXISTS (SELECT 1 FROM TURNO s WHERE s.id_turno_reemplaza = t.id_turno)
                 ORDER BY t.hora_inicio
                """);
    }

    // ------------------------- AUSENCIAS -------------------------

    public List<Map<String, Object>> listarAusencias(Long idEmpleado) {
        return listar("""
                SELECT a.*, e.nombres || ' ' || e.apellidos AS empleado
                  FROM AUSENCIA a
                  JOIN EMPLEADO e ON e.id_empleado = a.id_empleado
                 WHERE (? IS NULL OR a.id_empleado = ?)
                 ORDER BY a.fecha_inicio DESC
                """, idEmpleado, idEmpleado);
    }

    public Map<String, Object> registrarAusencia(AusenciaRequest r) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_AUSENCIA",
                params(r.idEmpleado(), r.tipo(), r.fechaInicio(), r.fechaFin(), r.motivo()),
                Types.NUMERIC, Types.NUMERIC);
        return Map.of("idAusencia", aLong(out.get(0)), "turnosAfectados", aLong(out.get(1)));
    }

    public Map<String, Object> revisarVencimientos() {
        List<Object> out = llamarProcedimiento("SP_REVISAR_VENCIMIENTOS", params(), Types.NUMERIC, Types.NUMERIC);
        return Map.of("certificacionesVencidas", aLong(out.get(0)), "tarjetasVencidas", aLong(out.get(1)));
    }
}

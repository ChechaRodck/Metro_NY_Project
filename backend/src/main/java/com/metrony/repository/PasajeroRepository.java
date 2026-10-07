package com.metrony.repository;

import com.metrony.dto.Peticiones.EmitirTarjetaRequest;
import com.metrony.dto.Peticiones.PasajeroRequest;
import com.metrony.dto.Peticiones.RecargaRequest;
import com.metrony.dto.Peticiones.TarifaRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Types;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Modulo 5: pasajeros, tarjetas, recargas, accesos al sistema y tarifas.
 */
@Repository
public class PasajeroRepository extends BaseRepository {

    public PasajeroRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    // ------------------------- PASAJEROS -------------------------

    public List<Map<String, Object>> listarPasajeros(String buscar) {
        String patron = buscar == null ? null : "%" + buscar.toUpperCase() + "%";
        return listar("""
                SELECT p.*,
                       (SELECT COUNT(*) FROM TARJETA t WHERE t.id_pasajero = p.id_pasajero) AS tarjetas
                  FROM PASAJERO p
                 WHERE (? IS NULL OR UPPER(p.nombres || ' ' || p.apellidos) LIKE ? OR UPPER(p.correo) LIKE ?)
                 ORDER BY p.apellidos, p.nombres
                """, patron, patron, patron);
    }

    public Map<String, Object> buscarPasajero(Long id) {
        return buscarUno("SELECT * FROM PASAJERO WHERE id_pasajero = ?", "No existe el pasajero " + id, id);
    }

    public Long crearPasajero(PasajeroRequest r) {
        Long id = siguienteId("SEQ_PASAJERO");
        ejecutar("""
                INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono,
                                      tipo_pasajero, fecha_registro, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, SYSDATE, 'ACTIVO')
                """, id, r.nombres(), r.apellidos(), r.fechaNacimiento(), r.correo(), r.telefono(), r.tipoPasajero());
        return id;
    }

    public void actualizarPasajero(Long id, PasajeroRequest r) {
        actualizarUno("""
                UPDATE PASAJERO
                   SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, correo = ?, telefono = ?, tipo_pasajero = ?
                 WHERE id_pasajero = ?
                """, "No existe el pasajero " + id,
                r.nombres(), r.apellidos(), r.fechaNacimiento(), r.correo(), r.telefono(), r.tipoPasajero(), id);
    }

    public void cambiarEstadoPasajero(Long id, String estado) {
        actualizarUno("UPDATE PASAJERO SET estado = ? WHERE id_pasajero = ?", "No existe el pasajero " + id, estado, id);
    }

    public List<Map<String, Object>> tarjetasDePasajero(Long idPasajero) {
        return listar("""
                SELECT t.*, ta.nombre AS tarifa
                  FROM TARJETA t JOIN TARIFA ta ON ta.codigo_tarifa = t.codigo_tarifa
                 WHERE t.id_pasajero = ?
                 ORDER BY t.fecha_emision DESC
                """, idPasajero);
    }

    // ------------------------- TARJETAS -------------------------

    public Map<String, Object> buscarTarjeta(Long numero) {
        return buscarUno("""
                SELECT t.*, ta.nombre AS tarifa, ta.tipo_producto, ta.monto AS monto_tarifa,
                       NVL(p.nombres || ' ' || p.apellidos, 'ANONIMA') AS pasajero,
                       FN_TARJETA_VALIDA(t.numero_tarjeta) AS valida,
                       FN_CALCULAR_TARIFA(t.numero_tarjeta) AS proximo_cobro
                  FROM TARJETA t
                  JOIN TARIFA ta ON ta.codigo_tarifa = t.codigo_tarifa
                  LEFT JOIN PASAJERO p ON p.id_pasajero = t.id_pasajero
                 WHERE t.numero_tarjeta = ?
                """, "No existe la tarjeta " + numero, numero);
    }

    public Map<String, Object> saldo(Long numero) {
        buscarTarjeta(numero); // para devolver 404 si no existe
        Object saldo = consultarValor("SELECT FN_SALDO_TARJETA(?) FROM DUAL", numero);
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("numeroTarjeta", numero);
        r.put("saldo", saldo);
        return r;
    }

    public Long emitirTarjeta(EmitirTarjetaRequest r) {
        List<Object> out = llamarProcedimiento("SP_EMITIR_TARJETA",
                params(r.idPasajero(), r.codigoTarifa(), r.saldoInicial(), r.idEstacion()), Types.NUMERIC);
        return aLong(out.get(0));
    }

    public Map<String, Object> recargar(Long numero, RecargaRequest r) {
        List<Object> out = llamarProcedimiento("SP_RECARGAR_TARJETA",
                params(numero, r.monto(), r.medioPago(), r.canal(), r.idEstacion()),
                Types.NUMERIC, Types.NUMERIC);
        return Map.of("numeroTransaccion", aLong(out.get(0)), "saldo", aDecimal(out.get(1)));
    }

    public void cambiarEstadoTarjeta(Long numero, String estado) {
        llamar("SP_CAMBIAR_ESTADO_TARJETA", numero, estado);
    }

    public List<Map<String, Object>> recargasDeTarjeta(Long numero) {
        return listar("""
                SELECT r.*, e.nombre AS estacion
                  FROM RECARGA r LEFT JOIN ESTACION e ON e.id_estacion = r.id_estacion
                 WHERE r.numero_tarjeta = ?
                 ORDER BY r.fecha_hora DESC
                """, numero);
    }

    public List<Map<String, Object>> viajesDeTarjeta(Long numero) {
        return listar("""
                SELECT vp.numero_transaccion, vp.fecha_hora_ingreso, ei.nombre AS estacion_ingreso,
                       vp.fecha_hora_salida, es.nombre AS estacion_salida, vp.codigo_tarifa,
                       vp.monto_cobrado, vp.estado
                  FROM VIAJE_PASAJERO vp
                  JOIN ESTACION ei ON ei.id_estacion = vp.id_estacion_ingreso
                  LEFT JOIN ESTACION es ON es.id_estacion = vp.id_estacion_salida
                 WHERE vp.numero_tarjeta = ?
                 ORDER BY vp.fecha_hora_ingreso DESC
                """, numero);
    }

    public List<Map<String, Object>> tarjetasConAlerta() {
        return listar("SELECT * FROM VW_TARJETAS_ALERTA ORDER BY problema, numero_tarjeta");
    }

    // ------------------------- ACCESOS (torniquetes) -------------------------

    public Map<String, Object> registrarIngreso(Long numeroTarjeta, Long idEstacion) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_INGRESO", params(numeroTarjeta, idEstacion),
                Types.NUMERIC, Types.NUMERIC, Types.NUMERIC);
        return Map.of("numeroTransaccion", aLong(out.get(0)),
                "montoCobrado", aDecimal(out.get(1)),
                "saldo", aDecimal(out.get(2)));
    }

    public Map<String, Object> registrarSalida(Long numeroTarjeta, Long idEstacion) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_SALIDA", params(numeroTarjeta, idEstacion), Types.NUMERIC);
        return Map.of("numeroTransaccion", aLong(out.get(0)));
    }

    public Map<String, Object> registrarViajeAnonimo(Long idEstacion, String codigoTarifa) {
        List<Object> out = llamarProcedimiento("SP_REGISTRAR_VIAJE_ANONIMO",
                params(idEstacion, codigoTarifa == null ? "VI-REG" : codigoTarifa),
                Types.NUMERIC, Types.NUMERIC);
        return Map.of("numeroTransaccion", aLong(out.get(0)), "montoCobrado", aDecimal(out.get(1)));
    }

    // ------------------------- TARIFAS -------------------------

    public List<Map<String, Object>> listarTarifas(Boolean soloActivas) {
        return listar("""
                SELECT * FROM TARIFA
                 WHERE (? = 'N' OR estado = 'ACTIVA')
                 ORDER BY tipo_producto, monto
                """, Boolean.TRUE.equals(soloActivas));
    }

    public Map<String, Object> buscarTarifa(String codigo) {
        return buscarUno("SELECT * FROM TARIFA WHERE codigo_tarifa = ?", "No existe la tarifa " + codigo, codigo);
    }

    public void crearTarifa(TarifaRequest r) {
        ejecutar("""
                INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero,
                                    fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
                VALUES (?, ?, ?, ?, ?, ?, NVL(?, TRUNC(SYSDATE)), ?, ?, ?, NVL(?, 'ACTIVA'))
                """,
                r.codigoTarifa(), r.nombre(), r.descripcion(), r.tipoProducto(), r.monto(), r.tipoPasajero(),
                r.fechaInicioVigencia(), r.fechaFinVigencia(), r.cantidadMaxViajes(), r.duracionDias(), r.estado());
    }

    /** Si cambia el monto, el trigger TRG_TARIFA_HISTORIAL guarda el precio anterior. */
    public void actualizarTarifa(String codigo, TarifaRequest r) {
        actualizarUno("""
                UPDATE TARIFA
                   SET nombre = ?, descripcion = ?, tipo_producto = ?, monto = ?, tipo_pasajero = ?,
                       fecha_inicio_vigencia = NVL(?, fecha_inicio_vigencia), fecha_fin_vigencia = ?,
                       cantidad_max_viajes = ?, duracion_dias = ?, estado = NVL(?, estado)
                 WHERE codigo_tarifa = ?
                """, "No existe la tarifa " + codigo,
                r.nombre(), r.descripcion(), r.tipoProducto(), r.monto(), r.tipoPasajero(),
                r.fechaInicioVigencia(), r.fechaFinVigencia(), r.cantidadMaxViajes(), r.duracionDias(),
                r.estado(), codigo);
    }

    public void cambiarEstadoTarifa(String codigo, String estado) {
        actualizarUno("UPDATE TARIFA SET estado = ? WHERE codigo_tarifa = ?", "No existe la tarifa " + codigo, estado, codigo);
    }

    public List<Map<String, Object>> historialTarifa(String codigo) {
        return listar("SELECT * FROM HISTORIAL_TARIFA WHERE codigo_tarifa = ? ORDER BY fecha_cambio DESC", codigo);
    }
}

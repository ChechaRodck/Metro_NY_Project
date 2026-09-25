package com.metrony.repository;

import com.metrony.dto.Peticiones.TrenRequest;
import com.metrony.dto.Peticiones.VagonRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Modulo 3: trenes, vagones y su composicion.
 */
@Repository
public class TrenRepository extends BaseRepository {

    public TrenRepository(JdbcTemplate jdbc) {
        super(jdbc);
    }

    public List<Map<String, Object>> listarTrenes(String estado) {
        return listar("""
                SELECT t.*, m.nombre_modelo AS modelo, m.fabricante, d.nombre AS deposito,
                       (SELECT COUNT(*) FROM TREN_VAGON tv
                         WHERE tv.codigo_tren = t.codigo_tren AND tv.fecha_fin IS NULL) AS vagones
                  FROM TREN t
                  JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
                  JOIN DEPOSITO d ON d.id_deposito = t.id_deposito
                 WHERE (? IS NULL OR t.estado_operativo = ?)
                 ORDER BY t.codigo_tren
                """, estado, estado);
    }

    public Map<String, Object> buscarTren(String codigo) {
        return buscarUno("""
                SELECT t.*, m.nombre_modelo AS modelo, m.fabricante, d.nombre AS deposito,
                       FN_TREN_DISPONIBLE(t.codigo_tren) AS disponible_ahora
                  FROM TREN t
                  JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
                  JOIN DEPOSITO d ON d.id_deposito = t.id_deposito
                 WHERE t.codigo_tren = ?
                """, "No existe el tren " + codigo, codigo);
    }

    public void crearTren(TrenRequest r) {
        ejecutar("""
                INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo,
                                  kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
                VALUES (?, ?, ?, ?, 'DISPONIBLE', NVL(?, 0), ?, ?, ?)
                """,
                r.codigoTren(), r.idModelo(), r.anioFabricacion(), r.capacidadTotal(), r.kilometrajeKm(),
                r.idDeposito(), r.fechaUltimaInspeccion(), r.fechaProximaInspeccion());
    }

    public void actualizarTren(String codigo, TrenRequest r) {
        actualizarUno("""
                UPDATE TREN
                   SET id_modelo = ?, anio_fabricacion = ?, capacidad_total = ?,
                       kilometraje_km = NVL(?, kilometraje_km), id_deposito = ?,
                       fecha_ultima_inspeccion = ?, fecha_proxima_inspeccion = ?
                 WHERE codigo_tren = ?
                """, "No existe el tren " + codigo,
                r.idModelo(), r.anioFabricacion(), r.capacidadTotal(), r.kilometrajeKm(), r.idDeposito(),
                r.fechaUltimaInspeccion(), r.fechaProximaInspeccion(), codigo);
    }

    public void cambiarEstadoTren(String codigo, String estado) {
        llamar("SP_CAMBIAR_ESTADO_TREN", codigo, estado);
    }

    public List<Map<String, Object>> trenesDisponibles() {
        return listar("SELECT * FROM VW_TRENES_DISPONIBLES ORDER BY codigo_tren");
    }

    public List<Map<String, Object>> trenesEnMantenimiento() {
        return listar("SELECT * FROM VW_TRENES_MANTENIMIENTO ORDER BY codigo_tren");
    }

    public List<Map<String, Object>> viajesDelTren(String codigo) {
        return listar("""
                SELECT v.numero_viaje, r.codigo_ruta, v.salida_programada, v.llegada_programada,
                       v.estado_viaje, v.id_conductor
                  FROM VIAJE_PROGRAMADO v
                  JOIN RUTA r ON r.id_ruta = v.id_ruta
                 WHERE v.codigo_tren = ?
                 ORDER BY v.salida_programada DESC
                 FETCH FIRST 50 ROWS ONLY
                """, codigo);
    }

    // ------------------------- COMPOSICION -------------------------

    /** Vagones actuales del tren (fecha_fin nula). */
    public List<Map<String, Object>> vagonesDelTren(String codigo) {
        return listar("""
                SELECT tv.posicion, v.numero_serie, v.tipo_vagon, v.capacidad_sentados, v.capacidad_pie,
                       v.estado, v.accesible, tv.fecha_inicio
                  FROM TREN_VAGON tv
                  JOIN VAGON v ON v.numero_serie = tv.numero_serie
                 WHERE tv.codigo_tren = ? AND tv.fecha_fin IS NULL
                 ORDER BY tv.posicion
                """, codigo);
    }

    /** Historial completo de composicion (incluye vagones que ya salieron). */
    public List<Map<String, Object>> historialComposicion(String codigo) {
        return listar("""
                SELECT tv.id_composicion, tv.numero_serie, tv.posicion, tv.fecha_inicio, tv.fecha_fin
                  FROM TREN_VAGON tv
                 WHERE tv.codigo_tren = ?
                 ORDER BY tv.fecha_inicio DESC, tv.posicion
                """, codigo);
    }

    public void asignarVagon(String codigo, String numeroSerie, Integer posicion, LocalDateTime fecha) {
        llamar("SP_ASIGNAR_VAGON", codigo, numeroSerie, posicion, fecha);
    }

    public void retirarVagon(String codigo, String numeroSerie) {
        llamar("SP_RETIRAR_VAGON", codigo, numeroSerie, null);
    }

    // ------------------------- VAGONES -------------------------

    public List<Map<String, Object>> listarVagones(Boolean soloLibres) {
        return listar("""
                SELECT v.*,
                       (SELECT tv.codigo_tren FROM TREN_VAGON tv
                         WHERE tv.numero_serie = v.numero_serie AND tv.fecha_fin IS NULL) AS tren_actual
                  FROM VAGON v
                 WHERE (? = 'N' OR NOT EXISTS (SELECT 1 FROM TREN_VAGON tv
                                               WHERE tv.numero_serie = v.numero_serie AND tv.fecha_fin IS NULL))
                 ORDER BY v.numero_serie
                """, Boolean.TRUE.equals(soloLibres));
    }

    public void crearVagon(VagonRequest r) {
        ejecutar("""
                INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie,
                                   anio_fabricacion, estado, accesible)
                VALUES (?, ?, ?, ?, ?, 'OPERATIVO', NVL(?, 'N'))
                """,
                r.numeroSerie(), r.tipoVagon(), r.capacidadSentados(), r.capacidadPie(),
                r.anioFabricacion(), r.accesible());
    }

    public void cambiarEstadoVagon(String numeroSerie, String estado) {
        actualizarUno("UPDATE VAGON SET estado = ? WHERE numero_serie = ?",
                "No existe el vagon " + numeroSerie, estado, numeroSerie);
    }

    // ------------------------- CATALOGOS -------------------------

    public List<Map<String, Object>> listarModelos() {
        return listar("SELECT * FROM MODELO_TREN ORDER BY nombre_modelo");
    }

    public List<Map<String, Object>> listarDepositos() {
        return listar("""
                SELECT d.*,
                       (SELECT COUNT(*) FROM TREN t WHERE t.id_deposito = d.id_deposito) AS trenes_asignados
                  FROM DEPOSITO d
                 ORDER BY d.nombre
                """);
    }
}

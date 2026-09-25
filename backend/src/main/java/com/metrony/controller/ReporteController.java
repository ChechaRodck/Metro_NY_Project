package com.metrony.controller;

import com.metrony.repository.ReporteRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Reportes y consultas para el tablero del frontend.
 */
@RestController
@RequestMapping("/api")
public class ReporteController {

    private final ReporteRepository reportes;

    public ReporteController(ReporteRepository reportes) {
        this.reportes = reportes;
    }

    @GetMapping("/reportes/resumen")
    public Map<String, Object> resumen() {
        return reportes.resumen();
    }

    // Consulta 9
    @GetMapping("/reportes/pasajeros-por-linea")
    public List<Map<String, Object>> pasajerosPorLinea(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reportes.pasajerosPorLinea(desde, hasta);
    }

    // Consulta 10
    @GetMapping("/reportes/recaudacion")
    public List<Map<String, Object>> recaudacion(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reportes.recaudacion(desde, hasta);
    }

    @GetMapping("/reportes/ingresos-por-linea")
    public List<Map<String, Object>> ingresosPorLinea(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reportes.ingresosPorLinea(desde, hasta);
    }

    @GetMapping("/reportes/ingresos-estacion/{idEstacion}")
    public Map<String, Object> ingresosEstacion(
            @PathVariable Long idEstacion,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return reportes.ingresosEstacion(idEstacion, desde, hasta);
    }

    // Consulta 11
    @GetMapping("/reportes/estaciones-flujo")
    public List<Map<String, Object>> estacionesFlujo(@RequestParam(defaultValue = "10") int limite) {
        return reportes.estacionesMayorFlujo(limite);
    }

    // Consulta 13
    @GetMapping("/reportes/retrasos-por-linea")
    public List<Map<String, Object>> retrasosPorLinea() {
        return reportes.retrasosPorLinea();
    }

    // Consulta 7
    @GetMapping("/reportes/trenes-inspeccion-vencida")
    public List<Map<String, Object>> trenesInspeccionVencida() {
        return reportes.trenesInspeccionVencida();
    }

    // Consulta 8
    @GetMapping("/reportes/conductores-por-viaje")
    public List<Map<String, Object>> conductoresPorViaje(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return reportes.conductoresPorViaje(fecha);
    }

    // Consulta 14
    @GetMapping("/reportes/tarjetas-bloqueadas")
    public List<Map<String, Object>> tarjetasBloqueadas() {
        return reportes.tarjetasBloqueadasVencidas();
    }

    @GetMapping("/bitacora")
    public List<Map<String, Object>> bitacora(@RequestParam(required = false) String tabla,
                                              @RequestParam(required = false) String tipo,
                                              @RequestParam(defaultValue = "100") int limite) {
        return reportes.bitacora(tabla, tipo, limite);
    }
}

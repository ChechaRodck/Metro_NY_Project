package com.metrony.controller;

import com.metrony.dto.Peticiones.AsignacionRequest;
import com.metrony.dto.Peticiones.CancelarAfectadosRequest;
import com.metrony.dto.Peticiones.CancelarRequest;
import com.metrony.dto.Peticiones.GenerarViajesRequest;
import com.metrony.dto.Peticiones.HoraRealRequest;
import com.metrony.dto.Peticiones.ProgramarViajeRequest;
import com.metrony.dto.Peticiones.ReprogramarRequest;
import com.metrony.repository.ViajeRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/viajes")
public class ViajeController {

    private final ViajeRepository viajes;

    public ViajeController(ViajeRepository viajes) {
        this.viajes = viajes;
    }

    // Consulta 4 (con ?fecha=2026-09-25) y consulta 8 (trae el conductor de cada viaje)
    @GetMapping
    public List<Map<String, Object>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long idRuta,
            @RequestParam(required = false) String idLinea,
            @RequestParam(required = false) String estado) {
        return viajes.listarViajes(fecha, idRuta, idLinea, estado);
    }

    @GetMapping("/{numero}")
    public Map<String, Object> buscar(@PathVariable Long numero) {
        return viajes.buscarViaje(numero);
    }

    // Consulta 5: viajes con retraso mayor a N minutos (por defecto 15)
    @GetMapping("/retrasados")
    public List<Map<String, Object>> retrasados(@RequestParam(defaultValue = "15") Integer minimo) {
        return viajes.viajesRetrasados(minimo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> programar(@Valid @RequestBody ProgramarViajeRequest r) {
        return Map.of("numeroViaje", viajes.programarViaje(r));
    }

    /** Genera todos los viajes de un horario para una fecha. */
    @PostMapping("/generar")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> generar(@Valid @RequestBody GenerarViajesRequest r) {
        return Map.of("viajesGenerados", viajes.generarViajes(r.idHorario(), r.fecha()));
    }

    /** Trenes y conductores que se pueden asignar a este viaje. */
    @GetMapping("/{numero}/opciones-asignacion")
    public Map<String, Object> opciones(@PathVariable Long numero) {
        return viajes.opcionesAsignacion(numero);
    }

    @PutMapping("/{numero}/asignacion")
    public void asignar(@PathVariable Long numero, @RequestBody AsignacionRequest r) {
        viajes.asignarTrenConductor(numero, r.codigoTren(), r.idConductor());
    }

    @PostMapping("/{numero}/cancelar")
    public void cancelar(@PathVariable Long numero, @RequestBody(required = false) CancelarRequest r) {
        viajes.cancelarViaje(numero, r == null ? null : r.motivo());
    }

    @PostMapping("/{numero}/reprogramar")
    public void reprogramar(@PathVariable Long numero, @Valid @RequestBody ReprogramarRequest r) {
        viajes.reprogramarViaje(numero, r.nuevaSalida());
    }

    @PostMapping("/{numero}/iniciar")
    public void iniciar(@PathVariable Long numero, @RequestBody(required = false) HoraRealRequest r) {
        viajes.iniciarViaje(numero, r == null ? null : r.horaReal());
    }

    @PostMapping("/{numero}/finalizar")
    public void finalizar(@PathVariable Long numero, @RequestBody(required = false) HoraRealRequest r) {
        viajes.finalizarViaje(numero, r == null ? null : r.horaReal(), r == null ? null : r.pasajeros());
    }

    @PostMapping("/{numero}/retrasado")
    public void marcarRetrasado(@PathVariable Long numero) {
        viajes.marcarRetrasado(numero);
    }

    /** Cierra una estacion o suspende una ruta y cancela los viajes afectados. */
    @PostMapping("/cancelar-afectados")
    public Map<String, Object> cancelarAfectados(@Valid @RequestBody CancelarAfectadosRequest r) {
        return Map.of("viajesCancelados", viajes.cancelarViajesAfectados(r));
    }
}

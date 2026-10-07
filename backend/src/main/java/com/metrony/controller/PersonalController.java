package com.metrony.controller;

import com.metrony.dto.Peticiones.AusenciaRequest;
import com.metrony.dto.Peticiones.CertificacionRequest;
import com.metrony.dto.Peticiones.EmpleadoRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.SustitucionRequest;
import com.metrony.dto.Peticiones.TurnoRequest;
import com.metrony.repository.PersonalRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PersonalController {

    private final PersonalRepository personal;

    public PersonalController(PersonalRepository personal) {
        this.personal = personal;
    }

    // ------------------------- EMPLEADOS -------------------------

    @GetMapping("/empleados")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String cargo,
                                            @RequestParam(required = false) String estado) {
        return personal.listarEmpleados(cargo, estado);
    }

    @GetMapping("/empleados/{id}")
    public Map<String, Object> buscar(@PathVariable Long id) {
        return personal.buscarEmpleado(id);
    }

    @PostMapping("/empleados")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody EmpleadoRequest r) {
        return Map.of("idEmpleado", personal.crearEmpleado(r));
    }

    @PutMapping("/empleados/{id}")
    public void actualizar(@PathVariable Long id, @Valid @RequestBody EmpleadoRequest r) {
        personal.actualizarEmpleado(id, r);
    }

    @PatchMapping("/empleados/{id}/estado")
    public void cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        personal.cambiarEstadoEmpleado(id, r.estado());
    }

    @GetMapping("/cargos")
    public List<Map<String, Object>> cargos() {
        return personal.listarCargos();
    }

    // ------------------------- CERTIFICACIONES -------------------------

    @GetMapping("/empleados/{id}/certificaciones")
    public List<Map<String, Object>> certificaciones(@PathVariable Long id) {
        return personal.certificacionesDeEmpleado(id);
    }

    @PostMapping("/empleados/{id}/certificaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearCertificacion(@PathVariable Long id, @Valid @RequestBody CertificacionRequest r) {
        return Map.of("idCertificacion", personal.crearCertificacion(id, r));
    }

    @PatchMapping("/certificaciones/{id}/estado")
    public void estadoCertificacion(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        personal.cambiarEstadoCertificacion(id, r.estado());
    }

    @GetMapping("/certificaciones/por-vencer")
    public List<Map<String, Object>> porVencer() {
        return personal.certificacionesPorVencer();
    }

    /** Corre a mano la revision que el backend hace todos los dias en la madrugada. */
    @PostMapping("/certificaciones/revisar-vencimientos")
    public Map<String, Object> revisarVencimientos() {
        return personal.revisarVencimientos();
    }

    // ------------------------- TURNOS -------------------------

    @GetMapping("/turnos")
    public List<Map<String, Object>> turnos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long idEmpleado) {
        return personal.listarTurnos(fecha, idEmpleado);
    }

    @GetMapping("/turnos/sin-cubrir")
    public List<Map<String, Object>> sinCubrir() {
        return personal.turnosSinCubrir();
    }

    @PostMapping("/turnos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> programarTurno(@Valid @RequestBody TurnoRequest r) {
        return Map.of("idTurno", personal.programarTurno(r));
    }

    @PatchMapping("/turnos/{id}/asistencia")
    public void asistencia(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        personal.marcarAsistencia(id, r.estado());
    }

    @PostMapping("/turnos/{id}/sustituir")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> sustituir(@PathVariable Long id, @Valid @RequestBody SustitucionRequest r) {
        return Map.of("idTurnoNuevo", personal.sustituirTurno(id, r.idSustituto()));
    }

    // ------------------------- AUSENCIAS -------------------------

    @GetMapping("/ausencias")
    public List<Map<String, Object>> ausencias(@RequestParam(required = false) Long idEmpleado) {
        return personal.listarAusencias(idEmpleado);
    }

    @PostMapping("/ausencias")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> registrarAusencia(@Valid @RequestBody AusenciaRequest r) {
        return personal.registrarAusencia(r);
    }
}

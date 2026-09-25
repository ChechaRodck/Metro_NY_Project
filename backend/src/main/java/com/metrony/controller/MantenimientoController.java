package com.metrony.controller;

import com.metrony.dto.Peticiones.EquipoRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.HorasTecnicoRequest;
import com.metrony.dto.Peticiones.OrdenRequest;
import com.metrony.dto.Peticiones.RepuestoOrdenRequest;
import com.metrony.dto.Peticiones.RepuestoRequest;
import com.metrony.dto.Peticiones.TecnicoOrdenRequest;
import com.metrony.repository.MantenimientoRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MantenimientoController {

    private final MantenimientoRepository mant;

    public MantenimientoController(MantenimientoRepository mant) {
        this.mant = mant;
    }

    // ------------------------- EQUIPOS -------------------------

    @GetMapping("/equipos")
    public List<Map<String, Object>> equipos(@RequestParam(required = false) String tipo,
                                             @RequestParam(required = false) String estado,
                                             @RequestParam(required = false) Long idEstacion) {
        return mant.listarEquipos(tipo, estado, idEstacion);
    }

    @GetMapping("/equipos/revision-vencida")
    public List<Map<String, Object>> revisionVencida() {
        return mant.equiposConRevisionVencida();
    }

    @GetMapping("/equipos/{id}")
    public Map<String, Object> equipo(@PathVariable String id) {
        return mant.buscarEquipo(id);
    }

    @GetMapping("/equipos/{id}/historial")
    public List<Map<String, Object>> historialEquipo(@PathVariable String id) {
        return mant.historialDeEquipo(id);
    }

    @PostMapping("/equipos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearEquipo(@Valid @RequestBody EquipoRequest r) {
        mant.crearEquipo(r);
        return Map.of("idEquipo", r.idEquipo());
    }

    @PatchMapping("/equipos/{id}/estado")
    public void estadoEquipo(@PathVariable String id, @Valid @RequestBody EstadoRequest r) {
        mant.cambiarEstadoEquipo(id, r.estado());
    }

    // ------------------------- ORDENES -------------------------

    @GetMapping("/ordenes")
    public List<Map<String, Object>> ordenes(@RequestParam(required = false) String estado,
                                             @RequestParam(required = false) String prioridad) {
        return mant.listarOrdenes(estado, prioridad);
    }

    /** Detalle con tecnicos y repuestos (consulta 15 incluida). */
    @GetMapping("/ordenes/{numero}")
    public Map<String, Object> orden(@PathVariable Long numero) {
        return mant.buscarOrden(numero);
    }

    @PostMapping("/ordenes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearOrden(@Valid @RequestBody OrdenRequest r) {
        return Map.of("numeroOrden", mant.crearOrden(r));
    }

    /** PROGRAMADA, EN_EJECUCION, SUSPENDIDA, COMPLETADA o CANCELADA. */
    @PatchMapping("/ordenes/{numero}/estado")
    public void estadoOrden(@PathVariable Long numero, @Valid @RequestBody EstadoRequest r) {
        mant.cambiarEstadoOrden(numero, r.estado());
    }

    // Consulta 15: tecnicos que participaron en una orden
    @GetMapping("/ordenes/{numero}/tecnicos")
    public List<Map<String, Object>> tecnicos(@PathVariable Long numero) {
        return mant.tecnicosDeOrden(numero);
    }

    @PostMapping("/ordenes/{numero}/tecnicos")
    @ResponseStatus(HttpStatus.CREATED)
    public void asignarTecnico(@PathVariable Long numero, @Valid @RequestBody TecnicoOrdenRequest r) {
        mant.asignarTecnico(numero, r.idEmpleado(), r.rol());
    }

    @PatchMapping("/ordenes/{numero}/tecnicos/{idEmpleado}/horas")
    public void registrarHoras(@PathVariable Long numero, @PathVariable Long idEmpleado,
                               @Valid @RequestBody HorasTecnicoRequest r) {
        mant.registrarHoras(numero, idEmpleado, r.horas());
    }

    @GetMapping("/ordenes/{numero}/repuestos")
    public List<Map<String, Object>> repuestosOrden(@PathVariable Long numero) {
        return mant.repuestosDeOrden(numero);
    }

    @PostMapping("/ordenes/{numero}/repuestos")
    @ResponseStatus(HttpStatus.CREATED)
    public void registrarRepuesto(@PathVariable Long numero, @Valid @RequestBody RepuestoOrdenRequest r) {
        mant.registrarRepuesto(numero, r.idRepuesto(), r.cantidad());
    }

    // ------------------------- REPUESTOS -------------------------

    @GetMapping("/repuestos")
    public List<Map<String, Object>> repuestos() {
        return mant.listarRepuestos();
    }

    @PostMapping("/repuestos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearRepuesto(@Valid @RequestBody RepuestoRequest r) {
        return Map.of("idRepuesto", mant.crearRepuesto(r));
    }

    @PostMapping("/repuestos/{id}/stock")
    public void agregarStock(@PathVariable Long id, @RequestParam @Positive Integer cantidad) {
        mant.agregarStock(id, cantidad);
    }
}

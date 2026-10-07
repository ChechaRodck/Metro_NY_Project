package com.metrony.controller;

import com.metrony.dto.Peticiones.AccionRequest;
import com.metrony.dto.Peticiones.CerrarIncidenteRequest;
import com.metrony.dto.Peticiones.ElementoRequest;
import com.metrony.dto.Peticiones.IncidenteRequest;
import com.metrony.repository.IncidenteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidentes")
public class IncidenteController {

    private final IncidenteRepository incidentes;

    public IncidenteController(IncidenteRepository incidentes) {
        this.incidentes = incidentes;
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(required = false) String estado,
                                            @RequestParam(required = false) String severidad,
                                            @RequestParam(required = false) String tipo) {
        return incidentes.listarIncidentes(estado, severidad, tipo);
    }

    // Consulta 12: incidentes abiertos
    @GetMapping("/abiertos")
    public List<Map<String, Object>> abiertos() {
        return incidentes.incidentesAbiertos();
    }

    @GetMapping("/criticos")
    public List<Map<String, Object>> criticos() {
        return incidentes.listarIncidentes(null, "CRITICO", null);
    }

    @GetMapping("/estadisticas")
    public List<Map<String, Object>> estadisticas() {
        return incidentes.estadisticas();
    }

    @GetMapping("/{numero}")
    public Map<String, Object> buscar(@PathVariable Long numero) {
        return incidentes.buscarIncidente(numero);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> registrar(@Valid @RequestBody IncidenteRequest r) {
        return Map.of("numeroIncidente", incidentes.registrarIncidente(r));
    }

    @GetMapping("/{numero}/elementos")
    public List<Map<String, Object>> elementos(@PathVariable Long numero) {
        return incidentes.elementosDeIncidente(numero);
    }

    @PostMapping("/{numero}/elementos")
    @ResponseStatus(HttpStatus.CREATED)
    public void agregarElemento(@PathVariable Long numero, @Valid @RequestBody ElementoRequest r) {
        incidentes.agregarElemento(numero, r);
    }

    @PostMapping("/{numero}/acciones")
    public void registrarAccion(@PathVariable Long numero, @Valid @RequestBody AccionRequest r) {
        incidentes.registrarAccion(numero, r.accion());
    }

    @PatchMapping("/{numero}/severidad")
    public void severidad(@PathVariable Long numero, @RequestParam String valor) {
        incidentes.cambiarSeveridad(numero, valor);
    }

    @PostMapping("/{numero}/cerrar")
    public void cerrar(@PathVariable Long numero, @RequestBody(required = false) CerrarIncidenteRequest r) {
        incidentes.cerrarIncidente(numero, r);
    }
}

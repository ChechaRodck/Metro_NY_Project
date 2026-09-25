package com.metrony.controller;

import com.metrony.dto.Peticiones.EstacionLineaRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.LineaRequest;
import com.metrony.repository.RedRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lineas")
public class LineaController {

    private final RedRepository red;

    public LineaController(RedRepository red) {
        this.red = red;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return red.listarLineas();
    }

    @GetMapping("/{id}")
    public Map<String, Object> buscar(@PathVariable String id) {
        return red.buscarLinea(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody LineaRequest r) {
        red.crearLinea(r);
        return Map.of("idLinea", r.idLinea());
    }

    @PutMapping("/{id}")
    public void actualizar(@PathVariable String id, @Valid @RequestBody LineaRequest r) {
        red.actualizarLinea(id, r);
    }

    @PatchMapping("/{id}/estado")
    public void cambiarEstado(@PathVariable String id, @Valid @RequestBody EstadoRequest r) {
        red.cambiarEstadoLinea(id, r.estado());
    }

    /** Desactiva la linea con sus rutas y cancela los viajes futuros. */
    @PostMapping("/{id}/desactivar")
    public Map<String, Object> desactivar(@PathVariable String id) {
        return red.desactivarLinea(id);
    }

    @GetMapping("/{id}/estaciones")
    public List<Map<String, Object>> estaciones(@PathVariable String id) {
        return red.estacionesDeLinea(id);
    }

    @PostMapping("/{id}/estaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public void agregarEstacion(@PathVariable String id, @Valid @RequestBody EstacionLineaRequest r) {
        red.agregarEstacionALinea(id, r);
    }

    @DeleteMapping("/{id}/estaciones/{idEstacion}")
    public void quitarEstacion(@PathVariable String id, @PathVariable Long idEstacion) {
        red.quitarEstacionDeLinea(id, idEstacion);
    }
}

package com.metrony.controller;

import com.metrony.dto.Peticiones.AsignarVagonRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.TrenRequest;
import com.metrony.dto.Peticiones.VagonRequest;
import com.metrony.repository.TrenRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TrenController {

    private final TrenRepository trenes;

    public TrenController(TrenRepository trenes) {
        this.trenes = trenes;
    }

    @GetMapping("/trenes")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String estado) {
        return trenes.listarTrenes(estado);
    }

    // Consulta 6: trenes disponibles
    @GetMapping("/trenes/disponibles")
    public List<Map<String, Object>> disponibles() {
        return trenes.trenesDisponibles();
    }

    @GetMapping("/trenes/mantenimiento")
    public List<Map<String, Object>> enMantenimiento() {
        return trenes.trenesEnMantenimiento();
    }

    @GetMapping("/trenes/{codigo}")
    public Map<String, Object> buscar(@PathVariable String codigo) {
        return trenes.buscarTren(codigo);
    }

    @PostMapping("/trenes")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody TrenRequest r) {
        trenes.crearTren(r);
        return Map.of("codigoTren", r.codigoTren());
    }

    @PutMapping("/trenes/{codigo}")
    public void actualizar(@PathVariable String codigo, @Valid @RequestBody TrenRequest r) {
        trenes.actualizarTren(codigo, r);
    }

    @PatchMapping("/trenes/{codigo}/estado")
    public void cambiarEstado(@PathVariable String codigo, @Valid @RequestBody EstadoRequest r) {
        trenes.cambiarEstadoTren(codigo, r.estado());
    }

    @GetMapping("/trenes/{codigo}/viajes")
    public List<Map<String, Object>> viajes(@PathVariable String codigo) {
        return trenes.viajesDelTren(codigo);
    }

    @GetMapping("/trenes/{codigo}/vagones")
    public List<Map<String, Object>> vagones(@PathVariable String codigo) {
        return trenes.vagonesDelTren(codigo);
    }

    @GetMapping("/trenes/{codigo}/historial-composicion")
    public List<Map<String, Object>> historial(@PathVariable String codigo) {
        return trenes.historialComposicion(codigo);
    }

    @PostMapping("/trenes/{codigo}/vagones")
    @ResponseStatus(HttpStatus.CREATED)
    public void asignarVagon(@PathVariable String codigo, @Valid @RequestBody AsignarVagonRequest r) {
        trenes.asignarVagon(codigo, r.numeroSerie(), r.posicion(), r.fecha());
    }

    @DeleteMapping("/trenes/{codigo}/vagones/{numeroSerie}")
    public void retirarVagon(@PathVariable String codigo, @PathVariable String numeroSerie) {
        trenes.retirarVagon(codigo, numeroSerie);
    }

    // ------------------------- VAGONES -------------------------

    @GetMapping("/vagones")
    public List<Map<String, Object>> listarVagones(@RequestParam(defaultValue = "false") Boolean libres) {
        return trenes.listarVagones(libres);
    }

    @PostMapping("/vagones")
    @ResponseStatus(HttpStatus.CREATED)
    public void crearVagon(@Valid @RequestBody VagonRequest r) {
        trenes.crearVagon(r);
    }

    @PatchMapping("/vagones/{numeroSerie}/estado")
    public void estadoVagon(@PathVariable String numeroSerie, @Valid @RequestBody EstadoRequest r) {
        trenes.cambiarEstadoVagon(numeroSerie, r.estado());
    }

    // ------------------------- CATALOGOS -------------------------

    @GetMapping("/modelos")
    public List<Map<String, Object>> modelos() {
        return trenes.listarModelos();
    }

    @GetMapping("/depositos")
    public List<Map<String, Object>> depositos() {
        return trenes.listarDepositos();
    }
}

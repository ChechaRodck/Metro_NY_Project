package com.metrony.controller;

import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.TarifaRequest;
import com.metrony.repository.PasajeroRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarifas")
public class TarifaController {

    private final PasajeroRepository repo;

    public TarifaController(PasajeroRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(defaultValue = "false") Boolean activas) {
        return repo.listarTarifas(activas);
    }

    @GetMapping("/{codigo}")
    public Map<String, Object> buscar(@PathVariable String codigo) {
        return repo.buscarTarifa(codigo);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody TarifaRequest r) {
        repo.crearTarifa(r);
        return Map.of("codigoTarifa", r.codigoTarifa());
    }

    /** Si se cambia el monto, queda guardado el precio anterior en el historial. */
    @PutMapping("/{codigo}")
    public void actualizar(@PathVariable String codigo, @Valid @RequestBody TarifaRequest r) {
        repo.actualizarTarifa(codigo, r);
    }

    @PatchMapping("/{codigo}/estado")
    public void cambiarEstado(@PathVariable String codigo, @Valid @RequestBody EstadoRequest r) {
        repo.cambiarEstadoTarifa(codigo, r.estado());
    }

    @GetMapping("/{codigo}/historial")
    public List<Map<String, Object>> historial(@PathVariable String codigo) {
        return repo.historialTarifa(codigo);
    }
}

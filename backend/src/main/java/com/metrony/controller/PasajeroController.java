package com.metrony.controller;

import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.PasajeroRequest;
import com.metrony.dto.OperationalResponses.CardSummaryResponse;
import com.metrony.repository.PasajeroRepository;
import com.metrony.service.OperationalQueryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pasajeros")
public class PasajeroController {

    private final PasajeroRepository pasajeros;
    private final OperationalQueryService queries;

    public PasajeroController(PasajeroRepository pasajeros, OperationalQueryService queries) {
        this.pasajeros = pasajeros;
        this.queries = queries;
    }

    @GetMapping
    public List<Map<String, Object>> listar(@RequestParam(required = false) String buscar) {
        return pasajeros.listarPasajeros(buscar);
    }

    @GetMapping("/{id}")
    public Map<String, Object> buscar(@PathVariable Long id) {
        return pasajeros.buscarPasajero(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody PasajeroRequest r) {
        return Map.of("idPasajero", pasajeros.crearPasajero(r));
    }

    @PutMapping("/{id}")
    public void actualizar(@PathVariable Long id, @Valid @RequestBody PasajeroRequest r) {
        pasajeros.actualizarPasajero(id, r);
    }

    @PatchMapping("/{id}/estado")
    public void cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        pasajeros.cambiarEstadoPasajero(id, r.estado());
    }

    @GetMapping("/{id}/tarjetas")
    public List<CardSummaryResponse> tarjetas(@PathVariable Long id) {
        return queries.cardsForPassenger(id);
    }
}

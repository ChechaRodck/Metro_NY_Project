package com.metrony.controller;

import com.metrony.dto.Peticiones.AccesoRequest;
import com.metrony.dto.Peticiones.BoletoRequest;
import com.metrony.dto.Peticiones.EmitirTarjetaRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.RecargaRequest;
import com.metrony.repository.PasajeroRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Tarjetas, recargas y accesos (lo que harian los torniquetes y las maquinas).
 */
@RestController
@RequestMapping("/api")
public class TarjetaController {

    private final PasajeroRepository repo;

    public TarjetaController(PasajeroRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/tarjetas")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> emitir(@Valid @RequestBody EmitirTarjetaRequest r) {
        return Map.of("numeroTarjeta", repo.emitirTarjeta(r));
    }

    @GetMapping("/tarjetas/{numero}")
    public Map<String, Object> buscar(@PathVariable Long numero) {
        return repo.buscarTarjeta(numero);
    }

    @GetMapping("/tarjetas/{numero}/saldo")
    public Map<String, Object> saldo(@PathVariable Long numero) {
        return repo.saldo(numero);
    }

    @PostMapping("/tarjetas/{numero}/recargas")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> recargar(@PathVariable Long numero, @Valid @RequestBody RecargaRequest r) {
        return repo.recargar(numero, r);
    }

    @GetMapping("/tarjetas/{numero}/recargas")
    public List<Map<String, Object>> recargas(@PathVariable Long numero) {
        return repo.recargasDeTarjeta(numero);
    }

    @GetMapping("/tarjetas/{numero}/viajes")
    public List<Map<String, Object>> viajes(@PathVariable Long numero) {
        return repo.viajesDeTarjeta(numero);
    }

    /** Bloquear, reportar perdida, cancelar o reactivar. */
    @PatchMapping("/tarjetas/{numero}/estado")
    public void cambiarEstado(@PathVariable Long numero, @Valid @RequestBody EstadoRequest r) {
        repo.cambiarEstadoTarjeta(numero, r.estado());
    }

    // Consulta 14 (version ampliada: tambien las que no tienen saldo para un viaje)
    @GetMapping("/tarjetas/alertas")
    public List<Map<String, Object>> alertas() {
        return repo.tarjetasConAlerta();
    }

    // ------------------------- ACCESOS -------------------------

    @PostMapping("/accesos/ingreso")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> ingreso(@Valid @RequestBody AccesoRequest r) {
        return repo.registrarIngreso(r.numeroTarjeta(), r.idEstacion());
    }

    @PostMapping("/accesos/salida")
    public Map<String, Object> salida(@Valid @RequestBody AccesoRequest r) {
        return repo.registrarSalida(r.numeroTarjeta(), r.idEstacion());
    }

    /** Viaje con boleto (sin tarjeta). */
    @PostMapping("/accesos/boleto")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> boleto(@Valid @RequestBody BoletoRequest r) {
        return repo.registrarViajeAnonimo(r.idEstacion(), r.codigoTarifa());
    }
}

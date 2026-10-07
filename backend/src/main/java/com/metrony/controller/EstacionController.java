package com.metrony.controller;

import com.metrony.dto.Peticiones.EstacionRequest;
import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.PlataformaRequest;
import com.metrony.dto.Peticiones.ServicioEstacionRequest;
import com.metrony.dto.Peticiones.TransferenciaRequest;
import com.metrony.repository.RedRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EstacionController {

    private final RedRepository red;

    public EstacionController(RedRepository red) {
        this.red = red;
    }

    // ------------------------- ESTACIONES -------------------------

    @GetMapping("/estaciones")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String distrito,
                                            @RequestParam(required = false) String estado) {
        return red.listarEstaciones(distrito, estado);
    }

    @GetMapping("/estaciones/{id}")
    public Map<String, Object> buscar(@PathVariable Long id) {
        return red.buscarEstacion(id);
    }

    @PostMapping("/estaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody EstacionRequest r) {
        return Map.of("idEstacion", red.crearEstacion(r));
    }

    @PutMapping("/estaciones/{id}")
    public void actualizar(@PathVariable Long id, @Valid @RequestBody EstacionRequest r) {
        red.actualizarEstacion(id, r);
    }

    @PatchMapping("/estaciones/{id}/estado")
    public void cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        red.cambiarEstadoEstacion(id, r.estado());
    }

    // Consulta 1: lineas que pasan por una estacion
    @GetMapping("/estaciones/{id}/lineas")
    public List<Map<String, Object>> lineas(@PathVariable Long id) {
        return red.lineasDeEstacion(id);
    }

    @GetMapping("/estaciones/{id}/proximas-salidas")
    public List<Map<String, Object>> proximasSalidas(@PathVariable Long id,
                                                     @RequestParam(defaultValue = "10") int limite) {
        return red.proximasSalidas(id, limite);
    }

    // ------------------------- PLATAFORMAS -------------------------

    @GetMapping("/estaciones/{id}/plataformas")
    public List<Map<String, Object>> plataformas(@PathVariable Long id) {
        return red.plataformasDeEstacion(id);
    }

    @PostMapping("/estaciones/{id}/plataformas")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearPlataforma(@PathVariable Long id, @Valid @RequestBody PlataformaRequest r) {
        return Map.of("idPlataforma", red.crearPlataforma(id, r));
    }

    @PatchMapping("/plataformas/{id}/estado")
    public void estadoPlataforma(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        red.cambiarEstadoPlataforma(id, r.estado());
    }

    // ------------------------- SERVICIOS -------------------------

    @GetMapping("/servicios")
    public List<Map<String, Object>> servicios() {
        return red.listarServicios();
    }

    @GetMapping("/estaciones/{id}/servicios")
    public List<Map<String, Object>> serviciosEstacion(@PathVariable Long id) {
        return red.serviciosDeEstacion(id);
    }

    @PostMapping("/estaciones/{id}/servicios")
    @ResponseStatus(HttpStatus.CREATED)
    public void agregarServicio(@PathVariable Long id, @Valid @RequestBody ServicioEstacionRequest r) {
        red.agregarServicio(id, r);
    }

    @DeleteMapping("/estaciones/{id}/servicios/{idServicio}")
    public void quitarServicio(@PathVariable Long id, @PathVariable Long idServicio) {
        red.quitarServicio(id, idServicio);
    }

    /** Elevadores y escaleras operativos por estacion. */
    @GetMapping("/estaciones/accesibilidad")
    public List<Map<String, Object>> accesibilidad() {
        return red.equiposDeEstacion();
    }

    // ------------------------- TRANSFERENCIAS -------------------------

    // Consulta 3: estaciones que permiten transferencia
    @GetMapping("/transferencias")
    public List<Map<String, Object>> transferencias(@RequestParam(required = false) Long idEstacion) {
        return red.listarTransferencias(idEstacion);
    }

    @PostMapping("/transferencias")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearTransferencia(@Valid @RequestBody TransferenciaRequest r) {
        return Map.of("idTransferencia", red.registrarTransferencia(r));
    }

    @DeleteMapping("/transferencias/{id}")
    public void eliminarTransferencia(@PathVariable Long id) {
        red.eliminarTransferencia(id);
    }
}

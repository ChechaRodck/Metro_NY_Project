package com.metrony.controller;

import com.metrony.dto.Peticiones.EstadoRequest;
import com.metrony.dto.Peticiones.HorarioRequest;
import com.metrony.dto.Peticiones.ParadaRequest;
import com.metrony.dto.Peticiones.RutaRequest;
import com.metrony.repository.RutaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RutaController {

    private final RutaRepository rutas;

    public RutaController(RutaRepository rutas) {
        this.rutas = rutas;
    }

    @GetMapping("/rutas")
    public List<Map<String, Object>> listar(@RequestParam(required = false) String idLinea,
                                            @RequestParam(required = false) String estado) {
        return rutas.listarRutas(idLinea, estado);
    }

    @GetMapping("/rutas/{id}")
    public Map<String, Object> buscar(@PathVariable Long id) {
        return rutas.buscarRuta(id);
    }

    @PostMapping("/rutas")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody RutaRequest r) {
        return Map.of("idRuta", rutas.crearRuta(r));
    }

    @PutMapping("/rutas/{id}")
    public void actualizar(@PathVariable Long id, @Valid @RequestBody RutaRequest r) {
        rutas.actualizarRuta(id, r);
    }

    @PatchMapping("/rutas/{id}/estado")
    public void cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        rutas.cambiarEstadoRuta(id, r.estado());
    }

    /** Rutas suspendidas/modificadas o que pasan por estaciones cerradas. */
    @GetMapping("/rutas/afectadas")
    public List<Map<String, Object>> afectadas() {
        return rutas.rutasAfectadas();
    }

    // Consulta 2: estaciones de una ruta en orden
    @GetMapping("/rutas/{id}/paradas")
    public List<Map<String, Object>> paradas(@PathVariable Long id) {
        return rutas.paradasDeRuta(id);
    }

    @PostMapping("/rutas/{id}/paradas")
    @ResponseStatus(HttpStatus.CREATED)
    public void agregarParada(@PathVariable Long id, @Valid @RequestBody ParadaRequest r) {
        rutas.agregarParada(id, r);
    }

    @DeleteMapping("/rutas/{id}/paradas/{idEstacion}")
    public void quitarParada(@PathVariable Long id, @PathVariable Long idEstacion) {
        rutas.quitarParada(id, idEstacion);
    }

    // ------------------------- HORARIOS -------------------------

    @GetMapping("/rutas/{id}/horarios")
    public List<Map<String, Object>> horarios(@PathVariable Long id) {
        return rutas.horariosDeRuta(id);
    }

    @PostMapping("/rutas/{id}/horarios")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearHorario(@PathVariable Long id, @Valid @RequestBody HorarioRequest r) {
        return Map.of("idHorario", rutas.crearHorario(id, r));
    }

    @PutMapping("/horarios/{id}")
    public void actualizarHorario(@PathVariable Long id, @Valid @RequestBody HorarioRequest r) {
        rutas.actualizarHorario(id, r);
    }

    @PatchMapping("/horarios/{id}/estado")
    public void estadoHorario(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        rutas.cambiarEstadoHorario(id, r.estado());
    }
}

package com.metrony.security;

import com.metrony.auth.AuthRole;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.Supplier;

@Component
public class EndpointAuthorizationPolicy implements AuthorizationManager<RequestAuthorizationContext> {
    public static final String UNKNOWN_ROUTE = EndpointAuthorizationPolicy.class.getName() + ".unknownRoute";
    private static final Set<AuthRole> ALL = EnumSet.allOf(AuthRole.class);
    private static final Set<AuthRole> A = EnumSet.of(AuthRole.ADMIN);
    private static final Set<AuthRole> AO = EnumSet.of(AuthRole.ADMIN, AuthRole.OPERACIONES);
    private static final Set<AuthRole> AM = EnumSet.of(AuthRole.ADMIN, AuthRole.MANTENIMIENTO);
    private static final Set<AuthRole> AOM = EnumSet.of(AuthRole.ADMIN, AuthRole.OPERACIONES, AuthRole.MANTENIMIENTO);
    private static final Set<AuthRole> AOC = EnumSet.of(AuthRole.ADMIN, AuthRole.OPERACIONES, AuthRole.CONSULTA);
    private final List<EndpointRule> rules = new ArrayList<>();
    private final PathPatternParser parser = new PathPatternParser();

    public EndpointAuthorizationPolicy() { defineBusinessRules(); defineAdministrationRules(); }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        HttpServletRequest request = context.getRequest();
        String method = request.getMethod();
        String path = request.getRequestURI().substring(request.getContextPath().length());
        EndpointRule match = rules.stream().filter(rule -> rule.matches(method, path)).findFirst().orElse(null);
        if (match == null) {
            request.setAttribute(UNKNOWN_ROUTE, true);
            return new AuthorizationDecision(false);
        }
        Authentication current = authentication.get();
        boolean granted = current != null && current.isAuthenticated() && current.getAuthorities().stream()
                .anyMatch(authority -> match.roles().stream()
                        .anyMatch(role -> authority.getAuthority().equals("ROLE_" + role.name())));
        return new AuthorizationDecision(granted);
    }

    public List<EndpointRule> rules() { return List.copyOf(rules); }
    public long existingBusinessRuleCount() { return rules.stream().filter(EndpointRule::existingBusiness).count(); }

    private void defineBusinessRules() {
        // Red: estaciones, plataformas, servicios y transferencias (18).
        get(ALL, "/api/estaciones", "/api/estaciones/{id}", "/api/estaciones/{id}/lineas",
                "/api/estaciones/{id}/proximas-salidas", "/api/estaciones/{id}/plataformas",
                "/api/servicios", "/api/estaciones/{id}/servicios", "/api/estaciones/accesibilidad", "/api/transferencias");
        post(AO, "/api/estaciones", "/api/estaciones/{id}/plataformas", "/api/estaciones/{id}/servicios", "/api/transferencias");
        put(AO, "/api/estaciones/{id}");
        patch(AO, "/api/estaciones/{id}/estado", "/api/plataformas/{id}/estado");
        delete(AO, "/api/estaciones/{id}/servicios/{idServicio}", "/api/transferencias/{id}");

        // Lineas (9).
        get(ALL, "/api/lineas", "/api/lineas/{id}", "/api/lineas/{id}/estaciones");
        post(AO, "/api/lineas", "/api/lineas/{id}/desactivar", "/api/lineas/{id}/estaciones");
        put(AO, "/api/lineas/{id}"); patch(AO, "/api/lineas/{id}/estado");
        delete(AO, "/api/lineas/{id}/estaciones/{idEstacion}");

        // Rutas y horarios (13).
        get(ALL, "/api/rutas/afectadas", "/api/rutas", "/api/rutas/{id}", "/api/rutas/{id}/paradas", "/api/rutas/{id}/horarios");
        post(AO, "/api/rutas", "/api/rutas/{id}/paradas", "/api/rutas/{id}/horarios");
        put(AO, "/api/rutas/{id}", "/api/horarios/{id}");
        patch(AO, "/api/rutas/{id}/estado", "/api/horarios/{id}/estado");
        delete(AO, "/api/rutas/{id}/paradas/{idEstacion}");

        // Viajes: los retrasos son resumen operativo seguro; el resto contiene asignaciones (13).
        get(ALL, "/api/viajes/retrasados");
        get(AO, "/api/viajes", "/api/viajes/{numero}", "/api/viajes/{numero}/opciones-asignacion");
        post(AO, "/api/viajes", "/api/viajes/generar", "/api/viajes/{numero}/cancelar",
                "/api/viajes/{numero}/reprogramar", "/api/viajes/{numero}/iniciar",
                "/api/viajes/{numero}/finalizar", "/api/viajes/{numero}/retrasado", "/api/viajes/cancelar-afectados");
        put(AO, "/api/viajes/{numero}/asignacion");

        // Material rodante (17).
        get(ALL, "/api/trenes", "/api/trenes/disponibles", "/api/trenes/mantenimiento", "/api/trenes/{codigo}",
                "/api/trenes/{codigo}/vagones", "/api/trenes/{codigo}/historial-composicion",
                "/api/vagones", "/api/modelos", "/api/depositos");
        get(AO, "/api/trenes/{codigo}/viajes");
        post(AM, "/api/trenes", "/api/trenes/{codigo}/vagones", "/api/vagones");
        put(AM, "/api/trenes/{codigo}");
        patch(AM, "/api/trenes/{codigo}/estado", "/api/vagones/{numeroSerie}/estado");
        delete(AM, "/api/trenes/{codigo}/vagones/{numeroSerie}");

        // Personal (18) y pasajeros (6): datos personales solo ADMIN.
        get(A, "/api/empleados", "/api/empleados/{id}", "/api/cargos", "/api/empleados/{id}/certificaciones",
                "/api/certificaciones/por-vencer", "/api/turnos", "/api/turnos/sin-cubrir", "/api/ausencias");
        post(A, "/api/empleados", "/api/empleados/{id}/certificaciones", "/api/certificaciones/revisar-vencimientos",
                "/api/turnos", "/api/turnos/{id}/sustituir", "/api/ausencias");
        put(A, "/api/empleados/{id}");
        patch(A, "/api/empleados/{id}/estado", "/api/certificaciones/{id}/estado", "/api/turnos/{id}/asistencia");
        get(A, "/api/pasajeros", "/api/pasajeros/{id}", "/api/pasajeros/{id}/tarjetas");
        post(A, "/api/pasajeros"); put(A, "/api/pasajeros/{id}"); patch(A, "/api/pasajeros/{id}/estado");

        // Tarjetas son datos financieros; los accesos pertenecen a operaciones (11).
        get(A, "/api/tarjetas/alertas", "/api/tarjetas/{numero}", "/api/tarjetas/{numero}/saldo",
                "/api/tarjetas/{numero}/recargas", "/api/tarjetas/{numero}/viajes");
        post(A, "/api/tarjetas", "/api/tarjetas/{numero}/recargas"); patch(A, "/api/tarjetas/{numero}/estado");
        post(AO, "/api/accesos/ingreso", "/api/accesos/salida", "/api/accesos/boleto");

        // Mantenimiento (18); las lecturas con costos, tecnicos o repuestos tambien son restringidas.
        get(ALL, "/api/equipos", "/api/equipos/revision-vencida", "/api/equipos/{id}");
        get(AM, "/api/equipos/{id}/historial", "/api/ordenes", "/api/ordenes/{numero}",
                "/api/ordenes/{numero}/tecnicos", "/api/ordenes/{numero}/repuestos", "/api/repuestos");
        post(AM, "/api/equipos", "/api/ordenes", "/api/ordenes/{numero}/tecnicos",
                "/api/ordenes/{numero}/repuestos", "/api/repuestos", "/api/repuestos/{id}/stock");
        patch(AM, "/api/equipos/{id}/estado", "/api/ordenes/{numero}/estado",
                "/api/ordenes/{numero}/tecnicos/{idEmpleado}/horas");

        // Incidentes: CONSULTA solo recibe listados y resumenes seguros (11).
        get(ALL, "/api/incidentes", "/api/incidentes/criticos", "/api/incidentes/estadisticas");
        get(AOM, "/api/incidentes/abiertos", "/api/incidentes/{numero}", "/api/incidentes/{numero}/elementos");
        post(AOM, "/api/incidentes", "/api/incidentes/{numero}/elementos", "/api/incidentes/{numero}/acciones");
        patch(AO, "/api/incidentes/{numero}/severidad"); post(AO, "/api/incidentes/{numero}/cerrar");

        // Reportes (11).
        get(A, "/api/reportes/resumen", "/api/reportes/recaudacion", "/api/reportes/ingresos-por-linea",
                "/api/reportes/ingresos-estacion/{idEstacion}", "/api/reportes/tarjetas-bloqueadas", "/api/bitacora");
        get(AOC, "/api/reportes/pasajeros-por-linea");
        get(ALL, "/api/reportes/estaciones-flujo", "/api/reportes/retrasos-por-linea", "/api/reportes/trenes-inspeccion-vencida");
        get(AO, "/api/reportes/conductores-por-viaje");

        // Tarifas (6).
        get(ALL, "/api/tarifas", "/api/tarifas/{codigo}", "/api/tarifas/{codigo}/historial");
        post(A, "/api/tarifas"); put(A, "/api/tarifas/{codigo}"); patch(A, "/api/tarifas/{codigo}/estado");
    }

    private void defineAdministrationRules() {
        add(false, HttpMethod.GET, A, "/api/admin/usuarios");
        add(false, HttpMethod.POST, A, "/api/admin/usuarios");
        add(false, HttpMethod.GET, A, "/api/admin/roles");
        add(false, HttpMethod.PATCH, A, "/api/admin/usuarios/{username}/estado");
        add(false, HttpMethod.PUT, A, "/api/admin/usuarios/{username}/roles");
        add(false, HttpMethod.POST, A, "/api/admin/usuarios/{username}/password");
    }

    private void get(Set<AuthRole> roles, String... paths) { addAll(HttpMethod.GET, roles, paths); }
    private void post(Set<AuthRole> roles, String... paths) { addAll(HttpMethod.POST, roles, paths); }
    private void put(Set<AuthRole> roles, String... paths) { addAll(HttpMethod.PUT, roles, paths); }
    private void patch(Set<AuthRole> roles, String... paths) { addAll(HttpMethod.PATCH, roles, paths); }
    private void delete(Set<AuthRole> roles, String... paths) { addAll(HttpMethod.DELETE, roles, paths); }
    private void addAll(HttpMethod method, Set<AuthRole> roles, String... paths) {
        for (String path : paths) add(true, method, roles, path);
    }
    private void add(boolean business, HttpMethod method, Set<AuthRole> roles, String path) {
        rules.add(new EndpointRule(method.name(), path, parser.parse(path), Set.copyOf(roles), business));
    }

    public record EndpointRule(String method, String path, PathPattern pattern,
                               Set<AuthRole> roles, boolean existingBusiness) {
        boolean matches(String candidateMethod, String candidatePath) {
            return method.equals(candidateMethod) && pattern.matches(org.springframework.http.server.PathContainer.parsePath(candidatePath));
        }
    }
}

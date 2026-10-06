package com.metrony.security;

import com.metrony.auth.AuthRole;
import com.metrony.controller.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class EndpointAuthorizationPolicyTest {
    private static final EndpointAuthorizationPolicy POLICY = new EndpointAuthorizationPolicy();
    private static final Class<?>[] BUSINESS_CONTROLLERS = {EstacionController.class, IncidenteController.class,
            LineaController.class, MantenimientoController.class, PasajeroController.class, PersonalController.class,
            ReporteController.class, RutaController.class, TarifaController.class, TarjetaController.class,
            TrenController.class, ViajeController.class};

    static Stream<EndpointAuthorizationPolicy.EndpointRule> businessRules() {
        return POLICY.rules().stream().filter(EndpointAuthorizationPolicy.EndpointRule::existingBusiness);
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("businessRules")
    void eachExistingEndpointAppliesItsExplicitRoleSet(EndpointAuthorizationPolicy.EndpointRule rule) {
        for (AuthRole role : AuthRole.values()) {
            assertThat(decision(rule.method(), samplePath(rule.path()), role))
                    .as("%s %s for %s", rule.method(), rule.path(), role)
                    .isEqualTo(rule.roles().contains(role));
        }
    }

    @Test
    void registryClassifiesExactlyAll151CurrentControllerMappings() {
        Set<String> controllerMappings = mappingsFromControllers();
        Set<String> policyMappings = new HashSet<>();
        POLICY.rules().stream().filter(EndpointAuthorizationPolicy.EndpointRule::existingBusiness)
                .forEach(rule -> policyMappings.add(rule.method() + " " + rule.path()));

        assertThat(POLICY.existingBusinessRuleCount()).isEqualTo(151);
        assertThat(policyMappings).hasSize(151).isEqualTo(controllerMappings);
    }

    @Test
    void administrativeRulesAreAdminOnlyAndUnknownRoutesAreDenied() {
        var adminRules = POLICY.rules().stream().filter(rule -> !rule.existingBusiness()).toList();
        assertThat(adminRules).hasSize(6);
        Set<String> adminMappings = mappingsFromControllers(AdminUserController.class);
        assertThat(adminRules.stream().map(rule -> rule.method() + " " + rule.path()).collect(java.util.stream.Collectors.toSet()))
                .isEqualTo(adminMappings);
        adminRules.forEach(rule -> {
            assertThat(decision(rule.method(), samplePath(rule.path()), AuthRole.ADMIN)).isTrue();
            assertThat(decision(rule.method(), samplePath(rule.path()), AuthRole.OPERACIONES)).isFalse();
        });
        assertThat(decision("GET", "/api/no-clasificada", AuthRole.ADMIN)).isFalse();
    }

    @Test
    void adminIsAuthorizedForEveryRegisteredEndpoint() {
        POLICY.rules().forEach(rule ->
                assertThat(decision(rule.method(), samplePath(rule.path()), AuthRole.ADMIN)).isTrue());
    }

    private boolean decision(String method, String path, AuthRole role) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        var authentication = new UsernamePasswordAuthenticationToken("usuario", "n/a",
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role.name())));
        return POLICY.check(() -> authentication, new RequestAuthorizationContext(request)).isGranted();
    }

    private static String samplePath(String pattern) {
        return pattern.replace("{idServicio}", "2").replace("{idEstacion}", "2")
                .replace("{idEmpleado}", "2").replace("{numeroSerie}", "R160-1")
                .replace("{numero}", "2").replace("{codigo}", "A").replace("{username}", "usuario.demo")
                .replace("{id}", "1");
    }

    private Set<String> mappingsFromControllers() {
        return mappingsFromControllers(BUSINESS_CONTROLLERS);
    }

    private Set<String> mappingsFromControllers(Class<?>... controllers) {
        Set<String> result = new HashSet<>();
        for (Class<?> controller : controllers) {
            RequestMapping classMapping = AnnotatedElementUtils.findMergedAnnotation(controller, RequestMapping.class);
            String base = classMapping == null || classMapping.path().length == 0 ? "" : classMapping.path()[0];
            for (Method method : controller.getDeclaredMethods()) {
                RequestMapping mapping = AnnotatedElementUtils.findMergedAnnotation(method, RequestMapping.class);
                if (mapping == null) continue;
                String suffix = mapping.path().length == 0 ? "" : mapping.path()[0];
                Arrays.stream(mapping.method()).forEach(httpMethod -> result.add(httpMethod.name() + " " + base + suffix));
            }
        }
        return result;
    }
}

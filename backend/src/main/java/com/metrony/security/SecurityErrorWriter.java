package com.metrony.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.metrony.exception.ApiErrorFactory;
import com.metrony.exception.ApiErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class SecurityErrorWriter implements AuthenticationEntryPoint, AccessDeniedHandler {
    private final ObjectMapper objectMapper;

    public SecurityErrorWriter(ObjectMapper objectMapper) { this.objectMapper = objectMapper; }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException exception) throws IOException, ServletException {
        boolean bearerPresented = request.getHeader(HttpHeaders.AUTHORIZATION) != null;
        write(response, HttpStatus.UNAUTHORIZED,
                bearerPresented ? "INVALID_ACCESS_TOKEN" : "AUTHENTICATION_REQUIRED",
                bearerPresented ? "El token de acceso no es valido." : "Se requiere autenticacion.");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException exception) throws IOException, ServletException {
        boolean unknownRoute = Boolean.TRUE.equals(request.getAttribute(EndpointAuthorizationPolicy.UNKNOWN_ROUTE));
        write(response, HttpStatus.FORBIDDEN, unknownRoute ? "ROUTE_DENIED" : "ACCESS_DENIED",
                unknownRoute ? "La ruta solicitada no esta habilitada." : "No tiene permiso para realizar esta operacion.");
    }

    private void write(HttpServletResponse response, HttpStatus status, String code, String message) throws IOException {
        if (response.isCommitted()) return;
        ApiErrorResponse body = ApiErrorFactory.create(status, code, message, Map.of());
        response.setStatus(status.value()); response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(java.nio.charset.StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}

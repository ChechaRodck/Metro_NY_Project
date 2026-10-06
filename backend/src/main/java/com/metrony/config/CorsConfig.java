package com.metrony.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * Permite que el frontend (React en otro puerto) consuma la API.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins}") String configuredOrigins) {
        this.allowedOrigins = parseAllowedOrigins(configuredOrigins);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Accept", "Content-Type")
                .allowCredentials(false)
                .maxAge(3600);
    }

    static List<String> parseAllowedOrigins(String configuredOrigins) {
        if (configuredOrigins == null) {
            throw new IllegalArgumentException("La lista CORS no puede ser nula");
        }

        List<String> origins = Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .distinct()
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalArgumentException("Debe configurarse al menos un origen CORS");
        }
        if (origins.contains("*")) {
            throw new IllegalArgumentException("CORS requiere origenes explicitos; no se admite '*'");
        }
        return origins;
    }
}

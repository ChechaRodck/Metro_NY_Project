package com.metrony.config;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.Scheduled;

import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class ScheduledConfigurationTest {

    @Test
    void scheduledTaskUsesConfiguredTimezone() throws Exception {
        Method method = TareasProgramadas.class.getMethod("revisarVencimientos");
        Scheduled scheduled = method.getAnnotation(Scheduled.class);

        assertThat(scheduled).isNotNull();
        assertThat(scheduled.cron()).isEqualTo("${app.tareas.vencimientos}");
        assertThat(scheduled.zone()).isEqualTo("${app.timezone}");
    }

    @Test
    void propertiesProvideGuatemalaAndLocalDevelopmentDefaults() throws Exception {
        Properties properties = new Properties();
        try (InputStream input = getClass().getResourceAsStream("/application.properties")) {
            assertThat(input).isNotNull();
            properties.load(input);
        }

        assertThat(properties.getProperty("app.timezone"))
                .isEqualTo("${APP_TIMEZONE:America/Guatemala}");
        assertThat(properties.getProperty("app.cors.allowed-origins"))
                .isEqualTo("${CORS_ALLOWED_ORIGINS:http://localhost:5173}");
        assertThat(properties.getProperty("server.error.include-message")).isEqualTo("never");
        assertThat(properties.getProperty("server.error.include-stacktrace")).isEqualTo("never");
        assertThat(properties.getProperty("server.error.include-binding-errors")).isEqualTo("never");
    }
}

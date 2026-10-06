package com.metrony.integration;

import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;

class OracleSecuritySchemaIT {
    @Test void installedSecurityObjectsCompileOnDisposableOracle11g() throws Exception {
        String url = required("ORACLE_IT_URL");
        String username = required("ORACLE_IT_USERNAME");
        String password = required("ORACLE_IT_PASSWORD");
        try (var connection = DriverManager.getConnection(url, username, password)) {
            assertThat(connection.getMetaData().getDatabaseProductName()).containsIgnoringCase("Oracle");
            try (var statement = connection.createStatement();
                 var result = statement.executeQuery("""
                         SELECT COUNT(*) FROM USER_OBJECTS
                          WHERE object_name IN ('ROL','USUARIO','USUARIO_ROL','VW_USUARIOS_ADMIN',
                           'SP_AUTH_BOOTSTRAP_ADMIN','SP_AUTH_CREAR_USUARIO','SP_AUTH_REEMPLAZAR_ROLES',
                           'SP_AUTH_CAMBIAR_ESTADO','SP_AUTH_CAMBIAR_HASH','SP_AUTH_REGISTRAR_FALLO',
                           'SP_AUTH_REGISTRAR_EXITO') AND status = 'VALID'
                         """)) {
                assertThat(result.next()).isTrue();
                assertThat(result.getInt(1)).isEqualTo(11);
            }
            try (var statement = connection.createStatement();
                 var result = statement.executeQuery("SELECT COUNT(*) FROM USER_ERRORS")) {
                assertThat(result.next()).isTrue(); assertThat(result.getInt(1)).isZero();
            }
        }
    }

    private String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException(name + " es obligatorio para -Poracle-it");
        return value;
    }
}

package com.metrony.config;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class DemoBootstrapProcedureContractTest {
    @Test void bootstrapProcedureIsIdempotentAndAssignsTheActiveAdminRole() throws IOException {
        Path backendDirectory = Path.of(System.getProperty("basedir", ".")).toAbsolutePath().normalize();
        Path procedures = backendDirectory.resolve("../database/scripts/04_procedimientos.sql").normalize();
        String script = Files.readString(procedures);
        String procedure = script.substring(script.indexOf("CREATE OR REPLACE PROCEDURE SP_AUTH_BOOTSTRAP_ADMIN"),
                script.indexOf("CREATE OR REPLACE PROCEDURE SP_AUTH_CREAR_USUARIO"));

        assertThat(procedure)
                .contains("WHERE codigo = 'ADMIN' AND estado = 'ACTIVO'")
                .contains("WHERE nombre_usuario = p_nombre_usuario")
                .contains("p_creado := 'N'")
                .contains("INSERT INTO USUARIO_ROL")
                .contains("AND NVL(p_actor, 'BOOTSTRAP') <> 'BOOTSTRAP_DEMO'");
    }
}

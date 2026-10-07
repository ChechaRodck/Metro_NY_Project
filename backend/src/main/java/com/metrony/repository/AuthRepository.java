package com.metrony.repository;

import com.metrony.auth.AuthDtos.AdminUserResponse;
import com.metrony.auth.AuthDtos.RoleResponse;
import com.metrony.auth.AuthRole;
import com.metrony.auth.AuthUser;
import com.metrony.auth.AuthUserState;
import com.metrony.auth.UserStatus;
import com.metrony.exception.NoEncontradoException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.CallableStatement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class AuthRepository {

    private final JdbcTemplate jdbc;

    public AuthRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<AuthUser> findByUsername(String username) {
        List<AuthUser> users = jdbc.query("""
                SELECT id_usuario, nombre_usuario, nombre_mostrar, hash_contrasena, estado,
                       intentos_fallidos, inicio_ventana_fallos, bloqueado_hasta,
                       ultimo_ingreso_exitoso, credenciales_actualizadas_en, version
                  FROM USUARIO WHERE nombre_usuario = ?
                """, (rs, row) -> new AuthUser(
                rs.getLong("id_usuario"), rs.getString("nombre_usuario"), rs.getString("nombre_mostrar"),
                rs.getString("hash_contrasena"), UserStatus.valueOf(rs.getString("estado")),
                rs.getInt("intentos_fallidos"), instant(rs.getTimestamp("inicio_ventana_fallos")),
                instant(rs.getTimestamp("bloqueado_hasta")), instant(rs.getTimestamp("ultimo_ingreso_exitoso")),
                instant(rs.getTimestamp("credenciales_actualizadas_en")), roles(rs.getLong("id_usuario")),
                rs.getLong("version")), username);
        return users.stream().findFirst();
    }

    public Optional<AuthUserState> findStateByUsername(String username) {
        List<AuthUserState> states = jdbc.query("""
                SELECT id_usuario, nombre_usuario, estado, bloqueado_hasta, credenciales_actualizadas_en
                  FROM USUARIO WHERE nombre_usuario = ?
                """, (rs, row) -> new AuthUserState(rs.getString("nombre_usuario"),
                UserStatus.valueOf(rs.getString("estado")), instant(rs.getTimestamp("bloqueado_hasta")),
                instant(rs.getTimestamp("credenciales_actualizadas_en")), roles(rs.getLong("id_usuario"))), username);
        return states.stream().findFirst();
    }

    public long countUsers() {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM USUARIO", Long.class);
        return count == null ? 0 : count;
    }

    public List<AdminUserResponse> listUsers() {
        return jdbc.query("SELECT * FROM VW_USUARIOS_ADMIN ORDER BY nombre_usuario", (rs, row) ->
                mapAdmin(rs.getLong("id_usuario"), rs.getString("nombre_usuario"),
                        rs.getString("nombre_mostrar"), rs.getString("estado"),
                        rs.getInt("intentos_fallidos"), rs.getTimestamp("bloqueado_hasta"),
                        rs.getTimestamp("ultimo_ingreso_exitoso"), rs.getTimestamp("credenciales_actualizadas_en"),
                        rs.getString("roles"), rs.getLong("version")));
    }

    public AdminUserResponse findAdminUser(long id) {
        return jdbc.query("SELECT * FROM VW_USUARIOS_ADMIN WHERE id_usuario = ?", (rs, row) ->
                        mapAdmin(rs.getLong("id_usuario"), rs.getString("nombre_usuario"),
                                rs.getString("nombre_mostrar"), rs.getString("estado"),
                                rs.getInt("intentos_fallidos"), rs.getTimestamp("bloqueado_hasta"),
                                rs.getTimestamp("ultimo_ingreso_exitoso"), rs.getTimestamp("credenciales_actualizadas_en"),
                                rs.getString("roles"), rs.getLong("version")), id).stream().findFirst()
                .orElseThrow(() -> new NoEncontradoException("Usuario no encontrado"));
    }

    public AdminUserResponse findAdminUser(String username) {
        return jdbc.query("SELECT * FROM VW_USUARIOS_ADMIN WHERE nombre_usuario = ?", (rs, row) ->
                        mapAdmin(rs.getLong("id_usuario"), rs.getString("nombre_usuario"),
                                rs.getString("nombre_mostrar"), rs.getString("estado"),
                                rs.getInt("intentos_fallidos"), rs.getTimestamp("bloqueado_hasta"),
                                rs.getTimestamp("ultimo_ingreso_exitoso"), rs.getTimestamp("credenciales_actualizadas_en"),
                                rs.getString("roles"), rs.getLong("version")), username).stream().findFirst()
                .orElseThrow(() -> new NoEncontradoException("Usuario no encontrado"));
    }

    public List<RoleResponse> listRoles() {
        return jdbc.query("SELECT codigo, nombre FROM ROL ORDER BY codigo",
                (rs, row) -> new RoleResponse(rs.getString("codigo"), rs.getString("nombre")));
    }

    public BootstrapResult bootstrapAdmin(String username, String displayName, String hash, String actor) {
        return jdbc.execute((ConnectionCallback<BootstrapResult>) connection -> {
            try (CallableStatement statement = connection.prepareCall("{call SP_AUTH_BOOTSTRAP_ADMIN(?,?,?,?,?,?)}")) {
                statement.setString(1, username); statement.setString(2, displayName);
                statement.setString(3, hash); statement.setString(4, actor);
                statement.registerOutParameter(5, Types.NUMERIC); statement.registerOutParameter(6, Types.CHAR);
                statement.execute();
                return new BootstrapResult(statement.getLong(5), "S".equals(statement.getString(6)));
            }
        });
    }

    public long createUser(String username, String displayName, String hash, String roleCodes, String actor) {
        return jdbc.execute((ConnectionCallback<Long>) connection -> {
            try (CallableStatement statement = connection.prepareCall("{call SP_AUTH_CREAR_USUARIO(?,?,?,?,?,?)}")) {
                statement.setString(1, username); statement.setString(2, displayName);
                statement.setString(3, hash); statement.setString(4, roleCodes); statement.setString(5, actor);
                statement.registerOutParameter(6, Types.NUMERIC); statement.execute();
                return statement.getLong(6);
            }
        });
    }

    public void replaceRoles(String username, Set<AuthRole> roles, String actor) {
        call("{call SP_AUTH_REEMPLAZAR_ROLES(?,?,?)}", statement -> {
            statement.setString(1, username); statement.setString(2, roleCodes(roles)); statement.setString(3, actor);
        });
    }

    public void changeState(String username, UserStatus status, String actor) {
        call("{call SP_AUTH_CAMBIAR_ESTADO(?,?,?)}", statement -> {
            statement.setString(1, username); statement.setString(2, status.name()); statement.setString(3, actor);
        });
    }

    public void changePassword(String username, String hash, String actor) {
        call("{call SP_AUTH_CAMBIAR_HASH(?,?,?)}", statement -> {
            statement.setString(1, username); statement.setString(2, hash); statement.setString(3, actor);
        });
    }

    public Instant registerFailure(long id) {
        return jdbc.execute((ConnectionCallback<Instant>) connection -> {
            try (CallableStatement statement = connection.prepareCall("{call SP_AUTH_REGISTRAR_FALLO(?,?)}")) {
                statement.setLong(1, id); statement.registerOutParameter(2, Types.TIMESTAMP); statement.execute();
                return instant(statement.getTimestamp(2));
            }
        });
    }

    public void registerSuccess(long id) {
        call("{call SP_AUTH_REGISTRAR_EXITO(?)}", statement -> statement.setLong(1, id));
    }

    private Set<AuthRole> roles(long userId) {
        List<String> codes = jdbc.queryForList("""
                SELECT r.codigo FROM ROL r JOIN USUARIO_ROL ur ON ur.id_rol = r.id_rol
                 WHERE ur.id_usuario = ? ORDER BY r.codigo
                """, String.class, userId);
        return codes.stream().map(AuthRole::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(AuthRole.class)));
    }

    private AdminUserResponse mapAdmin(long id, String username, String displayName, String status,
                                       int failedAttempts, Timestamp lockedUntil, Timestamp lastLogin,
                                       Timestamp credentialsUpdated, String roles, long version) {
        Set<AuthRole> parsedRoles = roles == null || roles.isBlank() ? Collections.emptySet()
                : Arrays.stream(roles.split(",")).map(String::trim).map(AuthRole::valueOf)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return new AdminUserResponse(id, username, displayName, UserStatus.valueOf(status), failedAttempts,
                instant(lockedUntil), instant(lastLogin), instant(credentialsUpdated), parsedRoles, version);
    }

    private String roleCodes(Set<AuthRole> roles) {
        return roles.stream().map(Enum::name).sorted().collect(Collectors.joining(","));
    }

    private void call(String sql, StatementConfigurer configurer) {
        jdbc.execute((ConnectionCallback<Void>) connection -> {
            try (CallableStatement statement = connection.prepareCall(sql)) {
                configurer.configure(statement); statement.execute(); return null;
            }
        });
    }

    private static Instant instant(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toLocalDateTime().toInstant(ZoneOffset.UTC);
    }

    @FunctionalInterface
    private interface StatementConfigurer { void configure(CallableStatement statement) throws java.sql.SQLException; }

    public record BootstrapResult(long userId, boolean created) { }
}

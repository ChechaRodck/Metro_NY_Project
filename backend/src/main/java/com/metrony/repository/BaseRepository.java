package com.metrony.repository;

import com.metrony.exception.NoEncontradoException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Date;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Metodos comunes para todos los repositorios.
 * Usamos JdbcTemplate directo porque casi toda la logica esta en los
 * procedimientos almacenados de Oracle.
 */
public abstract class BaseRepository {

    protected final JdbcTemplate jdbc;

    protected BaseRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Ejecuta un SELECT y devuelve las filas con las columnas en camelCase (id_linea -> idLinea). */
    protected List<Map<String, Object>> listar(String sql, Object... params) {
        return jdbc.queryForList(sql, convertir(params)).stream()
                .map(BaseRepository::aCamelCase)
                .toList();
    }

    /** Igual que listar pero espera una sola fila; si no hay, lanza 404. */
    protected Map<String, Object> buscarUno(String sql, String mensajeNoEncontrado, Object... params) {
        List<Map<String, Object>> filas = listar(sql, params);
        if (filas.isEmpty()) {
            throw new NoEncontradoException(mensajeNoEncontrado);
        }
        return filas.get(0);
    }

    /** INSERT / UPDATE / DELETE. Devuelve las filas afectadas. */
    protected int ejecutar(String sql, Object... params) {
        return jdbc.update(sql, convertir(params));
    }

    /** Igual que ejecutar, pero si no afecto ninguna fila lanza 404. */
    protected void actualizarUno(String sql, String mensajeNoEncontrado, Object... params) {
        if (ejecutar(sql, params) == 0) {
            throw new NoEncontradoException(mensajeNoEncontrado);
        }
    }

    /** Para SELECT que devuelven un solo valor (por ejemplo una funcion: SELECT FN_X(?) FROM DUAL). */
    protected Object consultarValor(String sql, Object... params) {
        return jdbc.queryForObject(sql, Object.class, convertir(params));
    }

    protected Long siguienteId(String secuencia) {
        return jdbc.queryForObject("SELECT " + secuencia + ".NEXTVAL FROM DUAL", Long.class);
    }

    /**
     * Llama un procedimiento almacenado.
     * Los parametros de entrada van primero y los de salida al final
     * (asi estan hechos todos los SP del proyecto).
     *
     * @param nombre      nombre del procedimiento
     * @param entradas    valores de entrada en orden (pueden ser null)
     * @param tiposSalida tipos java.sql.Types de los parametros OUT
     * @return valores de los parametros OUT en orden
     */
    protected List<Object> llamarProcedimiento(String nombre, List<Object> entradas, int... tiposSalida) {
        int total = entradas.size() + tiposSalida.length;
        String sql = "{call " + nombre + "(" + String.join(",", Collections.nCopies(total, "?")) + ")}";

        return jdbc.execute((ConnectionCallback<List<Object>>) con -> {
            try (CallableStatement cs = con.prepareCall(sql)) {
                int i = 1;
                for (Object valor : entradas) {
                    asignarParametro(cs, i++, valor);
                }
                for (int tipo : tiposSalida) {
                    cs.registerOutParameter(i++, tipo);
                }
                cs.execute();

                List<Object> salidas = new ArrayList<>();
                for (int j = entradas.size() + 1; j <= total; j++) {
                    salidas.add(cs.getObject(j));
                }
                return salidas;
            }
        });
    }

    /** Atajo para procedimientos sin parametros OUT. */
    protected void llamar(String nombre, Object... entradas) {
        List<Object> lista = new ArrayList<>();
        Collections.addAll(lista, entradas);
        llamarProcedimiento(nombre, lista);
    }

    /** Arma la lista de entradas permitiendo nulls (List.of no acepta null). */
    protected static List<Object> params(Object... valores) {
        List<Object> lista = new ArrayList<>();
        Collections.addAll(lista, valores);
        return lista;
    }

    protected static Long aLong(Object valor) {
        if (valor == null) return null;
        if (valor instanceof Number n) return n.longValue();
        return Long.valueOf(valor.toString());
    }

    protected static BigDecimal aDecimal(Object valor) {
        if (valor == null) return null;
        if (valor instanceof BigDecimal b) return b;
        return new BigDecimal(valor.toString());
    }

    // ----------------- utilidades privadas -----------------

    private static void asignarParametro(CallableStatement cs, int indice, Object valor) throws SQLException {
        if (valor == null) {
            cs.setNull(indice, Types.VARCHAR);
        } else if (valor instanceof LocalDateTime fechaHora) {
            cs.setTimestamp(indice, Timestamp.valueOf(fechaHora));
        } else if (valor instanceof LocalDate fecha) {
            cs.setDate(indice, Date.valueOf(fecha));
        } else if (valor instanceof Boolean b) {
            cs.setString(indice, b ? "S" : "N");
        } else {
            cs.setObject(indice, valor);
        }
    }

    private static Object[] convertir(Object[] params) {
        Object[] resultado = new Object[params.length];
        for (int i = 0; i < params.length; i++) {
            Object p = params[i];
            if (p == null) {
                // null con tipo explicito, si no el driver de Oracle a veces no sabe que tipo es
                resultado[i] = new SqlParameterValue(Types.VARCHAR, null);
            } else if (p instanceof LocalDateTime fechaHora) {
                resultado[i] = Timestamp.valueOf(fechaHora);
            } else if (p instanceof LocalDate fecha) {
                resultado[i] = Date.valueOf(fecha);
            } else if (p instanceof Boolean b) {
                resultado[i] = b ? "S" : "N";
            } else {
                resultado[i] = p;
            }
        }
        return resultado;
    }

    private static Map<String, Object> aCamelCase(Map<String, Object> fila) {
        Map<String, Object> nueva = new LinkedHashMap<>();
        fila.forEach((columna, valor) -> nueva.put(camel(columna), convertirValor(valor)));
        return nueva;
    }

    private static Object convertirValor(Object valor) {
        if (valor instanceof Timestamp ts) return ts.toLocalDateTime();
        if (valor instanceof Date d) return d.toLocalDate();
        return valor;
    }

    private static String camel(String columna) {
        String[] partes = columna.toLowerCase().split("_");
        StringBuilder sb = new StringBuilder(partes[0]);
        for (int i = 1; i < partes.length; i++) {
            if (!partes[i].isEmpty()) {
                sb.append(Character.toUpperCase(partes[i].charAt(0))).append(partes[i].substring(1));
            }
        }
        return sb.toString();
    }
}

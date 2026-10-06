# Scripts canonicos de base de datos

`database/scripts/` es la **unica fuente autoritativa** para el esquema Metro NY.
El archivo `docs/Script_Metro_NY.sql` es una referencia historica deprecada: no
debe ejecutarse ni usarse como base de migraciones.

## Plataforma requerida

- Oracle Database **11g Release 2** u Oracle XE **11.2**.
- SQL*Plus o SQL Developer con ejecucion de script (F5).
- Los scripts no usan PDB ni `FETCH FIRST`, caracteristicas posteriores a 11g.
- `LISTAGG` se utiliza de forma intencional y requiere Oracle 11g Release 2.

La URL JDBC depende de la configuracion del servidor:

- SID de Oracle XE 11.2: `jdbc:oracle:thin:@localhost:1521:XE`
- Nombre de servicio: `jdbc:oracle:thin:@//localhost:1521/service_name`

Sustituya host, puerto, SID o nombre de servicio segun su entorno. No guarde el
usuario ni la contrasena del esquema en el repositorio.

## Responsabilidades de conexion

1. Un **DBA** conectado como `SYSTEM` u otra cuenta con permisos equivalentes
   ejecuta `00_crear_usuario.sql`. El script solicita de forma interactiva el
   nombre y la contrasena del esquema; no incluye valores predeterminados y
   oculta la contrasena durante la captura.
2. Todas las operaciones restantes se ejecutan conectadas como el **esquema de
   aplicacion** creado en el paso anterior.

## Orden canonico de instalacion

Ejecute cada archivo completo con F5 y detengase ante cualquier error:

1. `00_crear_usuario.sql` como DBA.
2. `01_tablas.sql` como esquema de aplicacion.
3. `02_secuencias.sql` como esquema de aplicacion.
4. `03_funciones.sql` como esquema de aplicacion.
5. `04_procedimientos.sql` como esquema de aplicacion.
6. `05_triggers.sql` como esquema de aplicacion.
7. `06_vistas.sql` como esquema de aplicacion.
8. `07_datos_prueba.sql` **solo en ambientes demo o desechables**.
9. Validar `USER_OBJECTS` y confirmar que no existan objetos invalidos.
10. Ejecutar `09_pruebas.sql`; el archivo termina en `ROLLBACK`.
11. Ejecutar `08_consultas.sql` para verificacion manual.

`ejecutar_todo.sql` automatiza los pasos 2 a 8 para una instalacion demo. No lo
ejecute dos veces sobre el mismo esquema sin una limpieza deliberada.

`99_eliminar_todo.sql` destruye los objetos instalados y se restringe a esquemas
de desarrollo **desechables**. Nunca debe ejecutarse en un entorno compartido o
con datos que deban conservarse.

## Verificacion de objetos

Despues de instalar las vistas, ejecute como esquema de aplicacion:

```sql
SELECT object_type, COUNT(*) AS cantidad,
       SUM(CASE WHEN status = 'INVALID' THEN 1 ELSE 0 END) AS invalidos
  FROM user_objects
 WHERE object_type IN ('TABLE','SEQUENCE','FUNCTION','PROCEDURE','TRIGGER','VIEW')
 GROUP BY object_type
 ORDER BY object_type;
```

La columna `INVALIDOS` debe ser cero para cada tipo. Si no lo es, consulte
`USER_ERRORS` antes de continuar:

```sql
SELECT name, type, line, position, text
  FROM user_errors
 ORDER BY name, sequence;
```

## Prueba de humo en Oracle 11g

Esta es la secuencia pendiente cuando no se dispone de una instancia local:

1. Confirmar `SELECT banner FROM v$version` como DBA y verificar 11g Release 2.
2. Ejecutar `00_crear_usuario.sql` y proporcionar credenciales nuevas en el prompt.
3. Abrir una conexion independiente con el esquema creado.
4. Ejecutar, en orden, `01` a `06`; agregar `07` solo para la prueba demo.
5. Ejecutar las consultas de `USER_OBJECTS` y `USER_ERRORS` anteriores.
6. Ejecutar `09_pruebas.sql`, confirmar solo resultados `OK` o `Error esperado`
   y comprobar que finaliza con `ROLLBACK`.
7. Ejecutar las consultas de `08_consultas.sql`, incluidas las consultas top-N.
8. Configurar las variables del backend, iniciar la API y probar una lectura y
   una operacion transaccional controlada.

## Contenido

| Archivo | Proposito |
|---------|-----------|
| `00_crear_usuario.sql` | Crea el esquema mediante prompts seguros; lo ejecuta el DBA |
| `01_tablas.sql` | Tablas, restricciones e indices |
| `02_secuencias.sql` | Secuencias |
| `03_funciones.sql` | Funciones PL/SQL |
| `04_procedimientos.sql` | Procedimientos PL/SQL |
| `05_triggers.sql` | Triggers |
| `06_vistas.sql` | Vistas |
| `07_datos_prueba.sql` | Datos exclusivamente demo |
| `08_consultas.sql` | Consultas manuales de verificacion |
| `09_pruebas.sql` | Pruebas transaccionales con `ROLLBACK` final |
| `99_eliminar_todo.sql` | Limpieza destructiva para esquemas desechables |

Los procedimientos no hacen `COMMIT`; la transaccion corresponde al cliente que
los invoca. Los codigos `-20xxx` son reglas de negocio internas y el backend los
traduce a codigos de aplicacion seguros sin devolver texto Oracle.

## Regla temporal de fechas

- Las tareas programadas de negocio usan `America/Guatemala`.
- JWT y los instantes reales usaran UTC en una fase posterior.
- El comportamiento actual de Oracle `DATE` y `SYSDATE` permanece como elemento
  pendiente de migracion; esta fase no cambia los tipos de persistencia.

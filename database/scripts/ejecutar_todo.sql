-- =============================================================
-- ejecutar_todo.sql
-- Crea toda la base de una sola vez (conectado como METRO_NY).
-- En SQL Developer: abrir este archivo y darle F5 (Run Script).
-- Tiene que estar en la misma carpeta que los demas scripts.
-- =============================================================

SET DEFINE OFF
SET SERVEROUTPUT ON

PROMPT Creando tablas...
@@01_tablas.sql
PROMPT Creando secuencias...
@@02_secuencias.sql
PROMPT Insertando roles de seguridad...
@@02a_roles_seguridad.sql
PROMPT Creando funciones...
@@03_funciones.sql
PROMPT Creando procedimientos...
@@04_procedimientos.sql
PROMPT Creando triggers...
@@05_triggers.sql
PROMPT Creando vistas...
@@06_vistas.sql
PROMPT Insertando datos de prueba...
@@07_datos_prueba.sql

PROMPT Objetos con errores de compilacion (deberia salir vacio):
SELECT object_type, object_name FROM USER_OBJECTS WHERE status = 'INVALID';

PROMPT Errores de compilacion (deberia salir vacio):
SELECT name, type, line, position, text FROM USER_ERRORS ORDER BY name, sequence;

PROMPT Ejecutando pruebas transaccionales (terminan en ROLLBACK)...
@@09_pruebas.sql
PROMPT Ejecutando consultas de verificacion...
@@08_consultas.sql

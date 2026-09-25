-- =============================================================
-- 99_eliminar_todo.sql
-- Borra TODOS los objetos del esquema METRO_NY para volver a
-- correr los scripts desde cero. Cuidado, no tiene vuelta atras.
-- =============================================================

BEGIN
  FOR o IN (SELECT object_name, object_type
              FROM USER_OBJECTS
             WHERE object_type IN ('VIEW','PROCEDURE','FUNCTION','SEQUENCE')) LOOP
    EXECUTE IMMEDIATE 'DROP ' || o.object_type || ' ' || o.object_name;
  END LOOP;

  FOR t IN (SELECT table_name FROM USER_TABLES) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS PURGE';
  END LOOP;
END;
/

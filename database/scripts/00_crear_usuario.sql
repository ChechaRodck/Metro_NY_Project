-- =============================================================
-- 00_crear_usuario.sql
-- Crea el usuario (esquema) donde vive la base del metro.
-- Oracle 11g Release 2 / XE 11.2: ejecutar una sola vez con SQL*Plus
-- o SQL Developer (F5), conectado como SYSTEM u otro usuario DBA.
-- =============================================================

SET VERIFY OFF

ACCEPT APP_SCHEMA CHAR PROMPT 'Usuario del esquema de aplicacion: '
ACCEPT APP_PASSWORD CHAR PROMPT 'Contrasena del esquema de aplicacion: ' HIDE

-- Si el esquema ya existe y se necesita recrear en un entorno desechable,
-- un DBA debe eliminarlo expresamente antes de ejecutar este archivo.

CREATE USER &APP_SCHEMA IDENTIFIED BY "&APP_PASSWORD"
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

GRANT CREATE SESSION   TO &APP_SCHEMA;
GRANT CREATE TABLE     TO &APP_SCHEMA;
GRANT CREATE VIEW      TO &APP_SCHEMA;
GRANT CREATE SEQUENCE  TO &APP_SCHEMA;
GRANT CREATE PROCEDURE TO &APP_SCHEMA;
GRANT CREATE TRIGGER   TO &APP_SCHEMA;

UNDEFINE APP_PASSWORD
UNDEFINE APP_SCHEMA
SET VERIFY ON

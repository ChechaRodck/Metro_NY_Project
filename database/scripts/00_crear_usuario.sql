-- =============================================================
-- 00_crear_usuario.sql
-- Crea el usuario (esquema) donde va a vivir la base del metro.
-- Se ejecuta UNA sola vez conectado como SYSTEM a la PDB (XEPDB1).
-- =============================================================

-- si ya existe y lo quieren volver a crear desde cero:
-- DROP USER metro_ny CASCADE;

CREATE USER metro_ny IDENTIFIED BY metro123
  DEFAULT TABLESPACE users
  TEMPORARY TABLESPACE temp
  QUOTA UNLIMITED ON users;

GRANT CREATE SESSION   TO metro_ny;
GRANT CREATE TABLE     TO metro_ny;
GRANT CREATE VIEW      TO metro_ny;
GRANT CREATE SEQUENCE  TO metro_ny;
GRANT CREATE PROCEDURE TO metro_ny;
GRANT CREATE TRIGGER   TO metro_ny;

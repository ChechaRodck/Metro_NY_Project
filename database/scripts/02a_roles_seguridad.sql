-- =============================================================
-- 02a_roles_seguridad.sql
-- Catalogo canonico de autorizacion. No crea usuarios ni hashes.
-- =============================================================

INSERT INTO ROL (id_rol, codigo, nombre, descripcion)
VALUES (SEQ_ROL.NEXTVAL, 'ADMIN', 'Administracion', 'Administracion integral y seguridad');

INSERT INTO ROL (id_rol, codigo, nombre, descripcion)
VALUES (SEQ_ROL.NEXTVAL, 'OPERACIONES', 'Operaciones', 'Operacion diaria de la red y servicio');

INSERT INTO ROL (id_rol, codigo, nombre, descripcion)
VALUES (SEQ_ROL.NEXTVAL, 'MANTENIMIENTO', 'Mantenimiento', 'Flota, equipos, ordenes y repuestos');

INSERT INTO ROL (id_rol, codigo, nombre, descripcion)
VALUES (SEQ_ROL.NEXTVAL, 'CONSULTA', 'Consulta', 'Lecturas operativas seguras');

COMMIT;

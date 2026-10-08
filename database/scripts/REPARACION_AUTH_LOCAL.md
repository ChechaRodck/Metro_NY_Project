# Reparación de autenticación local — 8 de octubre de 2026

Entorno: esquema METRO_NY, servicio XEPDB1.

## Cambios aplicados en Oracle

- ROL: se añadió ESTADO VARCHAR2(10 CHAR), DEFAULT 'ACTIVO',
  NOT NULL, con CHECK que permite ACTIVO e INACTIVO.
- USUARIO_ROL: se añadió ASIGNADO_POR VARCHAR2(60 CHAR).
- El rol con ID 1 cambió de código ROLE_ADMIN a ADMIN.
- Se asignó el rol ADMIN al usuario demo_admin y se confirmó
  la transacción con COMMIT.
- Se instalaron los cinco procedimientos exportados en
  respaldo_auth_local.sql.
- SP_AUTH_BOOTSTRAP_ADMIN utiliza el IDENTITY de USUARIO:
  omite ID_USUARIO en el INSERT y recupera su valor con RETURNING.
  No requiere SEQ_USUARIO.
- Se inició el backend con el perfil demo para sincronizar la cuenta.

## Cambio aplicado en Java

AuthRepository.findStateByUsername utiliza
@Transactional(readOnly = true) para reutilizar la conexión
al consultar el usuario y sus roles.

## Validación realizada

- Inicio de sesión de demostración exitoso.
- Panel mostrando datos de Oracle.
- Las cinco solicitudes principales respondieron HTTP 200.

## Alcance del respaldo

respaldo_auth_local.sql contiene definiciones de procedimientos,
no datos, contraseñas ni un respaldo completo de la base.

Está vinculado al esquema METRO_NY y a su estructura con IDENTITY.
No es una migración universal ni debe ejecutarse automáticamente
en otras bases. Revisar primero su estructura y configuración.

El script original 04_procedimientos.sql sigue utilizando
SEQ_USUARIO. Reejecutarlo en esta base puede sobrescribir la
adaptación local del procedimiento de inicialización.
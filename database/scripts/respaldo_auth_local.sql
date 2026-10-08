

  CREATE OR REPLACE EDITIONABLE PROCEDURE "METRO_NY"."SP_AUTH_BOOTSTRAP_ADMIN" (
  p_nombre_usuario IN VARCHAR2,
  p_nombre_mostrar IN VARCHAR2,
  p_hash IN VARCHAR2,
  p_actor IN VARCHAR2,
  p_id_usuario OUT NUMBER,
  p_creado OUT VARCHAR2
) IS
  v_total NUMBER;
  v_id_rol NUMBER;
BEGIN
  LOCK TABLE USUARIO IN EXCLUSIVE MODE;

  IF p_actor = 'BOOTSTRAP_DEMO'
     AND p_nombre_usuario <> 'demo_admin' THEN
    RAISE_APPLICATION_ERROR(
      -20181, 'El bootstrap demo solo admite la cuenta compartida'
    );
  END IF;

  BEGIN
    SELECT id_rol INTO v_id_rol
    FROM ROL
    WHERE codigo = 'ADMIN' AND estado = 'ACTIVO';
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20179, 'El rol ADMIN no esta disponible');
  END;

  BEGIN
    SELECT id_usuario INTO p_id_usuario
    FROM USUARIO
    WHERE nombre_usuario = p_nombre_usuario;

    SELECT COUNT(*) INTO v_total
    FROM USUARIO_ROL
    WHERE id_usuario = p_id_usuario
      AND id_rol = v_id_rol;

    IF v_total = 0 THEN
      RAISE_APPLICATION_ERROR(
        -20180, 'El usuario bootstrap existente no tiene rol ADMIN'
      );
    END IF;

    IF p_actor = 'BOOTSTRAP_DEMO' THEN
      UPDATE USUARIO
      SET nombre_mostrar = p_nombre_mostrar,
          hash_contrasena = p_hash,
          estado = 'ACTIVO',
          intentos_fallidos = 0,
          inicio_ventana_fallos = NULL,
          bloqueado_hasta = NULL
      WHERE id_usuario = p_id_usuario;
    END IF;

    p_creado := 'N';
    RETURN;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN NULL;
  END;

  SELECT COUNT(*) INTO v_total FROM USUARIO;

  IF v_total > 0 AND NVL(p_actor, 'BOOTSTRAP') <> 'BOOTSTRAP_DEMO' THEN
    p_id_usuario := NULL;
    p_creado := 'N';
    RETURN;
  END IF;

  INSERT INTO USUARIO (
    nombre_usuario, nombre_mostrar, hash_contrasena
  )
  VALUES (
    p_nombre_usuario, p_nombre_mostrar, p_hash
  )
  RETURNING id_usuario INTO p_id_usuario;

  INSERT INTO USUARIO_ROL (id_usuario, id_rol, asignado_por)
  VALUES (p_id_usuario, v_id_rol, SUBSTR(p_actor, 1, 60));

  p_creado := 'S';
END SP_AUTH_BOOTSTRAP_ADMIN;
/


  CREATE OR REPLACE EDITIONABLE PROCEDURE "METRO_NY"."SP_AUTH_CAMBIAR_ESTADO" (
  p_nombre_usuario IN VARCHAR2,
  p_estado IN VARCHAR2,
  p_actor IN VARCHAR2
) IS
  v_id NUMBER;
BEGIN
  IF p_estado NOT IN ('ACTIVO','BLOQUEADO','DESHABILITADO') THEN
    RAISE_APPLICATION_ERROR(-20174, 'Estado de usuario no valido');
  END IF;

  BEGIN
    SELECT id_usuario INTO v_id
    FROM USUARIO
    WHERE nombre_usuario = p_nombre_usuario
    FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20171, 'El usuario no existe');
  END;

  UPDATE USUARIO
  SET estado = p_estado,
      intentos_fallidos =
        CASE WHEN p_estado = 'ACTIVO' THEN 0 ELSE intentos_fallidos END,
      inicio_ventana_fallos =
        CASE WHEN p_estado = 'ACTIVO' THEN NULL ELSE inicio_ventana_fallos END,
      bloqueado_hasta =
        CASE WHEN p_estado = 'ACTIVO' THEN NULL ELSE bloqueado_hasta END
  WHERE id_usuario = v_id;
END SP_AUTH_CAMBIAR_ESTADO;
/


  CREATE OR REPLACE EDITIONABLE PROCEDURE "METRO_NY"."SP_AUTH_CAMBIAR_HASH" (
  p_nombre_usuario IN VARCHAR2,
  p_hash IN VARCHAR2,
  p_actor IN VARCHAR2
) IS
  v_id NUMBER;
BEGIN
  BEGIN
    SELECT id_usuario INTO v_id
    FROM USUARIO
    WHERE nombre_usuario = p_nombre_usuario
    FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20171, 'El usuario no existe');
  END;

  UPDATE USUARIO
  SET hash_contrasena = p_hash,
      intentos_fallidos = 0,
      inicio_ventana_fallos = NULL,
      bloqueado_hasta = NULL
  WHERE id_usuario = v_id;
END SP_AUTH_CAMBIAR_HASH;
/


  CREATE OR REPLACE EDITIONABLE PROCEDURE "METRO_NY"."SP_AUTH_REGISTRAR_EXITO" (p_id_usuario IN NUMBER) IS
BEGIN
  UPDATE USUARIO SET intentos_fallidos = 0, inicio_ventana_fallos = NULL,
         bloqueado_hasta = NULL,
         estado = CASE WHEN estado = 'BLOQUEADO' THEN 'ACTIVO' ELSE estado END,
         ultimo_ingreso_exitoso = SYS_EXTRACT_UTC(SYSTIMESTAMP)
   WHERE id_usuario = p_id_usuario;
  IF SQL%ROWCOUNT = 0 THEN RAISE_APPLICATION_ERROR(-20171, 'El usuario no existe'); END IF;
END SP_AUTH_REGISTRAR_EXITO;
/


  CREATE OR REPLACE EDITIONABLE PROCEDURE "METRO_NY"."SP_AUTH_REGISTRAR_FALLO" (
  p_id_usuario IN NUMBER, p_bloqueado_hasta OUT TIMESTAMP
) IS
  v_intentos NUMBER;
  v_inicio TIMESTAMP;
  v_ahora TIMESTAMP := SYS_EXTRACT_UTC(SYSTIMESTAMP);
BEGIN
  BEGIN
    SELECT intentos_fallidos, inicio_ventana_fallos INTO v_intentos, v_inicio
      FROM USUARIO WHERE id_usuario = p_id_usuario FOR UPDATE;
  EXCEPTION WHEN NO_DATA_FOUND THEN RAISE_APPLICATION_ERROR(-20171, 'El usuario no existe');
  END;
  IF v_inicio IS NULL OR v_ahora >= v_inicio + NUMTODSINTERVAL(15, 'MINUTE') THEN
    v_intentos := 1; v_inicio := v_ahora;
  ELSE
    v_intentos := v_intentos + 1;
  END IF;
  IF v_intentos >= 5 THEN
    p_bloqueado_hasta := v_ahora + NUMTODSINTERVAL(15, 'MINUTE');
    UPDATE USUARIO SET intentos_fallidos = v_intentos, inicio_ventana_fallos = v_inicio,
           bloqueado_hasta = p_bloqueado_hasta, estado = 'BLOQUEADO'
     WHERE id_usuario = p_id_usuario;
  ELSE
    p_bloqueado_hasta := NULL;
    UPDATE USUARIO SET intentos_fallidos = v_intentos, inicio_ventana_fallos = v_inicio
     WHERE id_usuario = p_id_usuario;
  END IF;
END SP_AUTH_REGISTRAR_FALLO;
/


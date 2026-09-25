-- =============================================================
-- 04_procedimientos.sql
-- Procedimientos almacenados del sistema.
--
-- Nota: los procedimientos NO hacen COMMIT. El commit lo hace quien
-- los llama (el backend en Spring o el script de pruebas). Asi, si
-- algo falla a medio camino, no queda nada guardado a medias.
--
-- Codigos de error que usamos:
--   20001-20009 red          20010-20049 rutas y viajes
--   20050-20059 trenes       20060-20069 personal
--   20070-20089 tarjetas     20090-20109 mantenimiento
--   20110-20129 incidentes   20150-20199 triggers
-- =============================================================


-- -------------------------------------------------------------
-- Bitacora (lo usan los triggers y algunos procedimientos)
-- -------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SP_BITACORA (
  p_tabla     IN VARCHAR2,
  p_id        IN VARCHAR2,
  p_accion    IN VARCHAR2,
  p_anterior  IN VARCHAR2,
  p_nuevo     IN VARCHAR2,
  p_tipo      IN VARCHAR2 DEFAULT 'CAMBIO',
  p_detalle   IN VARCHAR2 DEFAULT NULL
) IS
BEGIN
  INSERT INTO BITACORA (id_bitacora, fecha, usuario, tabla, id_registro, accion,
                        valor_anterior, valor_nuevo, tipo, detalle)
  VALUES (SEQ_BITACORA.NEXTVAL, SYSDATE, USER, p_tabla, p_id, p_accion,
          SUBSTR(p_anterior, 1, 400), SUBSTR(p_nuevo, 1, 400), p_tipo, SUBSTR(p_detalle, 1, 400));
END SP_BITACORA;
/


-- =============================================================
-- MODULO 1: ADMINISTRACION DE LA RED
-- =============================================================

-- Asocia una estacion a una linea en cierta posicion.
-- Si ya hay una estacion en ese orden, corre las demas un lugar.
CREATE OR REPLACE PROCEDURE SP_AGREGAR_ESTACION_LINEA (
  p_id_linea    IN VARCHAR2,
  p_id_estacion IN NUMBER,
  p_orden       IN NUMBER,
  p_distancia   IN NUMBER,
  p_tiempo      IN NUMBER
) IS
  v_cont NUMBER;
  v_max  NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cont FROM LINEA WHERE id_linea = p_id_linea;
  IF v_cont = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'La linea ' || p_id_linea || ' no existe');
  END IF;

  SELECT COUNT(*) INTO v_cont FROM ESTACION WHERE id_estacion = p_id_estacion;
  IF v_cont = 0 THEN
    RAISE_APPLICATION_ERROR(-20002, 'La estacion ' || p_id_estacion || ' no existe');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM LINEA_ESTACION
   WHERE id_linea = p_id_linea AND id_estacion = p_id_estacion;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20003, 'La estacion ya esta asociada a la linea ' || p_id_linea);
  END IF;

  SELECT NVL(MAX(orden), 0) INTO v_max FROM LINEA_ESTACION WHERE id_linea = p_id_linea;

  IF p_orden IS NULL OR p_orden > v_max THEN
    -- va al final
    INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
    VALUES (p_id_linea, p_id_estacion, v_max + 1, NVL(p_distancia, 0), NVL(p_tiempo, 0));
  ELSE
    -- hacemos espacio corriendo las que estan despues
    UPDATE LINEA_ESTACION
       SET orden = orden + 1
     WHERE id_linea = p_id_linea
       AND orden >= p_orden;

    INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
    VALUES (p_id_linea, p_id_estacion, p_orden, NVL(p_distancia, 0), NVL(p_tiempo, 0));
  END IF;
END SP_AGREGAR_ESTACION_LINEA;
/


-- Define una transferencia entre dos lineas en una estacion.
-- Se guarda una sola vez por par de lineas (A-B sirve para B-A).
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_TRANSFERENCIA (
  p_id_estacion IN NUMBER,
  p_linea_a     IN VARCHAR2,
  p_linea_b     IN VARCHAR2,
  p_tiempo      IN NUMBER,
  o_id          OUT NUMBER
) IS
  v_a    VARCHAR2(5) := LEAST(p_linea_a, p_linea_b);
  v_b    VARCHAR2(5) := GREATEST(p_linea_a, p_linea_b);
  v_cont NUMBER;
BEGIN
  IF p_linea_a = p_linea_b THEN
    RAISE_APPLICATION_ERROR(-20004, 'Una transferencia debe ser entre dos lineas distintas');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM LINEA_ESTACION
   WHERE id_estacion = p_id_estacion
     AND id_linea IN (v_a, v_b);
  IF v_cont < 2 THEN
    RAISE_APPLICATION_ERROR(-20005, 'Las dos lineas deben pasar por la estacion para poder hacer transferencia');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM TRANSFERENCIA
   WHERE id_estacion = p_id_estacion AND id_linea_a = v_a AND id_linea_b = v_b;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20006, 'Esa transferencia ya existe');
  END IF;

  o_id := SEQ_TRANSFERENCIA.NEXTVAL;
  INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
  VALUES (o_id, p_id_estacion, v_a, v_b, p_tiempo);

  -- si era local o expresa pasa a ser de transferencia (las terminales se quedan igual)
  UPDATE ESTACION
     SET tipo_estacion = 'TRANSFERENCIA'
   WHERE id_estacion = p_id_estacion
     AND tipo_estacion IN ('LOCAL','EXPRESA');
END SP_REGISTRAR_TRANSFERENCIA;
/


-- Desactiva una linea, sus rutas y cancela los viajes futuros
CREATE OR REPLACE PROCEDURE SP_DESACTIVAR_LINEA (
  p_id_linea   IN VARCHAR2,
  o_cancelados OUT NUMBER
) IS
BEGIN
  UPDATE LINEA SET estado_operativo = 'INACTIVA' WHERE id_linea = p_id_linea;
  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'La linea ' || p_id_linea || ' no existe');
  END IF;

  UPDATE RUTA SET estado = 'INACTIVA' WHERE id_linea = p_id_linea;

  UPDATE VIAJE_PROGRAMADO
     SET estado_viaje = 'CANCELADO',
         motivo_cancelacion = 'Linea desactivada'
   WHERE id_ruta IN (SELECT id_ruta FROM RUTA WHERE id_linea = p_id_linea)
     AND estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO')
     AND salida_programada > SYSDATE;
  o_cancelados := SQL%ROWCOUNT;
END SP_DESACTIVAR_LINEA;
/


-- =============================================================
-- MODULO 2: RUTAS, HORARIOS Y VIAJES
-- =============================================================

-- Agrega una parada a una ruta. La estacion tiene que ser de la linea de la ruta.
CREATE OR REPLACE PROCEDURE SP_AGREGAR_PARADA_RUTA (
  p_id_ruta         IN NUMBER,
  p_id_estacion     IN NUMBER,
  p_orden           IN NUMBER,
  p_minutos_llegada IN NUMBER,
  p_minutos_salida  IN NUMBER,
  p_distancia       IN NUMBER,
  p_tiempo          IN NUMBER,
  p_se_detiene      IN VARCHAR2
) IS
  v_linea RUTA.id_linea%TYPE;
  v_cont  NUMBER;
BEGIN
  BEGIN
    SELECT id_linea INTO v_linea FROM RUTA WHERE id_ruta = p_id_ruta;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20010, 'La ruta ' || p_id_ruta || ' no existe');
  END;

  SELECT COUNT(*) INTO v_cont
    FROM LINEA_ESTACION
   WHERE id_linea = v_linea AND id_estacion = p_id_estacion;
  IF v_cont = 0 THEN
    RAISE_APPLICATION_ERROR(-20011, 'La estacion ' || p_id_estacion || ' no pertenece a la linea ' || v_linea);
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM RUTA_ESTACION
   WHERE id_ruta = p_id_ruta AND (id_estacion = p_id_estacion OR orden = p_orden);
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20012, 'La estacion o el orden ya estan registrados en esta ruta');
  END IF;

  INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida,
                             distancia_anterior_km, tiempo_anterior_min, se_detiene)
  VALUES (p_id_ruta, p_id_estacion, p_orden, NVL(p_minutos_llegada, 0),
          NVL(p_minutos_salida, NVL(p_minutos_llegada, 0)), NVL(p_distancia, 0),
          NVL(p_tiempo, 0), NVL(p_se_detiene, 'S'));
END SP_AGREGAR_PARADA_RUTA;
/


-- Genera los viajes de un horario para una fecha, segun la frecuencia.
-- Los viajes quedan PROGRAMADOS sin tren ni conductor (se asignan despues).
-- Si hora_fin es menor que hora_inicio se toma que termina al dia siguiente.
CREATE OR REPLACE PROCEDURE SP_GENERAR_VIAJES (
  p_id_horario IN NUMBER,
  p_fecha      IN DATE,
  o_cantidad   OUT NUMBER
) IS
  v_id_ruta    HORARIO.id_ruta%TYPE;
  v_dia        HORARIO.dia_semana%TYPE;
  v_h_ini      HORARIO.hora_inicio%TYPE;
  v_h_fin      HORARIO.hora_fin%TYPE;
  v_frecuencia HORARIO.frecuencia_min%TYPE;
  v_vig_ini    DATE;
  v_vig_fin    DATE;
  v_estado     HORARIO.estado%TYPE;
  v_duracion   RUTA.duracion_estimada_min%TYPE;
  v_fecha      DATE := TRUNC(p_fecha);
  v_num_dia    NUMBER;
  v_nombre_dia VARCHAR2(12);
  v_inicio     DATE;
  v_fin        DATE;
  v_salida     DATE;
  v_i          NUMBER := 0;
  v_cont       NUMBER;
BEGIN
  o_cantidad := 0;

  BEGIN
    SELECT h.id_ruta, h.dia_semana, h.hora_inicio, h.hora_fin, h.frecuencia_min,
           h.fecha_inicio_vigor, h.fecha_fin_vigor, h.estado, r.duracion_estimada_min
      INTO v_id_ruta, v_dia, v_h_ini, v_h_fin, v_frecuencia,
           v_vig_ini, v_vig_fin, v_estado, v_duracion
      FROM HORARIO h
      JOIN RUTA r ON r.id_ruta = h.id_ruta
     WHERE h.id_horario = p_id_horario;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20013, 'El horario ' || p_id_horario || ' no existe');
  END;

  IF v_estado <> 'ACTIVO' THEN
    RAISE_APPLICATION_ERROR(-20014, 'El horario esta inactivo');
  END IF;

  IF v_fecha < v_vig_ini OR (v_vig_fin IS NOT NULL AND v_fecha > v_vig_fin) THEN
    RAISE_APPLICATION_ERROR(-20015, 'La fecha esta fuera de la vigencia del horario');
  END IF;

  IF FN_RUTA_OPERATIVA(v_id_ruta, v_fecha) = 'N' THEN
    RAISE_APPLICATION_ERROR(-20016, 'La ruta no esta operativa para esa fecha');
  END IF;

  -- 0 = lunes ... 6 = domingo (asi no depende del idioma de Oracle)
  v_num_dia := v_fecha - TRUNC(v_fecha, 'IW');
  v_nombre_dia := CASE v_num_dia
                    WHEN 0 THEN 'LUNES'   WHEN 1 THEN 'MARTES' WHEN 2 THEN 'MIERCOLES'
                    WHEN 3 THEN 'JUEVES'  WHEN 4 THEN 'VIERNES' WHEN 5 THEN 'SABADO'
                    ELSE 'DOMINGO' END;

  -- los horarios FESTIVO se generan cuando el administrador los manda a generar
  IF NOT (v_dia = 'TODOS' OR v_dia = 'FESTIVO' OR v_dia = v_nombre_dia
          OR (v_dia = 'LABORAL' AND v_num_dia < 5)
          OR (v_dia = 'FIN_SEMANA' AND v_num_dia >= 5)) THEN
    RAISE_APPLICATION_ERROR(-20017, 'El horario (' || v_dia || ') no aplica para un ' || v_nombre_dia);
  END IF;

  v_inicio := TO_DATE(TO_CHAR(v_fecha, 'YYYY-MM-DD') || ' ' || v_h_ini, 'YYYY-MM-DD HH24:MI');
  v_fin    := TO_DATE(TO_CHAR(v_fecha, 'YYYY-MM-DD') || ' ' || v_h_fin, 'YYYY-MM-DD HH24:MI');
  IF v_fin <= v_inicio THEN
    v_fin := v_fin + 1;
  END IF;

  v_salida := v_inicio;
  WHILE v_salida < v_fin LOOP
    SELECT COUNT(*) INTO v_cont
      FROM VIAJE_PROGRAMADO
     WHERE id_ruta = v_id_ruta AND salida_programada = v_salida;

    IF v_cont = 0 THEN
      INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada,
                                    llegada_programada, estado_viaje, pasajeros_estimados)
      VALUES (SEQ_VIAJE.NEXTVAL, v_id_ruta, p_id_horario, v_salida,
              v_salida + NUMTODSINTERVAL(v_duracion, 'MINUTE'), 'PROGRAMADO', 0);
      o_cantidad := o_cantidad + 1;
    END IF;

    v_i := v_i + 1;
    v_salida := v_inicio + NUMTODSINTERVAL(v_i * v_frecuencia, 'MINUTE');
  END LOOP;
END SP_GENERAR_VIAJES;
/


-- Valida que un tren y un conductor se puedan asignar en ese horario.
-- Si algo no cumple lanza el error con el motivo.
CREATE OR REPLACE PROCEDURE SP_VALIDAR_ASIGNACION (
  p_codigo_tren   IN VARCHAR2,
  p_id_conductor  IN NUMBER,
  p_inicio        IN DATE,
  p_fin           IN DATE,
  p_excluir_viaje IN NUMBER
) IS
  v_estado_tren  TREN.estado_operativo%TYPE;
  v_cargo        CARGO.codigo_cargo%TYPE;
  v_estado_emp   EMPLEADO.estado_laboral%TYPE;
  v_cont         NUMBER;
BEGIN
  -- ---- tren ----
  IF p_codigo_tren IS NOT NULL THEN
    BEGIN
      SELECT estado_operativo INTO v_estado_tren FROM TREN WHERE codigo_tren = p_codigo_tren;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20050, 'El tren ' || p_codigo_tren || ' no existe');
    END;

    IF v_estado_tren IN ('EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO') THEN
      RAISE_APPLICATION_ERROR(-20051, 'El tren ' || p_codigo_tren || ' esta ' || v_estado_tren
                                      || ' y no se puede asignar');
    END IF;

    IF FN_TREN_DISPONIBLE(p_codigo_tren, p_inicio, p_fin, p_excluir_viaje) = 'N' THEN
      RAISE_APPLICATION_ERROR(-20052, 'El tren ' || p_codigo_tren || ' no esta disponible en ese horario '
                               || '(otro viaje, inspeccion vencida, mantenimiento pendiente o sin vagones)');
    END IF;
  END IF;

  -- ---- conductor ----
  IF p_id_conductor IS NOT NULL THEN
    BEGIN
      SELECT c.codigo_cargo, e.estado_laboral
        INTO v_cargo, v_estado_emp
        FROM EMPLEADO e
        JOIN CARGO c ON c.id_cargo = e.id_cargo
       WHERE e.id_empleado = p_id_conductor;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_conductor || ' no existe');
    END;

    IF v_cargo <> 'CONDUCTOR' THEN
      RAISE_APPLICATION_ERROR(-20020, 'El empleado ' || p_id_conductor || ' no es conductor');
    END IF;

    IF v_estado_emp <> 'ACTIVO' THEN
      RAISE_APPLICATION_ERROR(-20021, 'El conductor no esta activo (estado: ' || v_estado_emp || ')');
    END IF;

    IF p_codigo_tren IS NOT NULL THEN
      IF FN_CONDUCTOR_HABILITADO(p_id_conductor, p_codigo_tren, p_inicio) = 'N' THEN
        RAISE_APPLICATION_ERROR(-20022, 'El conductor no tiene certificacion vigente para el modelo del tren '
                                        || p_codigo_tren);
      END IF;
    ELSE
      SELECT COUNT(*) INTO v_cont
        FROM CERTIFICACION
       WHERE id_empleado = p_id_conductor
         AND estado = 'VIGENTE'
         AND fecha_vencimiento >= TRUNC(p_inicio);
      IF v_cont = 0 THEN
        RAISE_APPLICATION_ERROR(-20022, 'El conductor no tiene ninguna certificacion vigente');
      END IF;
    END IF;

    SELECT COUNT(*) INTO v_cont
      FROM VIAJE_PROGRAMADO
     WHERE id_conductor = p_id_conductor
       AND estado_viaje NOT IN ('CANCELADO','COMPLETADO')
       AND (p_excluir_viaje IS NULL OR numero_viaje <> p_excluir_viaje)
       AND salida_programada < p_fin
       AND llegada_programada > p_inicio;
    IF v_cont > 0 THEN
      RAISE_APPLICATION_ERROR(-20023, 'El conductor ya tiene otro viaje en ese horario');
    END IF;

    SELECT COUNT(*) INTO v_cont
      FROM AUSENCIA
     WHERE id_empleado = p_id_conductor
       AND estado = 'APROBADA'
       AND TRUNC(p_inicio) BETWEEN fecha_inicio AND fecha_fin;
    IF v_cont > 0 THEN
      RAISE_APPLICATION_ERROR(-20024, 'El conductor tiene una ausencia/permiso registrado para esa fecha');
    END IF;
  END IF;
END SP_VALIDAR_ASIGNACION;
/


-- SP_PROGRAMAR_VIAJE: programa un viaje validando tren y conductor
CREATE OR REPLACE PROCEDURE SP_PROGRAMAR_VIAJE (
  p_id_ruta      IN NUMBER,
  p_salida       IN DATE,
  p_codigo_tren  IN VARCHAR2,
  p_id_conductor IN NUMBER,
  p_pasajeros    IN NUMBER,
  o_numero_viaje OUT NUMBER
) IS
  v_duracion RUTA.duracion_estimada_min%TYPE;
  v_llegada  DATE;
  v_cont     NUMBER;
BEGIN
  BEGIN
    SELECT duracion_estimada_min INTO v_duracion FROM RUTA WHERE id_ruta = p_id_ruta;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20010, 'La ruta ' || p_id_ruta || ' no existe');
  END;

  IF p_salida IS NULL OR p_salida < SYSDATE THEN
    RAISE_APPLICATION_ERROR(-20025, 'La hora de salida debe ser futura');
  END IF;

  IF FN_RUTA_OPERATIVA(p_id_ruta, p_salida) = 'N' THEN
    RAISE_APPLICATION_ERROR(-20016, 'La ruta no esta operativa para esa fecha');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM VIAJE_PROGRAMADO
   WHERE id_ruta = p_id_ruta AND salida_programada = p_salida;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20026, 'Ya existe un viaje de esa ruta a esa hora');
  END IF;

  v_llegada := p_salida + NUMTODSINTERVAL(v_duracion, 'MINUTE');

  SP_VALIDAR_ASIGNACION(p_codigo_tren, p_id_conductor, p_salida, v_llegada, NULL);

  o_numero_viaje := SEQ_VIAJE.NEXTVAL;
  INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, salida_programada, llegada_programada,
                                codigo_tren, id_conductor, estado_viaje, pasajeros_estimados)
  VALUES (o_numero_viaje, p_id_ruta, p_salida, v_llegada,
          p_codigo_tren, p_id_conductor, 'PROGRAMADO', NVL(p_pasajeros, 0));
END SP_PROGRAMAR_VIAJE;
/


-- Asigna (o cambia) el tren y/o conductor de un viaje que ya existe.
-- Si se manda NULL en alguno se queda el que ya tenia.
CREATE OR REPLACE PROCEDURE SP_ASIGNAR_TREN_CONDUCTOR (
  p_numero_viaje IN NUMBER,
  p_codigo_tren  IN VARCHAR2,
  p_id_conductor IN NUMBER
) IS
  v_estado    VIAJE_PROGRAMADO.estado_viaje%TYPE;
  v_salida    DATE;
  v_llegada   DATE;
  v_tren      VIAJE_PROGRAMADO.codigo_tren%TYPE;
  v_conductor VIAJE_PROGRAMADO.id_conductor%TYPE;
BEGIN
  BEGIN
    SELECT estado_viaje, salida_programada, llegada_programada, codigo_tren, id_conductor
      INTO v_estado, v_salida, v_llegada, v_tren, v_conductor
      FROM VIAJE_PROGRAMADO
     WHERE numero_viaje = p_numero_viaje
       FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'El viaje ' || p_numero_viaje || ' no existe');
  END;

  IF v_estado NOT IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO') THEN
    RAISE_APPLICATION_ERROR(-20031, 'No se puede asignar en un viaje ' || v_estado);
  END IF;

  v_tren := NVL(p_codigo_tren, v_tren);
  v_conductor := NVL(p_id_conductor, v_conductor);

  SP_VALIDAR_ASIGNACION(v_tren, v_conductor, v_salida, v_llegada, p_numero_viaje);

  UPDATE VIAJE_PROGRAMADO
     SET codigo_tren = v_tren,
         id_conductor = v_conductor
   WHERE numero_viaje = p_numero_viaje;
END SP_ASIGNAR_TREN_CONDUCTOR;
/


CREATE OR REPLACE PROCEDURE SP_CANCELAR_VIAJE (
  p_numero_viaje IN NUMBER,
  p_motivo       IN VARCHAR2
) IS
  v_estado VIAJE_PROGRAMADO.estado_viaje%TYPE;
BEGIN
  BEGIN
    SELECT estado_viaje INTO v_estado
      FROM VIAJE_PROGRAMADO
     WHERE numero_viaje = p_numero_viaje
       FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'El viaje ' || p_numero_viaje || ' no existe');
  END;

  IF v_estado IN ('COMPLETADO','CANCELADO') THEN
    RAISE_APPLICATION_ERROR(-20032, 'El viaje ya esta ' || v_estado);
  END IF;

  UPDATE VIAJE_PROGRAMADO
     SET estado_viaje = 'CANCELADO',
         motivo_cancelacion = NVL(p_motivo, 'Cancelado por administracion')
   WHERE numero_viaje = p_numero_viaje;
END SP_CANCELAR_VIAJE;
/


-- Cambia la hora de salida de un viaje que todavia no ha salido
CREATE OR REPLACE PROCEDURE SP_REPROGRAMAR_VIAJE (
  p_numero_viaje IN NUMBER,
  p_nueva_salida IN DATE
) IS
  v_estado    VIAJE_PROGRAMADO.estado_viaje%TYPE;
  v_id_ruta   VIAJE_PROGRAMADO.id_ruta%TYPE;
  v_tren      VIAJE_PROGRAMADO.codigo_tren%TYPE;
  v_conductor VIAJE_PROGRAMADO.id_conductor%TYPE;
  v_duracion  RUTA.duracion_estimada_min%TYPE;
  v_llegada   DATE;
  v_cont      NUMBER;
BEGIN
  BEGIN
    SELECT v.estado_viaje, v.id_ruta, v.codigo_tren, v.id_conductor, r.duracion_estimada_min
      INTO v_estado, v_id_ruta, v_tren, v_conductor, v_duracion
      FROM VIAJE_PROGRAMADO v
      JOIN RUTA r ON r.id_ruta = v.id_ruta
     WHERE v.numero_viaje = p_numero_viaje;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'El viaje ' || p_numero_viaje || ' no existe');
  END;

  IF v_estado NOT IN ('PROGRAMADO','RETRASADO') THEN
    RAISE_APPLICATION_ERROR(-20033, 'Solo se pueden reprogramar viajes que no han salido');
  END IF;

  IF p_nueva_salida IS NULL OR p_nueva_salida < SYSDATE THEN
    RAISE_APPLICATION_ERROR(-20025, 'La hora de salida debe ser futura');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM VIAJE_PROGRAMADO
   WHERE id_ruta = v_id_ruta
     AND salida_programada = p_nueva_salida
     AND numero_viaje <> p_numero_viaje;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20026, 'Ya existe un viaje de esa ruta a esa hora');
  END IF;

  v_llegada := p_nueva_salida + NUMTODSINTERVAL(v_duracion, 'MINUTE');

  SP_VALIDAR_ASIGNACION(v_tren, v_conductor, p_nueva_salida, v_llegada, p_numero_viaje);

  UPDATE VIAJE_PROGRAMADO
     SET salida_programada = p_nueva_salida,
         llegada_programada = v_llegada,
         estado_viaje = 'PROGRAMADO'
   WHERE numero_viaje = p_numero_viaje;
END SP_REPROGRAMAR_VIAJE;
/


-- Marca la salida real del viaje. El trigger pone el tren EN_OPERACION.
CREATE OR REPLACE PROCEDURE SP_INICIAR_VIAJE (
  p_numero_viaje IN NUMBER,
  p_hora_real    IN DATE
) IS
  v_estado      VIAJE_PROGRAMADO.estado_viaje%TYPE;
  v_tren        VIAJE_PROGRAMADO.codigo_tren%TYPE;
  v_conductor   VIAJE_PROGRAMADO.id_conductor%TYPE;
  v_estado_tren TREN.estado_operativo%TYPE;
BEGIN
  BEGIN
    SELECT estado_viaje, codigo_tren, id_conductor
      INTO v_estado, v_tren, v_conductor
      FROM VIAJE_PROGRAMADO
     WHERE numero_viaje = p_numero_viaje
       FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'El viaje ' || p_numero_viaje || ' no existe');
  END;

  IF v_estado NOT IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO') THEN
    RAISE_APPLICATION_ERROR(-20034, 'El viaje no se puede iniciar porque esta ' || v_estado);
  END IF;

  IF v_tren IS NULL OR v_conductor IS NULL THEN
    RAISE_APPLICATION_ERROR(-20035, 'El viaje necesita tren y conductor asignados antes de iniciar');
  END IF;

  SELECT estado_operativo INTO v_estado_tren FROM TREN WHERE codigo_tren = v_tren;
  IF v_estado_tren <> 'DISPONIBLE' THEN
    RAISE_APPLICATION_ERROR(-20036, 'El tren ' || v_tren || ' no esta disponible (estado: ' || v_estado_tren || ')');
  END IF;

  UPDATE VIAJE_PROGRAMADO
     SET salida_real = NVL(p_hora_real, SYSDATE),
         estado_viaje = 'EN_CURSO'
   WHERE numero_viaje = p_numero_viaje;
END SP_INICIAR_VIAJE;
/


-- Marca la llegada real. El trigger libera el tren y aqui se suma el kilometraje.
CREATE OR REPLACE PROCEDURE SP_FINALIZAR_VIAJE (
  p_numero_viaje IN NUMBER,
  p_hora_real    IN DATE,
  p_pasajeros    IN NUMBER
) IS
  v_estado    VIAJE_PROGRAMADO.estado_viaje%TYPE;
  v_sal_real  DATE;
  v_tren      VIAJE_PROGRAMADO.codigo_tren%TYPE;
  v_distancia RUTA.distancia_total_km%TYPE;
  v_llegada   DATE := NVL(p_hora_real, SYSDATE);
BEGIN
  BEGIN
    SELECT v.estado_viaje, v.salida_real, v.codigo_tren, r.distancia_total_km
      INTO v_estado, v_sal_real, v_tren, v_distancia
      FROM VIAJE_PROGRAMADO v
      JOIN RUTA r ON r.id_ruta = v.id_ruta
     WHERE v.numero_viaje = p_numero_viaje;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'El viaje ' || p_numero_viaje || ' no existe');
  END;

  IF v_sal_real IS NULL OR v_estado NOT IN ('EN_CURSO','RETRASADO') THEN
    RAISE_APPLICATION_ERROR(-20037, 'Solo se puede finalizar un viaje que esta en curso');
  END IF;

  IF v_llegada < v_sal_real THEN
    RAISE_APPLICATION_ERROR(-20038, 'La hora de llegada no puede ser antes de la hora de salida');
  END IF;

  UPDATE VIAJE_PROGRAMADO
     SET llegada_real = v_llegada,
         estado_viaje = 'COMPLETADO',
         pasajeros_estimados = NVL(p_pasajeros, pasajeros_estimados)
   WHERE numero_viaje = p_numero_viaje;

  UPDATE TREN
     SET kilometraje_km = kilometraje_km + v_distancia
   WHERE codigo_tren = v_tren;
END SP_FINALIZAR_VIAJE;
/


-- SP_CANCELAR_VIAJES_AFECTADOS: cierra una estacion o suspende una ruta
-- y cancela los viajes que se ven afectados en el rango de fechas.
-- p_tipo = 'ESTACION' o 'RUTA'. Si viene el incidente, deja registrados
-- los viajes cancelados como elementos afectados.
CREATE OR REPLACE PROCEDURE SP_CANCELAR_VIAJES_AFECTADOS (
  p_tipo             IN VARCHAR2,
  p_id               IN NUMBER,
  p_desde            IN DATE,
  p_hasta            IN DATE,
  p_motivo           IN VARCHAR2,
  p_numero_incidente IN NUMBER,
  o_cantidad         OUT NUMBER
) IS
  v_desde  DATE := NVL(p_desde, SYSDATE);
  v_hasta  DATE := NVL(p_hasta, NVL(p_desde, SYSDATE) + 1);
  v_motivo VARCHAR2(200) := NVL(p_motivo, 'Cancelado por cierre');
BEGIN
  o_cantidad := 0;

  IF v_hasta < v_desde THEN
    RAISE_APPLICATION_ERROR(-20039, 'La fecha final no puede ser menor a la inicial');
  END IF;

  IF p_tipo = 'ESTACION' THEN
    UPDATE ESTACION SET estado_operativo = 'CERRADA' WHERE id_estacion = p_id;
    IF SQL%ROWCOUNT = 0 THEN
      RAISE_APPLICATION_ERROR(-20002, 'La estacion ' || p_id || ' no existe');
    END IF;

    IF p_numero_incidente IS NOT NULL THEN
      INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, tipo_efecto)
      VALUES (SEQ_ELEMENTO.NEXTVAL, p_numero_incidente, 'ESTACION', p_id, 'CIERRE_ESTACION');
    END IF;

    FOR v IN (SELECT DISTINCT vp.numero_viaje
                FROM VIAJE_PROGRAMADO vp
                JOIN RUTA_ESTACION re ON re.id_ruta = vp.id_ruta
               WHERE re.id_estacion = p_id
                 AND re.se_detiene = 'S'
                 AND vp.estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO')
                 AND vp.salida_programada BETWEEN v_desde AND v_hasta) LOOP
      UPDATE VIAJE_PROGRAMADO
         SET estado_viaje = 'CANCELADO', motivo_cancelacion = v_motivo
       WHERE numero_viaje = v.numero_viaje;

      IF p_numero_incidente IS NOT NULL THEN
        INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, numero_viaje, tipo_efecto)
        VALUES (SEQ_ELEMENTO.NEXTVAL, p_numero_incidente, 'VIAJE', v.numero_viaje, 'CANCELACION');
      END IF;
      o_cantidad := o_cantidad + 1;
    END LOOP;

  ELSIF p_tipo = 'RUTA' THEN
    UPDATE RUTA SET estado = 'SUSPENDIDA' WHERE id_ruta = p_id;
    IF SQL%ROWCOUNT = 0 THEN
      RAISE_APPLICATION_ERROR(-20010, 'La ruta ' || p_id || ' no existe');
    END IF;

    IF p_numero_incidente IS NOT NULL THEN
      INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_ruta, tipo_efecto)
      VALUES (SEQ_ELEMENTO.NEXTVAL, p_numero_incidente, 'RUTA', p_id, 'SUSPENSION_TRAMO');
    END IF;

    FOR v IN (SELECT numero_viaje
                FROM VIAJE_PROGRAMADO
               WHERE id_ruta = p_id
                 AND estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO')
                 AND salida_programada BETWEEN v_desde AND v_hasta) LOOP
      UPDATE VIAJE_PROGRAMADO
         SET estado_viaje = 'CANCELADO', motivo_cancelacion = v_motivo
       WHERE numero_viaje = v.numero_viaje;

      IF p_numero_incidente IS NOT NULL THEN
        INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, numero_viaje, tipo_efecto)
        VALUES (SEQ_ELEMENTO.NEXTVAL, p_numero_incidente, 'VIAJE', v.numero_viaje, 'CANCELACION');
      END IF;
      o_cantidad := o_cantidad + 1;
    END LOOP;

  ELSE
    RAISE_APPLICATION_ERROR(-20040, 'Tipo invalido, debe ser ESTACION o RUTA');
  END IF;
END SP_CANCELAR_VIAJES_AFECTADOS;
/


-- =============================================================
-- MODULO 3: TRENES
-- =============================================================

-- Pone un vagon en un tren. Si estaba en otro tren, cierra esa asignacion
-- (asi queda el historial).
CREATE OR REPLACE PROCEDURE SP_ASIGNAR_VAGON (
  p_codigo_tren  IN VARCHAR2,
  p_numero_serie IN VARCHAR2,
  p_posicion     IN NUMBER,
  p_fecha        IN DATE
) IS
  v_fecha        DATE := NVL(p_fecha, SYSDATE);
  v_estado_tren  TREN.estado_operativo%TYPE;
  v_estado_vagon VAGON.estado%TYPE;
  v_tren_actual  TREN_VAGON.codigo_tren%TYPE;
  v_cont         NUMBER;
BEGIN
  BEGIN
    SELECT estado_operativo INTO v_estado_tren FROM TREN WHERE codigo_tren = p_codigo_tren;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20050, 'El tren ' || p_codigo_tren || ' no existe');
  END;

  BEGIN
    SELECT estado INTO v_estado_vagon FROM VAGON WHERE numero_serie = p_numero_serie;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20053, 'El vagon ' || p_numero_serie || ' no existe');
  END;

  IF v_estado_tren IN ('RETIRADO','EN_OPERACION') THEN
    RAISE_APPLICATION_ERROR(-20054, 'No se puede cambiar la composicion de un tren ' || v_estado_tren);
  END IF;

  IF v_estado_vagon IN ('RETIRADO','FUERA_SERVICIO') THEN
    RAISE_APPLICATION_ERROR(-20055, 'El vagon esta ' || v_estado_vagon);
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM TREN_VAGON
   WHERE codigo_tren = p_codigo_tren AND posicion = p_posicion AND fecha_fin IS NULL;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20056, 'La posicion ' || p_posicion || ' del tren ya esta ocupada');
  END IF;

  -- ver si el vagon esta en otro tren
  BEGIN
    SELECT codigo_tren INTO v_tren_actual
      FROM TREN_VAGON
     WHERE numero_serie = p_numero_serie AND fecha_fin IS NULL;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      v_tren_actual := NULL;
  END;

  IF v_tren_actual = p_codigo_tren THEN
    RAISE_APPLICATION_ERROR(-20057, 'El vagon ya pertenece a ese tren');
  END IF;

  IF v_tren_actual IS NOT NULL THEN
    SELECT estado_operativo INTO v_estado_tren FROM TREN WHERE codigo_tren = v_tren_actual;
    IF v_estado_tren = 'EN_OPERACION' THEN
      RAISE_APPLICATION_ERROR(-20058, 'El vagon esta en el tren ' || v_tren_actual || ' que esta en operacion');
    END IF;

    UPDATE TREN_VAGON
       SET fecha_fin = v_fecha
     WHERE numero_serie = p_numero_serie AND fecha_fin IS NULL;
  END IF;

  INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
  VALUES (SEQ_COMPOSICION.NEXTVAL, p_codigo_tren, p_numero_serie, p_posicion, v_fecha, NULL);
END SP_ASIGNAR_VAGON;
/


CREATE OR REPLACE PROCEDURE SP_RETIRAR_VAGON (
  p_codigo_tren  IN VARCHAR2,
  p_numero_serie IN VARCHAR2,
  p_fecha        IN DATE
) IS
BEGIN
  UPDATE TREN_VAGON
     SET fecha_fin = NVL(p_fecha, SYSDATE)
   WHERE codigo_tren = p_codigo_tren
     AND numero_serie = p_numero_serie
     AND fecha_fin IS NULL;

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20059, 'El vagon no esta asignado actualmente a ese tren');
  END IF;
END SP_RETIRAR_VAGON;
/


-- Cambia el estado de un tren a mano. EN_OPERACION no se pone aqui,
-- eso lo hace el trigger cuando inicia un viaje.
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_ESTADO_TREN (
  p_codigo_tren IN VARCHAR2,
  p_estado      IN VARCHAR2
) IS
  v_actual TREN.estado_operativo%TYPE;
  v_cont   NUMBER;
BEGIN
  BEGIN
    SELECT estado_operativo INTO v_actual FROM TREN WHERE codigo_tren = p_codigo_tren FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20050, 'El tren ' || p_codigo_tren || ' no existe');
  END;

  IF p_estado = 'EN_OPERACION' THEN
    RAISE_APPLICATION_ERROR(-20054, 'El estado EN_OPERACION se asigna solo al iniciar un viaje');
  END IF;

  IF v_actual = p_estado THEN
    RETURN;
  END IF;

  IF v_actual = 'EN_OPERACION' THEN
    RAISE_APPLICATION_ERROR(-20054, 'El tren esta en un viaje, primero hay que finalizarlo');
  END IF;

  IF p_estado = 'DISPONIBLE' THEN
    SELECT COUNT(*) INTO v_cont
      FROM ORDEN_MANTENIMIENTO o
      JOIN EQUIPO e ON e.id_equipo = o.id_equipo
     WHERE e.codigo_tren = p_codigo_tren
       AND o.estado = 'EN_EJECUCION';
    IF v_cont > 0 THEN
      RAISE_APPLICATION_ERROR(-20054, 'El tren tiene una orden de mantenimiento en ejecucion');
    END IF;
  END IF;

  -- si sale de servicio se le quita a los viajes futuros que lo tenian asignado
  IF p_estado IN ('EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO') THEN
    UPDATE VIAJE_PROGRAMADO
       SET codigo_tren = NULL
     WHERE codigo_tren = p_codigo_tren
       AND estado_viaje IN ('PROGRAMADO','RETRASADO')
       AND salida_programada > SYSDATE;
  END IF;

  UPDATE TREN SET estado_operativo = p_estado WHERE codigo_tren = p_codigo_tren;
END SP_CAMBIAR_ESTADO_TREN;
/


-- =============================================================
-- MODULO 4: PERSONAL
-- =============================================================

-- Programa un turno validando que no se traslape con otro.
-- p_id_lugar depende del tipo: id de estacion, codigo de tren, id de deposito o id de ruta.
CREATE OR REPLACE PROCEDURE SP_PROGRAMAR_TURNO (
  p_id_empleado IN NUMBER,
  p_inicio      IN DATE,
  p_fin         IN DATE,
  p_tipo_lugar  IN VARCHAR2,
  p_id_lugar    IN VARCHAR2,
  p_funcion     IN VARCHAR2,
  o_id_turno    OUT NUMBER
) IS
  v_estado   EMPLEADO.estado_laboral%TYPE;
  v_estacion NUMBER;
  v_tren     VARCHAR2(10);
  v_deposito NUMBER;
  v_ruta     NUMBER;
  v_cont     NUMBER;
BEGIN
  BEGIN
    SELECT estado_laboral INTO v_estado FROM EMPLEADO WHERE id_empleado = p_id_empleado;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_empleado || ' no existe');
  END;

  IF v_estado <> 'ACTIVO' THEN
    RAISE_APPLICATION_ERROR(-20061, 'El empleado no esta activo');
  END IF;

  IF p_inicio IS NULL OR p_fin IS NULL OR p_fin <= p_inicio THEN
    RAISE_APPLICATION_ERROR(-20062, 'La hora final del turno debe ser mayor a la inicial');
  END IF;

  IF (p_fin - p_inicio) * 24 > 16 THEN
    RAISE_APPLICATION_ERROR(-20062, 'Un turno no puede durar mas de 16 horas');
  END IF;

  IF FN_EMPLEADO_OCUPADO(p_id_empleado, p_inicio, p_fin, NULL) = 'S' THEN
    RAISE_APPLICATION_ERROR(-20063, 'El empleado ya tiene un turno que se traslapa con ese horario');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM AUSENCIA
   WHERE id_empleado = p_id_empleado
     AND estado = 'APROBADA'
     AND fecha_inicio <= TRUNC(p_fin)
     AND fecha_fin >= TRUNC(p_inicio);
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20064, 'El empleado tiene ausencia/permiso/vacaciones en esas fechas');
  END IF;

  CASE p_tipo_lugar
    WHEN 'ESTACION' THEN v_estacion := TO_NUMBER(p_id_lugar);
    WHEN 'TREN'     THEN v_tren := p_id_lugar;
    WHEN 'DEPOSITO' THEN v_deposito := TO_NUMBER(p_id_lugar);
    WHEN 'RUTA'     THEN v_ruta := TO_NUMBER(p_id_lugar);
    WHEN 'CENTRO_CONTROL' THEN NULL;
    ELSE RAISE_APPLICATION_ERROR(-20065, 'Tipo de lugar invalido: ' || p_tipo_lugar);
  END CASE;

  o_id_turno := SEQ_TURNO.NEXTVAL;
  INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion,
                     codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
  VALUES (o_id_turno, p_id_empleado, p_inicio, p_fin, p_tipo_lugar, v_estacion,
          v_tren, v_deposito, v_ruta, p_funcion, 'PROGRAMADO');
END SP_PROGRAMAR_TURNO;
/


-- Registra una ausencia/permiso/vacaciones y marca los turnos que caen en esas fechas
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_AUSENCIA (
  p_id_empleado IN NUMBER,
  p_tipo        IN VARCHAR2,
  p_inicio      IN DATE,
  p_fin         IN DATE,
  p_motivo      IN VARCHAR2,
  o_id_ausencia OUT NUMBER,
  o_turnos      OUT NUMBER
) IS
  v_cont NUMBER;
  v_estado_turno VARCHAR2(15);
BEGIN
  SELECT COUNT(*) INTO v_cont FROM EMPLEADO WHERE id_empleado = p_id_empleado;
  IF v_cont = 0 THEN
    RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_empleado || ' no existe');
  END IF;

  IF p_fin < p_inicio THEN
    RAISE_APPLICATION_ERROR(-20062, 'La fecha final no puede ser menor a la inicial');
  END IF;

  o_id_ausencia := SEQ_AUSENCIA.NEXTVAL;
  INSERT INTO AUSENCIA (id_ausencia, id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado)
  VALUES (o_id_ausencia, p_id_empleado, p_tipo, TRUNC(p_inicio), TRUNC(p_fin), p_motivo, 'APROBADA');

  v_estado_turno := CASE p_tipo
                      WHEN 'AUSENCIA'   THEN 'AUSENTE'
                      WHEN 'VACACIONES' THEN 'VACACIONES'
                      ELSE 'PERMISO' END;

  -- los turnos que caen en esas fechas quedan pendientes de sustitucion
  UPDATE TURNO
     SET estado_asistencia = v_estado_turno
   WHERE id_empleado = p_id_empleado
     AND estado_asistencia = 'PROGRAMADO'
     AND TRUNC(hora_inicio) BETWEEN TRUNC(p_inicio) AND TRUNC(p_fin);
  o_turnos := SQL%ROWCOUNT;
END SP_REGISTRAR_AUSENCIA;
/


-- Sustituye un turno: crea un turno nuevo para el sustituto que apunta al original
CREATE OR REPLACE PROCEDURE SP_SUSTITUIR_TURNO (
  p_id_turno    IN NUMBER,
  p_id_sustituto IN NUMBER,
  o_nuevo_turno OUT NUMBER
) IS
  v_turno        TURNO%ROWTYPE;
  v_cargo_orig   NUMBER;
  v_cargo_sust   NUMBER;
  v_estado_sust  EMPLEADO.estado_laboral%TYPE;
  v_cont         NUMBER;
BEGIN
  BEGIN
    SELECT * INTO v_turno FROM TURNO WHERE id_turno = p_id_turno FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20066, 'El turno ' || p_id_turno || ' no existe');
  END;

  IF v_turno.estado_asistencia IN ('ASISTIO','SUSTITUIDO') THEN
    RAISE_APPLICATION_ERROR(-20067, 'El turno ya esta ' || v_turno.estado_asistencia);
  END IF;

  IF p_id_sustituto = v_turno.id_empleado THEN
    RAISE_APPLICATION_ERROR(-20067, 'El sustituto no puede ser el mismo empleado');
  END IF;

  SELECT COUNT(*) INTO v_cont FROM TURNO WHERE id_turno_reemplaza = p_id_turno;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20067, 'Ese turno ya tiene sustituto');
  END IF;

  SELECT id_cargo INTO v_cargo_orig FROM EMPLEADO WHERE id_empleado = v_turno.id_empleado;

  BEGIN
    SELECT id_cargo, estado_laboral INTO v_cargo_sust, v_estado_sust
      FROM EMPLEADO WHERE id_empleado = p_id_sustituto;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_sustituto || ' no existe');
  END;

  IF v_cargo_orig <> v_cargo_sust THEN
    RAISE_APPLICATION_ERROR(-20068, 'El sustituto debe tener el mismo cargo');
  END IF;

  IF v_estado_sust <> 'ACTIVO' THEN
    RAISE_APPLICATION_ERROR(-20061, 'El sustituto no esta activo');
  END IF;

  IF FN_EMPLEADO_OCUPADO(p_id_sustituto, v_turno.hora_inicio, v_turno.hora_fin, NULL) = 'S' THEN
    RAISE_APPLICATION_ERROR(-20063, 'El sustituto ya tiene un turno en ese horario');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM AUSENCIA
   WHERE id_empleado = p_id_sustituto
     AND estado = 'APROBADA'
     AND TRUNC(v_turno.hora_inicio) BETWEEN fecha_inicio AND fecha_fin;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20064, 'El sustituto tiene ausencia registrada ese dia');
  END IF;

  o_nuevo_turno := SEQ_TURNO.NEXTVAL;
  INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion,
                     codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia, id_turno_reemplaza)
  VALUES (o_nuevo_turno, p_id_sustituto, v_turno.hora_inicio, v_turno.hora_fin, v_turno.tipo_lugar,
          v_turno.id_estacion, v_turno.codigo_tren, v_turno.id_deposito, v_turno.id_ruta,
          v_turno.funcion, 'PROGRAMADO', p_id_turno);

  -- si el turno estaba normal se marca como sustituido; si ya decia PERMISO/VACACIONES se deja asi
  IF v_turno.estado_asistencia = 'PROGRAMADO' THEN
    UPDATE TURNO SET estado_asistencia = 'SUSTITUIDO' WHERE id_turno = p_id_turno;
  END IF;
END SP_SUSTITUIR_TURNO;
/


-- Marca como VENCIDAS las certificaciones y tarjetas que ya pasaron su fecha.
-- (el trigger de certificacion genera la alerta en la bitacora)
-- El backend lo corre todos los dias en la madrugada.
CREATE OR REPLACE PROCEDURE SP_REVISAR_VENCIMIENTOS (
  o_certificaciones OUT NUMBER,
  o_tarjetas        OUT NUMBER
) IS
BEGIN
  UPDATE CERTIFICACION
     SET estado = 'VENCIDA'
   WHERE estado = 'VIGENTE'
     AND fecha_vencimiento < TRUNC(SYSDATE);
  o_certificaciones := SQL%ROWCOUNT;

  UPDATE TARJETA
     SET estado = 'VENCIDA'
   WHERE estado = 'ACTIVA'
     AND fecha_vencimiento < TRUNC(SYSDATE);
  o_tarjetas := SQL%ROWCOUNT;
END SP_REVISAR_VENCIMIENTOS;
/


-- =============================================================
-- MODULO 5: PASAJEROS Y TARJETAS
-- =============================================================

-- SP_RECARGAR_TARJETA: registra la recarga y actualiza el saldo
CREATE OR REPLACE PROCEDURE SP_RECARGAR_TARJETA (
  p_numero_tarjeta IN NUMBER,
  p_monto          IN NUMBER,
  p_medio_pago     IN VARCHAR2,
  p_canal          IN VARCHAR2,
  p_id_estacion    IN NUMBER,
  o_transaccion    OUT NUMBER,
  o_saldo          OUT NUMBER
) IS
  v_saldo       TARJETA.saldo%TYPE;
  v_estado      TARJETA.estado%TYPE;
  v_vencimiento TARJETA.fecha_vencimiento%TYPE;
BEGIN
  IF p_monto IS NULL OR p_monto <= 0 THEN
    RAISE_APPLICATION_ERROR(-20070, 'El monto de la recarga debe ser mayor a cero');
  END IF;

  IF p_monto > 500 THEN
    RAISE_APPLICATION_ERROR(-20070, 'El monto maximo por recarga es de 500');
  END IF;

  BEGIN
    SELECT saldo, estado, fecha_vencimiento
      INTO v_saldo, v_estado, v_vencimiento
      FROM TARJETA
     WHERE numero_tarjeta = p_numero_tarjeta
       FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20071, 'La tarjeta ' || p_numero_tarjeta || ' no existe');
  END;

  IF v_estado <> 'ACTIVA' THEN
    RAISE_APPLICATION_ERROR(-20072, 'No se puede recargar una tarjeta ' || v_estado);
  END IF;

  IF v_vencimiento < TRUNC(SYSDATE) THEN
    RAISE_APPLICATION_ERROR(-20073, 'La tarjeta esta vencida');
  END IF;

  o_saldo := v_saldo + p_monto;
  o_transaccion := SEQ_RECARGA.NEXTVAL;

  INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago,
                       canal, id_estacion, saldo_anterior, saldo_posterior)
  VALUES (o_transaccion, p_numero_tarjeta, SYSDATE, p_monto, p_medio_pago,
          p_canal, p_id_estacion, v_saldo, o_saldo);

  UPDATE TARJETA SET saldo = o_saldo WHERE numero_tarjeta = p_numero_tarjeta;
END SP_RECARGAR_TARJETA;
/


-- Emite una tarjeta nueva (vence en 5 anios). p_id_pasajero NULL = tarjeta anonima.
-- Si trae saldo inicial se registra como una recarga.
CREATE OR REPLACE PROCEDURE SP_EMITIR_TARJETA (
  p_id_pasajero    IN NUMBER,
  p_codigo_tarifa  IN VARCHAR2,
  p_saldo_inicial  IN NUMBER,
  p_id_estacion    IN NUMBER,
  o_numero_tarjeta OUT NUMBER
) IS
  v_tipo_tarifa   TARIFA.tipo_pasajero%TYPE;
  v_estado_tarifa TARIFA.estado%TYPE;
  v_tipo_pasajero PASAJERO.tipo_pasajero%TYPE;
  v_estado_pas    PASAJERO.estado%TYPE;
  v_transaccion   NUMBER;
  v_saldo         NUMBER;
BEGIN
  BEGIN
    SELECT tipo_pasajero, estado INTO v_tipo_tarifa, v_estado_tarifa
      FROM TARIFA WHERE codigo_tarifa = p_codigo_tarifa;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20074, 'La tarifa ' || p_codigo_tarifa || ' no existe');
  END;

  IF v_estado_tarifa <> 'ACTIVA' THEN
    RAISE_APPLICATION_ERROR(-20074, 'La tarifa ' || p_codigo_tarifa || ' no esta activa');
  END IF;

  IF p_id_pasajero IS NOT NULL THEN
    BEGIN
      SELECT tipo_pasajero, estado INTO v_tipo_pasajero, v_estado_pas
        FROM PASAJERO WHERE id_pasajero = p_id_pasajero;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20075, 'El pasajero ' || p_id_pasajero || ' no existe');
    END;

    IF v_estado_pas <> 'ACTIVO' THEN
      RAISE_APPLICATION_ERROR(-20075, 'El pasajero esta inactivo');
    END IF;

    IF v_tipo_tarifa <> 'TODOS' AND v_tipo_tarifa <> v_tipo_pasajero THEN
      RAISE_APPLICATION_ERROR(-20076, 'La tarifa ' || p_codigo_tarifa || ' es solo para pasajeros tipo ' || v_tipo_tarifa);
    END IF;
  ELSE
    IF v_tipo_tarifa <> 'TODOS' THEN
      RAISE_APPLICATION_ERROR(-20076, 'Una tarjeta anonima solo puede tener tarifas generales');
    END IF;
  END IF;

  IF NVL(p_saldo_inicial, 0) < 0 THEN
    RAISE_APPLICATION_ERROR(-20070, 'El saldo inicial no puede ser negativo');
  END IF;

  o_numero_tarjeta := SEQ_TARJETA.NEXTVAL;
  INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision,
                       fecha_vencimiento, saldo, estado)
  VALUES (o_numero_tarjeta, p_id_pasajero, p_codigo_tarifa, SYSDATE,
          ADD_MONTHS(TRUNC(SYSDATE), 60), 0, 'ACTIVA');

  IF NVL(p_saldo_inicial, 0) > 0 THEN
    SP_RECARGAR_TARJETA(o_numero_tarjeta, p_saldo_inicial,
                        CASE WHEN p_id_estacion IS NULL THEN 'TARJETA_CREDITO' ELSE 'EFECTIVO' END,
                        CASE WHEN p_id_estacion IS NULL THEN 'WEB' ELSE 'TAQUILLA' END,
                        p_id_estacion, v_transaccion, v_saldo);
  END IF;
END SP_EMITIR_TARJETA;
/


-- Bloquear / reportar perdida / cancelar / volver a activar una tarjeta
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_ESTADO_TARJETA (
  p_numero_tarjeta IN NUMBER,
  p_estado         IN VARCHAR2
) IS
  v_actual      TARJETA.estado%TYPE;
  v_vencimiento TARJETA.fecha_vencimiento%TYPE;
BEGIN
  BEGIN
    SELECT estado, fecha_vencimiento INTO v_actual, v_vencimiento
      FROM TARJETA WHERE numero_tarjeta = p_numero_tarjeta FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20071, 'La tarjeta ' || p_numero_tarjeta || ' no existe');
  END;

  IF p_estado NOT IN ('ACTIVA','BLOQUEADA','PERDIDA','CANCELADA') THEN
    RAISE_APPLICATION_ERROR(-20077, 'Estado invalido: ' || p_estado);
  END IF;

  IF v_actual IN ('CANCELADA','PERDIDA') THEN
    RAISE_APPLICATION_ERROR(-20077, 'Una tarjeta ' || v_actual || ' ya no se puede modificar');
  END IF;

  IF p_estado = 'ACTIVA' THEN
    IF v_actual <> 'BLOQUEADA' THEN
      RAISE_APPLICATION_ERROR(-20077, 'Solo se puede reactivar una tarjeta bloqueada');
    END IF;
    IF v_vencimiento < TRUNC(SYSDATE) THEN
      RAISE_APPLICATION_ERROR(-20073, 'La tarjeta esta vencida, no se puede reactivar');
    END IF;
  END IF;

  UPDATE TARJETA SET estado = p_estado WHERE numero_tarjeta = p_numero_tarjeta;
END SP_CAMBIAR_ESTADO_TARJETA;
/


-- SP_REGISTRAR_INGRESO: valida la tarjeta, calcula la tarifa,
-- descuenta el saldo y registra el ingreso del pasajero.
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_INGRESO (
  p_numero_tarjeta IN NUMBER,
  p_id_estacion    IN NUMBER,
  o_transaccion    OUT NUMBER,
  o_monto          OUT NUMBER,
  o_saldo          OUT NUMBER
) IS
  v_saldo       TARJETA.saldo%TYPE;
  v_estado      TARJETA.estado%TYPE;
  v_vencimiento TARJETA.fecha_vencimiento%TYPE;
  v_tarifa      TARJETA.codigo_tarifa%TYPE;
  v_est_estado  ESTACION.estado_operativo%TYPE;
  v_cont        NUMBER;
BEGIN
  -- si un viaje quedo abierto mas de 4 horas (no marco salida) se cierra
  -- para que no bloquee la tarjeta para siempre
  UPDATE VIAJE_PASAJERO
     SET estado = 'SIN_SALIDA'
   WHERE numero_tarjeta = p_numero_tarjeta
     AND estado = 'ABIERTO'
     AND fecha_hora_ingreso < SYSDATE - 4/24;

  BEGIN
    SELECT saldo, estado, fecha_vencimiento, codigo_tarifa
      INTO v_saldo, v_estado, v_vencimiento, v_tarifa
      FROM TARJETA
     WHERE numero_tarjeta = p_numero_tarjeta
       FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20080, 'La tarjeta ' || p_numero_tarjeta || ' no existe');
  END;

  IF v_estado <> 'ACTIVA' THEN
    RAISE_APPLICATION_ERROR(-20081, 'La tarjeta esta ' || v_estado || ', no se puede usar');
  END IF;

  IF v_vencimiento < TRUNC(SYSDATE) THEN
    RAISE_APPLICATION_ERROR(-20082, 'La tarjeta esta vencida');
  END IF;

  BEGIN
    SELECT estado_operativo INTO v_est_estado FROM ESTACION WHERE id_estacion = p_id_estacion;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20083, 'La estacion ' || p_id_estacion || ' no existe');
  END;

  IF v_est_estado <> 'OPERATIVA' THEN
    RAISE_APPLICATION_ERROR(-20084, 'La estacion no esta operativa, no se permiten ingresos');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM VIAJE_PASAJERO
   WHERE numero_tarjeta = p_numero_tarjeta AND estado = 'ABIERTO';
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20085, 'La tarjeta ya tiene un viaje abierto');
  END IF;

  o_monto := FN_CALCULAR_TARIFA(p_numero_tarjeta);
  IF o_monto IS NULL THEN
    RAISE_APPLICATION_ERROR(-20086, 'La tarifa de la tarjeta no esta vigente');
  END IF;

  IF v_saldo < o_monto THEN
    RAISE_APPLICATION_ERROR(-20087, 'Saldo insuficiente. Saldo: ' || TO_CHAR(v_saldo, 'FM9990.00')
                                    || ', tarifa: ' || TO_CHAR(o_monto, 'FM9990.00'));
  END IF;

  o_saldo := v_saldo - o_monto;
  UPDATE TARJETA SET saldo = o_saldo WHERE numero_tarjeta = p_numero_tarjeta;

  o_transaccion := SEQ_VIAJE_PASAJERO.NEXTVAL;
  INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso,
                              fecha_hora_ingreso, codigo_tarifa, monto_cobrado, estado)
  VALUES (o_transaccion, 'TARJETA', p_numero_tarjeta, p_id_estacion,
          SYSDATE, v_tarifa, o_monto, 'ABIERTO');
END SP_REGISTRAR_INGRESO;
/


-- Registra la salida del pasajero (cierra el viaje abierto de la tarjeta)
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_SALIDA (
  p_numero_tarjeta IN NUMBER,
  p_id_estacion    IN NUMBER,
  o_transaccion    OUT NUMBER
) IS
  v_cont NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cont FROM ESTACION WHERE id_estacion = p_id_estacion;
  IF v_cont = 0 THEN
    RAISE_APPLICATION_ERROR(-20083, 'La estacion ' || p_id_estacion || ' no existe');
  END IF;

  BEGIN
    SELECT numero_transaccion INTO o_transaccion
      FROM VIAJE_PASAJERO
     WHERE numero_tarjeta = p_numero_tarjeta
       AND estado = 'ABIERTO'
     ORDER BY fecha_hora_ingreso DESC
     FETCH FIRST 1 ROW ONLY;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20088, 'La tarjeta no tiene ningun viaje abierto');
  END;

  UPDATE VIAJE_PASAJERO
     SET id_estacion_salida = p_id_estacion,
         fecha_hora_salida = SYSDATE,
         estado = 'COMPLETADO'
   WHERE numero_transaccion = o_transaccion;
END SP_REGISTRAR_SALIDA;
/


-- Viaje anonimo con boleto (sin tarjeta). Solo tarifas de viaje individual generales.
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_VIAJE_ANONIMO (
  p_id_estacion   IN NUMBER,
  p_codigo_tarifa IN VARCHAR2,
  o_transaccion   OUT NUMBER,
  o_monto         OUT NUMBER
) IS
  v_est_estado ESTACION.estado_operativo%TYPE;
  v_producto   TARIFA.tipo_producto%TYPE;
  v_tipo_pas   TARIFA.tipo_pasajero%TYPE;
  v_estado     TARIFA.estado%TYPE;
  v_vig_ini    DATE;
  v_vig_fin    DATE;
BEGIN
  BEGIN
    SELECT estado_operativo INTO v_est_estado FROM ESTACION WHERE id_estacion = p_id_estacion;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20083, 'La estacion ' || p_id_estacion || ' no existe');
  END;

  IF v_est_estado <> 'OPERATIVA' THEN
    RAISE_APPLICATION_ERROR(-20084, 'La estacion no esta operativa, no se permiten ingresos');
  END IF;

  BEGIN
    SELECT tipo_producto, tipo_pasajero, estado, fecha_inicio_vigencia, fecha_fin_vigencia, monto
      INTO v_producto, v_tipo_pas, v_estado, v_vig_ini, v_vig_fin, o_monto
      FROM TARIFA WHERE codigo_tarifa = p_codigo_tarifa;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20074, 'La tarifa ' || p_codigo_tarifa || ' no existe');
  END;

  IF v_estado <> 'ACTIVA' OR v_vig_ini > SYSDATE OR (v_vig_fin IS NOT NULL AND v_vig_fin < TRUNC(SYSDATE)) THEN
    RAISE_APPLICATION_ERROR(-20086, 'La tarifa no esta vigente');
  END IF;

  IF v_producto <> 'VIAJE_INDIVIDUAL' OR v_tipo_pas <> 'TODOS' THEN
    RAISE_APPLICATION_ERROR(-20089, 'Con boleto solo se puede usar la tarifa de viaje individual general');
  END IF;

  o_transaccion := SEQ_VIAJE_PASAJERO.NEXTVAL;
  INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso,
                              fecha_hora_ingreso, codigo_tarifa, monto_cobrado, estado)
  VALUES (o_transaccion, 'BOLETO', NULL, p_id_estacion,
          SYSDATE, p_codigo_tarifa, o_monto, 'SIN_SALIDA');
END SP_REGISTRAR_VIAJE_ANONIMO;
/


-- =============================================================
-- MODULO 6: MANTENIMIENTO
-- =============================================================

-- SP_CREAR_ORDEN_MANTENIMIENTO: crea la orden y cambia el estado del
-- equipo cuando es correctivo o urgente (y del tren si el equipo es un tren).
CREATE OR REPLACE PROCEDURE SP_CREAR_ORDEN_MANTENIMIENTO (
  p_id_equipo        IN VARCHAR2,
  p_tipo             IN VARCHAR2,
  p_descripcion      IN VARCHAR2,
  p_fecha_programada IN DATE,
  p_prioridad        IN VARCHAR2,
  p_id_tecnico       IN NUMBER,
  p_costo_mano_obra  IN NUMBER,
  o_numero_orden     OUT NUMBER
) IS
  v_estado_equipo EQUIPO.estado%TYPE;
  v_tren          EQUIPO.codigo_tren%TYPE;
  v_cargo         CARGO.codigo_cargo%TYPE;
  v_estado_emp    EMPLEADO.estado_laboral%TYPE;
BEGIN
  BEGIN
    SELECT estado, codigo_tren INTO v_estado_equipo, v_tren
      FROM EQUIPO WHERE id_equipo = p_id_equipo;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20090, 'El equipo ' || p_id_equipo || ' no existe');
  END;

  IF v_estado_equipo = 'RETIRADO' THEN
    RAISE_APPLICATION_ERROR(-20091, 'El equipo esta retirado');
  END IF;

  BEGIN
    SELECT c.codigo_cargo, e.estado_laboral INTO v_cargo, v_estado_emp
      FROM EMPLEADO e JOIN CARGO c ON c.id_cargo = e.id_cargo
     WHERE e.id_empleado = p_id_tecnico;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_tecnico || ' no existe');
  END;

  IF v_cargo <> 'TECNICO_MANT' OR v_estado_emp <> 'ACTIVO' THEN
    RAISE_APPLICATION_ERROR(-20092, 'El responsable debe ser un tecnico de mantenimiento activo');
  END IF;

  IF p_fecha_programada IS NOT NULL AND p_fecha_programada < TRUNC(SYSDATE) THEN
    RAISE_APPLICATION_ERROR(-20093, 'La fecha programada no puede ser en el pasado');
  END IF;

  o_numero_orden := SEQ_ORDEN.NEXTVAL;
  INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion,
                                   fecha_solicitud, fecha_programada, id_tecnico_responsable,
                                   prioridad, costo_mano_obra, estado)
  VALUES (o_numero_orden, p_id_equipo, p_tipo, p_descripcion,
          SYSDATE, TRUNC(p_fecha_programada), p_id_tecnico,
          NVL(p_prioridad, 'MEDIA'), NVL(p_costo_mano_obra, 0),
          CASE WHEN p_fecha_programada IS NULL THEN 'SOLICITADA' ELSE 'PROGRAMADA' END);

  INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
  VALUES (o_numero_orden, p_id_tecnico, 'RESPONSABLE', 0);

  -- si es una falla (correctivo) o urgente, el equipo pasa a mantenimiento
  IF p_tipo = 'CORRECTIVO' OR p_prioridad = 'URGENTE' THEN
    UPDATE EQUIPO SET estado = 'EN_MANTENIMIENTO'
     WHERE id_equipo = p_id_equipo AND estado = 'OPERATIVO';

    IF v_tren IS NOT NULL THEN
      UPDATE TREN SET estado_operativo = 'EN_MANTENIMIENTO'
       WHERE codigo_tren = v_tren AND estado_operativo = 'DISPONIBLE';
    END IF;
  END IF;
END SP_CREAR_ORDEN_MANTENIMIENTO;
/


CREATE OR REPLACE PROCEDURE SP_ASIGNAR_TECNICO (
  p_numero_orden IN NUMBER,
  p_id_empleado  IN NUMBER,
  p_rol          IN VARCHAR2
) IS
  v_estado_orden ORDEN_MANTENIMIENTO.estado%TYPE;
  v_cargo        CARGO.codigo_cargo%TYPE;
  v_estado_emp   EMPLEADO.estado_laboral%TYPE;
  v_cont         NUMBER;
BEGIN
  BEGIN
    SELECT estado INTO v_estado_orden FROM ORDEN_MANTENIMIENTO WHERE numero_orden = p_numero_orden;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20094, 'La orden ' || p_numero_orden || ' no existe');
  END;

  IF v_estado_orden IN ('COMPLETADA','CANCELADA') THEN
    RAISE_APPLICATION_ERROR(-20095, 'La orden ya esta cerrada');
  END IF;

  BEGIN
    SELECT c.codigo_cargo, e.estado_laboral INTO v_cargo, v_estado_emp
      FROM EMPLEADO e JOIN CARGO c ON c.id_cargo = e.id_cargo
     WHERE e.id_empleado = p_id_empleado;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20060, 'El empleado ' || p_id_empleado || ' no existe');
  END;

  IF v_cargo <> 'TECNICO_MANT' OR v_estado_emp <> 'ACTIVO' THEN
    RAISE_APPLICATION_ERROR(-20092, 'Solo se pueden asignar tecnicos de mantenimiento activos');
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM ORDEN_TECNICO WHERE numero_orden = p_numero_orden AND id_empleado = p_id_empleado;
  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20096, 'El tecnico ya esta asignado a la orden');
  END IF;

  -- si viene como responsable, el anterior responsable pasa a apoyo
  IF NVL(p_rol, 'APOYO') = 'RESPONSABLE' THEN
    UPDATE ORDEN_TECNICO SET rol = 'APOYO'
     WHERE numero_orden = p_numero_orden AND rol = 'RESPONSABLE';
    UPDATE ORDEN_MANTENIMIENTO SET id_tecnico_responsable = p_id_empleado
     WHERE numero_orden = p_numero_orden;
  END IF;

  INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
  VALUES (p_numero_orden, p_id_empleado, NVL(p_rol, 'APOYO'), 0);
END SP_ASIGNAR_TECNICO;
/


-- Registra repuestos usados en una orden (descuenta del stock)
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_REPUESTO (
  p_numero_orden IN NUMBER,
  p_id_repuesto  IN NUMBER,
  p_cantidad     IN NUMBER
) IS
  v_estado_orden ORDEN_MANTENIMIENTO.estado%TYPE;
  v_stock        REPUESTO.stock%TYPE;
  v_costo        REPUESTO.costo_unitario%TYPE;
BEGIN
  IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
    RAISE_APPLICATION_ERROR(-20097, 'La cantidad debe ser mayor a cero');
  END IF;

  BEGIN
    SELECT estado INTO v_estado_orden FROM ORDEN_MANTENIMIENTO WHERE numero_orden = p_numero_orden;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20094, 'La orden ' || p_numero_orden || ' no existe');
  END;

  IF v_estado_orden IN ('COMPLETADA','CANCELADA') THEN
    RAISE_APPLICATION_ERROR(-20095, 'La orden ya esta cerrada');
  END IF;

  BEGIN
    SELECT stock, costo_unitario INTO v_stock, v_costo
      FROM REPUESTO WHERE id_repuesto = p_id_repuesto FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20098, 'El repuesto ' || p_id_repuesto || ' no existe');
  END;

  IF v_stock < p_cantidad THEN
    RAISE_APPLICATION_ERROR(-20099, 'No hay suficiente stock (disponible: ' || v_stock || ')');
  END IF;

  UPDATE REPUESTO SET stock = stock - p_cantidad WHERE id_repuesto = p_id_repuesto;

  UPDATE ORDEN_REPUESTO
     SET cantidad = cantidad + p_cantidad
   WHERE numero_orden = p_numero_orden AND id_repuesto = p_id_repuesto;

  IF SQL%ROWCOUNT = 0 THEN
    INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
    VALUES (p_numero_orden, p_id_repuesto, p_cantidad, v_costo);
  END IF;
END SP_REGISTRAR_REPUESTO;
/


-- Cambia el estado de una orden y actualiza equipo/tren segun corresponda.
-- Al completar: el equipo vuelve a OPERATIVO, se actualiza la ultima revision
-- y se programa la proxima (fecha + frecuencia del equipo).
CREATE OR REPLACE PROCEDURE SP_CAMBIAR_ESTADO_ORDEN (
  p_numero_orden IN NUMBER,
  p_estado       IN VARCHAR2
) IS
  v_actual     ORDEN_MANTENIMIENTO.estado%TYPE;
  v_id_equipo  ORDEN_MANTENIMIENTO.id_equipo%TYPE;
  v_tren       EQUIPO.codigo_tren%TYPE;
  v_frecuencia EQUIPO.frecuencia_revision_dias%TYPE;
  v_estado_tren TREN.estado_operativo%TYPE;
  v_valido     BOOLEAN := FALSE;
  v_otras      NUMBER;
BEGIN
  BEGIN
    SELECT o.estado, o.id_equipo, e.codigo_tren, e.frecuencia_revision_dias
      INTO v_actual, v_id_equipo, v_tren, v_frecuencia
      FROM ORDEN_MANTENIMIENTO o
      JOIN EQUIPO e ON e.id_equipo = o.id_equipo
     WHERE o.numero_orden = p_numero_orden
       FOR UPDATE OF o.estado;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20094, 'La orden ' || p_numero_orden || ' no existe');
  END;

  IF v_actual IN ('COMPLETADA','CANCELADA') THEN
    RAISE_APPLICATION_ERROR(-20095, 'La orden ya esta cerrada');
  END IF;

  -- transiciones permitidas
  IF (v_actual = 'SOLICITADA'   AND p_estado IN ('PROGRAMADA','EN_EJECUCION','CANCELADA'))
  OR (v_actual = 'PROGRAMADA'   AND p_estado IN ('EN_EJECUCION','SUSPENDIDA','CANCELADA'))
  OR (v_actual = 'EN_EJECUCION' AND p_estado IN ('SUSPENDIDA','COMPLETADA'))
  OR (v_actual = 'SUSPENDIDA'   AND p_estado IN ('EN_EJECUCION','CANCELADA')) THEN
    v_valido := TRUE;
  END IF;

  IF NOT v_valido THEN
    RAISE_APPLICATION_ERROR(-20100, 'No se puede pasar de ' || v_actual || ' a ' || p_estado);
  END IF;

  IF p_estado = 'PROGRAMADA' THEN
    UPDATE ORDEN_MANTENIMIENTO
       SET estado = p_estado, fecha_programada = NVL(fecha_programada, TRUNC(SYSDATE))
     WHERE numero_orden = p_numero_orden;

  ELSIF p_estado = 'EN_EJECUCION' THEN
    IF v_tren IS NOT NULL THEN
      SELECT estado_operativo INTO v_estado_tren FROM TREN WHERE codigo_tren = v_tren;
      IF v_estado_tren = 'EN_OPERACION' THEN
        RAISE_APPLICATION_ERROR(-20101, 'El tren esta en operacion, no se puede iniciar el mantenimiento');
      END IF;
      UPDATE TREN SET estado_operativo = 'EN_MANTENIMIENTO'
       WHERE codigo_tren = v_tren AND estado_operativo = 'DISPONIBLE';
    END IF;

    UPDATE ORDEN_MANTENIMIENTO
       SET estado = p_estado, fecha_inicio = NVL(fecha_inicio, SYSDATE)
     WHERE numero_orden = p_numero_orden;

    UPDATE EQUIPO SET estado = 'EN_MANTENIMIENTO'
     WHERE id_equipo = v_id_equipo AND estado <> 'RETIRADO';

  ELSIF p_estado = 'SUSPENDIDA' THEN
    UPDATE ORDEN_MANTENIMIENTO SET estado = p_estado WHERE numero_orden = p_numero_orden;

  ELSE
    -- COMPLETADA o CANCELADA
    IF p_estado = 'COMPLETADA' THEN
      UPDATE ORDEN_MANTENIMIENTO
         SET estado = p_estado, fecha_fin = SYSDATE
       WHERE numero_orden = p_numero_orden;

      UPDATE EQUIPO
         SET fecha_ultima_revision = TRUNC(SYSDATE),
             fecha_proxima_revision = TRUNC(SYSDATE) + v_frecuencia
       WHERE id_equipo = v_id_equipo;

      IF v_tren IS NOT NULL THEN
        UPDATE TREN
           SET fecha_ultima_inspeccion = TRUNC(SYSDATE),
               fecha_proxima_inspeccion = TRUNC(SYSDATE) + v_frecuencia
         WHERE codigo_tren = v_tren;
      END IF;
    ELSE
      UPDATE ORDEN_MANTENIMIENTO SET estado = p_estado WHERE numero_orden = p_numero_orden;
    END IF;

    -- si ya no queda otra orden en ejecucion, el equipo (y el tren) se liberan
    SELECT COUNT(*) INTO v_otras
      FROM ORDEN_MANTENIMIENTO
     WHERE id_equipo = v_id_equipo
       AND estado = 'EN_EJECUCION'
       AND numero_orden <> p_numero_orden;

    IF v_otras = 0 THEN
      UPDATE EQUIPO SET estado = 'OPERATIVO'
       WHERE id_equipo = v_id_equipo AND estado = 'EN_MANTENIMIENTO';

      IF v_tren IS NOT NULL THEN
        UPDATE TREN SET estado_operativo = 'DISPONIBLE'
         WHERE codigo_tren = v_tren AND estado_operativo = 'EN_MANTENIMIENTO';
      END IF;
    END IF;
  END IF;
END SP_CAMBIAR_ESTADO_ORDEN;
/


-- =============================================================
-- MODULO 7: INCIDENTES
-- =============================================================

-- Agrega un elemento afectado a un incidente y aplica el efecto:
--   CIERRE_ESTACION   -> estacion CERRADA
--   CIERRE_PLATAFORMA -> plataforma CERRADA
--   RETIRO_TREN       -> tren FUERA_SERVICIO (y se quita de viajes futuros)
--   SUSPENSION_TRAMO  -> ruta(s) SUSPENDIDA
--   CAMBIO_RUTA       -> ruta MODIFICADA
--   RETRASO / CANCELACION en un viaje -> viaje RETRASADO / CANCELADO
-- p_id_elemento es el id segun el tipo (para TRAMO es la linea y se usan
-- p_id_estacion_ini y p_id_estacion_fin).
CREATE OR REPLACE PROCEDURE SP_AGREGAR_ELEMENTO_INCIDENTE (
  p_numero_incidente IN NUMBER,
  p_tipo_elemento    IN VARCHAR2,
  p_id_elemento      IN VARCHAR2,
  p_efecto           IN VARCHAR2,
  p_id_estacion_ini  IN NUMBER,
  p_id_estacion_fin  IN NUMBER,
  p_minutos_retraso  IN NUMBER,
  p_descripcion      IN VARCHAR2
) IS
  v_estado_inc INCIDENTE.estado%TYPE;
  v_efecto     VARCHAR2(20) := NVL(p_efecto, 'NINGUNO');
  v_estacion   NUMBER;
  v_plataforma NUMBER;
  v_tren       VARCHAR2(10);
  v_ruta       NUMBER;
  v_equipo     VARCHAR2(20);
  v_viaje      NUMBER;
  v_linea      VARCHAR2(5);
  v_est_fin    NUMBER;
  v_cont       NUMBER;
BEGIN
  BEGIN
    SELECT estado INTO v_estado_inc FROM INCIDENTE WHERE numero_incidente = p_numero_incidente;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20110, 'El incidente ' || p_numero_incidente || ' no existe');
  END;

  IF v_estado_inc = 'CERRADO' THEN
    RAISE_APPLICATION_ERROR(-20111, 'El incidente ya esta cerrado');
  END IF;

  CASE p_tipo_elemento
    WHEN 'ESTACION' THEN
      v_estacion := TO_NUMBER(p_id_elemento);
      IF v_efecto = 'CIERRE_ESTACION' THEN
        UPDATE ESTACION SET estado_operativo = 'CERRADA' WHERE id_estacion = v_estacion;
      END IF;

    WHEN 'PLATAFORMA' THEN
      v_plataforma := TO_NUMBER(p_id_elemento);
      IF v_efecto = 'CIERRE_PLATAFORMA' THEN
        UPDATE PLATAFORMA SET estado_operativo = 'CERRADA' WHERE id_plataforma = v_plataforma;
      END IF;

    WHEN 'TREN' THEN
      v_tren := p_id_elemento;
      IF v_efecto = 'RETIRO_TREN' THEN
        UPDATE TREN SET estado_operativo = 'FUERA_SERVICIO' WHERE codigo_tren = v_tren;
        UPDATE VIAJE_PROGRAMADO
           SET codigo_tren = NULL
         WHERE codigo_tren = v_tren
           AND estado_viaje IN ('PROGRAMADO','RETRASADO')
           AND salida_programada > SYSDATE;
      END IF;

    WHEN 'RUTA' THEN
      v_ruta := TO_NUMBER(p_id_elemento);
      IF v_efecto = 'SUSPENSION_TRAMO' THEN
        UPDATE RUTA SET estado = 'SUSPENDIDA' WHERE id_ruta = v_ruta;
      ELSIF v_efecto = 'CAMBIO_RUTA' THEN
        UPDATE RUTA SET estado = 'MODIFICADA' WHERE id_ruta = v_ruta;
      END IF;

    WHEN 'EQUIPO' THEN
      -- el estado del equipo se maneja con las ordenes de mantenimiento
      v_equipo := p_id_elemento;

    WHEN 'VIAJE' THEN
      v_viaje := TO_NUMBER(p_id_elemento);
      IF v_efecto = 'RETRASO' THEN
        UPDATE VIAJE_PROGRAMADO SET estado_viaje = 'RETRASADO'
         WHERE numero_viaje = v_viaje
           AND estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','EN_CURSO');
      ELSIF v_efecto = 'CANCELACION' THEN
        UPDATE VIAJE_PROGRAMADO
           SET estado_viaje = 'CANCELADO',
               motivo_cancelacion = 'Incidente #' || p_numero_incidente
         WHERE numero_viaje = v_viaje
           AND estado_viaje NOT IN ('COMPLETADO','CANCELADO');
      END IF;

    WHEN 'TRAMO' THEN
      v_linea := p_id_elemento;
      v_estacion := p_id_estacion_ini;
      v_est_fin := p_id_estacion_fin;

      SELECT COUNT(*) INTO v_cont
        FROM LINEA_ESTACION
       WHERE id_linea = v_linea AND id_estacion IN (v_estacion, v_est_fin);
      IF v_cont < 2 OR v_estacion = v_est_fin THEN
        RAISE_APPLICATION_ERROR(-20112, 'El tramo debe ser entre dos estaciones distintas de la linea ' || v_linea);
      END IF;

      -- se suspenden las rutas de la linea que pasan por las dos estaciones
      IF v_efecto = 'SUSPENSION_TRAMO' THEN
        UPDATE RUTA r
           SET r.estado = 'SUSPENDIDA'
         WHERE r.id_linea = v_linea
           AND r.estado = 'ACTIVA'
           AND EXISTS (SELECT 1 FROM RUTA_ESTACION a WHERE a.id_ruta = r.id_ruta AND a.id_estacion = v_estacion)
           AND EXISTS (SELECT 1 FROM RUTA_ESTACION b WHERE b.id_ruta = r.id_ruta AND b.id_estacion = v_est_fin);
      END IF;

    ELSE
      RAISE_APPLICATION_ERROR(-20113, 'Tipo de elemento invalido: ' || p_tipo_elemento);
  END CASE;

  INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma,
                                  codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin,
                                  tipo_efecto, minutos_retraso, descripcion)
  VALUES (SEQ_ELEMENTO.NEXTVAL, p_numero_incidente, p_tipo_elemento, v_estacion, v_plataforma,
          v_tren, v_ruta, v_equipo, v_viaje, v_linea, v_est_fin,
          v_efecto, p_minutos_retraso, p_descripcion);
END SP_AGREGAR_ELEMENTO_INCIDENTE;
/


-- SP_REGISTRAR_INCIDENTE: registra el incidente y, si viene, el primer
-- elemento afectado. Para mas elementos se usa SP_AGREGAR_ELEMENTO_INCIDENTE.
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_INCIDENTE (
  p_tipo             IN VARCHAR2,
  p_descripcion      IN VARCHAR2,
  p_fecha_inicio     IN DATE,
  p_lugar            IN VARCHAR2,
  p_severidad        IN VARCHAR2,
  p_id_reporta       IN NUMBER,
  p_reportado_por    IN VARCHAR2,
  p_causa            IN VARCHAR2,
  p_pasajeros        IN NUMBER,
  p_tipo_elemento    IN VARCHAR2,
  p_id_elemento      IN VARCHAR2,
  p_efecto           IN VARCHAR2,
  o_numero_incidente OUT NUMBER
) IS
BEGIN
  IF p_id_reporta IS NULL AND p_reportado_por IS NULL THEN
    RAISE_APPLICATION_ERROR(-20114, 'Hay que indicar quien reporto el incidente');
  END IF;

  IF p_fecha_inicio IS NOT NULL AND p_fecha_inicio > SYSDATE THEN
    RAISE_APPLICATION_ERROR(-20115, 'La fecha de inicio no puede ser futura');
  END IF;

  o_numero_incidente := SEQ_INCIDENTE.NEXTVAL;
  INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio,
                         lugar_afectado, severidad, id_empleado_reporta, reportado_por,
                         estado, causa_identificada, pasajeros_afectados)
  VALUES (o_numero_incidente, p_tipo, p_descripcion, NVL(p_fecha_inicio, SYSDATE),
          p_lugar, p_severidad, p_id_reporta, p_reportado_por,
          'ABIERTO', p_causa, NVL(p_pasajeros, 0));

  IF p_tipo_elemento IS NOT NULL THEN
    SP_AGREGAR_ELEMENTO_INCIDENTE(o_numero_incidente, p_tipo_elemento, p_id_elemento, p_efecto,
                                  NULL, NULL, NULL, NULL);
  END IF;
END SP_REGISTRAR_INCIDENTE;
/


-- Agrega una accion correctiva al historial de acciones del incidente
CREATE OR REPLACE PROCEDURE SP_REGISTRAR_ACCION_INCIDENTE (
  p_numero_incidente IN NUMBER,
  p_accion           IN VARCHAR2
) IS
BEGIN
  UPDATE INCIDENTE
     SET acciones_realizadas = SUBSTR(
           acciones_realizadas
           || CASE WHEN acciones_realizadas IS NOT NULL THEN CHR(10) END
           || TO_CHAR(SYSDATE, 'DD/MM/YYYY HH24:MI') || ' - ' || p_accion, 1, 2000),
         estado = 'EN_ATENCION'
   WHERE numero_incidente = p_numero_incidente
     AND estado <> 'CERRADO';

  IF SQL%ROWCOUNT = 0 THEN
    RAISE_APPLICATION_ERROR(-20110, 'El incidente no existe o ya esta cerrado');
  END IF;
END SP_REGISTRAR_ACCION_INCIDENTE;
/


-- Cierra el incidente. Si p_restablecer = 'S' vuelve a abrir las estaciones,
-- plataformas y rutas que habia cerrado (solo si ningun otro incidente
-- abierto las sigue afectando). Los trenes retirados NO se restablecen,
-- esos tienen que pasar por mantenimiento.
CREATE OR REPLACE PROCEDURE SP_CERRAR_INCIDENTE (
  p_numero_incidente IN NUMBER,
  p_fecha_fin        IN DATE,
  p_causa            IN VARCHAR2,
  p_restablecer      IN VARCHAR2
) IS
  v_inicio DATE;
  v_estado INCIDENTE.estado%TYPE;
  v_fin    DATE := NVL(p_fecha_fin, SYSDATE);
  v_cont   NUMBER;
BEGIN
  BEGIN
    SELECT fecha_hora_inicio, estado INTO v_inicio, v_estado
      FROM INCIDENTE WHERE numero_incidente = p_numero_incidente FOR UPDATE;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20110, 'El incidente ' || p_numero_incidente || ' no existe');
  END;

  IF v_estado = 'CERRADO' THEN
    RAISE_APPLICATION_ERROR(-20111, 'El incidente ya esta cerrado');
  END IF;

  IF v_fin < v_inicio THEN
    RAISE_APPLICATION_ERROR(-20116, 'La fecha de fin no puede ser anterior a la de inicio');
  END IF;

  UPDATE INCIDENTE
     SET estado = 'CERRADO',
         fecha_hora_fin = v_fin,
         causa_identificada = NVL(p_causa, causa_identificada)
   WHERE numero_incidente = p_numero_incidente;

  IF NVL(p_restablecer, 'S') = 'S' THEN
    FOR el IN (SELECT * FROM INCIDENTE_ELEMENTO WHERE numero_incidente = p_numero_incidente) LOOP

      IF el.tipo_efecto = 'CIERRE_ESTACION' THEN
        SELECT COUNT(*) INTO v_cont
          FROM INCIDENTE_ELEMENTO ie JOIN INCIDENTE i ON i.numero_incidente = ie.numero_incidente
         WHERE i.estado <> 'CERRADO' AND ie.tipo_efecto = 'CIERRE_ESTACION' AND ie.id_estacion = el.id_estacion;
        IF v_cont = 0 THEN
          UPDATE ESTACION SET estado_operativo = 'OPERATIVA'
           WHERE id_estacion = el.id_estacion AND estado_operativo = 'CERRADA';
        END IF;

      ELSIF el.tipo_efecto = 'CIERRE_PLATAFORMA' THEN
        SELECT COUNT(*) INTO v_cont
          FROM INCIDENTE_ELEMENTO ie JOIN INCIDENTE i ON i.numero_incidente = ie.numero_incidente
         WHERE i.estado <> 'CERRADO' AND ie.tipo_efecto = 'CIERRE_PLATAFORMA' AND ie.id_plataforma = el.id_plataforma;
        IF v_cont = 0 THEN
          UPDATE PLATAFORMA SET estado_operativo = 'OPERATIVA'
           WHERE id_plataforma = el.id_plataforma AND estado_operativo = 'CERRADA';
        END IF;

      ELSIF el.tipo_efecto IN ('SUSPENSION_TRAMO','CAMBIO_RUTA') AND el.tipo_elemento = 'RUTA' THEN
        SELECT COUNT(*) INTO v_cont
          FROM INCIDENTE_ELEMENTO ie JOIN INCIDENTE i ON i.numero_incidente = ie.numero_incidente
         WHERE i.estado <> 'CERRADO' AND ie.id_ruta = el.id_ruta
           AND ie.tipo_efecto IN ('SUSPENSION_TRAMO','CAMBIO_RUTA');
        IF v_cont = 0 THEN
          UPDATE RUTA SET estado = 'ACTIVA'
           WHERE id_ruta = el.id_ruta AND estado IN ('SUSPENDIDA','MODIFICADA');
        END IF;

      ELSIF el.tipo_efecto = 'SUSPENSION_TRAMO' AND el.tipo_elemento = 'TRAMO' THEN
        UPDATE RUTA r
           SET r.estado = 'ACTIVA'
         WHERE r.id_linea = el.id_linea
           AND r.estado = 'SUSPENDIDA'
           AND EXISTS (SELECT 1 FROM RUTA_ESTACION a WHERE a.id_ruta = r.id_ruta AND a.id_estacion = el.id_estacion)
           AND EXISTS (SELECT 1 FROM RUTA_ESTACION b WHERE b.id_ruta = r.id_ruta AND b.id_estacion = el.id_estacion_fin)
           AND NOT EXISTS (SELECT 1 FROM INCIDENTE_ELEMENTO ie JOIN INCIDENTE i ON i.numero_incidente = ie.numero_incidente
                            WHERE i.estado <> 'CERRADO' AND ie.id_ruta = r.id_ruta
                              AND ie.tipo_efecto IN ('SUSPENSION_TRAMO','CAMBIO_RUTA'));
      END IF;
    END LOOP;
  END IF;
END SP_CERRAR_INCIDENTE;
/

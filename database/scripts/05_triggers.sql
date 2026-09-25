-- =============================================================
-- 05_triggers.sql
-- Triggers del sistema
-- =============================================================


-- 1. Impedir que el saldo de una tarjeta sea negativo
--    (tambien esta el CHECK, pero asi el mensaje es mas claro).
--    De paso, si la tarjeta ya paso su fecha se marca como VENCIDA.
CREATE OR REPLACE TRIGGER TRG_TARJETA_SALDO
BEFORE INSERT OR UPDATE ON TARJETA
FOR EACH ROW
BEGIN
  IF :NEW.saldo < 0 THEN
    RAISE_APPLICATION_ERROR(-20150, 'El saldo de la tarjeta no puede quedar negativo');
  END IF;

  IF :NEW.estado = 'ACTIVA' AND :NEW.fecha_vencimiento < TRUNC(SYSDATE) THEN
    :NEW.estado := 'VENCIDA';
  END IF;
END;
/


-- 2. Registrar cambios de estado de los trenes
CREATE OR REPLACE TRIGGER TRG_TREN_ESTADO_LOG
AFTER UPDATE OF estado_operativo ON TREN
FOR EACH ROW
WHEN (NEW.estado_operativo <> OLD.estado_operativo)
BEGIN
  SP_BITACORA('TREN', :NEW.codigo_tren, 'CAMBIO_ESTADO',
              :OLD.estado_operativo, :NEW.estado_operativo);
END;
/


-- 3. Registrar cambios de tarifas.
--    Si cambia el monto se guarda el precio anterior en HISTORIAL_TARIFA
--    y la nueva vigencia empieza hoy (si no la mandaron).
CREATE OR REPLACE TRIGGER TRG_TARIFA_HISTORIAL
BEFORE UPDATE ON TARIFA
FOR EACH ROW
BEGIN
  IF :NEW.monto <> :OLD.monto THEN
    INSERT INTO HISTORIAL_TARIFA (id_historial, codigo_tarifa, monto_anterior, monto_nuevo,
                                  vigente_desde, vigente_hasta, fecha_cambio, usuario)
    VALUES (SEQ_HIST_TARIFA.NEXTVAL, :OLD.codigo_tarifa, :OLD.monto, :NEW.monto,
            :OLD.fecha_inicio_vigencia, SYSDATE, SYSDATE, USER);

    IF :NEW.fecha_inicio_vigencia = :OLD.fecha_inicio_vigencia THEN
      :NEW.fecha_inicio_vigencia := TRUNC(SYSDATE);
    END IF;

    SP_BITACORA('TARIFA', :NEW.codigo_tarifa, 'CAMBIO_PRECIO',
                TO_CHAR(:OLD.monto), TO_CHAR(:NEW.monto));
  END IF;

  IF :NEW.estado <> :OLD.estado THEN
    SP_BITACORA('TARIFA', :NEW.codigo_tarifa, 'CAMBIO_ESTADO', :OLD.estado, :NEW.estado);
  END IF;
END;
/


-- 4. Actualizar el estado del tren cuando inicia un viaje
CREATE OR REPLACE TRIGGER TRG_VIAJE_INICIA_TREN
AFTER UPDATE OF estado_viaje ON VIAJE_PROGRAMADO
FOR EACH ROW
WHEN (NEW.estado_viaje = 'EN_CURSO' AND OLD.estado_viaje <> 'EN_CURSO')
BEGIN
  IF :NEW.codigo_tren IS NOT NULL THEN
    UPDATE TREN
       SET estado_operativo = 'EN_OPERACION'
     WHERE codigo_tren = :NEW.codigo_tren;
  END IF;
END;
/


-- 5. Liberar el tren cuando el viaje termina o se cancela
CREATE OR REPLACE TRIGGER TRG_VIAJE_LIBERA_TREN
AFTER UPDATE OF estado_viaje ON VIAJE_PROGRAMADO
FOR EACH ROW
WHEN (NEW.estado_viaje IN ('COMPLETADO','CANCELADO') AND OLD.estado_viaje NOT IN ('COMPLETADO','CANCELADO'))
BEGIN
  IF :NEW.codigo_tren IS NOT NULL THEN
    UPDATE TREN
       SET estado_operativo = 'DISPONIBLE'
     WHERE codigo_tren = :NEW.codigo_tren
       AND estado_operativo = 'EN_OPERACION';
  END IF;
END;
/


-- 6. Impedir asignar un tren en mantenimiento (o fuera de servicio) a un viaje
CREATE OR REPLACE TRIGGER TRG_VIAJE_VALIDA_TREN
BEFORE INSERT OR UPDATE OF codigo_tren ON VIAJE_PROGRAMADO
FOR EACH ROW
WHEN (NEW.codigo_tren IS NOT NULL)
DECLARE
  v_estado TREN.estado_operativo%TYPE;
  v_cont   NUMBER;
BEGIN
  SELECT estado_operativo INTO v_estado
    FROM TREN
   WHERE codigo_tren = :NEW.codigo_tren;

  IF v_estado IN ('EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO') THEN
    RAISE_APPLICATION_ERROR(-20151, 'No se puede asignar el tren ' || :NEW.codigo_tren
                                    || ' porque esta ' || v_estado);
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM ORDEN_MANTENIMIENTO o
    JOIN EQUIPO e ON e.id_equipo = o.id_equipo
   WHERE e.codigo_tren = :NEW.codigo_tren
     AND o.estado = 'EN_EJECUCION';

  IF v_cont > 0 THEN
    RAISE_APPLICATION_ERROR(-20152, 'El tren ' || :NEW.codigo_tren || ' tiene un mantenimiento en ejecucion');
  END IF;
END;
/


-- 7. Alerta cuando una certificacion esta vencida.
--    Si se guarda como VIGENTE pero ya paso la fecha, se cambia a VENCIDA.
CREATE OR REPLACE TRIGGER TRG_CERTIFICACION_ALERTA
BEFORE INSERT OR UPDATE ON CERTIFICACION
FOR EACH ROW
BEGIN
  IF :NEW.estado = 'VIGENTE' AND :NEW.fecha_vencimiento < TRUNC(SYSDATE) THEN
    :NEW.estado := 'VENCIDA';
  END IF;

  IF :NEW.estado = 'VENCIDA' AND (INSERTING OR :OLD.estado <> 'VENCIDA') THEN
    SP_BITACORA('CERTIFICACION', TO_CHAR(:NEW.id_certificacion), 'CERTIFICACION_VENCIDA',
                NULL, 'VENCIDA', 'ALERTA',
                'La certificacion "' || :NEW.tipo_certificacion || '" del empleado '
                || :NEW.id_empleado || ' vencio el ' || TO_CHAR(:NEW.fecha_vencimiento, 'DD/MM/YYYY'));
  END IF;
END;
/


-- 8. Una estacion cerrada no permite nuevos ingresos
--    (aunque alguien inserte directo sin usar el procedimiento)
CREATE OR REPLACE TRIGGER TRG_VPAS_ESTACION_OPERATIVA
BEFORE INSERT ON VIAJE_PASAJERO
FOR EACH ROW
DECLARE
  v_estado ESTACION.estado_operativo%TYPE;
BEGIN
  SELECT estado_operativo INTO v_estado
    FROM ESTACION
   WHERE id_estacion = :NEW.id_estacion_ingreso;

  IF v_estado <> 'OPERATIVA' THEN
    RAISE_APPLICATION_ERROR(-20153, 'La estacion ' || :NEW.id_estacion_ingreso
                                    || ' no esta operativa, no se permiten ingresos');
  END IF;
END;
/


-- 9. Una estacion solo puede ser de TRANSFERENCIA si tiene al menos dos lineas
CREATE OR REPLACE TRIGGER TRG_ESTACION_TRANSFERENCIA
BEFORE INSERT OR UPDATE OF tipo_estacion ON ESTACION
FOR EACH ROW
WHEN (NEW.tipo_estacion = 'TRANSFERENCIA')
DECLARE
  v_lineas NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_lineas
    FROM LINEA_ESTACION
   WHERE id_estacion = :NEW.id_estacion;

  IF v_lineas < 2 THEN
    RAISE_APPLICATION_ERROR(-20154, 'Una estacion de transferencia debe estar asociada al menos a dos lineas');
  END IF;
END;
/


-- -------------------------------------------------------------
-- Bitacora de cambios importantes
-- -------------------------------------------------------------

CREATE OR REPLACE TRIGGER TRG_BIT_TARJETA
AFTER UPDATE OF estado ON TARJETA
FOR EACH ROW
WHEN (NEW.estado <> OLD.estado)
BEGIN
  SP_BITACORA('TARJETA', TO_CHAR(:NEW.numero_tarjeta), 'CAMBIO_ESTADO', :OLD.estado, :NEW.estado);
END;
/

CREATE OR REPLACE TRIGGER TRG_BIT_VIAJE
AFTER UPDATE OF estado_viaje ON VIAJE_PROGRAMADO
FOR EACH ROW
WHEN (NEW.estado_viaje <> OLD.estado_viaje)
BEGIN
  SP_BITACORA('VIAJE_PROGRAMADO', TO_CHAR(:NEW.numero_viaje), 'CAMBIO_ESTADO',
              :OLD.estado_viaje, :NEW.estado_viaje, 'CAMBIO', :NEW.motivo_cancelacion);
END;
/

CREATE OR REPLACE TRIGGER TRG_BIT_ORDEN
AFTER UPDATE OF estado ON ORDEN_MANTENIMIENTO
FOR EACH ROW
WHEN (NEW.estado <> OLD.estado)
BEGIN
  SP_BITACORA('ORDEN_MANTENIMIENTO', TO_CHAR(:NEW.numero_orden), 'CAMBIO_ESTADO', :OLD.estado, :NEW.estado);
END;
/

CREATE OR REPLACE TRIGGER TRG_BIT_INCIDENTE
AFTER INSERT OR UPDATE OF estado ON INCIDENTE
FOR EACH ROW
BEGIN
  IF INSERTING THEN
    SP_BITACORA('INCIDENTE', TO_CHAR(:NEW.numero_incidente), 'REGISTRO', NULL, :NEW.estado,
                CASE WHEN :NEW.severidad = 'CRITICO' THEN 'ALERTA' ELSE 'CAMBIO' END,
                :NEW.tipo_incidente || ' (' || :NEW.severidad || ') en ' || :NEW.lugar_afectado);
  ELSIF :NEW.estado <> :OLD.estado THEN
    SP_BITACORA('INCIDENTE', TO_CHAR(:NEW.numero_incidente), 'CAMBIO_ESTADO', :OLD.estado, :NEW.estado);
  END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_BIT_ESTACION
AFTER UPDATE OF estado_operativo ON ESTACION
FOR EACH ROW
WHEN (NEW.estado_operativo <> OLD.estado_operativo)
BEGIN
  SP_BITACORA('ESTACION', TO_CHAR(:NEW.id_estacion), 'CAMBIO_ESTADO',
              :OLD.estado_operativo, :NEW.estado_operativo);
END;
/

CREATE OR REPLACE TRIGGER TRG_BIT_LINEA
AFTER UPDATE OF estado_operativo ON LINEA
FOR EACH ROW
WHEN (NEW.estado_operativo <> OLD.estado_operativo)
BEGIN
  SP_BITACORA('LINEA', :NEW.id_linea, 'CAMBIO_ESTADO', :OLD.estado_operativo, :NEW.estado_operativo);
END;
/


-- -------------------------------------------------------------
-- Los registros historicos no se eliminan fisicamente
-- -------------------------------------------------------------

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_VIAJE_PASAJERO
BEFORE DELETE ON VIAJE_PASAJERO
BEGIN
  RAISE_APPLICATION_ERROR(-20160, 'No se permite eliminar viajes de pasajeros (historial). Use estado ANULADO');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_RECARGA
BEFORE DELETE ON RECARGA
BEGIN
  RAISE_APPLICATION_ERROR(-20161, 'No se permite eliminar recargas (historial de pagos)');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_VIAJE_PROG
BEFORE DELETE ON VIAJE_PROGRAMADO
BEGIN
  RAISE_APPLICATION_ERROR(-20162, 'No se permite eliminar viajes programados. Use estado CANCELADO');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_TREN_VAGON
BEFORE DELETE ON TREN_VAGON
BEGIN
  RAISE_APPLICATION_ERROR(-20163, 'No se permite eliminar el historial de composicion de trenes');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_ORDEN
BEFORE DELETE ON ORDEN_MANTENIMIENTO
BEGIN
  RAISE_APPLICATION_ERROR(-20164, 'No se permite eliminar ordenes de mantenimiento. Use estado CANCELADA');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_TURNO
BEFORE DELETE ON TURNO
BEGIN
  RAISE_APPLICATION_ERROR(-20165, 'No se permite eliminar turnos (historial de asignaciones)');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_HIST_TARIFA
BEFORE DELETE ON HISTORIAL_TARIFA
BEGIN
  RAISE_APPLICATION_ERROR(-20166, 'No se permite eliminar el historial de tarifas');
END;
/

CREATE OR REPLACE TRIGGER TRG_NO_BORRAR_BITACORA
BEFORE DELETE OR UPDATE ON BITACORA
BEGIN
  RAISE_APPLICATION_ERROR(-20167, 'La bitacora no se puede modificar ni eliminar');
END;
/

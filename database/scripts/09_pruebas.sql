-- =============================================================
-- 09_pruebas.sql
-- Pruebas de los procedimientos, funciones y triggers.
-- Correr con F5 (Run Script) en SQL Developer y ver la salida en
-- la pestana "Dbms Output" / "Script Output".
-- Los casos marcados con [ERROR ESPERADO] tienen que fallar.
--
-- Al final se hace ROLLBACK para que los datos de prueba queden
-- como estaban. Si quieren guardar los cambios cambien por COMMIT.
-- =============================================================

SET SERVEROUTPUT ON SIZE UNLIMITED
ALTER SESSION SET NLS_DATE_FORMAT = 'DD/MM/YYYY HH24:MI';


PROMPT ===== MODULO 5: PASAJEROS Y TARJETAS =====

-- 1. Ingreso normal con tarjeta
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000001, 3, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('1. Ingreso OK. Transaccion ' || v_trx || ', cobrado ' || v_monto || ', saldo ' || v_saldo);
END;
/

-- 2. Salida de la misma tarjeta
DECLARE
  v_trx NUMBER;
BEGIN
  SP_REGISTRAR_SALIDA(4000000000000001, 10, v_trx);
  DBMS_OUTPUT.PUT_LINE('2. Salida OK. Transaccion ' || v_trx);
END;
/

-- 3. [ERROR ESPERADO] tarjeta bloqueada
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000007, 3, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('3. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('3. Error esperado: ' || SQLERRM);
END;
/

-- 4. [ERROR ESPERADO] tarjeta vencida
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000010, 3, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('4. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('4. Error esperado: ' || SQLERRM);
END;
/

-- 5. [ERROR ESPERADO] saldo insuficiente (tarjeta anonima con 1.00)
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000009, 4, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('5. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('5. Error esperado: ' || SQLERRM);
END;
/

-- 6. [ERROR ESPERADO] segundo ingreso con un viaje abierto
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000008, 5, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('6a. Primer ingreso OK, saldo ' || v_saldo);
  SP_REGISTRAR_INGRESO(4000000000000008, 5, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('6b. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('6b. Error esperado: ' || SQLERRM);
END;
/

-- 7. Recarga y consulta de saldo con la funcion
DECLARE
  v_trx NUMBER; v_saldo NUMBER;
BEGIN
  DBMS_OUTPUT.PUT_LINE('7. Saldo antes: ' || FN_SALDO_TARJETA(4000000000000009));
  SP_RECARGAR_TARJETA(4000000000000009, 10, 'EFECTIVO', 'MAQUINA_ESTACION', 4, v_trx, v_saldo);
  DBMS_OUTPUT.PUT_LINE('7. Recarga ' || v_trx || ' OK, saldo nuevo: ' || v_saldo);
END;
/

-- 8. [ERROR ESPERADO] recarga con monto negativo
DECLARE
  v_trx NUMBER; v_saldo NUMBER;
BEGIN
  SP_RECARGAR_TARJETA(4000000000000009, -5, 'EFECTIVO', 'MAQUINA_ESTACION', 4, v_trx, v_saldo);
  DBMS_OUTPUT.PUT_LINE('8. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('8. Error esperado: ' || SQLERRM);
END;
/

-- 9. Viaje anonimo con boleto
DECLARE
  v_trx NUMBER; v_monto NUMBER;
BEGIN
  SP_REGISTRAR_VIAJE_ANONIMO(4, 'VI-REG', v_trx, v_monto);
  DBMS_OUTPUT.PUT_LINE('9. Boleto OK. Transaccion ' || v_trx || ', cobrado ' || v_monto);
END;
/

-- 10. Pase mensual: ya se pago en la semana, este viaje sale gratis
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000006, 2, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('10. Pase mensual: cobrado ' || v_monto || ' (debe ser 0), saldo ' || v_saldo);
END;
/

-- 11. Emitir tarjeta nueva para un pasajero, con saldo inicial
DECLARE
  v_num NUMBER;
BEGIN
  SP_EMITIR_TARJETA(3, 'RED-AM', 20, 2, v_num);
  DBMS_OUTPUT.PUT_LINE('11. Tarjeta emitida ' || v_num || ' saldo ' || FN_SALDO_TARJETA(v_num)
                       || ' valida: ' || FN_TARJETA_VALIDA(v_num));
END;
/

-- 12. [ERROR ESPERADO] tarifa estudiantil para un pasajero regular
DECLARE
  v_num NUMBER;
BEGIN
  SP_EMITIR_TARJETA(1, 'PE-EST', 0, NULL, v_num);
  DBMS_OUTPUT.PUT_LINE('12. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('12. Error esperado: ' || SQLERRM);
END;
/

-- 13. [ERROR ESPERADO] el trigger no deja poner saldo negativo
BEGIN
  UPDATE TARJETA SET saldo = -10 WHERE numero_tarjeta = 4000000000000001;
  DBMS_OUTPUT.PUT_LINE('13. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('13. Error esperado: ' || SQLERRM);
END;
/


PROMPT ===== MODULO 2 y 3: VIAJES Y TRENES =====

-- 14. Programar un viaje valido
DECLARE
  v_viaje NUMBER;
BEGIN
  SP_PROGRAMAR_VIAJE(3, TRUNC(SYSDATE) + 1 + 15/24, 'T-106', 4, 500, v_viaje);
  DBMS_OUTPUT.PUT_LINE('14. Viaje programado #' || v_viaje);
END;
/

-- 15. [ERROR ESPERADO] tren en mantenimiento
DECLARE
  v_viaje NUMBER;
BEGIN
  SP_PROGRAMAR_VIAJE(1, TRUNC(SYSDATE) + 1 + 16/24, 'T-104', 3, 0, v_viaje);
  DBMS_OUTPUT.PUT_LINE('15. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('15. Error esperado: ' || SQLERRM);
END;
/

-- 16. [ERROR ESPERADO] conductor con certificacion vencida
DECLARE
  v_viaje NUMBER;
BEGIN
  SP_PROGRAMAR_VIAJE(1, TRUNC(SYSDATE) + 1 + 16/24, 'T-101', 5, 0, v_viaje);
  DBMS_OUTPUT.PUT_LINE('16. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('16. Error esperado: ' || SQLERRM);
END;
/

-- 17. [ERROR ESPERADO] tren con la inspeccion vencida
DECLARE
  v_viaje NUMBER;
BEGIN
  SP_PROGRAMAR_VIAJE(4, TRUNC(SYSDATE) + 1 + 16/24, 'T-108', 7, 0, v_viaje);
  DBMS_OUTPUT.PUT_LINE('17. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('17. Error esperado: ' || SQLERRM);
END;
/

-- 18. [ERROR ESPERADO] conductor con dos viajes al mismo tiempo (traslape con la prueba 14)
DECLARE
  v_viaje NUMBER;
BEGIN
  SP_PROGRAMAR_VIAJE(6, TRUNC(SYSDATE) + 1 + 15/24 + 10/1440, 'T-105', 4, 0, v_viaje);
  DBMS_OUTPUT.PUT_LINE('18. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('18. Error esperado: ' || SQLERRM);
END;
/

-- 19. Generar los viajes de un horario para manana
DECLARE
  v_cant NUMBER;
BEGIN
  SP_GENERAR_VIAJES(4, TRUNC(SYSDATE) + 1, v_cant);
  DBMS_OUTPUT.PUT_LINE('19. Viajes generados: ' || v_cant);
END;
/

-- 20. Asignar tren y conductor a un viaje que no tenia
BEGIN
  SP_ASIGNAR_TREN_CONDUCTOR(18, 'T-106', 15);
  DBMS_OUTPUT.PUT_LINE('20. Viaje 18 asignado a T-106 con el conductor 15');
END;
/

-- 21. Iniciar y finalizar un viaje (el trigger cambia el estado del tren)
DECLARE
  v_estado VARCHAR2(20);
BEGIN
  SP_INICIAR_VIAJE(16, SYSDATE);
  SELECT estado_operativo INTO v_estado FROM TREN WHERE codigo_tren = 'T-103';
  DBMS_OUTPUT.PUT_LINE('21a. Viaje 16 iniciado. Estado del T-103: ' || v_estado);

  SP_FINALIZAR_VIAJE(16, SYSDATE + 40/1440, 680);
  SELECT estado_operativo INTO v_estado FROM TREN WHERE codigo_tren = 'T-103';
  DBMS_OUTPUT.PUT_LINE('21b. Viaje 16 finalizado. Estado del T-103: ' || v_estado
                       || ', duracion real: ' || FN_DURACION_VIAJE(16) || ' min'
                       || ', retraso: ' || FN_MINUTOS_RETRASO(16) || ' min');
END;
/

-- 22. [ERROR ESPERADO] finalizar con hora de llegada antes de la salida
BEGIN
  SP_FINALIZAR_VIAJE(14, SYSDATE - 1, NULL);
  DBMS_OUTPUT.PUT_LINE('22. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('22. Error esperado: ' || SQLERRM);
END;
/

-- 23. Mover un vagon entre trenes (queda historial) y vagon retirado
BEGIN
  SP_ASIGNAR_VAGON('T-108', 'R160-9002', 4, SYSDATE - 1);
  SP_ASIGNAR_VAGON('T-103', 'R160-9002', 4, SYSDATE);
  DBMS_OUTPUT.PUT_LINE('23a. Vagon R160-9002 movido del T-108 al T-103');
  SP_ASIGNAR_VAGON('T-103', 'R46-9003', 5, SYSDATE);
  DBMS_OUTPUT.PUT_LINE('23b. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('23b. Error esperado: ' || SQLERRM);
END;
/

SELECT codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin
  FROM TREN_VAGON WHERE numero_serie = 'R160-9002' ORDER BY fecha_inicio;

-- 24. Funciones de trenes y rutas
BEGIN
  DBMS_OUTPUT.PUT_LINE('24. T-101 disponible: ' || FN_TREN_DISPONIBLE('T-101', SYSDATE + 2, SYSDATE + 2 + 1/24, NULL)
                       || ' | T-104 disponible: ' || FN_TREN_DISPONIBLE('T-104', SYSDATE + 2, SYSDATE + 2 + 1/24, NULL)
                       || ' | ruta 1 operativa: ' || FN_RUTA_OPERATIVA(1));
END;
/


PROMPT ===== MODULO 4: PERSONAL =====

-- 25. [ERROR ESPERADO] turno traslapado (el empleado 3 ya trabaja hoy de 6 a 14)
DECLARE
  v_turno NUMBER;
BEGIN
  SP_PROGRAMAR_TURNO(3, TRUNC(SYSDATE) + 10/24, TRUNC(SYSDATE) + 18/24, 'RUTA', '1', 'Conduccion', v_turno);
  DBMS_OUTPUT.PUT_LINE('25. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('25. Error esperado: ' || SQLERRM);
END;
/

-- 26. Turno valido para manana
DECLARE
  v_turno NUMBER;
BEGIN
  SP_PROGRAMAR_TURNO(3, TRUNC(SYSDATE) + 1 + 6/24, TRUNC(SYSDATE) + 1 + 14/24, 'RUTA', '1', 'Conduccion ruta A', v_turno);
  DBMS_OUTPUT.PUT_LINE('26. Turno programado #' || v_turno);
END;
/

-- 27. Ausencia y sustitucion (el turno 13 de Linda Davis esta en PERMISO)
DECLARE
  v_ausencia NUMBER; v_turnos NUMBER; v_nuevo NUMBER;
BEGIN
  SP_REGISTRAR_AUSENCIA(11, 'AUSENCIA', TRUNC(SYSDATE) + 1, TRUNC(SYSDATE) + 1, 'Enfermedad', v_ausencia, v_turnos);
  DBMS_OUTPUT.PUT_LINE('27a. Ausencia #' || v_ausencia || ', turnos afectados: ' || v_turnos);

  SP_SUSTITUIR_TURNO(13, 9, v_nuevo);
  DBMS_OUTPUT.PUT_LINE('27b. Turno 13 sustituido por el empleado 9, turno nuevo #' || v_nuevo);
END;
/

-- 28. Revision de vencimientos (certificaciones y tarjetas)
DECLARE
  v_cert NUMBER; v_tarj NUMBER;
BEGIN
  SP_REVISAR_VENCIMIENTOS(v_cert, v_tarj);
  DBMS_OUTPUT.PUT_LINE('28. Certificaciones marcadas vencidas: ' || v_cert || ', tarjetas: ' || v_tarj);
END;
/

SELECT empleado, tipo_certificacion, fecha_vencimiento, dias_restantes, situacion
  FROM VW_CERTIFICACIONES_POR_VENCER;


PROMPT ===== MODULO 6: MANTENIMIENTO =====

-- 29. Ciclo completo de una orden
DECLARE
  v_orden NUMBER; v_estado VARCHAR2(20);
BEGIN
  SP_CREAR_ORDEN_MANTENIMIENTO('ELV-014-01', 'CORRECTIVO', 'Puerta del elevador no cierra',
                               NULL, 'ALTA', 10, 350, v_orden);
  SELECT estado INTO v_estado FROM EQUIPO WHERE id_equipo = 'ELV-014-01';
  DBMS_OUTPUT.PUT_LINE('29a. Orden #' || v_orden || ' creada. Estado del elevador: ' || v_estado);

  SP_ASIGNAR_TECNICO(v_orden, 11, 'APOYO');
  SP_REGISTRAR_REPUESTO(v_orden, 2, 1);
  SP_CAMBIAR_ESTADO_ORDEN(v_orden, 'EN_EJECUCION');
  SP_CAMBIAR_ESTADO_ORDEN(v_orden, 'COMPLETADA');

  SELECT estado INTO v_estado FROM EQUIPO WHERE id_equipo = 'ELV-014-01';
  DBMS_OUTPUT.PUT_LINE('29b. Orden completada. Costo total: ' || FN_COSTO_ORDEN(v_orden)
                       || '. Estado del elevador: ' || v_estado);

  SP_CAMBIAR_ESTADO_ORDEN(v_orden, 'EN_EJECUCION');
  DBMS_OUTPUT.PUT_LINE('29c. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('29c. Error esperado: ' || SQLERRM);
END;
/

-- 30. [ERROR ESPERADO] repuesto sin stock suficiente
BEGIN
  SP_REGISTRAR_REPUESTO(2, 2, 50);
  DBMS_OUTPUT.PUT_LINE('30. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('30. Error esperado: ' || SQLERRM);
END;
/


PROMPT ===== MODULO 7: INCIDENTES =====

-- 31. Registrar un incidente, agregar elementos y cerrar una estacion
DECLARE
  v_inc NUMBER; v_cant NUMBER;
BEGIN
  SP_REGISTRAR_INCIDENTE('OBJETO_EN_VIA', 'Carrito de compras en la via', SYSDATE - 5/1440,
                         '23 St (8 Av)', 'ALTO', 8, NULL, NULL, 300,
                         'ESTACION', '12', 'NINGUNO', v_inc);
  DBMS_OUTPUT.PUT_LINE('31a. Incidente #' || v_inc || ' registrado');

  SP_AGREGAR_ELEMENTO_INCIDENTE(v_inc, 'VIAJE', '19', 'RETRASO', NULL, NULL, 10, 'Espera en Queens Plaza');
  SP_REGISTRAR_ACCION_INCIDENTE(v_inc, 'Se corto la energia del tercer riel');

  SP_CANCELAR_VIAJES_AFECTADOS('ESTACION', 12, SYSDATE, SYSDATE + 2, 'Objeto en la via en 23 St', v_inc, v_cant);
  DBMS_OUTPUT.PUT_LINE('31b. Estacion 23 St cerrada, viajes cancelados: ' || v_cant);
END;
/

-- 32. [ERROR ESPERADO] ingreso por una estacion cerrada
DECLARE
  v_trx NUMBER; v_monto NUMBER; v_saldo NUMBER;
BEGIN
  SP_REGISTRAR_INGRESO(4000000000000003, 12, v_trx, v_monto, v_saldo);
  DBMS_OUTPUT.PUT_LINE('32. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('32. Error esperado: ' || SQLERRM);
END;
/

SELECT * FROM VW_RUTAS_AFECTADAS;

-- 33. Cerrar el incidente y reabrir la estacion
DECLARE
  v_inc NUMBER; v_estado VARCHAR2(20);
BEGIN
  SELECT MAX(numero_incidente) INTO v_inc FROM INCIDENTE;
  SP_CERRAR_INCIDENTE(v_inc, SYSDATE, 'Objeto retirado por el personal de via', 'S');
  SELECT estado_operativo INTO v_estado FROM ESTACION WHERE id_estacion = 12;
  DBMS_OUTPUT.PUT_LINE('33. Incidente cerrado, duro ' || FN_DURACION_INCIDENTE(v_inc)
                       || ' min. Estado de 23 St: ' || v_estado);
END;
/

-- 34. [ERROR ESPERADO] fecha de fin antes del inicio
BEGIN
  SP_CERRAR_INCIDENTE(4, SYSDATE - 1, NULL, 'S');
  DBMS_OUTPUT.PUT_LINE('34. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('34. Error esperado: ' || SQLERRM);
END;
/


PROMPT ===== TARIFAS E HISTORIAL =====

-- 35. Cambio de precio: se guarda el historial y los viajes viejos no cambian
BEGIN
  UPDATE TARIFA SET monto = 3.00 WHERE codigo_tarifa = 'VI-REG';
  DBMS_OUTPUT.PUT_LINE('35. Precio de VI-REG cambiado a 3.00');
END;
/

SELECT codigo_tarifa, monto_anterior, monto_nuevo, vigente_desde, vigente_hasta FROM HISTORIAL_TARIFA;
SELECT DISTINCT monto_cobrado FROM VIAJE_PASAJERO WHERE codigo_tarifa = 'VI-REG';


PROMPT ===== REGISTROS HISTORICOS =====

-- 36. [ERROR ESPERADO] no se pueden borrar registros historicos
BEGIN
  DELETE FROM VIAJE_PASAJERO WHERE numero_transaccion = 1;
  DBMS_OUTPUT.PUT_LINE('36. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('36. Error esperado: ' || SQLERRM);
END;
/

-- 37. [ERROR ESPERADO] estacion de transferencia con una sola linea
BEGIN
  UPDATE ESTACION SET tipo_estacion = 'TRANSFERENCIA' WHERE id_estacion = 17;
  DBMS_OUTPUT.PUT_LINE('37. NO DEBIO PASAR');
EXCEPTION
  WHEN OTHERS THEN DBMS_OUTPUT.PUT_LINE('37. Error esperado: ' || SQLERRM);
END;
/

-- ultimos movimientos de la bitacora
SELECT fecha, tabla, id_registro, accion, valor_anterior, valor_nuevo, tipo, detalle
  FROM BITACORA
 ORDER BY id_bitacora DESC
 FETCH FIRST 20 ROWS ONLY;

ROLLBACK;

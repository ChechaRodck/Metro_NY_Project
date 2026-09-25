-- =============================================================
-- 03_funciones.sql
-- Funciones del sistema. Las que devuelven 'S'/'N' es porque
-- Oracle no deja usar BOOLEAN dentro de un SELECT.
-- =============================================================


-- 1. Duracion real de un viaje en minutos (NULL si no ha terminado)
CREATE OR REPLACE FUNCTION FN_DURACION_VIAJE (
  p_numero_viaje IN NUMBER
) RETURN NUMBER
IS
  v_salida  DATE;
  v_llegada DATE;
BEGIN
  SELECT salida_real, llegada_real
    INTO v_salida, v_llegada
    FROM VIAJE_PROGRAMADO
   WHERE numero_viaje = p_numero_viaje;

  IF v_salida IS NULL OR v_llegada IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN ROUND((v_llegada - v_salida) * 24 * 60, 1);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_DURACION_VIAJE;
/


-- 2. Minutos de retraso de un viaje.
-- Si ya llego se compara la llegada, si solo salio se compara la salida,
-- y si todavia no sale pero ya paso la hora, el retraso va corriendo.
CREATE OR REPLACE FUNCTION FN_MINUTOS_RETRASO (
  p_numero_viaje IN NUMBER
) RETURN NUMBER
IS
  v_sal_prog  DATE;
  v_lle_prog  DATE;
  v_sal_real  DATE;
  v_lle_real  DATE;
  v_estado    VARCHAR2(15);
  v_minutos   NUMBER := 0;
BEGIN
  SELECT salida_programada, llegada_programada, salida_real, llegada_real, estado_viaje
    INTO v_sal_prog, v_lle_prog, v_sal_real, v_lle_real, v_estado
    FROM VIAJE_PROGRAMADO
   WHERE numero_viaje = p_numero_viaje;

  IF v_estado = 'CANCELADO' THEN
    RETURN 0;
  END IF;

  IF v_lle_real IS NOT NULL THEN
    v_minutos := (v_lle_real - v_lle_prog) * 1440;
  ELSIF v_sal_real IS NOT NULL THEN
    v_minutos := (v_sal_real - v_sal_prog) * 1440;
  ELSIF v_estado IN ('PROGRAMADO','EN_ABORDAJE','RETRASADO') AND SYSDATE > v_sal_prog THEN
    v_minutos := (SYSDATE - v_sal_prog) * 1440;
  END IF;

  RETURN GREATEST(ROUND(v_minutos, 1), 0);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_MINUTOS_RETRASO;
/


-- 3. Saldo de una tarjeta
CREATE OR REPLACE FUNCTION FN_SALDO_TARJETA (
  p_numero_tarjeta IN NUMBER
) RETURN NUMBER
IS
  v_saldo TARJETA.saldo%TYPE;
BEGIN
  SELECT saldo INTO v_saldo
    FROM TARJETA
   WHERE numero_tarjeta = p_numero_tarjeta;
  RETURN v_saldo;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_SALDO_TARJETA;
/


-- 4. Tarjeta valida = activa y no vencida ('S' / 'N')
CREATE OR REPLACE FUNCTION FN_TARJETA_VALIDA (
  p_numero_tarjeta IN NUMBER
) RETURN VARCHAR2
IS
  v_estado      TARJETA.estado%TYPE;
  v_vencimiento TARJETA.fecha_vencimiento%TYPE;
BEGIN
  SELECT estado, fecha_vencimiento
    INTO v_estado, v_vencimiento
    FROM TARJETA
   WHERE numero_tarjeta = p_numero_tarjeta;

  IF v_estado = 'ACTIVA' AND v_vencimiento >= TRUNC(SYSDATE) THEN
    RETURN 'S';
  END IF;
  RETURN 'N';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 'N';
END FN_TARJETA_VALIDA;
/


-- 5. Ingresos (tarifas cobradas) de una estacion en un periodo.
-- Si no se mandan fechas toma todo el historial.
CREATE OR REPLACE FUNCTION FN_INGRESOS_ESTACION (
  p_id_estacion IN NUMBER,
  p_desde       IN DATE DEFAULT NULL,
  p_hasta       IN DATE DEFAULT NULL
) RETURN NUMBER
IS
  v_total NUMBER;
BEGIN
  SELECT NVL(SUM(monto_cobrado), 0)
    INTO v_total
    FROM VIAJE_PASAJERO
   WHERE id_estacion_ingreso = p_id_estacion
     AND estado <> 'ANULADO'
     AND fecha_hora_ingreso >= NVL(TRUNC(p_desde), DATE '1900-01-01')
     AND fecha_hora_ingreso <  NVL(TRUNC(p_hasta) + 1, DATE '3000-01-01');
  RETURN v_total;
END FN_INGRESOS_ESTACION;
/


-- 6. Pasajeros transportados por una linea en un periodo.
-- Como solo sabemos la estacion de ingreso, se cuenta cada viaje que
-- entro por una estacion de esa linea (en estaciones compartidas el
-- pasajero cuenta para todas las lineas de la estacion).
CREATE OR REPLACE FUNCTION FN_PASAJEROS_LINEA (
  p_id_linea IN VARCHAR2,
  p_desde    IN DATE DEFAULT NULL,
  p_hasta    IN DATE DEFAULT NULL
) RETURN NUMBER
IS
  v_total NUMBER;
BEGIN
  SELECT COUNT(*)
    INTO v_total
    FROM VIAJE_PASAJERO vp
    JOIN LINEA_ESTACION le ON le.id_estacion = vp.id_estacion_ingreso
   WHERE le.id_linea = p_id_linea
     AND vp.estado <> 'ANULADO'
     AND vp.fecha_hora_ingreso >= NVL(TRUNC(p_desde), DATE '1900-01-01')
     AND vp.fecha_hora_ingreso <  NVL(TRUNC(p_hasta) + 1, DATE '3000-01-01');
  RETURN v_total;
END FN_PASAJEROS_LINEA;
/


-- 7. Verifica si un tren puede usarse entre p_inicio y p_fin.
-- Revisa: estado, inspeccion vencida, mantenimientos pendientes,
-- que tenga vagones y que no tenga otro viaje en ese horario.
-- p_excluir_viaje sirve cuando se reprograma un viaje (no chocar consigo mismo).
CREATE OR REPLACE FUNCTION FN_TREN_DISPONIBLE (
  p_codigo_tren   IN VARCHAR2,
  p_inicio        IN DATE DEFAULT NULL,
  p_fin           IN DATE DEFAULT NULL,
  p_excluir_viaje IN NUMBER DEFAULT NULL
) RETURN VARCHAR2
IS
  v_estado     TREN.estado_operativo%TYPE;
  v_prox_insp  TREN.fecha_proxima_inspeccion%TYPE;
  v_inicio     DATE := NVL(p_inicio, SYSDATE);
  v_fin        DATE := NVL(p_fin, NVL(p_inicio, SYSDATE) + 1/24);
  v_cont       NUMBER;
BEGIN
  SELECT estado_operativo, fecha_proxima_inspeccion
    INTO v_estado, v_prox_insp
    FROM TREN
   WHERE codigo_tren = p_codigo_tren;

  IF v_estado IN ('EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO') THEN
    RETURN 'N';
  END IF;

  -- no se puede usar con la inspeccion vencida
  IF v_prox_insp IS NOT NULL AND v_prox_insp < TRUNC(v_inicio) THEN
    RETURN 'N';
  END IF;

  -- mantenimientos que impiden usarlo
  SELECT COUNT(*) INTO v_cont
    FROM ORDEN_MANTENIMIENTO o
    JOIN EQUIPO e ON e.id_equipo = o.id_equipo
   WHERE e.codigo_tren = p_codigo_tren
     AND (o.estado = 'EN_EJECUCION'
          OR (o.estado IN ('SOLICITADA','PROGRAMADA') AND o.prioridad IN ('ALTA','URGENTE')));
  IF v_cont > 0 THEN
    RETURN 'N';
  END IF;

  -- tiene que tener al menos un vagon armado
  SELECT COUNT(*) INTO v_cont
    FROM TREN_VAGON
   WHERE codigo_tren = p_codigo_tren
     AND fecha_fin IS NULL;
  IF v_cont = 0 THEN
    RETURN 'N';
  END IF;

  -- traslape con otro viaje
  SELECT COUNT(*) INTO v_cont
    FROM VIAJE_PROGRAMADO v
   WHERE v.codigo_tren = p_codigo_tren
     AND v.estado_viaje NOT IN ('CANCELADO','COMPLETADO')
     AND (p_excluir_viaje IS NULL OR v.numero_viaje <> p_excluir_viaje)
     AND v.salida_programada < v_fin
     AND v.llegada_programada > v_inicio;
  IF v_cont > 0 THEN
    RETURN 'N';
  END IF;

  RETURN 'S';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 'N';
END FN_TREN_DISPONIBLE;
/


-- 8. Ruta operativa: ruta y linea activas, dentro de su vigencia
-- y sin paradas en estaciones cerradas.
CREATE OR REPLACE FUNCTION FN_RUTA_OPERATIVA (
  p_id_ruta IN NUMBER,
  p_fecha   IN DATE DEFAULT NULL
) RETURN VARCHAR2
IS
  v_estado_ruta  RUTA.estado%TYPE;
  v_estado_linea LINEA.estado_operativo%TYPE;
  v_vig_ini      DATE;
  v_vig_fin      DATE;
  v_fecha        DATE := TRUNC(NVL(p_fecha, SYSDATE));
  v_cont         NUMBER;
BEGIN
  SELECT r.estado, l.estado_operativo, r.fecha_vigencia_inicio, r.fecha_vigencia_fin
    INTO v_estado_ruta, v_estado_linea, v_vig_ini, v_vig_fin
    FROM RUTA r
    JOIN LINEA l ON l.id_linea = r.id_linea
   WHERE r.id_ruta = p_id_ruta;

  IF v_estado_ruta <> 'ACTIVA' OR v_estado_linea <> 'ACTIVA' THEN
    RETURN 'N';
  END IF;

  IF v_vig_ini > v_fecha OR (v_vig_fin IS NOT NULL AND v_vig_fin < v_fecha) THEN
    RETURN 'N';
  END IF;

  SELECT COUNT(*) INTO v_cont
    FROM RUTA_ESTACION re
    JOIN ESTACION e ON e.id_estacion = re.id_estacion
   WHERE re.id_ruta = p_id_ruta
     AND re.se_detiene = 'S'
     AND e.estado_operativo = 'CERRADA';
  IF v_cont > 0 THEN
    RETURN 'N';
  END IF;

  RETURN 'S';
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN 'N';
END FN_RUTA_OPERATIVA;
/


-- 9. Costo total de una orden = mano de obra + repuestos
CREATE OR REPLACE FUNCTION FN_COSTO_ORDEN (
  p_numero_orden IN NUMBER
) RETURN NUMBER
IS
  v_mano_obra  NUMBER;
  v_repuestos  NUMBER;
BEGIN
  SELECT costo_mano_obra INTO v_mano_obra
    FROM ORDEN_MANTENIMIENTO
   WHERE numero_orden = p_numero_orden;

  SELECT NVL(SUM(cantidad * costo_unitario), 0) INTO v_repuestos
    FROM ORDEN_REPUESTO
   WHERE numero_orden = p_numero_orden;

  RETURN v_mano_obra + v_repuestos;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_COSTO_ORDEN;
/


-- 10. Calcula cuanto se le cobra a una tarjeta al ingresar.
-- Tarifa por viaje: se cobra el monto.
-- Pase (tiene duracion_dias): el primer viaje cobra el pase y los
-- siguientes son gratis mientras dure (y no pase el maximo de viajes).
-- Devuelve NULL si la tarifa no esta vigente.
CREATE OR REPLACE FUNCTION FN_CALCULAR_TARIFA (
  p_numero_tarjeta IN NUMBER
) RETURN NUMBER
IS
  v_codigo      TARIFA.codigo_tarifa%TYPE;
  v_monto       TARIFA.monto%TYPE;
  v_duracion    TARIFA.duracion_dias%TYPE;
  v_maximo      TARIFA.cantidad_max_viajes%TYPE;
  v_estado      TARIFA.estado%TYPE;
  v_vig_ini     DATE;
  v_vig_fin     DATE;
  v_ultimo_pago DATE;
  v_usados      NUMBER;
BEGIN
  SELECT t.codigo_tarifa, t.monto, t.duracion_dias, t.cantidad_max_viajes,
         t.estado, t.fecha_inicio_vigencia, t.fecha_fin_vigencia
    INTO v_codigo, v_monto, v_duracion, v_maximo, v_estado, v_vig_ini, v_vig_fin
    FROM TARJETA tj
    JOIN TARIFA t ON t.codigo_tarifa = tj.codigo_tarifa
   WHERE tj.numero_tarjeta = p_numero_tarjeta;

  IF v_estado <> 'ACTIVA' OR v_vig_ini > SYSDATE
     OR (v_vig_fin IS NOT NULL AND v_vig_fin < TRUNC(SYSDATE)) THEN
    RETURN NULL;
  END IF;

  IF v_duracion IS NULL THEN
    RETURN v_monto;
  END IF;

  -- es un pase: buscamos cuando se pago por ultima vez
  SELECT MAX(fecha_hora_ingreso) INTO v_ultimo_pago
    FROM VIAJE_PASAJERO
   WHERE numero_tarjeta = p_numero_tarjeta
     AND codigo_tarifa = v_codigo
     AND monto_cobrado > 0
     AND estado <> 'ANULADO';

  IF v_ultimo_pago IS NULL OR v_ultimo_pago + v_duracion < SYSDATE THEN
    RETURN v_monto;
  END IF;

  IF v_maximo IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usados
      FROM VIAJE_PASAJERO
     WHERE numero_tarjeta = p_numero_tarjeta
       AND fecha_hora_ingreso >= v_ultimo_pago
       AND estado <> 'ANULADO';
    IF v_usados >= v_maximo THEN
      RETURN v_monto;
    END IF;
  END IF;

  RETURN 0;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_CALCULAR_TARIFA;
/


-- 11. El conductor tiene certificacion vigente para el modelo del tren en esa fecha
CREATE OR REPLACE FUNCTION FN_CONDUCTOR_HABILITADO (
  p_id_empleado IN NUMBER,
  p_codigo_tren IN VARCHAR2,
  p_fecha       IN DATE DEFAULT NULL
) RETURN VARCHAR2
IS
  v_cont  NUMBER;
  v_fecha DATE := TRUNC(NVL(p_fecha, SYSDATE));
BEGIN
  SELECT COUNT(*) INTO v_cont
    FROM CERTIFICACION c
    JOIN CERTIFICACION_MODELO cm ON cm.id_certificacion = c.id_certificacion
    JOIN TREN t ON t.id_modelo = cm.id_modelo
   WHERE c.id_empleado = p_id_empleado
     AND t.codigo_tren = p_codigo_tren
     AND c.estado = 'VIGENTE'
     AND c.fecha_emision <= v_fecha
     AND c.fecha_vencimiento >= v_fecha;

  IF v_cont > 0 THEN
    RETURN 'S';
  END IF;
  RETURN 'N';
END FN_CONDUCTOR_HABILITADO;
/


-- 12. El empleado ya tiene un turno que se traslapa con ese horario
CREATE OR REPLACE FUNCTION FN_EMPLEADO_OCUPADO (
  p_id_empleado   IN NUMBER,
  p_inicio        IN DATE,
  p_fin           IN DATE,
  p_excluir_turno IN NUMBER DEFAULT NULL
) RETURN VARCHAR2
IS
  v_cont NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cont
    FROM TURNO
   WHERE id_empleado = p_id_empleado
     AND estado_asistencia IN ('PROGRAMADO','ASISTIO')
     AND (p_excluir_turno IS NULL OR id_turno <> p_excluir_turno)
     AND hora_inicio < p_fin
     AND hora_fin > p_inicio;

  IF v_cont > 0 THEN
    RETURN 'S';
  END IF;
  RETURN 'N';
END FN_EMPLEADO_OCUPADO;
/


-- 13. Duracion de un incidente en minutos (si sigue abierto, hasta ahorita)
CREATE OR REPLACE FUNCTION FN_DURACION_INCIDENTE (
  p_numero_incidente IN NUMBER
) RETURN NUMBER
IS
  v_inicio DATE;
  v_fin    DATE;
BEGIN
  SELECT fecha_hora_inicio, fecha_hora_fin
    INTO v_inicio, v_fin
    FROM INCIDENTE
   WHERE numero_incidente = p_numero_incidente;

  RETURN ROUND((NVL(v_fin, SYSDATE) - v_inicio) * 1440, 0);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
END FN_DURACION_INCIDENTE;
/

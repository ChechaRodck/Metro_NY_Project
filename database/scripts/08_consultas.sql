-- =============================================================
-- 08_consultas.sql
-- Consultas minimas que pide el enunciado.
-- Las que tienen :variable las pide SQL Developer al ejecutarlas
-- (se puede poner por ejemplo :id_estacion = 3).
-- =============================================================


-- 1. Que lineas pasan por una estacion determinada?
SELECT l.id_linea, l.nombre, l.tipo_servicio, l.estado_operativo, le.orden
  FROM LINEA_ESTACION le
  JOIN LINEA l ON l.id_linea = le.id_linea
 WHERE le.id_estacion = :id_estacion
 ORDER BY l.id_linea;


-- 2. Cuales son las estaciones de una ruta y en que orden se visitan?
SELECT re.orden, e.nombre AS estacion, re.minutos_llegada, re.minutos_salida,
       re.distancia_anterior_km, re.tiempo_anterior_min,
       CASE re.se_detiene WHEN 'S' THEN 'Se detiene' ELSE 'Solo pasa' END AS parada
  FROM RUTA_ESTACION re
  JOIN ESTACION e ON e.id_estacion = re.id_estacion
 WHERE re.id_ruta = :id_ruta
 ORDER BY re.orden;


-- 3. Que estaciones permiten transferencia entre lineas?
SELECT e.nombre AS estacion, t.id_linea_a, t.id_linea_b, t.tiempo_estimado_min
  FROM TRANSFERENCIA t
  JOIN ESTACION e ON e.id_estacion = t.id_estacion
 ORDER BY e.nombre, t.id_linea_a, t.id_linea_b;


-- 4. Que viajes estan programados para una fecha? (formato YYYY-MM-DD)
SELECT v.numero_viaje, r.codigo_ruta, r.id_linea,
       TO_CHAR(v.salida_programada, 'HH24:MI') AS salida,
       TO_CHAR(v.llegada_programada, 'HH24:MI') AS llegada,
       v.codigo_tren, v.id_conductor, v.estado_viaje
  FROM VIAJE_PROGRAMADO v
  JOIN RUTA r ON r.id_ruta = v.id_ruta
 WHERE TRUNC(v.salida_programada) = TO_DATE(:fecha, 'YYYY-MM-DD')
 ORDER BY v.salida_programada;


-- 5. Que viajes presentan retrasos mayores a 15 minutos?
SELECT numero_viaje, id_linea, codigo_ruta, salida_programada, llegada_real,
       conductor, minutos_retraso
  FROM VW_VIAJES_RETRASADOS
 WHERE minutos_retraso > 15
 ORDER BY minutos_retraso DESC;


-- 6. Que trenes estan disponibles?
SELECT * FROM VW_TRENES_DISPONIBLES ORDER BY codigo_tren;


-- 7. Que trenes tienen mantenimiento (inspeccion) vencido?
SELECT t.codigo_tren, m.nombre_modelo, t.estado_operativo,
       t.fecha_proxima_inspeccion,
       TRUNC(SYSDATE) - t.fecha_proxima_inspeccion AS dias_vencido
  FROM TREN t
  JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
 WHERE t.fecha_proxima_inspeccion < TRUNC(SYSDATE)
   AND t.estado_operativo <> 'RETIRADO'
 ORDER BY dias_vencido DESC;


-- 8. Que conductor fue asignado a cada viaje?
SELECT v.numero_viaje, r.codigo_ruta, v.salida_programada, v.estado_viaje,
       NVL(e.nombres || ' ' || e.apellidos, '(sin asignar)') AS conductor
  FROM VIAJE_PROGRAMADO v
  JOIN RUTA r ON r.id_ruta = v.id_ruta
  LEFT JOIN EMPLEADO e ON e.id_empleado = v.id_conductor
 ORDER BY v.salida_programada;


-- 9. Cuantos pasajeros utilizaron cada linea durante un periodo?
SELECT l.id_linea, l.nombre,
       FN_PASAJEROS_LINEA(l.id_linea, TO_DATE(:desde, 'YYYY-MM-DD'), TO_DATE(:hasta, 'YYYY-MM-DD')) AS pasajeros
  FROM LINEA l
 ORDER BY pasajeros DESC;


-- 10. Cuanto dinero se recaudo por dia, estacion y tipo de tarifa?
SELECT TRUNC(vp.fecha_hora_ingreso) AS fecha,
       e.nombre AS estacion,
       t.tipo_producto,
       COUNT(*) AS viajes,
       SUM(vp.monto_cobrado) AS total
  FROM VIAJE_PASAJERO vp
  JOIN ESTACION e ON e.id_estacion = vp.id_estacion_ingreso
  JOIN TARIFA t ON t.codigo_tarifa = vp.codigo_tarifa
 WHERE vp.estado <> 'ANULADO'
 GROUP BY TRUNC(vp.fecha_hora_ingreso), e.nombre, t.tipo_producto
 ORDER BY fecha, estacion, t.tipo_producto;


-- 11. Cuales son las estaciones con mayor flujo de pasajeros?
SELECT posicion, estacion, distrito, entradas, salidas, flujo_total
  FROM VW_ESTACIONES_FLUJO
 ORDER BY posicion
 FETCH FIRST 10 ROWS ONLY;


-- 12. Que incidentes permanecen abiertos?
SELECT * FROM VW_INCIDENTES_ABIERTOS ORDER BY fecha_hora_inicio;


-- 13. Que linea acumulo mas retrasos?
SELECT r.id_linea,
       COUNT(*) AS viajes_con_retraso,
       ROUND(SUM(FN_MINUTOS_RETRASO(v.numero_viaje)), 1) AS minutos_acumulados
  FROM VIAJE_PROGRAMADO v
  JOIN RUTA r ON r.id_ruta = v.id_ruta
 WHERE v.estado_viaje IN ('COMPLETADO','EN_CURSO','RETRASADO')
   AND FN_MINUTOS_RETRASO(v.numero_viaje) > 0
 GROUP BY r.id_linea
 ORDER BY minutos_acumulados DESC;


-- 14. Que tarjetas fueron bloqueadas o vencieron?
SELECT tj.numero_tarjeta,
       NVL(p.nombres || ' ' || p.apellidos, 'ANONIMA') AS pasajero,
       tj.estado, tj.fecha_vencimiento, tj.saldo
  FROM TARJETA tj
  LEFT JOIN PASAJERO p ON p.id_pasajero = tj.id_pasajero
 WHERE tj.estado IN ('BLOQUEADA','VENCIDA','PERDIDA')
    OR tj.fecha_vencimiento < TRUNC(SYSDATE)
 ORDER BY tj.estado;


-- 15. Que tecnicos participaron en una orden de mantenimiento?
SELECT ot.numero_orden, e.id_empleado, e.nombres || ' ' || e.apellidos AS tecnico,
       ot.rol, ot.horas_trabajadas
  FROM ORDEN_TECNICO ot
  JOIN EMPLEADO e ON e.id_empleado = ot.id_empleado
 WHERE ot.numero_orden = :numero_orden
 ORDER BY ot.rol DESC, tecnico;

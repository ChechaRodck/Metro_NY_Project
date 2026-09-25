-- =============================================================
-- 06_vistas.sql
-- Vistas para las consultas operativas
-- =============================================================


-- Estado actual de las lineas
CREATE OR REPLACE VIEW VW_ESTADO_LINEAS AS
SELECT l.id_linea,
       l.nombre,
       l.color_mapa,
       l.tipo_servicio,
       l.estado_operativo,
       eo.nombre AS terminal_origen,
       ed.nombre AS terminal_destino,
       l.longitud_km,
       (SELECT COUNT(*) FROM LINEA_ESTACION le WHERE le.id_linea = l.id_linea) AS total_estaciones,
       (SELECT COUNT(*) FROM RUTA r WHERE r.id_linea = l.id_linea AND r.estado = 'ACTIVA') AS rutas_activas,
       (SELECT COUNT(*) FROM RUTA r WHERE r.id_linea = l.id_linea AND r.estado IN ('SUSPENDIDA','MODIFICADA')) AS rutas_afectadas,
       (SELECT COUNT(*)
          FROM VIAJE_PROGRAMADO v JOIN RUTA r ON r.id_ruta = v.id_ruta
         WHERE r.id_linea = l.id_linea AND v.estado_viaje = 'EN_CURSO') AS viajes_en_curso,
       (SELECT COUNT(DISTINCT ie.numero_incidente)
          FROM INCIDENTE_ELEMENTO ie
          JOIN INCIDENTE i ON i.numero_incidente = ie.numero_incidente
          LEFT JOIN RUTA r ON r.id_ruta = ie.id_ruta
          LEFT JOIN VIAJE_PROGRAMADO v ON v.numero_viaje = ie.numero_viaje
          LEFT JOIN RUTA rv ON rv.id_ruta = v.id_ruta
         WHERE i.estado <> 'CERRADO'
           AND (ie.id_linea = l.id_linea OR r.id_linea = l.id_linea OR rv.id_linea = l.id_linea)) AS incidentes_abiertos
  FROM LINEA l
  LEFT JOIN ESTACION eo ON eo.id_estacion = l.id_terminal_origen
  LEFT JOIN ESTACION ed ON ed.id_estacion = l.id_terminal_destino;


-- Estaciones de cada linea en su orden (estructura de la red)
CREATE OR REPLACE VIEW VW_ESTACIONES_LINEA AS
SELECT le.id_linea,
       l.nombre AS linea,
       le.orden,
       e.id_estacion,
       e.codigo_estacion,
       e.nombre AS estacion,
       e.distrito,
       e.tipo_estacion,
       e.estado_operativo,
       le.distancia_anterior_km,
       le.tiempo_anterior_min,
       SUM(le.distancia_anterior_km) OVER (PARTITION BY le.id_linea ORDER BY le.orden) AS distancia_acumulada_km,
       SUM(le.tiempo_anterior_min) OVER (PARTITION BY le.id_linea ORDER BY le.orden) AS tiempo_acumulado_min
  FROM LINEA_ESTACION le
  JOIN LINEA l ON l.id_linea = le.id_linea
  JOIN ESTACION e ON e.id_estacion = le.id_estacion;


-- Proximas salidas por estacion (solo donde el tren se detiene)
CREATE OR REPLACE VIEW VW_PROXIMAS_SALIDAS AS
SELECT re.id_estacion,
       e.nombre AS estacion,
       r.id_linea,
       r.codigo_ruta,
       r.sentido,
       r.tipo_servicio,
       ed.nombre AS destino,
       v.numero_viaje,
       v.salida_programada + re.minutos_salida / 1440 AS hora_programada,
       v.salida_programada + (re.minutos_salida + FN_MINUTOS_RETRASO(v.numero_viaje)) / 1440 AS hora_estimada,
       FN_MINUTOS_RETRASO(v.numero_viaje) AS minutos_retraso,
       v.estado_viaje,
       v.codigo_tren
  FROM VIAJE_PROGRAMADO v
  JOIN RUTA r ON r.id_ruta = v.id_ruta
  JOIN RUTA_ESTACION re ON re.id_ruta = r.id_ruta AND re.se_detiene = 'S'
  JOIN ESTACION e ON e.id_estacion = re.id_estacion
  JOIN ESTACION ed ON ed.id_estacion = r.id_estacion_destino
 WHERE v.estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','EN_CURSO','RETRASADO')
   AND re.id_estacion <> r.id_estacion_destino
   AND v.salida_programada + re.minutos_salida / 1440 >= SYSDATE - 5/1440;


-- Viajes con retraso
CREATE OR REPLACE VIEW VW_VIAJES_RETRASADOS AS
SELECT v.numero_viaje,
       r.id_linea,
       r.codigo_ruta,
       v.salida_programada,
       v.salida_real,
       v.llegada_programada,
       v.llegada_real,
       v.estado_viaje,
       v.codigo_tren,
       e.nombres || ' ' || e.apellidos AS conductor,
       FN_MINUTOS_RETRASO(v.numero_viaje) AS minutos_retraso
  FROM VIAJE_PROGRAMADO v
  JOIN RUTA r ON r.id_ruta = v.id_ruta
  LEFT JOIN EMPLEADO e ON e.id_empleado = v.id_conductor
 WHERE v.estado_viaje <> 'CANCELADO'
   AND (v.estado_viaje = 'RETRASADO' OR FN_MINUTOS_RETRASO(v.numero_viaje) > 0);


-- Trenes disponibles ahorita (la proxima hora)
CREATE OR REPLACE VIEW VW_TRENES_DISPONIBLES AS
SELECT t.codigo_tren,
       m.nombre_modelo AS modelo,
       m.fabricante,
       t.anio_fabricacion,
       t.capacidad_total,
       t.kilometraje_km,
       d.nombre AS deposito,
       t.fecha_proxima_inspeccion,
       (SELECT COUNT(*) FROM TREN_VAGON tv WHERE tv.codigo_tren = t.codigo_tren AND tv.fecha_fin IS NULL) AS vagones
  FROM TREN t
  JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
  JOIN DEPOSITO d ON d.id_deposito = t.id_deposito
 WHERE t.estado_operativo = 'DISPONIBLE'
   AND FN_TREN_DISPONIBLE(t.codigo_tren, SYSDATE, SYSDATE + 1/24, NULL) = 'S';


-- Trenes en mantenimiento, con orden abierta o con inspeccion vencida
CREATE OR REPLACE VIEW VW_TRENES_MANTENIMIENTO AS
SELECT t.codigo_tren,
       m.nombre_modelo AS modelo,
       t.estado_operativo,
       d.nombre AS deposito,
       t.fecha_ultima_inspeccion,
       t.fecha_proxima_inspeccion,
       CASE WHEN t.fecha_proxima_inspeccion < TRUNC(SYSDATE) THEN 'S' ELSE 'N' END AS inspeccion_vencida,
       (SELECT COUNT(*)
          FROM ORDEN_MANTENIMIENTO o JOIN EQUIPO e ON e.id_equipo = o.id_equipo
         WHERE e.codigo_tren = t.codigo_tren
           AND o.estado IN ('SOLICITADA','PROGRAMADA','EN_EJECUCION','SUSPENDIDA')) AS ordenes_abiertas
  FROM TREN t
  JOIN MODELO_TREN m ON m.id_modelo = t.id_modelo
  JOIN DEPOSITO d ON d.id_deposito = t.id_deposito
 WHERE t.estado_operativo IN ('EN_MANTENIMIENTO','FUERA_SERVICIO')
    OR t.fecha_proxima_inspeccion < TRUNC(SYSDATE)
    OR EXISTS (SELECT 1
                 FROM ORDEN_MANTENIMIENTO o JOIN EQUIPO e ON e.id_equipo = o.id_equipo
                WHERE e.codigo_tren = t.codigo_tren
                  AND o.estado IN ('SOLICITADA','PROGRAMADA','EN_EJECUCION','SUSPENDIDA'));


-- Incidentes abiertos
CREATE OR REPLACE VIEW VW_INCIDENTES_ABIERTOS AS
SELECT i.numero_incidente,
       i.tipo_incidente,
       i.severidad,
       i.estado,
       i.descripcion,
       i.lugar_afectado,
       i.fecha_hora_inicio,
       FN_DURACION_INCIDENTE(i.numero_incidente) AS minutos_transcurridos,
       NVL(e.nombres || ' ' || e.apellidos, i.reportado_por) AS reportado_por,
       i.pasajeros_afectados,
       (SELECT COUNT(*) FROM INCIDENTE_ELEMENTO ie WHERE ie.numero_incidente = i.numero_incidente) AS elementos_afectados
  FROM INCIDENTE i
  LEFT JOIN EMPLEADO e ON e.id_empleado = i.id_empleado_reporta
 WHERE i.estado <> 'CERRADO';


-- Ingresos diarios por linea.
-- Solo sabemos por que estacion entro el pasajero; si la estacion la
-- comparten varias lineas, el monto se reparte entre ellas para no
-- contar el mismo dinero dos veces.
CREATE OR REPLACE VIEW VW_INGRESOS_DIARIOS_LINEA AS
SELECT TRUNC(vp.fecha_hora_ingreso) AS fecha,
       le.id_linea,
       l.nombre AS linea,
       COUNT(*) AS cantidad_viajes,
       ROUND(SUM(vp.monto_cobrado / nl.num_lineas), 2) AS total_recaudado
  FROM VIAJE_PASAJERO vp
  JOIN LINEA_ESTACION le ON le.id_estacion = vp.id_estacion_ingreso
  JOIN LINEA l ON l.id_linea = le.id_linea
  JOIN (SELECT id_estacion, COUNT(*) AS num_lineas
          FROM LINEA_ESTACION
         GROUP BY id_estacion) nl ON nl.id_estacion = vp.id_estacion_ingreso
 WHERE vp.estado <> 'ANULADO'
 GROUP BY TRUNC(vp.fecha_hora_ingreso), le.id_linea, l.nombre;


-- Flujo de pasajeros por estacion (entradas + salidas)
CREATE OR REPLACE VIEW VW_ESTACIONES_FLUJO AS
SELECT e.id_estacion,
       e.nombre AS estacion,
       e.distrito,
       NVL(ent.entradas, 0) AS entradas,
       NVL(sal.salidas, 0) AS salidas,
       NVL(ent.entradas, 0) + NVL(sal.salidas, 0) AS flujo_total,
       NVL(ent.recaudado, 0) AS recaudado,
       RANK() OVER (ORDER BY NVL(ent.entradas, 0) + NVL(sal.salidas, 0) DESC) AS posicion
  FROM ESTACION e
  LEFT JOIN (SELECT id_estacion_ingreso AS id_estacion, COUNT(*) AS entradas, SUM(monto_cobrado) AS recaudado
               FROM VIAJE_PASAJERO WHERE estado <> 'ANULADO'
              GROUP BY id_estacion_ingreso) ent ON ent.id_estacion = e.id_estacion
  LEFT JOIN (SELECT id_estacion_salida AS id_estacion, COUNT(*) AS salidas
               FROM VIAJE_PASAJERO WHERE id_estacion_salida IS NOT NULL
              GROUP BY id_estacion_salida) sal ON sal.id_estacion = e.id_estacion;


-- Certificaciones vencidas o que vencen en los proximos 60 dias
CREATE OR REPLACE VIEW VW_CERTIFICACIONES_POR_VENCER AS
SELECT c.id_certificacion,
       c.id_empleado,
       e.nombres || ' ' || e.apellidos AS empleado,
       ca.nombre_cargo AS cargo,
       c.tipo_certificacion,
       c.fecha_vencimiento,
       TRUNC(c.fecha_vencimiento) - TRUNC(SYSDATE) AS dias_restantes,
       CASE WHEN c.fecha_vencimiento < TRUNC(SYSDATE) THEN 'VENCIDA' ELSE 'POR_VENCER' END AS situacion
  FROM CERTIFICACION c
  JOIN EMPLEADO e ON e.id_empleado = c.id_empleado
  JOIN CARGO ca ON ca.id_cargo = e.id_cargo
 WHERE c.estado IN ('VIGENTE','VENCIDA')
   AND c.fecha_vencimiento <= TRUNC(SYSDATE) + 60
   AND e.estado_laboral <> 'INACTIVO';


-- Rutas afectadas por cierres (ruta suspendida o con paradas en estaciones/plataformas cerradas)
CREATE OR REPLACE VIEW VW_RUTAS_AFECTADAS AS
SELECT r.id_ruta,
       r.codigo_ruta,
       r.id_linea,
       r.estado,
       e.id_estacion,
       e.nombre AS estacion_cerrada,
       CASE WHEN e.id_estacion IS NULL THEN 'RUTA ' || r.estado ELSE 'ESTACION CERRADA' END AS motivo
  FROM RUTA r
  LEFT JOIN RUTA_ESTACION re ON re.id_ruta = r.id_ruta AND re.se_detiene = 'S'
  LEFT JOIN ESTACION e ON e.id_estacion = re.id_estacion AND e.estado_operativo = 'CERRADA'
 WHERE (r.estado IN ('SUSPENDIDA','MODIFICADA') AND re.orden = 1)
    OR e.id_estacion IS NOT NULL;


-- Disponibilidad de elevadores y escaleras por estacion
CREATE OR REPLACE VIEW VW_EQUIPOS_ESTACION AS
SELECT e.id_estacion,
       e.nombre AS estacion,
       e.accesible_discapacidad,
       SUM(CASE WHEN q.tipo_equipo = 'ELEVADOR' THEN 1 ELSE 0 END) AS elevadores,
       SUM(CASE WHEN q.tipo_equipo = 'ELEVADOR' AND q.estado = 'OPERATIVO' THEN 1 ELSE 0 END) AS elevadores_operativos,
       SUM(CASE WHEN q.tipo_equipo = 'ESCALERA_ELECTRICA' THEN 1 ELSE 0 END) AS escaleras,
       SUM(CASE WHEN q.tipo_equipo = 'ESCALERA_ELECTRICA' AND q.estado = 'OPERATIVO' THEN 1 ELSE 0 END) AS escaleras_operativas
  FROM ESTACION e
  LEFT JOIN EQUIPO q ON q.id_estacion = e.id_estacion
                    AND q.tipo_equipo IN ('ELEVADOR','ESCALERA_ELECTRICA')
                    AND q.estado <> 'RETIRADO'
 GROUP BY e.id_estacion, e.nombre, e.accesible_discapacidad;


-- Equipos con la revision vencida
CREATE OR REPLACE VIEW VW_MANTENIMIENTOS_VENCIDOS AS
SELECT q.id_equipo,
       q.tipo_equipo,
       q.descripcion_ubicacion,
       q.estado,
       q.fecha_ultima_revision,
       q.fecha_proxima_revision,
       TRUNC(SYSDATE) - q.fecha_proxima_revision AS dias_vencido,
       (SELECT COUNT(*) FROM ORDEN_MANTENIMIENTO o
         WHERE o.id_equipo = q.id_equipo
           AND o.estado IN ('SOLICITADA','PROGRAMADA','EN_EJECUCION')) AS ordenes_pendientes
  FROM EQUIPO q
 WHERE q.estado <> 'RETIRADO'
   AND q.fecha_proxima_revision < TRUNC(SYSDATE);


-- Tarjetas con problemas: bloqueadas, vencidas, perdidas o sin saldo para un viaje
CREATE OR REPLACE VIEW VW_TARJETAS_ALERTA AS
SELECT tj.numero_tarjeta,
       tj.id_pasajero,
       NVL(p.nombres || ' ' || p.apellidos, 'ANONIMA') AS pasajero,
       tj.codigo_tarifa,
       tj.estado,
       tj.saldo,
       tj.fecha_vencimiento,
       CASE
         WHEN tj.estado <> 'ACTIVA' THEN tj.estado
         WHEN tj.fecha_vencimiento < TRUNC(SYSDATE) THEN 'VENCIDA'
         ELSE 'SIN_SALDO'
       END AS problema
  FROM TARJETA tj
  JOIN TARIFA t ON t.codigo_tarifa = tj.codigo_tarifa
  LEFT JOIN PASAJERO p ON p.id_pasajero = tj.id_pasajero
 WHERE tj.estado <> 'ACTIVA'
    OR tj.fecha_vencimiento < TRUNC(SYSDATE)
    OR tj.saldo < t.monto;

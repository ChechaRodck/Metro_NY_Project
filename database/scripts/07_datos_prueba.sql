-- =============================================================
-- 07_datos_prueba.sql
-- Datos de prueba. Las fechas de viajes, inspecciones, certificaciones,
-- etc. son relativas a SYSDATE para que las vistas siempre muestren algo
-- el dia que se corra el script (proximas salidas, por vencer, etc.)
--
-- Simplificacion academica: algunas estaciones de NY que en realidad son
-- complejos distintos aqui se toman como una sola estacion compartida.
-- =============================================================

ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI';

-- ---------------- ESTACIONES ----------------
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (1, 'A15', '125 St', 'St Nicholas Av y W 125 St', 'MANHATTAN', 40.811109, -73.952343, DATE '1932-09-10', 4, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (2, 'A24', '59 St-Columbus Circle', 'Columbus Circle y W 59 St', 'MANHATTAN', 40.768296, -73.981736, DATE '1932-09-10', 6, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (3, 'A27', '42 St-Times Sq/Port Authority', '8 Av y W 42 St', 'MANHATTAN', 40.757308, -73.989735, DATE '1932-09-10', 10, 4, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (4, 'A28', '34 St-Penn Station', '8 Av y W 34 St', 'MANHATTAN', 40.752287, -73.993391, DATE '1932-09-10', 8, 4, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (5, 'A31', '14 St', '8 Av y W 14 St', 'MANHATTAN', 40.740893, -74.00169, DATE '1932-09-10', 5, 4, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (6, 'A32', 'W 4 St-Washington Sq', '6 Av y W 4 St', 'MANHATTAN', 40.732338, -74.000495, DATE '1932-09-10', 4, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (7, 'A34', 'Canal St', '6 Av y Canal St', 'MANHATTAN', 40.720824, -74.005229, DATE '1932-09-10', 3, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'N');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (8, 'A36', 'Chambers St', 'Church St y Chambers St', 'MANHATTAN', 40.714111, -74.008585, DATE '1932-09-10', 4, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (9, 'A38', 'Fulton St', 'Broadway y Fulton St', 'MANHATTAN', 40.710197, -74.007691, DATE '1933-02-01', 6, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (10, 'A41', 'Jay St-MetroTech', 'Jay St y Willoughby St', 'BROOKLYN', 40.692338, -73.987342, DATE '1933-02-01', 4, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (11, 'A25', '50 St', '8 Av y W 50 St', 'MANHATTAN', 40.762456, -73.985984, DATE '1932-09-10', 2, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'N');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (12, 'A30', '23 St', '8 Av y W 23 St', 'MANHATTAN', 40.745906, -73.998041, DATE '1932-09-10', 2, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'N');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (13, '123', '72 St', 'Broadway y W 72 St', 'MANHATTAN', 40.778453, -73.98197, DATE '1904-10-27', 3, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (14, '235', 'Atlantic Av-Barclays Ctr', 'Flatbush Av y Atlantic Av', 'BROOKLYN', 40.684359, -73.977666, DATE '1908-05-01', 7, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (15, '232', 'Borough Hall', 'Court St y Montague St', 'BROOKLYN', 40.693219, -73.989998, DATE '1908-01-09', 3, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'N');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (16, 'G14', 'Jackson Hts-Roosevelt Av', '74 St y Roosevelt Av', 'QUEENS', 40.746644, -73.891338, DATE '1933-08-19', 5, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (17, 'G21', 'Queens Plaza', 'Queens Blvd y Jackson Av', 'QUEENS', 40.748973, -73.937243, DATE '1933-08-19', 3, 2, 'LOCAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (18, 'F11', 'Lexington Av/53 St', 'Lexington Av y E 53 St', 'MANHATTAN', 40.757552, -73.969055, DATE '1933-08-19', 4, 2, 'EXPRESA', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (19, 'E01', 'World Trade Center', 'Church St y Vesey St', 'MANHATTAN', 40.712582, -74.009781, DATE '1932-09-10', 3, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (20, '222', '149 St-Grand Concourse', 'Grand Concourse y E 149 St', 'BRONX', 40.818375, -73.927351, DATE '1905-07-10', 3, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'N');
INSERT INTO ESTACION (id_estacion, codigo_estacion, nombre, direccion, distrito, latitud, longitud, fecha_inauguracion, cantidad_accesos, cantidad_plataformas, tipo_estacion, estado_operativo, hora_apertura, hora_cierre, accesible_discapacidad)
VALUES (21, '142', 'South Ferry', 'Peter Minuit Plaza', 'MANHATTAN', 40.702068, -74.013664, DATE '2009-03-16', 3, 2, 'TERMINAL', 'OPERATIVA', '00:00', '23:59', 'S');

-- ---------------- LINEAS ----------------
INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino, estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
VALUES ('A', '8 Avenue Express', '#0039A6', 1, 10, 'ACTIVA', 'EXPRESO', DATE '1932-09-10', 16.5, 'NYC Transit - Division B');
INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino, estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
VALUES ('C', '8 Avenue Local', '#0039A6', 1, 10, 'ACTIVA', 'LOCAL', DATE '1933-07-01', 16.5, 'NYC Transit - Division B');
INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino, estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
VALUES ('E', '8 Avenue/Queens Local', '#0039A6', 16, 19, 'ACTIVA', 'LOCAL', DATE '1933-08-19', 14.9, 'NYC Transit - Division B');
INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino, estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
VALUES ('1', 'Broadway-7 Avenue Local', '#EE352E', 13, 21, 'ACTIVA', 'LOCAL', DATE '1904-10-27', 8.9, 'NYC Transit - Division A');
INSERT INTO LINEA (id_linea, nombre, color_mapa, id_terminal_origen, id_terminal_destino, estado_operativo, tipo_servicio, fecha_inauguracion, longitud_km, operador_responsable)
VALUES ('2', '7 Avenue Express', '#EE352E', 20, 14, 'ACTIVA', 'EXPRESO', DATE '1904-11-23', 18.6, 'NYC Transit - Division A');

-- ---------------- SERVICIOS ----------------
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (1, 'Venta y recarga de tarjetas');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (2, 'Maquinas expendedoras');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (3, 'Servicios sanitarios');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (4, 'Policia o seguridad');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (5, 'Atencion al pasajero');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (6, 'Elevadores');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (7, 'Escaleras electricas');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (8, 'Acceso para bicicletas');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (9, 'Conexion con autobuses');
INSERT INTO SERVICIO (id_servicio, nombre)
VALUES (10, 'Conexion con trenes regionales');

-- servicios por estacion
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (1, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (1, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (1, 9);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (2, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 3);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (3, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 3);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (4, 10);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (5, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (5, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (5, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (5, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (5, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (6, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (6, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (6, 8);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (7, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (8, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (8, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (9, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (10, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (10, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (10, 9);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (11, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (12, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (13, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (13, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 3);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (14, 10);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (15, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (15, 8);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (16, 9);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (17, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (17, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (18, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (18, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 2);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 3);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 4);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 5);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (19, 7);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (20, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (20, 9);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (21, 1);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (21, 6);
INSERT INTO ESTACION_SERVICIO (id_estacion, id_servicio)
VALUES (21, 8);

-- ---------------- PLATAFORMAS ----------------
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (1, 1, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (2, 1, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (3, 2, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (4, 2, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (5, 3, 'P1', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (6, 3, 'P2', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (7, 3, 'P3', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (8, 3, 'P4', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (9, 4, 'P1', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (10, 4, 'P2', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (11, 4, 'P3', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (12, 4, 'P4', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (13, 5, 'P1', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (14, 5, 'P2', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (15, 5, 'P3', 'NORTE', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (16, 5, 'P4', 'SUR', 600, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (17, 6, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (18, 6, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (19, 7, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (20, 7, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (21, 8, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (22, 8, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (23, 9, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (24, 9, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (25, 10, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (26, 10, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (27, 11, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (28, 11, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (29, 12, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (30, 12, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (31, 13, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (32, 13, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (33, 14, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (34, 14, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (35, 15, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (36, 15, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (37, 16, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (38, 16, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (39, 17, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (40, 17, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (41, 18, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (42, 18, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (43, 19, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (44, 19, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (45, 20, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (46, 20, 'P2', 'SUR', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (47, 21, 'P1', 'NORTE', 400, 'OPERATIVA');
INSERT INTO PLATAFORMA (id_plataforma, id_estacion, codigo_plataforma, direccion_viaje, capacidad_aprox, estado_operativo)
VALUES (48, 21, 'P2', 'SUR', 400, 'OPERATIVA');

-- ---------------- ESTACIONES POR LINEA (en orden) ----------------
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 1, 1, 0, 0);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 2, 2, 5.6, 9);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 11, 3, 0.9, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 3, 4, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 4, 5, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 12, 6, 1.0, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 5, 7, 0.9, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 6, 8, 1.1, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 7, 9, 1.4, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 8, 10, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 9, 11, 0.6, 1);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('A', 10, 12, 2.6, 5);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 1, 1, 0, 0);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 2, 2, 5.6, 9);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 11, 3, 0.9, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 3, 4, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 4, 5, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 12, 6, 1.0, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 5, 7, 0.9, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 6, 8, 1.1, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 7, 9, 1.4, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 8, 10, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 9, 11, 0.6, 1);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('C', 10, 12, 2.6, 5);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 16, 1, 0, 0);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 17, 2, 4.8, 8);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 18, 3, 2.9, 5);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 11, 4, 1.5, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 3, 5, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 4, 6, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 12, 7, 1.0, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 5, 8, 0.9, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 6, 9, 1.1, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 7, 10, 1.4, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('E', 19, 11, 1.1, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 13, 1, 0, 0);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 2, 2, 1.3, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 3, 3, 1.5, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 4, 4, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 5, 5, 1.6, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 8, 6, 2.4, 4);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('1', 21, 7, 1.3, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 20, 1, 0, 0);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 13, 2, 6.9, 12);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 3, 3, 2.8, 5);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 4, 4, 0.8, 2);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 5, 5, 1.6, 3);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 8, 6, 2.4, 4);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 9, 7, 0.5, 1);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 15, 8, 1.9, 4);
INSERT INTO LINEA_ESTACION (id_linea, id_estacion, orden, distancia_anterior_km, tiempo_anterior_min)
VALUES ('2', 14, 9, 1.7, 3);

-- ---------------- TRANSFERENCIAS ----------------
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (1, 1, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (2, 2, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (3, 2, '1', 'A', 4);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (4, 2, '1', 'C', 4);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (5, 3, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (6, 3, 'A', 'E', 3);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (7, 3, 'C', 'E', 3);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (8, 3, '1', '2', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (9, 3, '1', 'A', 6);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (10, 3, '2', 'A', 6);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (11, 4, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (12, 4, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (13, 4, '1', '2', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (14, 4, '1', 'A', 5);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (15, 5, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (16, 5, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (17, 5, '1', '2', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (18, 5, '1', 'A', 5);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (19, 6, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (20, 6, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (21, 7, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (22, 7, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (23, 8, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (24, 8, '1', '2', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (25, 8, '2', 'A', 5);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (26, 9, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (27, 9, '2', 'A', 4);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (28, 10, 'A', 'C', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (29, 11, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (30, 12, 'C', 'E', 2);
INSERT INTO TRANSFERENCIA (id_transferencia, id_estacion, id_linea_a, id_linea_b, tiempo_estimado_min)
VALUES (31, 13, '1', '2', 2);

-- las estaciones que tienen transferencias (y no son terminal) pasan a ser de transferencia
UPDATE ESTACION SET tipo_estacion = 'TRANSFERENCIA'
 WHERE id_estacion IN (SELECT id_estacion FROM TRANSFERENCIA)
   AND tipo_estacion <> 'TERMINAL';

-- ---------------- RUTAS ----------------
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (1, 'A-SUR-EXP', 'A', 1, 10, 'SUR', 'EXPRESO', 16.5, 36, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (2, 'A-NOR-EXP', 'A', 10, 1, 'NORTE', 'EXPRESO', 16.5, 36, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (3, 'C-SUR-LOC', 'C', 1, 10, 'SUR', 'LOCAL', 16.5, 37, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (4, 'E-SUR-LOC', 'E', 16, 19, 'SUR', 'LOCAL', 16.3, 36, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (5, '1-SUR-LOC', '1', 13, 21, 'SUR', 'LOCAL', 8.9, 21, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (6, '2-SUR-EXP', '2', 20, 14, 'SUR', 'EXPRESO', 18.6, 38, 'ACTIVA', DATE '2026-01-01', NULL);
INSERT INTO RUTA (id_ruta, codigo_ruta, id_linea, id_estacion_origen, id_estacion_destino, sentido, tipo_servicio, distancia_total_km, duracion_estimada_min, estado, fecha_vigencia_inicio, fecha_vigencia_fin)
VALUES (7, 'A-SUR-NOC', 'A', 1, 10, 'SUR', 'NOCTURNO', 16.5, 37, 'ACTIVA', DATE '2026-01-01', NULL);

-- paradas de cada ruta (minutos relativos a la salida del origen)
-- ruta A-SUR-EXP
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 1, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 2, 2, 9.0, 9.5, 5.6, 9, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 11, 3, 11.5, 11.5, 0.9, 2, 'N');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 3, 4, 13.5, 14.0, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 4, 5, 16.0, 16.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 12, 6, 18.5, 18.5, 1.0, 2, 'N');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 5, 7, 20.5, 21.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 6, 8, 23.0, 23.5, 1.1, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 7, 9, 26.5, 27.0, 1.4, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 8, 10, 29.0, 29.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 9, 11, 30.5, 31.0, 0.6, 1, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (1, 10, 12, 36.0, 36.0, 2.6, 5, 'S');
-- ruta A-NOR-EXP
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 10, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 9, 2, 5.0, 5.5, 2.6, 5, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 8, 3, 6.5, 7.0, 0.6, 1, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 7, 4, 9.0, 9.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 6, 5, 12.5, 13.0, 1.4, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 5, 6, 15.0, 15.5, 1.1, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 12, 7, 17.5, 17.5, 0.9, 2, 'N');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 4, 8, 19.5, 20.0, 1.0, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 3, 9, 22.0, 22.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 11, 10, 24.5, 24.5, 0.8, 2, 'N');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 2, 11, 26.5, 27.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (2, 1, 12, 36.0, 36.0, 5.6, 9, 'S');
-- ruta C-SUR-LOC
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 1, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 2, 2, 9.0, 9.5, 5.6, 9, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 11, 3, 11.5, 12.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 3, 4, 14.0, 14.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 4, 5, 16.5, 17.0, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 12, 6, 19.0, 19.5, 1.0, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 5, 7, 21.5, 22.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 6, 8, 24.0, 24.5, 1.1, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 7, 9, 27.5, 28.0, 1.4, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 8, 10, 30.0, 30.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 9, 11, 31.5, 32.0, 0.6, 1, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (3, 10, 12, 37.0, 37.0, 2.6, 5, 'S');
-- ruta E-SUR-LOC
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 16, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 17, 2, 8.0, 8.5, 4.8, 8, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 18, 3, 13.5, 14.0, 2.9, 5, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 11, 4, 17.0, 17.5, 1.5, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 3, 5, 19.5, 20.0, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 4, 6, 22.0, 22.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 12, 7, 24.5, 25.0, 1.0, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 5, 8, 27.0, 27.5, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 6, 9, 29.5, 30.0, 1.1, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 7, 10, 33.0, 33.5, 1.4, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (4, 19, 11, 35.5, 35.5, 1.1, 2, 'S');
-- ruta 1-SUR-LOC
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 13, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 2, 2, 3.0, 3.5, 1.3, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 3, 3, 6.5, 7.0, 1.5, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 4, 4, 9.0, 9.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 5, 5, 12.5, 13.0, 1.6, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 8, 6, 17.0, 17.5, 2.4, 4, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (5, 21, 7, 20.5, 20.5, 1.3, 3, 'S');
-- ruta 2-SUR-EXP
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 20, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 13, 2, 12.0, 12.5, 6.9, 12, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 3, 3, 17.5, 18.0, 2.8, 5, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 4, 4, 20.0, 20.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 5, 5, 23.5, 24.0, 1.6, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 8, 6, 28.0, 28.5, 2.4, 4, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 9, 7, 29.5, 30.0, 0.5, 1, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 15, 8, 34.0, 34.5, 1.9, 4, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (6, 14, 9, 37.5, 37.5, 1.7, 3, 'S');
-- ruta A-SUR-NOC
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 1, 1, 0.0, 0.0, 0, 0, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 2, 2, 9.0, 9.5, 5.6, 9, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 11, 3, 11.5, 12.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 3, 4, 14.0, 14.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 4, 5, 16.5, 17.0, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 12, 6, 19.0, 19.5, 1.0, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 5, 7, 21.5, 22.0, 0.9, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 6, 8, 24.0, 24.5, 1.1, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 7, 9, 27.5, 28.0, 1.4, 3, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 8, 10, 30.0, 30.5, 0.8, 2, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 9, 11, 31.5, 32.0, 0.6, 1, 'S');
INSERT INTO RUTA_ESTACION (id_ruta, id_estacion, orden, minutos_llegada, minutos_salida, distancia_anterior_km, tiempo_anterior_min, se_detiene)
VALUES (7, 10, 12, 37.0, 37.0, 2.6, 5, 'S');

-- ---------------- HORARIOS ----------------
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (1, 1, 'LABORAL', '06:00', '10:00', 4, 'EXPRESO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (2, 1, 'LABORAL', '10:00', '16:00', 8, 'EXPRESO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (3, 1, 'FIN_SEMANA', '07:00', '22:00', 10, 'EXPRESO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (4, 3, 'TODOS', '06:00', '23:00', 8, 'LOCAL', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (5, 7, 'TODOS', '00:00', '05:00', 15, 'NOCTURNO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (6, 6, 'LABORAL', '06:00', '20:00', 6, 'EXPRESO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (7, 5, 'TODOS', '05:30', '23:30', 7, 'LOCAL', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (8, 4, 'LABORAL', '06:00', '21:00', 6, 'LOCAL', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (9, 2, 'LABORAL', '06:00', '10:00', 5, 'EXPRESO', DATE '2026-01-01', NULL, 'ACTIVO');
INSERT INTO HORARIO (id_horario, id_ruta, dia_semana, hora_inicio, hora_fin, frecuencia_min, tipo_servicio, fecha_inicio_vigor, fecha_fin_vigor, estado)
VALUES (10, 3, 'FESTIVO', '08:00', '22:00', 12, 'LOCAL', DATE '2026-01-01', NULL, 'ACTIVO');

-- ---------------- DEPOSITOS, MODELOS, TRENES Y VAGONES ----------------
INSERT INTO DEPOSITO (id_deposito, nombre, direccion, distrito, capacidad_trenes)
VALUES (1, 'Patio 207 St', '10 Av y W 207 St', 'MANHATTAN', 60);
INSERT INTO DEPOSITO (id_deposito, nombre, direccion, distrito, capacidad_trenes)
VALUES (2, 'Patio Jamaica', 'Archer Av y 150 St', 'QUEENS', 50);
INSERT INTO DEPOSITO (id_deposito, nombre, direccion, distrito, capacidad_trenes)
VALUES (3, 'Patio Coney Island', 'Avenue X y McDonald Av', 'BROOKLYN', 80);
INSERT INTO DEPOSITO (id_deposito, nombre, direccion, distrito, capacidad_trenes)
VALUES (4, 'Patio 239 St', 'White Plains Rd y E 239 St', 'BRONX', 45);
INSERT INTO MODELO_TREN (id_modelo, nombre_modelo, fabricante)
VALUES (1, 'R160', 'Kawasaki');
INSERT INTO MODELO_TREN (id_modelo, nombre_modelo, fabricante)
VALUES (2, 'R142', 'Bombardier');
INSERT INTO MODELO_TREN (id_modelo, nombre_modelo, fabricante)
VALUES (3, 'R211', 'Kawasaki');
INSERT INTO MODELO_TREN (id_modelo, nombre_modelo, fabricante)
VALUES (4, 'R46', 'Pullman Standard');

INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-101', 3, 2023, 570, 'DISPONIBLE', 45210.5, 1, TRUNC(SYSDATE) - 40, TRUNC(SYSDATE) + 50);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-102', 3, 2024, 570, 'DISPONIBLE', 30480.0, 1, TRUNC(SYSDATE) - 23, TRUNC(SYSDATE) + 67);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-103', 1, 2008, 570, 'DISPONIBLE', 890320.4, 2, TRUNC(SYSDATE) - 65, TRUNC(SYSDATE) + 25);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-104', 1, 2009, 570, 'EN_MANTENIMIENTO', 910775.9, 2, TRUNC(SYSDATE) - 115, TRUNC(SYSDATE) - 25);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-105', 2, 2000, 570, 'DISPONIBLE', 1200450.0, 4, TRUNC(SYSDATE) - 54, TRUNC(SYSDATE) + 36);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-106', 2, 2001, 570, 'DISPONIBLE', 1150302.7, 4, TRUNC(SYSDATE) - 14, TRUNC(SYSDATE) + 76);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-107', 4, 1976, 570, 'FUERA_SERVICIO', 2500010.0, 3, TRUNC(SYSDATE) - 146, TRUNC(SYSDATE) - 56);
INSERT INTO TREN (codigo_tren, id_modelo, anio_fabricacion, capacidad_total, estado_operativo, kilometraje_km, id_deposito, fecha_ultima_inspeccion, fecha_proxima_inspeccion)
VALUES ('T-108', 1, 2010, 570, 'DISPONIBLE', 780118.2, 2, TRUNC(SYSDATE) - 95, TRUNC(SYSDATE) - 5);

INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1011', 'CABINA', 40, 150, 2023, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1012', 'MOTRIZ', 40, 150, 2023, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1013', 'CABINA', 40, 150, 2023, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1021', 'CABINA', 40, 150, 2024, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1022', 'MOTRIZ', 40, 150, 2024, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R211-1023', 'CABINA', 40, 150, 2024, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1031', 'CABINA', 40, 150, 2008, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1032', 'MOTRIZ', 40, 150, 2008, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1033', 'CABINA', 40, 150, 2008, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1041', 'CABINA', 40, 150, 2009, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1042', 'MOTRIZ', 40, 150, 2009, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1043', 'CABINA', 40, 150, 2009, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1051', 'CABINA', 40, 150, 2000, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1052', 'MOTRIZ', 40, 150, 2000, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1053', 'CABINA', 40, 150, 2000, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1061', 'CABINA', 40, 150, 2001, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1062', 'MOTRIZ', 40, 150, 2001, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R142-1063', 'CABINA', 40, 150, 2001, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R46-1071', 'CABINA', 40, 150, 1976, 'FUERA_SERVICIO', 'N');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R46-1072', 'MOTRIZ', 40, 150, 1976, 'FUERA_SERVICIO', 'N');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R46-1073', 'CABINA', 40, 150, 1976, 'FUERA_SERVICIO', 'N');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1081', 'CABINA', 40, 150, 2010, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1082', 'MOTRIZ', 40, 150, 2010, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-1083', 'CABINA', 40, 150, 2010, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-9001', 'CABINA', 40, 150, 2009, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R160-9002', 'REMOLQUE', 44, 160, 2010, 'OPERATIVO', 'S');
INSERT INTO VAGON (numero_serie, tipo_vagon, capacidad_sentados, capacidad_pie, anio_fabricacion, estado, accesible)
VALUES ('R46-9003', 'REMOLQUE', 44, 160, 1976, 'RETIRADO', 'N');

-- composicion de los trenes (con un poco de historial)
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (1, 'T-101', 'R211-1011', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (2, 'T-101', 'R211-1012', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (3, 'T-101', 'R211-1013', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (4, 'T-102', 'R211-1021', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (5, 'T-102', 'R211-1022', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (6, 'T-102', 'R211-1023', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (7, 'T-103', 'R160-1031', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (8, 'T-103', 'R160-1032', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (9, 'T-103', 'R160-1033', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (10, 'T-104', 'R160-1041', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (11, 'T-104', 'R160-1042', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (12, 'T-104', 'R160-1043', 3, TRUNC(SYSDATE) - 400, TRUNC(SYSDATE) - 30);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (13, 'T-104', 'R160-9001', 3, TRUNC(SYSDATE) - 30, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (14, 'T-105', 'R142-1051', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (15, 'T-105', 'R142-1052', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (16, 'T-105', 'R142-1053', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (17, 'T-106', 'R142-1061', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (18, 'T-106', 'R142-1062', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (19, 'T-106', 'R142-1063', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (20, 'T-107', 'R46-1071', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (21, 'T-107', 'R46-1072', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (22, 'T-107', 'R46-1073', 3, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (23, 'T-108', 'R160-1081', 1, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (24, 'T-108', 'R160-1082', 2, TRUNC(SYSDATE) - 400, NULL);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (25, 'T-108', 'R160-1083', 3, TRUNC(SYSDATE) - 400, TRUNC(SYSDATE) - 30);
INSERT INTO TREN_VAGON (id_composicion, codigo_tren, numero_serie, posicion, fecha_inicio, fecha_fin)
VALUES (26, 'T-108', 'R160-1043', 3, TRUNC(SYSDATE) - 30, NULL);

-- el vagon R160-1083 salio del T-108, lo dejamos en revision
UPDATE VAGON SET estado = 'EN_MANTENIMIENTO' WHERE numero_serie = 'R160-1083';

-- ---------------- CARGOS Y EMPLEADOS ----------------
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (1, 'CONDUCTOR', 'Conductor', 'Opera los trenes en las rutas asignadas');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (2, 'OPERADOR_CONTROL', 'Operador de control', 'Monitorea la red desde el centro de control');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (3, 'SUPERVISOR_ESTACION', 'Supervisor de estacion', 'Responsable de la operacion de una estacion');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (4, 'TECNICO_MANT', 'Tecnico de mantenimiento', 'Realiza mantenimiento de trenes y equipos');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (5, 'SEGURIDAD', 'Agente de seguridad', 'Seguridad en estaciones y trenes');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (6, 'ATENCION_PASAJERO', 'Atencion al pasajero', 'Informacion y ayuda a los pasajeros');
INSERT INTO CARGO (id_cargo, codigo_cargo, nombre_cargo, descripcion)
VALUES (7, 'GERENTE_OPERACIONES', 'Gerente de operaciones', 'Jefe del area de operaciones');

INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (1, 'Michael', 'Johnson', DATE '1975-03-12', '245 W 72 St, Manhattan', '212-555-0101', 'mjohnson@metrony.org', DATE '2005-06-01', 7, 'MATUTINO', 98000, 'ACTIVO', NULL);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (2, 'Sarah', 'Williams', DATE '1982-07-25', '88 Court St, Brooklyn', '718-555-0102', 'swilliams@metrony.org', DATE '2010-02-15', 3, 'MATUTINO', 72000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (3, 'David', 'Martinez', DATE '1988-11-03', '1402 Grand Concourse, Bronx', '718-555-0103', 'dmartinez@metrony.org', DATE '2014-09-01', 1, 'MATUTINO', 68000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (4, 'Emily', 'Brown', DATE '1990-01-19', '37-10 82 St, Queens', '718-555-0104', 'ebrown@metrony.org', DATE '2016-03-10', 1, 'MATUTINO', 66000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (5, 'James', 'Garcia', DATE '1985-05-30', '560 W 180 St, Manhattan', '212-555-0105', 'jgarcia@metrony.org', DATE '2012-11-20', 1, 'VESPERTINO', 67000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (6, 'Maria', 'Rodriguez', DATE '1992-09-14', '210 Flatbush Av, Brooklyn', '718-555-0106', 'mrodriguez@metrony.org', DATE '2018-01-08', 1, 'MATUTINO', 63000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (7, 'Robert', 'Wilson', DATE '1987-12-02', '41-25 Queens Blvd, Queens', '718-555-0107', 'rwilson@metrony.org', DATE '2013-07-22', 1, 'ROTATIVO', 68500, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (8, 'Jennifer', 'Lee', DATE '1984-04-08', '120 E 23 St, Manhattan', '212-555-0108', 'jlee@metrony.org', DATE '2011-05-16', 2, 'MATUTINO', 70000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (9, 'Carlos', 'Hernandez', DATE '1983-08-21', '765 E 149 St, Bronx', '718-555-0109', 'chernandez@metrony.org', DATE '2009-10-05', 4, 'MATUTINO', 65000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (10, 'Linda', 'Davis', DATE '1991-02-27', '2201 Atlantic Av, Brooklyn', '718-555-0110', 'ldavis@metrony.org', DATE '2017-04-18', 4, 'MATUTINO', 61000, 'ACTIVO', 9);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (11, 'Kevin', 'Nguyen', DATE '1994-06-11', '90-15 Roosevelt Av, Queens', '718-555-0111', 'knguyen@metrony.org', DATE '2020-08-03', 4, 'VESPERTINO', 58000, 'ACTIVO', 9);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (12, 'Ashley', 'Clark', DATE '1993-10-09', '315 W 42 St, Manhattan', '212-555-0112', 'aclark@metrony.org', DATE '2019-02-11', 5, 'MATUTINO', 55000, 'ACTIVO', 2);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (13, 'Daniel', 'Lopez', DATE '1996-03-23', '501 8 Av, Manhattan', '212-555-0113', 'dlopez@metrony.org', DATE '2021-06-28', 6, 'MATUTINO', 48000, 'ACTIVO', 2);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (14, 'Jessica', 'Taylor', DATE '1986-12-15', '18 Jay St, Brooklyn', '718-555-0114', 'jtaylor@metrony.org', DATE '2012-03-19', 3, 'VESPERTINO', 71000, 'ACTIVO', 1);
INSERT INTO EMPLEADO (id_empleado, nombres, apellidos, fecha_nacimiento, direccion, telefono, correo, fecha_contratacion, id_cargo, turno, salario, estado_laboral, id_supervisor)
VALUES (15, 'Anthony', 'Moore', DATE '1979-07-07', '2750 Ocean Av, Brooklyn', '718-555-0115', 'amoore@metrony.org', DATE '2003-09-29', 1, 'NOCTURNO', 70500, 'ACTIVO', 1);

-- certificaciones (la 3 se inserta ya vencida para probar el trigger de alerta)
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (1, 3, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 330, TRUNC(SYSDATE) + 400, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (1, 3);
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (1, 1);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (2, 4, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 500, TRUNC(SYSDATE) + 200, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (2, 1);
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (2, 2);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (3, 5, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 740, TRUNC(SYSDATE) - 10, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (3, 3);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (4, 6, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 700, TRUNC(SYSDATE) + 20, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (4, 2);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (5, 7, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 200, TRUNC(SYSDATE) + 500, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (5, 3);
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (5, 1);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (6, 15, 'Licencia de operacion de tren', TRUNC(SYSDATE) - 300, TRUNC(SYSDATE) + 100, 'NYC Transit Training Center', 'VIGENTE');
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (6, 4);
INSERT INTO CERTIFICACION_MODELO (id_certificacion, id_modelo)
VALUES (6, 2);
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (7, 9, 'Certificacion en sistemas electricos y frenos', TRUNC(SYSDATE) - 400, TRUNC(SYSDATE) + 330, 'NY State Technical Institute', 'VIGENTE');
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (8, 12, 'Primeros auxilios y RCP', TRUNC(SYSDATE) - 320, TRUNC(SYSDATE) + 45, 'American Red Cross', 'VIGENTE');
INSERT INTO CERTIFICACION (id_certificacion, id_empleado, tipo_certificacion, fecha_emision, fecha_vencimiento, institucion_emisora, estado)
VALUES (9, 10, 'Certificacion en elevadores y escaleras electricas', TRUNC(SYSDATE) - 150, TRUNC(SYSDATE) + 580, 'NY State Technical Institute', 'VIGENTE');

-- ---------------- PASAJEROS ----------------
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (1, 'John', 'Smith', DATE '1990-04-12', 'jsmith@mail.com', '917-555-2001', 'REGULAR', TRUNC(SYSDATE) - 400, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (2, 'Ana', 'Morales', DATE '2006-09-30', 'amorales@mail.com', '917-555-2002', 'ESTUDIANTE', TRUNC(SYSDATE) - 210, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (3, 'Robert', 'King', DATE '1952-01-18', 'rking@mail.com', '917-555-2003', 'ADULTO_MAYOR', TRUNC(SYSDATE) - 800, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (4, 'Laura', 'Chen', DATE '1988-06-05', 'lchen@mail.com', '917-555-2004', 'DISCAPACIDAD', TRUNC(SYSDATE) - 150, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (5, 'Mark', 'Evans', DATE '1984-11-22', 'mevans@metrony.org', '917-555-2005', 'EMPLEADO', TRUNC(SYSDATE) - 900, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (6, 'Sofia', 'Rossi', DATE '1995-02-14', 'srossi@mail.com', '917-555-2006', 'REGULAR', TRUNC(SYSDATE) - 95, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (7, 'Peter', 'Wright', DATE '2007-07-01', 'pwright@mail.com', '917-555-2007', 'ESTUDIANTE', TRUNC(SYSDATE) - 60, 'ACTIVO');
INSERT INTO PASAJERO (id_pasajero, nombres, apellidos, fecha_nacimiento, correo, telefono, tipo_pasajero, fecha_registro, estado)
VALUES (8, 'Grace', 'Kim', DATE '1979-12-09', 'gkim@mail.com', '917-555-2008', 'REGULAR', TRUNC(SYSDATE) - 1300, 'ACTIVO');

-- ---------------- TARIFAS ----------------
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('VI-REG', 'Viaje individual', 'Un viaje con tarjeta o boleto', 'VIAJE_INDIVIDUAL', 2.9, 'TODOS', DATE '2025-01-05', NULL, NULL, NULL, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('RED-AM', 'Tarifa reducida adulto mayor', 'Mitad de precio para mayores de 65', 'TARIFA_REDUCIDA', 1.45, 'ADULTO_MAYOR', DATE '2025-01-05', NULL, NULL, NULL, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('RED-DIS', 'Tarifa reducida discapacidad', 'Mitad de precio para personas con discapacidad', 'TARIFA_REDUCIDA', 1.45, 'DISCAPACIDAD', DATE '2025-01-05', NULL, NULL, NULL, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('PD-24H', 'Pase diario', 'Viajes ilimitados por 24 horas', 'PASE_DIARIO', 15.0, 'TODOS', DATE '2025-01-05', NULL, NULL, 1, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('PS-7D', 'Pase semanal', 'Viajes ilimitados por 7 dias', 'PASE_SEMANAL', 34.0, 'TODOS', DATE '2025-01-05', NULL, NULL, 7, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('PM-30D', 'Pase mensual', 'Viajes ilimitados por 30 dias', 'PASE_MENSUAL', 132.0, 'TODOS', DATE '2025-01-05', NULL, NULL, 30, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('PE-EST', 'Pase estudiantil', 'Hasta 90 viajes en 30 dias para estudiantes', 'PASE_ESTUDIANTIL', 20.0, 'ESTUDIANTE', DATE '2025-01-05', NULL, 90, 30, 'ACTIVA');
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('EMP-AUT', 'Empleado autorizado', 'Acceso sin costo para empleados', 'TARIFA_REDUCIDA', 0.0, 'EMPLEADO', DATE '2025-01-05', NULL, NULL, NULL, 'ACTIVA');
-- tarifa vieja que ya no se usa (queda para el historial)
INSERT INTO TARIFA (codigo_tarifa, nombre, descripcion, tipo_producto, monto, tipo_pasajero, fecha_inicio_vigencia, fecha_fin_vigencia, cantidad_max_viajes, duracion_dias, estado)
VALUES ('VI-2023', 'Viaje individual 2023', 'Tarifa anterior de viaje individual', 'VIAJE_INDIVIDUAL', 2.75, 'TODOS', DATE '2023-08-20', DATE '2025-01-04', NULL, NULL, 'INACTIVA');

-- ---------------- TARJETAS ----------------
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000001, 1, 'VI-REG', TRUNC(SYSDATE) - 400, TRUNC(SYSDATE) + 1425, 25.3, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000002, 2, 'PE-EST', TRUNC(SYSDATE) - 200, TRUNC(SYSDATE) + 1625, 40.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000003, 3, 'RED-AM', TRUNC(SYSDATE) - 780, TRUNC(SYSDATE) + 1045, 12.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000004, 4, 'RED-DIS', TRUNC(SYSDATE) - 140, TRUNC(SYSDATE) + 1685, 8.55, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000005, 5, 'EMP-AUT', TRUNC(SYSDATE) - 880, TRUNC(SYSDATE) + 945, 0.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000006, 6, 'PM-30D', TRUNC(SYSDATE) - 90, TRUNC(SYSDATE) + 1735, 150.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000007, 7, 'PE-EST', TRUNC(SYSDATE) - 55, TRUNC(SYSDATE) + 1770, 5.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000008, NULL, 'VI-REG', TRUNC(SYSDATE) - 30, TRUNC(SYSDATE) + 1795, 10.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000009, NULL, 'VI-REG', TRUNC(SYSDATE) - 300, TRUNC(SYSDATE) + 1525, 1.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000010, 8, 'VI-REG', TRUNC(SYSDATE) - 1830, TRUNC(SYSDATE) - 5, 20.0, 'ACTIVA');
INSERT INTO TARJETA (numero_tarjeta, id_pasajero, codigo_tarifa, fecha_emision, fecha_vencimiento, saldo, estado)
VALUES (4000000000000011, 1, 'VI-REG', TRUNC(SYSDATE) - 1500, TRUNC(SYSDATE) + 300, 0.0, 'PERDIDA');
-- la 4000000000000010 se inserto ACTIVA pero ya vencio: el trigger la deja como VENCIDA

-- ---------------- RECARGAS ----------------
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (1, 4000000000000001, TRUNC(SYSDATE) - 20 + 9/24 + 30/1440, 20.0, 'TARJETA_DEBITO', 'MAQUINA_ESTACION', 3, 8.4, 28.4);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (2, 4000000000000001, TRUNC(SYSDATE) - 6 + 18/24 + 5/1440, 20.0, 'APP_MOVIL', 'APP', NULL, 15.1, 35.1);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (3, 4000000000000002, TRUNC(SYSDATE) - 15 + 7/24 + 45/1440, 60.0, 'EFECTIVO', 'TAQUILLA', 4, 0.0, 60.0);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (4, 4000000000000003, TRUNC(SYSDATE) - 12 + 10/24 + 10/1440, 15.0, 'EFECTIVO', 'MAQUINA_ESTACION', 2, 4.35, 19.35);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (5, 4000000000000004, TRUNC(SYSDATE) - 8 + 13/24, 10.0, 'TARJETA_CREDITO', 'WEB', NULL, 5.65, 15.65);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (6, 4000000000000006, TRUNC(SYSDATE) - 9 + 8/24 + 15/1440, 282.0, 'TARJETA_CREDITO', 'WEB', NULL, 0.0, 282.0);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (7, 4000000000000008, TRUNC(SYSDATE) - 5 + 17/24 + 40/1440, 20.0, 'EFECTIVO', 'MAQUINA_ESTACION', 14, 0.0, 20.0);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (8, 4000000000000009, TRUNC(SYSDATE) - 40 + 12/24, 5.0, 'EFECTIVO', 'MAQUINA_ESTACION', 9, 1.8, 6.8);
INSERT INTO RECARGA (numero_transaccion, numero_tarjeta, fecha_hora, monto, medio_pago, canal, id_estacion, saldo_anterior, saldo_posterior)
VALUES (9, 4000000000000007, TRUNC(SYSDATE) - 20 + 16/24 + 20/1440, 25.0, 'EFECTIVO', 'TAQUILLA', 3, 0.0, 25.0);

-- ---------------- VIAJES DE PASAJEROS (ultimos 7 dias) ----------------
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (1, 'TARJETA', 4000000000000001, 7, TRUNC(SYSDATE) - 7 + 6/24 + 49/1440, 3, TRUNC(SYSDATE) - 7 + 7/24 + 28/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (2, 'TARJETA', 4000000000000004, 3, TRUNC(SYSDATE) - 7 + 7/24 + 14/1440, 4, TRUNC(SYSDATE) - 7 + 7/24 + 33/1440, 'RED-DIS', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (3, 'TARJETA', 4000000000000001, 10, TRUNC(SYSDATE) - 7 + 7/24 + 36/1440, 3, TRUNC(SYSDATE) - 7 + 8/24 + 2/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (4, 'BOLETO', NULL, 12, TRUNC(SYSDATE) - 7 + 8/24 + 34/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (5, 'BOLETO', NULL, 14, TRUNC(SYSDATE) - 7 + 12/24 + 44/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (6, 'BOLETO', NULL, 4, TRUNC(SYSDATE) - 7 + 15/24 + 8/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (7, 'TARJETA', 4000000000000007, 11, TRUNC(SYSDATE) - 7 + 17/24 + 6/1440, 4, TRUNC(SYSDATE) - 7 + 17/24 + 30/1440, 'PE-EST', 20.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (8, 'TARJETA', 4000000000000007, 18, TRUNC(SYSDATE) - 7 + 20/24, 3, TRUNC(SYSDATE) - 7 + 20/24 + 25/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (9, 'TARJETA', 4000000000000004, 21, TRUNC(SYSDATE) - 6 + 11/24 + 21/1440, 20, TRUNC(SYSDATE) - 6 + 11/24 + 48/1440, 'RED-DIS', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (10, 'BOLETO', NULL, 2, TRUNC(SYSDATE) - 6 + 13/24 + 17/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (11, 'TARJETA', 4000000000000006, 19, TRUNC(SYSDATE) - 6 + 13/24 + 44/1440, 13, TRUNC(SYSDATE) - 6 + 14/24, 'PM-30D', 132.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (12, 'BOLETO', NULL, 14, TRUNC(SYSDATE) - 6 + 13/24 + 56/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (13, 'BOLETO', NULL, 9, TRUNC(SYSDATE) - 6 + 15/24 + 4/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (14, 'BOLETO', NULL, 6, TRUNC(SYSDATE) - 6 + 15/24 + 59/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (15, 'TARJETA', 4000000000000002, 20, TRUNC(SYSDATE) - 6 + 17/24 + 36/1440, 11, TRUNC(SYSDATE) - 6 + 18/24 + 8/1440, 'PE-EST', 20.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (16, 'TARJETA', 4000000000000006, 13, TRUNC(SYSDATE) - 6 + 19/24 + 15/1440, 11, TRUNC(SYSDATE) - 6 + 19/24 + 56/1440, 'PM-30D', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (17, 'BOLETO', NULL, 3, TRUNC(SYSDATE) - 6 + 21/24 + 45/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (18, 'TARJETA', 4000000000000009, 2, TRUNC(SYSDATE) - 5 + 7/24 + 2/1440, 19, TRUNC(SYSDATE) - 5 + 7/24 + 36/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (19, 'BOLETO', NULL, 1, TRUNC(SYSDATE) - 5 + 7/24 + 6/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (20, 'TARJETA', 4000000000000002, 6, TRUNC(SYSDATE) - 5 + 11/24 + 17/1440, 21, TRUNC(SYSDATE) - 5 + 11/24 + 47/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (21, 'BOLETO', NULL, 5, TRUNC(SYSDATE) - 5 + 14/24 + 5/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (22, 'TARJETA', 4000000000000009, 3, TRUNC(SYSDATE) - 5 + 17/24 + 20/1440, 6, TRUNC(SYSDATE) - 5 + 17/24 + 49/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (23, 'TARJETA', 4000000000000008, 12, TRUNC(SYSDATE) - 5 + 17/24 + 53/1440, 18, TRUNC(SYSDATE) - 5 + 18/24 + 31/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (24, 'TARJETA', 4000000000000008, 5, TRUNC(SYSDATE) - 5 + 17/24 + 58/1440, 4, TRUNC(SYSDATE) - 5 + 18/24 + 19/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (25, 'TARJETA', 4000000000000004, 3, TRUNC(SYSDATE) - 5 + 18/24 + 28/1440, 17, TRUNC(SYSDATE) - 5 + 18/24 + 51/1440, 'RED-DIS', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (26, 'TARJETA', 4000000000000003, 18, TRUNC(SYSDATE) - 4 + 6/24 + 4/1440, NULL, NULL, 'RED-AM', 1.45, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (27, 'TARJETA', 4000000000000001, 1, TRUNC(SYSDATE) - 4 + 8/24 + 29/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (28, 'TARJETA', 4000000000000007, 14, TRUNC(SYSDATE) - 4 + 10/24 + 48/1440, 1, TRUNC(SYSDATE) - 4 + 11/24 + 6/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (29, 'TARJETA', 4000000000000008, 3, TRUNC(SYSDATE) - 4 + 12/24 + 18/1440, 2, TRUNC(SYSDATE) - 4 + 12/24 + 58/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (30, 'BOLETO', NULL, 9, TRUNC(SYSDATE) - 4 + 13/24 + 9/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (31, 'TARJETA', 4000000000000002, 3, TRUNC(SYSDATE) - 4 + 15/24 + 7/1440, 16, TRUNC(SYSDATE) - 4 + 15/24 + 25/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (32, 'TARJETA', 4000000000000001, 3, TRUNC(SYSDATE) - 4 + 15/24 + 39/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (33, 'TARJETA', 4000000000000003, 16, TRUNC(SYSDATE) - 4 + 16/24 + 24/1440, 9, TRUNC(SYSDATE) - 4 + 16/24 + 59/1440, 'RED-AM', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (34, 'BOLETO', NULL, 19, TRUNC(SYSDATE) - 3 + 7/24 + 27/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (35, 'TARJETA', 4000000000000005, 6, TRUNC(SYSDATE) - 3 + 7/24 + 58/1440, 4, TRUNC(SYSDATE) - 3 + 8/24 + 43/1440, 'EMP-AUT', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (36, 'BOLETO', NULL, 7, TRUNC(SYSDATE) - 3 + 8/24 + 5/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (37, 'TARJETA', 4000000000000007, 3, TRUNC(SYSDATE) - 3 + 11/24 + 19/1440, 14, TRUNC(SYSDATE) - 3 + 11/24 + 36/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (38, 'TARJETA', 4000000000000005, 7, TRUNC(SYSDATE) - 3 + 13/24 + 57/1440, 4, TRUNC(SYSDATE) - 3 + 14/24 + 31/1440, 'EMP-AUT', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (39, 'TARJETA', 4000000000000007, 8, TRUNC(SYSDATE) - 3 + 14/24 + 11/1440, 9, TRUNC(SYSDATE) - 3 + 14/24 + 37/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (40, 'TARJETA', 4000000000000004, 21, TRUNC(SYSDATE) - 3 + 14/24 + 15/1440, 14, TRUNC(SYSDATE) - 3 + 14/24 + 41/1440, 'RED-DIS', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (41, 'BOLETO', NULL, 6, TRUNC(SYSDATE) - 3 + 14/24 + 19/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (42, 'TARJETA', 4000000000000001, 3, TRUNC(SYSDATE) - 3 + 20/24 + 29/1440, 10, TRUNC(SYSDATE) - 3 + 20/24 + 57/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (43, 'TARJETA', 4000000000000006, 3, TRUNC(SYSDATE) - 2 + 11/24 + 52/1440, 9, TRUNC(SYSDATE) - 2 + 12/24 + 34/1440, 'PM-30D', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (44, 'BOLETO', NULL, 5, TRUNC(SYSDATE) - 2 + 13/24 + 37/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (45, 'TARJETA', 4000000000000001, 6, TRUNC(SYSDATE) - 2 + 16/24 + 19/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (46, 'TARJETA', 4000000000000002, 11, TRUNC(SYSDATE) - 2 + 17/24 + 49/1440, 14, TRUNC(SYSDATE) - 2 + 18/24 + 13/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (47, 'TARJETA', 4000000000000003, 14, TRUNC(SYSDATE) - 2 + 18/24 + 20/1440, 9, TRUNC(SYSDATE) - 2 + 18/24 + 37/1440, 'RED-AM', 1.45, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (48, 'TARJETA', 4000000000000008, 1, TRUNC(SYSDATE) - 2 + 19/24 + 47/1440, 3, TRUNC(SYSDATE) - 2 + 20/24 + 9/1440, 'VI-REG', 2.9, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (49, 'BOLETO', NULL, 4, TRUNC(SYSDATE) - 2 + 21/24 + 59/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (50, 'BOLETO', NULL, 11, TRUNC(SYSDATE) - 1 + 8/24 + 34/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (51, 'TARJETA', 4000000000000009, 17, TRUNC(SYSDATE) - 1 + 13/24 + 56/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (52, 'BOLETO', NULL, 8, TRUNC(SYSDATE) - 1 + 16/24 + 4/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (53, 'BOLETO', NULL, 3, TRUNC(SYSDATE) - 1 + 17/24 + 11/1440, NULL, NULL, 'VI-REG', 2.9, 'SIN_SALIDA');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (54, 'TARJETA', 4000000000000002, 7, TRUNC(SYSDATE) - 1 + 19/24 + 45/1440, 4, TRUNC(SYSDATE) - 1 + 20/24 + 24/1440, 'PE-EST', 0.0, 'COMPLETADO');
INSERT INTO VIAJE_PASAJERO (numero_transaccion, tipo_acceso, numero_tarjeta, id_estacion_ingreso, fecha_hora_ingreso, id_estacion_salida, fecha_hora_salida, codigo_tarifa, monto_cobrado, estado)
VALUES (55, 'TARJETA', 4000000000000004, 11, TRUNC(SYSDATE) - 1 + 21/24 + 26/1440, NULL, NULL, 'RED-DIS', 1.45, 'SIN_SALIDA');

-- la tarjeta 7 se bloqueo ayer (reporte del pasajero)
UPDATE TARJETA SET estado = 'BLOQUEADA' WHERE numero_tarjeta = 4000000000000007;

-- ---------------- VIAJES PROGRAMADOS ----------------
-- ayer: completados, algunos con retraso y uno cancelado
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (1, 1, 1, TRUNC(SYSDATE) - 1 + 7/24, TRUNC(SYSDATE) - 1 + 7/24 + 36/1440, TRUNC(SYSDATE) - 1 + 7/24 + 1/1440, TRUNC(SYSDATE) - 1 + 7/24 + 38/1440, 'T-101', 3, 'COMPLETADO', 850, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (2, 1, 1, TRUNC(SYSDATE) - 1 + 7/24 + 20/1440, TRUNC(SYSDATE) - 1 + 7/24 + 56/1440, TRUNC(SYSDATE) - 1 + 7/24 + 20/1440, TRUNC(SYSDATE) - 1 + 7/24 + 56/1440, 'T-102', 7, 'COMPLETADO', 910, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (3, 3, 4, TRUNC(SYSDATE) - 1 + 7/24 + 12/1440, TRUNC(SYSDATE) - 1 + 7/24 + 49/1440, TRUNC(SYSDATE) - 1 + 7/24 + 15/1440, TRUNC(SYSDATE) - 1 + 8/24 + 7/1440, 'T-103', 4, 'COMPLETADO', 920, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (4, 6, 6, TRUNC(SYSDATE) - 1 + 8/24, TRUNC(SYSDATE) - 1 + 8/24 + 38/1440, TRUNC(SYSDATE) - 1 + 8/24, TRUNC(SYSDATE) - 1 + 8/24 + 43/1440, 'T-105', 6, 'COMPLETADO', 780, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (5, 1, 1, TRUNC(SYSDATE) - 1 + 9/24, TRUNC(SYSDATE) - 1 + 9/24 + 36/1440, TRUNC(SYSDATE) - 1 + 9/24, TRUNC(SYSDATE) - 1 + 9/24 + 37/1440, 'T-101', 3, 'COMPLETADO', 640, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (6, 2, 9, TRUNC(SYSDATE) - 1 + 9/24, TRUNC(SYSDATE) - 1 + 9/24 + 36/1440, TRUNC(SYSDATE) - 1 + 9/24, TRUNC(SYSDATE) - 1 + 9/24 + 36/1440, 'T-102', 7, 'COMPLETADO', 600, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (7, 5, 7, TRUNC(SYSDATE) - 1 + 10/24 + 30/1440, TRUNC(SYSDATE) - 1 + 10/24 + 51/1440, TRUNC(SYSDATE) - 1 + 10/24 + 52/1440, TRUNC(SYSDATE) - 1 + 11/24 + 16/1440, 'T-106', 6, 'COMPLETADO', 410, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (8, 3, 4, TRUNC(SYSDATE) - 1 + 12/24, TRUNC(SYSDATE) - 1 + 12/24 + 37/1440, NULL, NULL, 'T-103', 4, 'CANCELADO', 0, 'Falla de senalizacion en 34 St');
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (9, 4, 8, TRUNC(SYSDATE) - 1 + 13/24, TRUNC(SYSDATE) - 1 + 13/24 + 36/1440, TRUNC(SYSDATE) - 1 + 13/24 + 4/1440, TRUNC(SYSDATE) - 1 + 13/24 + 52/1440, 'T-108', 7, 'COMPLETADO', 530, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (10, 6, 6, TRUNC(SYSDATE) - 1 + 17/24 + 30/1440, TRUNC(SYSDATE) - 1 + 18/24 + 8/1440, TRUNC(SYSDATE) - 1 + 17/24 + 30/1440, TRUNC(SYSDATE) - 1 + 18/24 + 11/1440, 'T-105', 6, 'COMPLETADO', 990, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (11, 7, 5, TRUNC(SYSDATE) - 1 + 1/24, TRUNC(SYSDATE) - 1 + 1/24 + 37/1440, TRUNC(SYSDATE) - 1 + 1/24, TRUNC(SYSDATE) - 1 + 1/24 + 37/1440, 'T-103', 4, 'COMPLETADO', 120, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (12, 5, 7, TRUNC(SYSDATE) - 1 + 18/24, TRUNC(SYSDATE) - 1 + 18/24 + 21/1440, TRUNC(SYSDATE) - 1 + 18/24 + 2/1440, TRUNC(SYSDATE) - 1 + 18/24 + 23/1440, 'T-106', 4, 'COMPLETADO', 870, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (13, 4, 8, TRUNC(SYSDATE) - 1 + 17/24, TRUNC(SYSDATE) - 1 + 17/24 + 36/1440, TRUNC(SYSDATE) - 1 + 17/24, TRUNC(SYSDATE) - 1 + 17/24 + 36/1440, 'T-108', 3, 'COMPLETADO', 760, NULL);

-- viaje en curso en este momento
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (14, 1, NULL, TRUNC(SYSDATE, 'MI') - 10/1440, TRUNC(SYSDATE, 'MI') + 26/1440, TRUNC(SYSDATE, 'MI') - 9/1440, NULL,
        'T-102', 7, 'EN_CURSO', 700, NULL);
UPDATE TREN SET estado_operativo = 'EN_OPERACION' WHERE codigo_tren = 'T-102';

-- proximos viajes (relativos a la hora en que se corre el script)
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (15, 1, NULL, TRUNC(SYSDATE, 'MI') + 25/1440, TRUNC(SYSDATE, 'MI') + 61/1440, NULL, NULL,
        'T-101', 3, 'PROGRAMADO', 650, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (16, 3, NULL, TRUNC(SYSDATE, 'MI') + 15/1440, TRUNC(SYSDATE, 'MI') + 52/1440, NULL, NULL,
        'T-103', 4, 'PROGRAMADO', 700, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (17, 6, NULL, TRUNC(SYSDATE, 'MI') + 40/1440, TRUNC(SYSDATE, 'MI') + 78/1440, NULL, NULL,
        'T-105', 6, 'PROGRAMADO', 820, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (18, 5, NULL, TRUNC(SYSDATE, 'MI') + 30/1440, TRUNC(SYSDATE, 'MI') + 51/1440, NULL, NULL,
        NULL, NULL, 'PROGRAMADO', 0, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (19, 4, NULL, TRUNC(SYSDATE, 'MI') + 50/1440, TRUNC(SYSDATE, 'MI') + 86/1440, NULL, NULL,
        NULL, NULL, 'PROGRAMADO', 0, NULL);

-- manana
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (20, 1, 1, TRUNC(SYSDATE) + 1 + 7/24, TRUNC(SYSDATE) + 1 + 7/24 + 36/1440, NULL, NULL, 'T-101', 3, 'PROGRAMADO', 0, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (21, 3, 4, TRUNC(SYSDATE) + 1 + 7/24 + 10/1440, TRUNC(SYSDATE) + 1 + 7/24 + 47/1440, NULL, NULL, 'T-103', 4, 'PROGRAMADO', 0, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (22, 6, 6, TRUNC(SYSDATE) + 1 + 8/24, TRUNC(SYSDATE) + 1 + 8/24 + 38/1440, NULL, NULL, 'T-105', 6, 'PROGRAMADO', 0, NULL);
INSERT INTO VIAJE_PROGRAMADO (numero_viaje, id_ruta, id_horario, salida_programada, llegada_programada, salida_real, llegada_real, codigo_tren, id_conductor, estado_viaje, pasajeros_estimados, motivo_cancelacion)
VALUES (23, 2, 9, TRUNC(SYSDATE) + 1 + 9/24, TRUNC(SYSDATE) + 1 + 9/24 + 36/1440, NULL, NULL, NULL, NULL, 'PROGRAMADO', 0, NULL);

-- ---------------- TURNOS ----------------
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (1, 3, TRUNC(SYSDATE) - 1 + 6/24, TRUNC(SYSDATE) - 1 + 14/24, 'RUTA', NULL, NULL, NULL, 1, 'Conduccion ruta A expreso', 'ASISTIO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (2, 4, TRUNC(SYSDATE) - 1 + 6/24, TRUNC(SYSDATE) - 1 + 14/24, 'RUTA', NULL, NULL, NULL, 3, 'Conduccion ruta C local', 'ASISTIO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (3, 7, TRUNC(SYSDATE) - 1 + 6/24, TRUNC(SYSDATE) - 1 + 14/24, 'RUTA', NULL, NULL, NULL, 1, 'Conduccion ruta A expreso', 'ASISTIO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (4, 3, TRUNC(SYSDATE) + 6/24, TRUNC(SYSDATE) + 14/24, 'RUTA', NULL, NULL, NULL, 1, 'Conduccion ruta A expreso', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (5, 4, TRUNC(SYSDATE) + 6/24, TRUNC(SYSDATE) + 14/24, 'RUTA', NULL, NULL, NULL, 3, 'Conduccion ruta C local', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (6, 7, TRUNC(SYSDATE) + 6/24, TRUNC(SYSDATE) + 14/24, 'RUTA', NULL, NULL, NULL, 1, 'Conduccion ruta A expreso', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (7, 2, TRUNC(SYSDATE) + 7/24, TRUNC(SYSDATE) + 15/24, 'ESTACION', 3, NULL, NULL, NULL, 'Supervision de estacion', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (8, 14, TRUNC(SYSDATE) + 15/24, TRUNC(SYSDATE) + 23/24, 'ESTACION', 4, NULL, NULL, NULL, 'Supervision de estacion', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (9, 8, TRUNC(SYSDATE) + 6/24, TRUNC(SYSDATE) + 14/24, 'CENTRO_CONTROL', NULL, NULL, NULL, NULL, 'Monitoreo de la red', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (10, 9, TRUNC(SYSDATE) + 7/24, TRUNC(SYSDATE) + 15/24, 'DEPOSITO', NULL, NULL, 2, NULL, 'Reparacion de frenos T-104', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (11, 12, TRUNC(SYSDATE) + 7/24, TRUNC(SYSDATE) + 15/24, 'ESTACION', 3, NULL, NULL, NULL, 'Seguridad en andenes', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (12, 13, TRUNC(SYSDATE) + 8/24, TRUNC(SYSDATE) + 16/24, 'ESTACION', 4, NULL, NULL, NULL, 'Informacion al pasajero', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (13, 10, TRUNC(SYSDATE) + 1 + 7/24, TRUNC(SYSDATE) + 1 + 15/24, 'DEPOSITO', NULL, NULL, 1, NULL, 'Revision de elevadores', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (14, 11, TRUNC(SYSDATE) + 1 + 15/24, TRUNC(SYSDATE) + 1 + 23/24, 'DEPOSITO', NULL, NULL, 1, NULL, 'Mantenimiento preventivo', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (15, 6, TRUNC(SYSDATE) + 1 + 6/24, TRUNC(SYSDATE) + 1 + 14/24, 'RUTA', NULL, NULL, NULL, 6, 'Conduccion ruta 2 expreso', 'PROGRAMADO');
INSERT INTO TURNO (id_turno, id_empleado, hora_inicio, hora_fin, tipo_lugar, id_estacion, codigo_tren, id_deposito, id_ruta, funcion, estado_asistencia)
VALUES (16, 15, TRUNC(SYSDATE) + 1 + 22/24, TRUNC(SYSDATE) + 2 + 6/24, 'TREN', NULL, 'T-106', NULL, NULL, 'Conduccion servicio nocturno', 'PROGRAMADO');

-- ---------------- AUSENCIAS ----------------
INSERT INTO AUSENCIA (id_ausencia, id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado)
VALUES (1, 10, 'PERMISO', TRUNC(SYSDATE) + 1, TRUNC(SYSDATE) + 1, 'Cita medica', 'APROBADA');
INSERT INTO AUSENCIA (id_ausencia, id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado)
VALUES (2, 6, 'VACACIONES', TRUNC(SYSDATE) + 5, TRUNC(SYSDATE) + 12, 'Vacaciones anuales', 'APROBADA');
UPDATE TURNO SET estado_asistencia = 'PERMISO' WHERE id_turno = 13;

-- ---------------- EQUIPOS ----------------
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('EQ-TR-101', 'TREN', 'Tren T-101 (Patio 207 St)', NULL, NULL, 'T-101', NULL, 'Kawasaki', 'R211', 'KW-R211-0101', DATE '2023-05-10', 'OPERATIVO', TRUNC(SYSDATE) - 40, TRUNC(SYSDATE) + 50, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('EQ-TR-104', 'TREN', 'Tren T-104 (Patio Jamaica)', NULL, NULL, 'T-104', NULL, 'Kawasaki', 'R160', 'KW-R160-0104', DATE '2009-03-02', 'EN_MANTENIMIENTO', TRUNC(SYSDATE) - 115, TRUNC(SYSDATE) - 25, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('EQ-TR-107', 'TREN', 'Tren T-107 (Patio Coney Island)', NULL, NULL, 'T-107', NULL, 'Pullman Standard', 'R46', 'PS-R46-0107', DATE '1976-08-15', 'FUERA_SERVICIO', TRUNC(SYSDATE) - 146, TRUNC(SYSDATE) - 56, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('EQ-VG-1083', 'VAGON', 'Vagon R160-1083 en taller', NULL, NULL, NULL, 'R160-1083', 'Kawasaki', 'R160', 'KW-VG-1083', DATE '2010-01-20', 'EN_MANTENIMIENTO', TRUNC(SYSDATE) - 60, TRUNC(SYSDATE) + 30, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('ELV-003-01', 'ELEVADOR', '42 St, acceso 8 Av a mezanine', 3, NULL, NULL, NULL, 'Otis', 'Gen2 MR', 'OT-44120', DATE '2015-06-01', 'OPERATIVO', TRUNC(SYSDATE) - 60, TRUNC(SYSDATE) + 30, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('ELV-004-01', 'ELEVADOR', '34 St-Penn, calle a anden sur', 4, NULL, NULL, NULL, 'Otis', 'Gen2 MR', 'OT-44121', DATE '2016-02-12', 'FUERA_SERVICIO', TRUNC(SYSDATE) - 75, TRUNC(SYSDATE) + 15, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('ELV-014-01', 'ELEVADOR', 'Atlantic Av, calle a mezanine', 14, NULL, NULL, NULL, 'Schindler', '5500', 'SC-99012', DATE '2012-09-30', 'OPERATIVO', TRUNC(SYSDATE) - 20, TRUNC(SYSDATE) + 70, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('ESC-003-01', 'ESCALERA_ELECTRICA', '42 St, mezanine a anden norte', 3, NULL, NULL, NULL, 'Kone', 'TravelMaster 110', 'KO-77301', DATE '2011-11-05', 'OPERATIVO', TRUNC(SYSDATE) - 100, TRUNC(SYSDATE) - 10, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('ESC-005-01', 'ESCALERA_ELECTRICA', '14 St, salida W 14 St', 5, NULL, NULL, NULL, 'Kone', 'TravelMaster 110', 'KO-77302', DATE '2011-11-05', 'EN_MANTENIMIENTO', TRUNC(SYSDATE) - 92, TRUNC(SYSDATE) - 2, 90);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('SEN-A-0231', 'SENAL', 'Senal tramo 34 St - 14 St (8 Av)', NULL, NULL, NULL, NULL, 'Siemens', 'CBTC Trainguard', 'SI-CB-0231', DATE '2018-04-01', 'OPERATIVO', TRUNC(SYSDATE) - 183, TRUNC(SYSDATE) - 3, 180);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('VIA-C-0107', 'VIA', 'Via tramo Canal St - Chambers St', NULL, NULL, NULL, NULL, 'Voestalpine', 'Riel 115RE', 'VA-RL-0107', DATE '2014-07-20', 'OPERATIVO', TRUNC(SYSDATE) - 120, TRUNC(SYSDATE) + 245, 365);
INSERT INTO EQUIPO (id_equipo, tipo_equipo, descripcion_ubicacion, id_estacion, id_plataforma, codigo_tren, numero_serie_vagon, fabricante, modelo, numero_serie, fecha_instalacion, estado, fecha_ultima_revision, fecha_proxima_revision, frecuencia_revision_dias)
VALUES ('PLT-010-P1', 'PLATAFORMA', 'Anden norte Jay St-MetroTech', 10, 25, NULL, NULL, NULL, NULL, 'PLT-A41-P1', DATE '1933-02-01', 'OPERATIVO', TRUNC(SYSDATE) - 200, TRUNC(SYSDATE) + 165, 365);

-- ---------------- REPUESTOS ----------------
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (1, 'Pastillas de freno', 'Juego de pastillas para bogie', 85.0, 120);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (2, 'Motor de elevador 15 HP', 'Motor de traccion para elevador', 4200.0, 3);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (3, 'Cadena de escalera', 'Cadena de escalones para escalera electrica', 950.0, 6);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (4, 'Rele de senalizacion', 'Rele de seguridad para senales', 310.0, 25);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (5, 'Lampara LED de senal', 'Modulo LED rojo/verde', 45.0, 200);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (6, 'Filtro de aire HVAC', 'Filtro para aire acondicionado de vagon', 60.0, 80);
INSERT INTO REPUESTO (id_repuesto, nombre, descripcion, costo_unitario, stock)
VALUES (7, 'Zapata de contacto', 'Zapata para tercer riel', 130.0, 40);

-- ---------------- ORDENES DE MANTENIMIENTO ----------------
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (1, 'EQ-TR-104', 'CORRECTIVO', 'Falla en el sistema de frenos del vagon lider', TRUNC(SYSDATE) - 3 + 8/24, TRUNC(SYSDATE) - 3, TRUNC(SYSDATE) - 2 + 9/24, NULL, 9, 'ALTA', 1800.0, 'EN_EJECUCION');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (2, 'ELV-004-01', 'CORRECTIVO', 'El motor del elevador no responde', TRUNC(SYSDATE) - 2 + 8/24, TRUNC(SYSDATE) + 2, NULL, NULL, 10, 'URGENTE', 950.0, 'PROGRAMADA');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (3, 'ESC-005-01', 'PREVENTIVO', 'Cambio de cadena y lubricacion general', TRUNC(SYSDATE) - 4 + 8/24, TRUNC(SYSDATE) - 1, TRUNC(SYSDATE) - 1 + 9/24, NULL, 11, 'MEDIA', 600.0, 'EN_EJECUCION');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (4, 'EQ-TR-101', 'INSPECCION_SEGURIDAD', 'Inspeccion trimestral de seguridad', TRUNC(SYSDATE) - 45 + 8/24, TRUNC(SYSDATE) - 41, TRUNC(SYSDATE) - 41 + 9/24, TRUNC(SYSDATE) - 40 + 17/24, 9, 'MEDIA', 600.0, 'COMPLETADA');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (5, 'SEN-A-0231', 'PREDICTIVO', 'Lecturas del sensor indican desgaste del rele', TRUNC(SYSDATE) - 1 + 8/24, NULL, NULL, NULL, 10, 'BAJA', 300.0, 'SOLICITADA');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (6, 'EQ-VG-1083', 'CORRECTIVO', 'Revision del sistema de puertas', TRUNC(SYSDATE) - 10 + 8/24, TRUNC(SYSDATE) - 9, NULL, NULL, 11, 'MEDIA', 400.0, 'SUSPENDIDA');
INSERT INTO ORDEN_MANTENIMIENTO (numero_orden, id_equipo, tipo_mantenimiento, descripcion, fecha_solicitud, fecha_programada, fecha_inicio, fecha_fin, id_tecnico_responsable, prioridad, costo_mano_obra, estado)
VALUES (7, 'EQ-TR-107', 'CORRECTIVO', 'Falla mayor en motores de traccion', TRUNC(SYSDATE) - 60 + 8/24, TRUNC(SYSDATE) - 58, TRUNC(SYSDATE) - 57 + 9/24, NULL, 9, 'ALTA', 5200.0, 'SUSPENDIDA');

INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (1, 9, 'RESPONSABLE', 14);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (1, 11, 'APOYO', 8);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (2, 10, 'RESPONSABLE', 0);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (3, 11, 'RESPONSABLE', 6);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (3, 10, 'APOYO', 4);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (4, 9, 'RESPONSABLE', 8);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (4, 10, 'APOYO', 8);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (5, 10, 'RESPONSABLE', 0);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (6, 11, 'RESPONSABLE', 2);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (7, 9, 'RESPONSABLE', 30);
INSERT INTO ORDEN_TECNICO (numero_orden, id_empleado, rol, horas_trabajadas)
VALUES (7, 11, 'APOYO', 22);

INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
VALUES (1, 1, 8, 85.0);
INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
VALUES (3, 3, 1, 950.0);
INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
VALUES (4, 6, 4, 60.0);
INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
VALUES (4, 5, 2, 45.0);
INSERT INTO ORDEN_REPUESTO (numero_orden, id_repuesto, cantidad, costo_unitario)
VALUES (7, 7, 6, 130.0);

-- ---------------- INCIDENTES ----------------
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (1, 'FALLA_SENALIZACION', 'Senal en rojo permanente entre 34 St y 14 St', TRUNC(SYSDATE) - 1 + 11/24 + 40/1440, TRUNC(SYSDATE) - 1 + 13/24 + 10/1440, 'Tramo 34 St - 14 St (8 Av)', 'ALTO', 8, NULL, 'CERRADO', 'Rele de senal danado', 'Se desvio el trafico a la via expresa. Se cambio el rele de la senal.', 3200);
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (2, 'FALLA_MECANICA', 'El tren T-104 presento falla en frenos durante la prueba de salida', TRUNC(SYSDATE) - 3 + 16/24 + 20/1440, NULL, 'Patio Jamaica', 'ALTO', 3, NULL, 'EN_ATENCION', NULL, 'Se retiro el tren de servicio y se abrio orden de mantenimiento.', 0);
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (3, 'EMERGENCIA_MEDICA', 'Pasajero se desmayo en el anden', TRUNC(SYSDATE) - 1 + 7/24 + 5/1440, TRUNC(SYSDATE) - 1 + 7/24 + 30/1440, '42 St-Times Sq/Port Authority, anden sur', 'MEDIO', 12, NULL, 'CERRADO', 'Descompensacion del pasajero', 'Se detuvo el tren en la estacion y se llamo a EMS.', 150);
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (4, 'INUNDACION', 'Entrada de agua al anden sur por lluvia fuerte', SYSDATE - 2/24, NULL,
        'Canal St, anden sur', 'CRITICO', 2, NULL, 'ABIERTO', NULL, NULL, 400);
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (5, 'CONGESTION', 'Aglomeracion en hora pico por evento en Madison Square Garden', TRUNC(SYSDATE) - 1 + 18/24, TRUNC(SYSDATE) - 1 + 18/24 + 35/1440, '34 St-Penn Station', 'BAJO', NULL, 'Supervisor de turno', 'CERRADO', 'Evento masivo', 'Se abrieron accesos adicionales y se reforzo la seguridad.', 2500);
INSERT INTO INCIDENTE (numero_incidente, tipo_incidente, descripcion, fecha_hora_inicio, fecha_hora_fin, lugar_afectado, severidad, id_empleado_reporta, reportado_por, estado, causa_identificada, acciones_realizadas, pasajeros_afectados)
VALUES (6, 'FALLA_ELECTRICA', 'Elevador sin energia en 34 St-Penn', TRUNC(SYSDATE) - 2 + 9/24 + 15/1440, NULL, '34 St-Penn Station, elevador al anden sur', 'MEDIO', 14, NULL, 'ABIERTO', 'Falla en el motor', NULL, 0);

INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (1, 1, 'TRAMO', 4, NULL, NULL, NULL, NULL, NULL, 'A', 5, 'SUSPENSION_TRAMO', NULL, 'Via local suspendida durante la falla');
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (2, 1, 'VIAJE', NULL, NULL, NULL, NULL, NULL, 8, NULL, NULL, 'CANCELACION', NULL, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (3, 1, 'VIAJE', NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, 'RETRASO', 18, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (4, 2, 'TREN', NULL, NULL, 'T-104', NULL, NULL, NULL, NULL, NULL, 'RETIRO_TREN', NULL, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (5, 3, 'ESTACION', 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NINGUNO', NULL, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (6, 3, 'VIAJE', NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, 'RETRASO', 2, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (7, 4, 'PLATAFORMA', NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, 'CIERRE_PLATAFORMA', NULL, 'Anden sur cerrado por agua');
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (8, 5, 'ESTACION', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NINGUNO', NULL, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (9, 6, 'EQUIPO', NULL, NULL, NULL, NULL, 'ELV-004-01', NULL, NULL, NULL, 'NINGUNO', NULL, NULL);
INSERT INTO INCIDENTE_ELEMENTO (id_elemento, numero_incidente, tipo_elemento, id_estacion, id_plataforma, codigo_tren, id_ruta, id_equipo, numero_viaje, id_linea, id_estacion_fin, tipo_efecto, minutos_retraso, descripcion)
VALUES (10, 2, 'EQUIPO', NULL, NULL, NULL, NULL, 'EQ-TR-104', NULL, NULL, NULL, 'NINGUNO', NULL, NULL);

UPDATE PLATAFORMA SET estado_operativo = 'CERRADA' WHERE id_plataforma = 20;

COMMIT;

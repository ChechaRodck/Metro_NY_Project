-- =============================================================
-- 01_tablas.sql
-- Creacion de tablas del Sistema de Gestion del Metro de NY
-- Se ejecuta conectado como METRO_NY.
--
-- Basado en el modelo del equipo (docs/Modelo_Metro_NY), con
-- algunas correcciones para que cumpla las reglas del enunciado.
-- Las horas que antes eran VARCHAR2(5) en los viajes ahora son DATE
-- para poder comparar traslapes y calcular retrasos.
-- =============================================================


-- -------------------------------------------------------------
-- MODULO 1: RED (estaciones, lineas, plataformas, servicios)
-- -------------------------------------------------------------

CREATE TABLE ESTACION (
  id_estacion             NUMBER(10)          NOT NULL,
  codigo_estacion         VARCHAR2(10 CHAR)   NOT NULL,
  nombre                  VARCHAR2(100 CHAR)  NOT NULL,
  direccion               VARCHAR2(200 CHAR)  NOT NULL,
  distrito                VARCHAR2(20 CHAR)   NOT NULL,
  latitud                 NUMBER(9,6)         NOT NULL,
  longitud                NUMBER(9,6)         NOT NULL,
  fecha_inauguracion      DATE,
  cantidad_accesos        NUMBER(3)          DEFAULT 1 NOT NULL,
  cantidad_plataformas    NUMBER(3)          DEFAULT 1 NOT NULL,
  tipo_estacion           VARCHAR2(20 CHAR)  DEFAULT 'LOCAL' NOT NULL,
  estado_operativo        VARCHAR2(20 CHAR)  DEFAULT 'OPERATIVA' NOT NULL,
  hora_apertura           VARCHAR2(5 CHAR)   DEFAULT '00:00' NOT NULL,
  hora_cierre             VARCHAR2(5 CHAR)   DEFAULT '23:59' NOT NULL,
  accesible_discapacidad  CHAR(1)            DEFAULT 'N' NOT NULL,
  CONSTRAINT ESTACION_PK PRIMARY KEY (id_estacion),
  CONSTRAINT ESTACION_CODIGO_UK UNIQUE (codigo_estacion),
  CONSTRAINT ESTACION_DISTRITO_CK CHECK (distrito IN ('MANHATTAN','BROOKLYN','QUEENS','BRONX','STATEN_ISLAND')),
  CONSTRAINT ESTACION_TIPO_CK CHECK (tipo_estacion IN ('LOCAL','EXPRESA','TERMINAL','TRANSFERENCIA')),
  CONSTRAINT ESTACION_ESTADO_CK CHECK (estado_operativo IN ('OPERATIVA','CERRADA','MANTENIMIENTO')),
  CONSTRAINT ESTACION_ACCESIBLE_CK CHECK (accesible_discapacidad IN ('S','N')),
  CONSTRAINT ESTACION_LAT_CK CHECK (latitud BETWEEN -90 AND 90),
  CONSTRAINT ESTACION_LON_CK CHECK (longitud BETWEEN -180 AND 180),
  CONSTRAINT ESTACION_ACCESOS_CK CHECK (cantidad_accesos > 0),
  CONSTRAINT ESTACION_PLAT_CK CHECK (cantidad_plataformas > 0),
  CONSTRAINT ESTACION_HAPERTURA_CK CHECK (REGEXP_LIKE(hora_apertura, '^([01][0-9]|2[0-3]):[0-5][0-9]$')),
  CONSTRAINT ESTACION_HCIERRE_CK CHECK (REGEXP_LIKE(hora_cierre, '^([01][0-9]|2[0-3]):[0-5][0-9]$'))
);
-- nota: la "estacion temporalmente cerrada" se maneja con estado_operativo = 'CERRADA'

CREATE TABLE LINEA (
  id_linea                VARCHAR2(5 CHAR)    NOT NULL,
  nombre                  VARCHAR2(100 CHAR)  NOT NULL,
  color_mapa              VARCHAR2(20 CHAR)   NOT NULL,
  id_terminal_origen      NUMBER(10),
  id_terminal_destino     NUMBER(10),
  estado_operativo        VARCHAR2(20 CHAR)  DEFAULT 'ACTIVA' NOT NULL,
  tipo_servicio           VARCHAR2(20 CHAR)  DEFAULT 'LOCAL' NOT NULL,
  fecha_inauguracion      DATE,
  longitud_km             NUMBER(6,2),
  operador_responsable    VARCHAR2(100 CHAR)  NOT NULL,
  CONSTRAINT LINEA_PK PRIMARY KEY (id_linea),
  CONSTRAINT LINEA_ORIGEN_FK FOREIGN KEY (id_terminal_origen) REFERENCES ESTACION (id_estacion),
  CONSTRAINT LINEA_DESTINO_FK FOREIGN KEY (id_terminal_destino) REFERENCES ESTACION (id_estacion),
  CONSTRAINT LINEA_ESTADO_CK CHECK (estado_operativo IN ('ACTIVA','SUSPENDIDA','INACTIVA')),
  CONSTRAINT LINEA_SERVICIO_CK CHECK (tipo_servicio IN ('LOCAL','EXPRESO','NOCTURNO','ESPECIAL','TEMPORAL')),
  CONSTRAINT LINEA_LONGITUD_CK CHECK (longitud_km > 0),
  CONSTRAINT LINEA_TERMINALES_CK CHECK (id_terminal_origen <> id_terminal_destino)
);

CREATE TABLE SERVICIO (
  id_servicio             NUMBER(5)           NOT NULL,
  nombre                  VARCHAR2(60 CHAR)   NOT NULL,
  descripcion             VARCHAR2(200 CHAR),
  CONSTRAINT SERVICIO_PK PRIMARY KEY (id_servicio),
  CONSTRAINT SERVICIO_NOMBRE_UK UNIQUE (nombre)
);

-- servicios disponibles en cada estacion (N:M)
CREATE TABLE ESTACION_SERVICIO (
  id_estacion             NUMBER(10)          NOT NULL,
  id_servicio             NUMBER(5)           NOT NULL,
  observacion             VARCHAR2(150 CHAR),
  CONSTRAINT ESTACION_SERVICIO_PK PRIMARY KEY (id_estacion, id_servicio),
  CONSTRAINT ES_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT ES_SERVICIO_FK FOREIGN KEY (id_servicio) REFERENCES SERVICIO (id_servicio)
);

CREATE TABLE PLATAFORMA (
  id_plataforma           NUMBER(10)          NOT NULL,
  id_estacion             NUMBER(10)          NOT NULL,
  codigo_plataforma       VARCHAR2(10 CHAR)   NOT NULL,
  direccion_viaje         VARCHAR2(20 CHAR)   NOT NULL,
  capacidad_aprox         NUMBER(5)           NOT NULL,
  estado_operativo        VARCHAR2(20 CHAR)  DEFAULT 'OPERATIVA' NOT NULL,
  CONSTRAINT PLATAFORMA_PK PRIMARY KEY (id_plataforma),
  CONSTRAINT PLATAFORMA_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT PLATAFORMA_CODIGO_UK UNIQUE (id_estacion, codigo_plataforma),
  CONSTRAINT PLATAFORMA_DIR_CK CHECK (direccion_viaje IN ('NORTE','SUR','ESTE','OESTE','AMBAS')),
  CONSTRAINT PLATAFORMA_CAP_CK CHECK (capacidad_aprox > 0),
  CONSTRAINT PLATAFORMA_ESTADO_CK CHECK (estado_operativo IN ('OPERATIVA','CERRADA','MANTENIMIENTO'))
);

-- orden en que una linea visita sus estaciones
CREATE TABLE LINEA_ESTACION (
  id_linea                VARCHAR2(5 CHAR)    NOT NULL,
  id_estacion             NUMBER(10)          NOT NULL,
  orden                   NUMBER(3)           NOT NULL,
  distancia_anterior_km   NUMBER(6,2)        DEFAULT 0 NOT NULL,
  tiempo_anterior_min     NUMBER(5,1)        DEFAULT 0 NOT NULL,
  CONSTRAINT LINEA_ESTACION_PK PRIMARY KEY (id_linea, id_estacion),
  CONSTRAINT LE_LINEA_FK FOREIGN KEY (id_linea) REFERENCES LINEA (id_linea),
  CONSTRAINT LE_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT LE_ORDEN_UK UNIQUE (id_linea, orden),
  CONSTRAINT LE_ORDEN_CK CHECK (orden > 0),
  CONSTRAINT LE_DISTANCIA_CK CHECK (distancia_anterior_km >= 0),
  CONSTRAINT LE_TIEMPO_CK CHECK (tiempo_anterior_min >= 0)
);

-- transferencias entre lineas dentro de una estacion.
-- las FK compuestas obligan a que las dos lineas pasen por esa estacion.
CREATE TABLE TRANSFERENCIA (
  id_transferencia        NUMBER(10)          NOT NULL,
  id_estacion             NUMBER(10)          NOT NULL,
  id_linea_a              VARCHAR2(5 CHAR)    NOT NULL,
  id_linea_b              VARCHAR2(5 CHAR)    NOT NULL,
  tiempo_estimado_min     NUMBER(4,1)         NOT NULL,
  observacion             VARCHAR2(150 CHAR),
  CONSTRAINT TRANSFERENCIA_PK PRIMARY KEY (id_transferencia),
  CONSTRAINT TRANSF_LINEA_A_FK FOREIGN KEY (id_linea_a, id_estacion) REFERENCES LINEA_ESTACION (id_linea, id_estacion),
  CONSTRAINT TRANSF_LINEA_B_FK FOREIGN KEY (id_linea_b, id_estacion) REFERENCES LINEA_ESTACION (id_linea, id_estacion),
  CONSTRAINT TRANSF_UK UNIQUE (id_estacion, id_linea_a, id_linea_b),
  CONSTRAINT TRANSF_LINEAS_CK CHECK (id_linea_a <> id_linea_b),
  CONSTRAINT TRANSF_TIEMPO_CK CHECK (tiempo_estimado_min > 0)
);


-- -------------------------------------------------------------
-- MODULO 2: RUTAS, HORARIOS Y VIAJES
-- -------------------------------------------------------------

CREATE TABLE RUTA (
  id_ruta                 NUMBER(10)          NOT NULL,
  codigo_ruta             VARCHAR2(20 CHAR)   NOT NULL,
  id_linea                VARCHAR2(5 CHAR)    NOT NULL,
  id_estacion_origen      NUMBER(10)          NOT NULL,
  id_estacion_destino     NUMBER(10)          NOT NULL,
  sentido                 VARCHAR2(10 CHAR)   NOT NULL,
  tipo_servicio           VARCHAR2(20 CHAR)   NOT NULL,
  distancia_total_km      NUMBER(6,2)         NOT NULL,
  duracion_estimada_min   NUMBER(4)           NOT NULL,
  estado                  VARCHAR2(20 CHAR)  DEFAULT 'ACTIVA' NOT NULL,
  fecha_vigencia_inicio   DATE                NOT NULL,
  fecha_vigencia_fin      DATE,
  CONSTRAINT RUTA_PK PRIMARY KEY (id_ruta),
  CONSTRAINT RUTA_CODIGO_UK UNIQUE (codigo_ruta),
  CONSTRAINT RUTA_LINEA_FK FOREIGN KEY (id_linea) REFERENCES LINEA (id_linea),
  CONSTRAINT RUTA_ORIGEN_FK FOREIGN KEY (id_estacion_origen) REFERENCES ESTACION (id_estacion),
  CONSTRAINT RUTA_DESTINO_FK FOREIGN KEY (id_estacion_destino) REFERENCES ESTACION (id_estacion),
  CONSTRAINT RUTA_SENTIDO_CK CHECK (sentido IN ('NORTE','SUR','ESTE','OESTE')),
  CONSTRAINT RUTA_SERVICIO_CK CHECK (tipo_servicio IN ('LOCAL','EXPRESO','NOCTURNO','ESPECIAL','TEMPORAL')),
  CONSTRAINT RUTA_ESTADO_CK CHECK (estado IN ('ACTIVA','SUSPENDIDA','MODIFICADA','INACTIVA')),
  CONSTRAINT RUTA_DISTANCIA_CK CHECK (distancia_total_km > 0),
  CONSTRAINT RUTA_DURACION_CK CHECK (duracion_estimada_min > 0),
  CONSTRAINT RUTA_ESTACIONES_CK CHECK (id_estacion_origen <> id_estacion_destino),
  CONSTRAINT RUTA_VIGENCIA_CK CHECK (fecha_vigencia_fin IS NULL OR fecha_vigencia_fin >= fecha_vigencia_inicio)
);

-- detalle de la ruta: paradas en orden.
-- minutos_llegada / minutos_salida son relativos a la salida del tren
-- en el origen (asi la misma ruta sirve para cualquier viaje).
-- se_detiene = 'N' sirve para los servicios expresos.
CREATE TABLE RUTA_ESTACION (
  id_ruta                 NUMBER(10)          NOT NULL,
  id_estacion             NUMBER(10)          NOT NULL,
  orden                   NUMBER(3)           NOT NULL,
  minutos_llegada         NUMBER(5,1)        DEFAULT 0 NOT NULL,
  minutos_salida          NUMBER(5,1)        DEFAULT 0 NOT NULL,
  distancia_anterior_km   NUMBER(6,2)        DEFAULT 0 NOT NULL,
  tiempo_anterior_min     NUMBER(5,1)        DEFAULT 0 NOT NULL,
  se_detiene              CHAR(1)            DEFAULT 'S' NOT NULL,
  CONSTRAINT RUTA_ESTACION_PK PRIMARY KEY (id_ruta, id_estacion),
  CONSTRAINT RE_RUTA_FK FOREIGN KEY (id_ruta) REFERENCES RUTA (id_ruta),
  CONSTRAINT RE_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT RE_ORDEN_UK UNIQUE (id_ruta, orden),
  CONSTRAINT RE_ORDEN_CK CHECK (orden > 0),
  CONSTRAINT RE_MINUTOS_CK CHECK (minutos_salida >= minutos_llegada),
  CONSTRAINT RE_DETIENE_CK CHECK (se_detiene IN ('S','N'))
);

CREATE TABLE HORARIO (
  id_horario              NUMBER(10)          NOT NULL,
  id_ruta                 NUMBER(10)          NOT NULL,
  dia_semana              VARCHAR2(12 CHAR)   NOT NULL,
  hora_inicio             VARCHAR2(5 CHAR)    NOT NULL,
  hora_fin                VARCHAR2(5 CHAR)    NOT NULL,
  frecuencia_min          NUMBER(3)           NOT NULL,
  tipo_servicio           VARCHAR2(20 CHAR)   NOT NULL,
  fecha_inicio_vigor      DATE                NOT NULL,
  fecha_fin_vigor         DATE,
  estado                  VARCHAR2(10 CHAR)  DEFAULT 'ACTIVO' NOT NULL,
  CONSTRAINT HORARIO_PK PRIMARY KEY (id_horario),
  CONSTRAINT HORARIO_RUTA_FK FOREIGN KEY (id_ruta) REFERENCES RUTA (id_ruta),
  CONSTRAINT HORARIO_DIA_CK CHECK (dia_semana IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO',
                                                   'LABORAL','FIN_SEMANA','FESTIVO','TODOS')),
  CONSTRAINT HORARIO_HINI_CK CHECK (REGEXP_LIKE(hora_inicio, '^([01][0-9]|2[0-3]):[0-5][0-9]$')),
  CONSTRAINT HORARIO_HFIN_CK CHECK (REGEXP_LIKE(hora_fin, '^([01][0-9]|2[0-3]):[0-5][0-9]$')),
  CONSTRAINT HORARIO_FRECUENCIA_CK CHECK (frecuencia_min > 0),
  CONSTRAINT HORARIO_SERVICIO_CK CHECK (tipo_servicio IN ('LOCAL','EXPRESO','NOCTURNO','ESPECIAL','TEMPORAL')),
  CONSTRAINT HORARIO_VIGOR_CK CHECK (fecha_fin_vigor IS NULL OR fecha_fin_vigor >= fecha_inicio_vigor),
  CONSTRAINT HORARIO_ESTADO_CK CHECK (estado IN ('ACTIVO','INACTIVO'))
);


-- -------------------------------------------------------------
-- MODULO 3: TRENES Y VAGONES
-- -------------------------------------------------------------

CREATE TABLE DEPOSITO (
  id_deposito             NUMBER(5)           NOT NULL,
  nombre                  VARCHAR2(100 CHAR)  NOT NULL,
  direccion               VARCHAR2(200 CHAR)  NOT NULL,
  distrito                VARCHAR2(20 CHAR)   NOT NULL,
  capacidad_trenes        NUMBER(4)           NOT NULL,
  CONSTRAINT DEPOSITO_PK PRIMARY KEY (id_deposito),
  CONSTRAINT DEPOSITO_DISTRITO_CK CHECK (distrito IN ('MANHATTAN','BROOKLYN','QUEENS','BRONX','STATEN_ISLAND')),
  CONSTRAINT DEPOSITO_CAP_CK CHECK (capacidad_trenes > 0)
);

-- el fabricante depende del modelo, por eso va en tabla aparte (3FN)
CREATE TABLE MODELO_TREN (
  id_modelo               NUMBER(5)           NOT NULL,
  nombre_modelo           VARCHAR2(30 CHAR)   NOT NULL,
  fabricante              VARCHAR2(60 CHAR)   NOT NULL,
  CONSTRAINT MODELO_TREN_PK PRIMARY KEY (id_modelo),
  CONSTRAINT MODELO_NOMBRE_UK UNIQUE (nombre_modelo)
);

CREATE TABLE TREN (
  codigo_tren             VARCHAR2(10 CHAR)   NOT NULL,
  id_modelo               NUMBER(5)           NOT NULL,
  anio_fabricacion        NUMBER(4)           NOT NULL,
  capacidad_total         NUMBER(5)           NOT NULL,
  estado_operativo        VARCHAR2(20 CHAR)  DEFAULT 'DISPONIBLE' NOT NULL,
  kilometraje_km          NUMBER(12,2)       DEFAULT 0 NOT NULL,
  id_deposito             NUMBER(5)           NOT NULL,
  fecha_ultima_inspeccion DATE,
  fecha_proxima_inspeccion DATE,
  CONSTRAINT TREN_PK PRIMARY KEY (codigo_tren),
  CONSTRAINT TREN_MODELO_FK FOREIGN KEY (id_modelo) REFERENCES MODELO_TREN (id_modelo),
  CONSTRAINT TREN_DEPOSITO_FK FOREIGN KEY (id_deposito) REFERENCES DEPOSITO (id_deposito),
  CONSTRAINT TREN_ESTADO_CK CHECK (estado_operativo IN ('DISPONIBLE','EN_OPERACION','EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO')),
  CONSTRAINT TREN_ANIO_CK CHECK (anio_fabricacion BETWEEN 1900 AND 2100),
  CONSTRAINT TREN_CAPACIDAD_CK CHECK (capacidad_total > 0),
  CONSTRAINT TREN_KM_CK CHECK (kilometraje_km >= 0),
  CONSTRAINT TREN_INSPECCION_CK CHECK (fecha_proxima_inspeccion IS NULL OR fecha_ultima_inspeccion IS NULL
                                       OR fecha_proxima_inspeccion >= fecha_ultima_inspeccion)
);

CREATE TABLE VAGON (
  numero_serie            VARCHAR2(20 CHAR)   NOT NULL,
  tipo_vagon              VARCHAR2(20 CHAR)   NOT NULL,
  capacidad_sentados      NUMBER(3)           NOT NULL,
  capacidad_pie           NUMBER(3)           NOT NULL,
  anio_fabricacion        NUMBER(4)           NOT NULL,
  estado                  VARCHAR2(20 CHAR)  DEFAULT 'OPERATIVO' NOT NULL,
  accesible               CHAR(1)            DEFAULT 'N' NOT NULL,
  CONSTRAINT VAGON_PK PRIMARY KEY (numero_serie),
  CONSTRAINT VAGON_TIPO_CK CHECK (tipo_vagon IN ('CABINA','MOTRIZ','REMOLQUE')),
  CONSTRAINT VAGON_SENTADOS_CK CHECK (capacidad_sentados >= 0),
  CONSTRAINT VAGON_PIE_CK CHECK (capacidad_pie >= 0),
  CONSTRAINT VAGON_ANIO_CK CHECK (anio_fabricacion BETWEEN 1900 AND 2100),
  CONSTRAINT VAGON_ESTADO_CK CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO')),
  CONSTRAINT VAGON_ACCESIBLE_CK CHECK (accesible IN ('S','N'))
);

-- composicion del tren con historial.
-- fecha_fin NULL = el vagon esta actualmente en ese tren.
CREATE TABLE TREN_VAGON (
  id_composicion          NUMBER(10)          NOT NULL,
  codigo_tren             VARCHAR2(10 CHAR)   NOT NULL,
  numero_serie            VARCHAR2(20 CHAR)   NOT NULL,
  posicion                NUMBER(2)           NOT NULL,
  fecha_inicio            DATE                NOT NULL,
  fecha_fin               DATE,
  CONSTRAINT TREN_VAGON_PK PRIMARY KEY (id_composicion),
  CONSTRAINT TV_TREN_FK FOREIGN KEY (codigo_tren) REFERENCES TREN (codigo_tren),
  CONSTRAINT TV_VAGON_FK FOREIGN KEY (numero_serie) REFERENCES VAGON (numero_serie),
  CONSTRAINT TV_POSICION_CK CHECK (posicion > 0),
  CONSTRAINT TV_FECHAS_CK CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- un vagon solo puede tener UNA asignacion abierta (no puede estar en dos trenes a la vez)
CREATE UNIQUE INDEX TV_VAGON_ACTIVO_UX ON TREN_VAGON (
  CASE WHEN fecha_fin IS NULL THEN numero_serie END
);

-- dos vagones activos no pueden ocupar la misma posicion del mismo tren
CREATE UNIQUE INDEX TV_POSICION_ACTIVA_UX ON TREN_VAGON (
  CASE WHEN fecha_fin IS NULL THEN codigo_tren END,
  CASE WHEN fecha_fin IS NULL THEN posicion END
);


-- -------------------------------------------------------------
-- MODULO 4: PERSONAL
-- -------------------------------------------------------------

CREATE TABLE CARGO (
  id_cargo                NUMBER(5)           NOT NULL,
  codigo_cargo            VARCHAR2(30 CHAR)   NOT NULL,
  nombre_cargo            VARCHAR2(60 CHAR)   NOT NULL,
  descripcion             VARCHAR2(200 CHAR),
  CONSTRAINT CARGO_PK PRIMARY KEY (id_cargo),
  CONSTRAINT CARGO_CODIGO_UK UNIQUE (codigo_cargo)
);

-- el nombre completo es un atributo compuesto (nombres + apellidos)
CREATE TABLE EMPLEADO (
  id_empleado             NUMBER(10)          NOT NULL,
  nombres                 VARCHAR2(80 CHAR)   NOT NULL,
  apellidos               VARCHAR2(80 CHAR)   NOT NULL,
  fecha_nacimiento        DATE                NOT NULL,
  direccion               VARCHAR2(200 CHAR)  NOT NULL,
  telefono                VARCHAR2(20 CHAR)   NOT NULL,
  correo                  VARCHAR2(100 CHAR)  NOT NULL,
  fecha_contratacion      DATE                NOT NULL,
  id_cargo                NUMBER(5)           NOT NULL,
  turno                   VARCHAR2(15 CHAR)  DEFAULT 'MATUTINO' NOT NULL,
  salario                 NUMBER(10,2)        NOT NULL,
  estado_laboral          VARCHAR2(15 CHAR)  DEFAULT 'ACTIVO' NOT NULL,
  id_supervisor           NUMBER(10),
  CONSTRAINT EMPLEADO_PK PRIMARY KEY (id_empleado),
  CONSTRAINT EMPLEADO_CORREO_UK UNIQUE (correo),
  CONSTRAINT EMPLEADO_CARGO_FK FOREIGN KEY (id_cargo) REFERENCES CARGO (id_cargo),
  CONSTRAINT EMPLEADO_SUPERVISOR_FK FOREIGN KEY (id_supervisor) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT EMPLEADO_TURNO_CK CHECK (turno IN ('MATUTINO','VESPERTINO','NOCTURNO','ROTATIVO')),
  CONSTRAINT EMPLEADO_SALARIO_CK CHECK (salario > 0),
  CONSTRAINT EMPLEADO_ESTADO_CK CHECK (estado_laboral IN ('ACTIVO','SUSPENDIDO','VACACIONES','INACTIVO')),
  CONSTRAINT EMPLEADO_SUP_CK CHECK (id_supervisor IS NULL OR id_supervisor <> id_empleado),
  CONSTRAINT EMPLEADO_FECHAS_CK CHECK (fecha_contratacion > fecha_nacimiento)
);

CREATE TABLE CERTIFICACION (
  id_certificacion        NUMBER(10)          NOT NULL,
  id_empleado             NUMBER(10)          NOT NULL,
  tipo_certificacion      VARCHAR2(80 CHAR)   NOT NULL,
  fecha_emision           DATE                NOT NULL,
  fecha_vencimiento       DATE                NOT NULL,
  institucion_emisora     VARCHAR2(100 CHAR)  NOT NULL,
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'VIGENTE' NOT NULL,
  CONSTRAINT CERTIFICACION_PK PRIMARY KEY (id_certificacion),
  CONSTRAINT CERT_EMPLEADO_FK FOREIGN KEY (id_empleado) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT CERT_ESTADO_CK CHECK (estado IN ('VIGENTE','VENCIDA','SUSPENDIDA','REVOCADA')),
  CONSTRAINT CERT_FECHAS_CK CHECK (fecha_vencimiento > fecha_emision)
);

-- modelos de tren que autoriza cada certificacion (atributo multivaluado)
CREATE TABLE CERTIFICACION_MODELO (
  id_certificacion        NUMBER(10)          NOT NULL,
  id_modelo               NUMBER(5)           NOT NULL,
  CONSTRAINT CERT_MODELO_PK PRIMARY KEY (id_certificacion, id_modelo),
  CONSTRAINT CM_CERT_FK FOREIGN KEY (id_certificacion) REFERENCES CERTIFICACION (id_certificacion),
  CONSTRAINT CM_MODELO_FK FOREIGN KEY (id_modelo) REFERENCES MODELO_TREN (id_modelo)
);

-- viaje programado = ejecucion concreta de una ruta en una fecha y hora
CREATE TABLE VIAJE_PROGRAMADO (
  numero_viaje            NUMBER(12)          NOT NULL,
  id_ruta                 NUMBER(10)          NOT NULL,
  id_horario              NUMBER(10),
  salida_programada       DATE                NOT NULL,
  llegada_programada      DATE                NOT NULL,
  salida_real             DATE,
  llegada_real            DATE,
  codigo_tren             VARCHAR2(10 CHAR),
  id_conductor            NUMBER(10),
  estado_viaje            VARCHAR2(15 CHAR)  DEFAULT 'PROGRAMADO' NOT NULL,
  pasajeros_estimados     NUMBER(6)          DEFAULT 0 NOT NULL,
  motivo_cancelacion      VARCHAR2(200 CHAR),
  CONSTRAINT VIAJE_PROGRAMADO_PK PRIMARY KEY (numero_viaje),
  CONSTRAINT VP_RUTA_FK FOREIGN KEY (id_ruta) REFERENCES RUTA (id_ruta),
  CONSTRAINT VP_HORARIO_FK FOREIGN KEY (id_horario) REFERENCES HORARIO (id_horario),
  CONSTRAINT VP_TREN_FK FOREIGN KEY (codigo_tren) REFERENCES TREN (codigo_tren),
  CONSTRAINT VP_CONDUCTOR_FK FOREIGN KEY (id_conductor) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT VP_RUTA_SALIDA_UK UNIQUE (id_ruta, salida_programada),
  CONSTRAINT VP_ESTADO_CK CHECK (estado_viaje IN ('PROGRAMADO','EN_ABORDAJE','EN_CURSO','COMPLETADO','RETRASADO','CANCELADO')),
  CONSTRAINT VP_PROGRAMADO_CK CHECK (llegada_programada > salida_programada),
  CONSTRAINT VP_REAL_CK CHECK (llegada_real IS NULL OR salida_real IS NULL OR llegada_real >= salida_real),
  CONSTRAINT VP_PASAJEROS_CK CHECK (pasajeros_estimados >= 0)
);

-- turnos del personal. el lugar depende del tipo (estacion, tren, deposito, ruta o centro de control)
CREATE TABLE TURNO (
  id_turno                NUMBER(10)          NOT NULL,
  id_empleado             NUMBER(10)          NOT NULL,
  hora_inicio             DATE                NOT NULL,
  hora_fin                DATE                NOT NULL,
  tipo_lugar              VARCHAR2(20 CHAR)   NOT NULL,
  id_estacion             NUMBER(10),
  codigo_tren             VARCHAR2(10 CHAR),
  id_deposito             NUMBER(5),
  id_ruta                 NUMBER(10),
  funcion                 VARCHAR2(100 CHAR)  NOT NULL,
  estado_asistencia       VARCHAR2(15 CHAR)  DEFAULT 'PROGRAMADO' NOT NULL,
  id_turno_reemplaza      NUMBER(10),
  CONSTRAINT TURNO_PK PRIMARY KEY (id_turno),
  CONSTRAINT TURNO_EMPLEADO_FK FOREIGN KEY (id_empleado) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT TURNO_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT TURNO_TREN_FK FOREIGN KEY (codigo_tren) REFERENCES TREN (codigo_tren),
  CONSTRAINT TURNO_DEPOSITO_FK FOREIGN KEY (id_deposito) REFERENCES DEPOSITO (id_deposito),
  CONSTRAINT TURNO_RUTA_FK FOREIGN KEY (id_ruta) REFERENCES RUTA (id_ruta),
  CONSTRAINT TURNO_REEMPLAZA_FK FOREIGN KEY (id_turno_reemplaza) REFERENCES TURNO (id_turno),
  CONSTRAINT TURNO_HORAS_CK CHECK (hora_fin > hora_inicio),
  CONSTRAINT TURNO_TIPO_CK CHECK (tipo_lugar IN ('ESTACION','TREN','DEPOSITO','RUTA','CENTRO_CONTROL')),
  CONSTRAINT TURNO_ESTADO_CK CHECK (estado_asistencia IN ('PROGRAMADO','ASISTIO','AUSENTE','PERMISO','VACACIONES','SUSTITUIDO')),
  CONSTRAINT TURNO_LUGAR_CK CHECK (
       (tipo_lugar = 'ESTACION' AND id_estacion IS NOT NULL)
    OR (tipo_lugar = 'TREN'     AND codigo_tren IS NOT NULL)
    OR (tipo_lugar = 'DEPOSITO' AND id_deposito IS NOT NULL)
    OR (tipo_lugar = 'RUTA'     AND id_ruta IS NOT NULL)
    OR (tipo_lugar = 'CENTRO_CONTROL'))
);

CREATE TABLE AUSENCIA (
  id_ausencia             NUMBER(10)          NOT NULL,
  id_empleado             NUMBER(10)          NOT NULL,
  tipo                    VARCHAR2(15 CHAR)   NOT NULL,
  fecha_inicio            DATE                NOT NULL,
  fecha_fin               DATE                NOT NULL,
  motivo                  VARCHAR2(200 CHAR),
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'APROBADA' NOT NULL,
  CONSTRAINT AUSENCIA_PK PRIMARY KEY (id_ausencia),
  CONSTRAINT AUSENCIA_EMPLEADO_FK FOREIGN KEY (id_empleado) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT AUSENCIA_TIPO_CK CHECK (tipo IN ('AUSENCIA','PERMISO','VACACIONES','INCAPACIDAD')),
  CONSTRAINT AUSENCIA_ESTADO_CK CHECK (estado IN ('SOLICITADA','APROBADA','RECHAZADA')),
  CONSTRAINT AUSENCIA_FECHAS_CK CHECK (fecha_fin >= fecha_inicio)
);


-- -------------------------------------------------------------
-- MODULO 5: PASAJEROS, TARIFAS, TARJETAS Y PAGOS
-- -------------------------------------------------------------

CREATE TABLE PASAJERO (
  id_pasajero             NUMBER(10)          NOT NULL,
  nombres                 VARCHAR2(80 CHAR)   NOT NULL,
  apellidos               VARCHAR2(80 CHAR)   NOT NULL,
  fecha_nacimiento        DATE,
  correo                  VARCHAR2(100 CHAR),
  telefono                VARCHAR2(20 CHAR),
  tipo_pasajero           VARCHAR2(20 CHAR)  DEFAULT 'REGULAR' NOT NULL,
  fecha_registro          DATE               DEFAULT SYSDATE NOT NULL,
  estado                  VARCHAR2(10 CHAR)  DEFAULT 'ACTIVO' NOT NULL,
  CONSTRAINT PASAJERO_PK PRIMARY KEY (id_pasajero),
  CONSTRAINT PASAJERO_CORREO_UK UNIQUE (correo),
  CONSTRAINT PASAJERO_TIPO_CK CHECK (tipo_pasajero IN ('REGULAR','ESTUDIANTE','ADULTO_MAYOR','DISCAPACIDAD','EMPLEADO')),
  CONSTRAINT PASAJERO_ESTADO_CK CHECK (estado IN ('ACTIVO','INACTIVO'))
);

CREATE TABLE TARIFA (
  codigo_tarifa           VARCHAR2(20 CHAR)   NOT NULL,
  nombre                  VARCHAR2(60 CHAR)   NOT NULL,
  descripcion             VARCHAR2(200 CHAR),
  tipo_producto           VARCHAR2(20 CHAR)   NOT NULL,
  monto                   NUMBER(8,2)         NOT NULL,
  tipo_pasajero           VARCHAR2(20 CHAR)  DEFAULT 'TODOS' NOT NULL,
  fecha_inicio_vigencia   DATE                NOT NULL,
  fecha_fin_vigencia      DATE,
  cantidad_max_viajes     NUMBER(4),
  duracion_dias           NUMBER(4),
  estado                  VARCHAR2(10 CHAR)  DEFAULT 'ACTIVA' NOT NULL,
  CONSTRAINT TARIFA_PK PRIMARY KEY (codigo_tarifa),
  CONSTRAINT TARIFA_PRODUCTO_CK CHECK (tipo_producto IN ('VIAJE_INDIVIDUAL','PASE_DIARIO','PASE_SEMANAL','PASE_MENSUAL',
                                                         'TARIFA_REDUCIDA','PASE_ESTUDIANTIL')),
  CONSTRAINT TARIFA_MONTO_CK CHECK (monto >= 0),
  CONSTRAINT TARIFA_TIPO_PAS_CK CHECK (tipo_pasajero IN ('TODOS','REGULAR','ESTUDIANTE','ADULTO_MAYOR','DISCAPACIDAD','EMPLEADO')),
  CONSTRAINT TARIFA_VIGENCIA_CK CHECK (fecha_fin_vigencia IS NULL OR fecha_fin_vigencia >= fecha_inicio_vigencia),
  CONSTRAINT TARIFA_MAX_CK CHECK (cantidad_max_viajes IS NULL OR cantidad_max_viajes > 0),
  CONSTRAINT TARIFA_DURACION_CK CHECK (duracion_dias IS NULL OR duracion_dias > 0),
  CONSTRAINT TARIFA_ESTADO_CK CHECK (estado IN ('ACTIVA','INACTIVA'))
);

-- historial de precios (lo llena el trigger TRG_TARIFA_HISTORIAL)
CREATE TABLE HISTORIAL_TARIFA (
  id_historial            NUMBER(10)          NOT NULL,
  codigo_tarifa           VARCHAR2(20 CHAR)   NOT NULL,
  monto_anterior          NUMBER(8,2)         NOT NULL,
  monto_nuevo             NUMBER(8,2)         NOT NULL,
  vigente_desde           DATE                NOT NULL,
  vigente_hasta           DATE                NOT NULL,
  fecha_cambio            DATE               DEFAULT SYSDATE NOT NULL,
  usuario                 VARCHAR2(60 CHAR)  DEFAULT USER NOT NULL,
  CONSTRAINT HISTORIAL_TARIFA_PK PRIMARY KEY (id_historial),
  CONSTRAINT HT_TARIFA_FK FOREIGN KEY (codigo_tarifa) REFERENCES TARIFA (codigo_tarifa)
);

-- id_pasajero NULL = tarjeta anonima (no personalizada)
CREATE TABLE TARJETA (
  numero_tarjeta          NUMBER(16)          NOT NULL,
  id_pasajero             NUMBER(10),
  codigo_tarifa           VARCHAR2(20 CHAR)   NOT NULL,
  fecha_emision           DATE               DEFAULT SYSDATE NOT NULL,
  fecha_vencimiento       DATE                NOT NULL,
  saldo                   NUMBER(10,2)       DEFAULT 0 NOT NULL,
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'ACTIVA' NOT NULL,
  CONSTRAINT TARJETA_PK PRIMARY KEY (numero_tarjeta),
  CONSTRAINT TARJETA_PASAJERO_FK FOREIGN KEY (id_pasajero) REFERENCES PASAJERO (id_pasajero),
  CONSTRAINT TARJETA_TARIFA_FK FOREIGN KEY (codigo_tarifa) REFERENCES TARIFA (codigo_tarifa),
  CONSTRAINT TARJETA_SALDO_CK CHECK (saldo >= 0),
  CONSTRAINT TARJETA_ESTADO_CK CHECK (estado IN ('ACTIVA','BLOQUEADA','VENCIDA','PERDIDA','CANCELADA')),
  CONSTRAINT TARJETA_FECHAS_CK CHECK (fecha_vencimiento > fecha_emision)
);

CREATE TABLE RECARGA (
  numero_transaccion      NUMBER(15)          NOT NULL,
  numero_tarjeta          NUMBER(16)          NOT NULL,
  fecha_hora              DATE               DEFAULT SYSDATE NOT NULL,
  monto                   NUMBER(10,2)        NOT NULL,
  medio_pago              VARCHAR2(20 CHAR)   NOT NULL,
  canal                   VARCHAR2(20 CHAR)   NOT NULL,
  id_estacion             NUMBER(10),
  saldo_anterior          NUMBER(10,2)        NOT NULL,
  saldo_posterior         NUMBER(10,2)        NOT NULL,
  CONSTRAINT RECARGA_PK PRIMARY KEY (numero_transaccion),
  CONSTRAINT RECARGA_TARJETA_FK FOREIGN KEY (numero_tarjeta) REFERENCES TARJETA (numero_tarjeta),
  CONSTRAINT RECARGA_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT RECARGA_MONTO_CK CHECK (monto > 0),
  CONSTRAINT RECARGA_MEDIO_CK CHECK (medio_pago IN ('EFECTIVO','TARJETA_CREDITO','TARJETA_DEBITO','APP_MOVIL')),
  CONSTRAINT RECARGA_CANAL_CK CHECK (canal IN ('MAQUINA_ESTACION','TAQUILLA','APP','WEB')),
  CONSTRAINT RECARGA_SALDOS_CK CHECK (saldo_posterior = saldo_anterior + monto),
  CONSTRAINT RECARGA_ESTACION_CK CHECK (canal IN ('APP','WEB') OR id_estacion IS NOT NULL)
);

-- viaje de pasajero (transaccion de acceso). numero_tarjeta NULL = boleto anonimo
-- monto_cobrado guarda lo que se cobro en ese momento aunque la tarifa cambie despues
CREATE TABLE VIAJE_PASAJERO (
  numero_transaccion      NUMBER(15)          NOT NULL,
  tipo_acceso             VARCHAR2(10 CHAR)  DEFAULT 'TARJETA' NOT NULL,
  numero_tarjeta          NUMBER(16),
  id_estacion_ingreso     NUMBER(10)          NOT NULL,
  fecha_hora_ingreso      DATE               DEFAULT SYSDATE NOT NULL,
  id_estacion_salida      NUMBER(10),
  fecha_hora_salida       DATE,
  codigo_tarifa           VARCHAR2(20 CHAR)   NOT NULL,
  monto_cobrado           NUMBER(8,2)         NOT NULL,
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'ABIERTO' NOT NULL,
  CONSTRAINT VIAJE_PASAJERO_PK PRIMARY KEY (numero_transaccion),
  CONSTRAINT VPAS_TARJETA_FK FOREIGN KEY (numero_tarjeta) REFERENCES TARJETA (numero_tarjeta),
  CONSTRAINT VPAS_EST_INGRESO_FK FOREIGN KEY (id_estacion_ingreso) REFERENCES ESTACION (id_estacion),
  CONSTRAINT VPAS_EST_SALIDA_FK FOREIGN KEY (id_estacion_salida) REFERENCES ESTACION (id_estacion),
  CONSTRAINT VPAS_TARIFA_FK FOREIGN KEY (codigo_tarifa) REFERENCES TARIFA (codigo_tarifa),
  CONSTRAINT VPAS_ACCESO_CK CHECK (tipo_acceso IN ('TARJETA','BOLETO')),
  CONSTRAINT VPAS_TARJETA_CK CHECK (tipo_acceso = 'BOLETO' OR numero_tarjeta IS NOT NULL),
  CONSTRAINT VPAS_MONTO_CK CHECK (monto_cobrado >= 0),
  CONSTRAINT VPAS_ESTADO_CK CHECK (estado IN ('ABIERTO','COMPLETADO','SIN_SALIDA','ANULADO')),
  CONSTRAINT VPAS_FECHAS_CK CHECK (fecha_hora_salida IS NULL OR fecha_hora_salida >= fecha_hora_ingreso)
);


-- -------------------------------------------------------------
-- MODULO 6: MANTENIMIENTO
-- -------------------------------------------------------------

-- equipo puede ser un tren, vagon, via, senal, plataforma, elevador o escalera.
-- segun el tipo se llena la FK que corresponde.
CREATE TABLE EQUIPO (
  id_equipo               VARCHAR2(20 CHAR)   NOT NULL,
  tipo_equipo             VARCHAR2(20 CHAR)   NOT NULL,
  descripcion_ubicacion   VARCHAR2(150 CHAR)  NOT NULL,
  id_estacion             NUMBER(10),
  id_plataforma           NUMBER(10),
  codigo_tren             VARCHAR2(10 CHAR),
  numero_serie_vagon      VARCHAR2(20 CHAR),
  fabricante              VARCHAR2(60 CHAR),
  modelo                  VARCHAR2(60 CHAR),
  numero_serie            VARCHAR2(40 CHAR),
  fecha_instalacion       DATE,
  estado                  VARCHAR2(20 CHAR)  DEFAULT 'OPERATIVO' NOT NULL,
  fecha_ultima_revision   DATE,
  fecha_proxima_revision  DATE,
  frecuencia_revision_dias NUMBER(4)         DEFAULT 90 NOT NULL,
  CONSTRAINT EQUIPO_PK PRIMARY KEY (id_equipo),
  CONSTRAINT EQUIPO_SERIE_UK UNIQUE (numero_serie),
  CONSTRAINT EQUIPO_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT EQUIPO_PLATAFORMA_FK FOREIGN KEY (id_plataforma) REFERENCES PLATAFORMA (id_plataforma),
  CONSTRAINT EQUIPO_TREN_FK FOREIGN KEY (codigo_tren) REFERENCES TREN (codigo_tren),
  CONSTRAINT EQUIPO_VAGON_FK FOREIGN KEY (numero_serie_vagon) REFERENCES VAGON (numero_serie),
  CONSTRAINT EQUIPO_TIPO_CK CHECK (tipo_equipo IN ('TREN','VAGON','VIA','SENAL','PLATAFORMA','ELEVADOR','ESCALERA_ELECTRICA')),
  CONSTRAINT EQUIPO_ESTADO_CK CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','FUERA_SERVICIO','RETIRADO')),
  CONSTRAINT EQUIPO_FREC_CK CHECK (frecuencia_revision_dias > 0),
  CONSTRAINT EQUIPO_TREN_CK CHECK (tipo_equipo <> 'TREN' OR codigo_tren IS NOT NULL),
  CONSTRAINT EQUIPO_VAGON_CK CHECK (tipo_equipo <> 'VAGON' OR numero_serie_vagon IS NOT NULL),
  CONSTRAINT EQUIPO_PLAT_CK CHECK (tipo_equipo <> 'PLATAFORMA' OR id_plataforma IS NOT NULL),
  CONSTRAINT EQUIPO_EST_CK CHECK (tipo_equipo NOT IN ('ELEVADOR','ESCALERA_ELECTRICA') OR id_estacion IS NOT NULL),
  CONSTRAINT EQUIPO_REVISION_CK CHECK (fecha_proxima_revision IS NULL OR fecha_ultima_revision IS NULL
                                       OR fecha_proxima_revision >= fecha_ultima_revision)
);

CREATE TABLE ORDEN_MANTENIMIENTO (
  numero_orden            NUMBER(10)          NOT NULL,
  id_equipo               VARCHAR2(20 CHAR)   NOT NULL,
  tipo_mantenimiento      VARCHAR2(25 CHAR)   NOT NULL,
  descripcion             VARCHAR2(300 CHAR)  NOT NULL,
  fecha_solicitud         DATE               DEFAULT SYSDATE NOT NULL,
  fecha_programada        DATE,
  fecha_inicio            DATE,
  fecha_fin               DATE,
  id_tecnico_responsable  NUMBER(10)          NOT NULL,
  prioridad               VARCHAR2(10 CHAR)  DEFAULT 'MEDIA' NOT NULL,
  costo_mano_obra         NUMBER(12,2)       DEFAULT 0 NOT NULL,
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'SOLICITADA' NOT NULL,
  CONSTRAINT ORDEN_MANTENIMIENTO_PK PRIMARY KEY (numero_orden),
  CONSTRAINT OM_EQUIPO_FK FOREIGN KEY (id_equipo) REFERENCES EQUIPO (id_equipo),
  CONSTRAINT OM_RESPONSABLE_FK FOREIGN KEY (id_tecnico_responsable) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT OM_TIPO_CK CHECK (tipo_mantenimiento IN ('PREVENTIVO','CORRECTIVO','PREDICTIVO','INSPECCION_SEGURIDAD')),
  CONSTRAINT OM_PRIORIDAD_CK CHECK (prioridad IN ('BAJA','MEDIA','ALTA','URGENTE')),
  CONSTRAINT OM_ESTADO_CK CHECK (estado IN ('SOLICITADA','PROGRAMADA','EN_EJECUCION','SUSPENDIDA','COMPLETADA','CANCELADA')),
  CONSTRAINT OM_COSTO_CK CHECK (costo_mano_obra >= 0),
  CONSTRAINT OM_PROGRAMADA_CK CHECK (fecha_programada IS NULL OR fecha_programada >= TRUNC(fecha_solicitud)),
  CONSTRAINT OM_FECHAS_CK CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);

-- tecnicos que participan en una orden (una orden puede tener varios)
CREATE TABLE ORDEN_TECNICO (
  numero_orden            NUMBER(10)          NOT NULL,
  id_empleado             NUMBER(10)          NOT NULL,
  rol                     VARCHAR2(15 CHAR)  DEFAULT 'APOYO' NOT NULL,
  horas_trabajadas        NUMBER(5,1)        DEFAULT 0 NOT NULL,
  CONSTRAINT ORDEN_TECNICO_PK PRIMARY KEY (numero_orden, id_empleado),
  CONSTRAINT OT_ORDEN_FK FOREIGN KEY (numero_orden) REFERENCES ORDEN_MANTENIMIENTO (numero_orden),
  CONSTRAINT OT_EMPLEADO_FK FOREIGN KEY (id_empleado) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT OT_ROL_CK CHECK (rol IN ('RESPONSABLE','APOYO')),
  CONSTRAINT OT_HORAS_CK CHECK (horas_trabajadas >= 0)
);

CREATE TABLE REPUESTO (
  id_repuesto             NUMBER(10)          NOT NULL,
  nombre                  VARCHAR2(100 CHAR)  NOT NULL,
  descripcion             VARCHAR2(200 CHAR),
  costo_unitario          NUMBER(10,2)        NOT NULL,
  stock                   NUMBER(6)          DEFAULT 0 NOT NULL,
  CONSTRAINT REPUESTO_PK PRIMARY KEY (id_repuesto),
  CONSTRAINT REPUESTO_COSTO_CK CHECK (costo_unitario >= 0),
  CONSTRAINT REPUESTO_STOCK_CK CHECK (stock >= 0)
);

-- repuestos usados en una orden. se guarda el costo del momento.
CREATE TABLE ORDEN_REPUESTO (
  numero_orden            NUMBER(10)          NOT NULL,
  id_repuesto             NUMBER(10)          NOT NULL,
  cantidad                NUMBER(5)           NOT NULL,
  costo_unitario          NUMBER(10,2)        NOT NULL,
  CONSTRAINT ORDEN_REPUESTO_PK PRIMARY KEY (numero_orden, id_repuesto),
  CONSTRAINT OR_ORDEN_FK FOREIGN KEY (numero_orden) REFERENCES ORDEN_MANTENIMIENTO (numero_orden),
  CONSTRAINT OR_REPUESTO_FK FOREIGN KEY (id_repuesto) REFERENCES REPUESTO (id_repuesto),
  CONSTRAINT OR_CANTIDAD_CK CHECK (cantidad > 0),
  CONSTRAINT OR_COSTO_CK CHECK (costo_unitario >= 0)
);


-- -------------------------------------------------------------
-- MODULO 7: INCIDENTES
-- -------------------------------------------------------------

CREATE TABLE INCIDENTE (
  numero_incidente        NUMBER(10)          NOT NULL,
  tipo_incidente          VARCHAR2(25 CHAR)   NOT NULL,
  descripcion             VARCHAR2(400 CHAR)  NOT NULL,
  fecha_hora_inicio       DATE                NOT NULL,
  fecha_hora_fin          DATE,
  lugar_afectado          VARCHAR2(150 CHAR)  NOT NULL,
  severidad               VARCHAR2(10 CHAR)   NOT NULL,
  id_empleado_reporta     NUMBER(10),
  reportado_por           VARCHAR2(120 CHAR),
  estado                  VARCHAR2(15 CHAR)  DEFAULT 'ABIERTO' NOT NULL,
  causa_identificada      VARCHAR2(300 CHAR),
  acciones_realizadas     VARCHAR2(2000 CHAR),
  pasajeros_afectados     NUMBER(7)          DEFAULT 0 NOT NULL,
  CONSTRAINT INCIDENTE_PK PRIMARY KEY (numero_incidente),
  CONSTRAINT INCIDENTE_REPORTA_FK FOREIGN KEY (id_empleado_reporta) REFERENCES EMPLEADO (id_empleado),
  CONSTRAINT INCIDENTE_TIPO_CK CHECK (tipo_incidente IN ('FALLA_MECANICA','FALLA_ELECTRICA','FALLA_SENALIZACION',
          'EMERGENCIA_MEDICA','ACCIDENTE','SEGURIDAD','OBJETO_EN_VIA','INUNDACION','INCENDIO','CONGESTION',
          'MANT_NO_PROGRAMADO')),
  CONSTRAINT INCIDENTE_SEVERIDAD_CK CHECK (severidad IN ('BAJO','MEDIO','ALTO','CRITICO')),
  CONSTRAINT INCIDENTE_ESTADO_CK CHECK (estado IN ('ABIERTO','EN_ATENCION','CERRADO')),
  CONSTRAINT INCIDENTE_FECHAS_CK CHECK (fecha_hora_fin IS NULL OR fecha_hora_fin >= fecha_hora_inicio),
  CONSTRAINT INCIDENTE_REPORTA_CK CHECK (id_empleado_reporta IS NOT NULL OR reportado_por IS NOT NULL),
  CONSTRAINT INCIDENTE_CIERRE_CK CHECK (estado <> 'CERRADO' OR fecha_hora_fin IS NOT NULL),
  CONSTRAINT INCIDENTE_PASAJEROS_CK CHECK (pasajeros_afectados >= 0)
);

-- cada elemento de la red afectado por un incidente y que efecto tuvo
CREATE TABLE INCIDENTE_ELEMENTO (
  id_elemento             NUMBER(10)          NOT NULL,
  numero_incidente        NUMBER(10)          NOT NULL,
  tipo_elemento           VARCHAR2(15 CHAR)   NOT NULL,
  id_estacion             NUMBER(10),
  id_plataforma           NUMBER(10),
  codigo_tren             VARCHAR2(10 CHAR),
  id_ruta                 NUMBER(10),
  id_equipo               VARCHAR2(20 CHAR),
  numero_viaje            NUMBER(12),
  id_linea                VARCHAR2(5 CHAR),
  id_estacion_fin         NUMBER(10),
  tipo_efecto             VARCHAR2(20 CHAR)  DEFAULT 'NINGUNO' NOT NULL,
  minutos_retraso         NUMBER(4),
  descripcion             VARCHAR2(200 CHAR),
  CONSTRAINT INCIDENTE_ELEMENTO_PK PRIMARY KEY (id_elemento),
  CONSTRAINT IE_INCIDENTE_FK FOREIGN KEY (numero_incidente) REFERENCES INCIDENTE (numero_incidente),
  CONSTRAINT IE_ESTACION_FK FOREIGN KEY (id_estacion) REFERENCES ESTACION (id_estacion),
  CONSTRAINT IE_PLATAFORMA_FK FOREIGN KEY (id_plataforma) REFERENCES PLATAFORMA (id_plataforma),
  CONSTRAINT IE_TREN_FK FOREIGN KEY (codigo_tren) REFERENCES TREN (codigo_tren),
  CONSTRAINT IE_RUTA_FK FOREIGN KEY (id_ruta) REFERENCES RUTA (id_ruta),
  CONSTRAINT IE_EQUIPO_FK FOREIGN KEY (id_equipo) REFERENCES EQUIPO (id_equipo),
  CONSTRAINT IE_VIAJE_FK FOREIGN KEY (numero_viaje) REFERENCES VIAJE_PROGRAMADO (numero_viaje),
  CONSTRAINT IE_LINEA_FK FOREIGN KEY (id_linea) REFERENCES LINEA (id_linea),
  CONSTRAINT IE_ESTACION_FIN_FK FOREIGN KEY (id_estacion_fin) REFERENCES ESTACION (id_estacion),
  CONSTRAINT IE_TIPO_CK CHECK (tipo_elemento IN ('ESTACION','PLATAFORMA','TREN','RUTA','EQUIPO','VIAJE','TRAMO')),
  CONSTRAINT IE_EFECTO_CK CHECK (tipo_efecto IN ('NINGUNO','RETRASO','CANCELACION','CIERRE_ESTACION','CIERRE_PLATAFORMA',
                                                 'SUSPENSION_TRAMO','CAMBIO_RUTA','RETIRO_TREN')),
  CONSTRAINT IE_RETRASO_CK CHECK (minutos_retraso IS NULL OR minutos_retraso >= 0),
  CONSTRAINT IE_ELEMENTO_CK CHECK (
       (tipo_elemento = 'ESTACION'   AND id_estacion IS NOT NULL)
    OR (tipo_elemento = 'PLATAFORMA' AND id_plataforma IS NOT NULL)
    OR (tipo_elemento = 'TREN'       AND codigo_tren IS NOT NULL)
    OR (tipo_elemento = 'RUTA'       AND id_ruta IS NOT NULL)
    OR (tipo_elemento = 'EQUIPO'     AND id_equipo IS NOT NULL)
    OR (tipo_elemento = 'VIAJE'      AND numero_viaje IS NOT NULL)
    OR (tipo_elemento = 'TRAMO'      AND id_linea IS NOT NULL AND id_estacion IS NOT NULL AND id_estacion_fin IS NOT NULL))
);


-- -------------------------------------------------------------
-- BITACORA (cambios importantes y alertas)
-- -------------------------------------------------------------

CREATE TABLE BITACORA (
  id_bitacora             NUMBER(12)          NOT NULL,
  fecha                   DATE               DEFAULT SYSDATE NOT NULL,
  usuario                 VARCHAR2(60 CHAR)  DEFAULT USER NOT NULL,
  tabla                   VARCHAR2(40 CHAR)   NOT NULL,
  id_registro             VARCHAR2(40 CHAR),
  accion                  VARCHAR2(30 CHAR)   NOT NULL,
  valor_anterior          VARCHAR2(400 CHAR),
  valor_nuevo             VARCHAR2(400 CHAR),
  tipo                    VARCHAR2(10 CHAR)  DEFAULT 'CAMBIO' NOT NULL,
  detalle                 VARCHAR2(400 CHAR),
  CONSTRAINT BITACORA_PK PRIMARY KEY (id_bitacora),
  CONSTRAINT BITACORA_TIPO_CK CHECK (tipo IN ('CAMBIO','ALERTA'))
);


-- -------------------------------------------------------------
-- Indices para las FK que mas se consultan
-- -------------------------------------------------------------
CREATE INDEX VP_TREN_IX          ON VIAJE_PROGRAMADO (codigo_tren);
CREATE INDEX VP_CONDUCTOR_IX     ON VIAJE_PROGRAMADO (id_conductor);
CREATE INDEX VP_SALIDA_IX        ON VIAJE_PROGRAMADO (salida_programada);
CREATE INDEX VPAS_TARJETA_IX     ON VIAJE_PASAJERO (numero_tarjeta);
CREATE INDEX VPAS_INGRESO_IX     ON VIAJE_PASAJERO (id_estacion_ingreso, fecha_hora_ingreso);
CREATE INDEX RECARGA_TARJETA_IX  ON RECARGA (numero_tarjeta);
CREATE INDEX TURNO_EMPLEADO_IX   ON TURNO (id_empleado, hora_inicio);
CREATE INDEX TV_TREN_IX          ON TREN_VAGON (codigo_tren);
CREATE INDEX OM_EQUIPO_IX        ON ORDEN_MANTENIMIENTO (id_equipo);
CREATE INDEX IE_INCIDENTE_IX     ON INCIDENTE_ELEMENTO (numero_incidente);
CREATE INDEX RE_ESTACION_IX      ON RUTA_ESTACION (id_estacion);

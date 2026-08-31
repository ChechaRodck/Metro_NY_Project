-- Generado por Oracle SQL Developer Data Modeler 24.3.1.351.0831
--   en:        2026-08-31 15:46:46 CST
--   sitio:      Oracle Database 11g
--   tipo:      Oracle Database 11g



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE CARGO 
    ( 
     id_cargo     NUMBER (5)  NOT NULL , 
     nombre_cargo VARCHAR2 (50 CHAR)  NOT NULL , 
     descripcion  VARCHAR2 (150 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE CARGO 
    ADD CONSTRAINT CARGO_PK PRIMARY KEY ( id_cargo ) ;

CREATE TABLE CERTIFICACION 
    ( 
     id_certificacion     NUMBER (10)  NOT NULL , 
     tipo_certificacion   VARCHAR2 (100 CHAR)  NOT NULL , 
     fecha_emision        DATE  NOT NULL , 
     fecha_vencimiento    DATE  NOT NULL , 
     institucion_emisora  VARCHAR2 (100 CHAR)  NOT NULL , 
     estado               VARCHAR2 (30 CHAR)  NOT NULL , 
     modelos_autorizados  VARCHAR2 (200 CHAR)  NOT NULL , 
     EMPLEADO_id_empleado NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE CERTIFICACION 
    ADD CONSTRAINT CERTIFICACION_PK PRIMARY KEY ( id_certificacion ) ;

CREATE TABLE DEPOSITO 
    ( 
     id_deposito      NUMBER (5)  NOT NULL , 
     nombre           VARCHAR2 (100 CHAR)  NOT NULL , 
     ubicacion        VARCHAR2 (150 CHAR)  NOT NULL , 
     capacidad_trenes NUMBER (4)  NOT NULL 
    ) 
;

ALTER TABLE DEPOSITO 
    ADD CONSTRAINT DEPOSITO_PK PRIMARY KEY ( id_deposito ) ;

CREATE TABLE EMPLEADO 
    ( 
     id_empleado        NUMBER (10)  NOT NULL , 
     nombre_completo    VARCHAR2 (150 CHAR)  NOT NULL , 
     fecha_nacimiento   DATE  NOT NULL , 
     direccion          VARCHAR2 (200 CHAR)  NOT NULL , 
     telefono           VARCHAR2 (20 CHAR)  NOT NULL , 
     correo_electronico VARCHAR2 (100 CHAR)  NOT NULL , 
     fecha_contratacion DATE  NOT NULL , 
     salario            NUMBER (10,2)  NOT NULL , 
     estado_laboral     VARCHAR2 (30 CHAR)  NOT NULL , 
     CARGO_id_cargo     NUMBER (5)  NOT NULL 
    ) 
;

ALTER TABLE EMPLEADO 
    ADD CONSTRAINT EMPLEADO_PK PRIMARY KEY ( id_empleado ) ;

CREATE TABLE EQUIPO 
    ( 
     id_equipo              VARCHAR2 (30 CHAR)  NOT NULL , 
     tipo_equipo            VARCHAR2 (50 CHAR)  NOT NULL , 
     ubicacion              VARCHAR2 (150 CHAR)  NOT NULL , 
     fabricante             VARCHAR2 (100 CHAR)  NOT NULL , 
     modelo                 VARCHAR2 (100 CHAR)  NOT NULL , 
     numero_serie           VARCHAR2 (50 CHAR)  NOT NULL , 
     fecha_instalacion      DATE  NOT NULL , 
     estado                 VARCHAR2 (30 CHAR)  NOT NULL , 
     fecha_ultima_revision  DATE  NOT NULL , 
     fecha_proxima_revision DATE  NOT NULL 
    ) 
;

ALTER TABLE EQUIPO 
    ADD CONSTRAINT EQUIPO_PK PRIMARY KEY ( id_equipo ) ;

CREATE TABLE ESTACION 
    ( 
     id_estacion          NUMBER (10)  NOT NULL , 
     nombre               VARCHAR2 (100 CHAR)  NOT NULL , 
     direccion            VARCHAR2 (200 CHAR)  NOT NULL , 
     distrito             VARCHAR2 (50 CHAR)  NOT NULL , 
     latitud              NUMBER (9,6)  NOT NULL , 
     longitud             NUMBER (9,6)  NOT NULL , 
     fecha_inauguracion   DATE  NOT NULL , 
     cantidad_accesos     NUMBER (3)  NOT NULL , 
     cantidad_plataformas NUMBER (3)  NOT NULL , 
     estado_operativo     VARCHAR2 (30 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE ESTACION 
    ADD CONSTRAINT ESTACION_PK PRIMARY KEY ( id_estacion ) ;

CREATE TABLE HORARIO 
    ( 
     id_horario         NUMBER (10)  NOT NULL , 
     dias_semana        VARCHAR2 (30 CHAR)  NOT NULL , 
     hora_inicio        VARCHAR2 (5 CHAR)  NOT NULL , 
     hora_finalizacion  VARCHAR2 (5 CHAR)  NOT NULL , 
     frecuencia_minutos NUMBER (3)  NOT NULL , 
     tipo_servicio      VARCHAR2 (50 CHAR)  NOT NULL , 
     fecha_inicio_vigor DATE  NOT NULL , 
     fecha_fin_vigor    DATE  NOT NULL , 
     RUTA_id_ruta       NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_PK PRIMARY KEY ( id_horario ) ;

CREATE TABLE INCIDENTE 
    ( 
     numero_incidente             NUMBER (15)  NOT NULL , 
     tipo_incidente               VARCHAR2 (50 CHAR)  NOT NULL , 
     descripcion                  VARCHAR2 (250 CHAR)  NOT NULL , 
     fecha_hora_inicio            DATE  NOT NULL , 
     fecha_hora_finalizacion      DATE  NOT NULL , 
     nivel_severidad              VARCHAR2 (20 CHAR)  NOT NULL , 
     persona_reporto              VARCHAR2 (150 CHAR)  NOT NULL , 
     estado                       VARCHAR2 (30 CHAR)  NOT NULL , 
     causa_identificada           VARCHAR2 (200 CHAR)  NOT NULL , 
     acciones_realizadas          VARCHAR2 (250 CHAR)  NOT NULL , 
     cantidad_pasajeros_afectados NUMBER (6)  NOT NULL 
    ) 
;

ALTER TABLE INCIDENTE 
    ADD CONSTRAINT INCIDENTE_PK PRIMARY KEY ( numero_incidente ) ;

CREATE TABLE INCIDENTE_ESTACION 
    ( 
     INCIDENTE_numero_incidente NUMBER (15)  NOT NULL , 
     ESTACION_id_estacion       NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE INCIDENTE_ESTACION 
    ADD CONSTRAINT Relation_19_PK PRIMARY KEY ( INCIDENTE_numero_incidente, ESTACION_id_estacion ) ;

CREATE TABLE INCIDENTE_RUTA 
    ( 
     INCIDENTE_numero_incidente NUMBER (15)  NOT NULL , 
     RUTA_id_ruta               NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE INCIDENTE_RUTA 
    ADD CONSTRAINT Relation_20_PK PRIMARY KEY ( INCIDENTE_numero_incidente, RUTA_id_ruta ) ;

CREATE TABLE INCIDENTE_TREN 
    ( 
     INCIDENTE_numero_incidente NUMBER (15)  NOT NULL , 
     TREN_codigo_interno        VARCHAR2 (20 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE INCIDENTE_TREN 
    ADD CONSTRAINT Relation_24_PK PRIMARY KEY ( INCIDENTE_numero_incidente, TREN_codigo_interno ) ;

CREATE TABLE LINEA 
    ( 
     id_linea             VARCHAR2 (10 CHAR)  NOT NULL , 
     nombre               VARCHAR2 (100 CHAR)  NOT NULL , 
     color_mapa           VARCHAR2 (30 CHAR)  NOT NULL , 
     fecha_inauguracion   DATE  NOT NULL , 
     longitud_aprox       NUMBER (6,2)  NOT NULL , 
     estado_operativo     VARCHAR2 (30 CHAR)  NOT NULL , 
     tipo_servicio        VARCHAR2 (50 CHAR)  NOT NULL , 
     operador_responsable VARCHAR2 (100 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE LINEA 
    ADD CONSTRAINT LINEA_PK PRIMARY KEY ( id_linea ) ;

CREATE TABLE LINEA_ESTACION 
    ( 
     LINEA_id_linea       VARCHAR2 (10 CHAR)  NOT NULL , 
     ESTACION_id_estacion NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE LINEA_ESTACION 
    ADD CONSTRAINT Relation_4_PK PRIMARY KEY ( LINEA_id_linea, ESTACION_id_estacion ) ;

CREATE TABLE ORDEN_MANT_EMP 
    ( 
     ORDEN_MANT_numero_orden NUMBER (10)  NOT NULL , 
     EMPLEADO_id_empleado    NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE ORDEN_MANT_EMP 
    ADD CONSTRAINT Relation_18_PK PRIMARY KEY ( ORDEN_MANT_numero_orden, EMPLEADO_id_empleado ) ;

CREATE TABLE ORDEN_MANTENIMIENTO 
    ( 
     numero_orden        NUMBER (10)  NOT NULL , 
     tipo_mantenimiento  VARCHAR2 (50 CHAR)  NOT NULL , 
     descripcion_trabajo VARCHAR2 (250 CHAR)  NOT NULL , 
     fecha_solicitud     DATE  NOT NULL , 
     fecha_programada    DATE  NOT NULL , 
     fecha_inicio        DATE  NOT NULL , 
     fecha_finalizacion  DATE  NOT NULL , 
     prioridad           VARCHAR2 (20 CHAR)  NOT NULL , 
     costo_total         NUMBER (12,2)  NOT NULL , 
     estado              VARCHAR2 (30 CHAR)  NOT NULL , 
     EQUIPO_id_equipo    VARCHAR2 (30 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE ORDEN_MANTENIMIENTO 
    ADD CONSTRAINT ORDEN_MANTENIMIENTO_PK PRIMARY KEY ( numero_orden ) ;

CREATE TABLE ORN_MANT_REPUESTO 
    ( 
     ORN_MANT_numero_orden NUMBER (10)  NOT NULL , 
     REPUESTO_id_repuesto  NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE ORN_MANT_REPUESTO 
    ADD CONSTRAINT Relation_17_PK PRIMARY KEY ( ORN_MANT_numero_orden, REPUESTO_id_repuesto ) ;

CREATE TABLE PASAJERO 
    ( 
     id_pasajero        NUMBER (10)  NOT NULL , 
     nombre             VARCHAR2 (150 CHAR)  NOT NULL , 
     fecha_nacimiento   DATE  NOT NULL , 
     correo_electronico VARCHAR2 (100 CHAR)  NOT NULL , 
     telefono           VARCHAR2 (20 CHAR)  NOT NULL , 
     tipo_pasajero      VARCHAR2 (50 CHAR)  NOT NULL , 
     fecha_registro     DATE  NOT NULL , 
     estado             VARCHAR2 (30 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE PASAJERO 
    ADD CONSTRAINT PASAJERO_PK PRIMARY KEY ( id_pasajero ) ;

CREATE TABLE PLATAFORMA 
    ( 
     id_plataforma        NUMBER (10)  NOT NULL , 
     direccion_viaje      VARCHAR2 (100 CHAR)  NOT NULL , 
     capacidad_aprox      NUMBER (5)  NOT NULL , 
     estado_operativo     VARCHAR2 (30 CHAR)  NOT NULL , 
     ESTACION_id_estacion NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE PLATAFORMA 
    ADD CONSTRAINT PLATAFORMA_PK PRIMARY KEY ( id_plataforma ) ;

CREATE TABLE RECARGA 
    ( 
     numero_transaccion     NUMBER (15)  NOT NULL , 
     fecha_hora_ingreso     DATE  NOT NULL , 
     fecha_hora_salida      DATE  NOT NULL , 
     tarifa_aplicada        VARCHAR2 (50 CHAR)  NOT NULL , 
     monto_cobrado          NUMBER (10,2)  NOT NULL , 
     estado_transaccion     VARCHAR2 (30 CHAR)  NOT NULL , 
     TARJETA_numero_tarjeta NUMBER (15)  NOT NULL 
    ) 
;

ALTER TABLE RECARGA 
    ADD CONSTRAINT RECARGA_PK PRIMARY KEY ( numero_transaccion ) ;

CREATE TABLE REPUESTO 
    ( 
     id_repuesto     NUMBER (10)  NOT NULL , 
     nombre_repuesto VARCHAR2 (100 CHAR)  NOT NULL , 
     descripcion     VARCHAR2 (200 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE REPUESTO 
    ADD CONSTRAINT REPUESTO_PK PRIMARY KEY ( id_repuesto ) ;

CREATE TABLE RUTA 
    ( 
     id_ruta               NUMBER (10)  NOT NULL , 
     sentido_recorrido     VARCHAR2 (50 CHAR)  NOT NULL , 
     tipo_servicio         VARCHAR2 (50 CHAR)  NOT NULL , 
     distancia_total       NUMBER (6,2)  NOT NULL , 
     duracion_estimada_min NUMBER (4)  NOT NULL , 
     estado                VARCHAR2 (30 CHAR)  NOT NULL , 
     fecha_vigencia        DATE  NOT NULL , 
     LINEA_id_linea        VARCHAR2 (10 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE RUTA 
    ADD CONSTRAINT RUTA_PK PRIMARY KEY ( id_ruta ) ;

CREATE TABLE RUTA_ESTACION 
    ( 
     RUTA_id_ruta         NUMBER (10)  NOT NULL , 
     ESTACION_id_estacion NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE RUTA_ESTACION 
    ADD CONSTRAINT Relation_5_PK PRIMARY KEY ( RUTA_id_ruta, ESTACION_id_estacion ) ;

CREATE TABLE TARIFA 
    ( 
     codigo_tarifa           VARCHAR2 (20 CHAR)  NOT NULL , 
     nombre                  VARCHAR2 (100 CHAR)  NOT NULL , 
     descripcion             VARCHAR2 (200 CHAR)  NOT NULL , 
     monto                   NUMBER (10,2)  NOT NULL , 
     tipo_pasajero           VARCHAR2 (50 CHAR)  NOT NULL , 
     fecha_inicio_vigencia   DATE  NOT NULL , 
     fecha_fin_vigencia      DATE  NOT NULL , 
     cantidad_maxima_viajes  NUMBER (5)  NOT NULL , 
     duracion_beneficio_dias NUMBER (4)  NOT NULL , 
     estado                  VARCHAR2 (30 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE TARIFA 
    ADD CONSTRAINT TARIFA_PK PRIMARY KEY ( codigo_tarifa ) ;

CREATE TABLE TARJETA 
    ( 
     numero_tarjeta       NUMBER (15)  NOT NULL , 
     fecha_emision        DATE  NOT NULL , 
     fecha_vencimiento    DATE  NOT NULL , 
     saldo_disponible     NUMBER (10,2)  NOT NULL , 
     tipo_tarifa          VARCHAR2 (50 CHAR)  NOT NULL , 
     estado               VARCHAR2 (30 CHAR)  NOT NULL , 
     PASAJERO_id_pasajero NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE TARJETA 
    ADD CONSTRAINT TARJETA_PK PRIMARY KEY ( numero_tarjeta ) ;

CREATE TABLE TREN 
    ( 
     codigo_interno           VARCHAR2 (20 CHAR)  NOT NULL , 
     modelo                   VARCHAR2 (50 CHAR)  NOT NULL , 
     fabricante               VARCHAR2 (50 CHAR)  NOT NULL , 
     anio_fabricacion         NUMBER (4)  NOT NULL , 
     capacidad_total          NUMBER (5)  NOT NULL , 
     estado_operativo         VARCHAR2 (30 CHAR)  NOT NULL , 
     kilometraje_acumulado    NUMBER (10,2)  NOT NULL , 
     fecha_ultima_inspeccion  DATE  NOT NULL , 
     fecha_proxima_inspeccion DATE  NOT NULL , 
     DEPOSITO_id_deposito     NUMBER (5)  NOT NULL 
    ) 
;

ALTER TABLE TREN 
    ADD CONSTRAINT TREN_PK PRIMARY KEY ( codigo_interno ) ;

CREATE TABLE TREN_VAGON 
    ( 
     TREN_codigo_interno VARCHAR2 (20 CHAR)  NOT NULL , 
     VAGON_numero_serie  VARCHAR2 (30 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE TREN_VAGON 
    ADD CONSTRAINT Relation_10_PK PRIMARY KEY ( TREN_codigo_interno, VAGON_numero_serie ) ;

CREATE TABLE TURNO 
    ( 
     id_turno             NUMBER (10)  NOT NULL , 
     fecha_turno          DATE  NOT NULL , 
     hora_inicio          VARCHAR2 (5 CHAR)  NOT NULL , 
     hora_finalizacion    VARCHAR2 (5 CHAR)  NOT NULL , 
     lugar_trabajo        VARCHAR2 (100 CHAR)  NOT NULL , 
     funcion_realizar     VARCHAR2 (100 CHAR)  NOT NULL , 
     estado_asistencia    VARCHAR2 (30 CHAR)  NOT NULL , 
     EMPLEADO_id_empleado NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE TURNO 
    ADD CONSTRAINT TURNO_PK PRIMARY KEY ( id_turno ) ;

CREATE TABLE VAGON 
    ( 
     numero_serie               VARCHAR2 (30 CHAR)  NOT NULL , 
     tipo_vagon                 VARCHAR2 (30 CHAR)  NOT NULL , 
     capacidad_sentados         NUMBER (3)  NOT NULL , 
     capacidad_pie              NUMBER (3)  NOT NULL , 
     anio_fabricacion           NUMBER (4)  NOT NULL , 
     estado                     VARCHAR2 (30 CHAR)  NOT NULL , 
     accesibilidad_discapacidad VARCHAR2 (2 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE VAGON 
    ADD CONSTRAINT VAGON_PK PRIMARY KEY ( numero_serie ) ;

CREATE TABLE VIAJE_PASAJERO 
    ( 
     numero_transaccion     NUMBER (15)  NOT NULL , 
     fecha_hora_ingreso     DATE  NOT NULL , 
     fecha_hora_salida      DATE  NOT NULL , 
     tarifa_aplicada        VARCHAR2 (50 CHAR)  NOT NULL , 
     monto_cobrado          NUMBER (10,2)  NOT NULL , 
     estado_transaccion     VARCHAR2 (30 CHAR)  NOT NULL , 
     TARJETA_numero_tarjeta NUMBER (15)  NOT NULL , 
     ESTACION_id_estacion   NUMBER (10)  NOT NULL , 
     TARIFA_codigo_tarifa   VARCHAR2 (20 CHAR)  NOT NULL 
    ) 
;

ALTER TABLE VIAJE_PASAJERO 
    ADD CONSTRAINT VIAJE_PASAJERO_PK PRIMARY KEY ( numero_transaccion ) ;

CREATE TABLE VIAJE_PROGRAMADO 
    ( 
     numero_viaje                NUMBER (15)  NOT NULL , 
     fecha                       DATE  NOT NULL , 
     hora_programada_salida      VARCHAR2 (5 CHAR)  NOT NULL , 
     hora_real_salida            DATE  NOT NULL , 
     hora_programada_llegada     VARCHAR2 (5 CHAR)  NOT NULL , 
     hora_real_llegada           DATE  NOT NULL , 
     estado_viaje                VARCHAR2 (30 CHAR)  NOT NULL , 
     cantidad_estimada_pasajeros NUMBER (6)  NOT NULL , 
     RUTA_id_ruta                NUMBER (10)  NOT NULL , 
     TREN_codigo_interno         VARCHAR2 (20 CHAR)  NOT NULL , 
     EMPLEADO_id_empleado        NUMBER (10)  NOT NULL 
    ) 
;

ALTER TABLE VIAJE_PROGRAMADO 
    ADD CONSTRAINT VIAJE_PROGRAMADO_PK PRIMARY KEY ( numero_viaje ) ;

ALTER TABLE CERTIFICACION 
    ADD CONSTRAINT CERTIFICACION_EMPLEADO_FK FOREIGN KEY 
    ( 
     EMPLEADO_id_empleado
    ) 
    REFERENCES EMPLEADO 
    ( 
     id_empleado
    ) 
;

ALTER TABLE EMPLEADO 
    ADD CONSTRAINT EMPLEADO_CARGO_FK FOREIGN KEY 
    ( 
     CARGO_id_cargo
    ) 
    REFERENCES CARGO 
    ( 
     id_cargo
    ) 
;

ALTER TABLE HORARIO 
    ADD CONSTRAINT HORARIO_RUTA_FK FOREIGN KEY 
    ( 
     RUTA_id_ruta
    ) 
    REFERENCES RUTA 
    ( 
     id_ruta
    ) 
;

ALTER TABLE ORDEN_MANTENIMIENTO 
    ADD CONSTRAINT ORDEN_MANTENIMIENTO_EQUIPO_FK FOREIGN KEY 
    ( 
     EQUIPO_id_equipo
    ) 
    REFERENCES EQUIPO 
    ( 
     id_equipo
    ) 
;

ALTER TABLE PLATAFORMA 
    ADD CONSTRAINT PLATAFORMA_ESTACION_FK FOREIGN KEY 
    ( 
     ESTACION_id_estacion
    ) 
    REFERENCES ESTACION 
    ( 
     id_estacion
    ) 
;

ALTER TABLE RECARGA 
    ADD CONSTRAINT RECARGA_TARJETA_FK FOREIGN KEY 
    ( 
     TARJETA_numero_tarjeta
    ) 
    REFERENCES TARJETA 
    ( 
     numero_tarjeta
    ) 
;

ALTER TABLE TREN_VAGON 
    ADD CONSTRAINT Relation_10_TREN_FK FOREIGN KEY 
    ( 
     TREN_codigo_interno
    ) 
    REFERENCES TREN 
    ( 
     codigo_interno
    ) 
;

ALTER TABLE TREN_VAGON 
    ADD CONSTRAINT Relation_10_VAGON_FK FOREIGN KEY 
    ( 
     VAGON_numero_serie
    ) 
    REFERENCES VAGON 
    ( 
     numero_serie
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE ORN_MANT_REPUESTO 
    ADD CONSTRAINT Relation_17_ORDEN_MANTENIMIENTO_FK FOREIGN KEY 
    ( 
     ORN_MANT_numero_orden
    ) 
    REFERENCES ORDEN_MANTENIMIENTO 
    ( 
     numero_orden
    ) 
;

ALTER TABLE ORN_MANT_REPUESTO 
    ADD CONSTRAINT Relation_17_REPUESTO_FK FOREIGN KEY 
    ( 
     REPUESTO_id_repuesto
    ) 
    REFERENCES REPUESTO 
    ( 
     id_repuesto
    ) 
;

ALTER TABLE ORDEN_MANT_EMP 
    ADD CONSTRAINT Relation_18_EMPLEADO_FK FOREIGN KEY 
    ( 
     EMPLEADO_id_empleado
    ) 
    REFERENCES EMPLEADO 
    ( 
     id_empleado
    ) 
;

--  ERROR: FK name length exceeds maximum allowed length(30) 
ALTER TABLE ORDEN_MANT_EMP 
    ADD CONSTRAINT Relation_18_ORDEN_MANTENIMIENTO_FK FOREIGN KEY 
    ( 
     ORDEN_MANT_numero_orden
    ) 
    REFERENCES ORDEN_MANTENIMIENTO 
    ( 
     numero_orden
    ) 
;

ALTER TABLE INCIDENTE_ESTACION 
    ADD CONSTRAINT Relation_19_ESTACION_FK FOREIGN KEY 
    ( 
     ESTACION_id_estacion
    ) 
    REFERENCES ESTACION 
    ( 
     id_estacion
    ) 
;

ALTER TABLE INCIDENTE_ESTACION 
    ADD CONSTRAINT Relation_19_INCIDENTE_FK FOREIGN KEY 
    ( 
     INCIDENTE_numero_incidente
    ) 
    REFERENCES INCIDENTE 
    ( 
     numero_incidente
    ) 
;

ALTER TABLE INCIDENTE_RUTA 
    ADD CONSTRAINT Relation_20_INCIDENTE_FK FOREIGN KEY 
    ( 
     INCIDENTE_numero_incidente
    ) 
    REFERENCES INCIDENTE 
    ( 
     numero_incidente
    ) 
;

ALTER TABLE INCIDENTE_RUTA 
    ADD CONSTRAINT Relation_20_RUTA_FK FOREIGN KEY 
    ( 
     RUTA_id_ruta
    ) 
    REFERENCES RUTA 
    ( 
     id_ruta
    ) 
;

ALTER TABLE INCIDENTE_TREN 
    ADD CONSTRAINT Relation_24_INCIDENTE_FK FOREIGN KEY 
    ( 
     INCIDENTE_numero_incidente
    ) 
    REFERENCES INCIDENTE 
    ( 
     numero_incidente
    ) 
;

ALTER TABLE INCIDENTE_TREN 
    ADD CONSTRAINT Relation_24_TREN_FK FOREIGN KEY 
    ( 
     TREN_codigo_interno
    ) 
    REFERENCES TREN 
    ( 
     codigo_interno
    ) 
;

ALTER TABLE LINEA_ESTACION 
    ADD CONSTRAINT Relation_4_ESTACION_FK FOREIGN KEY 
    ( 
     ESTACION_id_estacion
    ) 
    REFERENCES ESTACION 
    ( 
     id_estacion
    ) 
;

ALTER TABLE LINEA_ESTACION 
    ADD CONSTRAINT Relation_4_LINEA_FK FOREIGN KEY 
    ( 
     LINEA_id_linea
    ) 
    REFERENCES LINEA 
    ( 
     id_linea
    ) 
;

ALTER TABLE RUTA_ESTACION 
    ADD CONSTRAINT Relation_5_ESTACION_FK FOREIGN KEY 
    ( 
     ESTACION_id_estacion
    ) 
    REFERENCES ESTACION 
    ( 
     id_estacion
    ) 
;

ALTER TABLE RUTA_ESTACION 
    ADD CONSTRAINT Relation_5_RUTA_FK FOREIGN KEY 
    ( 
     RUTA_id_ruta
    ) 
    REFERENCES RUTA 
    ( 
     id_ruta
    ) 
;

ALTER TABLE RUTA 
    ADD CONSTRAINT RUTA_LINEA_FK FOREIGN KEY 
    ( 
     LINEA_id_linea
    ) 
    REFERENCES LINEA 
    ( 
     id_linea
    ) 
;

ALTER TABLE TARJETA 
    ADD CONSTRAINT TARJETA_PASAJERO_FK FOREIGN KEY 
    ( 
     PASAJERO_id_pasajero
    ) 
    REFERENCES PASAJERO 
    ( 
     id_pasajero
    ) 
;

ALTER TABLE TREN 
    ADD CONSTRAINT TREN_DEPOSITO_FK FOREIGN KEY 
    ( 
     DEPOSITO_id_deposito
    ) 
    REFERENCES DEPOSITO 
    ( 
     id_deposito
    ) 
;

ALTER TABLE TURNO 
    ADD CONSTRAINT TURNO_EMPLEADO_FK FOREIGN KEY 
    ( 
     EMPLEADO_id_empleado
    ) 
    REFERENCES EMPLEADO 
    ( 
     id_empleado
    ) 
;

ALTER TABLE VIAJE_PASAJERO 
    ADD CONSTRAINT VIAJE_PASAJERO_ESTACION_FK FOREIGN KEY 
    ( 
     ESTACION_id_estacion
    ) 
    REFERENCES ESTACION 
    ( 
     id_estacion
    ) 
;

ALTER TABLE VIAJE_PASAJERO 
    ADD CONSTRAINT VIAJE_PASAJERO_TARIFA_FK FOREIGN KEY 
    ( 
     TARIFA_codigo_tarifa
    ) 
    REFERENCES TARIFA 
    ( 
     codigo_tarifa
    ) 
;

ALTER TABLE VIAJE_PASAJERO 
    ADD CONSTRAINT VIAJE_PASAJERO_TARJETA_FK FOREIGN KEY 
    ( 
     TARJETA_numero_tarjeta
    ) 
    REFERENCES TARJETA 
    ( 
     numero_tarjeta
    ) 
;

ALTER TABLE VIAJE_PROGRAMADO 
    ADD CONSTRAINT VIAJE_PROGRAMADO_EMPLEADO_FK FOREIGN KEY 
    ( 
     EMPLEADO_id_empleado
    ) 
    REFERENCES EMPLEADO 
    ( 
     id_empleado
    ) 
;

ALTER TABLE VIAJE_PROGRAMADO 
    ADD CONSTRAINT VIAJE_PROGRAMADO_RUTA_FK FOREIGN KEY 
    ( 
     RUTA_id_ruta
    ) 
    REFERENCES RUTA 
    ( 
     id_ruta
    ) 
;

ALTER TABLE VIAJE_PROGRAMADO 
    ADD CONSTRAINT VIAJE_PROGRAMADO_TREN_FK FOREIGN KEY 
    ( 
     TREN_codigo_interno
    ) 
    REFERENCES TREN 
    ( 
     codigo_interno
    ) 
;



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            30
-- CREATE INDEX                             0
-- ALTER TABLE                             62
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   2
-- WARNINGS                                 0

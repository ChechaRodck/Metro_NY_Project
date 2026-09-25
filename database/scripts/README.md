# Scripts de la base de datos (Oracle)

Probado para Oracle XE 21c. Usuario del esquema: `metro_ny` / `metro123`.

## Antes de empezar
1. Revisar que Oracle este encendido: `Win + R` > `services.msc` > `OracleServiceXE` y
   `OracleOraDB21Home1TNSListener` tienen que estar **En ejecucion**.
2. En SQL Developer crear dos conexiones (boton **+** verde), las dos con Hostname `localhost`,
   Port `1521` y **Service name** (no SID) `XEPDB1`:

| Nombre | Usuario | Clave |
|--------|---------|-------|
| `system_xe` | `system` | la que pusieron al instalar Oracle XE |
| `metro_ny` | `metro_ny` | `metro123` (se crea en el paso 1 de abajo) |

## Orden de ejecucion

| Paso | Archivo | Conectado como | Que hace |
|------|---------|----------------|----------|
| 1 | `00_crear_usuario.sql` | system_xe | Crea el usuario `metro_ny` con sus permisos. Solo una vez. |
| 2 | `ejecutar_todo.sql` | metro_ny | Corre del 01 al 07 en orden y al final lista objetos invalidos (debe salir vacio). |
| 3 | `09_pruebas.sql` | metro_ny | Pruebas de SP, funciones y triggers. Termina con ROLLBACK. |
| - | `08_consultas.sql` | metro_ny | Las 15 consultas del enunciado (pide valores para las `:variables`). |
| - | `99_eliminar_todo.sql` | metro_ny | Borra todo el esquema para empezar de cero. |

- Los scripts completos se corren con **F5 (Run Script)**, no con F9/Ctrl+Enter.
- Una consulta suelta de `08_consultas.sql` se corre poniendo el cursor dentro y **Ctrl + Enter**.
- Para ver los mensajes de las pruebas: *Ver > Salida de DBMS* > boton **+** > conexion `metro_ny`.
- **No correr `ejecutar_todo.sql` dos veces** sin antes correr `99_eliminar_todo.sql`
  (sale "el nombre ya esta siendo utilizado").

## Verificar que todo quedo bien
Despues del paso 2 correr esta consulta como `metro_ny`:
```sql
SELECT object_type, COUNT(*) AS cantidad,
       SUM(CASE WHEN status = 'INVALID' THEN 1 ELSE 0 END) AS invalidos
  FROM user_objects
 WHERE object_type IN ('TABLE','SEQUENCE','FUNCTION','PROCEDURE','TRIGGER','VIEW')
 GROUP BY object_type
 ORDER BY object_type;
```
Resultado esperado: FUNCTION 13, PROCEDURE 35, SEQUENCE 25, TABLE 36, TRIGGER 23, VIEW 14, y **0 invalidos** en todos.

En el paso 3 las 37 pruebas deben decir "OK" o "Error esperado". Si alguna dice **"NO DEBIO PASAR"** hay un problema.

Valores utiles para las consultas de `08_consultas.sql`: `:id_estacion = 3` (Times Sq, pasan las 5 lineas),
`:id_ruta = 1` (expreso A, se ven paradas "Solo pasa"), `:fecha =` ayer en formato `YYYY-MM-DD`,
`:numero_orden = 1`.

Las capturas y salidas de las pruebas se guardan en `database/evidencias/`.

## Problemas comunes
| Error | Solucion |
|-------|----------|
| `ORA-12514` / `ORA-12541` | Listener apagado o se puso SID en vez de Service name |
| `ORA-01017` | Usuario o clave incorrectos |
| `ORA-01920: user name conflicts` | El usuario ya existe, saltarse el paso 1 |
| `ORA-00955: el nombre ya esta siendo utilizado` | Ya se habia creado la base; correr primero `99_eliminar_todo.sql` |

## Contenido

| Archivo | Objetos |
|---------|---------|
| `01_tablas.sql` | 36 tablas con PK, FK, UNIQUE, CHECK y NOT NULL, mas indices en las FK |
| `02_secuencias.sql` | 25 secuencias (empiezan despues de los ids de los datos de prueba) |
| `03_funciones.sql` | 13 funciones |
| `04_procedimientos.sql` | 35 procedimientos |
| `05_triggers.sql` | 23 triggers |
| `06_vistas.sql` | 14 vistas |
| `07_datos_prueba.sql` | Datos de prueba (fechas relativas a SYSDATE) |

### Funciones
`FN_DURACION_VIAJE`, `FN_MINUTOS_RETRASO`, `FN_SALDO_TARJETA`, `FN_TARJETA_VALIDA`,
`FN_INGRESOS_ESTACION`, `FN_PASAJEROS_LINEA`, `FN_TREN_DISPONIBLE`, `FN_RUTA_OPERATIVA`,
`FN_COSTO_ORDEN`, `FN_CALCULAR_TARIFA`, `FN_CONDUCTOR_HABILITADO`, `FN_EMPLEADO_OCUPADO`,
`FN_DURACION_INCIDENTE`.

### Procedimientos principales
- Red: `SP_AGREGAR_ESTACION_LINEA`, `SP_REGISTRAR_TRANSFERENCIA`, `SP_DESACTIVAR_LINEA`
- Viajes: `SP_PROGRAMAR_VIAJE`, `SP_GENERAR_VIAJES`, `SP_ASIGNAR_TREN_CONDUCTOR`, `SP_CANCELAR_VIAJE`,
  `SP_REPROGRAMAR_VIAJE`, `SP_INICIAR_VIAJE`, `SP_FINALIZAR_VIAJE`, `SP_CANCELAR_VIAJES_AFECTADOS`
- Trenes: `SP_ASIGNAR_VAGON`, `SP_RETIRAR_VAGON`, `SP_CAMBIAR_ESTADO_TREN`
- Personal: `SP_PROGRAMAR_TURNO`, `SP_REGISTRAR_AUSENCIA`, `SP_SUSTITUIR_TURNO`, `SP_REVISAR_VENCIMIENTOS`
- Tarjetas: `SP_EMITIR_TARJETA`, `SP_RECARGAR_TARJETA`, `SP_REGISTRAR_INGRESO`, `SP_REGISTRAR_SALIDA`,
  `SP_REGISTRAR_VIAJE_ANONIMO`, `SP_CAMBIAR_ESTADO_TARJETA`
- Mantenimiento: `SP_CREAR_ORDEN_MANTENIMIENTO`, `SP_ASIGNAR_TECNICO`, `SP_REGISTRAR_REPUESTO`, `SP_CAMBIAR_ESTADO_ORDEN`
- Incidentes: `SP_REGISTRAR_INCIDENTE`, `SP_AGREGAR_ELEMENTO_INCIDENTE`, `SP_REGISTRAR_ACCION_INCIDENTE`, `SP_CERRAR_INCIDENTE`

Los procedimientos **no hacen COMMIT**; lo hace quien los llama (el backend o el script).
Los parametros de entrada van primero y los de salida (`o_...`) al final.

### Codigos de error (RAISE_APPLICATION_ERROR)
| Rango | Modulo |
|-------|--------|
| -20001 a -20009 | Red |
| -20010 a -20049 | Rutas y viajes |
| -20050 a -20059 | Trenes |
| -20060 a -20069 | Personal |
| -20070 a -20089 | Tarjetas y accesos |
| -20090 a -20109 | Mantenimiento |
| -20110 a -20129 | Incidentes |
| -20150 a -20199 | Triggers |

## Datos de prueba (para las demos)

- 21 estaciones reales de NY, lineas **A, C, E, 1, 2**, 31 transferencias, 7 rutas.
- Trenes: `T-104` en mantenimiento, `T-107` fuera de servicio, `T-108` con inspeccion vencida,
  `T-102` en operacion (viaje 14 en curso).
- Conductores: 5 tiene la licencia **vencida**, 6 le vence en 20 dias.
- Tarjetas: `4000000000000001` normal, `...006` pase mensual (sale gratis), `...007` bloqueada,
  `...009` con saldo 1.00, `...010` vencida, `...011` perdida, `...008` y `...009` anonimas.
- Viajes 1 a 13 de ayer (algunos con retraso y el 8 cancelado), 15 a 19 en los proximos minutos,
  20 a 23 de manana.
- Incidentes abiertos: inundacion en Canal St (anden sur cerrado), falla del T-104 y elevador de 34 St.

**Las fechas son relativas al dia en que se cargan los datos**, y lo que se hace por la API si se guarda.
Antes de una demo o la presentacion conviene recargar: `99_eliminar_todo.sql` y luego `ejecutar_todo.sql`.

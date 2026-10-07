# Cambios respecto al modelo original (docs/Script_Metro_NY.sql)

La base se hizo a partir del modelo del equipo (Data Modeler), pero al correrlo en Oracle
salieron errores y faltaban cosas que pide el enunciado. **Los archivos de `docs/` no se tocaron**;
quien lleva el diagrama tiene que actualizarlo con estos cambios para que coincida con los scripts.

## Errores que se corrigieron
1. Dos llaves foraneas tenian nombre de mas de 30 caracteres y Oracle no las creaba.
2. `RECARGA` tenia columnas copiadas de `VIAJE` (no tenia monto, medio de pago, canal, saldo anterior/posterior).
3. Los nombres de columnas generados tipo `ESTACION_id_estacion` se cambiaron a nombres simples (`id_estacion`).

## Tablas nuevas (11)
| Tabla | Para que |
|-------|----------|
| `TRANSFERENCIA` | Transferencias entre dos lineas en una estacion (tiempo estimado) |
| `SERVICIO`, `ESTACION_SERVICIO` | Catalogo de servicios y cuales tiene cada estacion |
| `MODELO_TREN` | Modelo y fabricante separados del tren (3FN) |
| `CERTIFICACION_MODELO` | Modelos de tren que habilita cada certificacion de un conductor |
| `AUSENCIA` | Ausencias, permisos y vacaciones |
| `HISTORIAL_TARIFA` | Precios anteriores de cada tarifa |
| `ORDEN_TECNICO` | Tecnicos de cada orden con su rol y horas (reemplaza `ORDEN_MANT_EMP`) |
| `ORDEN_REPUESTO` | Repuestos usados en cada orden (reemplaza `ORN_MANT_REPUESTO`) |
| `INCIDENTE_ELEMENTO` | Elementos afectados por un incidente (reemplaza `INCIDENTE_ESTACION`, `INCIDENTE_RUTA` e `INCIDENTE_TREN`) |
| `BITACORA` | Registro de cambios importantes y alertas (lo llenan los triggers) |

`INCIDENTE_ELEMENTO` junta las tres tablas anteriores en una sola porque un incidente puede afectar
estaciones, plataformas, trenes, rutas, equipos, viajes o un tramo entre dos estaciones, y cada fila
guarda el tipo de efecto (cierre de estacion, retiro de tren, suspension de tramo, retraso, etc.).

## Cambios en tablas que ya existian
| Tabla | Cambio |
|-------|--------|
| `LINEA` | Terminal de origen y destino son FK a `ESTACION` |
| `LINEA_ESTACION` | Se agrego `orden`, distancia y tiempo desde la estacion anterior |
| `RUTA_ESTACION` | Se agrego `orden`, minutos de llegada/salida, distancia, tiempo y `se_detiene` (S/N) para los expresos |
| `HORARIO` | `dia_semana` acepta tambien LABORAL, FIN_SEMANA, FESTIVO y TODOS; horas `HH24:MI` validadas con CHECK |
| `VIAJE_PROGRAMADO` | Fechas en DATE con hora; tren y conductor pueden quedar vacios (se asignan despues); ruta+salida unica |
| `TREN_VAGON` | Ahora es historial: `fecha_inicio` y `fecha_fin` (un vagon solo puede estar activo en un tren) |
| `TURNO` | Lugar puede ser estacion, tren, deposito, ruta o centro de control; `id_turno_reemplaza` para sustituciones |
| `TARJETA` | `id_pasajero` opcional (tarjetas anonimas); saldo no puede ser negativo |
| `TARIFA` | Se agrego `duracion_dias` para los pases (diario, semanal, mensual) |
| `VIAJE_PASAJERO` | Se agrego estacion y hora de salida, tipo de acceso (TARJETA/BOLETO) y el monto cobrado |
| Todas | Las fechas de fin (vigencias, vencimientos) son opcionales donde el enunciado lo permite |

## Total
36 tablas (antes 30): 25 que ya estaban (corregidas) + 11 nuevas.

# Backend - API del Metro NY

Spring Boot 3 (Java 17) + JdbcTemplate + Oracle. La logica de negocio esta en los procedimientos
almacenados; el backend los llama y devuelve JSON.

## Requisitos
- **JDK 17 o 21.** No usen 22 o mayor (por ejemplo el 25 que trae IntelliJ por defecto): Spring Boot 3.3 no los soporta bien.
- IntelliJ IDEA (trae Maven incluido) o Maven instalado aparte.
- Oracle encendido y la base creada con los scripts de `database/scripts` (ver su README).

## Como correrlo

### Opcion A: IntelliJ (recomendada)
1. *File > Open* y seleccionar la carpeta **`backend`** (no la raiz del repo) > *Trust Project*.
2. Esperar a que descargue las dependencias (barra de abajo, la primera vez tarda unos minutos).
   Si el codigo sale en rojo: panel **Maven** (la "m" de la derecha) > boton *Reload All Maven Projects*.
3. *File > Project Structure > Project*:
   - **SDK:** uno 17 o 21. Si no hay: *Download JDK* > version **21** > **Eclipse Temurin**.
   - **Language level:** **17**.
4. Abrir `src/main/java/com/metrony/Main.java` y darle al **▶ verde** junto a `public class Main`.

### Opcion B: terminal
```bash
cd backend
mvn spring-boot:run
```

### Como saber que levanto
En la consola tiene que salir:
```
Tomcat started on port 8080 (http)
Started Main in 1.8 seconds
```
Luego abrir `http://localhost:8080/api/lineas` en el navegador: debe salir un JSON con las lineas A, C, E, 1 y 2.
La primera peticion es la que se conecta a Oracle (en la consola sale `HikariPool-1 - Start completed`).

La conexion esta en `src/main/resources/application.properties` (`metro_ny` / `metro123` en `localhost:1521/XEPDB1`).
Si su Oracle usa otro puerto, servicio o clave, solo cambien esas lineas.

## Probar la API

Los GET se prueban directo en el navegador. Para los POST usar **Git Bash** (el curl de PowerShell no funciona igual)
o Postman (*Body > raw > JSON*).

```bash
# ingreso con tarjeta (funciona)
curl -s -X POST http://localhost:8080/api/accesos/ingreso -H "Content-Type: application/json" -d '{"numeroTarjeta":4000000000000001,"idEstacion":3}'
# -> {"montoCobrado":2.9,"saldo":22.4,"numeroTransaccion":...}

# salida de esa tarjeta
curl -s -X POST http://localhost:8080/api/accesos/salida -H "Content-Type: application/json" -d '{"numeroTarjeta":4000000000000001,"idEstacion":10}'

# tarjeta bloqueada (debe fallar con 400)
curl -s -X POST http://localhost:8080/api/accesos/ingreso -H "Content-Type: application/json" -d '{"numeroTarjeta":4000000000000007,"idEstacion":3}'
# -> {"estado":400,"error":"La tarjeta esta BLOQUEADA, no se puede usar","codigoOracle":20081}

# tren en mantenimiento (debe fallar con 400). Cambiar la fecha por la de manana
curl -s -X POST http://localhost:8080/api/viajes -H "Content-Type: application/json" -d '{"idRuta":1,"salida":"2026-09-26T16:00:00","codigoTren":"T-104","idConductor":3}'

# programar un viaje valido
curl -s -X POST http://localhost:8080/api/viajes -H "Content-Type: application/json" -d '{"idRuta":3,"salida":"2026-09-26T15:00:00","codigoTren":"T-106","idConductor":4}'
```

Lo que se hace por la API **si se guarda** en la base. Para volver a los datos limpios ver el README de `database/scripts`.

## Problemas comunes
| Lo que sale | Solucion |
|---|---|
| Codigo en rojo, `Cannot resolve symbol springframework` | Reload de Maven y esperar que termine |
| `release version 17 not supported` | El SDK es menor a 17 |
| Errores raros al arrancar con Java 22+ | Cambiar el SDK a 21 |
| `IO Error: The Network Adapter could not establish the connection` | Oracle o el listener apagados (`services.msc`: `OracleServiceXE` y `OracleOraDB21Home1TNSListener`) |
| `ORA-12514` | El servicio no es `XEPDB1` |
| `ORA-01017` | Usuario o clave incorrectos en `application.properties` |
| `Port 8080 was already in use` | Cambiar a `server.port=8081` |

## Estructura
```
src/main/java/com/metrony
├── Main.java                  arranque
├── config/                    CORS y tarea diaria de vencimientos (1:00 am)
├── controller/                endpoints REST (uno por modulo)
├── dto/Peticiones.java        los JSON que reciben los POST/PUT
├── exception/                 manejo de errores
└── repository/                SQL y llamadas a procedimientos
```

## Formato de datos
- Fechas: `"2026-09-25"`, fecha con hora: `"2026-09-25T15:30:00"`.
- Las respuestas usan camelCase: la columna `id_estacion` llega como `idEstacion`.
- Booleanos como `seDetiene`, `accesible` se mandan `true/false` (en la base se guardan S/N).

## Errores
Siempre llegan asi:
```json
{ "fecha": "2026-09-25T10:15:00", "estado": 400, "error": "La tarjeta esta BLOQUEADA, no se puede usar", "codigoOracle": 20081 }
```
- 400: regla de negocio (errores de los procedimientos) o datos invalidos
- 404: no existe el registro
- 409: registro duplicado

## Endpoints

### Red
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/lineas` | Lineas con su estado, estaciones, rutas e incidentes |
| GET/PUT | `/api/lineas/{id}` | Ver / editar linea |
| POST | `/api/lineas` | Crear linea |
| PATCH | `/api/lineas/{id}/estado` | `{"estado":"SUSPENDIDA"}` |
| POST | `/api/lineas/{id}/desactivar` | Desactiva linea, rutas y cancela viajes futuros |
| GET/POST | `/api/lineas/{id}/estaciones` | Estaciones en orden / agregar `{"idEstacion":5,"orden":3,"distanciaKm":1.2,"tiempoMin":2}` |
| DELETE | `/api/lineas/{id}/estaciones/{idEstacion}` | Quitar estacion de la linea |
| GET | `/api/estaciones?distrito=&estado=` | Estaciones (con las lineas que pasan) |
| GET/PUT | `/api/estaciones/{id}` | Ver / editar |
| POST | `/api/estaciones` | Crear |
| PATCH | `/api/estaciones/{id}/estado` | `{"estado":"CERRADA"}` |
| GET | `/api/estaciones/{id}/lineas` | **Consulta 1** |
| GET | `/api/estaciones/{id}/proximas-salidas?limite=10` | Proximos trenes que salen de la estacion |
| GET/POST | `/api/estaciones/{id}/plataformas` | Plataformas |
| PATCH | `/api/plataformas/{id}/estado` | Abrir / cerrar plataforma |
| GET/POST/DELETE | `/api/estaciones/{id}/servicios[/{idServicio}]` | Servicios de la estacion |
| GET | `/api/servicios` | Catalogo de servicios |
| GET | `/api/estaciones/accesibilidad` | Elevadores y escaleras operativos |
| GET | `/api/transferencias?idEstacion=` | **Consulta 3** |
| POST | `/api/transferencias` | `{"idEstacion":3,"lineaA":"A","lineaB":"E","tiempoMin":3}` |

### Rutas, horarios y viajes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/rutas?idLinea=&estado=` | Rutas |
| GET/PUT/POST | `/api/rutas[/{id}]` | Ver / editar / crear |
| PATCH | `/api/rutas/{id}/estado` | ACTIVA, SUSPENDIDA, MODIFICADA, INACTIVA |
| GET | `/api/rutas/{id}/paradas` | **Consulta 2** |
| POST | `/api/rutas/{id}/paradas` | `{"idEstacion":4,"orden":5,"minutosLlegada":16,"minutosSalida":16.5,"seDetiene":true}` |
| GET | `/api/rutas/afectadas` | Rutas afectadas por cierres |
| GET/POST | `/api/rutas/{id}/horarios` | `{"diaSemana":"LABORAL","horaInicio":"06:00","horaFin":"10:00","frecuenciaMin":5,"tipoServicio":"EXPRESO"}` |
| GET | `/api/viajes?fecha=2026-09-25&idRuta=&idLinea=&estado=` | **Consulta 4** y **8** (trae conductor) |
| GET | `/api/viajes/{numero}` | Detalle con minutos de retraso |
| GET | `/api/viajes/retrasados?minimo=15` | **Consulta 5** |
| POST | `/api/viajes` | `{"idRuta":1,"salida":"2026-09-26T15:00:00","codigoTren":"T-101","idConductor":3}` |
| POST | `/api/viajes/generar` | `{"idHorario":4,"fecha":"2026-09-26"}` |
| GET | `/api/viajes/{numero}/opciones-asignacion` | Trenes y conductores libres para ese viaje |
| PUT | `/api/viajes/{numero}/asignacion` | `{"codigoTren":"T-106","idConductor":15}` |
| POST | `/api/viajes/{numero}/iniciar` | `{"horaReal":"..."}` (opcional, por defecto ahora) |
| POST | `/api/viajes/{numero}/finalizar` | `{"horaReal":"...","pasajeros":650}` |
| POST | `/api/viajes/{numero}/cancelar` | `{"motivo":"..."}` |
| POST | `/api/viajes/{numero}/reprogramar` | `{"nuevaSalida":"2026-09-26T16:00:00"}` |
| POST | `/api/viajes/{numero}/retrasado` | Marcar como retrasado |
| POST | `/api/viajes/cancelar-afectados` | `{"tipo":"ESTACION","id":12,"desde":"...","hasta":"...","motivo":"...","numeroIncidente":7}` |

### Trenes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/trenes?estado=` | Trenes |
| GET | `/api/trenes/disponibles` | **Consulta 6** |
| GET | `/api/trenes/mantenimiento` | En mantenimiento o con inspeccion vencida |
| GET/PUT/POST | `/api/trenes[/{codigo}]` | Ver / editar / crear |
| PATCH | `/api/trenes/{codigo}/estado` | DISPONIBLE, EN_MANTENIMIENTO, FUERA_SERVICIO, RETIRADO |
| GET | `/api/trenes/{codigo}/vagones` | Composicion actual |
| GET | `/api/trenes/{codigo}/historial-composicion` | Historial de vagones |
| POST | `/api/trenes/{codigo}/vagones` | `{"numeroSerie":"R160-9002","posicion":4}` |
| DELETE | `/api/trenes/{codigo}/vagones/{serie}` | Retirar vagon |
| GET | `/api/trenes/{codigo}/viajes` | Viajes del tren |
| GET/POST | `/api/vagones?libres=true` | Vagones |
| GET | `/api/modelos`, `/api/depositos` | Catalogos |

### Personal
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/empleados?cargo=CONDUCTOR&estado=ACTIVO` | Empleados |
| GET/PUT/POST | `/api/empleados[/{id}]` | Ver / editar / crear |
| PATCH | `/api/empleados/{id}/estado` | ACTIVO, VACACIONES, SUSPENDIDO, INACTIVO |
| GET/POST | `/api/empleados/{id}/certificaciones` | `{"tipoCertificacion":"...","fechaEmision":"...","fechaVencimiento":"...","institucionEmisora":"...","modelos":[1,3]}` |
| GET | `/api/certificaciones/por-vencer` | Vencidas o que vencen en 60 dias |
| POST | `/api/certificaciones/revisar-vencimientos` | Correr la revision a mano |
| GET | `/api/cargos` | Catalogo |
| GET | `/api/turnos?fecha=&idEmpleado=` | Turnos |
| POST | `/api/turnos` | `{"idEmpleado":3,"horaInicio":"...","horaFin":"...","tipoLugar":"RUTA","idLugar":"1","funcion":"Conduccion"}` |
| GET | `/api/turnos/sin-cubrir` | Turnos de gente ausente sin sustituto |
| POST | `/api/turnos/{id}/sustituir` | `{"idSustituto":9}` |
| PATCH | `/api/turnos/{id}/asistencia` | `{"estado":"ASISTIO"}` |
| GET/POST | `/api/ausencias` | `{"idEmpleado":11,"tipo":"PERMISO","fechaInicio":"...","fechaFin":"...","motivo":"..."}` |

### Pasajeros, tarjetas y tarifas
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/pasajeros?buscar=` | Pasajeros |
| GET/PUT/POST | `/api/pasajeros[/{id}]` | Ver / editar / crear |
| GET | `/api/pasajeros/{id}/tarjetas` | Tarjetas del pasajero |
| POST | `/api/tarjetas` | Emitir `{"idPasajero":1,"codigoTarifa":"VI-REG","saldoInicial":20,"idEstacion":3}` (sin idPasajero = anonima) |
| GET | `/api/tarjetas/{numero}` | Detalle (valida, proximo cobro) |
| GET | `/api/tarjetas/{numero}/saldo` | Saldo |
| POST | `/api/tarjetas/{numero}/recargas` | `{"monto":20,"medioPago":"EFECTIVO","canal":"TAQUILLA","idEstacion":3}` |
| GET | `/api/tarjetas/{numero}/recargas`, `/viajes` | Historial |
| PATCH | `/api/tarjetas/{numero}/estado` | BLOQUEADA, PERDIDA, CANCELADA, ACTIVA |
| GET | `/api/tarjetas/alertas` | Bloqueadas, vencidas o sin saldo |
| POST | `/api/accesos/ingreso` | `{"numeroTarjeta":4000000000000001,"idEstacion":3}` |
| POST | `/api/accesos/salida` | `{"numeroTarjeta":4000000000000001,"idEstacion":10}` |
| POST | `/api/accesos/boleto` | `{"idEstacion":4}` viaje sin tarjeta |
| GET | `/api/tarifas?activas=true` | Tarifas |
| GET/PUT/POST | `/api/tarifas[/{codigo}]` | Si cambia el monto se guarda el historial |
| GET | `/api/tarifas/{codigo}/historial` | Precios anteriores |

### Mantenimiento
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/equipos?tipo=&estado=&idEstacion=` | Equipos |
| GET | `/api/equipos/revision-vencida` | Equipos con revision atrasada |
| GET | `/api/equipos/{id}/historial` | Ordenes del equipo |
| GET | `/api/ordenes?estado=&prioridad=` | Ordenes (urgentes primero) |
| GET | `/api/ordenes/{numero}` | Detalle con tecnicos, repuestos y costo |
| POST | `/api/ordenes` | `{"idEquipo":"ELV-014-01","tipoMantenimiento":"CORRECTIVO","descripcion":"...","prioridad":"ALTA","idTecnico":10,"costoManoObra":350}` |
| PATCH | `/api/ordenes/{numero}/estado` | PROGRAMADA, EN_EJECUCION, SUSPENDIDA, COMPLETADA, CANCELADA |
| GET | `/api/ordenes/{numero}/tecnicos` | **Consulta 15** |
| POST | `/api/ordenes/{numero}/tecnicos` | `{"idEmpleado":11,"rol":"APOYO"}` |
| PATCH | `/api/ordenes/{numero}/tecnicos/{idEmpleado}/horas` | `{"horas":6}` |
| POST | `/api/ordenes/{numero}/repuestos` | `{"idRepuesto":2,"cantidad":1}` |
| GET/POST | `/api/repuestos` | Inventario |

### Incidentes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/incidentes?estado=&severidad=&tipo=` | Incidentes |
| GET | `/api/incidentes/abiertos` | **Consulta 12** |
| GET | `/api/incidentes/criticos`, `/estadisticas` | Tablero |
| GET | `/api/incidentes/{numero}` | Detalle con elementos afectados |
| POST | `/api/incidentes` | Ver ejemplo abajo |
| POST | `/api/incidentes/{numero}/elementos` | Agregar elemento afectado |
| POST | `/api/incidentes/{numero}/acciones` | `{"accion":"Se envio personal"}` |
| POST | `/api/incidentes/{numero}/cerrar` | `{"causa":"...","restablecer":true}` |

```json
{
  "tipoIncidente": "OBJETO_EN_VIA",
  "descripcion": "Carrito de compras en la via",
  "lugarAfectado": "23 St (8 Av)",
  "severidad": "ALTO",
  "idEmpleadoReporta": 8,
  "pasajerosAfectados": 300,
  "elementos": [
    { "tipoElemento": "ESTACION", "idElemento": "12", "efecto": "CIERRE_ESTACION" },
    { "tipoElemento": "VIAJE", "idElemento": "19", "efecto": "RETRASO", "minutosRetraso": 10 },
    { "tipoElemento": "TRAMO", "idElemento": "A", "efecto": "SUSPENSION_TRAMO", "idEstacionIni": 4, "idEstacionFin": 5 }
  ]
}
```

### Reportes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/reportes/resumen` | Numeros para la pantalla principal |
| GET | `/api/reportes/trenes-inspeccion-vencida` | **Consulta 7** |
| GET | `/api/reportes/conductores-por-viaje?fecha=` | **Consulta 8** |
| GET | `/api/reportes/pasajeros-por-linea?desde=&hasta=` | **Consulta 9** |
| GET | `/api/reportes/recaudacion?desde=&hasta=` | **Consulta 10** |
| GET | `/api/reportes/estaciones-flujo?limite=10` | **Consulta 11** |
| GET | `/api/reportes/retrasos-por-linea` | **Consulta 13** |
| GET | `/api/reportes/tarjetas-bloqueadas` | **Consulta 14** |
| GET | `/api/reportes/ingresos-por-linea?desde=&hasta=` | Ingresos diarios por linea |
| GET | `/api/reportes/ingresos-estacion/{id}?desde=&hasta=` | Ingresos de una estacion |
| GET | `/api/bitacora?tabla=&tipo=ALERTA&limite=100` | Bitacora de cambios y alertas |

## Valores permitidos (CHECK de la base)
- Estado estacion y plataforma: OPERATIVA, CERRADA, MANTENIMIENTO
- Estado viaje: PROGRAMADO, EN_ABORDAJE, EN_CURSO, RETRASADO, COMPLETADO, CANCELADO
- Tipo pasajero: REGULAR, ESTUDIANTE, ADULTO_MAYOR, DISCAPACIDAD, EMPLEADO
- Severidad: BAJO, MEDIO, ALTO, CRITICO
- El resto se puede ver en `database/scripts/01_tablas.sql` (constraints `_CK`).

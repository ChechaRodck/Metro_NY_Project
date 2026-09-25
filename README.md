# Sistema de Gestion del Metro de Nueva York

Proyecto del curso Base de Datos 1 - Universidad Mariano Galvez, Centro Universitario de Jalapa.

## Estructura
| Carpeta | Contenido |
|---------|-----------|
| `database/scripts/` | Scripts de Oracle: tablas, secuencias, funciones, procedimientos, triggers, vistas, datos de prueba, consultas y pruebas |
| `database/evidencias/` | Capturas y salidas de las pruebas |
| `backend/` | API REST en Spring Boot (Java) que usa la base de Oracle |
| `frontend/` | Aplicacion web (React) |
| `docs/` | Modelo de datos (Data Modeler) |

## Como levantar todo (en orden)
1. **Base de datos:** seguir [`database/scripts/README.md`](database/scripts/README.md).
2. **Backend:** seguir [`backend/README.md`](backend/README.md). Queda en `http://localhost:8080/api`.
3. **Frontend:** consume la API del backend (la lista de endpoints con ejemplos esta en el README del backend).

## Tecnologias
- Oracle Database XE 21c + SQL Developer
- Java 17/21, Spring Boot 3.3, Maven
- React

## Notas
- Los cambios de la base respecto al modelo original estan en
  [`database/scripts/CAMBIOS_AL_MODELO.md`](database/scripts/CAMBIOS_AL_MODELO.md).

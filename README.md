# Sistema de Gestion del Metro de Nueva York

Proyecto academico independiente del curso Base de Datos 1 de la Universidad
Mariano Galvez, Centro Universitario de Jalapa. No tiene afiliacion oficial con
la MTA.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `database/scripts/` | Fuente canonica del esquema, logica PL/SQL, datos demo, consultas y pruebas |
| `backend/` | API REST en Spring Boot 3.3, Java 17 y JdbcTemplate |
| `frontend/` | Aplicacion web React/Vite |
| `docs/` | Material academico y modelos historicos |

## Plataforma de base de datos

El objetivo vinculante es **Oracle Database 11g Release 2**, incluida Oracle XE
11.2. Los scripts no dependen de contenedores PDB ni de sintaxis introducida en
Oracle 12c. `LISTAGG` se conserva porque esta disponible en Oracle 11g Release 2.

`database/scripts/` es la unica fuente autoritativa para instalar o actualizar
el esquema. `docs/Script_Metro_NY.sql` es una referencia historica deprecada y
no debe ejecutarse ni usarse para generar migraciones.

## Puesta en marcha

1. Instalar la base siguiendo [`database/scripts/README.md`](database/scripts/README.md).
2. Configurar y levantar la API siguiendo [`backend/README.md`](backend/README.md).
3. Levantar el frontend con sus instrucciones propias.

Las credenciales de Oracle no se guardan en Git. El backend exige `DB_URL`,
`DB_USERNAME` y `DB_PASSWORD` en el entorno; consulte
[`backend/.env.example`](backend/.env.example) para conocer todas las variables.

La API usa autenticacion Bearer JWT stateless y roles almacenados en Oracle. El
esquema no instala cuentas predeterminadas: el primer administrador se crea con
un bootstrap explicito de un solo uso documentado en
[`backend/README.md`](backend/README.md).

## Tecnologias

- Oracle Database 11g Release 2 / Oracle XE 11.2.
- Java 17, Spring Boot 3.3 y Maven.
- React y Vite.

Los cambios respecto al modelo academico original estan documentados en
[`database/scripts/CAMBIOS_AL_MODELO.md`](database/scripts/CAMBIOS_AL_MODELO.md).

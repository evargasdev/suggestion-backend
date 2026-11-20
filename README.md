# Suggestion API

API anónima para encuestas de sugerencias, construida con NestJS 12 + TypeORM 1.1 + PostgreSQL.

## Estado actual

- CRUD administrativo (Dimensions, Questions, AnswerProfiles, Answers).
- Endpoint público `GET /api/evaluations/survey` con el cuestionario activo.
- Envío anónimo (`POST /api/v1/evaluations`) con validación transaccional.
- Lectura de resultados `GET /api/v1/evaluations/:id/results`.
- Documentación Swagger en `/api/docs`.
- **Sin autenticación**. El CRUD administrativo está abierto; protégelo
  antes de publicar la API.
- Clasificación por dimensión con los rangos definidos en el instrumento.

> ⚠️ **El CRUD catálogo está abierto**. Hasta que se añada auth (JWT,
> API key, etc.) cualquiera puede crear/editar/borrar el catálogo de
> dimensiones, preguntas, perfiles y opciones. **No publiques esta API
> sin proteger antes esos CRUD**.

## Stack

- NestJS `^12.0.1`
- @nestjs/typeorm `^12.0.2`
- typeorm `^1.1.1`
- @nestjs/swagger `12.0.2`
- `exceljs` para el reporte agregado en XLSX
- `@nestjs/throttler` para limitar envíos anónimos
- class-validator / class-transformer
- PostgreSQL (cualquier versión >= 12)

## Variables de entorno

Ver [`.env.example`](./.env.example). Resumen de las claves soportadas:

| Variable                     | Default                                               | Descripción                                                                                               |
| ---------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `PORT`                       | `3000`                                                | Puerto HTTP                                                                                               |
| `NODE_ENV`                   | `development`                                         | Entorno (afecta a Swagger y `DB_SYNCHRONIZE`)                                                             |
| `ENABLE_SWAGGER`             | `true` fuera de `production`; `false` en `production` | Monta Swagger UI en `/api/docs`. Acepta solo `true`/`false` literales.                                    |
| `ACTIVE_SURVEY_CACHE_TTL_MS` | `60000`                                               | TTL en milisegundos para el caché en memoria de `GET /evaluations/survey`; `0` desactiva el caché.        |
| `DATABASE_URL`               | –                                                     | URL completa de Postgres (`postgres://user:pass@host:5432/db`)                                            |
| `PG_HOST`                    | –                                                     | Host PostgreSQL (alternativa a `DATABASE_URL`)                                                            |
| `PG_PORT`                    | `5432`                                                | Puerto PostgreSQL                                                                                         |
| `PG_USERNAME`                | –                                                     | Usuario PostgreSQL                                                                                        |
| `PG_PASSWORD`                | –                                                     | Contraseña PostgreSQL                                                                                     |
| `PG_DATABASE`                | –                                                     | Base de datos                                                                                             |
| `DB_SCHEMA`                  | `public`                                              | Esquema                                                                                                   |
| `DB_SYNCHRONIZE`             | `false`                                               | Sincronizar schema desde entidades (PELIGROSO en producción). Forzado a `false` en `NODE_ENV=production`. |
| `DB_RUN_MIGRATIONS`          | `false`                                               | **Marcado como no implementado**: ver "Migraciones" más abajo. No se ejecuta nada al activar este flag.   |

Para Neon, configura `DATABASE_URL` con la URL obtenida en **Connect** e
incluye `sslmode=require`. Cuando está presente, tiene prioridad sobre `PG_*`.

> **No existe** la variable `DB_AUTO_CONNECT` que mencionaban versiones
> previas. La conexión a Postgres es obligatoria al iniciar la API.

## Endpoints

Todos los endpoints cuelgan del prefijo `/api` configurado en `src/main.ts`.

#### Salud

- `GET /api` — estado del servicio y enlace a Swagger.

#### CRUD administrativo (NO protegido)

| Método   | Ruta              | Descripción                                  |
| -------- | ----------------- | -------------------------------------------- |
| `GET`    | `/dimensions`     | Lista paginada (`offset`, `limit`, `search`) |
| `POST`   | `/dimensions`     | Crea dimensión                               |
| `GET`    | `/dimensions/:id` | Obtiene por id                               |
| `PATCH`  | `/dimensions/:id` | Actualiza                                    |
| `DELETE` | `/dimensions/:id` | Borrado lógico                               |

Mismo patrón para `/answer-profiles`, `/answers`, `/questions`. Las preguntas
aceptan `dimensionId` opcional como filtro.

#### Flujo público

| Método | Ruta                                 | Descripción                                                                                                   |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/evaluations/survey`                | Catálogo público de la encuesta activa (sin `value` de las opciones)                                          |
| `POST` | `/evaluations`                       | Envío anónimo con `demographics` y `answers`; solo admite identidades de mujeres                              |
| `GET`  | `/evaluations/:id/results`           | Puntaje normalizado y clasificación por dimensión (incluye dimensiones soft-deleted para preservar historial) |
| `GET`  | `/evaluations/dashboard`             | Agregados públicos por sector, cargo y dimensión; omite grupos con menos de 5 evaluaciones                    |
| `GET`  | `/evaluations/dashboard/report.xlsx` | Descarga Excel de los mismos agregados protegidos                                                             |

El envío anónimo (`POST /evaluations`) está limitado a 5 solicitudes por minuto
por IP. Es una protección básica en memoria por instancia, no sustituye un
CAPTCHA ni almacenamiento distribuido de límites en un despliegue escalado.

Ejemplo mínimo del cuerpo de envío:

```json
{
  "demographics": {
    "ageRange": "24 a 29 años",
    "genderIdentity": "mujer heterosexual",
    "vulnerableGroups": [],
    "origin": "Quintana Roo",
    "hasCareResponsibilities": false,
    "careResponsibilitiesDetails": [],
    "activityType": "operativo",
    "sector": "Hotelería",
    "position": "gerencia"
  },
  "answers": [{ "questionId": "<uuid>", "answerId": "<uuid>" }]
}
```

## Validaciones de `POST /evaluations`

- IDs en formato UUID v4.
- Datos demográficos requeridos: rango de edad, identidad de mujer, grupos
  vulnerables, origen, responsabilidades de cuidado, tipo de actividad, sector
  y cargo. Si se selecciona "ninguna de las anteriores", no se admiten otros
  grupos vulnerables; los detalles de cuidado deben corresponder al booleano.
- Sin `questionId` duplicados en el array.
- Pregunta debe existir y estar activa (`isActive=true`).
- Opción debe existir y estar activa.
- La opción debe pertenecer al `answerProfile` de la pregunta.
- "No aplica" solo se ofrece y acepta en Cuidados y corresponsabilidad. Se
  almacena como respuesta, no suma puntos y la puntuación se normaliza al total
  de reactivos puntuables. Si ninguno aplica, esa dimensión no recibe resultado.
- Todas las preguntas activas obligatorias (`isRequired=true`) cuya
  dimensión esté activa y NO soft-deleted deben tener respuesta.

Persistencia transaccional:

- 1 `Evaluation`
- N `QuestionAnswer` (uno por respuesta)
- 1 `EvaluationResult` por dimensión con respuestas puntuables, con clasificación
  según las bandas del instrumento.

## Instalación y arranque

```bash
pnpm install
cp .env.example .env       # edita los valores

# Dev
pnpm run start:dev

# Build + producción
pnpm run build
node dist/main.js
```

## Tests

```bash
# Unit tests (mocks de DataSource, sin Postgres)
pnpm test

# E2E smoke test (sin DB; usa AppController standalone)
pnpm run test:e2e

# Linter
pnpm run lint
```

Los tests **bypasean** el `AppModule` a propósito para no requerir una
instancia real de Postgres. Para conectar con Neon, define `DATABASE_URL`
con la cadena de conexión de Neon (incluye `sslmode=require`) y levanta el
servidor manualmente.

## Migraciones

La migración `1794015000000-AddTourismWomenSurvey` agrega los datos
demográficos, catálogos de respuesta, las 37 preguntas y la vista
`vw_dashboard_stats`. Debe ejecutarse una vez contra la base configurada,
antes de iniciar la versión nueva de la API:

```bash
pnpm run migration:run
```

La migración conserva evaluaciones anteriores asignándoles valores
"No especificado" en los nuevos campos obligatorios. `DB_RUN_MIGRATIONS=true`
no ejecuta migraciones automáticamente.

### Schema base

`InitMigration` crea el esquema inicial. `synchronize` permanece desactivado;
aplica las migraciones versionadas con el comando anterior tanto en una base
nueva como en una existente.

## Pendientes / decisiones

- **Auth**: no incluida. **CRÍTICO**: el CRUD catálogo está abierto,
  no publiques la API sin proteger antes esos endpoints.
- El panel y Excel exponen únicamente agregados con al menos cinco evaluaciones;
  no se entrega el conjunto de datos individuales.
- **`Evaluation.workplace`**: legacy, sin uso. Pendiente eliminar o poblar.
- **`synchronize:true`**: desactivado por defecto. Habilitar solo en desarrollo.

# Suggestion API

API anónima para encuestas de sugerencias, construida con NestJS 12 + TypeORM 1.1 + PostgreSQL.

## Estado actual

- CRUD administrativo (Dimensions, Questions, AnswerProfiles, Answers).
- Endpoint público `GET /api/v1/evaluations/survey` con el cuestionario activo.
- Envío anónimo (`POST /api/v1/evaluations`) con validación transaccional.
- Lectura de resultados `GET /api/v1/evaluations/:id/results`.
- Documentación Swagger en `/docs`.
- **Sin autenticación** (decisión documentada; ver `migrations/README.md`).
- **Sin clasificación** de puntajes (no inventada; ver entidad `EvaluationResult`).

> ⚠️ **El CRUD catálogo está abierto**. Hasta que se añada auth (JWT,
> API key, etc.) cualquiera puede crear/editar/borrar el catálogo de
> dimensiones, preguntas, perfiles y opciones. **No publiques esta API
> sin proteger antes esos CRUD**.

## Stack

- NestJS `^12.0.1`
- @nestjs/typeorm `^12.0.2`
- typeorm `^1.1.1`
- @nestjs/swagger `12.0.2`
- class-validator / class-transformer
- PostgreSQL (cualquier versión >= 12)

## Variables de entorno

Ver [`.env.example`](./.env.example). Resumen de las claves soportadas:

| Variable | Default | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP |
| `GLOBAL_PREFIX` | `api/v1` | Prefijo global de la API |
| `NODE_ENV` | `development` | Entorno (afecta a Swagger y `DB_SYNCHRONIZE`) |
| `ENABLE_SWAGGER` | `true` fuera de `production`; `false` en `production` | Monta Swagger UI en `/docs`. Acepta solo `true`/`false` literales. |
| `DATABASE_URL` | – | URL completa de Postgres (`postgres://user:pass@host:5432/db`) |
| `DB_HOST` | – | Host Postgres (alternativa a `DATABASE_URL`) |
| `DB_PORT` | `5432` | Puerto Postgres |
| `DB_USERNAME` | – | Usuario Postgres |
| `DB_PASSWORD` | – | Password Postgres |
| `DB_NAME` | – | Base de datos |
| `DB_SCHEMA` | `public` | Esquema |
| `DB_SYNCHRONIZE` | `false` | Sincronizar schema desde entidades (PELIGROSO en producción). Forzado a `false` en `NODE_ENV=production`. |
| `DB_RUN_MIGRATIONS` | `false` | **Marcado como no implementado**: ver "Migraciones" más abajo. No se ejecuta nada al activar este flag. |

> **No existe** la variable `DB_AUTO_CONNECT` que mencionaban versiones
> previas. La conexión a Postgres es obligatoria al iniciar la API.

## Endpoints

Todos los endpoints cuelgan del prefijo `/api/v1` (configurable).

#### Salud
- `GET /api/v1` — estado del servicio y enlace a Swagger.

#### CRUD administrativo (NO protegido)

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET`    | `/dimensions`        | Lista paginada (`offset`, `limit`, `search`) |
| `POST`   | `/dimensions`        | Crea dimensión |
| `GET`    | `/dimensions/:id`    | Obtiene por id |
| `PATCH`  | `/dimensions/:id`    | Actualiza |
| `DELETE` | `/dimensions/:id`    | Borrado lógico |

Mismo patrón para `/answer-profiles`, `/answers`, `/questions`. Las preguntas
aceptan `dimensionId` opcional como filtro.

#### Flujo público

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET`  | `/evaluations/survey` | Catálogo público de la encuesta activa (sin `value` de las opciones) |
| `POST` | `/evaluations`        | Envío anónimo. Body: `{ "answers": [{ "questionId", "answerId" }] }` |
| `GET`  | `/evaluations/:id/results` | Puntaje bruto por dimensión (incluye dimensiones soft-deleted para preservar historial); `classification` siempre `null` |

## Validaciones de `POST /evaluations`

- IDs en formato UUID v4.
- Sin `questionId` duplicados en el array.
- Pregunta debe existir y estar activa (`isActive=true`).
- Opción debe existir y estar activa.
- La opción debe pertenecer al `answerProfile` de la pregunta.
- Todas las preguntas activas obligatorias (`isRequired=true`) cuya
  dimensión esté activa y NO soft-deleted deben tener respuesta.

Persistencia transaccional:

- 1 `Evaluation`
- N `QuestionAnswer` (uno por respuesta)
- 1 `EvaluationResult` por dimensión con respuestas

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
instancia real de Postgres. Si necesitas testear contra una DB real,
configura `DATABASE_URL` y levanta el servidor manualmente.

## Migraciones

Esta sección describe el estado **real** del soporte de migraciones,
no lo que la doc antigua afirmaba.

- Los archivos en `migrations/*.sql` son scripts sueltos pensados para
  aplicarse con `psql`. **No** están registrados en el `DataSource`
  de TypeORM ni son auto-descubiertos por `@nestjs/typeorm`.
- `DB_RUN_MIGRATIONS=true` **no ejecuta** esos SQL automáticamente
  (no hay `migrationsRun` apuntando a `migrations/*.sql` y no hay
  archivos `migrations/*.ts`). Está documentado en el código como
  "no implementado" para no crear un falso soporte.

Aplicar manualmente con:

```bash
psql "$DATABASE_URL" -f migrations/001-make-classification-nullable.sql
psql "$DATABASE_URL" -f migrations/002-add-answer-is-active.sql
```

Orden: ascendente. Cada uno es idempotente.

### Schema base

No existe un script "000-base-schema.sql" que cree las tablas desde
cero. Las opciones son:

1. **Habilitar `synchronize:true` SOLO en una DB de desarrollo**
   (`NODE_ENV=development`): TypeORM generará todas las tablas a
   partir de las entidades. PELIGROSO si se ejecuta contra una DB con
   datos: puede borrar columnas.
2. **Crear un `migrations/000-base-schema.sql`** que traduzca el
   modelo entidad a SQL y aplicarlo con `psql` (pendiente; ver
   `migrations/README.md`).

## Pendientes / decisiones

- **Auth**: no incluida. **CRÍTICO**: el CRUD catálogo está abierto,
  no publiques la API sin proteger antes esos endpoints.
- **Migraciones TypeORM**: no migradas a `migrations/*.ts`. Solo SQL.
- **Clasificación**: dominio no definido. La columna existe pero queda `NULL`.
- **`Evaluation.workplace`**: legacy, sin uso. Pendiente eliminar o poblar.
- **`synchronize:true`**: desactivado por defecto. Habilitar solo en desarrollo.
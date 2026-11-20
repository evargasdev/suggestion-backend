# ==========================================
# Etapa 1: Base con pnpm configurado
# ==========================================
FROM node:24.21.0-alpine3.24 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /usr/app

# ==========================================
# Etapa 2: Construcción (Build)
# ==========================================
FROM base AS builder

# Copiar manifiestos de dependencias
COPY package.json pnpm-lock.yaml* .pnpmrc* ./

# Instalar TODAS las dependencias (necesarias para compilar TypeScript/NestJS)
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --frozen-lockfile

# Copiar el código fuente y compilar
COPY . .
RUN pnpm run build

# Purgar devDependencies dejando solo producción lista para copiar
RUN pnpm prune --prod

# ==========================================
# Etapa 3: Imagen final de Producción
# ==========================================
FROM node:24.21.0-alpine3.24 AS production

ENV NODE_ENV=production

WORKDIR /usr/app

# Usar el usuario no-root incluido en la imagen oficial de Node
USER node

# Copiar únicamente lo necesario desde la etapa builder
COPY --from=builder --chown=node:node /usr/app/package.json ./
COPY --from=builder --chown=node:node /usr/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/app/dist ./dist

EXPOSE 3000

# Ejecutar directamente con Node (más rápido y limpia señales SIGTERM mejor que pnpm)
CMD ["node", "dist/main"]
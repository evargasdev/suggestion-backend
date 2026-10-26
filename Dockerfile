FROM node:24.21.0-alpine3.24

WORKDIR /usr/app

# Copiar archivos de dependencias y configuración
COPY package.json pnpm-lock.yaml* .pnpmrc* ./

# Habilitar corepack y fijar la versión de pnpm
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Instalar todas las dependencias (incluidas devDependencies)
# Usa --ignore-scripts por seguridad, pero si falla intenta sin ignorar
RUN pnpm install --ignore-scripts || pnpm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto de NestJS
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["pnpm", "run", "start:dev"]

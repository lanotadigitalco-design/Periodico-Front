# Etapa 1: Instalación de dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de gestión de paquetes
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm y dependencias
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Etapa 2: Build de la aplicación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Habilitar pnpm
RUN corepack enable pnpm

# Variables de entorno necesarias para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1

# Argumentos de build para variables públicas
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build de Next.js
RUN pnpm build

# Etapa 3: Producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

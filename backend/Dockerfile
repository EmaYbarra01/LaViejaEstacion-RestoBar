# Dockerfile para Backend - La Vieja Estación RestoBar
# Node.js 18 LTS Alpine (imagen ligera)

FROM node:18-alpine

# Metadatos
LABEL maintainer="Equipo La Vieja Estación <proyecto.laviejaestacion@gmail.com>"
LABEL description="Backend API REST para Sistema de Gestión Integral - La Vieja Estación RestoBar"
LABEL version="1.0.0"

# Directorio de trabajo
WORKDIR /app

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=4000

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p public/qr public/images logs

# Exponer puerto
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Comando de inicio
CMD ["npm", "start"]

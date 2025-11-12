# Dockerfile para Frontend - La Vieja Estación RestoBar
# Build stage con Node.js y producción con Nginx

# Stage 1: Build
FROM node:18-alpine AS builder

# Metadatos
LABEL maintainer="Equipo La Vieja Estación <proyecto.laviejaestacion@gmail.com>"
LABEL description="Frontend React para Sistema de Gestión Integral - La Vieja Estación RestoBar"
LABEL version="1.0.0"

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir aplicación para producción
RUN npm run build

# Stage 2: Producción con Nginx
FROM nginx:alpine

# Copiar archivos compilados del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecuta en primer plano por defecto
CMD ["nginx", "-g", "daemon off;"]

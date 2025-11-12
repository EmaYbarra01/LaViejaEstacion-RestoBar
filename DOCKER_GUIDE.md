# 🐳 Guía de Despliegue con Docker - La Vieja Estación RestoBar

## Sistema de Gestión Integral para Restaurantes

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Equipo:** Comisión 12 - UTN TUP

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos Previos](#2-requisitos-previos)
3. [Estructura de Contenedores](#3-estructura-de-contenedores)
4. [Instalación de Docker](#4-instalación-de-docker)
5. [Despliegue Rápido](#5-despliegue-rápido)
6. [Configuración Detallada](#6-configuración-detallada)
7. [Comandos Útiles](#7-comandos-útiles)
8. [Gestión de Volúmenes](#8-gestión-de-volúmenes)
9. [Variables de Entorno](#9-variables-de-entorno)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Introducción

### 1.1 ¿Por qué Docker?

Docker permite:
- ✅ **Portabilidad:** Ejecutar el sistema en cualquier máquina
- ✅ **Consistencia:** Mismo entorno en desarrollo y producción
- ✅ **Aislamiento:** Cada servicio en su propio contenedor
- ✅ **Facilidad:** Despliegue con un solo comando
- ✅ **Escalabilidad:** Fácil de escalar servicios individuales

### 1.2 Arquitectura de Contenedores

El sistema se despliega en **3 contenedores** independientes:

```
┌─────────────────┐
│   Frontend      │  Puerto 3000
│   (Nginx)       │  ◀── Interfaz web
└────────┬────────┘
         │
         │ HTTP/API
         ▼
┌─────────────────┐
│   Backend       │  Puerto 4000
│   (Node.js)     │  ◀── API REST
└────────┬────────┘
         │
         │ MongoDB
         ▼
┌─────────────────┐
│   MongoDB       │  Puerto 27017
│   (Database)    │  ◀── Base de datos
└─────────────────┘
```

---

## 2. Requisitos Previos

### 2.1 Software Necesario

| Software | Versión Mínima | Descarga |
|----------|----------------|----------|
| Docker Desktop | 20.10+ | [docker.com](https://www.docker.com/products/docker-desktop) |
| Docker Compose | 2.0+ | Incluido en Docker Desktop |
| Git | 2.0+ | [git-scm.com](https://git-scm.com/) |

### 2.2 Hardware Recomendado

- **CPU:** 2 núcleos o más
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Disco:** 2 GB libres
- **SO:** Windows 10/11, macOS, o Linux

### 2.3 Verificar Instalación

```bash
# Verificar versión de Docker
docker --version
# Debería mostrar: Docker version 20.10.x o superior

# Verificar versión de Docker Compose
docker-compose --version
# Debería mostrar: Docker Compose version 2.x.x o superior

# Verificar que Docker esté corriendo
docker ps
# Debería mostrar una lista vacía (si no hay contenedores corriendo)
```

---

## 3. Estructura de Contenedores

### 3.1 Servicios Definidos

El archivo `docker-compose.yml` define 3 servicios:

#### 📦 MongoDB (Base de Datos)
- **Imagen:** `mongo:8.0`
- **Puerto:** `27017:27017`
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Base de Datos:** `laviejaestacion`
- **Volumen:** Persistencia de datos

#### 🖥️ Backend (API REST)
- **Build:** `./backend/Dockerfile`
- **Puerto:** `4000:4000`
- **Dependencia:** MongoDB (espera a que esté saludable)
- **Variables:** Configuradas en docker-compose

#### 🌐 Frontend (Aplicación Web)
- **Build:** `./frontend/Dockerfile`
- **Puerto:** `3000:80`
- **Servidor:** Nginx
- **Dependencia:** Backend

### 3.2 Red y Comunicación

Todos los contenedores están en la red `laviejaestacion-network`:

```
frontend (3000) ──HTTP──▶ backend (4000) ──MongoDB──▶ mongodb (27017)
```

---

## 4. Instalación de Docker

### 4.1 Windows 10/11

1. Descargar [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop)
2. Ejecutar el instalador
3. Seguir el asistente de instalación
4. Reiniciar el equipo
5. Iniciar Docker Desktop
6. Verificar instalación en PowerShell:
   ```powershell
   docker --version
   ```

### 4.2 macOS

```bash
# Descargar e instalar Docker Desktop desde:
# https://www.docker.com/products/docker-desktop

# O con Homebrew:
brew install --cask docker
```

### 4.3 Linux (Ubuntu/Debian)

```bash
# Actualizar paquetes
sudo apt update

# Instalar dependencias
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Agregar repositorio
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker
```

---

## 5. Despliegue Rápido

### 5.1 Clonar Repositorio

```bash
git clone https://github.com/EmaYbarra01/LaViejaEstacion-RestoBar.git
cd LaViejaEstacion-RestoBar
```

### 5.2 Configurar Variables de Entorno (Opcional)

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores (opcional)
nano .env
```

**Valores por defecto funcionales incluidos en docker-compose.yml**

### 5.3 Construir y Levantar Contenedores

```bash
# Construir imágenes y levantar servicios
docker-compose up -d

# Ver logs mientras se construye
docker-compose logs -f
```

**Salida esperada:**
```
Creating network "laviejaestacion-network" ... done
Creating volume "laviejaestacion_mongodb_data" ... done
Creating laviejaestacion-mongodb ... done
Creating laviejaestacion-backend ... done
Creating laviejaestacion-frontend ... done
```

### 5.4 Verificar Estado

```bash
# Ver estado de contenedores
docker-compose ps

# Debería mostrar:
NAME                        STATUS          PORTS
laviejaestacion-mongodb     Up (healthy)    0.0.0.0:27017->27017/tcp
laviejaestacion-backend     Up (healthy)    0.0.0.0:4000->4000/tcp
laviejaestacion-frontend    Up (healthy)    0.0.0.0:3000->80/tcp
```

### 5.5 Acceder al Sistema

Una vez que todos los contenedores estén `Up` y `healthy`:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **MongoDB:** localhost:27017

---

## 6. Configuración Detallada

### 6.1 Personalizar Puertos

Si los puertos por defecto están ocupados, editar `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Cambiar 3000 por 8080
  
  backend:
    ports:
      - "5000:4000"  # Cambiar 4000 por 5000
  
  mongodb:
    ports:
      - "27018:27017"  # Cambiar 27017 por 27018
```

### 6.2 Configurar Email (Nodemailer)

Editar `docker-compose.yml` en la sección `backend`:

```yaml
backend:
  environment:
    EMAIL_USER: tu.email@gmail.com
    EMAIL_PASS: xxxx xxxx xxxx xxxx
    EMAIL_FROM: tu.email@gmail.com
```

### 6.3 Usar MongoDB Externo (MongoDB Atlas)

```yaml
backend:
  environment:
    MONGODB_URI: mongodb+srv://usuario:password@cluster.mongodb.net/laviejaestacion
```

Y comentar/eliminar el servicio `mongodb` de docker-compose.

---

## 7. Comandos Útiles

### 7.1 Gestión de Contenedores

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Detener servicios (sin eliminar contenedores)
docker-compose stop

# Iniciar servicios detenidos
docker-compose start

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores Y volúmenes
docker-compose down -v
```

### 7.2 Ver Estado

```bash
# Ver contenedores corriendo
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100

# Verificar salud de contenedores
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 7.3 Reconstruir Imágenes

```bash
# Reconstruir todas las imágenes
docker-compose build

# Reconstruir sin caché (limpio)
docker-compose build --no-cache

# Reconstruir un servicio específico
docker-compose build backend

# Reconstruir y levantar
docker-compose up -d --build
```

### 7.4 Ejecutar Comandos en Contenedores

```bash
# Bash en contenedor backend
docker-compose exec backend sh

# Bash en MongoDB
docker-compose exec mongodb mongosh

# Ejecutar comando sin entrar al contenedor
docker-compose exec backend npm run seed-menu

# Ver archivos en contenedor
docker-compose exec backend ls -la /app
```

---

## 8. Gestión de Volúmenes

### 8.1 Volúmenes Persistentes

Docker crea volúmenes para persistir datos:

```bash
# Listar volúmenes
docker volume ls

# Ver detalles de volumen MongoDB
docker volume inspect laviejaestacion_mongodb_data

# Ubicación en el host (Linux/Mac):
/var/lib/docker/volumes/laviejaestacion_mongodb_data/_data

# Ubicación en Windows:
\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\
```

### 8.2 Backup de Base de Datos

```bash
# Crear backup
docker-compose exec mongodb mongodump --out=/data/backup

# Copiar backup al host
docker cp laviejaestacion-mongodb:/data/backup ./mongodb-backup

# Comprimir backup
tar -czf mongodb-backup-$(date +%Y%m%d).tar.gz mongodb-backup/
```

### 8.3 Restaurar Backup

```bash
# Copiar backup al contenedor
docker cp ./mongodb-backup laviejaestacion-mongodb:/data/restore

# Restaurar
docker-compose exec mongodb mongorestore /data/restore
```

### 8.4 Limpiar Volúmenes

⚠️ **Precaución:** Esto eliminará todos los datos

```bash
# Detener y eliminar contenedores y volúmenes
docker-compose down -v

# Eliminar volumen específico
docker volume rm laviejaestacion_mongodb_data

# Eliminar todos los volúmenes no usados
docker volume prune
```

---

## 9. Variables de Entorno

### 9.1 Variables en docker-compose.yml

El archivo `docker-compose.yml` ya incluye variables configuradas:

```yaml
backend:
  environment:
    MONGODB_URI: mongodb://admin:admin123@mongodb:27017/laviejaestacion?authSource=admin
    PORT: 4000
    NODE_ENV: production
    JWT_SECRET: change_this_secret_in_production_use_strong_password
    EMAIL_USER: ${EMAIL_USER}
    EMAIL_PASS: ${EMAIL_PASS}
    EMAIL_FROM: ${EMAIL_FROM}
    FRONTEND_URL: http://localhost:3000
```

### 9.2 Archivo .env Externo

Crear `.env` en la raíz:

```env
# Email
EMAIL_USER=tu.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu.email@gmail.com

# Seguridad
JWT_SECRET=clave_super_segura_cambiar_esto

# Otros
NODE_ENV=production
```

Docker Compose cargará automáticamente este archivo.

### 9.3 Sobrescribir Variables

```bash
# Levantar con variables específicas
EMAIL_USER=otro@gmail.com docker-compose up -d

# Usar archivo .env alternativo
docker-compose --env-file .env.production up -d
```

---

## 10. Troubleshooting

### 10.1 Puerto Ya en Uso

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solución:**
```bash
# Opción 1: Cambiar puerto en docker-compose.yml
ports:
  - "8080:80"  # Cambiar 3000 por 8080

# Opción 2: Detener el proceso que usa el puerto
# En Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### 10.2 Contenedor No Arranca

**Ver logs detallados:**
```bash
docker-compose logs backend
docker-compose logs mongodb
```

**Reiniciar contenedor:**
```bash
docker-compose restart backend
```

**Reconstruir contenedor:**
```bash
docker-compose up -d --build backend
```

### 10.3 MongoDB No Conecta

**Verificar salud:**
```bash
docker-compose ps mongodb
# Debe mostrar "Up (healthy)"
```

**Ver logs:**
```bash
docker-compose logs mongodb
```

**Reiniciar MongoDB:**
```bash
docker-compose restart mongodb
```

**Verificar conexión:**
```bash
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### 10.4 Frontend No Carga

**Verificar que backend esté corriendo:**
```bash
curl http://localhost:4000/api/menu
```

**Verificar configuración de Nginx:**
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

**Ver logs de Nginx:**
```bash
docker-compose logs frontend
```

### 10.5 Espacio en Disco Lleno

```bash
# Ver uso de disco
docker system df

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar contenedores detenidos
docker container prune

# Limpiar todo (cuidado!)
docker system prune -a --volumes
```

### 10.6 Permisos en Linux

Si tienes errores de permisos:

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o:
newgrp docker

# Cambiar permisos de carpetas
sudo chown -R $USER:$USER .
```

---

## 11. Producción

### 11.1 Buenas Prácticas

1. **Cambiar secretos:**
   ```yaml
   JWT_SECRET: usar_clave_aleatoria_segura_de_64_caracteres
   ```

2. **Usar HTTPS:**
   - Configurar reverse proxy (Nginx/Traefik)
   - Obtener certificado SSL (Let's Encrypt)

3. **Limitar recursos:**
   ```yaml
   backend:
     deploy:
       resources:
         limits:
           cpus: '1'
           memory: 512M
   ```

4. **Habilitar logs:**
   ```yaml
   backend:
     logging:
       driver: "json-file"
       options:
         max-size: "10m"
         max-file: "3"
   ```

### 11.2 Docker Compose para Producción

Crear `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

**Usar:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 12. Comandos Rápidos Referencia

```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down

# Reiniciar
docker-compose restart

# Ver estado
docker-compose ps

# Reconstruir
docker-compose up -d --build

# Limpiar todo
docker-compose down -v
docker system prune -a

# Backup MongoDB
docker-compose exec mongodb mongodump --out=/backup

# Acceder a MongoDB shell
docker-compose exec mongodb mongosh
```

---

## Conclusión

Con Docker, el despliegue del sistema "La Vieja Estación RestoBar" se simplifica a un solo comando. Esta guía cubre desde la instalación básica hasta configuraciones avanzadas de producción.

**¿Listo para comenzar?**

```bash
docker-compose up -d
```

🎉 **¡Sistema levantado y listo para usar!**

Accede a: **http://localhost:3000**

---

**Guía de Despliegue con Docker - Versión 1.0.0**  
**La Vieja Estación RestoBar**  
**UTN - Tecnicatura Universitaria en Programación**  
**Noviembre 2025**

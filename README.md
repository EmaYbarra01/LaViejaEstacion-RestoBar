# 🍽️ Sistema de Gestión Integral - La Vieja Estación RestoBar

<div align="center">

![Logo La Vieja Estación](frontend/public/logo.png)

**Sistema completo de gestión para restaurantes y bares**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green.svg)](https://www.mongodb.com/)

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Módulos](#-módulos)
- [Documentación](#-documentación)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Equipo](#-equipo)
- [Licencia](#-licencia)

---

## 📖 Descripción

**La Vieja Estación RestoBar** es un sistema integral de gestión desarrollado como Trabajo Final Integrador (TFI) de la Tecnicatura Universitaria en Programación - UTN FRT.

El sistema digitaliza y automatiza todos los procesos operativos de un restaurante/bar, desde la toma de pedidos hasta el control de inventario, gestión de empleados y generación de reportes.

### 🎯 Problema que Resuelve

Los procesos manuales tradicionales provocan:
- ❌ Errores en cálculos y toma de pedidos
- ⏱️ Pérdidas de tiempo en atención
- 📉 Falta de control de stock
- 📊 Dificultad para tomar decisiones basadas en datos
- 💸 Cierres de caja lentos y propensos a errores

### ✨ Solución

Sistema web integral que permite:
- ✅ Gestión de pedidos en tiempo real (POS)
- ✅ Control automático de inventario
- ✅ Administración de mesas y reservas
- ✅ Gestión de empleados y turnos
- ✅ Reportes y análisis de ventas
- ✅ Menú digital con códigos QR

---

## 🚀 Características

### 📱 Menú Digital con QR
- Escaneo de código QR desde mesa
- Vista optimizada para móviles
- Actualización automática de precios
- Organización por categorías

### 🧾 Sistema POS
- Toma rápida de pedidos
- División de cuentas
- Múltiples métodos de pago
- Generación de tickets PDF
- Descuentos y promociones

### 🍽️ Gestión de Mesas
- Control de estados (libre, ocupada, reservada)
- Sistema de reservas
- Asignación de mozos
- Historial de ocupación

### 📦 Control de Inventario
- Registro de productos y stock
- Actualización automática en ventas
- Alertas de stock mínimo
- Gestión de proveedores

### 👥 Gestión de Personal
- Usuarios con roles diferenciados
- Control de turnos y horarios
- Registro de actividades
- Permisos personalizados

### 📊 Reportes y Análisis
- Ventas por período
- Productos más vendidos
- Rendimiento por empleado
- Cierre de caja automatizado
- Flujo de efectivo

---

## 🛠️ Tecnologías

### Backend
- **Node.js** v18+ - Entorno de ejecución
- **Express.js** v5 - Framework web
- **MongoDB** v8 - Base de datos NoSQL
- **Mongoose** v8 - ODM para MongoDB
- **JWT** - Autenticación y autorización
- **bcryptjs** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **QRCode** - Generación de códigos QR
- **Socket.io** - Comunicación en tiempo real

### Frontend
- **React** v19 - Biblioteca UI
- **Vite** v6 - Build tool
- **React Router** v7 - Enrutamiento
- **Zustand** v5 - Gestión de estado
- **Axios** - Cliente HTTP
- **React Hook Form** - Formularios
- **TailwindCSS** v4 - Estilos
- **React Bootstrap** - Componentes UI
- **SweetAlert2** - Alertas
- **jsPDF** - Generación de PDFs

### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

---

## 📋 Requisitos

### Software Necesario
- **Node.js** v18 o superior
- **npm** v9 o superior
- **MongoDB** v8 o superior (local o Atlas)
- **Docker** (opcional, para contenedores)
- **Git** (para clonar el repositorio)

### Hardware Recomendado
- **CPU:** 2 núcleos o más
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Disco:** 500 MB libres
- **Red:** Conexión a internet estable

---

## 🔧 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/EmaYbarra01/LaViejaEstacion-RestoBar.git
cd LaViejaEstacion-RestoBar
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

### 4. Configurar Variables de Entorno

#### Backend

Crear archivo `.env` en la carpeta `backend`:

```env
# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/laviejaestacion

# Puerto del servidor
PORT=4000

# JWT Secret
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion

# Configuración de Email (Nodemailer con Gmail)
EMAIL_USER=tu.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu.email@gmail.com

# URL del Frontend (para CORS y emails)
FRONTEND_URL=http://localhost:5173

# Entorno
NODE_ENV=development
```

#### Frontend

Crear archivo `.env` en la carpeta `frontend`:

```env
# URL del backend
VITE_API_URL=http://localhost:4000/api
```

### 5. Inicializar Base de Datos

```bash
cd backend
npm run init-db
```

### 6. Poblar con Datos de Ejemplo (Opcional)

```bash
npm run seed-menu
```

---

## 🎮 Uso

### Iniciar el Sistema

#### Opción 1: Manual (Dos Terminales)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Servidor corriendo en: `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Aplicación corriendo en: `http://localhost:5173`

#### Opción 2: Con Docker (Recomendado)

```bash
docker-compose up -d
```

### Credenciales por Defecto

**Administrador:**
- Email: `admin@laviejaestacion.com`
- Contraseña: `Admin123!`

**Gerente:**
- Email: `gerente@laviejaestacion.com`
- Contraseña: `Gerente123!`

**Mozo:**
- Email: `mozo@laviejaestacion.com`
- Contraseña: `Mozo123!`

**Cajero:**
- Email: `cajero@laviejaestacion.com`
- Contraseña: `Cajero123!`

---

## 🏗️ Arquitectura

### Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  Pages  │  │Components│  │  Store  │  │  Routes │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js/Express)              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │  Routes │  │Controllers│ │  Models │  │   Auth  │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (MongoDB)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Usuarios │ Productos │ Pedidos │ Ventas │ ...  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Estructura del Proyecto

```
LaViejaEstacion-RestoBar/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── models/            # Modelos de Mongoose
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Endpoints de la API
│   │   ├── auth/              # Autenticación JWT
│   │   ├── config/            # Configuraciones
│   │   ├── helpers/           # Funciones auxiliares
│   │   └── database/          # Conexión a BD
│   ├── scripts/               # Scripts de inicialización
│   ├── public/                # Archivos estáticos
│   ├── .env                   # Variables de entorno
│   └── index.js               # Punto de entrada
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── pages/             # Páginas/Vistas
│   │   ├── components/        # Componentes reutilizables
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── routes/            # Configuración de rutas
│   │   ├── api/               # Servicios API
│   │   ├── utils/             # Utilidades
│   │   └── assets/            # Imágenes, iconos, etc.
│   ├── docs/                  # Documentación
│   ├── public/                # Archivos públicos
│   └── .env                   # Variables de entorno
│
├── docker-compose.yml          # Orquestación Docker
├── Dockerfile                  # Imagen Docker backend
└── README.md                   # Este archivo
```

---

## 📦 Módulos

### 1. Autenticación y Usuarios (HU1)
- Registro e inicio de sesión
- Recuperación de contraseña
- Roles: Admin, Gerente, Mozo, Cajero, Cocina
- Gestión de permisos

### 2. Menú Digital con QR (HU1)
- Generación de códigos QR por mesa
- Vista pública del menú
- Actualización en tiempo real
- Responsive design

### 3. Gestión de Productos (HU2)
- CRUD completo de productos
- Categorías y subcategorías
- Control de disponibilidad
- Imágenes y descripciones

### 4. Sistema POS / Pedidos (HU3-HU4)
- Toma de pedidos por mesa
- Asignación a cocina
- Estados de pedido
- Notificaciones en tiempo real

### 5. Gestión de Mesas (HU5-HU6)
- CRUD de mesas
- Estados y disponibilidad
- Sistema de reservas
- Asignación de mozos

### 6. Inventario y Compras (HU7-HU8)
- Control de stock
- Gestión de proveedores
- Registro de compras
- Actualización automática

### 7. Reportes y Cierre de Caja (HU9-HU10)
- Ventas por período
- Productos más vendidos
- Cierre de caja
- Flujo de efectivo
- Exportación a PDF

---

## 📚 Documentación

### Documentación Técnica
- [📖 Acta de Constitución del Proyecto](frontend/docs/acta_constitucion_proyecto.md)
- [🔧 Instalación Detallada](frontend/docs/instalacion.md)
- [📘 Manual de Usuario](frontend/docs/manual_usuario.md)
- [🔌 Documentación de API](RUTAS_API.md)
- [🗄️ Configuración de Base de Datos](DB_SETUP.md)

### Documentación de Historias de Usuario
- [HU1 - Menú Digital](HU1_MENU_DIGITAL.md)
- [HU2 - Gestión de Productos](HU2_DOCUMENTACION.md)
- [HU3-HU4 - Sistema POS](RESUMEN-HU3-HU4.md)
- [HU5-HU6 - Gestión de Mesas](IMPLEMENTACION_HU5_HU6.md)
- [HU7-HU8 - Inventario](IMPLEMENTACION_HU7_HU8.md)

### Guías de Desarrollo
- [🚀 Quick Start](QUICK_START.md)
- [🔐 Recuperación de Contraseña](PASSWORD_RECOVERY_API.md)
- [🧪 Testing](TESTING_DOCS.md)
- [🐳 Despliegue con Docker](HU1_DEPLOY_GUIDE.md)

---

## 🧪 Testing

### Ejecutar Tests del Backend

```bash
cd backend
npm test
```

### Ejecutar Tests con Coverage

```bash
npm run test:coverage
```

### Tests Disponibles
- ✅ Tests unitarios de controladores
- ✅ Tests de integración de endpoints
- ✅ Tests de autenticación
- ✅ Tests de validación de datos

---

## 🚀 Despliegue

### Despliegue con Docker

```bash
# Construir y levantar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down
```

### Despliegue en Producción

#### Backend (Railway/Render)
1. Crear cuenta en Railway/Render
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Deploy automático

#### Frontend (Vercel/Netlify)
1. Crear cuenta en Vercel/Netlify
2. Importar repositorio
3. Configurar build command: `npm run build`
4. Deploy automático

Ver guía completa: [HU1_DEPLOY_GUIDE.md](HU1_DEPLOY_GUIDE.md)

---

## 👥 Equipo

**Tecnicatura Universitaria en Programación - UTN FRT**  
**Comisión 12 - Año 2025**

| Nombre | Rol | Legajo |
|--------|-----|--------|
| **Ybarra, Carlos Emanuel** | Product Owner | 62181 |
| **Argüello, Silvia Patricia** | Scrum Master | 61998 |
| **De la Cruz, Cristian Germán** | Developer | 62070 |
| **Sanagua, Benjamín Edgardo** | Developer | 62417 |

### Roles Técnicos
- **Full Stack Developers:** Todo el equipo
- **Frontend Lead:** Ybarra, Carlos Emanuel
- **Backend Lead:** De la Cruz, Cristian Germán
- **Database Design:** Argüello, Silvia Patricia
- **DevOps:** Sanagua, Benjamín Edgardo

---

## 📞 Contacto

- **Email:** proyecto.laviejaestacion@gmail.com
- **GitHub:** [EmaYbarra01/LaViejaEstacion-RestoBar](https://github.com/EmaYbarra01/LaViejaEstacion-RestoBar)
- **Universidad:** UTN - Facultad Regional Tucumán

---

## 📄 Licencia

Este proyecto fue desarrollado como Trabajo Final Integrador para la Tecnicatura Universitaria en Programación de la UTN.

**Copyright © 2025 - Equipo La Vieja Estación**

---

## 🙏 Agradecimientos

- UTN - Facultad Regional Tucumán
- Profesores de la Tecnicatura en Programación
- Jaqueline Valdivieso (Cliente - La Vieja Estación)
- Comunidad de desarrolladores Open Source

---

## 📈 Estado del Proyecto

![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![Completitud](https://img.shields.io/badge/Completitud-85%25-green)

### Historial de Versiones

- **v1.0.0** (Noviembre 2025) - Lanzamiento inicial
  - Menú digital con QR
  - Sistema POS básico
  - Gestión de mesas
  - Control de inventario
  - Reportes básicos

### Roadmap Futuro

- [ ] Integración con AFIP (facturación electrónica)
- [ ] Aplicación móvil nativa
- [ ] Sistema de delivery
- [ ] Programa de fidelización de clientes
- [ ] Integración con redes sociales
- [ ] Dashboard analytics avanzado

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**

[⬆ Volver arriba](#-sistema-de-gestión-integral---la-vieja-estación-restobar)

</div>

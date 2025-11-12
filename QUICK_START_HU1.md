# 🚀 Quick Start - HU1: Menú Digital

## Instalación Rápida

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install
npm install qrcode

# Frontend (en otra terminal)
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

Crear `backend/.env`:

```env
MONGODB_URI=tu_connection_string_mongodb
PORT=4000
JWT_SECRET=tu_secret_key
```

### 3. Poblar Base de Datos

```bash
cd backend
node scripts/seedMenuData.js
```

Esto creará 34 productos de ejemplo en MongoDB.

### 4. Generar Códigos QR

```bash
cd backend
node scripts/generarQR.js
```

Los QR se guardarán en `backend/public/qr/`.

### 5. Iniciar Servidores

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 6. Probar

**Endpoint API:**
```
http://localhost:4000/api/menu
```

**Menú Digital:**
```
http://localhost:5173/menu-digital
```

**Con número de mesa:**
```
http://localhost:5173/menu-digital?mesa=5
```

## 📱 Usar el QR

1. Abrir `backend/public/qr/menu-qr.png`
2. Escanear con la cámara del teléfono
3. Se abrirá el menú digital automáticamente

## ✅ Verificación

- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 5173
- [ ] Base de datos poblada con productos
- [ ] QR generado en `backend/public/qr/`
- [ ] Menú digital accesible y mostrando productos

## 📚 Documentación Completa

Ver [HU1_MENU_DIGITAL.md](./HU1_MENU_DIGITAL.md) para documentación detallada.

---

**Implementación HU1 - Menú Digital QR**  
La Vieja Estación RestoBar

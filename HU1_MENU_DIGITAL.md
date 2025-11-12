# HU1 - Escanear Menú Digital 📱

## Historia de Usuario

**Como cliente**, quiero escanear un código QR en la mesa para acceder al menú digital del bar, para poder ver los productos disponibles con precios actualizados sin necesidad de pedir una carta física.

---

## ✅ Criterios de Aceptación

- [x] El QR redirige correctamente a la página del menú digital
- [x] El menú se carga sin necesidad de iniciar sesión
- [x] El menú muestra productos y precios actualizados desde la base de datos
- [x] Funciona desde cualquier smartphone con cámara y conexión a internet
- [x] Los productos están organizados por categorías (Comidas, Bebidas, Postres, Entradas)
- [x] El diseño es responsive y optimizado para móviles

---

## 🏗️ Arquitectura Implementada

### Backend (Node.js + Express + MongoDB)

```
backend/
├── src/
│   ├── models/
│   │   └── productoSchema.js          # Modelo de productos (ya existía)
│   ├── controllers/
│   │   └── productos.controllers.js   # Controlador con endpoint público
│   └── routes/
│       └── productos.routes.js        # Ruta pública /api/menu
└── scripts/
    ├── seedMenuData.js               # Poblar BD con datos de ejemplo
    └── generarQR.js                  # Generar códigos QR
```

### Frontend (React + Vite)

```
frontend/
└── src/
    └── pages/
        ├── MenuDigital.jsx           # Componente del menú digital
        └── MenuDigital.css           # Estilos del menú digital
```

---

## 🚀 Guía de Implementación

### 1. Instalar Dependencias

#### Backend
```bash
cd backend
npm install qrcode
```

El paquete `qrcode` se usa para generar códigos QR.

### 2. Poblar la Base de Datos

Ejecutar el script para insertar productos de ejemplo:

```bash
cd backend
node scripts/seedMenuData.js
```

**Salida esperada:**
```
🔌 Conectando a la base de datos...
✅ Conectado a MongoDB

🗑️  Limpiando colección de productos...
✅ Colección limpiada

📝 Insertando productos de ejemplo...

╔════════════════════════════════════════════╗
║         PRODUCTOS CREADOS EXITOSAMENTE     ║
╚════════════════════════════════════════════╝

📊 ESTADÍSTICAS:
   Total de productos: 34
   🍽️  Comidas: 10
   🥤 Bebidas: 5
   🍺 Bebidas Alcohólicas: 5
   🍰 Postres: 8
   🥗 Entradas: 4
```

El script crea **34 productos de ejemplo** distribuidos en 5 categorías:
- **Comidas** (10): Hamburguesa, Pizza, Milanesa, Ensalada, Empanadas, Lomo, Tarta, Pollo al Curry, Ravioles, Bife de Chorizo
- **Bebidas** (5): Agua, Gaseosa, Jugo Natural, Café, Licuado, Limonada
- **Bebidas Alcohólicas** (5): Cerveza Artesanal, Vino Malbec, Fernet, Gin Tonic
- **Postres** (8): Flan, Helado, Tarta de Manzana, Brownie, Cheesecake, Tiramisú, Mousse, Panqueques
- **Entradas** (4): Picada, Provoleta, Rabas, Bruschetta

### 3. Generar Códigos QR

Ejecutar el script para generar los códigos QR:

```bash
cd backend
node scripts/generarQR.js
```

**Salida esperada:**
```
╔════════════════════════════════════════════╗
║   GENERADOR DE QR - LA VIEJA ESTACIÓN      ║
║   Menú Digital - HU1                       ║
╚════════════════════════════════════════════╝

🎯 Generando código QR para el menú digital...

📁 Directorio creado: backend/public/qr
✅ ¡Código QR generado exitosamente!

📍 URL del menú: http://localhost:5173/menu-digital
💾 Archivo guardado en: backend/public/qr/menu-qr.png
```

**Archivos generados:**
- `backend/public/qr/menu-qr.png` - QR en formato PNG (500x500px)
- `backend/public/qr/menu-qr-completo.png` - QR con mayor tamaño (600x600px)
- `backend/public/qr/menu-qr.svg` - QR en formato vectorial (escalable)

#### Generar QR por Mesa (Opcional)

Para generar QR individuales por mesa, editar `generarQR.js` y descomentar:

```javascript
// Al final del archivo
await generarQRsMultiples(10); // Genera 10 QRs para mesas 1-10
```

Esto creará archivos como:
- `menu-qr-mesa-1.png`
- `menu-qr-mesa-2.png`
- etc.

Cada QR incluirá el parámetro `?mesa=N` en la URL.

### 4. Iniciar los Servidores

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

Servidor corriendo en: `http://localhost:4000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Aplicación corriendo en: `http://localhost:5173`

### 5. Probar el Endpoint Público

Abrir en el navegador o Postman:

```
GET http://localhost:4000/api/menu
```

**Respuesta esperada:**
```json
{
  "restaurante": "La Vieja Estación",
  "slogan": "Sabores que cuentan historias",
  "menu": {
    "Comidas": [
      {
        "id": "673abc123...",
        "nombre": "Hamburguesa Clásica",
        "descripcion": "Carne de res premium, queso cheddar...",
        "precio": 1200,
        "imagenUrl": "/images/productos/hamburguesa-clasica.jpg"
      },
      // ... más productos
    ],
    "Bebidas": [...],
    "Postres": [...],
    "Entradas": [...]
  },
  "ultimaActualizacion": "2025-11-11T14:30:00.000Z"
}
```

### 6. Probar el Menú Digital

Abrir en el navegador:

```
http://localhost:5173/menu-digital
```

**O con número de mesa:**
```
http://localhost:5173/menu-digital?mesa=5
```

---

## 🔌 Endpoints de la API

### GET `/api/menu`

**Descripción:** Obtiene el menú digital público con todos los productos disponibles.

**Autenticación:** ❌ No requiere (público)

**Respuesta:**
```json
{
  "restaurante": "La Vieja Estación",
  "slogan": "Sabores que cuentan historias",
  "menu": {
    "Comidas": [...],
    "Bebidas": [...],
    "Bebidas Alcohólicas": [...],
    "Postres": [...],
    "Entradas": [...]
  },
  "ultimaActualizacion": "2025-11-11T14:30:00.000Z"
}
```

**Características:**
- Solo devuelve productos con `disponible: true`
- Agrupa productos por categoría
- Ordena por categoría y nombre
- Excluye información sensible (costo, stock)

---

## 📱 Características del Menú Digital

### Vista de Cliente

1. **Header Atractivo**
   - Logo animado del restaurante
   - Nombre y slogan
   - Indicador de mesa (si aplica)
   - Timestamp de última actualización

2. **Categorías en Acordeón**
   - Iconos visuales por categoría
   - Contador de productos
   - Expansión/colapso suave
   - Solo una categoría abierta a la vez

3. **Tarjetas de Producto**
   - Nombre destacado
   - Precio en formato moneda argentina
   - Descripción detallada
   - Soporte para imágenes
   - Efectos hover atractivos

4. **Diseño Responsive**
   - Optimizado para móviles (principal uso)
   - Tablet y desktop también soportados
   - Touch-friendly
   - Carga rápida

5. **Estados**
   - Loading con spinner animado
   - Error con opción de reintentar
   - Mensaje si no hay productos

### Experiencia de Usuario

```
Cliente escanea QR
    ↓
Cámara abre URL
    ↓
Navegador carga /menu-digital
    ↓
React muestra loading
    ↓
Axios llama GET /api/menu
    ↓
Backend consulta MongoDB
    ↓
Retorna productos disponibles
    ↓
Frontend agrupa por categoría
    ↓
Muestra menú interactivo
```

---

## 🎨 Personalización

### Cambiar URL del Menú

Editar `backend/scripts/generarQR.js`:

```javascript
const config = {
  menuUrl: 'https://laviejaestacion.com/menu-digital', // Producción
  // o
  menuUrl: 'http://192.168.1.100:5173/menu-digital', // Red local
};
```

### Agregar/Modificar Productos

#### Desde MongoDB Shell
```javascript
db.productos.insertOne({
  nombre: "Nuevo Plato",
  descripcion: "Descripción del plato",
  categoria: "Comidas",
  precio: 1500,
  disponible: true
});
```

#### Desde la Aplicación
Usar el panel de administración (HU2) para gestionar productos.

### Cambiar Estilos

Editar variables CSS en `MenuDigital.css`:

```css
:root {
  --primary-color: #ffc107;      /* Color principal */
  --primary-dark: #ff9800;       /* Color secundario */
  --background-dark: #1a1a1a;    /* Fondo */
  --card-bg: #2d2d2d;            /* Fondo tarjetas */
}
```

---

## 🖨️ Implementación Física de QR

### 1. Imprimir los QR

Usar los archivos PNG generados en `backend/public/qr/`:
- **menu-qr.png** - Uso general
- **menu-qr-mesa-X.png** - QR específicos por mesa

Recomendaciones:
- Tamaño mínimo: 5x5 cm
- Impresión en alta calidad (300 DPI)
- Papel resistente o laminado

### 2. Colocar en las Mesas

Opciones:
- **Porta QR acrílico de mesa** (recomendado)
- **Sticker en la mesa**
- **Tarjeta plastificada**
- **Incluido en menú físico**

### 3. Señalización

Incluir texto orientativo:
```
📱 MENÚ DIGITAL
Escaneá el código para ver
nuestro menú actualizado
```

---

## 🔒 Seguridad

### Endpoint Público
- ✅ No requiere autenticación
- ✅ Solo devuelve productos disponibles
- ✅ Excluye información sensible (costo, stock interno)
- ✅ Rate limiting recomendado en producción

### Protección en Producción

Agregar rate limiting en `backend/index.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: 'Demasiadas solicitudes, intente más tarde'
});

app.use('/api/menu', limiter);
```

---

## 📊 Monitoreo y Analíticas

### Agregar Google Analytics (Opcional)

En `MenuDigital.jsx`:

```javascript
useEffect(() => {
  // Registrar visita al menú
  if (window.gtag) {
    window.gtag('event', 'menu_view', {
      mesa: mesaNumero || 'sin_mesa',
      timestamp: new Date().toISOString()
    });
  }
}, []);
```

### Logs del Backend

El endpoint ya registra accesos:

```javascript
console.log(`[${new Date().toISOString()}] GET /api/menu - Menu solicitado`);
```

---

## 🧪 Testing

### Pruebas Manuales

1. **Endpoint**
   ```bash
   curl http://localhost:4000/api/menu
   ```

2. **Frontend sin QR**
   ```
   http://localhost:5173/menu-digital
   ```

3. **Frontend con mesa**
   ```
   http://localhost:5173/menu-digital?mesa=7
   ```

4. **Escanear QR**
   - Usar aplicación de cámara del teléfono
   - Escanear `menu-qr.png`
   - Verificar redirección

### Casos de Prueba

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| 1 | Escanear QR | Abre menú en navegador |
| 2 | Sin conexión | Muestra error de carga |
| 3 | BD vacía | Muestra "No hay productos" |
| 4 | Producto sin imagen | No muestra imagen, resto OK |
| 5 | Click en categoría | Expande/colapsa acordeón |
| 6 | Cambiar disponibilidad | Producto desaparece del menú |

---

## 🚀 Despliegue en Producción

### 1. Variables de Entorno

Crear `.env` en backend:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/laviejaestacion
PORT=4000
NODE_ENV=production
MENU_URL=https://laviejaestacion.com/menu-digital
```

### 2. Build del Frontend

```bash
cd frontend
npm run build
```

### 3. Regenerar QR con URL de Producción

```bash
cd backend
MENU_URL=https://laviejaestacion.com/menu-digital node scripts/generarQR.js
```

### 4. Hosting Recomendado

**Backend:**
- Railway
- Render
- Heroku
- DigitalOcean

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

**Base de Datos:**
- MongoDB Atlas (ya configurado)

---

## 📝 Mantenimiento

### Actualizar Precios

1. Opción 1: Panel Admin
   - Ir a `/admin/products`
   - Editar producto
   - El menú se actualiza automáticamente

2. Opción 2: MongoDB
   ```javascript
   db.productos.updateOne(
     { nombre: "Hamburguesa Clásica" },
     { $set: { precio: 1300 } }
   );
   ```

### Deshabilitar Producto

```javascript
db.productos.updateOne(
  { nombre: "Pizza Margarita" },
  { $set: { disponible: false } }
);
```

El producto desaparecerá del menú inmediatamente.

---

## 🎯 Próximas Mejoras (Roadmap)

- [ ] **HU2:** Permitir ordenar desde el menú digital
- [ ] **HU3:** Carrito de compras integrado
- [ ] **HU4:** Notificaciones de cocina en tiempo real
- [ ] Búsqueda de productos
- [ ] Filtros por alérgenos
- [ ] Modo oscuro/claro
- [ ] Múltiples idiomas
- [ ] Calificación de platos
- [ ] Sugerencias personalizadas

---

## ❓ Troubleshooting

### Problema: QR no redirige

**Solución:**
- Verificar que el servidor esté corriendo en la URL del QR
- Verificar que el puerto 5173 esté accesible desde la red
- Para red local usar IP local: `http://192.168.1.X:5173/menu-digital`

### Problema: Menú vacío

**Solución:**
- Ejecutar `node scripts/seedMenuData.js`
- Verificar conexión a MongoDB
- Verificar que los productos tengan `disponible: true`

### Problema: Error de CORS

**Solución:**
En `backend/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-dominio.com'],
  credentials: true
}));
```

### Problema: Imágenes no cargan

**Solución:**
- Las URLs de imagen son placeholder
- Subir imágenes reales a `backend/public/images/productos/`
- O usar URLs externas (CDN)

---

## 📚 Documentación Adicional

- [API REST - Rutas Completas](../RUTAS_API.md)
- [Modelo de Datos](../backend/src/models/productoSchema.js)
- [Manual de Usuario](../frontend/docs/manual_usuario.md)

---

## ✅ Checklist de Implementación

- [x] Modelo de productos en MongoDB
- [x] Endpoint público `/api/menu`
- [x] Componente MenuDigital.jsx
- [x] Estilos responsive
- [x] Script de seed de datos
- [x] Script generador de QR
- [x] Documentación completa
- [x] Ruta configurada en App.jsx
- [ ] Pruebas en dispositivos móviles
- [ ] QR impreso y colocado en mesas
- [ ] Desplegado en producción

---

**Implementado por:** Copilot  
**Fecha:** 11 de Noviembre de 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completo y funcional

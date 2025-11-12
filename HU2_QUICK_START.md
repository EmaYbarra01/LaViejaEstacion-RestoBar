# 🚀 HU2 - Quick Start Guide

## ✅ Estado Actual

**Todos los errores corregidos:**
- ✅ `seedMenuData.js` - Código duplicado eliminado
- ✅ `MenuDigital.jsx` - Etiqueta `</div>` faltante agregada
- ✅ `ProductoCard.jsx` - Sin errores
- ✅ `menuStore.js` - Sin errores
- ✅ Base de datos poblada con 32 productos

---

## 📊 Base de Datos Poblada

**Productos creados exitosamente:**
- 🍽️ **Comidas:** 10 productos
- 🥤 **Bebidas:** 6 productos
- 🍺 **Bebidas Alcohólicas:** 4 productos
- 🍰 **Postres:** 8 productos
- 🥗 **Entradas:** 4 productos

**Total:** 32 productos con imágenes

---

## 🖼️ Productos con Imágenes Reales

| Producto | Imagen |
|----------|--------|
| Hamburguesa Completa | `hamburguesa completa.jpg` |
| Pizza Muzzarella | `pizza muzzarella.jpg` |
| Milanesa Napolitana | `milanesa napolitana.jpg` |
| Ensalada César | `ensalada cesar.jpg` |
| Cerveza Quilmes 1L | `cerveza quilmes 1L.jpg` |
| Vino Tinto Copa | `vino tinto copa.jpg` |
| Vino Blanco Copa | `vino blanco copa.jpg` |
| Agua Mineral 500ml | `agua mineral 500ml.jpg` |
| Coca Cola 500ml | `coca cola 500.jpg` |
| Helado 3 Bochas | `helado 3 bochas.jpg` |
| Flan con Dulce de Leche | `flan con dulce de leche.jpg` |

---

## 🚀 Iniciar Aplicación

### 1. Backend
```powershell
cd backend
npm start
```

**Esperado:**
```
🚀 Servidor escuchando en http://localhost:4000
✅ Conectado a MongoDB
```

### 2. Frontend
```powershell
# En otra terminal
cd frontend
npm run dev
```

**Esperado:**
```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Verificar Implementación

### 1. Verificar API Backend
```powershell
# Obtener menú completo
curl http://localhost:4000/api/menu
```

**Esperado:** JSON con categorías y productos

### 2. Abrir Menú Digital
```
http://localhost:5173/menu-digital
```

**Verificar:**
- ✅ Header con logo "La Vieja Estación"
- ✅ Toolbar con botón "Actualizar" y alternador de vistas
- ✅ Categorías expandibles (vista acordeón)
- ✅ Productos con imágenes, nombre, precio y descripción
- ✅ Productos sin imagen muestran icono 🍴
- ✅ Hover en tarjetas muestra efecto de elevación
- ✅ Precio formateado en ARS ($1.200)

### 3. Probar Vistas

**Vista Categorías (Acordeón):**
1. Click en "Categorías" en el toolbar
2. Expandir/colapsar categorías haciendo click
3. Verificar que solo una categoría esté abierta a la vez

**Vista Grid (Todo):**
1. Click en "Todo" en el toolbar
2. Seleccionar categoría en los tabs superiores
3. Verificar que se muestren todos los productos de la categoría

### 4. Probar con Mesa
```
http://localhost:5173/menu-digital?mesa=5
```

Verificar que aparece badge "Mesa 5" en el header.

---

## 📱 Prueba con QR (Smartphone)

### 1. Ver QR Generado
```
http://localhost:4000/qr-viewer.html
```

### 2. Escanear con Smartphone
- Abrir cámara del teléfono
- Apuntar al QR en pantalla
- Tocar la notificación
- Verificar que abre el menú digital

---

## 🎨 Características Implementadas

### Backend
- ✅ Endpoint público `/api/menu` sin autenticación
- ✅ Productos agrupados por categoría
- ✅ URLs de imágenes incluidas en respuesta
- ✅ Archivos estáticos servidos desde `/images/productos/`

### Frontend
- ✅ **Store de Zustand** para estado global del menú
- ✅ **Componente ProductoCard** reutilizable
- ✅ **Lazy loading** de imágenes
- ✅ **Skeleton loader** mientras cargan imágenes
- ✅ **Dos vistas:** Acordeón y Grid
- ✅ **Navegación por tabs** entre categorías
- ✅ **Botón actualizar** para refrescar menú
- ✅ **Responsive design** (desktop, tablet, mobile)
- ✅ **Error handling** con mensajes claros

---

## 🔧 Troubleshooting Rápido

### Problema: Imágenes no cargan
```powershell
# Verificar que el backend sirva archivos estáticos
# Revisar backend/index.js debe tener:
app.use(express.static('public'));

# Verificar imágenes existen
ls backend/public/images/productos/
```

### Problema: "Cannot find module 'zustand'"
```powershell
cd frontend
npm install zustand
```

### Problema: Error de CORS
```javascript
// backend/index.js - Verificar:
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Problema: Store no se actualiza
```javascript
// Verificar en componente:
useEffect(() => {
  fetchMenu();
}, [fetchMenu]); // Dependencia correcta
```

---

## 📈 Próximos Pasos

1. **Probar en dispositivos móviles**
   - Verificar responsive design
   - Probar scroll en tabs de categorías
   - Verificar tamaño de imágenes

2. **Optimizar imágenes**
   - Comprimir JPGs (TinyPNG, ImageOptim)
   - Considerar formato WebP
   - Crear thumbnails

3. **Agregar funcionalidades**
   - Modal de detalle de producto
   - Buscador de productos
   - Filtros (vegetariano, sin gluten, etc.)
   - Favoritos

4. **Preparar para producción**
   - Configurar variables de entorno
   - Optimizar build de Vite
   - Configurar CDN para imágenes
   - Deploy en Railway/Vercel

---

## 📞 Ayuda

**Documentación completa:** `HU2_DOCUMENTACION.md`

**Comandos útiles:**
```powershell
# Ver logs del backend
cd backend; npm start

# Ver logs del frontend con errores detallados
cd frontend; npm run dev

# Repoblar base de datos
cd backend; node scripts/seedMenuData.js

# Regenerar QR
cd backend; node scripts/generarQR.js
```

---

**✅ Implementación completada exitosamente**  
**Fecha:** 11 de noviembre de 2025  
**Versión:** 1.0.0

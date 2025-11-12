# 📸 HU2 - Ver fotos, descripción y precio

## 📋 Descripción de la Historia de Usuario

**Como** cliente  
**Quiero** ver fotos, descripción y precio de cada producto del menú digital  
**Para** decidir fácilmente qué voy a pedir

---

## ✅ Criterios de Aceptación

| # | Criterio | Estado | Implementación |
|---|----------|--------|----------------|
| 1 | Cada producto muestra nombre, foto, precio y descripción | ✅ | `ProductoCard.jsx` |
| 2 | Las imágenes cargan correctamente | ✅ | Lazy loading + skeleton |
| 3 | El usuario puede navegar entre categorías | ✅ | Vista acordeón + tabs |
| 4 | Los precios coinciden con los de caja | ✅ | API única `/api/menu` |

---

## 🏗️ Arquitectura de la Solución

### Backend (Node.js + Express + MongoDB)

```
backend/
├── src/
│   ├── models/
│   │   └── productoSchema.js          # Schema con imagenUrl
│   ├── controllers/
│   │   └── productos.controllers.js    # obtenerMenuPublico()
│   └── routes/
│       └── productos.routes.js         # GET /api/menu (público)
├── scripts/
│   └── seedMenuData.js                 # URLs de imágenes reales
└── public/
    └── images/
        └── productos/                  # Imágenes servidas estáticamente
            ├── hamburguesa completa.jpg
            ├── pizza muzzarella.jpg
            ├── milanesa napolitana.jpg
            ├── cerveza quilmes 1L.jpg
            ├── vino tinto copa.jpg
            ├── helado 3 bochas.jpg
            ├── flan con dulce de leche.jpg
            └── default.jpg
```

### Frontend (React + Vite + Zustand)

```
frontend/
├── src/
│   ├── store/
│   │   └── menuStore.js                # Estado global con Zustand
│   ├── components/
│   │   └── menu/
│   │       ├── ProductoCard.jsx        # Tarjeta de producto
│   │       └── ProductoCard.css        # Estilos de tarjeta
│   └── pages/
│       ├── MenuDigital.jsx              # Mejorado con Zustand
│       └── MenuDigital.css              # Estilos actualizados
```

---

## 🆕 Archivos Creados

### 1. **frontend/src/store/menuStore.js**
**Propósito:** Manejo de estado global del menú con Zustand

**Funcionalidades:**
- `fetchMenu()`: Obtiene menú desde API
- `setCategoriaActiva()`: Cambia categoría seleccionada
- `getProductosPorCategoria()`: Filtra productos
- `buscarProductos()`: Búsqueda por texto
- `refreshMenu()`: Actualiza menú
- Estados: `menu`, `categorias`, `productos`, `loading`, `error`

**Ejemplo de uso:**
```javascript
import useMenuStore from '../store/menuStore';

const { menu, loading, fetchMenu, setCategoriaActiva } = useMenuStore();

useEffect(() => {
  fetchMenu();
}, [fetchMenu]);
```

---

### 2. **frontend/src/components/menu/ProductoCard.jsx**
**Propósito:** Componente reutilizable de tarjeta de producto

**Props:**
- `producto`: Objeto con datos del producto
- `onSelect`: Callback al hacer click

**Características:**
- Imagen con lazy loading
- Skeleton loader mientras carga
- Overlay hover con "Ver detalles"
- Fallback a icono si no hay imagen
- Badge de disponibilidad
- Formato de precio en ARS
- Descripción truncada (3 líneas)

**Ejemplo:**
```jsx
<ProductoCard
  producto={{
    id: '123',
    nombre: 'Hamburguesa Completa',
    descripcion: 'Carne premium...',
    precio: 1200,
    imagenUrl: '/images/productos/hamburguesa.jpg'
  }}
  onSelect={(prod) => console.log(prod)}
/>
```

---

### 3. **frontend/src/components/menu/ProductoCard.css**
**Propósito:** Estilos para la tarjeta de producto

**Características:**
- Aspect ratio 4:3 para imágenes
- Hover con elevación y borde dorado
- Animación de zoom en imagen
- Skeleton loader animado
- Responsive design
- Compatible con Safari (prefijos -webkit-)

---

## 🔧 Archivos Modificados

### 1. **frontend/src/pages/MenuDigital.jsx**

**Cambios principales:**
- ✅ Integración con `useMenuStore` (Zustand)
- ✅ Uso de `ProductoCard` component
- ✅ Dos vistas: Acordeón y Grid
- ✅ Toolbar con botón actualizar
- ✅ Tabs de navegación entre categorías
- ✅ Manejo mejorado de errores

**Nuevas funcionalidades:**
```jsx
// Estado desde Zustand (no local)
const {
  menu,
  categorias,
  loading,
  error,
  fetchMenu,
  setCategoriaActiva,
  refreshMenu
} = useMenuStore();

// Vista de acordeón o grid
const [vistaActiva, setVistaActiva] = useState('categorias');

// Refrescar menú
const handleRefresh = async () => {
  await refreshMenu();
};
```

---

### 2. **frontend/src/pages/MenuDigital.css**

**Nuevos estilos agregados:**
- `.menu-toolbar`: Barra superior sticky
- `.refresh-button`: Botón actualizar con spinner
- `.view-toggle`: Alternador de vistas
- `.category-tabs`: Tabs de navegación
- `.menu-grid-view`: Vista de rejilla
- `.empty-icon`: Icono de menú vacío
- `.error-actions`: Botones de acción en error

---

### 3. **backend/scripts/seedMenuData.js**

**Cambios:**
- ✅ Actualizado con URLs de imágenes reales existentes
- ✅ Productos con imágenes:
  - `hamburguesa completa.jpg`
  - `pizza muzzarella.jpg`
  - `milanesa napolitana.jpg`
  - `ensalada cesar.jpg`
  - `cerveza quilmes 1L.jpg`
  - `vino tinto copa.jpg`
  - `vino blanco copa.jpg`
  - `agua mineral 500ml.jpg`
  - `coca cola 500.jpg`
  - `helado 3 bochas.jpg`
  - `flan con dulce de leche.jpg`

---

## 🚀 Instalación y Uso

### 1. **Instalar dependencias (si es necesario)**

```powershell
# Backend - ya tiene las dependencias necesarias
cd backend
npm install

# Frontend - instalar Zustand si no está
cd frontend
npm install zustand
```

### 2. **Verificar imágenes de productos**

```powershell
# Verificar que existen las imágenes
cd backend
ls public/images/productos/

# Deberías ver:
# - hamburguesa completa.jpg
# - pizza muzzarella.jpg
# - milanesa napolitana.jpg
# - etc.
```

### 3. **Poblar base de datos con imágenes**

```powershell
cd backend
node scripts/seedMenuData.js
```

**Salida esperada:**
```
✅ Conectado a MongoDB Atlas
🗑️  Colección limpiada
✅ 34 productos creados exitosamente

📊 RESUMEN POR CATEGORÍA:
╔══════════════════════════╦══════════╗
║ Categoría                ║ Cantidad ║
╠══════════════════════════╬══════════╣
║ Comidas                  ║    10    ║
║ Bebidas                  ║     5    ║
║ Bebidas Alcohólicas      ║     5    ║
║ Postres                  ║     8    ║
║ Entradas                 ║     4    ║
║ Guarniciones             ║     2    ║
╚══════════════════════════╩══════════╝
```

### 4. **Iniciar servidores**

```powershell
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. **Probar la funcionalidad**

1. **Abrir navegador:** http://localhost:5173/menu-digital
2. **Verificar:**
   - ✅ Productos con imágenes se ven correctamente
   - ✅ Productos sin imagen muestran icono de cubiertos
   - ✅ Precios formateados en ARS ($1.200)
   - ✅ Descripciones truncadas correctamente
   - ✅ Hover muestra "Ver detalles"
   - ✅ Tabs de categorías funcionan
   - ✅ Vista acordeón vs grid funciona
   - ✅ Botón actualizar funciona

---

## 🎨 Características de la UI

### Vista de Tarjetas de Producto

#### Con Imagen:
```
┌─────────────────────────────┐
│  [Badge: Disponible]        │
│                             │
│    ┌─────────────────┐      │
│    │                 │      │
│    │     IMAGEN      │      │
│    │   (Lazy Load)   │      │
│    │                 │      │
│    └─────────────────┘      │
│                             │
│  Nombre del Producto        │
│                    $1.200   │
│                             │
│  Descripción del producto   │
│  que se trunca a 3 líneas   │
│  con ellipsis...            │
│                             │
└─────────────────────────────┘
```

#### Sin Imagen:
```
┌─────────────────────────────┐
│              🍴             │
│                             │
│  Nombre del Producto        │
│                    $1.200   │
│                             │
│  Descripción del producto   │
│                             │
└─────────────────────────────┘
```

### Navegación de Categorías

**Vista Tabs (Grid):**
```
┌──────────────────────────────────────────────┐
│ [🍴 Comidas] [🍹 Bebidas] [🍰 Postres] ...   │
└──────────────────────────────────────────────┘
```

**Vista Acordeón:**
```
┌──────────────────────────────────────┐
│ ▼ 🍴 Comidas (10)                    │
├──────────────────────────────────────┤
│  [Producto 1] [Producto 2] ...       │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ▶ 🍹 Bebidas (5)                     │
└──────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (>768px)
- Grid de 3-4 columnas
- Imágenes grandes
- Toolbar horizontal
- Tabs completos visibles

### Tablet (768px)
- Grid de 2 columnas
- Imágenes medianas
- Toolbar compacto

### Mobile (<480px)
- Grid de 1 columna
- Imágenes responsive
- Toolbar vertical
- Tabs con scroll horizontal

---

## 🔌 API Endpoint

### GET `/api/menu`

**Tipo:** Público (sin autenticación)

**Respuesta:**
```json
{
  "restaurante": "La Vieja Estación",
  "slogan": "Sabores que cuentan historias",
  "menu": {
    "Comidas": [
      {
        "id": "673abc123def456",
        "nombre": "Hamburguesa Completa",
        "descripcion": "Carne de res premium...",
        "precio": 1200,
        "imagenUrl": "/images/productos/hamburguesa completa.jpg"
      }
    ],
    "Bebidas": [...],
    "Postres": [...]
  },
  "ultimaActualizacion": "2025-11-11T14:30:00.000Z"
}
```

---

## 🧪 Testing

### Pruebas Manuales

#### 1. **Carga de Imágenes**
```
✓ Productos con imagen válida: Muestra imagen
✓ Productos con imagen inválida: Muestra icono 🍴
✓ Skeleton loader: Aparece mientras carga
✓ Lazy loading: Solo carga imágenes visibles
```

#### 2. **Navegación**
```
✓ Click en categoría (acordeón): Expande/colapsa
✓ Click en tab (grid): Cambia categoría
✓ Botón "Todo": Muestra vista grid
✓ Botón "Categorías": Muestra vista acordeón
```

#### 3. **Actualización**
```
✓ Botón actualizar: Recarga menú desde API
✓ Spinner: Aparece durante carga
✓ Error: Muestra mensaje + botones de acción
```

#### 4. **Precios**
```
✓ Formato ARS: $1.200 (no $1200.00)
✓ Separador de miles: Punto
✓ Sin decimales para valores enteros
```

### Pruebas con cURL

```bash
# Obtener menú completo
curl http://localhost:4000/api/menu | json_pp

# Verificar imágenes disponibles
curl -I http://localhost:4000/images/productos/hamburguesa%20completa.jpg

# Verificar tiempo de respuesta
time curl http://localhost:4000/api/menu
```

---

## 🎯 Zustand Store API

### Estado Global

```javascript
{
  menu: {
    "Comidas": [...],
    "Bebidas": [...],
    "Postres": [...]
  },
  categorias: ["Comidas", "Bebidas", "Postres", ...],
  productos: [{ id, nombre, descripcion, precio, categoria, imagenUrl }, ...],
  categoriaActiva: "Comidas",
  loading: false,
  error: null,
  ultimaActualizacion: "2025-11-11T14:30:00.000Z"
}
```

### Acciones

| Acción | Descripción | Parámetros | Retorno |
|--------|-------------|------------|---------|
| `fetchMenu()` | Carga menú desde API | - | `{ success: boolean }` |
| `setCategoriaActiva(categoria)` | Cambia categoría activa | categoria: string | void |
| `getProductosPorCategoria(categoria)` | Obtiene productos de una categoría | categoria: string | Array<Producto> |
| `buscarProductos(termino)` | Busca productos por texto | termino: string | Array<Producto> |
| `refreshMenu()` | Recarga menú desde API | - | `{ success: boolean }` |
| `clearError()` | Limpia error | - | void |
| `reset()` | Resetea store | - | void |

---

## 🐛 Troubleshooting

### Problema 1: Imágenes no cargan

**Síntomas:**
- Todas las tarjetas muestran icono 🍴
- Console muestra errores 404

**Soluciones:**
```powershell
# 1. Verificar que el backend sirva archivos estáticos
# Agregar en backend/index.js:
app.use(express.static('public'));

# 2. Verificar URLs en seed script
node scripts/seedMenuData.js

# 3. Verificar archivos existen
ls backend/public/images/productos/
```

---

### Problema 2: Store no actualiza

**Síntomas:**
- Cambios en API no se reflejan
- Productos desactualizados

**Soluciones:**
```javascript
// 1. Forzar refresh
const { refreshMenu } = useMenuStore();
refreshMenu();

// 2. Verificar fetchMenu se llama
useEffect(() => {
  fetchMenu();
}, [fetchMenu]); // Dependencia correcta

// 3. Limpiar caché del navegador
// DevTools > Application > Storage > Clear site data
```

---

### Problema 3: Error CORS

**Síntomas:**
```
Access to XMLHttpRequest at 'http://localhost:4000/api/menu' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución:**
```javascript
// backend/index.js
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 📊 Métricas de Implementación

| Métrica | Valor |
|---------|-------|
| **Archivos nuevos** | 3 |
| **Archivos modificados** | 3 |
| **Líneas de código (nuevas)** | ~800 |
| **Líneas de CSS (nuevas)** | ~260 |
| **Componentes creados** | ProductoCard |
| **Stores creados** | menuStore (Zustand) |
| **Endpoints usados** | GET /api/menu |
| **Imágenes implementadas** | 11 reales + default |

---

## ✅ Checklist de Implementación

### Backend
- [x] Schema tiene campo `imagenUrl`
- [x] Controller `obtenerMenuPublico()` retorna `imagenUrl`
- [x] Ruta `/api/menu` es pública
- [x] Archivos estáticos servidos con `express.static`
- [x] Seed script actualizado con URLs reales

### Frontend
- [x] Store de Zustand creado (`menuStore.js`)
- [x] Componente `ProductoCard` creado
- [x] Estilos `ProductoCard.css` creados
- [x] `MenuDigital.jsx` integrado con Zustand
- [x] Lazy loading de imágenes
- [x] Skeleton loader implementado
- [x] Navegación por categorías (tabs + acordeón)
- [x] Responsive design

### Testing
- [x] Carga de imágenes verificada
- [x] Navegación entre categorías funciona
- [x] Precios formateados correctamente
- [x] Error handling implementado
- [x] Loading states implementados

---

## 🚀 Próximos Pasos (Mejoras Futuras)

1. **Modal de Detalle de Producto**
   - Ampliar imagen
   - Información nutricional
   - Ingredientes
   - Alergenos

2. **Búsqueda y Filtros**
   - Buscador por nombre
   - Filtro por rango de precio
   - Filtro vegetariano/vegano
   - Ordenar por precio/popularidad

3. **Optimización de Imágenes**
   - Compresión automática
   - Múltiples tamaños (thumbnails)
   - Formato WebP
   - CDN para servir imágenes

4. **Caché y Offline**
   - Service Worker
   - Cache API
   - Menú disponible sin conexión

5. **Analytics**
   - Productos más vistos
   - Categorías más populares
   - Tiempo promedio por categoría

---

## 📞 Contacto y Soporte

Para consultas sobre esta implementación:
- **Documentación técnica:** Este archivo
- **Code review:** Ver commits en `dev` branch
- **Issues:** Crear issue en GitHub

---

**Fecha de implementación:** 11 de noviembre de 2025  
**Versión:** 1.0.0  
**Desarrollador:** GitHub Copilot  
**Historia de usuario:** HU2 - Ver fotos, descripción y precio

# 📜 Scripts - HU1 Menú Digital

Esta carpeta contiene scripts de utilidad para la Historia de Usuario 1 (Escanear Menú Digital).

---

## 📋 Scripts Disponibles

### 1. `seedMenuData.js` - Poblar Base de Datos

**Propósito:** Insertar productos de ejemplo en MongoDB para pruebas y desarrollo.

**Uso:**
```bash
node scripts/seedMenuData.js
```

**¿Qué hace?**
- Conecta a MongoDB
- Limpia la colección de productos existente
- Inserta 34 productos de ejemplo
- Muestra estadísticas de inserción

**Productos insertados:**
- 10 Comidas
- 5 Bebidas
- 5 Bebidas Alcohólicas
- 8 Postres
- 4 Entradas

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

🎉 ¡Base de datos poblada exitosamente!
```

**⚠️ Advertencia:**
- Elimina TODOS los productos existentes antes de insertar
- Usar solo en desarrollo/testing
- NO ejecutar en producción sin backup

---

### 2. `generarQR.js` - Generar Códigos QR

**Propósito:** Generar códigos QR que redirigen al menú digital.

**Uso:**
```bash
node scripts/generarQR.js
```

**¿Qué hace?**
- Genera códigos QR en varios formatos
- Crea directorio `backend/public/qr/` si no existe
- Permite configurar la URL del menú

**Archivos generados:**

| Archivo | Tamaño | Formato | Uso |
|---------|--------|---------|-----|
| `menu-qr.png` | 500x500px | PNG | General |
| `menu-qr-completo.png` | 600x600px | PNG | Impresión |
| `menu-qr.svg` | Vectorial | SVG | Escalable |

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

📝 Instrucciones:
1. Imprimir el código QR generado
2. Colocar en las mesas del restaurante
3. Los clientes pueden escanearlo para ver el menú

✨ QR adicional generado: backend/public/qr/menu-qr-completo.png
📊 QR en formato SVG generado: backend/public/qr/menu-qr.svg

🎉 ¡Proceso completado!
```

**Configuración:**

Editar el archivo para cambiar la URL:

```javascript
const config = {
  // URL del menú (cambiar según el entorno)
  menuUrl: process.env.MENU_URL || 'http://localhost:5173/menu-digital',
  
  // Para producción:
  // menuUrl: 'https://laviejaestacion.com/menu-digital',
  
  // Para red local:
  // menuUrl: 'http://192.168.1.100:5173/menu-digital',
};
```

**Variable de entorno:**
```bash
MENU_URL=https://laviejaestacion.com/menu-digital node scripts/generarQR.js
```

---

## 🎯 Funcionalidades Adicionales

### Generar QR por Mesa

Editar `generarQR.js` y descomentar al final:

```javascript
// Generar QR para 10 mesas
await generarQRsMultiples(10);
```

Esto creará:
- `menu-qr-mesa-1.png`
- `menu-qr-mesa-2.png`
- ...
- `menu-qr-mesa-10.png`

Cada QR incluirá el parámetro de mesa: `?mesa=1`, `?mesa=2`, etc.

**Uso:**
```bash
node scripts/generarQR.js
```

**Salida:**
```
🍽️ Generando QR para 10 mesas...

✅ QR generado para mesa 1: backend/public/qr/menu-qr-mesa-1.png
✅ QR generado para mesa 2: backend/public/qr/menu-qr-mesa-2.png
...
✅ 10 códigos QR generados exitosamente!
```

---

## 🔧 Requisitos

### Dependencias

```json
{
  "qrcode": "^1.5.3",
  "mongoose": "^8.18.0"
}
```

Instalar:
```bash
npm install qrcode
```

### Variables de Entorno

Archivo `.env` requerido:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/laviejaestacion
MENU_URL=http://localhost:5173/menu-digital
```

---

## 📝 Orden de Ejecución Recomendado

### Primera vez (Setup inicial)

```bash
# 1. Instalar dependencias
npm install

# 2. Poblar base de datos con productos
node scripts/seedMenuData.js

# 3. Generar códigos QR
node scripts/generarQR.js

# 4. Iniciar servidor
npm start
```

### Desarrollo continuo

```bash
# Solo regenerar QR si cambia la URL
node scripts/generarQR.js

# Solo repoblar BD si necesitas datos frescos
node scripts/seedMenuData.js
```

---

## 🚨 Troubleshooting

### Error: Cannot find module 'qrcode'

**Solución:**
```bash
npm install qrcode
```

### Error: MongoServerError: Authentication failed

**Causa:** Credenciales de MongoDB incorrectas  
**Solución:** Verificar `.env` con credenciales correctas

### Error: ENOENT: no such file or directory

**Causa:** Directorio `public/qr` no existe  
**Solución:** El script lo crea automáticamente, verificar permisos

### QR generado pero URL incorrecta

**Solución:** Configurar variable de entorno:
```bash
export MENU_URL=http://tu-url.com/menu-digital
node scripts/generarQR.js
```

---

## 📊 Logs y Debugging

### Verificar productos insertados

```bash
# Desde MongoDB shell
use laviejaestacion
db.productos.countDocuments()  # Debe retornar 34

db.productos.find({ categoria: "Comidas" }).count()  # Debe retornar 10
```

### Verificar archivos QR

```bash
ls -la backend/public/qr/

# Salida esperada:
# menu-qr.png
# menu-qr-completo.png
# menu-qr.svg
```

---

## 🎨 Personalización

### Cambiar productos de ejemplo

Editar `seedMenuData.js`:

```javascript
const productosEjemplo = [
  {
    nombre: "Mi Producto",
    descripcion: "Descripción del producto",
    categoria: "Comidas",
    precio: 1500,
    disponible: true
  },
  // ... más productos
];
```

### Cambiar estilo de QR

Editar `generarQR.js`:

```javascript
qrOptions: {
  errorCorrectionLevel: 'H',  // L, M, Q, H
  width: 500,                 // Tamaño en pixels
  margin: 2,                  // Margen
  color: {
    dark: '#000000',          // Color del QR
    light: '#ffffff'          // Color de fondo
  }
}
```

**Ejemplo: QR con colores del restaurante**
```javascript
color: {
  dark: '#1a1a1a',    // Negro del logo
  light: '#ffc107'    // Dorado del branding
}
```

---

## ✅ Checklist

Antes de usar en producción:

- [ ] Productos de ejemplo reemplazados con menú real
- [ ] URL de producción configurada en QR
- [ ] QR impreso en alta calidad (300 DPI)
- [ ] QR probado con smartphones
- [ ] Backup de base de datos realizado
- [ ] Scripts ejecutados sin errores

---

## 📚 Documentación Relacionada

- [HU1_MENU_DIGITAL.md](../HU1_MENU_DIGITAL.md) - Documentación completa
- [QUICK_START_HU1.md](../QUICK_START_HU1.md) - Guía rápida
- [HU1_EJEMPLOS_API.md](../HU1_EJEMPLOS_API.md) - Ejemplos de API

---

**Scripts HU1 - Menú Digital**  
La Vieja Estación RestoBar  
Última actualización: 11/11/2025

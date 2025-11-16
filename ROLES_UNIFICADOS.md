# Unificación de Roles del Sistema
**Fecha:** 2025
**Objetivo:** Usar `initDB.js` como fuente de verdad para todos los roles del sistema

---

## 📋 Roles Oficiales del Sistema

Según `backend/scripts/initDB.js`, los roles definidos son:

1. **SuperAdministrador** - Control total del sistema
2. **Gerente** - Supervisión y gestión operativa
3. **Mozo** - Gestión de pedidos y mesas
4. **Cajero** - Gestión de pagos y cierre de caja
5. **EncargadoCocina** - Gestión de pedidos en cocina

---

## ✅ Cambios Implementados

### 1. Backend - Schema de Usuario
**Archivo:** `backend/src/models/usuarioSchema.js`

**Antes:**
```javascript
enum: ['Administrador', 'Gerente', 'Mozo', 'Mozo1', 'Mozo2', 'Cajero', 'EncargadoCocina', 'SuperAdministrador']
```

**Después:**
```javascript
// Roles alineados con initDB.js (fuente de verdad)
enum: ['SuperAdministrador', 'Gerente', 'Mozo', 'Cajero', 'EncargadoCocina']
```

---

### 2. Backend - Rutas
**Archivos modificados:** Todos los archivos en `backend/src/routes/*.routes.js` (12 archivos)

**Cambio global:**
- Reemplazado `'Administrador'` → `'SuperAdministrador'`
- Eliminados roles obsoletos: `'Mozo1'`, `'Mozo2'`

**Archivos afectados:**
- `auth.routes.js`
- `cierreCaja.routes.js`
- `compras.routes.js`
- `empleados.routes.js`
- `mesas.routes.js`
- `pedidos.routes.js`
- `productos.routes.js`
- `reportes.routes.js`
- `reservas.routes.js`
- `usuarios.routes.js`
- Otros archivos de rutas

---

### 3. Frontend - Rutas de Aplicación
**Archivo:** `frontend/src/App.jsx`

**Cambios:**
1. **Ruta /mozo:**
   ```jsx
   // Antes
   role={["Mozo", "Mozo1", "Mozo2", "Gerente", "SuperAdministrador"]}
   
   // Después
   role={["Mozo", "Gerente", "SuperAdministrador"]}
   ```

2. **Ruta /admin:**
   ```jsx
   // Antes
   role={["Administrador", "SuperAdministrador", "Gerente"]}
   
   // Después
   role={["SuperAdministrador", "Gerente"]}
   ```

---

### 4. Frontend - Navegación Admin
**Archivo:** `frontend/src/pages/AdminPage.jsx`

**Cambios:**
1. Agregadas pestañas para módulos operativos (Mozo, Cocina)
2. Gerente puede acceder a:
   - ✅ Empleados (solo lectura)
   - ✅ Módulo Mozo (supervisión)
   - ✅ Módulo Cocina (supervisión)
   - ✅ Todas las pestañas admin existentes

**Código agregado:**
```jsx
{/* Módulos Operativos - Solo para Gerente y SuperAdmin */}
{canViewEmpleados && (
  <>
    <NavLink to="/mozo">🍽️ Módulo Mozo</NavLink>
    <NavLink to="/cocina">👨‍🍳 Módulo Cocina</NavLink>
  </>
)}
```

---

## 🔐 Matriz de Permisos por Rol

| Funcionalidad | SuperAdmin | Gerente | Mozo | Cajero | EncargadoCocina |
|--------------|------------|---------|------|--------|-----------------|
| **Admin Panel** | ✅ Total | ✅ Lectura | ❌ | ❌ | ❌ |
| **Productos** | ✅ CRUD | ✅ Lectura | ❌ | ❌ | ❌ |
| **Usuarios** | ✅ CRUD | ✅ Lectura | ❌ | ❌ | ❌ |
| **Empleados** | ✅ CRUD | ✅ Lectura | ❌ | ❌ | ❌ |
| **Módulo Mozo** | ✅ Ver | ✅ Ver | ✅ Operar | ❌ | ❌ |
| **Módulo Cocina** | ✅ Ver | ✅ Ver | ❌ | ❌ | ✅ Operar |
| **Módulo Caja** | ✅ Ver | ✅ Ver | ❌ | ✅ Operar | ❌ |
| **Reportes** | ✅ Todo | ✅ Todo | ❌ | ❌ | ❌ |
| **Compras** | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ❌ |

---

## 📝 Usuarios de Prueba (initDB.js)

| Nombre | Email | Password | Rol |
|--------|-------|----------|-----|
| Juan Suarez | juan@restobar.com | SA007 | SuperAdministrador |
| Carlos García | carlos@restobar.com | GER123 | Gerente |
| María López | maria@restobar.com | MOZ123 | Mozo |
| Mario García | mario@restobar.com | MOZ124 | Mozo |
| Miguel Ramírez | miguel@restobar.com | CAJ123 | Cajero |
| Ana Martínez | ana@restobar.com | COC123 | EncargadoCocina |

---

## 🎯 Ventajas de la Unificación

1. **Consistencia:** Un solo conjunto de roles en todo el sistema
2. **Mantenibilidad:** Cambios en `initDB.js` se reflejan en todo el código
3. **Claridad:** Roles descriptivos y sin duplicados
4. **Escalabilidad:** Fácil agregar nuevos roles desde un punto central
5. **Testing:** Usuarios de prueba claramente definidos

---

## 🚀 Próximos Pasos Recomendados

1. **Migración de Usuarios Existentes:**
   - Ejecutar script para actualizar roles antiguos en BD:
     - `'Administrador'` → `'SuperAdministrador'`
     - `'Mozo1'` → `'Mozo'`
     - `'Mozo2'` → `'Mozo'`

2. **Testing:**
   - Verificar login con cada rol
   - Probar acceso a cada módulo
   - Validar restricciones de permisos

3. **Documentación:**
   - Actualizar manual de usuario
   - Documentar flujo de supervisión para Gerente

---

## 📌 Notas Importantes

- ⚠️ **Roles eliminados:** `'Administrador'`, `'Mozo1'`, `'Mozo2'`
- ✅ **Rol unificado para cocina:** Solo `'EncargadoCocina'`
- ✅ **Gerente tiene acceso de supervisión** a todos los módulos operativos
- ✅ **SuperAdministrador** puede eliminar empleados permanentemente
- ✅ **Gerente** solo puede desactivar empleados (soft delete)

---

## 🔧 Comandos Útiles

### Reinicializar Base de Datos
```bash
cd backend
node scripts/initDB.js
```

### Verificar Roles en BD
```javascript
// En MongoDB Compass o Shell
db.usuarios.distinct("rol")
```

### Actualizar Roles Antiguos (si necesario)
```javascript
// En MongoDB Shell
db.usuarios.updateMany(
  { rol: "Administrador" },
  { $set: { rol: "SuperAdministrador" } }
)
db.usuarios.updateMany(
  { rol: { $in: ["Mozo1", "Mozo2"] } },
  { $set: { rol: "Mozo" } }
)
```

---

**Última actualización:** 2025
**Responsable:** Equipo de Desarrollo La Vieja Estación

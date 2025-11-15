# ✅ Checklist de Verificación - Roles y UI Gerente

Usa este checklist para verificar que todos los cambios funcionan correctamente.

---

## 🔧 Pre-requisitos

```bash
# 1. Verificar que estés en la rama correcta
git branch

# 2. Backend y Frontend actualizados
cd backend && npm install
cd ../frontend && npm install

# 3. MongoDB corriendo
# Verificar con MongoDB Compass o:
mongosh "mongodb://localhost:27017/restobar_db"
```

---

## 📋 Fase 1: Preparación de Base de Datos

### Opción A: Base de Datos Nueva ✨
```bash
cd backend
node scripts/initDB.js
```

- [ ] Script ejecuta sin errores
- [ ] Muestra "✅ 6 usuarios creados"
- [ ] Muestra "✅ Base de datos inicializada correctamente!"

### Opción B: Migrar Base de Datos Existente 🔄
```bash
cd backend
node scripts/migrateRoles.js
```

- [ ] Script analiza roles existentes
- [ ] Identifica usuarios con roles antiguos
- [ ] Actualiza roles correctamente
- [ ] Muestra "✨ ¡Todos los roles son válidos!"

---

## 📋 Fase 2: Iniciar Sistema

### Backend
```bash
cd backend
npm start
```

**Verificar:**
- [ ] Servidor inicia en puerto 4000
- [ ] No hay errores de sintaxis
- [ ] Muestra "✅ Conectado a MongoDB"
- [ ] Rutas cargadas correctamente

### Frontend
```bash
cd frontend
npm run dev
```

**Verificar:**
- [ ] Servidor inicia en puerto 5173
- [ ] No hay errores de compilación
- [ ] Abre navegador automáticamente
- [ ] Página de inicio carga correctamente

---

## 📋 Fase 3: Testing con SuperAdministrador

### 3.1 Login
**Credenciales:**
```
Email: juan@restobar.com
Password: SA007
```

**Verificar:**
- [ ] Login exitoso
- [ ] Token guardado en localStorage
- [ ] Redirección automática

### 3.2 Panel Admin
**Navegar a:** `/admin`

**Verificar pestañas visibles:**
- [ ] Productos
- [ ] Usuarios
- [ ] Ventas
- [ ] Reservas
- [ ] Calendario
- [ ] Empleados
- [ ] 🍽️ Módulo Mozo (con separador visual)
- [ ] 👨‍🍳 Módulo Cocina

### 3.3 Módulo Empleados
**Click en:** "Empleados"

**Verificar:**
- [ ] Título: "Gestión de Empleados"
- [ ] No muestra chip "Solo Lectura"
- [ ] Botón "Nuevo Empleado" visible
- [ ] Tabla con empleados carga
- [ ] Columnas: Nombre, DNI, Cargo, Asistencias, Inasistencias
- [ ] Menú de acciones (tres puntos) funciona
- [ ] Opciones: Desactivar / Eliminar Permanentemente

### 3.4 Módulo Mozo
**Click en:** "🍽️ Módulo Mozo"

**Verificar:**
- [ ] Redirección a `/mozo`
- [ ] Módulo carga sin errores
- [ ] Interfaz de pedidos visible
- [ ] SuperAdmin puede operar

### 3.5 Módulo Cocina
**Click en:** "👨‍🍳 Módulo Cocina"

**Verificar:**
- [ ] Redirección a `/cocina`
- [ ] Módulo carga sin errores
- [ ] Interfaz de cocina visible
- [ ] SuperAdmin puede operar

---

## 📋 Fase 4: Testing con Gerente (CRÍTICO) 🎯

### 4.1 Login
**Logout del SuperAdmin primero:**
```
Click en: Perfil → Cerrar Sesión
```

**Credenciales Gerente:**
```
Email: carlos@restobar.com
Password: GER123
```

**Verificar:**
- [ ] Login exitoso
- [ ] Token guardado
- [ ] Rol detectado como 'Gerente'

### 4.2 Panel Admin
**Navegar a:** `/admin`

**Verificar pestañas visibles para Gerente:**
- [ ] Productos ✅
- [ ] Usuarios ✅
- [ ] Ventas ✅
- [ ] Reservas ✅
- [ ] Calendario ✅
- [ ] **Empleados** ✅ ← CRÍTICO: Debe verse
- [ ] **│** (Separador visual) ✅
- [ ] **🍽️ Módulo Mozo** ✅ ← CRÍTICO: Debe verse
- [ ] **👨‍🍳 Módulo Cocina** ✅ ← CRÍTICO: Debe verse

**Si NO ves estas pestañas:**
```bash
# Solución:
# 1. Hacer hard refresh: Ctrl + Shift + R
# 2. Limpiar localStorage
localStorage.clear()
# 3. Login nuevamente
```

### 4.3 Módulo Empleados (Solo Lectura)
**Click en:** "Empleados"

**Verificar interfaz de SOLO LECTURA:**
- [ ] Título: "🔍 Supervisión de Empleados"
- [ ] Chip naranja "Solo Lectura" visible
- [ ] Texto: "Solo visualización - Sin edición permitida"
- [ ] **NO** aparece botón "Nuevo Empleado"
- [ ] Tabla carga correctamente
- [ ] Columnas visibles con datos
- [ ] **NO** aparecen botones de acciones (sin menú de tres puntos)
- [ ] Se muestra asistencias e inasistencias

### 4.4 Módulo Mozo (Supervisión)
**Click en:** "🍽️ Módulo Mozo"

**Verificar:**
- [ ] Redirección exitosa a `/mozo`
- [ ] Módulo carga sin error 403
- [ ] Interfaz visible completa
- [ ] Gerente puede VER pero no modificar
- [ ] Pedidos se muestran correctamente

**Si aparece error 403:**
```javascript
// Verificar en App.jsx línea ~71:
<ProtectedRoute role={["Mozo", "Gerente", "SuperAdministrador"]}>
```

### 4.5 Módulo Cocina (Supervisión)
**Click en:** "👨‍🍳 Módulo Cocina"

**Verificar:**
- [ ] Redirección exitosa a `/encargado-cocina`
- [ ] Módulo carga sin error 403
- [ ] Interfaz visible completa
- [ ] Gerente puede VER pero no modificar
- [ ] Pedidos de cocina se muestran

**Si aparece error 403:**
```javascript
// Verificar en App.jsx línea ~77:
<ProtectedRoute role={["EncargadoCocina", "Gerente", "SuperAdministrador"]}>
```

### 4.6 Navegación entre Pestañas
**Verificar navegación fluida:**
- [ ] Click Empleados → Carga vista de empleados
- [ ] Click Módulo Mozo → Carga vista de mozo
- [ ] Click Módulo Cocina → Carga vista de cocina
- [ ] Click Productos → Carga vista de productos
- [ ] Volver a Empleados → Funciona
- [ ] URL cambia correctamente en cada click
- [ ] Sin errores en consola

---

## 📋 Fase 5: Testing con Otros Roles

### 5.1 Mozo
**Credenciales:**
```
Email: maria@restobar.com
Password: MOZ123
```

**Verificar:**
- [ ] Login exitoso
- [ ] **NO** puede acceder a `/admin`
- [ ] **SÍ** puede acceder a `/mozo`
- [ ] **NO** puede acceder a `/cocina`

### 5.2 Cajero
**Credenciales:**
```
Email: miguel@restobar.com
Password: CAJ123
```

**Verificar:**
- [ ] Login exitoso
- [ ] **NO** puede acceder a `/admin`
- [ ] **NO** puede acceder a `/mozo`
- [ ] **NO** puede acceder a `/cocina`
- [ ] **SÍ** puede acceder a módulo caja (si existe)

### 5.3 EncargadoCocina
**Credenciales:**
```
Email: ana@restobar.com
Password: COC123
```

**Verificar:**
- [ ] Login exitoso
- [ ] **NO** puede acceder a `/admin`
- [ ] **NO** puede acceder a `/mozo`
- [ ] **SÍ** puede acceder a `/encargado-cocina`

---

## 📋 Fase 6: Verificación de Base de Datos

### Usando MongoDB Compass o Shell
```javascript
// 1. Ver todos los roles existentes
db.usuarios.distinct("rol")

// Resultado esperado:
[
  "SuperAdministrador",
  "Gerente",
  "Mozo",
  "Cajero",
  "EncargadoCocina"
]

// 2. Contar usuarios por rol
db.usuarios.aggregate([
  { $group: { _id: "$rol", count: { $sum: 1 } } }
])

// 3. Verificar que NO existan roles antiguos
db.usuarios.find({ rol: "Administrador" }).count()  // Debe ser 0
db.usuarios.find({ rol: "Mozo1" }).count()         // Debe ser 0
db.usuarios.find({ rol: "Mozo2" }).count()         // Debe ser 0
```

**Verificar:**
- [ ] Solo 5 roles en la BD
- [ ] No hay roles obsoletos
- [ ] Todos los usuarios tienen rol válido

---

## 📋 Fase 7: Verificación de Código

### Backend - usuarioSchema.js
```bash
code backend/src/models/usuarioSchema.js
```

**Verificar línea ~35:**
```javascript
enum: ['SuperAdministrador', 'Gerente', 'Mozo', 'Cajero', 'EncargadoCocina']
```

- [ ] Solo estos 5 roles en el enum
- [ ] No aparece 'Administrador'
- [ ] No aparece 'Mozo1' ni 'Mozo2'

### Backend - Rutas
```bash
# Buscar si quedó algún 'Administrador'
grep -r "'Administrador'" backend/src/routes/
```

**Verificar:**
- [ ] **NO** debe encontrar resultados
- [ ] Todos reemplazados por 'SuperAdministrador'

### Frontend - App.jsx
```bash
code frontend/src/App.jsx
```

**Verificar rutas:**
```javascript
// Línea ~71 - Ruta /mozo
role={["Mozo", "Gerente", "SuperAdministrador"]}

// Línea ~77 - Ruta /cocina
role={["EncargadoCocina", "Gerente", "SuperAdministrador"]}

// Línea ~86 - Ruta /admin
role={["SuperAdministrador", "Gerente"]}
```

- [ ] No aparece 'Mozo1', 'Mozo2'
- [ ] No aparece 'Administrador'
- [ ] Gerente incluido en /mozo y /cocina

### Frontend - AdminPage.jsx
```bash
code frontend/src/pages/AdminPage.jsx
```

**Verificar:**
```javascript
// Líneas ~12-13
const isGerente = user?.rol === 'Gerente';
const canViewEmpleados = isSuperAdmin || isGerente;

// Línea ~167
{canViewEmpleados && (
  <NavLink to="/admin/empleados">
    <FaUserTie /> Empleados
  </NavLink>
)}

// Líneas nuevas - Módulos operativos
<NavLink to="/mozo">🍽️ Módulo Mozo</NavLink>
<NavLink to="/cocina">👨‍🍳 Módulo Cocina</NavLink>
```

- [ ] isGerente definido
- [ ] canViewEmpleados usa isGerente
- [ ] Pestañas de módulos operativos agregadas

---

## 📋 Fase 8: Testing de Consola (Errores)

### Consola del Navegador
**Abrir:** F12 → Console

**Durante navegación del Gerente:**
- [ ] No hay errores de permisos
- [ ] No hay errores 403 Forbidden
- [ ] No hay errores de React
- [ ] No hay warnings de rutas no encontradas

**Si hay errores:**
```javascript
// Verificar token JWT
localStorage.getItem('token')

// Verificar usuario en store
// En React DevTools → Zustand → userStore
```

### Terminal Backend
**Verificar logs:**
- [ ] Sin errores de autenticación
- [ ] Sin errores de MongoDB
- [ ] Rutas responden correctamente
- [ ] Middleware verificarRol funcionando

### Terminal Frontend
**Verificar logs:**
- [ ] Sin errores de compilación
- [ ] Sin warnings de dependencias
- [ ] Hot reload funciona

---

## 📋 Fase 9: Testing de Regresión

### Funcionalidades que NO deben romperse:
- [ ] Login de cualquier usuario
- [ ] Logout funciona
- [ ] Registro de nuevos usuarios
- [ ] Creación de productos (SuperAdmin)
- [ ] Creación de pedidos (Mozo)
- [ ] Gestión de mesas
- [ ] Reservas
- [ ] Carrito de compras

---

## 📋 Fase 10: Checklist Visual Final

### Para Gerente (carlos@restobar.com)
```
✅ Login exitoso
✅ Accede a /admin
✅ Ve 8 pestañas totales:
   ├─ Productos
   ├─ Usuarios
   ├─ Ventas
   ├─ Reservas
   ├─ Calendario
   ├─ Empleados
   ├─ 🍽️ Módulo Mozo
   └─ 👨‍🍳 Módulo Cocina

✅ Click en Empleados:
   ├─ Muestra "🔍 Supervisión de Empleados"
   ├─ Chip "Solo Lectura" visible
   ├─ Tabla carga con datos
   └─ Sin botones de edición

✅ Click en Módulo Mozo:
   ├─ Redirección a /mozo
   ├─ Interfaz completa
   └─ Modo supervisión

✅ Click en Módulo Cocina:
   ├─ Redirección a /cocina
   ├─ Interfaz completa
   └─ Modo supervisión
```

---

## 🎯 Resumen de Estado

### ✅ TODO CORRECTO SI:
- [x] Gerente ve 8 pestañas en admin
- [x] Gerente accede a Módulo Mozo
- [x] Gerente accede a Módulo Cocina
- [x] Empleados muestra "Solo Lectura"
- [x] Solo 5 roles en BD
- [x] Sin errores en consola
- [x] Todos los roles pueden login
- [x] Permisos funcionan correctamente

### ❌ HAY PROBLEMA SI:
- [ ] Gerente NO ve pestaña Empleados
- [ ] Gerente NO ve pestañas de módulos operativos
- [ ] Error 403 al acceder a /mozo o /cocina
- [ ] Roles 'Administrador' o 'Mozo1' en BD
- [ ] Errores en consola del navegador
- [ ] Login no funciona para algún rol

---

## 🔧 Soluciones Rápidas

### Problema: Gerente no ve pestañas
```bash
# 1. Verificar código
code frontend/src/pages/AdminPage.jsx
# Buscar: canViewEmpleados

# 2. Hard refresh navegador
Ctrl + Shift + R

# 3. Limpiar cache
localStorage.clear()
```

### Problema: Error 403 en módulos
```bash
# 1. Verificar rutas
code frontend/src/App.jsx
# Línea 71 y 77: Debe incluir 'Gerente'

# 2. Verificar backend
grep -r "verificarRol" backend/src/routes/pedidos.routes.js
# Debe incluir 'Gerente'
```

### Problema: Roles antiguos en BD
```bash
# Ejecutar migración
cd backend
node scripts/migrateRoles.js
```

---

## ✅ CHECKLIST FINAL

- [ ] ✅ Fase 1: Base de Datos preparada
- [ ] ✅ Fase 2: Sistema iniciado sin errores
- [ ] ✅ Fase 3: SuperAdmin funciona correctamente
- [ ] ✅ Fase 4: **Gerente ve y accede a todo** ← CRÍTICO
- [ ] ✅ Fase 5: Otros roles funcionan
- [ ] ✅ Fase 6: BD con roles correctos
- [ ] ✅ Fase 7: Código actualizado
- [ ] ✅ Fase 8: Sin errores en consolas
- [ ] ✅ Fase 9: Sin regresiones
- [ ] ✅ Fase 10: Checklist visual pasado

---

**Si todos los checks están ✅, el sistema está FUNCIONANDO CORRECTAMENTE! 🎉**

---

## 📞 Soporte

Si algún check falla:
1. Revisar `ROLES_UNIFICADOS.md`
2. Revisar `RESUMEN_CAMBIOS_ROLES.md`
3. Ejecutar `node scripts/migrateRoles.js`
4. Verificar consola de errores

---

**Última actualización:** 2025
**Estado esperado:** ✅ TODOS LOS CHECKS PASADOS

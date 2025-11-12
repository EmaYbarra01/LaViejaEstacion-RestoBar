# Documentación de Cambios - Migración a Autenticación JWT con Cookies

## Resumen de Cambios Implementados

Se actualizó el frontend para ser compatible con la nueva implementación del backend que utiliza cookies JWT para la autenticación, reemplazando la validación local que comparaba credenciales almacenadas.

## 📋 Cambios Realizados

### 1. **Nuevo Cliente API (`src/utils/apiClient.js`)**
- **CREADO**: Cliente axios configurado con `withCredentials: true`
- **Funcionalidad**: Maneja automáticamente las cookies JWT en todas las peticiones
- **Interceptores**: 
  - Logging de peticiones y respuestas en desarrollo
  - Manejo automático de errores 401 (no autorizado)
  - Redirección automática al login cuando expira la sesión

### 2. **Actualización de Queries de Usuario (`src/helpers/queriesUsuarios.js`)**
- **MIGRACIÓN**: Cambio de `axios` directo a `apiClient`
- **NUEVAS FUNCIONES**:
  - `login(email, password)`: Autenticación usando el endpoint del backend
  - `verifyAuth()`: Verificación de validez de la cookie JWT
  - `logout()`: Cierre de sesión y limpieza de datos
- **BENEFICIOS**: Todas las peticiones ahora incluyen automáticamente las cookies JWT

### 3. **Refactorización del Componente Login (`src/pages/Login.jsx`)**
- **ELIMINADO**: Carga y comparación local de usuarios
- **IMPLEMENTADO**: Autenticación real contra el servidor
- **MEJORAS**:
  - Validación de formulario mejorada
  - Estados de carga (loading)
  - Manejo de errores con mensajes informativos
  - Input de email con validación HTML5
  - Campos requeridos y disabled durante carga

### 4. **Mejora del Componente ProtectedRoute (`src/components/ProtectedRoute.jsx`)**
- **NUEVA LÓGICA**: Verificación híbrida de autenticación
  1. Verificación primaria con servidor (cookie JWT)
  2. Fallback a localStorage para experiencia offline
- **CARACTERÍSTICAS**:
  - Estado de carga mientras verifica autenticación
  - Manejo robusto de errores de red
  - Compatibilidad con roles de usuario
  - Interfaz de usuario mejorada durante la carga

## 🔄 Flujo de Autenticación Actualizado

### **Antes (Validación Local)**:
1. Usuario ingresa credenciales
2. Frontend obtiene lista de usuarios del servidor
3. Compara credenciales localmente
4. Guarda usuario en localStorage
5. Redirige según rol

### **Ahora (Autenticación JWT con Cookies)**:
1. Usuario ingresa credenciales
2. Frontend envía credenciales al servidor
3. Servidor valida y establece cookie JWT httpOnly
4. Frontend recibe datos del usuario
5. Guarda datos básicos en localStorage (solo para UI)
6. Cookie JWT se incluye automáticamente en futuras peticiones

## 🔐 Beneficios de Seguridad

1. **Cookies httpOnly**: El token JWT no es accesible desde JavaScript, previene ataques XSS
2. **Validación del servidor**: Las credenciales se validan contra la base de datos real
3. **Expiración automática**: Las cookies tienen tiempo de vida limitado (1 hora)
4. **SameSite protection**: Protección contra ataques CSRF

## 🛠️ Configuración Requerida

### Variables de Entorno
Asegúrese de tener configurada la variable:
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_USUARIOS=http://localhost:4000/api/users
```

### Backend Endpoints Requeridos
El frontend ahora espera estos endpoints en el backend:
- `POST /api/users/login` - Autenticación con email y password
- `GET /api/users/verify` - Verificación de token JWT (opcional)
- `POST /api/users/logout` - Cierre de sesión (opcional)

## 🚀 Uso y Migración

### Para Desarrolladores
1. Las funciones de `queriesUsuarios.js` mantienen la misma interfaz externa
2. Los componentes que usan `ProtectedRoute` no requieren cambios
3. El login ahora maneja estados de carga y errores automáticamente

### Para Testing
- Use las funciones `login()`, `logout()`, y `verifyAuth()` para pruebas
- El `apiClient` incluye logging detallado en modo desarrollo
- Los errores de red se manejan graciosamente con fallbacks

## 📝 Notas de Implementación

- **Compatibilidad**: Se mantiene localStorage como fallback para datos de UI
- **Performance**: Se reduce el número de peticiones eliminando la carga innecesaria de usuarios
- **UX**: Mejores mensajes de error y estados de carga
- **Mantenibilidad**: Código más limpio y separación clara de responsabilidades

## ⚠️ Consideraciones Importantes

1. **CORS**: El backend debe estar configurado para aceptar credentials
2. **HTTPS**: En producción, las cookies JWT requieren HTTPS
3. **Expiración**: Implementar renovación de tokens para sesiones largas
4. **Logout**: Asegurar que el backend invalide las cookies en logout

---

*Documentación generada el 1 de octubre de 2025*
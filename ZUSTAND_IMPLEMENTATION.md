# Implementación de Zustand para Gestión de Estado de Usuario

Este proyecto ahora utiliza **Zustand** para manejar el estado global del usuario autenticado, implementando el flujo de autenticación con cookies JWT.

## 🏗️ Arquitectura Implementada

### Store de Usuario (`src/store/useUserStore.js`)
Store global que maneja:
- **Estado del usuario**: datos personales, rol, estado de autenticación
- **Operaciones**: login, logout, fetchUserData, verifyAuth
- **Estados de carga**: isLoading, error handling

### Flujo de Autenticación

#### 🔄 Primer Login:
1. Usuario ingresa credenciales en `/login`
2. Se ejecuta `useUserStore.login(email, password)`
3. Backend responde con datos del usuario + cookie JWT httpOnly
4. Zustand guarda los datos en el estado global
5. UI se actualiza inmediatamente
6. Redirección automática según rol del usuario

#### 🔄 Recarga de Página/Reinicio:
1. Zustand pierde el estado (es memoria)
2. `useAuthInitializer` detecta que no hay datos
3. Se ejecuta automáticamente `fetchUserData()` que llama `/getMe`
4. Backend valida la cookie JWT y devuelve datos del usuario
5. Zustand se repobla con datos frescos
6. UI se actualiza con la información del usuario

## 📁 Archivos Modificados

### Nuevos Archivos:
- `src/store/useUserStore.js` - Store principal de Zustand
- `src/hooks/useAuthInitializer.js` - Hook para inicializar autenticación

### Archivos Actualizados:
- `src/App.jsx` - Inicialización de autenticación al cargar la app
- `src/pages/Login.jsx` - Uso del store para login
- `src/components/Header.jsx` - Uso del store para mostrar datos del usuario
- `src/components/ProtectedRoute.jsx` - Verificación con Zustand

## 🎯 Uso del Store

### En cualquier componente:
```jsx
import useUserStore from '../store/useUserStore';

function MiComponente() {
  const { user, isAuthenticated, isLoading, login, logout } = useUserStore();

  // Datos del usuario disponibles globalmente
  console.log(user); // { id, name, email, role }
  console.log(isAuthenticated); // boolean
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.name}!</p>
      ) : (
        <p>No autenticado</p>
      )}
    </div>
  );
}
```

### Operaciones disponibles:
```jsx
// Login
const result = await login(email, password);

// Logout
await logout();

// Verificar autenticación
const authResult = await verifyAuth();

// Obtener datos frescos del usuario
const userData = await fetchUserData();

// Limpiar errores
clearError();

// Actualizar datos del usuario
updateUser({ name: 'Nuevo Nombre' });
```

## 🔒 Endpoints del Backend Utilizados

- `POST /api/login` - Autenticación y establecimiento de cookie
- `GET /api/getMe` - Obtener datos del usuario actual (requiere cookie válida)
- `POST /api/users/logout` - Cerrar sesión y limpiar cookie

## ⚡ Ventajas de esta Implementación

1. **Estado Global Sincronizado**: Todos los componentes tienen acceso inmediato a los datos del usuario
2. **Persistencia con Cookies**: La sesión se mantiene incluso al cerrar el navegador
3. **Recuperación Automática**: Al recargar la página, automáticamente se recuperan los datos
4. **Seguridad**: Las cookies httpOnly no son accesibles desde JavaScript malicioso
5. **Performance**: Evita múltiples llamadas innecesarias al backend
6. **UX Mejorada**: Loading states y manejo de errores centralizado

## 🚀 Flujo de Desarrollo

Para trabajar con este sistema:

1. **Desarrollo de nuevas funcionalidades**: Usa `useUserStore()` para acceder a datos del usuario
2. **Rutas protegidas**: Envuelve componentes con `<ProtectedRoute role={['admin']} />`
3. **Mostrar datos del usuario**: Accede directamente a `user` desde el store
4. **Manejar logout**: Usa `logout()` del store, que limpia todo automáticamente

## 🔧 Variables de Entorno

Asegúrate de tener configurado en `.env`:
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_API_USUARIOS=http://localhost:4000/api/users
VITE_API_PRODUCTOS=http://localhost:4000/api/products
```

## 📝 Notas Importantes

- El store se reinicia completamente al recargar la página (comportamiento normal de Zustand)
- La inicialización automática ocurre en `App.jsx` usando `useAuthInitializer`
- Los datos del usuario siempre vienen del backend, garantizando consistencia
- El localStorage ya no se usa para datos de usuario (solo cookies del backend)
# 🎓 Guión de Clase: Implementación de Zustand para Gestión de Estado Global

## 📋 Información de la Clase
- **Tema:** Gestión de Estado Global con Zustand en React
- **Duración estimada:** 60-90 minutos
- **Nivel:** Intermedio-Avanzado
- **Tecnologías:** React, Zustand, Axios, JWT Cookies

---

## 🎯 Objetivos de Aprendizaje

Al finalizar esta clase, los estudiantes podrán:
1. Entender qué es Zustand y por qué usar gestión de estado global
2. Implementar un store de Zustand para autenticación de usuarios
3. Integrar el store con componentes React
4. Manejar flujos de autenticación con cookies JWT
5. Implementar recuperación automática de estado al recargar la página

---

## 📖 Estructura de la Clase

### **PARTE 1: Introducción Teórica (15 minutos)**

#### 🤔 ¿Por qué necesitamos gestión de estado global?

*"Imaginen que tienen una aplicación con 20 componentes y necesitan saber si el usuario está logueado en todos ellos..."*

**Problemas sin estado global:**
```jsx
// 😵 Prop Drilling - pasar datos por muchos niveles
<App user={user}>
  <Header user={user}>
    <UserMenu user={user}>
      <UserAvatar user={user} />
    </UserMenu>
  </Header>
</App>
```

**Soluciones tradicionales:**
- ❌ **localStorage:** No reactivo, datos pueden quedar obsoletos
- ❌ **Context API:** Boilerplate excesivo, re-renders innecesarios
- ❌ **Redux:** Demasiado complejo para casos simples

#### 🚀 ¿Qué es Zustand?

*"Zustand es alemán y significa 'estado'. Es una librería de gestión de estado minimalista para React."*

**Ventajas de Zustand:**
- ✅ **Simplicidad:** Menos código, fácil de entender
- ✅ **Performance:** Solo re-renderiza componentes que usan el estado
- ✅ **TypeScript:** Excelente soporte nativo
- ✅ **Flexibilidad:** Funciona con cualquier patrón
- ✅ **Tamaño:** Solo 2.9kb minificado

---

### **PARTE 2: Demostración Práctica (20 minutos)**

#### 🛠️ Instalación y Setup Básico

*"Vamos a empezar desde cero. Primero instalamos Zustand..."*

```bash
npm install zustand
```

#### 📁 Creando nuestro primer Store

*"Un store en Zustand es simplemente una función que retorna un objeto con estado y acciones."*

```jsx
// src/store/useUserStore.js
import { create } from 'zustand';

const useUserStore = create((set, get) => ({
  // 📊 Estado inicial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // 🔧 Acciones
  setUser: (userData) => set({ 
    user: userData, 
    isAuthenticated: true 
  }),
  
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false 
  })
}));
```

#### 🎨 Usando el Store en Componentes

*"Ahora veamos cómo usar este store en cualquier componente..."*

```jsx
// Cualquier componente
import useUserStore from '../store/useUserStore';

function Header() {
  const { user, isAuthenticated } = useUserStore();
  
  return (
    <header>
      {isAuthenticated ? (
        <span>¡Hola, {user.name}!</span>
      ) : (
        <span>No autenticado</span>
      )}
    </header>
  );
}
```

---

### **PARTE 3: Caso de Uso Real - Autenticación (25 minutos)**

#### 🎯 El Problema que Vamos a Resolver

*"Tenemos una aplicación con autenticación por cookies JWT. Necesitamos:"*

1. **Login:** Guardar datos del usuario globalmente
2. **Navegación:** Mostrar información del usuario en toda la app
3. **Recarga:** Recuperar datos automáticamente al recargar
4. **Logout:** Limpiar estado en toda la aplicación

#### 🏗️ Arquitectura de la Solución

*"Vamos a ver cómo estructuramos esto paso a paso..."*

**Flujo de Autenticación:**
```
🔄 Primer Login:
Usuario → Login Form → API → Cookie + Datos → Zustand → UI actualizada

🔄 Recarga de Página:
App Load → Zustand vacío → fetchUserData() → /api/me → Zustand poblado
```

#### 💻 Implementación del Store Completo

*"Ahora vamos a crear el store real que utilizamos en producción..."*

```jsx
// src/store/useUserStore.js
import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set, get) => ({
  // Estado
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Acción de Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post('/api/login', 
        { email, password },
        { withCredentials: true }
      );
      
      const userData = {
        id: response.data.user.id,
        name: response.data.user.username,
        email: response.data.user.email,
        role: response.data.user.role
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      return { success: true, user: userData };
    } catch (error) {
      set({ 
        error: error.response?.data?.mensaje,
        isLoading: false 
      });
      return { success: false };
    }
  },

  // Recuperar datos del usuario
  fetchUserData: async () => {
    try {
      const response = await axios.get('/api/me', {
        withCredentials: true
      });
      
      const userData = {
        id: response.data.id,
        name: response.data.username,
        email: response.data.email,
        role: response.data.role
      };
      
      set({ 
        user: userData, 
        isAuthenticated: true 
      });
      
      return { success: true };
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false 
      });
      return { success: false };
    }
  }
}));
```

---

### **PARTE 4: Integración con la Aplicación (15 minutos)**

#### 🚀 Inicialización Automática

*"Queremos que al cargar la app, automáticamente verifique si hay una sesión activa..."*

```jsx
// src/hooks/useAuthInitializer.js
import { useEffect } from 'react';
import useUserStore from '../store/useUserStore';

const useAuthInitializer = () => {
  const { user, fetchUserData } = useUserStore();

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
  }, []);

  return useUserStore();
};
```

#### 🎨 Componente Principal

*"En App.jsx iniciamos la autenticación..."*

```jsx
// src/App.jsx
import useAuthInitializer from './hooks/useAuthInitializer';

function App() {
  const { isLoading } = useAuthInitializer();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Header />
      <Routes>
        {/* Rutas */}
      </Routes>
    </>
  );
}
```

#### 🔐 Rutas Protegidas

*"También podemos proteger rutas usando el estado global..."*

```jsx
// src/components/ProtectedRoute.jsx
import useUserStore from '../store/useUserStore';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};
```

---

### **PARTE 5: Demostración en Vivo (10 minutos)**

#### 🖥️ Demo Interactiva

*"Ahora vamos a ver esto funcionando en tiempo real..."*

**Puntos a demostrar:**

1. **Login:** 
   - Abrir DevTools → Network
   - Hacer login → Mostrar cookie JWT
   - Ver estado en React DevTools

2. **Estado Global:**
   - Login → Header se actualiza inmediatamente
   - Navegar entre páginas → Datos persisten

3. **Recarga de Página:**
   - Recargar → Loading → Datos recuperados automáticamente

4. **Logout:**
   - Logout → Estado limpio → Cookie eliminada

---

### **PARTE 6: Mejores Prácticas y Tips (5 minutos)**

#### ✅ Do's (Hacer)

```jsx
// ✅ Usar selectores específicos
const userName = useUserStore(state => state.user?.name);

// ✅ Acciones async con manejo de errores
const login = async (email, password) => {
  try {
    // lógica
  } catch (error) {
    // manejo de error
  }
};

// ✅ Estados de loading
const { isLoading } = useUserStore();
```

#### ❌ Don'ts (No hacer)

```jsx
// ❌ No destructurar todo el store innecesariamente
const store = useUserStore(); // Solo si necesitas todo

// ❌ No mutar el estado directamente
state.user.name = "nuevo"; // ❌
set(state => ({ user: { ...state.user, name: "nuevo" }})); // ✅

// ❌ No crear múltiples stores para el mismo dominio
```

---

## 🎯 Preguntas para la Audiencia

### Durante la clase:
1. *"¿Alguien ha usado Context API? ¿Qué problemas encontraron?"*
2. *"¿Cómo manejan actualmente el estado del usuario en sus apps?"*
3. *"¿Qué piensan de esta sintaxis comparada con Redux?"*

### Al final:
1. *"¿En qué otros casos usarían Zustand?"*
2. *"¿Qué les pareció más útil de lo que vimos?"*
3. *"¿Tienen preguntas sobre la implementación?"*

---

## 📝 Ejercicio Práctico (Opcional - 15 minutos)

*"Ahora van a implementar ustedes..."*

**Tarea:** Crear un store simple para manejo de carrito de compras

```jsx
// Estructura sugerida:
const useCartStore = create((set) => ({
  items: [],
  total: 0,
  
  addItem: (product) => {
    // Implementar
  },
  
  removeItem: (id) => {
    // Implementar
  },
  
  calculateTotal: () => {
    // Implementar
  }
}));
```

---

## 🎁 Recursos Adicionales

### Para compartir con los estudiantes:

1. **Documentación oficial:** https://zustand-demo.pmnd.rs/
2. **Repositorio del proyecto:** [Link a tu repo]
3. **Documentación del proyecto:** `ZUSTAND_IMPLEMENTATION.md`
4. **Ejemplos prácticos:** `EJEMPLOS_USO_ZUSTAND.jsx`

### Comparación con otras librerías:

| Librería | Líneas de código | Complejidad | Performance |
|----------|------------------|-------------|-------------|
| **Zustand** | ~50 líneas | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Redux Toolkit | ~150 líneas | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context API | ~100 líneas | ⭐⭐ | ⭐⭐⭐ |

---

## 💡 Tips para el Presentador

### Antes de la clase:
- [ ] Tener el proyecto funcionando
- [ ] Preparar ejemplos en CodeSandbox como backup
- [ ] Revisar React DevTools extension

### Durante la presentación:
- [ ] Usar fuente grande (16px+) en el editor
- [ ] Explicar cada línea de código importante
- [ ] Hacer pausas para preguntas
- [ ] Usar analogías del mundo real

### Frases clave para usar:
- *"La magia de Zustand es su simplicidad..."*
- *"Noten cómo no necesitamos providers ni wrappers..."*
- *"Esto es todo el boilerplate que necesitamos..."*
- *"En producción, esto escala perfectamente..."*

---

## 🎯 Cierre de la Clase

*"Para resumir, Zustand nos permite:"*

1. ✅ **Gestión simple** de estado global
2. ✅ **Performance optimizada** sin re-renders innecesarios  
3. ✅ **Código limpio** sin boilerplate excesivo
4. ✅ **Integración perfecta** con React moderno
5. ✅ **Escalabilidad** para aplicaciones grandes

*"¿Preguntas? ¿Dudas? ¿Quién se anima a implementarlo en su próximo proyecto?"*

---

**¡Buena suerte con tu clase! 🚀✨**
# 📋 Snippets de Código para la Clase

## 1. Store Básico (Para empezar)

```jsx
// src/store/useCounterStore.js
import { create } from 'zustand';

const useCounterStore = create((set, get) => ({
  // Estado
  count: 0,
  
  // Acciones
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  
  // Getter computed
  isPositive: () => get().count > 0
}));

export default useCounterStore;
```

## 2. Componente usando Counter Store

```jsx
// src/components/Counter.jsx
import useCounterStore from '../store/useCounterStore';

function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();
  
  return (
    <div>
      <h2>Contador: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default Counter;
```

## 3. Store de Usuario (Versión Simplificada)

```jsx
// src/store/useUserStore.js - Versión Simple
import { create } from 'zustand';

const useUserStore = create((set) => ({
  // Estado inicial
  user: null,
  isAuthenticated: false,
  
  // Acciones
  setUser: (userData) => set({ 
    user: userData, 
    isAuthenticated: true 
  }),
  
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false 
  })
}));

export default useUserStore;
```

## 4. Store de Usuario (Versión con API)

```jsx
// src/store/useUserStore.js - Versión Completa
import { create } from 'zustand';
import axios from 'axios';

const useUserStore = create((set, get) => ({
  // Estado
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Login
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
        isLoading: false,
        error: null
      });
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.mensaje || 'Error de conexión';
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      
      return { success: false, message: errorMessage };
    }
  },

  // Obtener datos del usuario
  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    
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
        isAuthenticated: true, 
        isLoading: false,
        error: null
      });
      
      return { success: true, user: userData };
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
      
      return { success: false };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await axios.post('/api/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
    }
  },

  // Limpiar errores
  clearError: () => set({ error: null })
}));

export default useUserStore;
```

## 5. Hook de Inicialización

```jsx
// src/hooks/useAuthInitializer.js
import { useEffect } from 'react';
import useUserStore from '../store/useUserStore';

const useAuthInitializer = () => {
  const { user, fetchUserData, isLoading, isAuthenticated } = useUserStore();

  useEffect(() => {
    // Solo inicializar si no tenemos datos del usuario
    if (!user) {
      fetchUserData();
    }
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    isLoading,
    user,
    isAuthenticated
  };
};

export default useAuthInitializer;
```

## 6. App.jsx con Inicialización

```jsx
// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import useAuthInitializer from "./hooks/useAuthInitializer";

function App() {
  // Inicializar la autenticación al cargar la aplicación
  const { isLoading } = useAuthInitializer();

  // Mostrar loading mientras se inicializa la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
```

## 7. Header Component

```jsx
// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      navigate('/login');
    }
  };

  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mi App</h1>
        
        <div>
          {isAuthenticated && user ? (
            <>
              <span style={{ marginRight: '1rem' }}>
                ¡Hola, {user.name}! ({user.role})
              </span>
              <button onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
```

## 8. Login Component

```jsx
// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { login, isLoading, error, clearError, user, isAuthenticated } = useUserStore();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Limpiar errores cuando el usuario escriba
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, error, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // La redirección se maneja en el useEffect de arriba
      }
    } catch (err) {
      console.error('Error durante el login:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Iniciar Sesión</h2>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '1rem', 
          padding: '0.5rem', 
          border: '1px solid red', 
          borderRadius: '4px',
          backgroundColor: '#ffe6e6'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="password"
            placeholder='Contraseña'
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

## 9. Protected Route Component

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useUserStore from "../store/useUserStore";

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useUserStore();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol específico, verificar que el usuario lo tenga
  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      if (user.role !== role) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
```

## 10. Ejercicio: Cart Store (Para los estudiantes)

```jsx
// Ejercicio: Crear store para carrito de compras
// src/store/useCartStore.js

import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  // Estado inicial
  items: [],
  total: 0,
  
  // Agregar producto
  addItem: (product) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // Si ya existe, incrementar cantidad
      set(state => ({
        items: state.items.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      // Si no existe, agregar nuevo
      set(state => ({
        items: [...state.items, { ...product, quantity: 1 }]
      }));
    }
    
    // Recalcular total
    get().calculateTotal();
  },
  
  // Remover producto
  removeItem: (id) => {
    set(state => ({
      items: state.items.filter(item => item.id !== id)
    }));
    get().calculateTotal();
  },
  
  // Calcular total
  calculateTotal: () => {
    const items = get().items;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    set({ total });
  },
  
  // Limpiar carrito
  clearCart: () => set({ items: [], total: 0 })
}));

export default useCartStore;
```

## 11. Uso del Cart Store

```jsx
// src/components/CartComponent.jsx
import useCartStore from '../store/useCartStore';

function CartComponent() {
  const { items, total, addItem, removeItem, clearCart } = useCartStore();
  
  const sampleProduct = {
    id: 1,
    name: 'Producto Demo',
    price: 100
  };

  return (
    <div>
      <h3>Carrito de Compras</h3>
      
      <button onClick={() => addItem(sampleProduct)}>
        Agregar Producto Demo
      </button>
      
      <div>
        <h4>Items: {items.length}</h4>
        <h4>Total: ${total}</h4>
        
        {items.map(item => (
          <div key={item.id} style={{ margin: '0.5rem 0' }}>
            {item.name} - Cantidad: {item.quantity} - ${item.price * item.quantity}
            <button onClick={() => removeItem(item.id)}>Eliminar</button>
          </div>
        ))}
        
        {items.length > 0 && (
          <button onClick={clearCart}>Limpiar Carrito</button>
        )}
      </div>
    </div>
  );
}

export default CartComponent;
```

---

## 💡 Tips para Copiar y Pegar Durante la Clase

1. **Empieza con el Counter Store** (simple) para mostrar conceptos básicos
2. **Luego muestra el User Store** (complejo) para caso real
3. **Usa los componentes** uno por uno para mostrar integración
4. **Termina con el ejercicio del Cart** para que practiquen

¡Todo listo para una clase exitosa! 🚀
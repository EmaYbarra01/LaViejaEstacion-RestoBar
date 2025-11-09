# 📊 Slides de Apoyo Visual para la Clase

## Slide 1: Título
```
🎯 GESTIÓN DE ESTADO GLOBAL CON ZUSTAND
════════════════════════════════════════
    De localStorage a Estado Reactivo
    
         React + Zustand + JWT
```

## Slide 2: El Problema
```
❌ PROP DRILLING
═══════════════

<App user={user}>
  <Header user={user}>
    <Navigation user={user}>
      <UserMenu user={user}>
        <UserAvatar user={user} />
      </UserMenu>
    </Navigation>
  </Header>
</App>

¿Familiar? 😅
```

## Slide 3: Soluciones Existentes
```
⚖️ OPCIONES DISPONIBLES
═══════════════════════

❌ localStorage      → No reactivo
❌ Context API       → Boilerplate + Re-renders  
❌ Redux            → Complejidad excesiva
✅ Zustand          → Simple + Performante
```

## Slide 4: ¿Por qué Zustand?
```
🚀 VENTAJAS DE ZUSTAND
══════════════════════

✅ Tamaño:     2.9kb (vs Redux 47kb)
✅ Código:     -70% líneas vs Redux
✅ Learning:   5 minutos vs 2 horas
✅ Performance: Solo re-render necesarios
✅ TypeScript: Soporte nativo perfecto
```

## Slide 5: Comparación Visual
```
📊 LÍNEAS DE CÓDIGO REQUERIDAS
══════════════════════════════

Redux Toolkit:    150+ líneas
Context API:      100+ líneas
Zustand:          50 líneas ⭐

Para el mismo resultado!
```

## Slide 6: Sintaxis Básica
```jsx
💻 ZUSTAND EN 30 SEGUNDOS
═════════════════════════

// 1. Crear store
const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ 
    count: state.count + 1 
  }))
}))

// 2. Usar en componente
function Counter() {
  const { count, increment } = useStore()
  return <button onClick={increment}>{count}</button>
}

¡Eso es todo! 🎉
```

## Slide 7: Nuestro Caso de Uso
```
🎯 AUTENTICACIÓN CON ZUSTAND
═══════════════════════════

Problema:
- Login con cookies JWT
- Estado del usuario global
- Recuperación automática al recargar
- Logout limpio

Solución: Store centralizado ⚡
```

## Slide 8: Flujo de Autenticación
```
🔄 FLUJO COMPLETO
════════════════

1️⃣ Login:
   Form → API → Cookie + Datos → Zustand → UI ✨

2️⃣ Navegación:  
   Cualquier componente → useUserStore() → Datos 📊

3️⃣ Recarga:
   App Load → fetchUserData() → /api/me → Zustand 🔄

4️⃣ Logout:
   logout() → API + Limpiar estado → UI 🧹
```

## Slide 9: Estado del Store
```jsx
📦 ESTRUCTURA DEL STORE
══════════════════════

{
  // Estado
  user: { id, name, email, role },
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
  
  // Acciones
  login: async (email, password) => {...},
  logout: async () => {...},
  fetchUserData: async () => {...}
}
```

## Slide 10: Antes vs Después
```
🔀 TRANSFORMACIÓN
═══════════════

ANTES (localStorage):
❌ No reactivo
❌ Datos pueden estar obsoletos  
❌ Código duplicado en cada componente
❌ Sin loading states

DESPUÉS (Zustand):
✅ Reactivo en tiempo real
✅ Datos siempre frescos
✅ Código centralizado
✅ Loading y errores incluidos
```

## Slide 11: Beneficios en Producción
```
🏭 EN PRODUCCIÓN
═══════════════

Performance:
- Solo re-renderiza componentes que usan el estado
- No context providers anidados

Mantenibilidad:
- Lógica centralizada
- Fácil debugging
- Tests simples

Escalabilidad:
- Múltiples stores independientes
- TypeScript robusto
```

## Slide 12: Demo Time
```
🖥️ DEMOSTRACIÓN EN VIVO
══════════════════════

Vamos a ver:
1. Login → Estado global actualizado
2. Navegación → Datos persistentes  
3. Recarga → Recuperación automática
4. DevTools → Estado visible
5. Logout → Limpieza completa

¡Abran DevTools! 🛠️
```

## Slide 13: Casos de Uso
```
🎯 ¿CUÁNDO USAR ZUSTAND?
══════════════════════

✅ Estado compartido entre componentes
✅ Autenticación de usuarios
✅ Carrito de compras
✅ Configuraciones de la app
✅ Cache de datos
✅ Estado de formularios complejos

❌ Estado local simple (useState es mejor)
```

## Slide 14: Ejercicio Práctico
```
💪 ¡TU TURNO!
════════════

Crear un store para carrito de compras:

- items: []
- total: 0
- addItem(product)
- removeItem(id)  
- calculateTotal()

⏰ 15 minutos
¿Quién se anima? 🚀
```

## Slide 15: Recursos
```
📚 PARA SEGUIR APRENDIENDO
═════════════════════════

📖 Docs oficiales: zustand-demo.pmnd.rs
🎮 Playground: codesandbox.io
📁 Código del proyecto: [tu-repo]
📝 Documentación: ZUSTAND_IMPLEMENTATION.md

¡A implementar! 💻
```

## Slide 16: Resumen Final
```
🎯 RESUMEN
═════════

Zustand nos da:
✅ Simplicidad extrema
✅ Performance optimizada
✅ Código limpio y mantenible
✅ Integración perfecta con React
✅ Escalabilidad para apps grandes

¿Preguntas? 🤔
¿Quién lo va a usar? 🙋‍♂️
```

## Slide 17: ¡Gracias!
```
🎉 ¡GRACIAS!
═══════════

    Estado global nunca fue tan fácil
    
           Zustand FTW! 🚀
           
    ¿Preguntas? ¿Dudas? ¿Comentarios?
```
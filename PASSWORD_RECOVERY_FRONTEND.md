# 🔐 Sistema de Recuperación de Contraseña - Frontend

Documentación del sistema de recuperación de contraseña implementado en el frontend de CRUD-COM-12.

## 📁 Archivos Creados

### Páginas (Pages)
- `src/pages/ForgotPassword.jsx` - Formulario para solicitar recuperación
- `src/pages/ForgotPassword.css` - Estilos de la página de solicitud
- `src/pages/ResetPassword.jsx` - Formulario para restablecer contraseña
- `src/pages/ResetPassword.css` - Estilos de la página de restablecimiento

### Helpers
- `src/helpers/queriesPasswordReset.js` - Funciones de API para recuperación

### Actualizaciones
- `src/App.jsx` - Rutas agregadas
- `src/pages/Login.jsx` - Link "¿Olvidaste tu contraseña?" agregado

## 🎨 Características Implementadas

### Página: Forgot Password (`/forgot-password`)

#### Características:
- ✅ Formulario simple con campo de email
- ✅ Validación de email
- ✅ Loading state durante el envío
- ✅ Mensajes de éxito y error
- ✅ Vista de confirmación después de enviar
- ✅ Opción para reenviar correo
- ✅ Link para volver al login
- ✅ Diseño responsive y moderno

#### Estados:
```jsx
{
  email: '',              // Email ingresado
  loading: false,         // Estado de carga
  emailSent: false,       // Email enviado exitosamente
  message: {              // Mensaje de feedback
    type: 'success/error',
    text: 'mensaje'
  }
}
```

### Página: Reset Password (`/reset-password?token=xxx`)

#### Características:
- ✅ Verificación automática del token al cargar
- ✅ Loading durante verificación
- ✅ Validación en tiempo real
- ✅ Indicador de fortaleza de contraseña
- ✅ Visualización de contraseña (mostrar/ocultar)
- ✅ Confirmación de contraseña con indicador de coincidencia
- ✅ Lista de requisitos de contraseña
- ✅ Manejo de tokens inválidos o expirados
- ✅ Redirección automática al login después del éxito
- ✅ Diseño responsive y moderno

#### Estados:
```jsx
{
  passwords: {
    newPassword: '',      // Nueva contraseña
    confirmPassword: ''   // Confirmación
  },
  loading: false,         // Estado de carga
  verifying: true,        // Verificando token
  tokenValid: false,      // Token es válido
  userEmail: '',          // Email del usuario
  showPassword: false,    // Mostrar contraseña
  showConfirmPassword: false, // Mostrar confirmación
  passwordStrength: 'weak/medium/strong', // Fortaleza
  message: { type: '', text: '' }
}
```

## 🔄 Flujo de Usuario

### 1. Usuario olvida su contraseña

```
Login Page
    ↓
Usuario hace clic en "¿Olvidaste tu contraseña?"
    ↓
/forgot-password
```

### 2. Solicitud de recuperación

```
Usuario ingresa su email
    ↓
Click en "Enviar Instrucciones"
    ↓
POST /api/auth/forgot-password
    ↓
Mensaje de confirmación
    ↓
Email enviado
```

### 3. Usuario recibe y abre el email

```
Email con enlace
    ↓
Click en "Restablecer Contraseña"
    ↓
/reset-password?token=xxx
```

### 4. Restablecimiento de contraseña

```
Página carga y verifica token
    ↓
GET /api/auth/verify-reset-token/:token
    ↓
Si válido: Mostrar formulario
Si inválido: Mostrar error
    ↓
Usuario ingresa nueva contraseña
    ↓
POST /api/auth/reset-password
    ↓
Success → Redirect a /login
```

## 🎨 Componentes UI

### Indicador de Fortaleza de Contraseña

```jsx
<div className="password-strength">
  <div className={`strength-bar strength-${passwordStrength}`}>
    <div className="strength-fill"></div>
  </div>
  <span className={`strength-text strength-${passwordStrength}`}>
    {/* Débil / Media / Fuerte */}
  </span>
</div>
```

**Niveles:**
- 🔴 Débil: < 6 caracteres
- 🟡 Media: 6-9 caracteres
- 🟢 Fuerte: 10+ caracteres con mayúsculas, números y símbolos

### Visualización de Contraseña

```jsx
<div className="password-input-wrapper">
  <input type={showPassword ? 'text' : 'password'} />
  <button onClick={() => setShowPassword(!showPassword)}>
    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
  </button>
</div>
```

### Indicador de Coincidencia

```jsx
<small className={`match-indicator ${match ? 'match' : 'no-match'}`}>
  {match ? (
    <>✓ Las contraseñas coinciden</>
  ) : (
    <>✗ Las contraseñas no coinciden</>
  )}
</small>
```

## 🔧 Funciones Helper

### `queriesPasswordReset.js`

```javascript
// Solicitar recuperación
requestPasswordReset(email)

// Verificar token
verifyResetToken(token)

// Restablecer contraseña
resetPassword(token, newPassword)
```

## 🎨 Estilos y Diseño

### Paleta de Colores
- **Principal**: Gradiente púrpura (#667eea → #764ba2)
- **Éxito**: Verde (#28a745)
- **Error**: Rojo (#dc3545)
- **Advertencia**: Amarillo (#ffc107)
- **Fondo**: Blanco con sombras suaves

### Animaciones
- ✨ Slide-in al cargar página
- ✨ Pulse para íconos de éxito
- ✨ Hover en botones
- ✨ Transiciones suaves

### Responsive
- 📱 Adaptado para móviles
- 💻 Optimizado para tablets
- 🖥️ Desktop con max-width

## 🔐 Validaciones Frontend

### Email (Forgot Password)
```javascript
- Campo requerido
- Formato de email válido
- Normalizado (trim, lowercase)
```

### Contraseña (Reset Password)
```javascript
- Mínimo 6 caracteres (requerido)
- Confirmación debe coincidir
- Indicador visual de fortaleza
- Requisitos mostrados en tiempo real
```

## 🚀 Uso

### Integración en tu aplicación

1. **Importar componentes en App.jsx:**
```jsx
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
```

2. **Agregar rutas:**
```jsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

3. **Agregar link en Login:**
```jsx
<Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
```

## 🧪 Testing

### Casos de Prueba

#### Forgot Password:
1. ✓ Email válido → Mensaje de éxito
2. ✓ Email inválido → Error de validación
3. ✓ Campo vacío → Error de validación
4. ✓ Email no existente → Mensaje genérico (seguridad)
5. ✓ Botón de reenviar funciona

#### Reset Password:
1. ✓ Token válido → Muestra formulario
2. ✓ Token inválido → Muestra error con opciones
3. ✓ Token expirado → Muestra error
4. ✓ Contraseñas no coinciden → Error
5. ✓ Contraseña muy corta → Error
6. ✓ Contraseña válida → Éxito y redirect

## 📱 Responsive Breakpoints

```css
@media (max-width: 576px) {
  /* Móviles */
  - Padding reducido
  - Fuentes más pequeñas
  - Botones a ancho completo
}

@media (min-width: 577px) and (max-width: 768px) {
  /* Tablets */
  - Diseño optimizado
}

@media (min-width: 769px) {
  /* Desktop */
  - Card con max-width
  - Centrado
}
```

## 🐛 Manejo de Errores

### Errores de Red
```javascript
try {
  // Fetch
} catch (error) {
  setMessage({
    type: 'error',
    text: 'Error de conexión. Intenta de nuevo.'
  });
}
```

### Token Inválido
```jsx
{!tokenValid && (
  <div className="error-container">
    <Link to="/forgot-password">Solicitar Nuevo Enlace</Link>
  </div>
)}
```

## 🔒 Seguridad Frontend

1. **No exponer información sensible**
   - Mensajes genéricos para emails no existentes
   - No revelar si un email está registrado

2. **Validación de entrada**
   - Sanitización de campos
   - Validación de formato

3. **Token en URL**
   - Solo lectura
   - No almacenado localmente
   - Usado una sola vez

## 📚 Dependencias

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "bootstrap-icons": "^1.x" // Para iconos
}
```

## 🎯 Próximas Mejoras

- [ ] Agregar temporizador de reenvío de email
- [ ] Soporte para múltiples idiomas
- [ ] Dark mode
- [ ] Animaciones más complejas
- [ ] Tests unitarios con Jest
- [ ] Tests E2E con Cypress

## 📞 Soporte

Para problemas o preguntas sobre la implementación del frontend, revisa:
1. El código de los componentes
2. La consola del navegador para errores
3. La documentación del backend (PASSWORD_RECOVERY_API.md)

---

**Desarrollado para CRUD-COM-12 - UTN TUP** 🎓

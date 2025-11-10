# 🔐 API de Recuperación de Contraseña - Ejemplos de Uso

Este documento contiene ejemplos de cómo usar los endpoints de recuperación de contraseña.

## 📋 Endpoints Disponibles

### 1. Solicitar Recuperación de Contraseña

**POST** `/api/auth/forgot-password`

Envía un correo electrónico al usuario con un token para restablecer su contraseña.

#### Request Body:
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Respuesta Exitosa (200):
```json
{
  "mensaje": "Si el email existe, recibirás un correo con las instrucciones para restablecer tu contraseña"
}
```

#### Ejemplo con cURL:
```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com"
  }'
```

#### Ejemplo con JavaScript (fetch):
```javascript
const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2. Restablecer Contraseña

**POST** `/api/auth/reset-password`

Restablece la contraseña del usuario usando el token recibido por email.

#### Request Body:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "newPassword": "nuevaContraseña123"
}
```

#### Respuesta Exitosa (200):
```json
{
  "mensaje": "Contraseña actualizada exitosamente"
}
```

#### Posibles Errores:

**Token inválido o expirado (400):**
```json
{
  "mensaje": "Token inválido o expirado"
}
```

**Contraseña muy corta (400):**
```json
{
  "mensaje": "La contraseña debe tener al menos 6 caracteres"
}
```

#### Ejemplo con cURL:
```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "newPassword": "nuevaContraseña123"
  }'
```

#### Ejemplo con JavaScript (fetch):
```javascript
const response = await fetch('http://localhost:4000/api/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    newPassword: 'nuevaContraseña123'
  })
});

const data = await response.json();
console.log(data);
```

---

### 3. Verificar Token (Opcional)

**GET** `/api/auth/verify-reset-token/:token`

Verifica si un token de recuperación es válido antes de mostrar el formulario de cambio de contraseña.

#### Parámetros:
- `token` (URL parameter): El token a verificar

#### Respuesta Exitosa (200):
```json
{
  "valid": true,
  "mensaje": "Token válido",
  "email": "usuario@ejemplo.com"
}
```

#### Token Inválido (400):
```json
{
  "valid": false,
  "mensaje": "Token inválido o expirado"
}
```

#### Ejemplo con cURL:
```bash
curl http://localhost:4000/api/auth/verify-reset-token/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### Ejemplo con JavaScript (fetch):
```javascript
const token = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const response = await fetch(`http://localhost:4000/api/auth/verify-reset-token/${token}`);
const data = await response.json();

if (data.valid) {
  console.log('Token válido para:', data.email);
} else {
  console.log('Token inválido o expirado');
}
```

---

## 🔄 Flujo Completo de Recuperación de Contraseña

### Paso 1: Usuario solicita recuperación
```javascript
// El usuario ingresa su email en el formulario
const email = 'usuario@ejemplo.com';

// Frontend envía solicitud
const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});

if (response.ok) {
  alert('Revisa tu correo electrónico');
}
```

### Paso 2: Usuario recibe email y hace clic en el enlace
El email contiene un enlace como:
```
http://localhost:5173/reset-password?token=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Paso 3: Frontend verifica el token (opcional pero recomendado)
```javascript
// Extraer token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Verificar si el token es válido
const response = await fetch(`http://localhost:4000/api/auth/verify-reset-token/${token}`);
const data = await response.json();

if (data.valid) {
  // Mostrar formulario de nueva contraseña
  console.log('Token válido para:', data.email);
} else {
  // Mostrar mensaje de error
  alert('El enlace ha expirado o es inválido');
}
```

### Paso 4: Usuario ingresa nueva contraseña
```javascript
const token = urlParams.get('token');
const newPassword = 'nuevaContraseñaSegura123';

const response = await fetch('http://localhost:4000/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, newPassword })
});

const data = await response.json();

if (response.ok) {
  alert('Contraseña actualizada exitosamente');
  // Redirigir al login
  window.location.href = '/login';
} else {
  alert(data.mensaje);
}
```

---

## 🔒 Características de Seguridad

1. **Tokens Hasheados**: Los tokens se almacenan hasheados en la base de datos
2. **Expiración Automática**: Los tokens expiran automáticamente después de 1 hora
3. **Un Solo Uso**: Los tokens se eliminan después de ser usados
4. **Email de Confirmación**: Se envía un email cuando la contraseña se cambia exitosamente
5. **No Revelación de Información**: No se revela si un email existe o no en el sistema

---

## 📧 Formato del Email Recibido

El usuario recibirá un email HTML con:

- 🔐 Encabezado claro de "Recuperación de Contraseña"
- 👤 Saludo personalizado con el nombre de usuario
- 🔘 Botón de "Restablecer Contraseña"
- 🔗 Link alternativo en texto plano
- ⚠️ Advertencias de seguridad
- ⏰ Información sobre la expiración (1 hora)

---

## 🧪 Testing con Thunder Client / Postman

### Colección de Pruebas

#### 1. Test: Solicitar recuperación con email válido
```
POST http://localhost:4000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "admin@admin.com"
}
```

#### 2. Test: Solicitar recuperación con email inválido
```
POST http://localhost:4000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "novalido"
}
```
**Resultado Esperado**: Error de validación

#### 3. Test: Verificar token válido
```
GET http://localhost:4000/api/auth/verify-reset-token/TOKEN_AQUI
```

#### 4. Test: Restablecer contraseña
```
POST http://localhost:4000/api/auth/reset-password
Content-Type: application/json

{
  "token": "TOKEN_DEL_EMAIL",
  "newPassword": "nuevaContraseña123"
}
```

#### 5. Test: Restablecer con token expirado
```
POST http://localhost:4000/api/auth/reset-password
Content-Type: application/json

{
  "token": "token_viejo_o_invalido",
  "newPassword": "nuevaContraseña123"
}
```
**Resultado Esperado**: Token inválido o expirado

---

## ⚙️ Variables de Entorno Necesarias

Asegúrate de tener configuradas estas variables en tu `.env`:

```env
EMAIL_USER=tu.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu.email@gmail.com
FRONTEND_URL=http://localhost:5173
```

---

## 🐛 Troubleshooting

### El email no llega:
1. Verifica que `EMAIL_USER` y `EMAIL_PASS` estén correctos
2. Revisa la carpeta de spam
3. Verifica que la contraseña de aplicación de Gmail esté activa
4. Revisa los logs del servidor para errores

### Token inválido:
1. Verifica que no haya pasado 1 hora desde la solicitud
2. El token solo se puede usar una vez
3. Asegúrate de copiar el token completo de la URL

### Error al enviar email:
1. Verifica tu conexión a internet
2. Asegúrate de que Gmail no esté bloqueando la aplicación
3. Revisa la configuración de nodemailer en `src/config/nodemailer.config.js`

---

## 📚 Recursos Adicionales

- [Documentación de Nodemailer](https://nodemailer.com/)
- [Contraseñas de Aplicación de Google](https://support.google.com/accounts/answer/185833)
- [Express Validator](https://express-validator.github.io/docs/)

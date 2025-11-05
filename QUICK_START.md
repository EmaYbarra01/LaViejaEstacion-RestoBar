# 🚀 Guía de Uso Rápido - RestoBar Backend

## 📖 Tabla de Contenidos

1. [Ejecutar Tests](#ejecutar-tests)
2. [Ver Documentación Swagger](#ver-documentación-swagger)
3. [Usar Middlewares](#usar-middlewares)
4. [Probar API con Swagger](#probar-api-con-swagger)
5. [Ejemplos de Código](#ejemplos-de-código)

---

## 🧪 Ejecutar Tests

### Todos los tests
```powershell
npm test
```

### Solo tests de middlewares
```powershell
npm test -- tests/auth/middlewares.test.js
```

### Con cobertura de código
```powershell
npm run test:coverage
```

Abre el reporte HTML en: `coverage/lcov-report/index.html`

### Modo watch (auto-reload)
```powershell
npm run test:watch
```

### Con output detallado
```powershell
npm run test:verbose
```

---

## 📚 Ver Documentación Swagger

### 1. Iniciar el servidor
```powershell
npm run dev
```

### 2. Abrir Swagger UI
Navega a: **http://localhost:4000/docs**

### 3. Características de Swagger UI

- **Try it out**: Probar endpoints directamente
- **Schemas**: Ver modelos de datos
- **Authorization**: Autenticar con JWT
- **Examples**: Ver ejemplos de request/response

### 4. Descargar especificación OpenAPI
**JSON**: http://localhost:4000/docs.json

---

## 🔐 Usar Middlewares

### Ejemplo 1: Ruta protegida básica

```javascript
import { Router } from 'express';
import verificarToken from '../auth/token-verify.js';

const router = Router();

// Solo usuarios autenticados
router.get('/mi-ruta', verificarToken, (req, res) => {
    // req.user contiene la información del usuario
    res.json({
        ok: true,
        usuario: req.user
    });
});
```

### Ejemplo 2: Ruta con rol específico

```javascript
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

// Solo administradores
router.delete('/productos/:id',
    verificarToken,
    verificarRol('Administrador'),
    eliminarProducto
);
```

### Ejemplo 3: Múltiples roles permitidos

```javascript
// Admin, Gerente o Cajero
router.post('/ventas',
    verificarToken,
    verificarRol('Administrador', 'Gerente', 'Cajero'),
    crearVenta
);
```

### Ejemplo 4: Acceder a datos del usuario

```javascript
const miController = (req, res) => {
    // Desde req.user (nuevo formato)
    const userId = req.user.id;
    const username = req.user.username;
    const role = req.user.role;
    const email = req.user.email;
    
    // O desde compatibilidad (formato antiguo)
    const userId2 = req.id;
    const username2 = req.nombre;
    const role2 = req.rol;
    
    res.json({
        mensaje: `Hola ${username}, tu rol es ${role}`
    });
};
```

---

## 🧪 Probar API con Swagger

### 1. Autenticarse

1. Ve a http://localhost:4000/docs
2. Busca el endpoint `POST /api/auth/login`
3. Click en "Try it out"
4. Ingresa credenciales:
```json
{
  "email": "admin@restobar.com",
  "password": "tu_password"
}
```
5. Click "Execute"
6. La cookie se guardará automáticamente

### 2. Usar endpoints protegidos

Después de login, puedes probar endpoints protegidos directamente.

**Ejemplo - Listar productos:**
1. Busca `GET /api/productos`
2. Click "Try it out"
3. Click "Execute"
4. Verás la respuesta con productos

### 3. Autenticación manual (Bearer Token)

Si prefieres usar header Authorization:

1. Click en el botón "Authorize" (🔒) arriba a la derecha
2. En "bearerAuth", ingresa el token JWT
3. Click "Authorize"
4. Ahora puedes usar todos los endpoints

---

## 💻 Ejemplos de Código

### Crear un Test Nuevo

```javascript
// tests/integration/mi-modulo.test.js
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// Importar rutas
import misRoutes from '../../src/routes/mi-ruta.js';
app.use('/api', misRoutes);

// Helper para token
const getToken = (role = 'admin') => {
    return jwt.sign(
        {
            usuarioId: 'test123',
            nombreUsuario: 'testuser',
            rol: role,
            email: 'test@test.com'
        },
        process.env.JWT_SECRET_KEY
    );
};

describe('Mi API Test', () => {
    test('Debe requerir autenticación', async () => {
        const response = await request(app).get('/api/mi-endpoint');
        expect(response.status).toBe(401);
    });

    test('Debe aceptar token válido', async () => {
        const token = getToken();
        const response = await request(app)
            .get('/api/mi-endpoint')
            .set('Cookie', [`jwt=${token}`]);
        
        expect(response.status).not.toBe(401);
    });
});
```

### Documentar Endpoint con Swagger

```javascript
/**
 * @swagger
 * /api/mi-endpoint:
 *   get:
 *     summary: Descripción breve
 *     tags: [MiTag]
 *     description: Descripción detallada del endpoint
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filtro
 *         schema:
 *           type: string
 *         description: Filtro opcional
 *     responses:
 *       200:
 *         description: Éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/mi-endpoint', verificarToken, miController);
```

### Manejar Errores del Middleware

```javascript
// En tu controlador
const miController = (req, res) => {
    try {
        // Tu lógica aquí
        
        // Los middlewares ya validaron:
        // ✓ Token es válido
        // ✓ Usuario tiene el rol correcto
        
        res.json({ ok: true, data: 'algo' });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error en el servidor',
            error: error.message
        });
    }
};
```

### Probar Autenticación Manualmente

```javascript
// Con fetch (JavaScript frontend)
const response = await fetch('http://localhost:4000/api/productos', {
    method: 'GET',
    credentials: 'include', // Importante para cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Con Authorization header
const response = await fetch('http://localhost:4000/api/productos', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${miToken}`,
        'Content-Type': 'application/json'
    }
});
```

### Probar con cURL (PowerShell)

```powershell
# Login
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@restobar.com","password":"123456"}' `
  -c cookies.txt

# Usar cookie guardada
curl http://localhost:4000/api/productos `
  -b cookies.txt

# Con Bearer Token
curl http://localhost:4000/api/productos `
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🐛 Debugging

### Ver logs de los middlewares

Los middlewares imprimen información útil en desarrollo:

```javascript
// En .env
NODE_ENV=development

// Verás logs como:
// ✓ Acceso concedido a username (admin)
// ⚠ Acceso denegado para username con rol cliente
```

### Errores comunes

#### Error: "No se proporcionó token de autenticación"
**Causa:** No hay token en cookie ni header  
**Solución:** Asegúrate de hacer login primero o enviar el header

#### Error: "Token expirado"
**Causa:** El token JWT ha expirado  
**Solución:** Hacer login nuevamente

#### Error: "Acceso denegado. Se requiere rol..."
**Causa:** El usuario no tiene el rol necesario  
**Solución:** Usar cuenta con rol correcto o ajustar permisos

---

## 📊 Ver Cobertura de Tests

Después de ejecutar `npm run test:coverage`:

```powershell
# Abrir reporte HTML
start coverage/lcov-report/index.html
```

El reporte muestra:
- ✅ Líneas cubiertas por tests
- ❌ Líneas no cubiertas
- 📊 Porcentaje de cobertura por archivo
- 🔍 Cobertura de branches y funciones

---

## 🎯 Checklist Rápido

### Antes de hacer un commit:

```powershell
# 1. Ejecutar tests
npm test

# 2. Verificar cobertura
npm run test:coverage

# 3. Verificar que Swagger funciona
npm run dev
# Abrir http://localhost:4000/docs

# 4. Si todo está ✅, hacer commit
git add .
git commit -m "feat: descripción del cambio"
```

---

## 📞 Recursos Útiles

- **Documentación de tests:** `TESTING_DOCS.md`
- **Resumen de implementación:** `IMPLEMENTATION_SUMMARY.md`
- **Swagger UI:** http://localhost:4000/docs
- **Health Check:** http://localhost:4000/api/health

---

## 🎓 Tips Pro

### 1. Desarrollo de Tests con Watch Mode
```powershell
npm run test:watch
```
Los tests se ejecutan automáticamente al guardar archivos.

### 2. Filtrar Tests
```powershell
# Solo tests con "login" en el nombre
npm test -- --testNamePattern=login

# Solo archivos de auth
npm test -- tests/auth
```

### 3. Debugging de Tests
```javascript
// Usar console.log en tests
test('Mi test', () => {
    console.log('Request:', request);
    console.log('Response:', response);
    expect(response.status).toBe(200);
});
```

### 4. Probar Swagger sin UI
```powershell
# Ver spec JSON
curl http://localhost:4000/docs.json
```

---

**¡Listo para usar!** 🚀

Si tienes dudas, revisa:
- `TESTING_DOCS.md` - Documentación completa
- `IMPLEMENTATION_SUMMARY.md` - Resumen ejecutivo
- Swagger UI en `/docs` - Documentación interactiva

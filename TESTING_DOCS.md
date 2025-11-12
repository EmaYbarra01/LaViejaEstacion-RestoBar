# Testing y Documentación - RestoBar API

## 📝 Resumen de Implementaciones

Se han implementado las siguientes mejoras en el proyecto:

### ✅ 1. Middlewares Mejorados

#### `token-verify.js`
- ✨ Soporte para tokens en cookies Y header Authorization
- 🔒 Validación robusta con manejo específico de errores JWT
- 📊 Mensajes de error descriptivos con códigos de error
- ⚡ Verificación de configuración del servidor

#### `verificar-rol.js`
- 🎯 Validación mejorada de roles con mensajes informativos
- 🔄 Soporte para múltiples roles permitidos
- 📝 Case-insensitive para comparación de roles
- 🛡️ Manejo robusto de errores con códigos específicos

### ✅ 2. Tests de Integración con Jest y Supertest

#### Configuración
- `jest.config.js` - Configuración completa de Jest
- `babel.config.test.js` - Transpilación para tests
- `.env.test` - Variables de entorno para testing
- `tests/setup.js` - Configuración inicial de tests

#### Tests Implementados

**Tests de Middlewares** (`tests/auth/middlewares.test.js`)
- ✓ Verificación de tokens válidos e inválidos
- ✓ Tokens expirados
- ✓ Tokens en cookies y headers
- ✓ Validación de roles
- ✓ Permisos y accesos

**Tests de Autenticación** (`tests/integration/auth.test.js`)
- ✓ Login
- ✓ Registro
- ✓ Logout
- ✓ Recuperación de contraseña
- ✓ Validaciones de campos

**Tests de Productos** (`tests/integration/productos.test.js`)
- ✓ CRUD de productos
- ✓ Permisos por rol
- ✓ Validaciones

**Tests de Pedidos** (`tests/integration/pedidos.test.js`)
- ✓ Gestión de pedidos
- ✓ Permisos de meseros y admin
- ✓ Estados de pedidos

### ✅ 3. Documentación de API con Swagger

#### Configuración
- `swagger.config.js` - Configuración completa de Swagger
- Integrado en `index.js`
- UI disponible en `/docs`
- Spec JSON en `/docs.json`

#### Características
- 📚 Documentación completa de endpoints
- 🔐 Esquemas de autenticación (Cookie y Bearer)
- 📋 Modelos de datos (Usuario, Producto, Pedido, Mesa)
- 🏷️ Tags organizados por módulos
- ⚠️ Respuestas de error estandarizadas
- ✨ Ejemplos de requests y responses

## 🚀 Cómo Usar

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar tests con output detallado
npm run test:verbose
```

### Ver Documentación de la API

1. Iniciar el servidor:
```bash
npm run dev
```

2. Abrir el navegador en:
```
http://localhost:4000/docs
```

3. También puedes obtener el JSON de la especificación:
```
http://localhost:4000/docs.json
```

## 📊 Estructura de Tests

```
tests/
├── setup.js                    # Configuración inicial
├── auth/
│   └── middlewares.test.js    # Tests de middlewares de auth
└── integration/
    ├── auth.test.js           # Tests de API de autenticación
    ├── productos.test.js      # Tests de API de productos
    └── pedidos.test.js        # Tests de API de pedidos
```

## 🔧 Configuración de Testing

### Variables de Entorno (.env.test)

El archivo `.env.test` contiene las variables para el entorno de testing:
- Base de datos de test separada
- JWT secret key para tests
- Configuración de email mock

### Cobertura de Código

Los tests están configurados para generar reportes de cobertura:
- Umbral mínimo: 50% (branches, functions, lines, statements)
- Reportes en: `coverage/`
- Formatos: text, lcov, html

## 📖 Documentación Swagger

### Endpoints Documentados

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/registro` - Registrar usuario
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/forgot-password` - Recuperar contraseña

#### Productos
- `GET /api/productos` - Listar productos (protegido)
- `GET /api/productos/menu` - Menú público (QR)
- `POST /api/productos` - Crear producto (Admin/Gerente)
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Schemas Definidos

- **Usuario**: Estructura de usuario del sistema
- **Producto**: Estructura de producto del menú
- **Pedido**: Estructura de pedido
- **Mesa**: Estructura de mesa
- **Error**: Formato estándar de errores
- **Success**: Formato estándar de respuestas exitosas

### Seguridad en Swagger

Dos métodos de autenticación soportados:
1. **cookieAuth**: Token JWT en cookie (usado por la web)
2. **bearerAuth**: Token JWT en header Authorization (usado por APIs)

## 🎯 Mejores Prácticas Implementadas

### Middlewares
- ✅ Validación exhaustiva de tokens
- ✅ Mensajes de error informativos
- ✅ Códigos de error específicos
- ✅ Logging para debugging
- ✅ Soporte para múltiples métodos de autenticación

### Testing
- ✅ Tests unitarios de middlewares
- ✅ Tests de integración de APIs
- ✅ Mocks de base de datos
- ✅ Cobertura de código
- ✅ Tests de validaciones
- ✅ Tests de permisos y roles

### Documentación
- ✅ OpenAPI 3.0
- ✅ Ejemplos completos
- ✅ Modelos de datos
- ✅ Respuestas de error
- ✅ UI interactiva
- ✅ Tags organizados

## 🔍 Próximos Pasos Sugeridos

1. **Aumentar Cobertura de Tests**
   - Añadir tests para más controladores
   - Tests de mesas, ventas, reportes
   - Tests e2e completos

2. **Mejorar Documentación**
   - Documentar todos los endpoints restantes
   - Añadir más ejemplos
   - Documentar códigos de error

3. **CI/CD**
   - Configurar GitHub Actions
   - Ejecutar tests automáticamente
   - Validar cobertura mínima

4. **Monitoring**
   - Logs estructurados
   - Métricas de API
   - Alertas de errores

## 📞 Soporte

Para más información sobre las implementaciones, revisar:
- Código en `src/auth/`
- Tests en `tests/`
- Configuración de Swagger en `src/config/swagger.config.js`
- Documentación interactiva en `http://localhost:4000/docs`

---

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025  
**Estado**: ✅ Implementado y Funcional

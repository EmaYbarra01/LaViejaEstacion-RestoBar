# Backend CRUD COM-12

Backend API REST construido con Node.js, Express y MongoDB para gestión de productos, usuarios y ventas.

## 🚀 Tecnologías

- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Encriptación de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **express-validator** - Validación de datos
- **nodemailer** - Envío de correos electrónicos
- **dotenv** - Variables de entorno

## 📋 Requisitos previos

- Node.js (v14 o superior)
- MongoDB (local o Atlas)
- Cuenta de Gmail (para recuperación de contraseñas)

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/NahuFed/Backend-Crud-com12.git
cd Backend-Crud-com12
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (ver sección siguiente)

4. Iniciar el servidor:
```bash
npm start
```

## ⚙️ Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
# Copia el archivo de ejemplo y edítalo con tus valores
cp .env.example .env
```

Luego edita el archivo `.env` con tus valores reales:

```env
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/CRUD-COM12?retryWrites=true&w=majority

# Configuración de Email (Nodemailer con Gmail)
EMAIL_USER=tu.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=tu.email@gmail.com

# URL del Frontend (para enlaces en emails)
FRONTEND_URL=http://localhost:5173

# Puerto del servidor (opcional)
PORT=3000

# Clave secreta para JWT (opcional)
JWT_SECRET=tu_clave_secreta_aqui
```

> 💡 **Tip**: Usa `.env.example` como plantilla. Nunca subas tu archivo `.env` al repositorio.

## 📧 Configuración de Gmail para Nodemailer

Para poder enviar correos electrónicos de recuperación de contraseña, necesitas configurar una **Contraseña de Aplicación** en tu cuenta de Gmail:

### Paso 1: Habilitar verificación en dos pasos

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el menú lateral
3. En "Cómo inicias sesión en Google", selecciona **Verificación en dos pasos**
4. Sigue las instrucciones para habilitar la verificación en dos pasos

### Paso 2: Crear una Contraseña de Aplicación

1. Una vez habilitada la verificación en dos pasos, regresa a **Seguridad**
2. En "Cómo inicias sesión en Google", selecciona **Contraseñas de aplicaciones**
3. Es posible que tengas que iniciar sesión nuevamente
4. En la parte inferior, selecciona **Aplicación** y elige "Correo"
5. Selecciona **Dispositivo** y elige "Otro (nombre personalizado)"
6. Escribe un nombre descriptivo (ejemplo: "Backend CRUD API")
7. Haz clic en **Generar**
8. Gmail te mostrará una contraseña de 16 caracteres
9. **Copia esta contraseña** (no podrás verla de nuevo)

### Paso 3: Configurar en el archivo .env

Usa la contraseña generada en tu archivo `.env`:

```env
EMAIL_USER=tu.email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # La contraseña de 16 caracteres generada
EMAIL_FROM=tu.email@gmail.com
```

> ⚠️ **Importante**: 
> - NO uses tu contraseña normal de Gmail
> - La contraseña de aplicación tiene 16 caracteres (puede tener espacios)
> - Mantén este archivo `.env` privado (ya está en `.gitignore`)

### Solución de problemas comunes

**Error: "Invalid login"**
- Verifica que la verificación en dos pasos esté habilitada
- Asegúrate de usar la contraseña de aplicación, no tu contraseña normal
- Verifica que el email en `EMAIL_USER` sea correcto

**Error: "Username and Password not accepted"**
- Crea una nueva contraseña de aplicación
- Verifica que no haya espacios extra al copiar la contraseña

**Los correos no llegan**
- Revisa la carpeta de spam
- Verifica que `EMAIL_FROM` use el mismo email que `EMAIL_USER`
- Verifica la configuración del servicio de nodemailer

## 📁 Estructura del proyecto

```
Backend-Crud-com12/
├── src/
│   ├── auth/                    # Autenticación y autorización
│   │   ├── token-sign.js
│   │   ├── token-verify.js
│   │   └── verificar-rol.js
│   ├── config/                  # Configuraciones
│   │   └── nodemailer.config.js
│   ├── controllers/             # Controladores
│   │   ├── products.controllers.js
│   │   ├── users.controllers.js
│   │   ├── sales.controllers.js
│   │   └── auth.controllers.js
│   ├── database/                # Conexión a BD
│   │   └── dbConnection.js
│   ├── helpers/                 # Funciones auxiliares
│   │   ├── validarProducto.js
│   │   ├── validarUsuario.js
│   │   └── resultadoValidacion.js
│   ├── models/                  # Modelos de Mongoose
│   │   ├── productsSchema.js
│   │   ├── usersSchema.js
│   │   ├── salesSchema.js
│   │   └── passwordResetSchema.js
│   └── routes/                  # Rutas de la API
│       ├── products.routes.js
│       ├── users.routes.js
│       ├── sales.routes.js
│       └── auth.routes.js
├── public/                      # Archivos estáticos
├── .env                         # Variables de entorno (no subir a git)
├── .gitignore
├── index.js                     # Punto de entrada
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Autenticación

```
POST   /api/auth/login              # Login de usuario
POST   /api/auth/register           # Registro de usuario
POST   /api/auth/forgot-password    # Solicitar recuperación de contraseña
POST   /api/auth/reset-password     # Resetear contraseña con token
```

### Usuarios

```
GET    /api/users                   # Obtener todos los usuarios (admin)
GET    /api/users/:id               # Obtener usuario por ID
POST   /api/users                   # Crear usuario (admin)
PUT    /api/users/:id               # Actualizar usuario
DELETE /api/users/:id               # Eliminar usuario (admin)
```

### Productos

```
GET    /api/products                # Obtener todos los productos
GET    /api/products/:id            # Obtener producto por ID
POST   /api/products                # Crear producto (admin)
PUT    /api/products/:id            # Actualizar producto (admin)
DELETE /api/products/:id            # Eliminar producto (admin)
```

### Ventas

```
GET    /api/sales                   # Obtener todas las ventas (admin)
GET    /api/sales/:id               # Obtener venta por ID
POST   /api/sales                   # Crear venta
```

## 🔒 Roles y Permisos

- **user**: Usuario regular (puede ver productos, hacer compras)
- **admin**: Administrador (puede gestionar productos y usuarios)
- **superadmin**: Super administrador (acceso total)

## 🛠️ Scripts disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo (con nodemon)
```

## 📝 Notas de desarrollo

- Todas las contraseñas se encriptan con bcrypt antes de guardarse
- Los tokens JWT tienen una expiración de 24 horas
- Los tokens de recuperación de contraseña expiran en 1 hora
- El stock de productos se actualiza automáticamente al crear una venta
- El servidor exige `MONGODB_URI`; si falta, no usa localhost por defecto

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## � Verificar Conexiones

### Verificar conexión a MongoDB

Ejecuta el siguiente comando para comprobar que MongoDB está conectado:

```bash
node scripts/checkDb.js
```

Deberías ver algo como:
```
✅ Conectado a MongoDB. Base de datos: CRUD-COM12
Estado (readyState): 1 (1 = conectado)
```

### Solución de problemas comunes

#### Error: "Missing credentials for PLAIN"

Si ves este error de Nodemailer, significa que las variables de entorno `EMAIL_USER`, `EMAIL_PASS` o `EMAIL_FROM` no están configuradas:

1. Verifica que tienes un archivo `.env` en la carpeta `backend`
2. Asegúrate de que las variables estén definidas correctamente
3. Reinicia el servidor después de crear/editar el `.env`

El sistema ahora incluye validación automática y usará un transportador de desarrollo (sin enviar correos reales) si faltan las credenciales, evitando que la aplicación falle.

#### MongoDB no conecta

Si MongoDB no se conecta:

1. Verifica que MongoDB esté corriendo: `mongod --version`
2. Comprueba la URI en `.env`: `MONGODB_URI`
3. Para MongoDB local usa: `mongodb://localhost:27017/CRUD-COM12`
4. Para MongoDB Atlas usa la URI completa con credenciales

## �📄 Licencia

Este proyecto es parte del curso de la UTN - Tecnicatura Universitaria en Programación.

## 👥 Autores

- Comisión 12 - UTN TUP

## 📞 Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

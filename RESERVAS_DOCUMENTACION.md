# 📖 Sistema de Reservas - Documentación

## 🎯 Resumen

Sistema completo de gestión de reservas para La Vieja Estación RestoBar, con backend Node.js/Express/MongoDB y frontend React.

---

## 🚀 Inicio Rápido

### 1. Iniciar Backend
```bash
cd backend
npm run dev
```
**Puerto:** http://localhost:4000

### 2. Iniciar Frontend
```bash
cd frontend
npm run dev
```
**Puerto:** http://localhost:5173

### 3. Acceder al Sistema
- **Formulario de Reservas:** http://localhost:5173/reservas
- **Test API:** http://localhost:4000/test-reservas.html

---

## 📡 API Endpoints

### Base URL: `http://localhost:4000/api/reservas`

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/` | Crear nueva reserva | No |
| GET | `/` | Listar todas las reservas | No |
| GET | `/:id` | Obtener reserva por ID | No |
| GET | `/fecha/:fecha` | Reservas por fecha (YYYY-MM-DD) | No |
| PUT | `/:id` | Actualizar reserva | No |
| DELETE | `/:id` | Cancelar reserva | No |
| PATCH | `/:id/confirmar` | Confirmar reserva | Admin* |
| PATCH | `/:id/completar` | Completar reserva | Admin* |

*Nota: Actualmente sin autenticación, listo para agregar.

---

## 📝 Modelo de Datos

### Estructura de una Reserva

```json
{
  "cliente": "Juan Pérez",           // Requerido, 2-100 caracteres
  "email": "juan@example.com",       // Requerido, formato email válido
  "telefono": "1234567890",          // Requerido, exactamente 10 dígitos
  "fecha": "2025-11-15",             // Requerido, fecha >= hoy (YYYY-MM-DD)
  "hora": "19:00",                   // Requerido, formato HH:MM
  "comensales": 4,                   // Requerido, entre 1 y 20
  "numeroMesa": 5,                   // Opcional, número de mesa específica
  "comentarios": "Mesa ventana",     // Opcional, máx 500 caracteres
  "estado": "Pendiente"              // Auto: Pendiente, Confirmada, Cancelada, Completada
}
```

### Estados de Reserva

- **Pendiente** → Creada, esperando confirmación
- **Confirmada** → Verificada por el personal
- **Cancelada** → Reserva cancelada
- **Completada** → Cliente llegó y fue atendido

---

## 💡 Ejemplos de Uso

### 1. Crear Reserva (JavaScript)

```javascript
const crearReserva = async () => {
  const response = await fetch('http://localhost:4000/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: "María García",
      email: "maria@example.com",
      telefono: "9876543210",
      fecha: "2025-11-20",
      hora: "20:30",
      comensales: 6,
      comentarios: "Cumpleaños"
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "mensaje": "Reserva creada exitosamente",
  "reserva": {
    "_id": "673...",
    "cliente": "María García",
    "email": "maria@example.com",
    "telefono": "9876543210",
    "fecha": "2025-11-20T00:00:00.000Z",
    "hora": "20:30",
    "comensales": 6,
    "estado": "Pendiente",
    "comentarios": "Cumpleaños",
    "createdAt": "2025-11-12T...",
    "updatedAt": "2025-11-12T..."
  }
}
```

### 2. Listar Reservas con Filtros

```javascript
// Todas las reservas
fetch('http://localhost:4000/api/reservas')

// Solo pendientes
fetch('http://localhost:4000/api/reservas?estado=Pendiente')

// Por fecha
fetch('http://localhost:4000/api/reservas?fecha=2025-11-15')

// Con paginación
fetch('http://localhost:4000/api/reservas?page=1&limit=10')

// Combinado
fetch('http://localhost:4000/api/reservas?estado=Confirmada&page=1&limit=20')
```

### 3. Obtener Reservas de una Fecha

```javascript
const fecha = '2025-11-15'; // YYYY-MM-DD
const response = await fetch(`http://localhost:4000/api/reservas/fecha/${fecha}`);
const data = await response.json();
```

### 4. Confirmar Reserva

```javascript
const confirmar = async (reservaId) => {
  const response = await fetch(`http://localhost:4000/api/reservas/${reservaId}/confirmar`, {
    method: 'PATCH'
  });
  return await response.json();
};
```

### 5. Cancelar Reserva

```javascript
const cancelar = async (reservaId) => {
  const response = await fetch(`http://localhost:4000/api/reservas/${reservaId}`, {
    method: 'DELETE'
  });
  return await response.json();
};
```

---

## 🛡️ Validaciones

### Backend (automáticas)

- ✅ Email con formato válido
- ✅ Teléfono de 10 dígitos numéricos
- ✅ Fecha no puede ser anterior a hoy
- ✅ Hora en formato HH:MM (24 horas)
- ✅ Comensales entre 1 y 20
- ✅ Verificación de disponibilidad de mesa
- ✅ No permitir reservas duplicadas (misma mesa, fecha, hora)
- ✅ No modificar reservas completadas/canceladas

### Frontend

- ✅ Campos obligatorios
- ✅ Validación de formato de email
- ✅ Longitud de teléfono
- ✅ Fecha mínima (hoy)
- ✅ Mensajes de error informativos

---

## 📂 Estructura de Archivos

```
backend/
├── src/
│   ├── models/
│   │   └── reservaSchema.js          # Modelo Mongoose
│   ├── controllers/
│   │   └── reservas.controllers.js   # Lógica de negocio
│   └── routes/
│       └── reservas.routes.js        # Definición de rutas
├── test-reservas.html                # Página de prueba
└── index.js                          # Servidor principal

frontend/
├── src/
│   ├── api/
│   │   └── reservas.api.js           # Cliente API
│   └── pages/
│       ├── Reservas.jsx              # Componente principal
│       └── Reservas.css              # Estilos
```

---

## 🔧 Características Avanzadas

### Paginación

```javascript
// Página 2, 15 resultados por página
fetch('http://localhost:4000/api/reservas?page=2&limit=15')
```

**Respuesta:**
```json
{
  "success": true,
  "total": 45,
  "page": 2,
  "totalPages": 3,
  "reservas": [...]
}
```

### Asignación de Mesa

El sistema permite:
1. **Asignación manual:** Especificar `numeroMesa` al crear
2. **Asignación automática:** Dejar vacío para asignar después
3. **Verificación de capacidad:** Valida que la mesa tenga capacidad suficiente
4. **Prevención de conflictos:** No permite reservar mesa ya ocupada

---

## ⚠️ Manejo de Errores

### Errores Comunes

#### 400 - Bad Request
```json
{
  "success": false,
  "mensaje": "Error de validación",
  "errores": [
    "El teléfono debe tener 10 dígitos",
    "La fecha no puede ser anterior a hoy"
  ]
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "mensaje": "Reserva no encontrada"
}
```

#### 409 - Conflict
```json
{
  "success": false,
  "mensaje": "La mesa 5 ya está reservada para esa fecha y hora",
  "reservaExistente": {
    "cliente": "Pedro López",
    "fecha": "2025-11-15",
    "hora": "19:00"
  }
}
```

---

## 🎨 Uso del Frontend

### Componente React

```jsx
import { crearReserva } from '../api/reservas.api';

const MiComponente = () => {
  const handleSubmit = async (datos) => {
    try {
      const response = await crearReserva(datos);
      if (response.success) {
        alert('¡Reserva creada!');
      }
    } catch (error) {
      alert(error.mensaje || 'Error al crear reserva');
    }
  };
  
  return <FormularioReserva onSubmit={handleSubmit} />;
};
```

---

## 🧪 Testing

### Archivo de Prueba HTML

Abre en el navegador: **http://localhost:4000/test-reservas.html**

Permite:
- ✅ Crear reservas con formulario interactivo
- ✅ Ver todas las reservas
- ✅ Filtrar por fecha
- ✅ Filtrar por estado
- ✅ Ver respuestas del servidor en tiempo real

---

## 📊 Flujo de Trabajo Típico

1. **Cliente hace reserva** → Estado: `Pendiente`
2. **Personal confirma** (verifica disponibilidad) → Estado: `Confirmada`
3. **Cliente llega al restaurante** → Estado: `Completada`
4. **Si cliente cancela** → Estado: `Cancelada`

---

## 🔐 Seguridad (Próximas Mejoras)

- [ ] Autenticación JWT para rutas de admin
- [ ] Rate limiting para prevenir abuso
- [ ] Sanitización de inputs
- [ ] HTTPS en producción
- [ ] Variables de entorno para secretos

---

## 📬 Notificaciones (Futuras)

El sistema está preparado para agregar:
- Email de confirmación al crear reserva
- Recordatorio 24h antes
- Notificación al personal de nuevas reservas

---

## 🐛 Troubleshooting

### El backend no inicia
```bash
# Verificar que MongoDB esté corriendo
# Verificar puerto 4000 disponible
netstat -ano | findstr :4000

# Limpiar node_modules si hay problemas
cd backend
rm -rf node_modules
npm install
```

### CORS Error
✅ Ya configurado para `http://localhost:5173` (frontend)

### Error de conexión a DB
Verificar string de conexión en `.env`:
```
MONGODB_URI=mongodb://localhost:27017/restobar_db
```

---

## 📞 Soporte

Para dudas o problemas, revisar:
- Logs del backend en la consola
- Consola del navegador (F12)
- Estado de MongoDB

---

**Última actualización:** 12 de Noviembre de 2025

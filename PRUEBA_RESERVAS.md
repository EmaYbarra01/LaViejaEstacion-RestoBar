# 🧪 Guía de Pruebas - Sistema de Reservas Mejorado

## 📋 Preparación del Entorno

### 1. Iniciar el Backend
```powershell
cd backend
npm start
```

### 2. Iniciar el Frontend
```powershell
cd frontend
npm run dev
```

### 3. Verificar que la Base de Datos tenga Mesas

```javascript
// En MongoDB Compass o mongo shell, verificar que existan mesas:
db.mesas.find()

// Si no hay mesas, crearlas:
db.mesas.insertMany([
  { numero: 1, capacidad: 2, estado: 'Libre', ubicacion: 'Ventana' },
  { numero: 2, capacidad: 4, estado: 'Libre', ubicacion: 'Centro' },
  { numero: 3, capacidad: 4, estado: 'Libre', ubicacion: 'Terraza' },
  { numero: 4, capacidad: 6, estado: 'Libre', ubicacion: 'Salón Principal' },
  { numero: 5, capacidad: 8, estado: 'Libre', ubicacion: 'Salón VIP' }
])
```

---

## ✅ Casos de Prueba

### **Prueba 1: Validación de Email - Formato Inválido**

**Objetivo:** Verificar que se rechacen emails con formato incorrecto

**Pasos:**
1. Ir a `http://localhost:5173/reservas`
2. Llenar el formulario con:
   - Nombre: "Juan Pérez"
   - Email: "emailsinformato" ❌ (sin @)
   - Teléfono: "3815551234"
   - Fecha: (fecha futura)
   - Hora: "20:00"
   - Comensales: 2

**Resultado Esperado:**
```json
{
  "success": false,
  "mensaje": "Por favor ingrese un email válido"
}
```

---

### **Prueba 2: Validación de Email - Formato Válido**

**Objetivo:** Verificar que se acepten emails válidos

**Pasos:**
1. Usar el mismo formulario
2. Cambiar email a: "juanperez@gmail.com" ✅

**Resultado Esperado:**
- ✅ Reserva creada exitosamente
- ✅ Mensaje: "¡Reserva realizada con éxito! Se te ha asignado la Mesa X..."
- ✅ Email enviado al cliente

---

### **Prueba 3: Asignación Automática - Mesa Pequeña**

**Objetivo:** Verificar que se asigne la mesa más pequeña adecuada

**Datos de Prueba:**
```json
{
  "cliente": "María González",
  "email": "maria@test.com",
  "telefono": "3816662345",
  "fecha": "2025-11-20",
  "hora": "19:00",
  "comensales": 2
}
```

**Resultado Esperado:**
- Mesa asignada: **Mesa 1** (capacidad 2)
- Mensaje en pantalla incluye: "Se te ha asignado la Mesa 1"

**Verificación:**
```javascript
// Consultar en MongoDB
db.reservas.findOne({ email: "maria@test.com" })

// Debe mostrar:
{
  ...
  "numeroMesa": 1,
  "comensales": 2
}
```

---

### **Prueba 4: Asignación Automática - Mesa Grande**

**Objetivo:** Verificar asignación para grupos grandes

**Datos de Prueba:**
```json
{
  "cliente": "Carlos Rodríguez",
  "email": "carlos@test.com",
  "telefono": "3817773456",
  "fecha": "2025-11-20",
  "hora": "20:00",
  "comensales": 7
}
```

**Resultado Esperado:**
- Mesa asignada: **Mesa 5** (capacidad 8)
- No se asigna mesa pequeña (optimización)

---

### **Prueba 5: Prevención de Duplicados**

**Objetivo:** Verificar que no se puedan hacer dos reservas para la misma mesa/hora

**Pasos:**

**Paso 1:** Crear primera reserva
```json
{
  "cliente": "Ana Martínez",
  "email": "ana@test.com",
  "telefono": "3818884567",
  "fecha": "2025-11-21",
  "hora": "21:00",
  "comensales": 2
}
```
✅ Resultado: Mesa 1 asignada

**Paso 2:** Intentar crear segunda reserva para el mismo horario
```json
{
  "cliente": "Pedro López",
  "email": "pedro@test.com",
  "telefono": "3819995678",
  "fecha": "2025-11-21",
  "hora": "21:00",
  "comensales": 2
}
```

**Resultado Esperado:**
- Mesa 1 ya está ocupada
- Se asigna otra mesa disponible (Mesa 2, 3, etc.)

**Paso 3:** Reservar TODAS las mesas para un horario
```javascript
// Crear 5 reservas para el mismo horario
// Cada una ocupará una mesa diferente
```

**Paso 4:** Intentar sexta reserva
```json
{
  "cliente": "Laura Fernández",
  "email": "laura@test.com",
  "telefono": "3810006789",
  "fecha": "2025-11-21",
  "hora": "21:00",
  "comensales": 2
}
```

**Resultado Esperado:**
```json
{
  "success": false,
  "mensaje": "Lo sentimos, no hay mesas disponibles para esa fecha y hora. Por favor intenta con otro horario."
}
```

---

### **Prueba 6: Email de Confirmación**

**Objetivo:** Verificar que el email incluya la mesa asignada

**Pasos:**
1. Crear reserva exitosa
2. Verificar en consola del backend:
   ```
   [EMAIL] ✅ Email enviado exitosamente
   ```
3. Revisar bandeja de entrada del email usado

**Contenido del Email Esperado:**
```html
📅 Fecha: miércoles, 20 de noviembre de 2025
🕐 Hora: 19:00
👥 Comensales: 2 personas
🪑 Mesa: Mesa 1        ← ¡IMPORTANTE!
```

---

### **Prueba 7: Frontend - Sin Campo de Mesa**

**Objetivo:** Verificar que el formulario NO permita elegir mesa

**Pasos:**
1. Ir a `http://localhost:5173/reservas`
2. Revisar el formulario

**Verificación:**
- ❌ NO debe aparecer campo "Número de mesa"
- ✅ Debe aparecer mensaje informativo azul:
  ```
  ℹ️ Asignación automática de mesa: El restaurante te asignará 
  la mejor mesa disponible según el número de comensales...
  ```

---

### **Prueba 8: Diferentes Horarios, Misma Mesa**

**Objetivo:** Verificar que la misma mesa pueda reservarse en diferentes horarios

**Reserva 1:**
```json
{
  "cliente": "Cliente A",
  "email": "clienteA@test.com",
  "fecha": "2025-11-22",
  "hora": "18:00",
  "comensales": 2
}
```
Resultado: Mesa 1

**Reserva 2:**
```json
{
  "cliente": "Cliente B",
  "email": "clienteB@test.com",
  "fecha": "2025-11-22",
  "hora": "20:00",  ← Diferente hora
  "comensales": 2
}
```
Resultado Esperado: ✅ También se puede asignar Mesa 1

---

## 🔍 Verificación en Base de Datos

### Consultar reservas con mesa asignada:

```javascript
// MongoDB Shell
db.reservas.find({ 
  fecha: ISODate("2025-11-20"),
  hora: "19:00" 
}).pretty()
```

### Verificar que no haya duplicados:

```javascript
db.reservas.aggregate([
  {
    $match: { 
      estado: { $in: ["Pendiente", "Confirmada"] }
    }
  },
  {
    $group: {
      _id: { 
        fecha: "$fecha", 
        hora: "$hora", 
        mesa: "$mesa" 
      },
      count: { $sum: 1 }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  }
])
```

**Resultado Esperado:** Array vacío (no duplicados)

---

## 📊 Logs del Backend

### Logs esperados durante el flujo:

```log
[RESERVAS] Creando nueva reserva: { cliente: 'Juan Pérez', fecha: '2025-11-20', hora: '19:00', comensales: 2 }

[RESERVAS] Mesas ocupadas para 2025-11-20 19:00 : []

[RESERVAS] Buscando mesa disponible automáticamente para 2 comensales

[RESERVAS] Mesas disponibles encontradas: 5

[RESERVAS] Mesa asignada automáticamente: Mesa 1 con capacidad para 2

[EMAIL] Enviando confirmación a juan@test.com...

[EMAIL] ✅ Email enviado exitosamente: <message-id>

[RESERVAS] ✅ Email de confirmación enviado al cliente

[RESERVAS] ✅ Notificación enviada al restobar
```

---

## 🐛 Solución de Problemas

### Problema: "Email no configurado"

**Solución:**
```powershell
# Crear archivo .env en /backend si no existe:
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM="La Vieja Estación RestoBar <noreply@laviejaestacion.com>"
BASE_URL=http://localhost:4000
```

### Problema: "No hay mesas disponibles" (pero debería haber)

**Solución:**
```javascript
// Verificar mesas en DB:
db.mesas.find()

// Verificar reservas que podrían estar bloqueando:
db.reservas.find({
  fecha: ISODate("2025-11-20"),
  hora: "19:00",
  estado: { $in: ["Pendiente", "Confirmada"] }
})

// Cancelar reservas de prueba si es necesario:
db.reservas.updateMany(
  { email: /test\.com/ },
  { $set: { estado: "Cancelada" } }
)
```

### Problema: Frontend no muestra mensaje de mesa asignada

**Verificación:**
```javascript
// En Reservas.jsx, revisar que la respuesta incluya:
response.mesaAsignada.numero
```

---

## ✅ Checklist de Validación

- [ ] Email inválido es rechazado
- [ ] Email válido es aceptado
- [ ] Mesa pequeña se asigna para pocos comensales
- [ ] Mesa grande se asigna para muchos comensales
- [ ] No se pueden hacer reservas duplicadas
- [ ] Error claro cuando no hay disponibilidad
- [ ] Email enviado incluye número de mesa
- [ ] Frontend no muestra campo de selección de mesa
- [ ] Mensaje informativo visible en formulario
- [ ] Logs del backend son claros y detallados

---

## 📧 Ejemplo de Email Recibido

```
De: La Vieja Estación RestoBar <noreply@laviejaestacion.com>
Para: juanperez@gmail.com
Asunto: Confirmación de Reserva - miércoles, 20 de noviembre de 2025 19:00

[Email HTML con diseño profesional]

Hola Juan Pérez,

¡Gracias por elegir La Vieja Estación RestoBar! 
Hemos recibido tu reserva con los siguientes detalles:

📅 Fecha: miércoles, 20 de noviembre de 2025
🕐 Hora: 19:00
👥 Comensales: 2 personas
🪑 Mesa: Mesa 1                    ← ¡Aquí está!
📧 Email: juanperez@gmail.com
📱 Teléfono: 3815551234

Estado: [Pendiente]

⏳ Reserva Pendiente de Confirmación
Por favor, confirma tu asistencia haciendo click en el botón de abajo.

[✅ Sí, Confirmar mi Reserva] [❌ No, Cancelar Reserva]
```

---

**Fecha de creación:** 15 de noviembre de 2025  
**Última actualización:** 15 de noviembre de 2025  
**Estado:** ✅ Todas las pruebas listas para ejecutar

# 📧 Configuración del Sistema de Emails

## 📋 Descripción

El sistema de emails de **La Vieja Estación RestoBar** permite enviar confirmaciones automáticas cuando:
- ✅ Se crea una nueva reserva
- 🔄 Se confirma una reserva pendiente
- ❌ Se cancela una reserva

---

## 🚀 Configuración Rápida

### 1️⃣ Editar el archivo `.env`

Abre el archivo `backend/.env` y configura tus credenciales de email:

```env
# Para Gmail (recomendado para desarrollo)
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=La Vieja Estación RestoBar <tu-email@gmail.com>
```

### 2️⃣ Obtener Contraseña de Aplicación de Gmail

⚠️ **IMPORTANTE**: Gmail requiere una "Contraseña de Aplicación", NO tu contraseña normal.

**Pasos:**

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Selecciona **Seguridad** en el menú izquierdo
3. Activa la **Verificación en 2 pasos** (si no la tienes activada)
4. Busca **Contraseñas de aplicaciones**
5. Genera una nueva contraseña:
   - Aplicación: Otro (personalizado)
   - Nombre: "RestoBar Backend"
6. Copia la contraseña de 16 caracteres generada
7. Pégala en `EMAIL_PASS` en el archivo `.env` (sin espacios)

```env
# Ejemplo correcto
EMAIL_PASS=abcd efgh ijkl mnop  ❌ (con espacios)
EMAIL_PASS=abcdefghijklmnop     ✅ (sin espacios)
```

### 3️⃣ Reiniciar el Backend

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

---

## 🎨 Características del Sistema

### ✉️ Email de Confirmación de Reserva

**Se envía cuando:**
- Un cliente crea una nueva reserva
- Un administrador confirma una reserva pendiente

**Contenido:**
- ✅ Diseño HTML profesional con colores del restobar
- 📅 Fecha formateada en español (ej: "lunes, 13 de noviembre de 2025")
- 🕐 Hora de la reserva
- 👥 Número de comensales
- 🪑 Mesa asignada (si aplica)
- 💬 Comentarios especiales
- 📱 Datos de contacto del restobar
- 🎯 Estado de la reserva (Pendiente/Confirmada)

**Vista previa:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ LA VIEJA ESTACIÓN RESTOBAR
Confirmación de Reserva
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hola Juan Pérez,

¡Gracias por elegir La Vieja Estación RestoBar! 
Hemos recibido tu reserva:

📅 Fecha: lunes, 13 de noviembre de 2025
🕐 Hora: 20:30
👥 Comensales: 4 personas
🪑 Mesa: Mesa 5
📧 Email: juan@email.com
📱 Teléfono: 1234567890

Estado: Confirmada ✅

Te esperamos en la fecha indicada.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ❌ Email de Cancelación

**Se envía cuando:**
- Se cancela una reserva existente

**Contenido:**
- Confirmación de la cancelación
- Detalles de la reserva cancelada
- Invitación a reservar nuevamente
- Datos de contacto

---

## 🔧 Proveedores de Email Soportados

### 📧 Gmail (Recomendado para desarrollo)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=La Vieja Estación RestoBar <tu-email@gmail.com>
```

✅ **Ventajas:**
- Fácil configuración
- Gratis
- Confiable
- Límite: 500 emails/día

⚠️ **Requisitos:**
- Verificación en 2 pasos activada
- Contraseña de aplicación generada

---

### 📧 Outlook / Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=tu-email@outlook.com
EMAIL_PASS=tu-contraseña
EMAIL_FROM=La Vieja Estación RestoBar <tu-email@outlook.com>
```

✅ **Ventajas:**
- No requiere configuración especial
- Usa contraseña normal
- Límite: 300 emails/día

---

### 🌐 SMTP Personalizado (Producción)

Para producción, se recomienda usar un servicio profesional como:
- **SendGrid** (100 emails/día gratis)
- **Mailgun** (5,000 emails/mes gratis)
- **AWS SES** (muy económico)
- **Tu propio servidor SMTP**

```env
EMAIL_HOST=smtp.tudominio.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@tudominio.com
EMAIL_PASS=tu-contraseña
EMAIL_FROM=La Vieja Estación RestoBar <noreply@tudominio.com>
```

**Ejemplo con SendGrid:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=TU_API_KEY_DE_SENDGRID
EMAIL_FROM=La Vieja Estación RestoBar <noreply@tudominio.com>
```

---

## 🧪 Probar el Sistema de Emails

### Opción 1: Desde el Frontend

1. Abre http://localhost:5174/reservas
2. Completa el formulario de reserva
3. Usa tu email real en el campo "Email"
4. Envía la reserva
5. Revisa tu bandeja de entrada (y spam)

### Opción 2: Desde la Página de Test

1. Abre http://localhost:4000/test-reservas.html
2. Completa el formulario
3. Haz clic en "Crear Reserva"
4. Verás en la consola si el email se envió

### Opción 3: Con Postman/Insomnia

```http
POST http://localhost:4000/api/reservas
Content-Type: application/json

{
  "cliente": "Juan Pérez",
  "email": "tu-email-real@gmail.com",
  "telefono": "1234567890",
  "fecha": "2025-11-20",
  "hora": "20:30",
  "comensales": 4,
  "comentarios": "Cerca de la ventana por favor"
}
```

### Opción 4: Verificar en los Logs

Cuando se envía un email, verás en la consola del backend:

```
[EMAIL] Enviando confirmación a cliente@email.com...
[EMAIL] ✅ Email enviado exitosamente: <mensaje-id>
[RESERVAS] ✅ Email de confirmación enviado
```

Si hay un error:

```
[EMAIL] ❌ Error al enviar email: Error message
[RESERVAS] ⚠️ No se pudo enviar email: Email no configurado
```

---

## 🐛 Solución de Problemas

### ❌ "Email no configurado"

**Causa:** No se encontró configuración en `.env`

**Solución:**
1. Verifica que el archivo `backend/.env` existe
2. Asegúrate de que las variables están definidas:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=tu-contraseña
   ```
3. Reinicia el backend

---

### ❌ "Error de autenticación" (EAUTH)

**Causa:** Credenciales incorrectas o falta de permisos

**Solución para Gmail:**
1. Verifica que la verificación en 2 pasos está activada
2. Genera una nueva "Contraseña de aplicación"
3. Copia la contraseña sin espacios
4. Pégala en `EMAIL_PASS`
5. Reinicia el backend

**Solución para Outlook:**
1. Asegúrate de usar la contraseña correcta
2. Si tienes 2FA, necesitas generar una contraseña de aplicación
3. Verifica que `EMAIL_SERVICE=hotmail`

---

### ❌ "Error de conexión" (ESOCKET)

**Causa:** Problemas de red o configuración de servidor

**Solución:**
1. Verifica tu conexión a internet
2. Si usas SMTP personalizado, verifica:
   - `EMAIL_HOST` (correcto)
   - `EMAIL_PORT` (587 para TLS, 465 para SSL)
   - `EMAIL_SECURE` (true para SSL, false para TLS)
3. Verifica tu firewall/antivirus

---

### ⚠️ El email llega a SPAM

**Causa:** Emails de desarrollo se marcan como spam

**Soluciones temporales:**
1. Marca como "No es spam" en tu bandeja
2. Agrega el remitente a tus contactos

**Solución para producción:**
1. Usa un dominio propio (no @gmail.com)
2. Configura registros SPF, DKIM y DMARC
3. Usa un servicio profesional (SendGrid, Mailgun)
4. Calienta el dominio gradualmente

---

### 🔍 El email no llega

**Checklist:**

- [ ] ¿El backend está corriendo?
- [ ] ¿Hay logs de `[EMAIL]` en la consola?
- [ ] ¿El log dice "✅ Email enviado exitosamente"?
- [ ] ¿Revisaste la carpeta de SPAM?
- [ ] ¿El email del destinatario es correcto?
- [ ] ¿Las credenciales en `.env` son correctas?
- [ ] ¿Reiniciaste el backend después de editar `.env`?

---

## 📝 Personalización de Plantillas

### Ubicación de Plantillas

Las plantillas HTML están en:
```
backend/src/helpers/emailHelper.js
```

### Funciones de Plantilla

1. **`plantillaConfirmacionReserva(reserva)`**
   - Email principal de confirmación
   - HTML completo con estilos CSS inline
   - Responsive (se ve bien en móviles)

2. **`plantillaTextoPlano(reserva)`**
   - Versión de texto plano (fallback)
   - Para clientes que no soportan HTML

### Personalizar Colores

Busca en `emailHelper.js`:

```javascript
// Colores actuales (morado degradado)
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Cambiar a colores de tu marca
background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
```

### Personalizar Textos

Busca en `emailHelper.js`:

```javascript
// Datos del restobar
📧 Email: reservas@laviejaestacion.com
📱 Teléfono: (0387) 123-4567
📍 Dirección: Av. Principal 123, Salta Capital
```

Cambia por los datos reales del restobar.

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE

1. **NUNCA subas el archivo `.env` a Git**
   - Ya está en `.gitignore` por defecto
   - Contiene credenciales sensibles

2. **Usa contraseñas de aplicación**
   - No uses tu contraseña de email personal
   - Genera contraseñas específicas para la app

3. **En producción:**
   - Usa variables de entorno del servidor
   - No almacenes contraseñas en código
   - Usa servicios profesionales de email
   - Implementa rate limiting (límites de envío)

### Verificar que `.env` no está en Git

```bash
git status

# NO debe aparecer .env en la lista
# Si aparece, agrégalo a .gitignore
```

---

## 📊 Monitoreo y Logs

### Logs del Sistema

Cada email genera logs en la consola:

```
[EMAIL] Enviando confirmación a cliente@email.com...
[EMAIL] ✅ Email enviado exitosamente: <1234567890@gmail.com>
[RESERVAS] ✅ Email de confirmación enviado
```

### Errores Comunes en Logs

```
[EMAIL] ❌ Error al enviar email: Invalid login
[EMAIL] Error de autenticación. Verifica EMAIL_USER y EMAIL_PASS
[EMAIL] Si usas Gmail, necesitas una "Contraseña de aplicación"
```

---

## 🚀 Modo Producción

### Variables de Entorno en Servidor

En producción, no uses archivos `.env`. Configura las variables en tu servidor:

**Heroku:**
```bash
heroku config:set EMAIL_SERVICE=gmail
heroku config:set EMAIL_USER=tu-email@gmail.com
heroku config:set EMAIL_PASS=tu-contraseña-app
heroku config:set EMAIL_FROM="La Vieja Estación <noreply@tudominio.com>"
```

**Vercel/Netlify:**
- Ve a Settings → Environment Variables
- Agrega cada variable manualmente

**VPS/Cloud:**
- Usa archivos `.env` fuera del código
- O configura variables de sistema
- Usa servicios como AWS Secrets Manager

### Servicio de Email para Producción

**SendGrid (Recomendado):**
- 100 emails/día gratis
- Fácil configuración
- Excelente deliverability
- Dashboard con estadísticas

**Configuración SendGrid:**

1. Crea cuenta en https://sendgrid.com
2. Genera API Key
3. Configura:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=SG.tu_api_key_aqui
EMAIL_FROM=La Vieja Estación <noreply@tudominio.com>
```

---

## 📚 Documentación Adicional

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)

---

## ✅ Checklist de Implementación

- [ ] Archivo `.env` creado con credenciales
- [ ] Contraseña de aplicación de Gmail generada
- [ ] Variables configuradas correctamente
- [ ] Backend reiniciado
- [ ] Email de prueba enviado
- [ ] Email recibido (revisar spam)
- [ ] Plantillas personalizadas (opcional)
- [ ] Datos del restobar actualizados en plantillas

---

## 🎉 ¡Listo!

El sistema de emails está **100% funcional**. Cada vez que se cree, confirme o cancele una reserva, se enviará automáticamente un email profesional al cliente.

**Próximos pasos sugeridos:**
1. Personalizar plantillas con colores de la marca
2. Agregar logo del restobar en emails
3. Implementar recordatorios 24h antes de la reserva
4. Agregar QR code con los detalles de la reserva

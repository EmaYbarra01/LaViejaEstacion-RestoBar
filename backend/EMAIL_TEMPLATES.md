# 📧 Plantillas de Email - Sistema de Reservas

## 📋 Descripción

Este documento muestra las plantillas de email utilizadas en el sistema de reservas de **La Vieja Estación RestoBar**.

---

## ✉️ Email de Confirmación de Reserva

### Vista HTML (Navegador)

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                🍽️ La Vieja Estación RestoBar
                   Confirmación de Reserva
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hola Juan Pérez,

¡Gracias por elegir La Vieja Estación RestoBar! Hemos recibido 
tu reserva con los siguientes detalles:

╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  📅 Fecha:      lunes, 13 de noviembre de 2025       ║
║  🕐 Hora:       20:30                                ║
║  👥 Comensales: 4 personas                           ║
║  🪑 Mesa:       Mesa 5                               ║
║  📧 Email:      juan@email.com                       ║
║  📱 Teléfono:   1234567890                           ║
║  💬 Comentarios: Cerca de la ventana por favor       ║
║                                                       ║
║  Estado: [CONFIRMADA] ✅                             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

    ✅ ¡Tu reserva está confirmada!
    Te esperamos en la fecha y hora indicadas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¿Necesitas modificar o cancelar tu reserva?
Contáctanos:

📧 Email: reservas@laviejaestacion.com
📱 Teléfono: (0387) 123-4567
📍 Dirección: Av. Principal 123, Salta Capital

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            La Vieja Estación RestoBar
          Sabores que trascienden el tiempo

Este es un correo automático, por favor no responder.
Para consultas: reservas@laviejaestacion.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Características del Email HTML

✨ **Diseño Profesional:**
- Header con degradado morado (#667eea → #764ba2)
- Logo del restobar (🍽️)
- Tipografía Arial limpia y legible
- Responsive (se adapta a móviles)

🎨 **Paleta de Colores:**
- **Principal:** Degradado morado
- **Confirmada:** Verde (#28a745)
- **Pendiente:** Amarillo (#ffc107)
- **Cancelada:** Rojo (#dc3545)

📦 **Secciones:**
1. **Header** - Nombre del restobar y título
2. **Saludo** - Personalizado con nombre del cliente
3. **Detalles de Reserva** - Box con toda la información
4. **Estado** - Badge colorizado según estado
5. **Contacto** - Información para modificaciones
6. **Footer** - Datos del restobar

---

## ⏳ Email para Reserva Pendiente

Cuando el estado es "Pendiente", se muestra un mensaje adicional:

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⏳ Reserva Pendiente de Confirmación        ┃
┃                                               ┃
┃  Tu reserva está siendo procesada.            ┃
┃  Te contactaremos pronto para confirmarla.    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ❌ Email de Cancelación de Reserva

### Vista HTML

```html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                🍽️ La Vieja Estación RestoBar
                      Reserva Cancelada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hola Juan Pérez,

Tu reserva ha sido CANCELADA exitosamente:

• Fecha: lunes, 13 de noviembre de 2025
• Hora: 20:30
• Comensales: 4

Esperamos poder atenderte en otra ocasión.

Para hacer una nueva reserva, visita nuestra página web 
o contáctanos:

📧 reservas@laviejaestacion.com
📱 (0387) 123-4567

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            La Vieja Estación RestoBar
          Sabores que trascienden el tiempo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📱 Vista en Texto Plano

Para clientes de email que no soportan HTML:

```
LA VIEJA ESTACIÓN RESTOBAR
Confirmación de Reserva

Hola Juan Pérez,

¡Gracias por elegir La Vieja Estación RestoBar! Hemos recibido 
tu reserva con los siguientes detalles:

DETALLES DE LA RESERVA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Fecha: lunes, 13 de noviembre de 2025
🕐 Hora: 20:30
👥 Comensales: 4 personas
🪑 Mesa: Mesa 5
📧 Email: juan@email.com
📱 Teléfono: 1234567890
💬 Comentarios: Cerca de la ventana por favor
Estado: Confirmada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ¡Tu reserva está confirmada! Te esperamos.

¿NECESITAS MODIFICAR O CANCELAR?
Contáctanos:
📧 Email: reservas@laviejaestacion.com
📱 Teléfono: (0387) 123-4567
📍 Dirección: Av. Principal 123, Salta Capital

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La Vieja Estación RestoBar
Sabores que trascienden el tiempo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎨 Personalización de Plantillas

### Ubicación del Código

Archivo: `backend/src/helpers/emailHelper.js`

### Funciones Principales

```javascript
// 1. Plantilla HTML completa
plantillaConfirmacionReserva(reserva)

// 2. Plantilla de texto plano
plantillaTextoPlano(reserva)

// 3. Email de cancelación
plantillaEmailCancelacion(reserva) // En enviarEmailCancelacion()
```

### Cambiar Colores del Header

```javascript
// Buscar en plantillaConfirmacionReserva()
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  // Cambiar por colores de tu marca
  background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);
}
```

### Cambiar Datos de Contacto

```javascript
// Buscar en la sección de contacto:
<ul style="list-style: none; padding: 0;">
  <li>📧 Email: TU_EMAIL@tudominio.com</li>
  <li>📱 Teléfono: TU_TELEFONO</li>
  <li>📍 Dirección: TU_DIRECCION</li>
</ul>
```

### Agregar Logo

```javascript
// En el header, reemplazar 🍽️ por:
<img src="https://tudominio.com/logo.png" 
     alt="La Vieja Estación" 
     style="width: 150px; margin-bottom: 10px;">
```

---

## 📊 Ejemplos de Uso

### Crear Reserva (Email Pendiente)

**Entrada:**
```javascript
{
  cliente: "María González",
  email: "maria@email.com",
  telefono: "3874123456",
  fecha: "2025-11-20",
  hora: "21:00",
  comensales: 2,
  estado: "Pendiente"
}
```

**Email enviado:**
- Asunto: "Confirmación de Reserva - miércoles, 20 de noviembre de 2025 21:00"
- Estado: Badge amarillo "Pendiente"
- Mensaje: "Tu reserva está siendo procesada..."

### Confirmar Reserva (Email Confirmada)

**Entrada:**
```javascript
{
  cliente: "María González",
  email: "maria@email.com",
  estado: "Confirmada"
  // ... resto de datos
}
```

**Email enviado:**
- Asunto: "Confirmación de Reserva - miércoles, 20 de noviembre de 2025 21:00"
- Estado: Badge verde "Confirmada"
- Mensaje: "¡Tu reserva está confirmada! Te esperamos..."

### Cancelar Reserva

**Email enviado:**
- Asunto: "Reserva Cancelada - miércoles, 20 de noviembre de 2025 21:00"
- Header: Fondo rojo (#dc3545)
- Mensaje: "Tu reserva ha sido CANCELADA..."

---

## 🔧 Testing de Plantillas

### Ver Email en el Navegador

1. Crea una reserva de prueba
2. Revisa tu email
3. Si no llega, copia el HTML de `emailHelper.js`
4. Guarda como `test-email.html`
5. Ábrelo en el navegador

### Probar Responsive

Abre el email en:
- ✅ Gmail (web)
- ✅ Gmail (móvil)
- ✅ Outlook (web)
- ✅ Outlook (móvil)
- ✅ Apple Mail (iOS)
- ✅ Cliente de escritorio

### Herramientas de Test

- **Litmus**: https://litmus.com (test en múltiples clientes)
- **Email on Acid**: https://www.emailonacid.com
- **Mailtrap**: https://mailtrap.io (recibe emails de prueba)

---

## 🌍 Internacionalización

### Fechas en Español

La función `formatearFecha()` usa:

```javascript
const opciones = { 
  weekday: 'long',  // lunes, martes...
  year: 'numeric',  // 2025
  month: 'long',    // noviembre
  day: 'numeric'    // 13
};
return new Date(fecha).toLocaleDateString('es-AR', opciones);
```

**Resultado:** "lunes, 13 de noviembre de 2025"

### Cambiar Idioma

Para inglés:
```javascript
.toLocaleDateString('en-US', opciones)
// Monday, November 13, 2025
```

Para portugués:
```javascript
.toLocaleDateString('pt-BR', opciones)
// segunda-feira, 13 de novembro de 2025
```

---

## ✅ Checklist de Calidad

### Antes de Enviar a Producción

- [ ] Todos los datos del restobar son correctos
- [ ] Los colores coinciden con la marca
- [ ] El logo está cargado y se ve correctamente
- [ ] Los enlaces funcionan
- [ ] El email se ve bien en móviles
- [ ] El email se ve bien en Outlook
- [ ] No hay errores de ortografía
- [ ] Los emojis se muestran correctamente
- [ ] El texto plano es legible
- [ ] Los datos de contacto son correctos

---

## 📚 Referencias

- [Email Design Best Practices](https://www.campaignmonitor.com/blog/email-marketing/email-design-best-practices/)
- [HTML Email Guide](https://www.smashingmagazine.com/2021/04/complete-guide-html-email-templates-tools/)
- [Nodemailer Templates](https://nodemailer.com/message/embedded-images/)

---

¡Las plantillas están listas para usar! 🎉

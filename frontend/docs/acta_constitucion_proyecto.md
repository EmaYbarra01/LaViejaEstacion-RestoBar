# 🧾 ACTA DE CONSTITUCIÓN DEL PROYECTO 

### 📘 Sistema de Gestión Integral — *“La Vieja Estación RestoBar”*  
**Fecha:** 20/10/2025  


## 👥 EQUIPO DE TRABAJO  

**Integrantes:**  
- 👩‍💻 Argüello, Silvia Patricia — Legajo 61998  
- 👨‍💻 De la Cruz, Cristian Germán — Legajo 62070  
- 👨‍💻 Sanagua, Benjamín Edgardo — Legajo 62417  
- 👨‍💻 Ybarra, Carlos Emanuel — Legajo 62181  

**Roles:**  
- 🧭 *Product Owner:* Ybarra, Carlos Emanuel  
- 🧩 *Scrum Master:* Argüello, Silvia Patricia  
- 👨‍🔧 *Developers:* Ybarra, Argüello, De la Cruz Cristian German, Sanagua Benjamin Edgardo.  

------------------------------------------------------------------------------------------------------------------------------
## 🆔 IDENTIFICACIÓN DEL PROYECTO  

- **Nombre del Proyecto:** Sistema de Gestión Integral — *La Vieja Estación (RestoBar)*  
- **Patrocinador / Sponsor:** La Vieja Estación – RestoBar (Propietaria / Gerente: *Jaqueline Valdivieso*)  

------------------------------------------------------------------------------------------------------------------------------

## 🎯 1. JUSTIFICACIÓN / PROPÓSITO  

“La Vieja Estación — RestoBar” opera con procesos mayormente manuales para atención en sala, manejo de comandas, control de stock e informes de ventas.  
Esto provoca:  

- ❌ Errores en el cálculo de cuentas y en la toma de pedidos.  
- ⏱️ Pérdidas de tiempo y discrepancias con clientes.  
- 📉 Falta de control en rotación y stock de insumos.  
- 📊 Dificultad para generar reportes claros para la toma de decisiones.  
- 💸 Procesos administrativos lentos para cierre de caja y conciliación.  

**Propósito:**  
Desarrollar y entregar un prototipo funcional y documentado (aplicación web + backend + base de datos) que permita gestionar:  
👉 POS, mesas/reservas, inventario, compras/proveedores, empleados/turnos y reportes básicos.  

**Beneficios esperados:**  
- ✅ Reducción de errores en comandas y tiempos de atención.  
- ✅ Control de stock en tiempo real y alertas automáticas.  
- ✅ Cierres de caja más rápidos y conciliados.  
- ✅ Información cuantitativa para decisiones (qué vender, cuánto comprar).  
- ✅ Material técnico y funcional para la presentación final del TFI.  

------------------------------------------------------------------------------------------------------------------------------
## 🧩 2. OBJETIVO GENERAL  

Diseñar, desarrollar e implementar un **sistema de gestión integral (prototipo funcional)** para *La Vieja Estación – RestoBar*, que permita:  
- Operar POS.  
- Administrar mesas/reservas.  
- Gestionar inventario y compras.  
- Controlar turnos.  
- Generar reportes e informes.  
- Entregar la documentación completa requerida para la evaluación final del TFI.  

------------------------------------------------------------------------------------------------------------------------------
## 🎯 3. OBJETIVOS ESPECÍFICOS  

1. 🧾 Implementar módulo **POS** con creación de comandas, división de cuentas, descuentos y generación de tickets PDF.  
2. 🍽️ Desarrollar gestión de **mesas y reservas** con estados (libre, ocupada, reservada).  
3. 🍔 Implementar gestión de **productos y menú** con categorías, variantes, precios y foto.  
4. 📦 Crear módulo de **compras y proveedores**, con actualización automática de stock.  
5. 👤 Gestionar **usuarios y roles** (Administrador, Gerente, Mozo, Cajero, Cocina) con autenticación JWT.  
6. 📊 Generar **reportes estándar** (ventas por día/mes, producto, empleado, cierre de caja).  
7. 📚 Entregar **documentación técnica y de usuario** (README, manual, presentación, informe PDF).  
8. 🐳 Preparar entorno local con **Docker / docker-compose** y scripts MongoDB de inicialización y seed.  

------------------------------------------------------------------------------------------------------------------------------

## 📦 4. ALCANCE Y LIMITACIONES  

### ✅ Alcance  

- Gestión integral del bar, incluyendo usuarios, empleados y roles.  
- Control de mesas, reservas y turnos.  
- POS para registrar pedidos, generar tickets y procesar pagos.  
- Gestión de menú, categorías, recetas y costos.  
- Control de inventario con actualización automática.  
- Administración de proveedores y compras.  
- Registro de auditorías, cierres de caja y reportes.  
- Configuración general (impuestos, métodos de pago, parámetros del local).  

### ⚠️ Limitaciones  

- 🚫 Sin integración con sistemas fiscales (AFIP) ni facturación electrónica.  
- 🚫 No incluye módulo de delivery o pedidos online.  
- 🚫 Sin integración con pasarelas de pago externas.  
- 🚫 Sin aplicación móvil nativa (solo web adaptable).  
- 🚫 Reportes avanzados limitados a consultas básicas.  

------------------------------------------------------------------------------------------------------------------------------

## 🧾 5. ENTREGABLES  

- 📄 Documento de requisitos funcionales y no funcionales.  
- 🗃️ Diseño de base de datos relacional y modelo NoSQL (MongoDB).  
- 🧩 Diagramas E/R y de arquitectura del sistema.  
- 💾 Scripts de creación y datos de prueba (SQL y Mongo).  
- 💻 Código fuente backend (Node.js + Express) y frontend (React + Vite + Tailwind).  
- 📘 Manual de usuario y manual técnico.  
- 🧪 Documento de pruebas y validaciones.  
- 🧑‍🏫 Presentación final (PowerPoint o PDF) y defensa del TFI.  
- 🐳 Herramienta Docker para despliegue completo del sistema.  

------------------------------------------------------------------------------------------------------------------------------

## 🏆 6. CRITERIOS DE ÉXITO  

- ✅ Registrar un pedido completo en POS en menos de 1 minuto.  
- ✅ Actualización automática del stock después de cada venta o compra.  
- ✅ Reportes diarios y mensuales sin errores.  
- ✅ Disponibilidad del 95% durante las pruebas.  
- ✅ Interfaz usable, clara y adaptable (responsive design).  
- ✅ Al menos 85% de funcionalidades implementadas.  
- ✅ Consultas rápidas (<2 segundos por operación básica).  
- ✅ Instalación con Docker completada sin errores.  

------------------------------------------------------------------------------------------------------------------------------
## 📅 7. CRONOGRAMA INICIAL (Sprints)  

Duración propuesta: **6 sprints + Sprint 0 (preparación)** — cada uno de 1 semana.  

| Sprint | Duración | Objetivo Principal |
|:-------:|:----------|:------------------|
| 🏁 Sprint 0 | Semana 1 | Preparación del entorno, repositorio y estructura base. |
| 🔧 Sprint 1 | Semanas 2–4 | Diseño BD + configuración backend inicial. |
| 💻 Sprint 2 | Semanas 5–7 | Desarrollo módulos POS y usuarios. |
| 🍽️ Sprint 3 | Semanas 8–10 | Mesas, reservas e inventario. |
| 🛒 Sprint 4 | Semanas 11–12 | Compras, proveedores y reportes. |
| 🧪 Sprint 5 | Semanas 13–14 | Pruebas, validaciones y documentación. |
| 🎓 Sprint 6 | Semanas 15–16 | Presentación y defensa final. |

------------------------------------------------------------------------------------------------------------------------------

### ✍️ *Documento generado para la Tecnicatura Universitaria en Programación (UTN – FRT, 2025)*  
**TFI – “La Vieja Estación RestoBar”**

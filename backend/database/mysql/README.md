# Base relacional MySQL

El servidor usa esta base en todas sus rutas. MySQL 8.0.16 o posterior; probado en 8.0.46. Nombre: la_vieja_estacion.

- 001_schema.sql: tablas normalizadas y claves foráneas.
- 002_integridad.sql: validaciones, triggers y vistas del circuito de caja.
- 003_datos_iniciales.sql: datos de demostración, solo al crear una base vacía.
- 004_verificacion.sql: consultas de comprobación.
- 005_compras_pagos.sql: actualización incremental de compras.
- 006_pedidos_publicos.sql: datos de contacto, domicilio y solicitudes públicas.
- 007_modulos_restantes.sql: roles históricos de mensajes, nombres históricos de ventas y control de importaciones.

Para una instalación existente ejecutar npm run db:mysql:migrate:final desde backend. No ejecutar la instalación completa sobre una base con datos.

INSTALAR_BASE_DATOS.sql contiene el esquema, integridad, ejemplos y actualizaciones para una base NUEVA. No importa datos de Mongo. Los registros existentes de empleados, asistencias, inasistencias, pagos_empleado, mensajes, recuperaciones_password, ventas y detalle_venta son usados por los controladores MySQL.

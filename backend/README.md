# Backend — La Vieja Estación

Express, Socket.IO y MySQL 8.0.16 o posterior. Todo el servidor usa MySQL; no requiere MongoDB, Atlas ni MONGODB_URI. Las referencias antiguas están en legacy-mongo como archivos de texto que no se ejecutan.

## Instalación existente

Conservar el .env actual y hacer un respaldo de MySQL. En backend:

```powershell
npm ci
npm run db:mysql:migrate:final
npm run db:mysql:audit
npm run db:mysql:check
npm run dev
```

No ejecutar db:mysql:setup ni INSTALAR_BASE_DATOS.sql en una base con datos. La migración final aplica las actualizaciones 005, 006 y 007; no recarga datos iniciales.

## Base nueva de desarrollo

```powershell
npm ci
npm run db:mysql:setup
npm run db:mysql:check
```

Setup requiere una base vacía y carga datos de demostración. No es un importador de MongoDB.

## Variables

MYSQL_HOST (127.0.0.1), MYSQL_PORT (3306), MYSQL_USER (root), MYSQL_PASSWORD, MYSQL_DATABASE (la_vieja_estacion), JWT_SECRET_KEY y PORT (4000). Los scripts de instalación y migración utilizan la base la_vieja_estacion. SMTP: EMAIL_USER, EMAIL_PASS, EMAIL_FROM y FRONTEND_URL para recuperación de contraseña. No subir .env ni exportaciones de datos a GitHub.

## Funciones migradas

Usuarios/login, productos, mesas, pedidos internos/públicos, cocina, reservas, compras, caja, cierres, reportes, dashboard, empleados, asistencias, inasistencias, pagos del personal, mensajes entre gerente y superadministrador, recuperación de contraseña y sales.

El identificador público de un empleado corresponde al ID del usuario. Su ID de legajo SQL se utiliza internamente al relacionar jornadas y pagos. No se expone password_hash en las respuestas. Los usuarios con historial relacionado se desactivan: las claves foráneas bloquean una eliminación que destruiría referencias.

Sales conserva la API heredada y sus tablas ventas/detalle_venta. No se suma a reportes de caja: no hay una acreditación de pago equivalente a pagos_pedido. El POS y el menú público siguen el circuito pedidos → entrega → cobro. No mezclar ambos circuitos ni registrar dos veces una venta.

## Historiales pendientes

Ver scripts/mysql/IMPORTAR_HISTORIALES.md. Los tokens antiguos de recuperación no se migran; solicitar un enlace nuevo. El código SQL no importa automáticamente las colecciones del servidor MongoDB.

## Verificación

```powershell
npm run db:mysql:audit
npm run db:mysql:check
npm run test:mysql
```

Sin MYSQL_TESTS=1, las pruebas de integración SQL se omiten. Para desarrolladores: MYSQL_TESTS=1 habilita esas pruebas; los tests anteriores usan una base de desarrollo con los datos iniciales y no deben ejecutarse sobre datos reales. modulosFinales.test.js crea y elimina una base aislada final_prueba_* y necesita permisos CREATE/DROP DATABASE.

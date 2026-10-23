# Archivo de referencia de MongoDB

Estos archivos .txt son versiones históricas; no se importan ni ejecutan. Las rutas de la aplicación usan servicios MySQL. Los drivers MongoDB/Mongoose ya no son dependencias del backend.

No ejecutar scripts antiguos de datos demo, reseteo o stock contra la base actual. Usar scripts/mysql y las operaciones autenticadas del sistema. Para conservar datos pendientes de empleados, mensajes y sales: exportar JSON y usar db:mysql:import:pendientes. Los tokens de recuperación antiguos se invalidan; solicitar un enlace nuevo.

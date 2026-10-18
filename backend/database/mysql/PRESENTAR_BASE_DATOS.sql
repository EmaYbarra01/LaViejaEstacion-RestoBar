-- La Vieja Estación - RestoBar
-- Consultas de presentación del sistema de gestión. Este archivo no modifica datos.
USE la_vieja_estacion;
-- Hora argentina para la sesión de consulta. Las vistas convierten las fechas UTC.
SET time_zone = '-03:00';

-- Estructura relacional del proyecto.
SHOW TABLES;

-- Usuarios y roles. No se muestran contraseñas.
SELECT u.nombre,u.apellido,r.nombre rol,u.activo
FROM usuarios u JOIN roles r ON r.id=u.rol_id ORDER BY u.id;

-- Carta y control de stock.
SELECT p.nombre,c.nombre categoria,p.precio,p.stock,p.stock_minimo,p.disponible
FROM productos p JOIN categorias c ON c.id=p.categoria_id ORDER BY c.nombre,p.nombre;

-- Mesas del establecimiento.
SELECT numero,capacidad,estado,ubicacion FROM mesas ORDER BY numero;

-- Circuito de pedidos con hora argentina.
SELECT * FROM v_pedidos_presentacion ORDER BY numero_pedido;

-- Detalle de cada pedido, con precio histórico.
SELECT p.numero_pedido,d.nombre_historico producto,d.cantidad,d.precio_unitario,d.subtotal,p.total
FROM pedidos p JOIN detalle_pedido d ON d.pedido_id=p.id ORDER BY p.id,d.orden;

-- Cobros con su importe y vuelto.
SELECT p.numero_pedido,pg.metodo_pago,pg.monto_aplicado,pg.monto_recibido,pg.cambio,
CONVERT_TZ(pg.fecha_pago,'+00:00','-03:00') fecha_hora_argentina
FROM pagos_pedido pg JOIN pedidos p ON p.id=pg.pedido_id ORDER BY pg.fecha_pago;

-- Arqueo de caja y medios de pago.
SELECT * FROM v_cierres_presentacion;
SELECT * FROM v_ventas_por_metodo;

-- Compras y reservas.
SELECT c.numero_compra,pr.nombre proveedor,c.estado,c.subtotal,c.iva_monto,c.total
FROM compras c JOIN proveedores pr ON pr.id=c.proveedor_id;
SELECT cliente,fecha,hora,comensales,estado FROM reservas;

-- Validación: debe devolver cero filas.
SELECT * FROM v_incidencias_integridad;

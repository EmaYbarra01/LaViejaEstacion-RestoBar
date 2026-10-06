USE restobar_mysql_demo;
SET time_zone = '+00:00';
-- Debe devolver cero filas; no modifica datos.
SELECT * FROM v_incidencias_integridad;

SELECT estado,COUNT(*) cantidad FROM pedidos GROUP BY estado;
SELECT * FROM v_ventas_por_metodo;
-- Un cobro de demostración del día siguiente permanece sin cierre.
SELECT p.numero_pedido,pg.metodo_pago,pg.monto_aplicado,pg.fecha_pago
FROM v_pagos_pendientes_cierre pg JOIN pedidos p ON p.id=pg.pedido_id;

SELECT numero_cierre,total_ventas,total_descuentos,monto_inicial,efectivo_esperado,efectivo_contado,diferencia
FROM cierres_caja;
-- La suma de movimientos debe coincidir con el stock, empezando por la apertura.
SELECT p.id,p.nombre,p.stock,SUM(m.cantidad) stock_segun_movimientos
FROM productos p JOIN movimientos_stock m ON m.producto_id=p.id
GROUP BY p.id,p.nombre,p.stock HAVING p.stock<>SUM(m.cantidad);

-- El detalle se mantiene aunque después cambie el precio del catálogo.
SELECT p.numero_pedido,d.nombre_historico,d.cantidad,d.precio_unitario,d.subtotal,p.total
FROM pedidos p JOIN detalle_pedido d ON d.pedido_id=p.id ORDER BY p.id,d.orden;

USE restobar_mysql_demo;
SET time_zone = '+00:00';
DELIMITER $$
CREATE TRIGGER pedido_insert_guard BEFORE INSERT ON pedidos FOR EACH ROW
BEGIN
 IF NEW.estado = 'Cobrado' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Crear el pedido antes de registrar su pago';
 END IF;
END$$

CREATE TRIGGER pedido_update_guard BEFORE UPDATE ON pedidos FOR EACH ROW
BEGIN
 DECLARE pagos_validos INT DEFAULT 0;
 IF OLD.estado IN ('Cobrado','Cancelado') AND (
  NEW.estado <> OLD.estado OR NEW.total <> OLD.total OR NEW.subtotal <> OLD.subtotal
  OR NEW.descuento_monto <> OLD.descuento_monto OR NEW.descuento_porcentaje <> OLD.descuento_porcentaje
  OR NEW.metodo_pago <> OLD.metodo_pago OR NEW.mesa_id <> OLD.mesa_id OR NEW.mozo_id <> OLD.mozo_id
  OR NOT (NEW.fecha_cobrado <=> OLD.fecha_cobrado)
 ) THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido finalizado: no admite cambios económicos ni de estado';
 END IF;
 IF NEW.estado = 'Cobrado' THEN
  SELECT COUNT(*) INTO pagos_validos FROM pagos_pedido
  WHERE pedido_id = NEW.id AND monto_aplicado = NEW.total
   AND metodo_pago = NEW.metodo_pago AND fecha_pago = NEW.fecha_cobrado;
  IF pagos_validos <> 1 THEN
   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cobrado requiere un pago completo y coincidente';
  END IF;
 END IF;
 IF NEW.estado = 'Cancelado' AND EXISTS(SELECT 1 FROM pagos_pedido WHERE pedido_id = NEW.id) THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede cancelar un pedido que tiene pago';
 END IF;
END$$

CREATE TRIGGER pago_insert_guard BEFORE INSERT ON pagos_pedido FOR EACH ROW
BEGIN
 DECLARE estado_pedido VARCHAR(30);
 DECLARE total_pedido DECIMAL(12,2);
 SELECT estado,total INTO estado_pedido,total_pedido FROM pedidos WHERE id = NEW.pedido_id;
 IF estado_pedido <> 'Entregado' OR NEW.monto_aplicado <> total_pedido THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pago requiere pedido entregado y monto igual al total';
 END IF;
END$$
CREATE TRIGGER pago_update_guard BEFORE UPDATE ON pagos_pedido FOR EACH ROW
BEGIN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los pagos confirmados son inmutables';
END$$
CREATE TRIGGER pago_delete_guard BEFORE DELETE ON pagos_pedido FOR EACH ROW
BEGIN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los pagos confirmados no se eliminan';
END$$

CREATE TRIGGER cierre_pago_guard BEFORE INSERT ON cierre_pagos FOR EACH ROW
BEGIN
 DECLARE inicio DATETIME(3);
 DECLARE fin DATETIME(3);
 DECLARE fecha DATETIME(3);
 DECLARE estado_cierre VARCHAR(30);
 DECLARE estado_pedido VARCHAR(30);
 SELECT hora_inicio,hora_fin,estado INTO inicio,fin,estado_cierre FROM cierres_caja WHERE id = NEW.cierre_id;
 SELECT pg.fecha_pago,p.estado INTO fecha,estado_pedido FROM pagos_pedido pg
 JOIN pedidos p ON p.id = pg.pedido_id WHERE pg.id = NEW.pago_id;
 IF estado_cierre <> 'Abierto' OR estado_pedido <> 'Cobrado' OR fecha < inicio OR fecha >= fin THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cierre admite únicamente pagos cobrados dentro de su turno';
 END IF;
END$$

CREATE TRIGGER cierre_update_guard BEFORE UPDATE ON cierres_caja FOR EACH ROW
BEGIN
 DECLARE ventas DECIMAL(12,2);
 DECLARE efectivo DECIMAL(12,2);
 DECLARE descuentos DECIMAL(12,2);
 DECLARE gastos DECIMAL(12,2);
 DECLARE ingresos DECIMAL(12,2);
 DECLARE contado DECIMAL(12,2);
 IF OLD.estado <> 'Abierto' AND (
  NEW.total_ventas <> OLD.total_ventas OR NEW.total_descuentos <> OLD.total_descuentos
  OR NEW.total_gastos <> OLD.total_gastos OR NEW.total_ingresos_adicionales <> OLD.total_ingresos_adicionales
  OR NEW.monto_inicial <> OLD.monto_inicial OR NEW.efectivo_esperado <> OLD.efectivo_esperado
  OR NEW.efectivo_contado <> OLD.efectivo_contado OR NEW.hora_inicio <> OLD.hora_inicio OR NEW.hora_fin <> OLD.hora_fin
  OR NEW.estado = 'Abierto'
 ) THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cierre finalizado: sus importes y período son inmutables';
 END IF;
 IF OLD.estado = 'Abierto' AND NEW.estado <> 'Abierto' THEN
  SELECT COALESCE(SUM(pg.monto_aplicado),0),
   COALESCE(SUM(IF(pg.metodo_pago='Efectivo',pg.monto_aplicado,0)),0),
   COALESCE(SUM(p.descuento_monto),0) INTO ventas,efectivo,descuentos
  FROM cierre_pagos cp JOIN pagos_pedido pg ON pg.id = cp.pago_id JOIN pedidos p ON p.id = pg.pedido_id
  WHERE cp.cierre_id = NEW.id;
  SELECT COALESCE(SUM(IF(tipo='Gasto',monto,0)),0),COALESCE(SUM(IF(tipo='Ingreso',monto,0)),0)
   INTO gastos,ingresos FROM movimientos_caja WHERE cierre_id = NEW.id;
  SELECT COALESCE(SUM(total),0) INTO contado FROM desglose_caja WHERE cierre_id = NEW.id;
  IF NEW.total_ventas <> ventas OR NEW.total_descuentos <> descuentos OR NEW.total_gastos <> gastos
   OR NEW.total_ingresos_adicionales <> ingresos OR NEW.efectivo_esperado <> NEW.monto_inicial + efectivo + ingresos - gastos
   OR (EXISTS(SELECT 1 FROM desglose_caja WHERE cierre_id = NEW.id) AND NEW.efectivo_contado <> contado) THEN
   SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cierre no concilia con sus pagos, movimientos o billetes';
  END IF;
 END IF;
END$$

CREATE TRIGGER cierre_pago_delete_guard BEFORE DELETE ON cierre_pagos FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id = OLD.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede quitar un pago de un cierre finalizado';
 END IF;
END$$
CREATE TRIGGER cierre_pago_update_guard BEFORE UPDATE ON cierre_pagos FOR EACH ROW
BEGIN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La asignación de pago a cierre no se modifica';
END$$
DELIMITER ;

CREATE VIEW v_ventas_por_metodo AS
 SELECT cp.cierre_id,pg.metodo_pago,COUNT(*) cantidad,SUM(pg.monto_aplicado) total
 FROM cierre_pagos cp JOIN pagos_pedido pg ON pg.id=cp.pago_id GROUP BY cp.cierre_id,pg.metodo_pago;

CREATE VIEW v_pagos_pendientes_cierre AS
 SELECT pg.* FROM pagos_pedido pg JOIN pedidos p ON p.id=pg.pedido_id
 LEFT JOIN cierre_pagos cp ON cp.pago_id=pg.id WHERE cp.pago_id IS NULL AND p.estado='Cobrado';

CREATE VIEW v_incidencias_integridad AS
 SELECT 'TOTAL_PEDIDO' tipo,p.id entidad_id FROM pedidos p
 LEFT JOIN detalle_pedido d ON d.pedido_id=p.id GROUP BY p.id,p.subtotal
 HAVING COUNT(d.id)=0 OR p.subtotal <> COALESCE(SUM(d.subtotal),0)
 UNION ALL
 SELECT 'PAGO_ESTADO',p.id FROM pedidos p LEFT JOIN pagos_pedido pg ON pg.pedido_id=p.id
 WHERE (p.estado='Cobrado' AND (pg.id IS NULL OR pg.monto_aplicado<>p.total OR pg.metodo_pago<>p.metodo_pago))
 OR (p.estado<>'Cobrado' AND pg.id IS NOT NULL)
 UNION ALL
 SELECT 'TOTAL_COMPRA',c.id FROM compras c LEFT JOIN detalle_compra d ON d.compra_id=c.id
 GROUP BY c.id,c.subtotal HAVING COUNT(d.id)=0 OR c.subtotal <> COALESCE(SUM(d.subtotal),0)
 UNION ALL
 SELECT 'ASISTENCIA_DUPLICADA',a.empleado_id FROM asistencias a JOIN inasistencias i
 ON i.empleado_id=a.empleado_id AND i.fecha=a.fecha
 UNION ALL
 SELECT 'MESA_ESTADO',m.id FROM mesas m WHERE
 (m.estado='Ocupada' AND NOT EXISTS(SELECT 1 FROM pedidos p WHERE p.mesa_id=m.id AND p.activo AND p.estado NOT IN ('Cobrado','Cancelado')))
 OR (m.estado<>'Ocupada' AND EXISTS(SELECT 1 FROM pedidos p WHERE p.mesa_id=m.id AND p.activo AND p.estado NOT IN ('Cobrado','Cancelado')));

DELIMITER $$
CREATE TRIGGER movimientos_caja_insert_guard BEFORE INSERT ON movimientos_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=NEW.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER movimientos_caja_update_guard BEFORE UPDATE ON movimientos_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=OLD.cierre_id) <> 'Abierto' OR (SELECT estado FROM cierres_caja WHERE id=NEW.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER movimientos_caja_delete_guard BEFORE DELETE ON movimientos_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=OLD.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER desglose_caja_insert_guard BEFORE INSERT ON desglose_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=NEW.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER desglose_caja_update_guard BEFORE UPDATE ON desglose_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=OLD.cierre_id) <> 'Abierto' OR (SELECT estado FROM cierres_caja WHERE id=NEW.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER desglose_caja_delete_guard BEFORE DELETE ON desglose_caja FOR EACH ROW
BEGIN
 IF (SELECT estado FROM cierres_caja WHERE id=OLD.cierre_id) <> 'Abierto' THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER detalle_pedido_insert_guard BEFORE INSERT ON detalle_pedido FOR EACH ROW
BEGIN
 IF (SELECT estado FROM pedidos WHERE id=NEW.pedido_id) IN ('Cobrado','Cancelado') THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER detalle_pedido_update_guard BEFORE UPDATE ON detalle_pedido FOR EACH ROW
BEGIN
 IF (SELECT estado FROM pedidos WHERE id=OLD.pedido_id) IN ('Cobrado','Cancelado') OR (SELECT estado FROM pedidos WHERE id=NEW.pedido_id) IN ('Cobrado','Cancelado') THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
CREATE TRIGGER detalle_pedido_delete_guard BEFORE DELETE ON detalle_pedido FOR EACH ROW
BEGIN
 IF (SELECT estado FROM pedidos WHERE id=OLD.pedido_id) IN ('Cobrado','Cancelado') THEN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se modifica el detalle de una operación finalizada';
 END IF;
END$$
DELIMITER ;

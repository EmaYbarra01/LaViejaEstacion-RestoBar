-- Migración incremental. No borra ni recarga datos existentes.
USE la_vieja_estacion;
SET time_zone = '+00:00';
CREATE TABLE IF NOT EXISTS pagos_compra (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 compra_id INT UNSIGNED NOT NULL,
 registrado_por_id INT UNSIGNED NOT NULL,
 monto DECIMAL(12,2) NOT NULL,
 metodo_pago ENUM('Efectivo','Transferencia','Cheque','Otro') NOT NULL,
 referencia VARCHAR(200) NOT NULL DEFAULT '',
 idempotency_key VARCHAR(100) NOT NULL,
 fecha_pago DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 UNIQUE KEY uq_pago_compra_clave(compra_id,idempotency_key),
 FOREIGN KEY (compra_id) REFERENCES compras(id),
 FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
 CHECK (monto>0)
) ENGINE=InnoDB;
-- Las compras históricas se consideran sin pago registrado. No se inventan pagos.
-- La secuencia se alinea conservando cualquier valor mayor que el máximo actual.
INSERT INTO secuencias(nombre,valor) SELECT 'compra',COALESCE(MAX(numero_compra),0) FROM compras
 ON DUPLICATE KEY UPDATE valor=GREATEST(secuencias.valor,VALUES(valor));
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS pago_compra_update_guard BEFORE UPDATE ON pagos_compra FOR EACH ROW
BEGIN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los pagos de compra confirmados son inmutables';
END$$
CREATE TRIGGER IF NOT EXISTS pago_compra_delete_guard BEFORE DELETE ON pagos_compra FOR EACH ROW
BEGIN
 SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Los pagos de compra confirmados no se eliminan';
END$$
DELIMITER ;

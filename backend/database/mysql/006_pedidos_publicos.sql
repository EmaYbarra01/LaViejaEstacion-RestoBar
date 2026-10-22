-- Actualización incremental: conserva los pedidos, pagos y cierres existentes.
USE la_vieja_estacion;
SET time_zone = '+00:00';
-- Los pedidos online no tienen un empleado ficticio ni una mesa para delivery.
ALTER TABLE pedidos
 MODIFY mesa_id INT UNSIGNED NULL,
 MODIFY mozo_id INT UNSIGNED NULL,
 MODIFY numero_mesa_historico INT UNSIGNED NULL;
ALTER TABLE historial_estados_pedido MODIFY usuario_id INT UNSIGNED NULL;
ALTER TABLE movimientos_stock MODIFY registrado_por_id INT UNSIGNED NULL;
CREATE TABLE IF NOT EXISTS pedidos_publicos (
 solicitud_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
 huella CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 pedido_id INT UNSIGNED NULL UNIQUE,
 tipo_pedido ENUM('Local','Domicilio') NOT NULL,
 cliente_nombre VARCHAR(100) NOT NULL,
 cliente_telefono VARCHAR(40) NOT NULL,
 cliente_email VARCHAR(254) NOT NULL,
 cliente_direccion VARCHAR(255) NOT NULL DEFAULT '',
 cliente_referencia VARCHAR(255) NOT NULL DEFAULT '',
 metodo_pago_solicitado ENUM('Efectivo','Transferencia') NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB;
-- pedido_id queda temporalmente NULL solo dentro de la transacción de creación.
-- La clave de solicitud evita duplicar un pedido y su descuento de stock al reintentar.

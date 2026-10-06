-- Instalación única de la demo. Leer README.md antes de ejecutar.
-- La Vieja Estación: esquema relacional de desarrollo, MySQL >= 8.0.16.
-- No elimina ni importa datos de MongoDB. Ejecutar una sola vez en una base nueva.
CREATE DATABASE IF NOT EXISTS restobar_mysql_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE restobar_mysql_demo;
SET time_zone = '+00:00';

CREATE TABLE roles (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE usuarios (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 rol_id INT UNSIGNED NOT NULL,
 nombre VARCHAR(100) NOT NULL,
 apellido VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 dni VARCHAR(20) NOT NULL UNIQUE,
 telefono VARCHAR(40) NOT NULL DEFAULT '',
 direccion VARCHAR(255) NOT NULL DEFAULT '',
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 fecha_ingreso DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 ultimo_acceso DATETIME(3) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE categorias (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(80) NOT NULL UNIQUE,
 activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE productos (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 categoria_id INT UNSIGNED NOT NULL,
 nombre VARCHAR(200) NOT NULL,
 descripcion TEXT NOT NULL,
 precio DECIMAL(12,2) NOT NULL,
 costo DECIMAL(12,2) NOT NULL DEFAULT 0,
 stock DECIMAL(12,3) NOT NULL DEFAULT 0,
 stock_minimo DECIMAL(12,3) NOT NULL DEFAULT 0,
 unidad_medida ENUM('Unidad','Kg','Litro','Gramo','Ml','Porción') NOT NULL DEFAULT 'Unidad',
 disponible BOOLEAN NOT NULL DEFAULT TRUE,
 imagen_url VARCHAR(500) NOT NULL DEFAULT '',
 codigo VARCHAR(100) NULL UNIQUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (categoria_id) REFERENCES categorias(id),
 CHECK (precio >= 0 AND costo >= 0 AND stock >= 0 AND stock_minimo >= 0),
 INDEX idx_productos_menu(disponible,categoria_id)
) ENGINE=InnoDB;

CREATE TABLE mesas (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 numero INT UNSIGNED NOT NULL UNIQUE,
 capacidad INT UNSIGNED NOT NULL,
 estado ENUM('Libre','Ocupada','Reservada') NOT NULL DEFAULT 'Libre',
 ubicacion VARCHAR(150) NOT NULL DEFAULT 'Salón Principal',
 codigo_qr TEXT NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 CHECK (numero > 0 AND capacidad > 0)
) ENGINE=InnoDB;

CREATE TABLE reservas (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 mesa_id INT UNSIGNED NULL,
 cliente VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL,
 telefono VARCHAR(40) NOT NULL,
 fecha DATE NOT NULL,
 hora TIME NOT NULL,
 comensales INT UNSIGNED NOT NULL,
 estado ENUM('Pendiente','Confirmada','Cancelada','Completada') NOT NULL DEFAULT 'Pendiente',
 comentarios VARCHAR(500) NOT NULL DEFAULT '',
 confirmation_token_hash CHAR(64) NULL UNIQUE,
 token_expiry DATETIME(3) NULL,
 confirmed_at DATETIME(3) NULL,
 cancelled_at DATETIME(3) NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (mesa_id) REFERENCES mesas(id),
 CHECK (comensales BETWEEN 1 AND 15),
 INDEX idx_reservas_agenda(fecha,hora,mesa_id,estado)
) ENGINE=InnoDB;

-- El backend incrementará una secuencia con bloqueo dentro de la transacción.
-- Evita obtener el número con MAX()+1 en dos PCs simultáneas.
CREATE TABLE secuencias (
 nombre VARCHAR(80) PRIMARY KEY,
 valor INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE pedidos (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 numero_pedido VARCHAR(50) NOT NULL UNIQUE,
 mesa_id INT UNSIGNED NOT NULL,
 mozo_id INT UNSIGNED NOT NULL,
 numero_mesa_historico INT UNSIGNED NOT NULL,
 nombre_mozo_historico VARCHAR(200) NOT NULL,
 estado ENUM('Pendiente','En Preparación','Listo','Entregado','Cobrado','Cancelado') NOT NULL DEFAULT 'Pendiente',
 estado_cocina ENUM('Pendiente','En Preparación','Listo') NOT NULL DEFAULT 'Pendiente',
 estado_caja ENUM('Pendiente','Cobrado') NOT NULL DEFAULT 'Pendiente',
 subtotal DECIMAL(12,2) NOT NULL,
 descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
 descuento_monto DECIMAL(12,2) NOT NULL DEFAULT 0,
 descuento_motivo VARCHAR(255) NOT NULL DEFAULT '',
 total DECIMAL(12,2) NOT NULL,
 metodo_pago ENUM('Pendiente','Efectivo','Transferencia') NOT NULL DEFAULT 'Pendiente',
 observaciones_generales VARCHAR(500) NOT NULL DEFAULT '',
 tiempo_estimado INT UNSIGNED NOT NULL DEFAULT 15,
 cancelado_motivo VARCHAR(200) NULL,
 cancelado_por_id INT UNSIGNED NULL,
 cancelado_fecha DATETIME(3) NULL,
 fecha_creacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 fecha_listo DATETIME(3) NULL,
 fecha_servido DATETIME(3) NULL,
 fecha_cobrado DATETIME(3) NULL,
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (mesa_id) REFERENCES mesas(id),
 FOREIGN KEY (mozo_id) REFERENCES usuarios(id),
 FOREIGN KEY (cancelado_por_id) REFERENCES usuarios(id),
 CHECK (subtotal >= 0 AND descuento_porcentaje BETWEEN 0 AND 100 AND descuento_monto BETWEEN 0 AND subtotal),
 CHECK (total = subtotal - descuento_monto),
 CHECK ((estado = 'Cobrado' AND estado_caja = 'Cobrado' AND metodo_pago <> 'Pendiente' AND fecha_cobrado IS NOT NULL)
     OR (estado <> 'Cobrado' AND estado_caja = 'Pendiente' AND metodo_pago = 'Pendiente' AND fecha_cobrado IS NULL)),
 CHECK (estado <> 'Cancelado' OR (cancelado_motivo IS NOT NULL AND CHAR_LENGTH(TRIM(cancelado_motivo)) > 0
     AND cancelado_por_id IS NOT NULL AND cancelado_fecha IS NOT NULL)),
 INDEX idx_pedidos_cocina(activo,estado,fecha_creacion),
 INDEX idx_pedidos_mesa(mesa_id,estado),
 INDEX idx_pedidos_mozo(mozo_id,fecha_creacion),
 INDEX idx_pedidos_cobro(fecha_cobrado,metodo_pago)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 pedido_id INT UNSIGNED NOT NULL,
 producto_id INT UNSIGNED NOT NULL,
 orden INT UNSIGNED NOT NULL,
 nombre_historico VARCHAR(200) NOT NULL,
 cantidad DECIMAL(12,3) NOT NULL,
 precio_unitario DECIMAL(12,2) NOT NULL,
 subtotal DECIMAL(12,2) NOT NULL,
 observaciones VARCHAR(200) NOT NULL DEFAULT '',
 UNIQUE (pedido_id,orden),
 FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
 FOREIGN KEY (producto_id) REFERENCES productos(id),
 CHECK (cantidad > 0 AND precio_unitario >= 0 AND subtotal = ROUND(cantidad * precio_unitario,2))
) ENGINE=InnoDB;

CREATE TABLE historial_estados_pedido (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 pedido_id INT UNSIGNED NOT NULL,
 usuario_id INT UNSIGNED NOT NULL,
 estado ENUM('Pendiente','En Preparación','Listo','Entregado','Cobrado','Cancelado') NOT NULL,
 fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 observacion VARCHAR(200) NOT NULL DEFAULT '',
 FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
 INDEX idx_historial_pedido(pedido_id,fecha,id)
) ENGINE=InnoDB;

CREATE TABLE pagos_pedido (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 pedido_id INT UNSIGNED NOT NULL UNIQUE,
 cajero_id INT UNSIGNED NOT NULL,
 metodo_pago ENUM('Efectivo','Transferencia') NOT NULL,
 monto_aplicado DECIMAL(12,2) NOT NULL,
 monto_recibido DECIMAL(12,2) NOT NULL,
 cambio DECIMAL(12,2) NOT NULL DEFAULT 0,
 fecha_pago DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
 FOREIGN KEY (cajero_id) REFERENCES usuarios(id),
 CHECK (monto_aplicado >= 0 AND monto_recibido >= monto_aplicado AND cambio = monto_recibido - monto_aplicado),
 CHECK (metodo_pago = 'Efectivo' OR cambio = 0),
 INDEX idx_pagos_turno(fecha_pago,metodo_pago)
) ENGINE=InnoDB;

-- Cada movimiento conserva su origen. Un pedido cancelado restaura su stock
-- una sola vez, en la misma transacción que cambia el estado.
CREATE TABLE movimientos_stock (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 producto_id INT UNSIGNED NOT NULL,
 pedido_id INT UNSIGNED NULL,
 cantidad DECIMAL(12,3) NOT NULL,
 motivo VARCHAR(150) NOT NULL,
 registrado_por_id INT UNSIGNED NOT NULL,
 fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (producto_id) REFERENCES productos(id),
 FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
 FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
 CHECK (cantidad <> 0)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(200) NOT NULL,
 cuit VARCHAR(20) NULL UNIQUE,
 telefono VARCHAR(40) NOT NULL DEFAULT '',
 email VARCHAR(254) NOT NULL DEFAULT '',
 direccion VARCHAR(255) NOT NULL DEFAULT '',
 activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE compras (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 numero_compra INT UNSIGNED NOT NULL UNIQUE,
 proveedor_id INT UNSIGNED NOT NULL,
 proveedor_nombre_historico VARCHAR(200) NOT NULL,
 registrado_por_id INT UNSIGNED NOT NULL,
 fecha_compra DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 fecha_recepcion DATETIME(3) NULL,
 estado ENUM('Pendiente','Recibida','Parcial','Cancelada') NOT NULL DEFAULT 'Pendiente',
 subtotal DECIMAL(12,2) NOT NULL,
 iva_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 21,
 iva_monto DECIMAL(12,2) NOT NULL DEFAULT 0,
 total DECIMAL(12,2) NOT NULL,
 metodo_pago ENUM('Efectivo','Transferencia','Cheque','Cuenta Corriente','Otro') NOT NULL,
 numero_factura VARCHAR(100) NULL,
 observaciones TEXT NOT NULL,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
 FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
 CHECK (subtotal >= 0 AND iva_porcentaje BETWEEN 0 AND 100 AND iva_monto = ROUND(subtotal * iva_porcentaje / 100,2)),
 CHECK (total = subtotal + iva_monto),
 INDEX idx_compras_fecha(fecha_compra,estado)
) ENGINE=InnoDB;

CREATE TABLE detalle_compra (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 compra_id INT UNSIGNED NOT NULL,
 producto_id INT UNSIGNED NULL,
 nombre_historico VARCHAR(200) NOT NULL,
 cantidad DECIMAL(12,3) NOT NULL,
 unidad_medida ENUM('Unidad','Kg','Litro','Gramo','Ml','Caja','Pack','Otro') NOT NULL,
 factor_stock DECIMAL(12,3) NULL,
 precio_unitario DECIMAL(12,2) NOT NULL,
 subtotal DECIMAL(12,2) NOT NULL,
 cantidad_recibida DECIMAL(12,3) NOT NULL DEFAULT 0,
 FOREIGN KEY (compra_id) REFERENCES compras(id),
 FOREIGN KEY (producto_id) REFERENCES productos(id),
 CHECK (cantidad > 0 AND precio_unitario >= 0 AND cantidad_recibida BETWEEN 0 AND cantidad),
 CHECK (subtotal = ROUND(cantidad * precio_unitario,2)),
 CHECK (factor_stock IS NULL OR factor_stock > 0),
 CHECK (producto_id IS NULL OR factor_stock IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE recepciones_compra (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 detalle_compra_id INT UNSIGNED NOT NULL,
 registrado_por_id INT UNSIGNED NOT NULL,
 cantidad DECIMAL(12,3) NOT NULL,
 fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (detalle_compra_id) REFERENCES detalle_compra(id),
 FOREIGN KEY (registrado_por_id) REFERENCES usuarios(id),
 CHECK (cantidad > 0)
) ENGINE=InnoDB;

CREATE TABLE cierres_caja (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 numero_cierre INT UNSIGNED NOT NULL UNIQUE,
 realizado_por_id INT UNSIGNED NOT NULL,
 fecha_cierre DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 turno ENUM('Mañana','Tarde','Noche','Completo') NOT NULL DEFAULT 'Completo',
 hora_inicio DATETIME(3) NOT NULL,
 hora_fin DATETIME(3) NOT NULL,
 monto_inicial DECIMAL(12,2) NOT NULL DEFAULT 0,
 total_ventas DECIMAL(12,2) NOT NULL DEFAULT 0,
 total_descuentos DECIMAL(12,2) NOT NULL DEFAULT 0,
 total_gastos DECIMAL(12,2) NOT NULL DEFAULT 0,
 total_ingresos_adicionales DECIMAL(12,2) NOT NULL DEFAULT 0,
 efectivo_esperado DECIMAL(12,2) NOT NULL,
 efectivo_contado DECIMAL(12,2) NOT NULL,
 diferencia DECIMAL(12,2) NOT NULL,
 estado ENUM('Abierto','Cerrado','Revisado','Auditado') NOT NULL DEFAULT 'Cerrado',
 observaciones TEXT NOT NULL,
 revisado_por_id INT UNSIGNED NULL,
 fecha_revision DATETIME(3) NULL,
 observaciones_revision TEXT NOT NULL,
 monto_entregado DECIMAL(12,2) NOT NULL DEFAULT 0,
 monto_siguiente_turno DECIMAL(12,2) NOT NULL DEFAULT 0,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (realizado_por_id) REFERENCES usuarios(id),
 FOREIGN KEY (revisado_por_id) REFERENCES usuarios(id),
 CHECK (hora_fin > hora_inicio),
 CHECK (monto_inicial >= 0 AND total_ventas >= 0 AND total_descuentos >= 0 AND total_gastos >= 0
     AND total_ingresos_adicionales >= 0 AND efectivo_esperado >= 0 AND efectivo_contado >= 0
     AND monto_entregado >= 0 AND monto_siguiente_turno >= 0),
 CHECK (diferencia = efectivo_contado - efectivo_esperado),
 INDEX idx_cierres_fecha(fecha_cierre)
) ENGINE=InnoDB;

-- El mismo pago no se puede incluir en dos cierres.
CREATE TABLE cierre_pagos (
 cierre_id INT UNSIGNED NOT NULL,
 pago_id INT UNSIGNED NOT NULL UNIQUE,
 PRIMARY KEY (cierre_id,pago_id),
 FOREIGN KEY (cierre_id) REFERENCES cierres_caja(id),
 FOREIGN KEY (pago_id) REFERENCES pagos_pedido(id)
) ENGINE=InnoDB;

CREATE TABLE movimientos_caja (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 cierre_id INT UNSIGNED NOT NULL,
 tipo ENUM('Gasto','Ingreso') NOT NULL,
 concepto VARCHAR(255) NOT NULL,
 monto DECIMAL(12,2) NOT NULL,
 comprobante VARCHAR(255) NOT NULL DEFAULT '',
 fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (cierre_id) REFERENCES cierres_caja(id),
 CHECK (monto > 0)
) ENGINE=InnoDB;

-- Valores explícitos: 1000, 2000, 10000, 20000, etc.; evita claves engañosas.
-- Para monedas se usa cada denominación; total = valor nominal * cantidad.
CREATE TABLE desglose_caja (
 cierre_id INT UNSIGNED NOT NULL,
 denominacion DECIMAL(12,2) NOT NULL,
 cantidad INT UNSIGNED NOT NULL,
 total DECIMAL(12,2) GENERATED ALWAYS AS (denominacion * cantidad) STORED,
 PRIMARY KEY (cierre_id,denominacion),
 FOREIGN KEY (cierre_id) REFERENCES cierres_caja(id),
 CHECK (denominacion > 0)
) ENGINE=InnoDB;

CREATE TABLE empleados (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id INT UNSIGNED NOT NULL UNIQUE,
 salario_mensual DECIMAL(12,2) NOT NULL DEFAULT 0,
 cargo VARCHAR(100) NOT NULL,
 fecha_contratacion DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 activo BOOLEAN NOT NULL DEFAULT TRUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
 CHECK (salario_mensual >= 0)
) ENGINE=InnoDB;

CREATE TABLE asistencias (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 empleado_id INT UNSIGNED NOT NULL,
 fecha DATE NOT NULL,
 presente BOOLEAN NOT NULL DEFAULT TRUE,
 hora_entrada TIME NULL,
 hora_salida TIME NULL,
 observaciones VARCHAR(500) NOT NULL DEFAULT '',
 UNIQUE (empleado_id,fecha),
 FOREIGN KEY (empleado_id) REFERENCES empleados(id)
) ENGINE=InnoDB;

CREATE TABLE inasistencias (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 empleado_id INT UNSIGNED NOT NULL,
 fecha DATE NOT NULL,
 motivo VARCHAR(200) NOT NULL,
 observaciones VARCHAR(500) NOT NULL DEFAULT '',
 UNIQUE (empleado_id,fecha),
 FOREIGN KEY (empleado_id) REFERENCES empleados(id)
) ENGINE=InnoDB;

CREATE TABLE pagos_empleado (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 empleado_id INT UNSIGNED NOT NULL,
 mes TINYINT UNSIGNED NOT NULL,
 anio SMALLINT UNSIGNED NOT NULL,
 monto DECIMAL(12,2) NOT NULL,
 fecha_pago DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 metodo_pago ENUM('Efectivo','Transferencia','Cheque') NOT NULL,
 observaciones VARCHAR(500) NOT NULL DEFAULT '',
 UNIQUE (empleado_id,mes,anio),
 FOREIGN KEY (empleado_id) REFERENCES empleados(id),
 CHECK (mes BETWEEN 1 AND 12 AND anio >= 2000 AND monto > 0)
) ENGINE=InnoDB;

CREATE TABLE mensajes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 remitente_id INT UNSIGNED NOT NULL,
 destinatario_id INT UNSIGNED NOT NULL,
 texto VARCHAR(500) NOT NULL,
 leido BOOLEAN NOT NULL DEFAULT FALSE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (remitente_id) REFERENCES usuarios(id),
 FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
 CHECK (CHAR_LENGTH(TRIM(texto)) > 0),
 INDEX idx_mensajes_conversacion(remitente_id,destinatario_id,created_at)
) ENGINE=InnoDB;

CREATE TABLE recuperaciones_password (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id INT UNSIGNED NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE,
 created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 expires_at DATETIME(3) NOT NULL,
 usado_at DATETIME(3) NULL,
 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
 CHECK (expires_at > created_at)
) ENGINE=InnoDB;

-- Sale tiene rutas existentes: se conserva como venta independiente del POS.
-- No se suma a reportes de pedidos para evitar duplicar ingresos.
CREATE TABLE ventas (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id INT UNSIGNED NOT NULL,
 total DECIMAL(12,2) NOT NULL,
 fecha DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
 CHECK (total >= 0)
) ENGINE=InnoDB;

CREATE TABLE detalle_venta (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 venta_id INT UNSIGNED NOT NULL,
 producto_id INT UNSIGNED NOT NULL,
 cantidad DECIMAL(12,3) NOT NULL,
 precio_unitario DECIMAL(12,2) NOT NULL,
 FOREIGN KEY (venta_id) REFERENCES ventas(id),
 FOREIGN KEY (producto_id) REFERENCES productos(id),
 CHECK (cantidad > 0 AND precio_unitario >= 0)
) ENGINE=InnoDB;

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

-- Datos ficticios. Solo para restobar_mysql_demo VACÍA. No contiene usuarios originales.
USE restobar_mysql_demo;
SET time_zone = '+00:00';
START TRANSACTION;
INSERT INTO roles (id,nombre) VALUES (1,'SuperAdministrador');
INSERT INTO roles (id,nombre) VALUES (2,'Gerente');
INSERT INTO roles (id,nombre) VALUES (3,'Mozo');
INSERT INTO roles (id,nombre) VALUES (4,'Cajero');
INSERT INTO roles (id,nombre) VALUES (5,'EncargadoCocina');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (1,1,'Admin','Demo','usuario1@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-001','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (2,2,'Gerente','Demo','usuario2@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-002','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (3,3,'Mozo','Uno','usuario3@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-003','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (4,4,'Cajero','Demo','usuario4@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-004','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (5,5,'Cocina','Uno','usuario5@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-005','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (6,3,'Mozo','Dos','usuario6@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-006','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (7,3,'Mozo','Tres','usuario7@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-007','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (8,3,'Mozo','Cuatro','usuario8@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-008','2026-10-01 12:00:00');
INSERT INTO usuarios (id,rol_id,nombre,apellido,email,password_hash,dni,fecha_ingreso) VALUES (9,5,'Cocina','Dos','usuario9@restobar.example','$2b$10$jK7Kla8/d7q4JUCj1tXuQekatDDOLf4mPxa40l5O6vl7jUYZzpqwm','DEMO-009','2026-10-01 12:00:00');
INSERT INTO categorias (id,nombre) VALUES (1,'Bebidas');
INSERT INTO categorias (id,nombre) VALUES (2,'Bebidas Alcohólicas');
INSERT INTO categorias (id,nombre) VALUES (3,'Comidas');
INSERT INTO categorias (id,nombre) VALUES (4,'Postres');
INSERT INTO categorias (id,nombre) VALUES (5,'Entradas');
INSERT INTO categorias (id,nombre) VALUES (6,'Guarniciones');
INSERT INTO categorias (id,nombre) VALUES (7,'Otro');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (1,2,'Cerveza Quilmes 1L','Cerveza Quilmes en botella de 1 litro',8000,2000,100,5,'Unidad',TRUE,'/images/productos/cerveza quilmes 1L.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (2,3,'Milanesa Napolitana','Milanesa de carne, jamón, queso y salsa, con papas fritas',17000,6200,100,5,'Unidad',TRUE,'/images/productos/milanesa napolitana.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (3,3,'Sandwich de Milanesa','milanesa de carne, verduras, adherezos y papas fritas',11000,6000,100,5,'Unidad',TRUE,'/images/productos/sandwich de milanesa.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (4,3,'Ñoquis con Bolognesa (Sin TACC)','Ñoquis de papas y premezcla acompañado de salsa bolognesa apto Sin TACC y sin Gluten',11000,5000,100,5,'Unidad',TRUE,'/images/productos/Noqui sin tacc.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (5,3,'Pizza Muzzarella','Pizza grande de muzzarella (8 porciones)',12000,5500,100,5,'Unidad',TRUE,'/images/productos/pizza muzzarella.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (6,4,'Flan con Dulce de Leche','Flan casero con dulce de leche y crema (Apto para celiacos)',5000,1000,100,5,'Unidad',TRUE,'/images/productos/flan con dulce de leche.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (7,4,'Helado (3 bochas)','Helado artesanal de 3 bochas a elección',6000,2500,100,5,'Unidad',TRUE,'/images/productos/helado 3 bochas.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (8,1,'Coca Cola 500ml','Gaseosa Coca Cola en botella de 500ml',5000,1500,100,5,'Unidad',TRUE,'/images/productos/coca cola 500.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (9,3,'Empanadas de Carne (docena)','Docena de empanadas de carne',20000,8000,100,5,'Unidad',TRUE,'/images/productos/empanadas de carne.jpeg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (10,2,'Vino Tinto Copa','Copa de vino tinto de la casa',4000,1200,100,5,'Unidad',TRUE,'/images/productos/vino tinto copa.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (11,2,'Vino Blanco Copa','Copa de vino blanco de la casa',4000,1200,100,5,'Unidad',TRUE,'/images/productos/vino blanco copa.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (12,3,'Hamburguesa Completa','Doble Hamburguesa de carne smash, queso cheddar, adherezos y papas fritas',10000,4000,100,5,'Unidad',TRUE,'/images/productos/hamburguesa completa.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (13,3,'Ensalada Caesar','Ensalada Caesar, pollo grillado, trozos de pan tostado, aderezos, queso parmesano',8000,4500,100,5,'Unidad',TRUE,'/images/productos/ensalada cesar.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (14,4,'Quesillo con Nueces y Dulce de Leche','Quesillo acompañado con nueces seleccionadas y dulce de leche casero',7000,3500,100,5,'Unidad',TRUE,'/images/productos/Quesillo nuez y dulce.jpg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (15,3,'Picada Regional','Jamón crudo y Jamón cocido natural, Salame, Bondiola al pimentón, Quesos duros (Pategrás, Gouda, Fontina), Aceitunas verdes o negras, untables y extras.',18000,12000,100,5,'Unidad',TRUE,'/images/productos/picada regional.jpeg');
INSERT INTO productos (id,categoria_id,nombre,descripcion,precio,costo,stock,stock_minimo,unidad_medida,disponible,imagen_url) VALUES (16,4,'Frutilla con Crema','Frutilla fresca y crema Chantilly',5000,3500,1,5,'Unidad',TRUE,'/images/productos/frutilla con crema.jpg');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (1,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (2,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (3,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (4,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (5,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (6,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (7,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (8,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (9,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (10,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (11,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (12,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (13,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (14,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (15,100,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO movimientos_stock (producto_id,cantidad,motivo,registrado_por_id,fecha) VALUES (16,1,'Stock inicial de demostración',1,'2026-10-01 12:00:00');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (1,1,4,'Salón Principal','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (2,2,2,'Salón Principal','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (3,3,6,'Salón Principal','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (4,4,4,'Salón Principal','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (5,5,2,'Salón Principal','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (6,6,8,'Salón VIP','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (7,7,4,'Salón VIP','Libre','');
INSERT INTO mesas (id,numero,capacidad,ubicacion,estado,codigo_qr) VALUES (8,8,2,'Salón VIP','Libre','');
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (1,'DEMO-202610-0001',1,3,1,'Mozo Uno','Entregado','Listo',8000,10,800.00,'Descuento por pago en efectivo',7200.00,'2026-10-05 14:01:00.000','2026-10-05 14:01:00.000','2026-10-05 14:30:00.000','2026-10-05 14:40:00.000',NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (1,1,1,'Cerveza Quilmes 1L',1,8000,8000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (1,3,'Pendiente','2026-10-05 14:01:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (1,5,'En Preparación','2026-10-05 14:25:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (1,5,'Listo','2026-10-05 14:30:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (1,3,'Entregado','2026-10-05 14:35:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (1,4,'Cobrado','2026-10-05 15:01:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (1,1,-1,'Pedido de demostración',3,'2026-10-05 14:01:00.000');
UPDATE productos SET stock=stock-1 WHERE id=1;
INSERT INTO pagos_pedido (id,pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio,fecha_pago) VALUES (1,1,4,'Efectivo',7200.00,8000,800.00,'2026-10-05 15:01:00.000');
UPDATE pedidos SET estado='Cobrado',estado_caja='Cobrado',metodo_pago='Efectivo',fecha_cobrado='2026-10-05 15:01:00.000' WHERE id=1;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (2,'DEMO-202610-0002',2,3,2,'Mozo Uno','Entregado','Listo',34000,0,0,'',34000,'2026-10-05 14:02:00.000','2026-10-05 14:02:00.000','2026-10-05 14:30:00.000','2026-10-05 14:40:00.000',NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (2,2,1,'Milanesa Napolitana',2,17000,34000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (2,3,'Pendiente','2026-10-05 14:02:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (2,5,'En Preparación','2026-10-05 14:25:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (2,5,'Listo','2026-10-05 14:30:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (2,3,'Entregado','2026-10-05 14:35:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (2,4,'Cobrado','2026-10-05 15:02:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (2,2,-2,'Pedido de demostración',3,'2026-10-05 14:02:00.000');
UPDATE productos SET stock=stock-2 WHERE id=2;
INSERT INTO pagos_pedido (id,pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio,fecha_pago) VALUES (2,2,4,'Transferencia',34000,34000,0,'2026-10-05 15:02:00.000');
UPDATE pedidos SET estado='Cobrado',estado_caja='Cobrado',metodo_pago='Transferencia',fecha_cobrado='2026-10-05 15:02:00.000' WHERE id=2;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (3,'DEMO-202610-0003',3,3,3,'Mozo Uno','Pendiente','Pendiente',11000,0,0,'',11000,'2026-10-06 14:03:00.000','2026-10-06 14:03:00.000',NULL,NULL,NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (3,3,1,'Sandwich de Milanesa',1,11000,11000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (3,3,'Pendiente','2026-10-06 14:03:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (3,3,-1,'Pedido de demostración',3,'2026-10-06 14:03:00.000');
UPDATE productos SET stock=stock-1 WHERE id=3;
UPDATE mesas SET estado='Ocupada' WHERE id=3;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (4,'DEMO-202610-0004',4,3,4,'Mozo Uno','En Preparación','En Preparación',11000,0,0,'',11000,'2026-10-06 14:04:00.000','2026-10-06 14:04:00.000',NULL,NULL,NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (4,4,1,'Ñoquis con Bolognesa (Sin TACC)',1,11000,11000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (4,3,'Pendiente','2026-10-06 14:04:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (4,5,'En Preparación','2026-10-06 14:25:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (4,4,-1,'Pedido de demostración',3,'2026-10-06 14:04:00.000');
UPDATE productos SET stock=stock-1 WHERE id=4;
UPDATE mesas SET estado='Ocupada' WHERE id=4;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (5,'DEMO-202610-0005',5,3,5,'Mozo Uno','Listo','Listo',12000,0,0,'',12000,'2026-10-06 14:05:00.000','2026-10-06 14:05:00.000','2026-10-06 14:30:00.000',NULL,NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (5,5,1,'Pizza Muzzarella',1,12000,12000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (5,3,'Pendiente','2026-10-06 14:05:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (5,5,'En Preparación','2026-10-06 14:25:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (5,5,'Listo','2026-10-06 14:30:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (5,5,-1,'Pedido de demostración',3,'2026-10-06 14:05:00.000');
UPDATE productos SET stock=stock-1 WHERE id=5;
UPDATE mesas SET estado='Ocupada' WHERE id=5;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (6,'DEMO-202610-0006',6,3,6,'Mozo Uno','Entregado','Listo',10000,0,0,'',10000,'2026-10-06 14:06:00.000','2026-10-06 14:06:00.000','2026-10-06 14:30:00.000','2026-10-06 14:40:00.000',NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (6,6,1,'Flan con Dulce de Leche',2,5000,10000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (6,3,'Pendiente','2026-10-06 14:06:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (6,5,'En Preparación','2026-10-06 14:25:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (6,5,'Listo','2026-10-06 14:30:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (6,3,'Entregado','2026-10-06 14:35:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (6,6,-2,'Pedido de demostración',3,'2026-10-06 14:06:00.000');
UPDATE productos SET stock=stock-2 WHERE id=6;
UPDATE mesas SET estado='Ocupada' WHERE id=6;
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (7,'DEMO-202610-0007',7,3,7,'Mozo Uno','Pendiente','Pendiente',6000,0,0,'',6000,'2026-10-06 14:07:00.000','2026-10-06 14:07:00.000',NULL,NULL,'Cliente canceló la prueba',3,'2026-10-06 15:07:00.000');
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (7,7,1,'Helado (3 bochas)',1,6000,6000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (7,3,'Pendiente','2026-10-06 14:07:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (7,3,'Cancelado','2026-10-06 15:07:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (7,7,-1,'Pedido de demostración',3,'2026-10-06 14:07:00.000');
UPDATE pedidos SET estado='Cancelado' WHERE id=7;
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (7,7,1,'Restitución por cancelación',3,'2026-10-06 15:07:00.000');
INSERT INTO pedidos (id,numero_pedido,mesa_id,mozo_id,numero_mesa_historico,nombre_mozo_historico,estado,estado_cocina,subtotal,descuento_porcentaje,descuento_monto,descuento_motivo,total,fecha_creacion,created_at,fecha_listo,fecha_servido,cancelado_motivo,cancelado_por_id,cancelado_fecha) VALUES (8,'DEMO-202610-0008',8,3,8,'Mozo Uno','Entregado','Listo',5000,10,500.00,'Descuento por pago en efectivo',4500.00,'2026-10-06 14:08:00.000','2026-10-06 14:08:00.000','2026-10-06 14:30:00.000','2026-10-06 14:40:00.000',NULL,NULL,NULL);
INSERT INTO detalle_pedido (pedido_id,producto_id,orden,nombre_historico,cantidad,precio_unitario,subtotal,observaciones) VALUES (8,8,1,'Coca Cola 500ml',1,5000,5000,'Datos de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (8,3,'Pendiente','2026-10-06 14:08:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (8,5,'En Preparación','2026-10-06 14:25:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (8,5,'Listo','2026-10-06 14:30:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (8,3,'Entregado','2026-10-06 14:35:00.000','Escenario de demostración');
INSERT INTO historial_estados_pedido (pedido_id,usuario_id,estado,fecha,observacion) VALUES (8,4,'Cobrado','2026-10-06 15:08:00.000','Escenario de demostración');
INSERT INTO movimientos_stock (producto_id,pedido_id,cantidad,motivo,registrado_por_id,fecha) VALUES (8,8,-1,'Pedido de demostración',3,'2026-10-06 14:08:00.000');
UPDATE productos SET stock=stock-1 WHERE id=8;
INSERT INTO pagos_pedido (id,pedido_id,cajero_id,metodo_pago,monto_aplicado,monto_recibido,cambio,fecha_pago) VALUES (8,8,4,'Efectivo',4500.00,5000,500.00,'2026-10-06 15:08:00.000');
UPDATE pedidos SET estado='Cobrado',estado_caja='Cobrado',metodo_pago='Efectivo',fecha_cobrado='2026-10-06 15:08:00.000' WHERE id=8;
INSERT INTO cierres_caja (id,numero_cierre,realizado_por_id,fecha_cierre,turno,hora_inicio,hora_fin,monto_inicial,efectivo_esperado,efectivo_contado,diferencia,estado,observaciones,observaciones_revision) VALUES (1,1,4,'2026-10-05 23:00:00','Completo','2026-10-05 12:00:00','2026-10-05 23:00:00',20000,27200.00,27200.00,0,'Abierto','Cierre de demostración conciliado','');
INSERT INTO cierre_pagos (cierre_id,pago_id) VALUES (1,1);
INSERT INTO cierre_pagos (cierre_id,pago_id) VALUES (1,2);
INSERT INTO movimientos_caja (cierre_id,tipo,concepto,monto,fecha) VALUES (1,'Gasto','Insumos de demostración',1000,'2026-10-05 20:00:00');
INSERT INTO movimientos_caja (cierre_id,tipo,concepto,monto,fecha) VALUES (1,'Ingreso','Aporte de demostración',1000,'2026-10-05 20:30:00');
INSERT INTO desglose_caja (cierre_id,denominacion,cantidad) VALUES (1,20000,1);
INSERT INTO desglose_caja (cierre_id,denominacion,cantidad) VALUES (1,2000,3);
INSERT INTO desglose_caja (cierre_id,denominacion,cantidad) VALUES (1,1000,1);
INSERT INTO desglose_caja (cierre_id,denominacion,cantidad) VALUES (1,200,1);
UPDATE cierres_caja SET total_ventas=41200.00,total_descuentos=800.00,total_gastos=1000,total_ingresos_adicionales=1000,estado='Cerrado' WHERE id=1;
INSERT INTO proveedores (id,nombre,cuit,email) VALUES (1,'Proveedor Demo','DEMO-PROVEEDOR','proveedor@restobar.example');
INSERT INTO compras (id,numero_compra,proveedor_id,proveedor_nombre_historico,registrado_por_id,fecha_compra,estado,subtotal,iva_porcentaje,iva_monto,total,metodo_pago,numero_factura,observaciones) VALUES (1,1,1,'Proveedor Demo',1,'2026-10-06 12:00:00','Pendiente',20000,21,4200,24200,'Cuenta Corriente','DEMO-0001','Una caja contiene 24 unidades; recepción aún pendiente');
INSERT INTO detalle_compra (id,compra_id,producto_id,nombre_historico,cantidad,unidad_medida,factor_stock,precio_unitario,subtotal,cantidad_recibida) VALUES (1,1,1,'Cerveza Quilmes 1L - caja de 24',1,'Caja',24,20000,20000,0);
INSERT INTO reservas (id,mesa_id,cliente,email,telefono,fecha,hora,comensales,estado,confirmed_at,comentarios) VALUES (1,7,'Cliente Demo','cliente@restobar.example','3810000000','2026-10-07','20:00:00',2,'Confirmada','2026-10-06 12:00:00','Reserva futura de demostración');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (1,2,700000,'Gerente','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (2,3,700000,'Mozo','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (3,4,700000,'Cajero','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (4,5,700000,'EncargadoCocina','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (5,6,700000,'Mozo','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (6,7,700000,'Mozo','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (7,8,700000,'Mozo','2026-10-01 12:00:00');
INSERT INTO empleados (id,usuario_id,salario_mensual,cargo,fecha_contratacion) VALUES (8,9,700000,'EncargadoCocina','2026-10-01 12:00:00');
INSERT INTO asistencias (empleado_id,fecha,hora_entrada,hora_salida,presente) VALUES (2,'2026-10-05','09:00:00','17:00:00',TRUE);
INSERT INTO inasistencias (empleado_id,fecha,motivo) VALUES (2,'2026-10-04','Ausencia de prueba');
INSERT INTO pagos_empleado (empleado_id,mes,anio,monto,fecha_pago,metodo_pago) VALUES (2,9,2026,700000,'2026-10-01 12:00:00','Transferencia');
INSERT INTO mensajes (remitente_id,destinatario_id,texto,created_at) VALUES (3,5,'Pedido de prueba enviado a cocina.','2026-10-06 14:01:00');
INSERT INTO mensajes (remitente_id,destinatario_id,texto,created_at) VALUES (5,3,'Pedido de prueba listo para servir.','2026-10-06 14:30:00');
INSERT INTO secuencias (nombre,valor) VALUES ('compra',1);
INSERT INTO secuencias (nombre,valor) VALUES ('cierre',1);
COMMIT;
-- Debe devolver CERO filas:
SELECT * FROM v_incidencias_integridad;

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

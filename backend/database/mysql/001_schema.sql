-- La Vieja Estación - RestoBar: esquema relacional, MySQL >= 8.0.16.
-- No elimina ni importa datos de MongoDB. Ejecutar una sola vez en una base nueva.
CREATE DATABASE IF NOT EXISTS la_vieja_estacion CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE la_vieja_estacion;
-- Operaciones almacenadas en UTC; las vistas de presentación muestran UTC-03:00.
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

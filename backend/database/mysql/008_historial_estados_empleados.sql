-- Historial independiente de usuarios para conservarlo tras una eliminación.
CREATE TABLE IF NOT EXISTS historial_estados_empleados (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 usuario_id INT UNSIGNED NOT NULL,
 fecha DATETIME(3) NOT NULL,
 nombre VARCHAR(100) NOT NULL,
 apellido VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL,
 cargo VARCHAR(100) NOT NULL,
 activo BOOLEAN NOT NULL,
 existente BOOLEAN NOT NULL,
 INDEX historial_empleado_fecha (usuario_id, fecha, id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_empleados_inicio (
 id TINYINT UNSIGNED PRIMARY KEY,
 fecha DATETIME(3) NOT NULL,
 CHECK (id = 1)
) ENGINE=InnoDB;

DELIMITER $$
CREATE TRIGGER historial_usuario_insert AFTER INSERT ON usuarios FOR EACH ROW
BEGIN
 INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
 SELECT NEW.id, UTC_TIMESTAMP(3), NEW.nombre, NEW.apellido, NEW.email, r.nombre, NEW.activo, TRUE
 FROM roles r WHERE r.id = NEW.rol_id;
END$$

CREATE TRIGGER historial_usuario_update AFTER UPDATE ON usuarios FOR EACH ROW
BEGIN
 IF NOT (OLD.activo <=> NEW.activo) OR NOT (OLD.nombre <=> NEW.nombre)
    OR NOT (OLD.apellido <=> NEW.apellido) OR NOT (OLD.email <=> NEW.email)
    OR NOT (OLD.rol_id <=> NEW.rol_id) THEN
  INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
  SELECT NEW.id, UTC_TIMESTAMP(3), NEW.nombre, NEW.apellido, NEW.email,
   COALESCE(e.cargo, r.nombre), NEW.activo AND COALESCE(e.activo, TRUE), TRUE
  FROM roles r LEFT JOIN empleados e ON e.usuario_id = NEW.id WHERE r.id = NEW.rol_id;
 END IF;
END$$

CREATE TRIGGER historial_usuario_delete AFTER DELETE ON usuarios FOR EACH ROW
BEGIN
 INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
 SELECT OLD.id, UTC_TIMESTAMP(3), OLD.nombre, OLD.apellido, OLD.email, r.nombre, OLD.activo, FALSE
 FROM roles r WHERE r.id = OLD.rol_id;
END$$

CREATE TRIGGER historial_empleado_insert AFTER INSERT ON empleados FOR EACH ROW
BEGIN
 INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
 SELECT u.id, UTC_TIMESTAMP(3), u.nombre, u.apellido, u.email, NEW.cargo, u.activo AND NEW.activo, TRUE
 FROM usuarios u WHERE u.id = NEW.usuario_id;
END$$

CREATE TRIGGER historial_empleado_update AFTER UPDATE ON empleados FOR EACH ROW
BEGIN
 IF NOT (OLD.activo <=> NEW.activo) OR NOT (OLD.cargo <=> NEW.cargo) THEN
  INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
  SELECT u.id, UTC_TIMESTAMP(3), u.nombre, u.apellido, u.email, NEW.cargo, u.activo AND NEW.activo, TRUE
  FROM usuarios u WHERE u.id = NEW.usuario_id;
 END IF;
END$$

CREATE TRIGGER historial_empleado_delete AFTER DELETE ON empleados FOR EACH ROW
BEGIN
 INSERT INTO historial_estados_empleados (usuario_id, fecha, nombre, apellido, email, cargo, activo, existente)
 SELECT u.id, UTC_TIMESTAMP(3), u.nombre, u.apellido, u.email, r.nombre, u.activo, TRUE
 FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = OLD.usuario_id;
END$$
DELIMITER ;

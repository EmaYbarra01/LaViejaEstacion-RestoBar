-- Incremental: conserva las tablas y datos existentes.
USE la_vieja_estacion;
SET time_zone='+00:00';
-- Reutiliza empleados, asistencias, inasistencias, pagos_empleado,
-- mensajes, recuperaciones_password, ventas y detalle_venta del esquema inicial.
SET @ddl=IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='mensajes' AND column_name='remitente_rol')=0,'ALTER TABLE mensajes ADD COLUMN remitente_rol VARCHAR(40) NULL','SELECT 1');
PREPARE migracion_stmt FROM @ddl;
EXECUTE migracion_stmt;
DEALLOCATE PREPARE migracion_stmt;
SET @ddl=IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='mensajes' AND column_name='destinatario_rol')=0,'ALTER TABLE mensajes ADD COLUMN destinatario_rol VARCHAR(40) NULL','SELECT 1');
PREPARE migracion_stmt FROM @ddl;
EXECUTE migracion_stmt;
DEALLOCATE PREPARE migracion_stmt;
SET @ddl=IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='detalle_venta' AND column_name='nombre_historico')=0,'ALTER TABLE detalle_venta ADD COLUMN nombre_historico VARCHAR(200) NOT NULL DEFAULT ''''','SELECT 1');
PREPARE migracion_stmt FROM @ddl;
EXECUTE migracion_stmt;
DEALLOCATE PREPARE migracion_stmt;
ALTER TABLE mensajes MODIFY texto VARCHAR(5000) NOT NULL;
UPDATE mensajes m JOIN usuarios a ON a.id=m.remitente_id JOIN roles ra ON ra.id=a.rol_id JOIN usuarios b ON b.id=m.destinatario_id JOIN roles rb ON rb.id=b.rol_id SET m.remitente_rol=COALESCE(m.remitente_rol,ra.nombre),m.destinatario_rol=COALESCE(m.destinatario_rol,rb.nombre) WHERE m.remitente_rol IS NULL OR m.destinatario_rol IS NULL;
UPDATE detalle_venta d JOIN productos p ON p.id=d.producto_id SET d.nombre_historico=p.nombre WHERE d.nombre_historico='';
CREATE TABLE IF NOT EXISTS migracion_mongo_ids (
 entidad VARCHAR(50) NOT NULL,
 mongo_id VARCHAR(100) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 mysql_id INT UNSIGNED NOT NULL,
 huella CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 PRIMARY KEY(entidad,mongo_id)
) ENGINE=InnoDB;
CREATE OR REPLACE VIEW v_incidencias_modulos AS
SELECT 'ASISTENCIA_CONTRADICTORIA' tipo, a.id referencia
FROM asistencias a JOIN inasistencias i ON i.empleado_id=a.empleado_id AND i.fecha=a.fecha
UNION ALL
SELECT 'VENTA_TOTAL_NO_CONCILIA',v.id
FROM ventas v LEFT JOIN (SELECT venta_id,SUM(ROUND(cantidad*precio_unitario,2)) total FROM detalle_venta GROUP BY venta_id) d ON d.venta_id=v.id
WHERE v.total<>COALESCE(d.total,0);

import test from 'node:test';
import assert from 'node:assert/strict';
import { statements } from '../../scripts/mysql/sqlFile.js';

test('preserva texto y cuerpos de triggers al separar un script de Workbench', () => {
  const sql = `-- comentario con ;
    INSERT INTO t VALUES ('O''Brien; -- texto', 'linea\\\'dos');
DELIMITER $$
CREATE TRIGGER ejemplo BEFORE INSERT ON t FOR EACH ROW
BEGIN
 SET NEW.a = 'valor;$$texto';
 SET NEW.b = 2;
END$$
DELIMITER ;
SELECT 1;`;
  const parts=statements(sql);
  assert.equal(parts.length,3);
  assert.match(parts[0],/O''Brien; -- texto/);
  assert.match(parts[1],/SET NEW.b = 2;/);
  assert.equal(parts[2],'SELECT 1');
});

test('rechaza archivos SQL incompletos antes de ejecutar', () => {
  assert.throws(()=>statements("SELECT 'sin cerrar;"));
  assert.throws(()=>statements('SELECT 1'));
});

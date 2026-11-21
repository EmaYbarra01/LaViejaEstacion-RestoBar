import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatReportValue, reportRows } from './reportData.js';

test('los reportes extraen las filas y conservan valores cero', () => {
  assert.deepEqual(reportRows({ productos: [{ id: 1, nombre: 'Agua', stock: 0 }] }), [
    { nombre: 'Agua', stock: '0' }
  ]);
  assert.deepEqual(reportRows({ data: [] }), []);
  assert.equal(formatReportValue(null), 'Sin datos');
  assert.equal(formatReportValue({ numero: 1 }), '{"numero":1}');
  assert.throws(() => reportRows(null), /formato inválido/);
});

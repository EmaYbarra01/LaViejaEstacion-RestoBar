export function reportRows(response) {
  const value = response?.data ?? response;
  const rows = Array.isArray(value) ? value : value?.pedidos ?? value?.productos ?? value?.cierres;
  if (Array.isArray(rows)) {
    return rows.map(row => Object.fromEntries(
      Object.entries(row).filter(([key]) => key !== '_id' && key !== 'id')
        .map(([key, cell]) => [key, formatReportValue(cell)])
    ));
  }
  if (value && typeof value === 'object') {
    return [Object.fromEntries(Object.entries(value).map(([key, cell]) => [key, formatReportValue(cell)]))];
  }
  throw new Error('La respuesta del reporte tiene un formato inválido');
}

export function formatReportValue(value) {
  if (value === null || value === undefined) return 'Sin datos';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

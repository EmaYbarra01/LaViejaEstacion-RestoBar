import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import { reportRows } from './reportData';
import './VentasReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function VentasReports({ selectedSubType }) {
  const [reportType, setReportType] = useState(selectedSubType || 'ventas-diarias');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (selectedSubType) {
      setReportType(selectedSubType);
    }
  }, [selectedSubType]);

  useEffect(() => {
    setData(null);
    setError(null);
  }, [reportType]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('fechaInicio', dateRange.startDate);
      params.append('fechaFin', dateRange.endDate);

      let endpoint = '/reportes/ventas/diarias';
      
      if (reportType === 'ventas-diarias') endpoint = '/reportes/ventas/diarias';
      else if (reportType === 'ventas-semanales') endpoint = '/reportes/ventas';
      else if (reportType === 'ventas-mensuales') endpoint = '/reportes/ventas/mensual';
      else if (reportType === 'ventas-por-producto') endpoint = '/reportes/ventas/producto';
      else if (reportType === 'ventas-por-categoria') endpoint = '/reportes/ventas/categoria';
      else if (reportType === 'comparativa') endpoint = '/reportes/ventas/fecha';
      else if (reportType === 'ingresos-totales') endpoint = '/reportes/ventas';
      else if (reportType === 'metodos-pago') endpoint = '/reportes/ventas/metodo-pago';

      const response = await apiClient.get(`${API_URL}${endpoint}?${params}`, {
        withCredentials: true
      });

      setData(reportRows(response.data));
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setData(null);
      setError(err.response?.data?.mensaje || 'No se pudo generar el reporte de ventas');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      'ventas-diarias': 'Ventas Diarias',
      'ventas-semanales': 'Ventas Semanales',
      'ventas-mensuales': 'Ventas Mensuales',
      'ventas-por-producto': 'Ventas por Producto',
      'ventas-por-categoria': 'Ventas por Categoría',
      'comparativa': 'Comparativa Período a Período',
      'ingresos-totales': 'Ingresos Totales'
    };
    return titles[reportType] || 'Reporte de Ventas';
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reportes de Ventas</h2>
        <p>{getReportTitle()}</p>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Tipo de Reporte</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="ventas-diarias">Ventas Diarias</option>
            <option value="ventas-semanales">Ventas Semanales</option>
            <option value="ventas-mensuales">Ventas Mensuales</option>
            <option value="ventas-por-producto">Por Producto</option>
            <option value="ventas-por-categoria">Por Categoría</option>
            <option value="comparativa">Comparativa Período a Período</option>
            <option value="ingresos-totales">Ingresos Totales</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Desde</label>
          <input 
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input 
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>

        <button 
          className="btn-generate-report"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {error && <div className="report-error">{error}</div>}

      {data && (
        <div className="report-content">
          <div className="report-actions">
            <ReportePDF 
              data={data} 
              title={`Reporte de ${getReportTitle()}`}
              reportType={getReportTitle()}
            />
          </div>

          <div className="report-data">
            <div className="report-table">
              <h3>{getReportTitle()}</h3>
              {data && data.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      {Object.keys(data[0] || {}).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx}>{value !== null ? String(value) : 'N/A'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="report-loading">No hay datos disponibles para mostrar</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div className="report-loading">
          <p>Selecciona los filtros y haz clic en "Generar Reporte" para ver los datos</p>
        </div>
      )}
    </div>
  );
}

export default VentasReports;

import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import { reportRows } from './reportData';
import './CocinaReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function CocinaReports({ selectedSubType }) {
  const [reportType, setReportType] = useState(selectedSubType || 'tiempo-preparacion');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
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

      let endpoint = '/reportes/cocina/tiempos';
      
      if (reportType === 'tiempo-preparacion') {
        endpoint = '/reportes/cocina/tiempos';
      } else if (reportType === 'platos-solicitados') {
        endpoint = '/reportes/productos/mas-vendidos';
      }

      const response = await apiClient.get(`${API_URL}${endpoint}?${params}`, {
        withCredentials: true
      });

      setData(reportRows(response.data));
    } catch (err) {
      console.error('Error:', err);
      setData(null);
      setError(err.response?.data?.mensaje || 'No se pudo generar el reporte de cocina');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      'tiempo-preparacion': 'Tiempo de Preparación por Plato',
      'platos-solicitados': 'Platos Más Solicitados'
    };
    return titles[reportType] || 'Reporte de Cocina';
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reportes de Cocina</h2>
        <p>{getReportTitle()}</p>
        {reportType === 'tiempo-preparacion' && <p>Tiempo promedio del pedido completo que contiene cada plato; no se registran tiempos individuales por plato.</p>}
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Tipo de Reporte</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="tiempo-preparacion">Tiempo de Preparación por Plato</option>
            <option value="platos-solicitados">Platos Más Solicitados</option>
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
              description={reportType === 'tiempo-preparacion' ? 'Tiempo promedio del pedido completo que contiene cada plato; no se registran tiempos individuales por plato.' : undefined}
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

export default CocinaReports;

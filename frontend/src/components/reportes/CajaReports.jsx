import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import { reportRows } from './reportData';
import './CajaReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function CajaReports({ selectedSubType }) {
  const [reportType, setReportType] = useState(selectedSubType || 'movimientos');
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

      let endpoint = '/reportes/cierres-caja';
      
      if (reportType === 'movimientos') {
        endpoint = '/reportes/cierres-caja';
      } else if (reportType === 'arqueo') {
        endpoint = '/reportes/cierres-caja';
      } else if (reportType === 'metodos-pago') {
        endpoint = '/reportes/ventas/metodo-pago';
      }

      const response = await apiClient.get(`${API_URL}${endpoint}?${params}`, {
        withCredentials: true
      });

      setData(reportRows(response.data));
    } catch (err) {
      console.error('Error:', err);
      setData(null);
      setError(err.response?.data?.mensaje || 'No se pudo generar el reporte de caja');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      'movimientos': 'Movimientos de Caja (Aperturas/Cierres)',
      'arqueo': 'Arqueo de Caja',
      'metodos-pago': 'Métodos de Pago'
    };
    return titles[reportType] || 'Reporte de Caja';
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reportes de Caja</h2>
        <p>{getReportTitle()}</p>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Tipo de Reporte</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="movimientos">Movimientos de Caja (Aperturas/Cierres)</option>
            <option value="arqueo">Arqueo de Caja</option>
            <option value="metodos-pago">Métodos de Pago</option>
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
                        {Object.entries(row).map(([key, value]) => (
                          <td key={key}>
                            {key.toLowerCase().includes('estado') ? (
                              <span className={`badge badge-${String(value).toLowerCase().replace(/\s+/g, '-')}`}>
                                {value}
                              </span>
                            ) : (
                              String(value) || 'N/A'
                            )}
                          </td>
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

export default CajaReports;

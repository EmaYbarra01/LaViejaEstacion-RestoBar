import { useState } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import { reportRows } from './reportData';
import './EmpleadosReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function EmpleadosReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('fechaInicio', dateRange.startDate);
      params.append('fechaFin', dateRange.endDate);

      const response = await apiClient.get(`${API_URL}/reportes/empleados?${params}`, {
        withCredentials: true
      });

      setData(reportRows(response.data));
    } catch (err) {
      console.error('Error:', err);
      setData(null);
      setError(err.response?.data?.mensaje || 'No se pudo generar el reporte de empleados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reportes de Empleados</h2>
        <p>Asistencias e Inasistencias</p>
        <p>Los empleados sin registros en el período se muestran como "Sin registros"; esto no implica una inasistencia.</p>
      </div>

      <div className="report-filters">
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
              title="Reporte de Empleados"
              reportType="Asistencias e Inasistencias"
              description="Sin registros indica que no hay asistencias ni inasistencias registradas en el período; no implica una inasistencia."
            />
          </div>

          <div className="report-data">
            <div className="report-table">
              <h3>Asistencias e Inasistencias</h3>
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
                          <td key={cellIdx}>
                            {value !== null ? String(value) : 'N/A'}
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
          <p>Selecciona el rango de fechas y haz clic en "Generar Reporte" para ver los datos</p>
        </div>
      )}
    </div>
  );
}

export default EmpleadosReports;

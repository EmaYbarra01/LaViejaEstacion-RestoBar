import { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ReportePDF from './ReportePDF';
import { reportRows } from './reportData';
import './ProductosReports.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function ProductosReports({ selectedSubType }) {
  const [reportType, setReportType] = useState(selectedSubType || 'inventario');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      let endpoint = '/reportes/inventario';
      
      if (reportType === 'inventario') {
        endpoint = '/reportes/inventario';
      } else if (reportType === 'mas-vendidos') {
        endpoint = '/reportes/productos/mas-vendidos';
      } else if (reportType === 'menos-vendidos') {
        endpoint = '/reportes/productos/mas-vendidos?orderBy=asc';
      }

      const response = await apiClient.get(`${API_URL}${endpoint}`, {
        withCredentials: true
      });

      setData(reportRows(response.data));
    } catch (err) {
      console.error('Error:', err);
      setData(null);
      setError(err.response?.data?.mensaje || 'No se pudo generar el reporte de productos');
    } finally {
      setLoading(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      'inventario': 'Inventario de Productos',
      'mas-vendidos': 'Productos Más Vendidos',
      'menos-vendidos': 'Productos Menos Vendidos'
    };
    return titles[reportType] || 'Reporte de Productos';
  };

  return (
    <div className="report-container">
      <div className="report-header">
        <h2>Reportes de Productos</h2>
        <p>{getReportTitle()}</p>
      </div>

      <div className="report-filters">
        <div className="filter-group">
          <label>Tipo de Reporte</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="inventario">Inventario</option>
            <option value="mas-vendidos">Productos Más Vendidos</option>
            <option value="menos-vendidos">Productos Menos Vendidos</option>
          </select>
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
                            {key.toLowerCase().includes('stock') && reportType === 'inventario' ? (
                              <span className={`badge ${value < 10 ? 'badge-danger' : 'badge-success'}`}>
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
          <p>Haz clic en "Generar Reporte" para ver los datos</p>
        </div>
      )}
    </div>
  );
}

export default ProductosReports;

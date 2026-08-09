import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatCurrency } from '../utils/currencyFormatter';
import './HistorialCierres.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const HistorialCierres = () => {
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    turno: '',
    estado: ''
  });
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    cargarCierres();
  }, []);

  const cargarCierres = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
      if (filtros.turno) params.append('turno', filtros.turno);
      if (filtros.estado) params.append('estado', filtros.estado);

      const response = await axios.get(
        `${API_URL}/cierres-caja/reporte?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCierres(response.data.cierres || []);
      setResumen(response.data.resumen || null);
    } catch (error) {
      console.error('Error al cargar cierres:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cierres de caja'
      });
    } finally {
      setLoading(false);
    }
  };

  const verDetalleCierre = async (cierreId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/cierres-caja/${cierreId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cierre = response.data;
      mostrarDetalleCierre(cierre);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el detalle del cierre'
      });
    }
  };

  const mostrarDetalleCierre = (cierre) => {
    const html = `
      <div style="text-align: left; font-family: 'Segoe UI', sans-serif; max-height: 70vh; overflow-y: auto;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 1.5rem; margin: -1.25rem -1.25rem 1.5rem; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 1.75rem;">Cierre #${cierre.numeroCierre}</h2>
          <p style="margin: 0.5rem 0 0; opacity: 0.9;">${new Date(cierre.fechaCierre).toLocaleString('es-AR')}</p>
        </div>
        
        <div style="background: #f9fafb; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.25rem;">
          <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem;">📋 Información General</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><strong>Turno:</strong> ${cierre.turno}</div>
            <div><strong>Estado:</strong> <span style="padding: 0.25rem 0.75rem; background: ${cierre.estado === 'Cerrado' ? '#d1fae5' : '#dbeafe'}; color: ${cierre.estado === 'Cerrado' ? '#059669' : '#1e40af'}; border-radius: 12px; font-size: 0.875rem;">${cierre.estado}</span></div>
            <div><strong>Realizado por:</strong> ${cierre.realizadoPor.nombre} ${cierre.realizadoPor.apellido}</div>
            <div><strong>Hora inicio:</strong> ${new Date(cierre.horaInicio).toLocaleTimeString('es-AR')}</div>
            <div><strong>Hora fin:</strong> ${new Date(cierre.horaFin).toLocaleTimeString('es-AR')}</div>
          </div>
        </div>

        <div style="background: #fff7ed; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.25rem; border: 2px solid #ffc107;">
          <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem;">💰 Resumen de Ventas</h3>
          <div style="display: grid; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Pedidos Cobrados:</span>
              <strong>${cierre.pedidos.length}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Ventas en Efectivo:</span>
              <strong style="color: #10b981;">${formatCurrency(cierre.ventasPorMetodo.efectivo.total)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Ventas en Transferencia:</span>
              <strong style="color: #3b82f6;">${formatCurrency(cierre.ventasPorMetodo.transferencia.total)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #ffc107; border-radius: 6px; font-size: 1.125rem;">
              <span style="color: white; font-weight: 600;">TOTAL VENTAS:</span>
              <strong style="color: white;">${formatCurrency(cierre.totalVentas)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Descuentos Aplicados:</span>
              <strong style="color: #10b981;">${formatCurrency(cierre.totalDescuentos)}</strong>
            </div>
          </div>
        </div>

        <div style="background: ${cierre.diferencia === 0 ? '#d1fae5' : cierre.diferencia > 0 ? '#dbeafe' : '#fee2e2'}; padding: 1.25rem; border-radius: 8px; border: 2px solid ${cierre.diferencia === 0 ? '#10b981' : cierre.diferencia > 0 ? '#3b82f6' : '#ef4444'};">
          <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem;">💵 Efectivo en Caja</h3>
          <div style="display: grid; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Monto Inicial:</span>
              <strong>${formatCurrency(cierre.montoInicial)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Efectivo Esperado:</span>
              <strong>${formatCurrency(cierre.efectivoEnCaja)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: white; border-radius: 6px;">
              <span>Efectivo Contado:</span>
              <strong>${formatCurrency(cierre.efectivoContado)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: ${cierre.diferencia === 0 ? '#10b981' : cierre.diferencia > 0 ? '#3b82f6' : '#ef4444'}; border-radius: 6px; font-size: 1.125rem;">
              <span style="color: white; font-weight: 600;">DIFERENCIA:</span>
              <strong style="color: white;">
                ${formatCurrency(Math.abs(cierre.diferencia))}
                ${cierre.diferencia > 0 ? '(SOBRANTE)' : cierre.diferencia < 0 ? '(FALTANTE)' : '(EXACTO)'}
              </strong>
            </div>
          </div>
        </div>

        ${cierre.observaciones ? `
          <div style="background: #f9fafb; padding: 1.25rem; border-radius: 8px; margin-top: 1.25rem; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 0.75rem; color: #1f2937; font-size: 1.125rem;">📝 Observaciones</h3>
            <p style="margin: 0; color: #6b7280;">${cierre.observaciones}</p>
          </div>
        ` : ''}
      </div>
    `;

    Swal.fire({
      html: html,
      width: 700,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: '🖨️ Imprimir',
      cancelButtonText: 'Cerrar',
      customClass: {
        popup: 'detalle-cierre-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        imprimirCierre(cierre);
      }
    });
  };

  const imprimirCierre = (cierre) => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cierre de Caja #${cierre.numeroCierre}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          }
          h2, h3 { text-align: center; margin: 10px 0; }
          .divider { border-top: 2px dashed #000; margin: 15px 0; }
          p { margin: 5px 0; }
          .total { font-weight: bold; font-size: 1.1em; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <h2>LA VIEJA ESTACIÓN</h2>
        <h3>COMPROBANTE DE CIERRE DE CAJA</h3>
        <div class="divider"></div>
        
        <p><strong>Cierre N°:</strong> ${cierre.numeroCierre}</p>
        <p><strong>Fecha:</strong> ${new Date(cierre.fechaCierre).toLocaleString('es-AR')}</p>
        <p><strong>Turno:</strong> ${cierre.turno}</p>
        <p><strong>Cajero:</strong> ${cierre.realizadoPor.nombre} ${cierre.realizadoPor.apellido}</p>
        <p><strong>Estado:</strong> ${cierre.estado}</p>
        
        <div class="divider"></div>
        
        <h3>RESUMEN DE VENTAS</h3>
        <p>Pedidos: ${cierre.pedidos.length}</p>
        <p>Efectivo: ${formatCurrency(cierre.ventasPorMetodo.efectivo.total)}</p>
        <p>Transferencia: ${formatCurrency(cierre.ventasPorMetodo.transferencia.total)}</p>
        <p class="total">TOTAL: ${formatCurrency(cierre.totalVentas)}</p>
        <p>Descuentos: ${formatCurrency(cierre.totalDescuentos)}</p>
        
        <div class="divider"></div>
        
        <h3>EFECTIVO</h3>
        <p>Inicial: ${formatCurrency(cierre.montoInicial)}</p>
        <p>Esperado: ${formatCurrency(cierre.efectivoEnCaja)}</p>
        <p>Contado: ${formatCurrency(cierre.efectivoContado)}</p>
        <p class="total">DIFERENCIA: ${formatCurrency(Math.abs(cierre.diferencia))}
        ${cierre.diferencia > 0 ? '(SOBRANTE)' : cierre.diferencia < 0 ? '(FALTANTE)' : '(EXACTO)'}</p>
        
        ${cierre.observaciones ? `
          <div class="divider"></div>
          <h3>OBSERVACIONES</h3>
          <p>${cierre.observaciones}</p>
        ` : ''}
        
        <div class="divider"></div>
        <p style="text-align: center;">Gracias por su dedicación</p>
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const aplicarFiltros = () => {
    cargarCierres();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      turno: '',
      estado: ''
    });
    setTimeout(() => cargarCierres(), 100);
  };

  return (
    <div className="historial-cierres-container">
      <div className="historial-header">
        <h1>📊 Historial de Cierres de Caja</h1>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>Filtros</h3>
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
            />
          </div>
          <div className="filtro-item">
            <label>Turno:</label>
            <select
              value={filtros.turno}
              onChange={(e) => handleFiltroChange('turno', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
              <option value="Completo">Completo</option>
            </select>
          </div>
          <div className="filtro-item">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Cerrado">Cerrado</option>
              <option value="Revisado">Revisado</option>
              <option value="Auditado">Auditado</option>
            </select>
          </div>
        </div>
        <div className="filtros-acciones">
          <button className="btn-aplicar" onClick={aplicarFiltros}>
            🔍 Aplicar Filtros
          </button>
          <button className="btn-limpiar" onClick={limpiarFiltros}>
            ✕ Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="resumen-general">
          <h3>Resumen General</h3>
          <div className="resumen-cards">
            <div className="resumen-card">
              <div className="card-label">Total Cierres</div>
              <div className="card-value">{resumen.cantidadCierres}</div>
            </div>
            <div className="resumen-card ventas">
              <div className="card-label">Total Ventas</div>
              <div className="card-value">${formatCurrency(resumen.totalVentas) || '0,00'}</div>
            </div>
            <div className="resumen-card descuentos">
              <div className="card-label">Total Descuentos</div>
              <div className="card-value">${formatCurrency(resumen.totalDescuentos) || '0,00'}</div>
            </div>
            <div className="resumen-card balance">
              <div className="card-label">Balance General</div>
              <div className="card-value">${formatCurrency(resumen.balanceGeneral) || '0,00'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de cierres */}
      <div className="cierres-lista-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando cierres...</p>
          </div>
        ) : cierres.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron cierres con los filtros aplicados</p>
          </div>
        ) : (
          <div className="cierres-table-wrapper">
            <table className="cierres-table">
              <thead>
                <tr>
                  <th>N° Cierre</th>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Cajero</th>
                  <th>Pedidos</th>
                  <th>Total Ventas</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cierres.map((cierre) => (
                  <tr key={cierre._id}>
                    <td className="cierre-numero">#{cierre.numeroCierre}</td>
                    <td>{new Date(cierre.fechaCierre).toLocaleDateString('es-AR')}</td>
                    <td>{cierre.turno}</td>
                    <td>{cierre.realizadoPor.nombre} {cierre.realizadoPor.apellido}</td>
                    <td className="text-center">{cierre.pedidos.length}</td>
                    <td className="total-ventas">${formatCurrency(cierre.totalVentas)}</td>
                    <td className={`diferencia ${cierre.diferencia === 0 ? 'exacto' : cierre.diferencia > 0 ? 'sobrante' : 'faltante'}`}>
                      ${formatCurrency(Math.abs(cierre.diferencia))}
                      {cierre.diferencia > 0 ? ' ▲' : cierre.diferencia < 0 ? ' ▼' : ' ✓'}
                    </td>
                    <td>
                      <span className={`estado-badge ${cierre.estado.toLowerCase()}`}>
                        {cierre.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-ver-detalle"
                        onClick={() => verDetalleCierre(cierre._id)}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCierres;

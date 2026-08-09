import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatCurrency } from '../../utils/currencyFormatter';
import './CierreCajaModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const fireCierreSwal = (options) => {
  return Swal.fire({
    target: document.body,
    customClass: {
      container: 'swal2-container-cierre-caja',
      ...options.customClass
    },
    ...options
  });
};

const formatDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const CierreCajaModal = ({ isOpen, onClose, onCierreCreado }) => {
  const [turno, setTurno] = useState('Completo');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [montoInicial, setMontoInicial] = useState('');
  const [efectivoContado, setEfectivoContado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  
  // Desglose de billetes
  const [desglose, setDesglose] = useState({
    mil: { cantidad: 0, total: 0 },
    doscientos: { cantidad: 0, total: 0 },
    cien: { cantidad: 0, total: 0 },
    cincuenta: { cantidad: 0, total: 0 }
  });

  useEffect(() => {
    if (isOpen) {
      // Establecer hora de inicio y fin por defecto
      const ahora = new Date();
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0); // Inicio del día
      
      setHoraInicio(formatDateTimeLocal(inicio));
      setHoraFin(formatDateTimeLocal(ahora));
      setMontoInicial('');
      setEfectivoContado('');
      
      cargarPedidosPendientes();
    }
  }, [isOpen]);

  const cargarPedidosPendientes = async () => {
    setLoadingPedidos(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cierres-caja/pedidos-pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPedidosPendientes(response.data || []);
      // Seleccionar todos los pedidos por defecto
      setPedidosSeleccionados(response.data.map(p => p._id));
    } catch (error) {
      console.error('Error al cargar pedidos pendientes:', error);
      fireCierreSwal({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pedidos pendientes'
      });
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleDesgloseChange = (denominacion, cantidad) => {
    const soloDigitos = cantidad.replace(/\D/g, '');
    const valorIngresado = soloDigitos === '' ? '' : soloDigitos.replace(/^0+(?=\d)/, '');
    const cantidadNum = valorIngresado === '' ? 0 : parseInt(valorIngresado, 10) || 0;
    let valor = 0;
    
    switch(denominacion) {
      case 'mil': valor = 1000; break;
      case 'doscientos': valor = 2000; break;
      case 'cien': valor = 10000; break;
      case 'cincuenta': valor = 20000; break;
      default: valor = 0;
    }
    
    const total = cantidadNum * valor;
    
    setDesglose(prev => ({
      ...prev,
      [denominacion]: {
        cantidad: cantidadNum,
        total: total
      }
    }));
  };

  const calcularTotalDesglose = () => {
    return Object.values(desglose).reduce((sum, item) => sum + item.total, 0);
  };

  useEffect(() => {
    const totalDesglose = calcularTotalDesglose();
    if (totalDesglose > 0) {
      setEfectivoContado(totalDesglose.toString());
    }
  }, [desglose]);

  const togglePedido = (pedidoId) => {
    setPedidosSeleccionados(prev => {
      if (prev.includes(pedidoId)) {
        return prev.filter(id => id !== pedidoId);
      } else {
        return [...prev, pedidoId];
      }
    });
  };

  const toggleTodos = () => {
    if (pedidosSeleccionados.length === pedidosPendientes.length) {
      setPedidosSeleccionados([]);
    } else {
      setPedidosSeleccionados(pedidosPendientes.map(p => p._id));
    }
  };

  const calcularResumen = () => {
    const pedidosIncluidos = pedidosPendientes.filter(p => 
      pedidosSeleccionados.includes(p._id)
    );
    
    const totalVentas = pedidosIncluidos.reduce((sum, p) => sum + p.total, 0);
    const totalDescuentos = pedidosIncluidos.reduce((sum, p) => 
      sum + (p.descuento?.monto || 0), 0
    );
    
    const ventasEfectivo = pedidosIncluidos
      .filter(p => p.metodoPago === 'Efectivo')
      .reduce((sum, p) => sum + p.total, 0);
    
    const ventasTransferencia = pedidosIncluidos
      .filter(p => p.metodoPago === 'Transferencia')
      .reduce((sum, p) => sum + p.total, 0);
    
    const montoInicialNum = parseFloat(montoInicial) || 0;
    const efectivoContadoNum = parseFloat(efectivoContado) || 0;
    const efectivoEsperado = montoInicialNum + ventasEfectivo;
    const diferencia = efectivoContadoNum - efectivoEsperado;
    
    return {
      cantidadPedidos: pedidosIncluidos.length,
      totalVentas,
      totalDescuentos,
      ventasEfectivo,
      ventasTransferencia,
      efectivoEsperado,
      diferencia
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!horaInicio || !horaFin) {
      fireCierreSwal({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debe especificar hora de inicio y fin del turno'
      });
      return;
    }
    
    if (pedidosSeleccionados.length === 0) {
      const confirmacion = await fireCierreSwal({
        icon: 'question',
        title: '¿Continuar sin pedidos?',
        text: 'No ha seleccionado ningún pedido para incluir en el cierre',
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      });
      
      if (!confirmacion.isConfirmed) return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const dataCierre = {
        turno,
        horaInicio,
        horaFin,
        montoInicial: parseFloat(montoInicial) || 0,
        efectivoContado: parseFloat(efectivoContado) || 0,
        desgloseBilletes: desglose,
        observaciones,
        pedidosIds: pedidosSeleccionados
      };
      
      const response = await axios.post(
        `${API_URL}/cierres-caja`,
        dataCierre,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fireCierreSwal({
        icon: 'success',
        title: '¡Cierre creado!',
        text: `Cierre #${response.data.cierre.numeroCierre} registrado exitosamente`,
        showConfirmButton: true,
        confirmButtonText: 'Ver comprobante'
      }).then((result) => {
        if (result.isConfirmed) {
          mostrarComprobante(response.data.cierre);
        }
      });
      
      resetForm();
      onCierreCreado(response.data.cierre);
      onClose();
    } catch (error) {
      console.error('Error al crear cierre:', error);
      const mensaje = error.response?.data?.mensaje || 'No se pudo crear el cierre de caja';
      const detalle = error.response?.data?.detalle;
      fireCierreSwal({
        icon: 'error',
        title: 'Error',
        text: detalle ? `${mensaje}: ${detalle}` : mensaje
      });
    } finally {
      setLoading(false);
    }
  };

  const mostrarComprobante = (cierre) => {
    const html = `
      <div style="text-align: left; font-family: monospace;">
        <h3 style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px;">
          COMPROBANTE DE CIERRE DE CAJA
        </h3>
        <p><strong>Número de Cierre:</strong> #${cierre.numeroCierre}</p>
        <p><strong>Fecha:</strong> ${new Date(cierre.fechaCierre).toLocaleString('es-AR')}</p>
        <p><strong>Turno:</strong> ${cierre.turno}</p>
        <p><strong>Realizado por:</strong> ${cierre.realizadoPor.nombre} ${cierre.realizadoPor.apellido}</p>
        
        <hr style="border-top: 1px dashed #666; margin: 15px 0;">
        
        <h4>RESUMEN DE VENTAS</h4>
        <p><strong>Total de pedidos:</strong> ${cierre.pedidos.length}</p>
        <p><strong>Ventas en Efectivo:</strong> ${formatCurrency(cierre.ventasPorMetodo.efectivo.total)}</p>
        <p><strong>Ventas en Transferencia:</strong> ${formatCurrency(cierre.ventasPorMetodo.transferencia.total)}</p>
        <p><strong>Total de Ventas:</strong> ${formatCurrency(cierre.totalVentas)}</p>
        <p><strong>Total de Descuentos:</strong> ${formatCurrency(cierre.totalDescuentos)}</p>
        
        <hr style="border-top: 1px dashed #666; margin: 15px 0;">
        
        <h4>EFECTIVO EN CAJA</h4>
        <p><strong>Monto Inicial:</strong> ${formatCurrency(cierre.montoInicial)}</p>
        <p><strong>Efectivo Esperado:</strong> ${formatCurrency(cierre.efectivoEnCaja)}</p>
        <p><strong>Efectivo Contado:</strong> ${formatCurrency(cierre.efectivoContado)}</p>
        <p style="color: ${cierre.diferencia === 0 ? 'green' : cierre.diferencia > 0 ? 'blue' : 'red'}; font-weight: bold;">
          <strong>Diferencia:</strong> ${formatCurrency(Math.abs(cierre.diferencia))}
          ${cierre.diferencia > 0 ? '(SOBRANTE)' : cierre.diferencia < 0 ? '(FALTANTE)' : '(EXACTO)'}
        </p>
        
        ${cierre.observaciones ? `
          <hr style="border-top: 1px dashed #666; margin: 15px 0;">
          <h4>OBSERVACIONES</h4>
          <p>${cierre.observaciones}</p>
        ` : ''}
      </div>
    `;
    
    fireCierreSwal({
      title: 'Comprobante de Cierre',
      html: html,
      width: 600,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: '🖨️ Imprimir',
      cancelButtonText: 'Cerrar'
    }).then((result) => {
      if (result.isConfirmed) {
        imprimirComprobante(cierre);
      }
    });
  };

  const imprimirComprobante = (cierre) => {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante Cierre #${cierre.numeroCierre}</title>
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
          .diferencia { font-weight: bold; font-size: 1.2em; }
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
        
        <div class="divider"></div>
        
        <h3>RESUMEN DE VENTAS</h3>
        <p>Pedidos Cobrados: ${cierre.pedidos.length}</p>
        <p>Efectivo: ${formatCurrency(cierre.ventasPorMetodo.efectivo.total)}</p>
        <p>Transferencia: ${formatCurrency(cierre.ventasPorMetodo.transferencia.total)}</p>
        <p class="total">TOTAL VENTAS: ${formatCurrency(cierre.totalVentas)}</p>
        <p>Descuentos: ${formatCurrency(cierre.totalDescuentos)}</p>
        
        <div class="divider"></div>
        
        <h3>EFECTIVO EN CAJA</h3>
        <p>Monto Inicial: ${formatCurrency(cierre.montoInicial)}</p>
        <p>Efectivo Esperado: ${formatCurrency(cierre.efectivoEnCaja)}</p>
        <p>Efectivo Contado: ${formatCurrency(cierre.efectivoContado)}</p>
        <p class="diferencia" style="color: ${cierre.diferencia === 0 ? 'green' : cierre.diferencia > 0 ? 'blue' : 'red'}">
          DIFERENCIA: ${formatCurrency(Math.abs(cierre.diferencia))}
          ${cierre.diferencia > 0 ? '(SOBRANTE)' : cierre.diferencia < 0 ? '(FALTANTE)' : '(EXACTO)'}
        </p>
        
        ${cierre.observaciones ? `
          <div class="divider"></div>
          <h3>OBSERVACIONES</h3>
          <p>${cierre.observaciones}</p>
        ` : ''}
        
        <div class="divider"></div>
        <p style="text-align: center; font-size: 0.9em;">
          Gracias por su dedicación
        </p>
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  const resetForm = () => {
    setTurno('Completo');
    setHoraInicio('');
    setHoraFin('');
    setMontoInicial('');
    setEfectivoContado('');
    setObservaciones('');
    setPedidosSeleccionados([]);
    setDesglose({
      mil: { cantidad: 0, total: 0 },
      doscientos: { cantidad: 0, total: 0 },
      cien: { cantidad: 0, total: 0 },
      cincuenta: { cantidad: 0, total: 0 }
    });
  };

  if (!isOpen) return null;

  const resumen = calcularResumen();

  return (
    <div className="cierre-caja-overlay">
      <div className="cierre-caja-modal">
        <div className="cierre-caja-header">
          <h2>💰 Realizar Cierre de Caja</h2>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="cierre-caja-form">
          <div className="cierre-caja-content">
            {/* Columna Izquierda */}
            <div className="cierre-columna">
              <div className="form-section">
                <h3>Información del Turno</h3>
                
                <div className="form-group">
                  <label>Turno:</label>
                  <select value={turno} onChange={(e) => setTurno(e.target.value)} required>
                    <option value="Completo">Completo</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hora Inicio:</label>
                  <input
                    type="datetime-local"
                    className="cierre-caja-input-time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hora Fin:</label>
                  <input
                    type="datetime-local"
                    className="cierre-caja-input-time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Monto Inicial en Caja:</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Desglose de Efectivo</h3>
                <div className="desglose-grid">
                  {[
                    { key: 'mil', label: '$1000' },
                    { key: 'doscientos', label: '$2000' },
                    { key: 'cien', label: '$10000' },
                    { key: 'cincuenta', label: '$20000' }
                  ].map(({ key, label }) => (
                    <div key={key} className="desglose-item">
                      <label>{label}:</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={desglose[key].cantidad === 0 ? '' : desglose[key].cantidad}
                        onChange={(e) => handleDesgloseChange(key, e.target.value)}
                        placeholder="0"
                      />
                      <span className="desglose-total">${formatCurrency(desglose[key].total)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="total-desglose">
                  <strong>Total Contado:</strong>
                  <span>${calcularTotalDesglose().toFixed(2)} pesos</span>
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows="3"
                  placeholder="Notas adicionales sobre el cierre..."
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="cierre-columna">
              <div className="form-section">
                <div className="pedidos-header">
                  <h3>Pedidos a Incluir</h3>
                  <button
                    type="button"
                    className="btn-toggle-todos"
                    onClick={toggleTodos}
                  >
                    {pedidosSeleccionados.length === pedidosPendientes.length 
                      ? 'Deseleccionar Todos' 
                      : 'Seleccionar Todos'}
                  </button>
                </div>

                {loadingPedidos ? (
                  <div className="loading-pedidos">Cargando pedidos...</div>
                ) : pedidosPendientes.length === 0 ? (
                  <div className="empty-pedidos">
                    No hay pedidos cobrados pendientes de cierre
                  </div>
                ) : (
                  <div className="pedidos-lista-cierre">
                    {pedidosPendientes.map(pedido => (
                      <div
                        key={pedido._id}
                        className={`pedido-item-cierre ${pedidosSeleccionados.includes(pedido._id) ? 'selected' : ''}`}
                        onClick={() => togglePedido(pedido._id)}
                      >
                        <div className="pedido-checkbox">
                          <input
                            type="checkbox"
                            checked={pedidosSeleccionados.includes(pedido._id)}
                            onChange={() => {}}
                          />
                        </div>
                        <div className="pedido-info-cierre">
                          <div className="pedido-numero">#{pedido.numeroPedido}</div>
                          <div className="pedido-detalles">
                            <span>Mesa: {pedido.mesa?.numero || 'N/A'}</span>
                            <span>Mozo: {pedido.mozo?.nombre || 'N/A'}</span>
                          </div>
                          <div className="pedido-pago-info">
                            <span className={`metodo-badge ${pedido.metodoPago?.toLowerCase()}`}>
                              {pedido.metodoPago}
                            </span>
                            <span className="pedido-total">${formatCurrency(pedido.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-section resumen-section">
                <h3>Resumen del Cierre</h3>
                <div className="resumen-grid">
                  <div className="resumen-item">
                    <span>Pedidos seleccionados:</span>
                    <strong>{resumen.cantidadPedidos}</strong>
                  </div>
                  <div className="resumen-item">
                    <span>Ventas en Efectivo:</span>
                    <strong>${formatCurrency(resumen.ventasEfectivo)}</strong>
                  </div>
                  <div className="resumen-item">
                    <span>Ventas en Transferencia:</span>
                    <strong>${formatCurrency(resumen.ventasTransferencia)}</strong>
                  </div>
                  <div className="resumen-item total">
                    <span>Total Ventas:</span>
                    <strong>${formatCurrency(resumen.totalVentas)}</strong>
                  </div>
                  <div className="resumen-item">
                    <span>Descuentos Aplicados:</span>
                    <strong className="descuento">${formatCurrency(resumen.totalDescuentos)}</strong>
                  </div>
                  <div className="resumen-divider"></div>
                  <div className="resumen-item">
                    <span>Efectivo Esperado:</span>
                    <strong>${formatCurrency(resumen.efectivoEsperado)}</strong>
                  </div>
                  <div className="resumen-item">
                    <span>Efectivo Contado:</span>
                    <strong>${formatCurrency(parseFloat(efectivoContado))}</strong>
                  </div>
                  <div className={`resumen-item diferencia ${resumen.diferencia === 0 ? 'exacto' : resumen.diferencia > 0 ? 'sobrante' : 'faltante'}`}>
                    <span>Diferencia:</span>
                    <strong>
                      ${formatCurrency(Math.abs(resumen.diferencia))}
                      {resumen.diferencia > 0 ? ' (Sobrante)' : resumen.diferencia < 0 ? ' (Faltante)' : ' (Exacto)'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cierre-caja-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-realizar-cierre" disabled={loading}>
              {loading ? 'Procesando...' : '✓ Realizar Cierre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CierreCajaModal;

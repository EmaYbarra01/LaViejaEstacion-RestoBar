import EntregaPedido from '../EntregaPedido';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/currencyFormatter';
import './PedidoDetalle.css';

const PedidoDetalleLectura = ({ pedido, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content pedido-detalle" onClick={(event) => event.stopPropagation()}>
      <div className="detalle-header">
        <button className="btn-back" onClick={onClose} aria-label="Cerrar detalle">←</button>
        <div className="detalle-header-titulo">
          <h2>{pedido.tipoPedido === 'Domicilio' ? 'Domicilio' : `Mesa ${pedido.numeroMesa || 'S/N'}`}</h2>
          <div className="detalle-header-meta">
            <span className="detalle-badge">{pedido.estado || 'Pendiente'}</span>
            <span className="detalle-meta-item">👤 {pedido.nombreMozo || pedido.mozo?.nombre || 'Sin mozo'}</span>
            <span className="detalle-meta-item">
              📅 {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleString('es-AR') : 'Sin fecha'}
            </span>
          </div>
        </div>
        <button className="btn-close" onClick={onClose} aria-label="Cerrar detalle">✕</button>
      </div>

      <EntregaPedido pedido={pedido} />
      <div className="resumen-financiero">
        <div className="resumen-item total">
          <span className="label">Total</span>
          <span className="valor">${formatCurrency(pedido.total) || '0,00'}</span>
        </div>
      </div>

      <div className="productos-lista">
        {(pedido.productos || []).map((item, index) => (
          <div className="producto-item producto-item-detalle" key={item.producto?._id || index}>
            <div className="producto-header">
              <h3 className="producto-nombre">{item.nombre || 'Producto'}</h3>
              <span className="producto-precio">
                ${formatCurrency((item.precioUnitario || 0) * (item.cantidad || 0))}
              </span>
            </div>
            <div className="cantidad-controles">
              <span className="cantidad">Cantidad: {item.cantidad || 0}</span>
            </div>
            {item.observaciones && (
              <div className="producto-variaciones">
                <p><strong>Observaciones:</strong></p>
                <p>{item.observaciones}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

PedidoDetalleLectura.propTypes = {
  pedido: PropTypes.shape({
    numeroMesa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    estado: PropTypes.string,
    nombreMozo: PropTypes.string,
    mozo: PropTypes.shape({ nombre: PropTypes.string }),
    fechaCreacion: PropTypes.string,
    total: PropTypes.number,
    productos: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export default PedidoDetalleLectura;

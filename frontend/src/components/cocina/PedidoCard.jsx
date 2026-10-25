import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/currencyFormatter';
import './PedidoCard.css';

/**
 * Componente para mostrar un pedido individual en la vista de cocina
 * Muestra información del pedido y botones de acción según el estado
 */
const PedidoCard = ({ pedido }) => {
  /**
   * Formatear fecha de manera legible
   */
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const horas = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  /**
   * Calcular tiempo transcurrido desde la creación
   */
  const tiempoTranscurrido = () => {
    const ahora = new Date();
    const creacion = new Date(pedido.fechaCreacion);
    const diff = Math.floor((ahora - creacion) / 60000); // minutos
    
    if (diff < 60) return `${diff} min`;
    const horas = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${horas}h ${mins}m`;
  };

  /**
   * Obtener clase CSS según el estado
   */
  const getEstadoClase = () => {
    switch (pedido.estado) {
      case 'Pendiente':
        return 'estado-pendiente';
      case 'En Preparación':
        return 'estado-preparacion';
      case 'Listo':
        return 'estado-listo';
      default:
        return '';
    }
  };

  /**
   * Obtener clase de urgencia según el tiempo transcurrido
   */
  const getUrgenciaClase = () => {
    const ahora = new Date();
    const creacion = new Date(pedido.fechaCreacion);
    const minutos = Math.floor((ahora - creacion) / 60000);
    
    if (minutos > 30) return 'urgente';
    if (minutos > 20) return 'advertencia';
    return 'normal';
  };

  return (
    <div className={`pedido-card ${getEstadoClase()} ${getUrgenciaClase()}`}>
      {/* Header del pedido */}
      <div className="pedido-header">
        <div className="pedido-info-principal">
          <h3 className="pedido-numero">{pedido.numeroPedido}</h3>
          <span className="pedido-mesa">{pedido.tipoPedido === 'Domicilio' ? 'Domicilio' : `Mesa ${pedido.numeroMesa}`}</span>
        </div>
        <div className="pedido-tiempo">
          <div className="tiempo-creacion">{formatearFecha(pedido.fechaCreacion)}</div>
          <div className="tiempo-transcurrido">
            {tiempoTranscurrido()}
          </div>
        </div>
      </div>

      {/* Estado actual */}
      <div className={`pedido-estado ${getEstadoClase()}`}>
        <span className="estado-badge">{pedido.estado}</span>
      </div>

      {/* Información del mozo */}
      <div className="pedido-mozo">
        <span className="label">Mozo:</span>
        <span className="valor">{pedido.nombreMozo}</span>
      </div>

      {/* Lista de productos */}
      <div className="pedido-productos">
        <h4>Productos:</h4>
        {pedido.productos && pedido.productos.length > 0 ? (
          <ul>
            {pedido.productos.map((item, index) => {
              // Manejar diferentes estructuras de datos
              const cantidad = item.cantidad || 0;
              const nombre = item.nombre || (item.producto?.nombre) || 'Producto sin nombre';
              const observaciones = item.observaciones || '';
              const precioUnitario = item.precioUnitario || 0;
              
              return (
                <li key={item._id || index} className="producto-item">
                  <div className="producto-info">
                    <span className="producto-cantidad">{cantidad}x</span>
                    <span className="producto-nombre">{nombre}</span>
                     <span className="producto-precio">${formatCurrency(precioUnitario)}</span>
                  </div>
                  {observaciones && (
                    <p className="producto-observaciones">
                      {observaciones}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="sin-productos">Sin productos registrados</p>
        )}
      </div>

      {/* Observaciones generales */}
      {pedido.observacionesGenerales && (
        <div className="pedido-observaciones">
          <strong>Observaciones:</strong>
          <p>{pedido.observacionesGenerales}</p>
        </div>
      )}

    </div>
  );
};

PedidoCard.propTypes = {
  pedido: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    numeroPedido: PropTypes.string.isRequired,
    numeroMesa: PropTypes.number,
    nombreMozo: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
    fechaCreacion: PropTypes.string.isRequired,
    productos: PropTypes.arrayOf(PropTypes.shape({
      cantidad: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      observaciones: PropTypes.string
    })).isRequired,
    observacionesGenerales: PropTypes.string
  }).isRequired,
};

export default PedidoCard;

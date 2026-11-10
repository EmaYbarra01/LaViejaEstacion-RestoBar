// Información de contacto y entrega visible para quienes gestionan el pedido.
const EntregaPedido = ({ pedido }) => {
  if (!pedido?.cliente) return null;
  return (
    <section className="entrega-pedido">
      <strong>{pedido.tipoPedido === 'Domicilio' ? 'Entrega a domicilio' : `Pedido del menú · Mesa ${pedido.numeroMesa}`}</strong>
      <p><span>Cliente:</span> {pedido.cliente.nombre} · <span>Teléfono:</span> {pedido.cliente.telefono}</p>
      {pedido.tipoPedido === 'Domicilio' && <p><span>Dirección:</span> {pedido.cliente.direccion}</p>}
      {pedido.cliente.referencia && <p><span>Referencia:</span> {pedido.cliente.referencia}</p>}
      {pedido.metodoPagoSolicitado && <p><span>Medio de pago:</span> {pedido.metodoPagoSolicitado}</p>}
    </section>
  );
};
export default EntregaPedido;

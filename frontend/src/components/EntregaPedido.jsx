// Información de contacto y entrega visible para quienes gestionan el pedido.
const EntregaPedido = ({ pedido }) => {
  if (!pedido?.cliente) return null;
  return (
    <section className="entrega-pedido" style={{padding:'12px',margin:'10px 0',border:'1px solid #64748b',borderRadius:'8px'}}>
      <strong>{pedido.tipoPedido === 'Domicilio' ? 'Entrega a domicilio' : `Pedido del menú · Mesa ${pedido.numeroMesa}`}</strong>
      <p>Cliente: {pedido.cliente.nombre} · Teléfono: {pedido.cliente.telefono}</p>
      {pedido.tipoPedido === 'Domicilio' && <p>Dirección: {pedido.cliente.direccion}</p>}
      {pedido.cliente.referencia && <p>Referencia: {pedido.cliente.referencia}</p>}
      {pedido.metodoPagoSolicitado && <p>Medio de pago solicitado: {pedido.metodoPagoSolicitado}</p>}
    </section>
  );
};
export default EntregaPedido;

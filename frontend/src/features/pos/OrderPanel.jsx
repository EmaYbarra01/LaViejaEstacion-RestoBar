import React from 'react';
import TicketGenerator from './TicketGenerator';

export default function OrderPanel({ order, onRemove }) {
  const subtotal = order.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleGenerateTicket = () => {
    TicketGenerator(order, subtotal);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-[var(--text)]">Orden</h2>
      <ul className="space-y-4">
        {order.map((item) => (
          <li key={item.id} className="flex justify-between items-center">
            <div>
              <p className="text-[var(--text)] font-semibold">{item.name}</p>
              <p className="text-[var(--muted)] text-sm">{item.qty} x {item.price} ARS</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:underline"
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4">
        <p className="text-[var(--text)] text-lg font-bold">Subtotal: {subtotal} ARS</p>
        <button
          onClick={handleGenerateTicket}
          className="neon-btn mt-4 w-full text-center"
        >
          Generar Ticket
        </button>
      </div>
    </div>
  );
}
import jsPDF from 'jspdf';

export default function TicketGenerator(order, subtotal) {
  const doc = new jsPDF();

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('La Vieja Estación - Ticket', 10, 10);

  doc.setFontSize(12);
  doc.text('-----------------------------', 10, 20);

  order.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.name} - ${item.qty} x ${item.price} ARS`,
      10,
      30 + index * 10
    );
  });

  doc.text('-----------------------------', 10, 30 + order.length * 10);
  doc.text(`Subtotal: ${subtotal} ARS`, 10, 40 + order.length * 10);

  doc.save('ticket.pdf');
}
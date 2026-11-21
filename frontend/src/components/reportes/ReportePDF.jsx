import html2pdf from 'html2pdf.js';
import { formatReportValue } from './reportData';

const escapeHTML = value => formatReportValue(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function ReportePDF({ data, title, reportType, description }) {
  const handleGeneratePDF = async () => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; color: #3d2817; margin-bottom: 10px;">${escapeHTML(title)}</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px; font-size: 12px;">
            Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}
          </p>
          <hr style="border: none; border-top: 2px solid #3d2817; margin-bottom: 20px;">
          
          <h2 style="color: #3d2817; margin-top: 20px; margin-bottom: 10px;">Tipo de Reporte: ${escapeHTML(reportType)}</h2>
          ${description ? `<p>${escapeHTML(description)}</p>` : ''}
          
          ${generateTableHTML(data)}
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            © 2026 La Vieja Estación - RestoBar. Todos los derechos reservados.
          </p>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `${title.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el PDF');
    }
  };

  const generateTableHTML = (data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return '<p style="color: #666;">No hay datos disponibles</p>';
    
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0] || {});
      return `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              ${headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${escapeHTML(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map((row, idx) => `
              <tr style="background-color: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};">
                ${headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px;">${escapeHTML(row[h])}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (typeof data === 'object') {
      return `
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px;">
          <tbody>
            ${Object.entries(data).map(([key, value]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background-color: #f0f0f0; width: 40%;">${escapeHTML(key)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${escapeHTML(value)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `<p style="color: #666;">${escapeHTML(data)}</p>`;
  };

  return (
    <button 
      className="btn-print-pdf"
      onClick={handleGeneratePDF}
      title="Descargar reporte como PDF"
    >
      Descargar PDF
    </button>
  );
}

export default ReportePDF;

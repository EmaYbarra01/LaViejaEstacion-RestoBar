import { useState } from 'react';
import ReportesMenu from '../components/reportes/ReportesMenu';
import VentasReports from '../components/reportes/VentasReports';
import PedidosReports from '../components/reportes/PedidosReports';
import EmpleadosReports from '../components/reportes/EmpleadosReports';
import CajaReports from '../components/reportes/CajaReports';
import ProductosReports from '../components/reportes/ProductosReports';
import ReservasReports from '../components/reportes/ReservasReports';
import CocinaReports from '../components/reportes/CocinaReports';
import ReporteEjecutivo from '../components/reportes/ReporteEjecutivo';
import './Reportes.css';

function Reportes() {
  const [selectedCategory, setSelectedCategory] = useState('ejecutivo');

  const renderReporteContent = () => {
    switch (selectedCategory) {
      case 'ventas':
      case 'ventas-diarias':
      case 'ventas-semanales':
      case 'ventas-mensuales':
      case 'ventas-por-producto':
      case 'ventas-por-categoria':
      case 'comparativa':
      case 'ingresos-totales':
        return <VentasReports selectedSubType={selectedCategory === 'ventas' ? 'ventas-diarias' : selectedCategory} />;
      case 'pedidos':
      case 'pedidos-completados':
      case 'estado-por-periodo':
        return <PedidosReports selectedSubType={selectedCategory === 'pedidos' ? 'pedidos-completados' : selectedCategory} />;
      case 'empleados':
      case 'asistencias':
        return <EmpleadosReports />;
      case 'caja':
      case 'movimientos':
      case 'arqueo':
      case 'metodos-pago':
        return <CajaReports selectedSubType={selectedCategory === 'caja' ? 'movimientos' : selectedCategory} />;
      case 'productos':
      case 'inventario':
      case 'mas-vendidos':
      case 'menos-vendidos':
        return <ProductosReports selectedSubType={selectedCategory === 'productos' ? 'inventario' : selectedCategory} />;
      case 'reservas':
      case 'ocupacion':
      case 'ingresos':
        return <ReservasReports selectedSubType={selectedCategory === 'reservas' ? 'ocupacion' : selectedCategory} />;
      case 'cocina':
      case 'tiempo-preparacion':
      case 'platos-solicitados':
        return <CocinaReports selectedSubType={selectedCategory === 'cocina' ? 'tiempo-preparacion' : selectedCategory} />;
      case 'ejecutivo':
      default:
        return <ReporteEjecutivo />;
    }
  };

  return (
    <div className="reportes-container">
      <ReportesMenu 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      <div className="reportes-content">
        {renderReporteContent()}
      </div>
    </div>
  );
}

export default Reportes;

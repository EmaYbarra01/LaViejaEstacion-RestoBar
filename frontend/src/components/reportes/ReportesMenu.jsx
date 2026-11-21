import { useState } from 'react';
import './ReportesMenu.css';

function ReportesMenu({ selectedCategory, onSelectCategory }) {
  const [expandedCategory, setExpandedCategory] = useState(selectedCategory);

  const categories = [
    {
      id: 'ejecutivo',
      label: 'Reporte Ejecutivo',
      description: 'Resumen completo del negocio'
    },
    {
      id: 'ventas',
      label: 'Ventas',
      subcategories: [
        { id: 'ventas-diarias', label: 'Ventas Diarias' },
        { id: 'ventas-semanales', label: 'Ventas Semanales' },
        { id: 'ventas-mensuales', label: 'Ventas Mensuales' },
        { id: 'ventas-por-producto', label: 'Por Producto' },
        { id: 'ventas-por-categoria', label: 'Por Categoría' },
        { id: 'comparativa', label: 'Comparativa Período a Período' },
        { id: 'ingresos-totales', label: 'Ingresos Totales' }
      ]
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      subcategories: [
        { id: 'pedidos-completados', label: 'Completados/Cancelados' },
        { id: 'estado-por-periodo', label: 'Estado por Período' }
      ]
    },
    {
      id: 'empleados',
      label: 'Empleados',
      subcategories: [
        { id: 'asistencias', label: 'Asistencias e Inasistencias' }
      ]
    },
    {
      id: 'caja',
      label: 'Caja',
      subcategories: [
        { id: 'movimientos', label: 'Movimientos de Caja' },
        { id: 'arqueo', label: 'Arqueo de Caja' },
        { id: 'metodos-pago', label: 'Métodos de Pago' }
      ]
    },
    {
      id: 'productos',
      label: 'Productos',
      subcategories: [
        { id: 'inventario', label: 'Inventario' },
        { id: 'mas-vendidos', label: 'Más Vendidos' },
        { id: 'menos-vendidos', label: 'Menos Vendidos' }
      ]
    },
    {
      id: 'reservas',
      label: 'Reservas',
      subcategories: [
        { id: 'ocupacion', label: 'De Ocupación' },
        { id: 'ingresos', label: 'Ingresos por Reservas' }
      ]
    },
    {
      id: 'cocina',
      label: 'Cocina',
      subcategories: [
        { id: 'tiempo-preparacion', label: 'Tiempo de Preparación' },
        { id: 'platos-solicitados', label: 'Platos Más Solicitados' }
      ]
    }
  ];

  const handleSelectCategory = (categoryId, subcategoryId = null) => {
    const finalId = subcategoryId || categoryId;
    onSelectCategory(finalId);
  };

  return (
    <aside className="reportes-menu">
      <div className="reportes-menu-header">
        <h3>Reportes</h3>
      </div>
      <nav className="reportes-menu-nav">
        {categories.map(category => (
          <div key={category.id} className="reportes-menu-category">
            <button
              className={`reportes-menu-item ${selectedCategory === category.id ? 'active' : ''}`}
              aria-expanded={category.subcategories ? expandedCategory === category.id : undefined}
              onClick={() => {
                handleSelectCategory(category.id);
                setExpandedCategory(expandedCategory === category.id ? null : category.id);
              }}
            >
              <span className="label">{category.label}</span>
            </button>
            
            {category.subcategories && expandedCategory === category.id && (
              <div className="reportes-submenu">
                {category.subcategories.map(sub => (
                  <button
                    key={sub.id}
                    className={`reportes-submenu-item ${
                      selectedCategory === sub.id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectCategory(category.id, sub.id)}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default ReportesMenu;

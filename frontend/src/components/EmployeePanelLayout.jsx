import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import useUserStore from '../store/useUserStore';
import './EmployeePanelLayout.css';

const employeeNames = {
  SuperAdministrador: 'Lucas Ferreyra',
  Gerente: 'Valeria Medina',
  Mozo: 'Mario García',
  EncargadoCocina: 'Diego Ruiz',
  Cajero: 'Lucía Pérez'
};

const links = {
  admin: [
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/products', 'Productos'],
    ['/admin/sales', 'Ventas'],
    ['/admin/reservas', 'Reservas'],
    ['/admin/calendario', 'Calendario'],
    ['/admin/empleados', 'Empleados'],
    ['/supervision-pedidos', 'Supervisión de pedidos'],
    ['/encargado-cocina', 'Supervisión de cocina'],
    ['/caja', 'Caja']
  ],
  Mozo: [
    ['/mozo', 'Pedidos'],
    ['/mozo', 'Menú'],
    ['/mozo', 'Cuenta']
  ],
  EncargadoCocina: [
    ['/encargado-cocina', 'Supervisión de cocina'],
    ['/encargado-cocina', 'Pendientes'],
    ['/encargado-cocina', 'En preparación'],
    ['/encargado-cocina', 'Listos']
  ],
  Cajero: [['/caja', 'Cobros']]
};

const normalizeRole = (value) => String(value || '').trim().toLowerCase();

const getPanelTitle = (pathname, roleType, role) => {
  if (pathname.startsWith('/admin/products')) return 'Productos';
  if (pathname.startsWith('/admin/sales')) return 'Ventas';
  if (pathname.startsWith('/admin/reservas')) return 'Reservas';
  if (pathname.startsWith('/admin/calendario')) return 'Calendario';
  if (pathname.startsWith('/admin/empleados')) return 'Empleados';
  if (pathname.startsWith('/admin/dashboard') || pathname === '/admin') return 'Gerencia';
  if (pathname.startsWith('/supervision-pedidos')) return 'Supervisión de pedidos';
  if (pathname.startsWith('/encargado-cocina')) return 'Supervisión de cocina';
  if (pathname.startsWith('/caja/historial-cierres')) return 'Historial de cierres';
  if (pathname.startsWith('/caja')) return 'Caja - Cobros';
  if (pathname.startsWith('/mozo')) return 'Pedidos';

  if (roleType === 'admin') return 'Gerencia';
  if (role === 'Mozo') return 'Pedidos';
  if (role === 'EncargadoCocina') return 'Cocina';
  if (role === 'Cajero') return 'Caja - Cobros';
  return 'Supervisión de pedidos';
};

function EmployeePanelLayout({
  children,
  roleType = 'admin',
  pageTitle,
  isNightMode,
  onToggleNightMode
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const role = user?.role || 'SuperAdministrador';
  const normalizedRole = normalizeRole(role);
  const isManagement = ['superadministrador', 'gerente'].includes(normalizedRole);
  const canViewSales = ['superadministrador', 'gerente'].includes(normalizedRole);
  const managementLinks = links.admin.filter(([path]) => (
    (path !== '/admin/empleados' || isManagement)
    && (path !== '/admin/sales' || canViewSales)
  ));
  const panelLinks = isManagement
    ? managementLinks
    : (roleType === 'admin' ? managementLinks : links[role] || links[roleType] || []);
  const title = pageTitle || getPanelTitle(location.pathname, roleType, role);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`employee-panel${isNightMode ? ' employee-panel-night' : ''}`}>
      <aside className="employee-sidebar">
        <div className="employee-brand">
          <img src="/logo.svg" alt="La Vieja Estación" />
          <span>Panel de gestión</span>
        </div>
        <div className="employee-user">
          <strong>{employeeNames[role] || user?.nombreCompleto || user?.name || 'Usuario'}</strong>
          <span>{role}</span>
        </div>
        <nav aria-label="Opciones del panel" className="employee-nav">
          {panelLinks.map(([path, label]) => (
            <NavLink
              key={`${path}-${label}`}
              to={path}
              end={path !== '/mozo' && path !== '/encargado-cocina'}
              className={({ isActive }) => `employee-nav-link${isActive ? ' active' : ''}`}
            >
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="employee-main">
        <header className="employee-topbar">
          <h1>LA VIEJA ESTACIÓN</h1>
          <div className="employee-top-actions">
            <div className="employee-clock">
              <span>{currentDateTime.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
              <strong>{currentDateTime.toLocaleTimeString('es-AR')}</strong>
            </div>
            <button type="button" className="employee-theme-toggle" onClick={onToggleNightMode} aria-label="Modo nocturno">
              {isNightMode ? <FaSun /> : <FaMoon />}
            </button>
            <button type="button" className="employee-logout" onClick={handleLogout}>↪ Salir</button>
          </div>
        </header>
        <main className="employee-content">
          <div className="employee-content-heading">
            <div>
              <h2>{title}</h2>
              <p>{employeeNames[role] || user?.nombreCompleto || user?.name || 'Usuario'} · {role}</p>
            </div>
            <span>Panel de gestión</span>
          </div>
          <div className="employee-page-content">{children}</div>
        </main>
        <footer className="employee-footer">© 2026 La Vieja Estación. Todos los derechos reservados.</footer>
      </section>
    </div>
  );
}

export default EmployeePanelLayout;
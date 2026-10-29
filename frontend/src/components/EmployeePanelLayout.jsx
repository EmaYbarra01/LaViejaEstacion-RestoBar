import { useEffect, useState } from 'react';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBox, FaCalendarAlt, FaCashRegister, FaChartLine, FaClipboardList, FaComments, FaFire, FaMoon, FaSun, FaUsers } from 'react-icons/fa';
import useUserStore from '../store/useUserStore';
import './EmployeePanelLayout.css';
import { formatClockDate, formatClockTime } from '../utils/clockFormat';

const employeeNames = {
  SuperAdministrador: 'Lucas Ferreyra',
  Gerente: 'Valeria Medina',
  Mozo: 'Mario García',
  EncargadoCocina: 'Diego Ruiz',
  Cajero: 'Lucía Pérez'
};

const links = {
  admin: [
    ['/admin/dashboard', 'Dashboard', FaChartLine],
    ['/admin/products', 'Productos', FaBox],
    ['/admin/sales', 'Ventas', FaChartLine],
    ['/admin/reservas', 'Reservas', FaClipboardList],
    ['/admin/calendario', 'Calendario', FaCalendarAlt],
    ['/admin/empleados', 'Empleados', FaUsers],
    ['/supervision-pedidos', 'Supervisión de pedidos', FaClipboardList],
    ['/encargado-cocina', 'Cocina', FaFire],
    ['/caja', 'Caja', FaCashRegister]
  ],
  Mozo: [
    ['/mozo', 'Pedidos', FaClipboardList],
    ['/mozo', 'Menú', FaBox],
    ['/mozo', 'Cuenta', FaCashRegister]
  ],
  EncargadoCocina: [
    ['/encargado-cocina', 'Todos', FaFire],
    ['/encargado-cocina', 'Pendientes', FaFire],
    ['/encargado-cocina', 'En preparación', FaFire],
    ['/encargado-cocina', 'Listos', FaFire]
  ],
  Cajero: [['/caja', 'Cobros', FaCashRegister]]
};

function EmployeePanelLayout({ children, roleType = 'admin', isNightMode, onToggleNightMode }) {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const role = user?.role || 'SuperAdministrador';
  const isManagement = role === 'SuperAdministrador' || role === 'Gerente';
  const panelLinks = roleType === 'admin'
    ? links.admin.filter(([path]) => path !== '/admin/empleados' || isManagement)
    : links[role] || [];
  const title = roleType === 'admin' ? 'Dashboard - Panel de Control' : (
    role === 'Mozo' ? 'Pedidos' :
      role === 'EncargadoCocina' ? 'Cocina' :
        role === 'Cajero' ? 'Caja - Cobros' : 'Supervisión de pedidos'
  );

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
          {panelLinks.map(([path, label, IconComponent], index) => (
            <NavLink
              key={`${path}-${label}`}
              to={path}
              end={path !== '/mozo' && path !== '/encargado-cocina'}
              className={({ isActive }) => `employee-nav-link${isActive && index === 0 ? ' active' : ''}`}
            >
              {React.createElement(IconComponent, { 'aria-hidden': true })}
              <span>{label}</span>
            </NavLink>
          ))}
          {isManagement && (
            <NavLink to="/mensajeria" className="employee-nav-link">
              <FaComments aria-hidden="true" />
              <span>Mensajería</span>
            </NavLink>
          )}
        </nav>
      </aside>
      <section className="employee-main">
        <header className="employee-topbar">
          <h1>LA VIEJA ESTACIÓN</h1>
          <div className="employee-top-actions">
            <div className="employee-clock">
              <span>{formatClockDate(currentDateTime)}</span>
              <strong>{formatClockTime(currentDateTime)}</strong>
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

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaBox, FaUsers, FaChartLine, FaArrowLeft, FaCalendarAlt, FaClipboardList, FaUserTie } from "react-icons/fa";
import useUserStore from "../store/useUserStore";
import "./AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isSuperAdmin = user?.role === 'SuperAdministrador';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header del Panel de Admin */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem 2rem',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <FaArrowLeft /> Volver
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
            🛠️ Panel de Administración
          </h1>
        </div>
      </div>

      {/* Navegación con pestañas */}
      <nav id="admin-nav" style={{ 
        background: 'white',
        borderBottom: '2px solid #e0e0e0',
        padding: '0 2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <NavLink 
          to="/admin/products" 
          className="nav-link"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? '#667eea' : '#666',
            borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s'
          })}
        >
          <FaBox /> Productos
        </NavLink>
        <NavLink 
          to="/admin/users" 
          className="nav-link"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? '#667eea' : '#666',
            borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s'
          })}
        >
          <FaUsers /> Usuarios
        </NavLink>
        <NavLink 
          to="/admin/sales" 
          className="nav-link"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? '#667eea' : '#666',
            borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s'
          })}
        >
          <FaChartLine /> Ventas
        </NavLink>
        <NavLink 
          to="/admin/reservas" 
          className="nav-link"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? '#667eea' : '#666',
            borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s'
          })}
        >
          <FaClipboardList /> Reservas
        </NavLink>
        <NavLink 
          to="/admin/calendario" 
          className="nav-link"
          style={({ isActive }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.5rem',
            textDecoration: 'none',
            color: isActive ? '#667eea' : '#666',
            borderBottom: isActive ? '3px solid #667eea' : '3px solid transparent',
            fontWeight: isActive ? 'bold' : 'normal',
            transition: 'all 0.3s'
          })}
        >
          <FaCalendarAlt /> Calendario
        </NavLink>
        {isSuperAdmin && (
          <NavLink 
            to="/admin/empleados" 
            className="nav-link"
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '1rem 1.5rem',
              textDecoration: 'none',
              color: isActive ? '#ff9800' : '#666',
              borderBottom: isActive ? '3px solid #ff9800' : '3px solid transparent',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.3s'
            })}
          >
            <FaUserTie /> Empleados
          </NavLink>
        )}
      </nav>

      {/* Contenido */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPage;

import { NavLink, Outlet } from "react-router-dom";
import "./AdminPage.css";

const AdminPage = () => {
  return (
    <>
    <nav id="admin-nav">
      <NavLink to="/admin/products" className="nav-link">
        Productos
      </NavLink>
      <NavLink to="/admin/users" className="nav-link">
        Usuarios
      </NavLink>
    </nav>
    <Outlet/>
    </>
  );
};

export default AdminPage;

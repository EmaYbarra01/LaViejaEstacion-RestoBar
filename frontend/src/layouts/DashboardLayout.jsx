import { Link, Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text)]">
      <Header />
      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="w-64 bg-[rgba(255,255,255,0.02)] text-[var(--text)] p-4 border-r border-[rgba(255,255,255,0.03)]">
          <h2 className="text-xl font-bold mb-6">La Vieja Estación</h2>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard/mesas" className="hover:bg-[rgba(255,255,255,0.03)] p-2 rounded">Mesas</Link>
            <Link to="/dashboard/pedidos" className="hover:bg-[rgba(255,255,255,0.03)] p-2 rounded">Pedidos</Link>
            <Link to="/dashboard/productos" className="hover:bg-[rgba(255,255,255,0.03)] p-2 rounded">Productos</Link>
            <Link to="/dashboard/reportes" className="hover:bg-[rgba(255,255,255,0.03)] p-2 rounded">Reportes</Link>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

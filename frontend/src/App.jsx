import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EntrarPage from "./pages/EntrarPage";
import MenuPage from "./pages/MenuPage";
import MenuDigital from "./pages/MenuDigital";
import ServiciosPage from "./pages/ServiciosPage";
import QuienesSomos from "./pages/QuienesSomos";
import EquipoDesarrollo from "./pages/EquipoDesarrollo";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Reservas from "./pages/Reservas";
import Mozo from "./pages/Mozo";
import SupervisionPedidos from "./pages/SupervisionPedidos";
import CocinaView from "./pages/CocinaView";
import Caja from "./pages/Caja";
import HistorialCierres from "./pages/HistorialCierres";
import "./App.css";
import Products from "./pages/Products";
import AdminSales from "./pages/AdminSales";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthInitializer from "./hooks/useAuthInitializer";
import AdminReservas from "./pages/AdminReservas";
import CalendarioReservas from "./pages/CalendarioReservas";
import MisReservas from "./pages/MisReservas";
import Empleados from "./pages/Empleados";
import Dashboard from "./pages/Dashboard";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import EmployeePanelLayout from "./components/EmployeePanelLayout";

const employeePaths = ['/admin', '/mozo', '/supervision-pedidos', '/encargado-cocina', '/caja'];

function App() {
  const location = useLocation();
  const [isNightMode, setIsNightMode] = useState(() => (
    localStorage.getItem("app-theme") === "night"
  ));
  const isEmployeePath = employeePaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  // Inicializar la autenticación al cargar la aplicación
  useAuthInitializer();

  useEffect(() => {
    const theme = isNightMode ? "night" : "day";
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("dark-mode", isNightMode);
    localStorage.setItem("app-theme", theme);
  }, [isNightMode]);

  // No bloquear la UI mientras se verifica la autenticación
  // Dejar que las rutas protegidas manejen su propio loading

  return (
    <>
      {/* Mostrar Header siempre, la navegación se oculta por rol en Header.jsx */}
      {location.pathname !== "/" && location.pathname !== "/entrar" && location.pathname !== "/menu" && location.pathname !== "/menu-digital" && !isEmployeePath && (
        <Header
          isNightMode={isNightMode}
          onToggleNightMode={() => setIsNightMode((current) => !current)}
        />
      )}
      <div className={location.pathname === "/" ? "" : "main-content"}>
        <Routes>
          <Route
            path="/"
            element={(
              <HomePage
                isNightMode={isNightMode}
                onToggleNightMode={() => setIsNightMode((current) => !current)}
              />
            )}
          />
          <Route
            path="/entrar"
            element={(
              <EntrarPage
                isNightMode={isNightMode}
                onToggleNightMode={() => setIsNightMode((current) => !current)}
              />
            )}
          />
          <Route
            path="/menu"
            element={(
              <MenuPage
                isNightMode={isNightMode}
                onToggleNightMode={() => setIsNightMode((current) => !current)}
              />
            )}
          />
          {/* HU1: Menú digital público accesible por QR - Sin autenticación */}
          <Route path="/menu-digital" element={(
            <MenuDigital
              isNightMode={isNightMode}
              onToggleNightMode={() => setIsNightMode((current) => !current)}
            />
          )} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/equipo-desarrollo" element={<EquipoDesarrollo />} />
          <Route path="/reservas" element={<Reservas />} />
          {/* Módulo del Mozo - Gestión de pedidos - Mozos + Supervisión (Gerente, SuperAdmin) */}
          <Route path="/mozo" element={
            <ProtectedRoute role={["Mozo", "Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((current) => !current)} roleType="Mozo">
                <Mozo />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          <Route path="/supervision-pedidos" element={
            <ProtectedRoute role={["Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((current) => !current)}>
                <SupervisionPedidos />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          {/* Módulo de Cocina - Gestión de pedidos - EncargadoCocina + Supervisión (Gerente, SuperAdmin) */}
          <Route path="/encargado-cocina" element={
            <ProtectedRoute role={["EncargadoCocina", "Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((current) => !current)} roleType="EncargadoCocina">
                <CocinaView />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          {/* Módulo de Caja - Gestión de cobros - Cajero + Supervisión (Gerente, SuperAdmin) */}
          <Route path="/caja" element={
            <ProtectedRoute role={["Cajero", "Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((current) => !current)} roleType="Cajero">
                <Caja />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          <Route path="/caja/historial-cierres" element={
            <ProtectedRoute role={["Cajero", "Gerente", "SuperAdministrador"]}>
              <HistorialCierres />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute role={["SuperAdministrador", "Gerente"]}>
                <AdminPage
                  isNightMode={isNightMode}
                  onToggleNightMode={() => setIsNightMode((current) => !current)}
                />
            </ProtectedRoute>
          }>        
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="calendario" element={<CalendarioReservas />} />
            <Route path="empleados" element={
              <ProtectedRoute role={["SuperAdministrador", "Gerente"]}>
                <Empleados />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/mis-reservas" element={<MisReservas />} />

        </Routes>
      </div>
      {location.pathname !== "/" && location.pathname !== "/entrar" && location.pathname !== "/menu" && location.pathname !== "/menu-digital" && !isEmployeePath && <Footer />}
    </>
  );
}

export default App;

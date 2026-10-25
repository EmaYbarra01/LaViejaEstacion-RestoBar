import Header from "./components/Header";
import Footer from "./components/Footer";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
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
import EmployeePanelLayout from "./components/EmployeePanelLayout"; // <--- ¡Añadido aquí!

function App() {
  const [isNightMode, setIsNightMode] = useState(() => (
    localStorage.getItem("app-theme") === "night"
  ));

  // Inicializar la autenticación al cargar la aplicación
  useAuthInitializer();

  useEffect(() => {
    const theme = isNightMode ? "night" : "day";
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("dark-mode", isNightMode);
    localStorage.setItem("app-theme", theme);
  }, [isNightMode]);

  return (
    <>
      <Header
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((current) => !current)}
      />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu-digital" element={<MenuDigital />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/equipo-desarrollo" element={<EquipoDesarrollo />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/mozo" element={
            <ProtectedRoute role={["Mozo", "Gerente", "SuperAdministrador"]}>
              <Mozo />
            </ProtectedRoute>
          } />
          <Route path="/supervision-pedidos" element={
            <ProtectedRoute role={["Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout
                pageTitle="Supervisión de pedidos"
                isNightMode={isNightMode}
                onToggleNightMode={() => setIsNightMode((current) => !current)}
              >
                <SupervisionPedidos />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          <Route path="/encargado-cocina" element={
            <ProtectedRoute role={["EncargadoCocina", "Gerente", "SuperAdministrador"]}>
              <CocinaView />
            </ProtectedRoute>
          } />
          <Route path="/caja" element={
            <ProtectedRoute role={["Cajero", "Gerente", "SuperAdministrador"]}>
              <Caja />
            </ProtectedRoute>
          } />
          <Route path="/caja/historial-cierres" element={
            <ProtectedRoute role={["Cajero", "Gerente", "SuperAdministrador"]}>
              <EmployeePanelLayout
                isNightMode={isNightMode}
                onToggleNightMode={() => setIsNightMode((current) => !current)}
              >
                <HistorialCierres />
              </EmployeePanelLayout>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute role={["SuperAdministrador", "Gerente"]}>
                <AdminPage />
            </ProtectedRoute>
          }>        
            <Route path="dashboard" element={<SuperadminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={
              <ProtectedRoute role={["SuperAdministrador", "Gerente"]}>
                <AdminSales />
              </ProtectedRoute>
            } />
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
      <Footer />
    </>
  );
}

export default App;
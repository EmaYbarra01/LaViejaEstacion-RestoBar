import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
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
import CocinaView from "./pages/CocinaView";
import "./App.css";
import Products from "./pages/Products";
import Users from "./pages/Users";
import AdminSales from "./pages/AdminSales";
import ProtectedRoute from "./components/ProtectedRoute";
import useAuthInitializer from "./hooks/useAuthInitializer";
import ProductList from './components/carrito/ProductList'
import Cart from './components/carrito/Cart'
import SalesHistory from './components/carrito/SalesHistory'
import NotificationContainer from './components/carrito/NotificationContainer'
import AdminReservas from "./pages/AdminReservas";
import CalendarioReservas from "./pages/CalendarioReservas";
import MisReservas from "./pages/MisReservas";
import Empleados from "./pages/Empleados";
import useUserStore from './store/useUserStore';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const { user } = useUserStore();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openSales = () => setIsSalesOpen(true);
  const closeSales = () => setIsSalesOpen(false);

  // Inicializar la autenticación al cargar la aplicación
  useAuthInitializer();

  // No bloquear la UI mientras se verifica la autenticación
  // Dejar que las rutas protegidas manejen su propio loading

  return (
    <>
      {/* Mostrar Header siempre, la navegación se oculta por rol en Header.jsx */}
      <Header onCartClick={openCart} onSalesClick={openSales} />
      <NotificationContainer />
      <Cart isOpen={isCartOpen} onClose={closeCart} />
      <SalesHistory isOpen={isSalesOpen} onClose={closeSales} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          {/* HU1: Menú digital público accesible por QR - Sin autenticación */}
          <Route path="/menu-digital" element={<MenuDigital />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/equipo-desarrollo" element={<EquipoDesarrollo />} />
          <Route path="/productos" element={<ProductList />} />
          <Route path="/reservas" element={<Reservas />} />
          {/* Módulo del Mozo - Gestión de pedidos - SOLO para mozos */}
          <Route path="/mozo" element={
            <ProtectedRoute role={["Mozo", "Mozo1", "Mozo2"]}>
              <Mozo />
            </ProtectedRoute>
          } />
          {/* Módulo de Cocina - Gestión de pedidos - SOLO para EncargadoCocina */}
          <Route path="/cocina" element={
            <ProtectedRoute role={["EncargadoCocina", "Cocina"]}>
              <CocinaView />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute role={["Administrador", "SuperAdministrador", "Gerente"]}>
                <AdminPage />
            </ProtectedRoute>
          }>        
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="calendario" element={<CalendarioReservas />} />
            <Route path="empleados" element={
              <ProtectedRoute role={["SuperAdministrador"]}>
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

import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSalesOpen, setIsSalesOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  
  const openSales = () => setIsSalesOpen(true)
  const closeSales = () => setIsSalesOpen(false)
  // Inicializar la autenticación al cargar la aplicación
  const { isLoading } = useAuthInitializer();

  // Mostrar un loading mientras se inicializa la autenticación
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <>
      <Header onCartClick={openCart} onSalesClick={openSales} />
      <NotificationContainer />
      <Cart isOpen={isCartOpen} onClose={closeCart} />
      <SalesHistory isOpen={isSalesOpen} onClose={closeSales} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={
            <ProtectedRoute role={['admin','superadmin']}>
                <AdminPage />
            </ProtectedRoute>
          }>        
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="sales" element={<AdminSales />} />
          </Route>

        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;

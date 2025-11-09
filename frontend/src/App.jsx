import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Mesas from "./pages/Mesas";
import POSLayout from "./features/pos/POSLayout";

function App() {
  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<HomePage />} />
      {/* Login */}
      <Route path="/login" element={<Login />} />
      {/* Rutas protegidas dentro del Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route path="mesas" element={<Mesas />} />
        <Route path="pos" element={<POSLayout />} />
      </Route>
    </Routes>
  );
}

export default App;

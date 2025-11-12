import { Router } from "express";
import { obtenerVentas, obtenerVentasUsuario, crearVenta, obtenerUnaVenta } from "../controllers/sales.controllers.js";
import verificarToken from "../auth/token-verify.js";
import verificarRol from "../auth/verificar-rol.js";


const router = Router();

// Rutas para administradores
router.route('/sales/all')
    .get(verificarToken, verificarRol('admin'), obtenerVentas); // Solo admin puede ver todas las ventas

// Rutas para usuarios autenticados
router.route('/sales/myhistory')
    .get(verificarToken, obtenerVentasUsuario); // Usuario ve solo sus ventas

router.route('/sales')
    .post(verificarToken, crearVenta); // Cualquier usuario autenticado puede crear una venta

router.route('/sales/:id')
    .get(verificarToken, obtenerUnaVenta); // Cualquier usuario autenticado puede ver una venta por ID
    // .patch(verificarToken, verificarRol('admin'), validarVenta, actualizarVenta) // Solo admin puede actualizar ventas
    // .delete(verificarToken, verificarRol('admin'), eliminarVenta); // Solo admin puede eliminar ventas


export default router;
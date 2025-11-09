import {Router} from 'express';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto, obtenerUnProducto } from '../controllers/products.controllers.js';
import validarProducto from '../helpers/validarProducto.js';
import verificarToken from '../auth/token-verify.js';
import verificarRol from '../auth/verificar-rol.js';

const router = Router();

router.route('/products')
    .get(obtenerProductos)
    .post(verificarToken, verificarRol('admin'), validarProducto, crearProducto);

router.route('/products/:id')
    .get(obtenerUnProducto)
    .patch(verificarToken, verificarRol('admin'), validarProducto, actualizarProducto)
    .delete(verificarToken, verificarRol('admin'), eliminarProducto);

export default router;
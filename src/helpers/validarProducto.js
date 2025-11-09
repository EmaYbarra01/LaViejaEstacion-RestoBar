import { check } from 'express-validator';
import resultadoValidacion from './resultadoValidacion.js';

const validarProducto = [
    check('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio'),
    check('code')
        .notEmpty()
        .withMessage('El código del producto es obligatorio'),
    (req, res ,next) => {resultadoValidacion(req,res,next)}
]

export default validarProducto;
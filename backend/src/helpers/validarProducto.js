import { check } from 'express-validator';
import resultadoValidacion from './resultadoValidacion.js';

/**
 * Validación completa para productos
 * Valida todos los campos requeridos y sus tipos
 */
const validarProducto = [
    // Nombre del producto (campo en español del backend)
    check('nombre')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    
    // Categoría
    check('categoria')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn(['Bebidas', 'Bebidas Alcohólicas', 'Comidas', 'Postres', 'Entradas', 'Guarniciones', 'Otro'])
        .withMessage('Categoría no válida'),
    
    // Precio
    check('precio')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor o igual a 0')
        .toFloat(),
    
    // Stock (opcional, pero si viene debe ser válido)
    check('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0')
        .toInt(),
    
    // Stock mínimo (opcional)
    check('stockMinimo')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0')
        .toInt(),
    
    // Costo (opcional)
    check('costo')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El costo debe ser un número mayor o igual a 0')
        .toFloat(),
    
    // Descripción (opcional)
    check('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede superar los 500 caracteres'),
    
    // Código (opcional, pero único)
    check('codigo')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('El código debe tener entre 1 y 50 caracteres'),
    
    // Unidad de medida (opcional)
    check('unidadMedida')
        .optional()
        .isIn(['Unidad', 'Kg', 'Litro', 'Gramo', 'Ml', 'Porción'])
        .withMessage('Unidad de medida no válida'),
    
    // Disponible (opcional, booleano)
    check('disponible')
        .optional()
        .isBoolean()
        .withMessage('Disponible debe ser verdadero o falso')
        .toBoolean(),
    
    // Imagen URL (opcional)
    check('imagenUrl')
        .optional()
        .trim(),
    
    // Middleware que ejecuta las validaciones
    (req, res, next) => { resultadoValidacion(req, res, next) }
];

export default validarProducto;
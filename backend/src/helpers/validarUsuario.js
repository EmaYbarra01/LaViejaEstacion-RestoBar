import { check } from "express-validator";
import resultadoValidacion from "./resultadoValidacion.js";

const rolesPermitidos = [
  "SuperAdministrador",
  "Gerente",
  "Mozo",
  "Cajero",
  "EncargadoCocina"
];

const validarUsuario = [
  check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .trim(),
  check("apellido")
    .notEmpty()
    .withMessage("El apellido es obligatorio")
    .trim(),
  check("email")
    .notEmpty()
    .withMessage("El email no puede estar vacio")
    .isEmail()
    .withMessage("Debe ser un formato de email valido")
    .normalizeEmail(),
  check("dni")
    .notEmpty()
    .withMessage("El DNI es obligatorio")
    .trim(),
  check("rol")
    .notEmpty()
    .withMessage("El rol es obligatorio")
    .isIn(rolesPermitidos)
    .withMessage("El rol seleccionado no es válido"),
  check("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  (req, res, next) => resultadoValidacion(req, res, next)
];

export default validarUsuario;
    import {check} from "express-validator"
    import resultadoValidacion from "./resultadoValidacion"

    const validarUsuario = [
            check("username")
            .notEmpty()
            .withMessage("El nombre del usuario es obligatorio")
            ,
            check("email")
            .notEmpty()
            .withMessage("El email no puede estar vacio")
            .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)
            .withMessage("debe ser un formato de email valido por ejemplo mail@mailco"),
      (req, res ,next) => {resultadoValidacion(req,res,next)}
      //explicar la siguiente clase que hace esto
        ]

        export default validarUsuario
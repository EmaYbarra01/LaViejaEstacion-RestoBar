import { validationResult } from "express-validator";

const resultadoValidacion = (req, res, next) =>{

    const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ 
      mensaje: "Datos de entrada no válidos",
      errores: errors.array() 
    });
  }
  next();
}

export default resultadoValidacion;
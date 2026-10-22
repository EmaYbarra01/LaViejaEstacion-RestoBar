import { pool } from '../database/mysql/pool.js';
import { reportesService } from '../services/mysql/reportes.js';
const service=reportesService(pool);
export const obtenerEstadisticasDashboard=async(req,res)=>{
  try {res.json(await service.dashboard(req.user?.id||req.id));}
  catch(error){console.error('[DASHBOARD]',error.message);res.status(error.status||500).json({success:false,message:error.status?error.message:'No se pudieron cargar las estadísticas'});}
};

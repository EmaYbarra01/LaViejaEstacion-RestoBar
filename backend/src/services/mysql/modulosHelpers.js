import { requireCondition as check } from '../../database/mysql/transaction.js';
export { check };
export function texto(v,n,max=100,requerido=true){
 check(typeof v==='string' && v.trim().length<=max && (!requerido || v.trim()),`${n} inválido`);return v.trim();
}
export function dinero(v,n='Monto',positivo=false){
 check((typeof v==='number'||typeof v==='string') && v!=='' && /^\d+(\.\d{1,2})?$/.test(String(v)),`${n} inválido`);
 const x=Number(v);check(Number.isFinite(x)&&x<1e10&&(positivo?x>0:x>=0),`${n} inválido`);return x;
}
export function entero(v,min,max,n){check((typeof v==='number'||typeof v==='string')&&/^\d+$/.test(String(v)),`${n} inválido`);const x=Number(v);check(Number.isSafeInteger(x)&&x>=min&&x<=max,`${n} inválido`);return x;}
export function dia(v){
 if(v===undefined)return new Date(Date.now()-10800000).toISOString().slice(0,10);
 check(typeof v==='string','Fecha inválida');const d=v.slice(0,10);check(/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d,'Fecha inválida');return d;
}
export const admin=['SuperAdministrador','Gerente'];
export function endpoint(fn){return async(req,res)=>{try{const r=await fn(req);res.status(r.status||200).json(r.body);}catch(e){
 const status=e.status || (e.code==='ER_DUP_ENTRY'||e.code==='ER_ROW_IS_REFERENCED_2'?409:500);
 if(status===500)console.error('[MySQL]',e.code||e.message);
 const mensaje=e.status?e.message:e.code==='ER_DUP_ENTRY'?'El registro ya existe':e.code==='ER_ROW_IS_REFERENCED_2'?'Tiene historial relacionado: desactivá el registro para conservarlo':'Error al procesar la operación';
 res.status(status).json({mensaje,message:mensaje});}};}

import { readFile,readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve,relative,dirname } from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url)),visited=new Set(),issues=[];
async function visit(file){file=resolve(file);if(visited.has(file))return;visited.add(file);let s;
 try{s=await readFile(file,'utf8');}catch{issues.push(`Archivo importado ausente: ${relative(root,file)}`);return;}
 s=s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
 for(const match of s.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)){
 const spec=match[1];if(/^(mongoose|mongodb)(\/|$)/.test(spec))issues.push(`${relative(root,file)} importa ${spec}`);
 if(spec.startsWith('.'))await visit(resolve(dirname(file),spec));
 }
 if(/\bMONGODB_URI\b|\bmongoose\b/.test(s))issues.push(`Referencia Mongo activa: ${relative(root,file)}`);
}
await visit(resolve(root,'index.js'));
const p=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
if(p.dependencies?.mongoose||p.dependencies?.mongodb)issues.push('Drivers Mongo en dependencias');
if(issues.length){issues.forEach(x=>console.error(x));process.exitCode=1;}else console.log(`Auditoría OK: ${visited.size} archivos del servidor, sin imports ni conexión MongoDB.`);

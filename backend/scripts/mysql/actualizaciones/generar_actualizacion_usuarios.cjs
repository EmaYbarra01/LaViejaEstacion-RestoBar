/**
 * Genera un SQL LOCAL para actualizar credenciales sin publicar contraseñas.
 * Ejecutar desde backend: node scripts/mysql/actualizaciones/generar_actualizacion_usuarios.cjs
 * Requiere bcryptjs instalado en backend.
 */
const fs = require('node:fs');
const path = require('node:path');
let bcrypt;
try { bcrypt = require('bcryptjs'); } catch (_) {
  console.error('No se encontró bcryptjs. Desde backend ejecutá: npm install');
  process.exit(1);
}
const salida = path.join(__dirname, 'actualizar_usuarios.local.sql');
if (fs.existsSync(salida)) {
  console.error('Ya existe actualizar_usuarios.local.sql. Renombralo o borrá la copia local antes de generar otro.');
  process.exit(1);
}
if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error('Ejecutá el script desde la terminal interactiva de VS Code.');
  process.exit(1);
}
process.stdout.write('Ingresá la contraseña nueva para los 6 usuarios activos (no se mostrará): ');
let password = '';
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');
stdin.on('data', async key => {
  if (key === '\u0003') { process.stdout.write('\nCancelado.\n'); process.exit(130); }
  if (key === '\r' || key === '\n') {
    stdin.setRawMode(false); stdin.pause(); process.stdout.write('\n');
    if (password.length < 8) { console.error('Usá al menos 8 caracteres.'); process.exit(1); }
    try {
      const hash = await bcrypt.hash(password, 10);
      password = '';
      const sql = `-- ARCHIVO LOCAL: NO SUBIR A GIT. Ejecutar en Workbench tras revisar ID y roles.\n-- Primero: respaldar la tabla usuarios en esta computadora.\nUSE la_vieja_estacion;\n-- Verificá que los ID/roles correspondan a los esperados antes de seguir.\nSELECT id, rol_id, nombre, apellido, email, activo FROM usuarios ORDER BY id;\n\nSTART TRANSACTION;\nUPDATE usuarios\nSET email = CASE id\n  WHEN 1 THEN 'ferreyra@restobar.com'\n  WHEN 2 THEN 'medina@restobar.com'\n  WHEN 4 THEN 'perez@restobar.com'\n  WHEN 5 THEN 'ruiz@restobar.com'\n  WHEN 6 THEN 'lopez@restobar.com'\n  WHEN 7 THEN 'soria@restobar.com'\n  ELSE email END,\nactivo = CASE WHEN id IN (1,2,4,5,6,7) THEN 1 ELSE 0 END,\npassword_hash = CASE WHEN id IN (1,2,4,5,6,7) THEN '${hash}' ELSE password_hash END\nWHERE id IN (1,2,3,4,5,6,7,8,9);\n\n-- Revisá el resultado. COMMIT y ROLLBACK se ejecutan por separado.\nSELECT id, rol_id, nombre, apellido, email, activo, LEFT(password_hash, 7) AS tipo_hash\nFROM usuarios ORDER BY id;\nSELECT COUNT(*) AS usuarios_activos FROM usuarios WHERE activo = 1;\n-- Si todo coincide, ejecutar por separado: COMMIT;\n-- Si hay errores, ejecutar por separado: ROLLBACK;\n`;
      fs.writeFileSync(salida, sql, {encoding:'utf8', flag:'wx', mode:0o600});
      console.log('Se creó el archivo LOCAL: ' + salida);
      console.log('NO lo subas a GitHub. Revisá primero la guía de ejecución.');
    } catch (e) { console.error('Error al generar SQL:', e.message); process.exitCode = 1; }
    return;
  }
  if (key === '\u007f' || key === '\b') password = password.slice(0,-1);
  else if (key >= ' ' && key !== '\u001b') password += key;
});

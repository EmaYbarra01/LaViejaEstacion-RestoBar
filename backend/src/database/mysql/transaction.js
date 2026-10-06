// Las notificaciones se emiten por el controlador después de esta promesa:
// si COMMIT falla, no se anuncia una operación que quedó sin guardar.
export async function transaction(pool, work) {
  const connection = await pool.getConnection();
  try {
    await connection.query("SET time_zone = '+00:00'");
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

export function requireCondition(condition, message, status=400) {
  if (!condition) throw Object.assign(new Error(message),{status});
}
export function positiveId(value) {
  const id=Number(value);
  requireCondition(Number.isSafeInteger(id) && id>0,'Identificador inválido');
  return id;
}
export async function actor(connection, id, roles) {
  const [[user]]=await connection.execute(`SELECT u.id,u.nombre,u.apellido,r.nombre rol
    FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.id=? AND u.activo=TRUE`,[positiveId(id)]);
  requireCondition(user && roles.includes(user.rol),'El usuario no tiene permiso para esta operación',403);
  return user;
}
export async function nextNumber(connection, name) {
  await connection.execute('INSERT IGNORE INTO secuencias(nombre,valor) VALUES(?,0)',[name]);
  await connection.execute('UPDATE secuencias SET valor=LAST_INSERT_ID(valor+1) WHERE nombre=?',[name]);
  const [[row]]=await connection.query('SELECT LAST_INSERT_ID() numero');
  return row.numero;
}

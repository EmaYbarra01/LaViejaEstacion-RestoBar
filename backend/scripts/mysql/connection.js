import 'dotenv/config';
import mysql from 'mysql2/promise';

export async function connect({ database = false } = {}) {
  const options = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    timezone: 'Z',
    decimalNumbers: true,
    multipleStatements: false,
  };
  if (process.env.MYSQL_SSL_CA) {
    const { readFile } = await import('node:fs/promises');
    options.ssl = { ca: await readFile(process.env.MYSQL_SSL_CA, 'utf8'), rejectUnauthorized: true };
  }
  if (database) options.database = 'la_vieja_estacion';
  const connection = await mysql.createConnection(options);
  await connection.query("SET time_zone='+00:00'");
  await connection.query("SET SESSION sql_mode='STRICT_TRANS_TABLES,ONLY_FULL_GROUP_BY,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
  return connection;
}

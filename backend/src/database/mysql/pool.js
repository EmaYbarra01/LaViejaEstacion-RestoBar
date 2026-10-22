import 'dotenv/config';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'la_vieja_estacion',
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
  timezone: 'Z',
  decimalNumbers: true,
});

export async function getMySQLConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.query("SET time_zone = '+00:00'");
    return connection;
  } catch (error) {
    connection.release();
    throw error;
  }
}
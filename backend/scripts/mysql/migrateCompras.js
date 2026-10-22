import { connect } from './connection.js';
import { executeFile } from './sqlFile.js';
const db = await connect({ database: true });
try {
  await executeFile(db, new URL('../../database/mysql/005_compras_pagos.sql', import.meta.url));
  console.log('Compras: actualización aplicada. Los datos existentes se conservaron.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { await db.end(); }

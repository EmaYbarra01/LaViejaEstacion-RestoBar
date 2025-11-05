/**
 * Configuración inicial para tests
 * Este archivo se ejecuta antes de todos los tests
 */

// Cargar variables de entorno de test
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Si no existe .env.test, usar variables de desarrollo
if (!process.env.JWT_SECRET_KEY) {
  dotenv.config();
}

// Configurar timeout global
jest.setTimeout(10000);

// Mock de console para tests más limpios (opcional)
global.console = {
  ...console,
  // Comentar estas líneas si quieres ver los logs durante los tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};

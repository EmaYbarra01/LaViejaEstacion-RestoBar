import 'dotenv/config';

export const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Falta la variable de entorno MONGODB_URI. Configurala con la URI de MongoDB Atlas en backend/.env o en el entorno del proceso.'
  );
}
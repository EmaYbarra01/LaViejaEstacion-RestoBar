/**
 * Script para Exportar la Base de Datos
 * Exporta todas las colecciones de restobar_db a archivos JSON
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar modelos
import Reserva from './src/models/reservaSchema.js';
import Mesa from './src/models/mesaSchema.js';
import Usuario from './src/models/usuarioSchema.js';
import Producto from './src/models/productoSchema.js';
import Pedido from './src/models/pedidoSchema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📦 EXPORTADOR DE BASE DE DATOS - RestoBar');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function exportarBaseDeDatos() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Crear carpeta de exportación
    const exportDir = path.join(__dirname, 'db-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFolder = path.join(exportDir, `backup-${timestamp}`);
    fs.mkdirSync(exportFolder);

    console.log(`📁 Exportando a: ${exportFolder}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let totalDocumentos = 0;

    // Exportar Reservas
    console.log('\n📅 Exportando Reservas...');
    const reservas = await Reserva.find({}).lean();
    fs.writeFileSync(
      path.join(exportFolder, 'reservas.json'),
      JSON.stringify(reservas, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${reservas.length} reservas exportadas`);
    totalDocumentos += reservas.length;

    // Exportar Mesas
    console.log('\n🪑 Exportando Mesas...');
    const mesas = await Mesa.find({}).lean();
    fs.writeFileSync(
      path.join(exportFolder, 'mesas.json'),
      JSON.stringify(mesas, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${mesas.length} mesas exportadas`);
    totalDocumentos += mesas.length;

    // Exportar Usuarios
    console.log('\n👥 Exportando Usuarios...');
    const usuarios = await Usuario.find({}).select('-password').lean();
    fs.writeFileSync(
      path.join(exportFolder, 'usuarios.json'),
      JSON.stringify(usuarios, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${usuarios.length} usuarios exportados (sin contraseñas)`);
    totalDocumentos += usuarios.length;

    // Exportar Productos
    console.log('\n🍽️  Exportando Productos...');
    const productos = await Producto.find({}).lean();
    fs.writeFileSync(
      path.join(exportFolder, 'productos.json'),
      JSON.stringify(productos, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${productos.length} productos exportados`);
    totalDocumentos += productos.length;

    // Exportar Pedidos
    console.log('\n📋 Exportando Pedidos...');
    const pedidos = await Pedido.find({}).lean();
    fs.writeFileSync(
      path.join(exportFolder, 'pedidos.json'),
      JSON.stringify(pedidos, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${pedidos.length} pedidos exportados`);
    totalDocumentos += pedidos.length;

    // Crear archivo de información
    const info = {
      database: 'restobar_db',
      exportDate: new Date().toISOString(),
      mongodbUri: MONGODB_URI,
      collections: {
        reservas: reservas.length,
        mesas: mesas.length,
        usuarios: usuarios.length,
        productos: productos.length,
        pedidos: pedidos.length
      },
      totalDocuments: totalDocumentos
    };

    fs.writeFileSync(
      path.join(exportFolder, '_info.json'),
      JSON.stringify(info, null, 2),
      'utf8'
    );

    // Crear archivo README
    const readme = `# Backup de Base de Datos - RestoBar

**Fecha de exportación:** ${new Date().toLocaleString('es-AR')}
**Base de datos:** restobar_db
**Total de documentos:** ${totalDocumentos}

## Colecciones exportadas:

- **reservas.json** - ${reservas.length} reservas
- **mesas.json** - ${mesas.length} mesas
- **usuarios.json** - ${usuarios.length} usuarios (sin contraseñas)
- **productos.json** - ${productos.length} productos
- **pedidos.json** - ${pedidos.length} pedidos

## Cómo importar:

### Opción 1: MongoDB Compass
1. Abre MongoDB Compass
2. Conéctate a: \`mongodb://localhost:27017\`
3. Selecciona la base de datos \`restobar_db\`
4. Para cada colección:
   - Click en "Add Data" → "Import JSON"
   - Selecciona el archivo correspondiente

### Opción 2: mongoimport (comando)
\`\`\`bash
mongoimport --db restobar_db --collection reservas --file reservas.json --jsonArray
mongoimport --db restobar_db --collection mesas --file mesas.json --jsonArray
mongoimport --db restobar_db --collection usuarios --file usuarios.json --jsonArray
mongoimport --db restobar_db --collection productos --file productos.json --jsonArray
mongoimport --db restobar_db --collection pedidos --file pedidos.json --jsonArray
\`\`\`

### Opción 3: Script de importación
Ejecuta: \`node importar-db.js\`
`;

    fs.writeFileSync(
      path.join(exportFolder, 'README.md'),
      readme,
      'utf8'
    );

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ EXPORTACIÓN COMPLETADA\n');
    console.log(`📊 Resumen:`);
    console.log(`   • Reservas:  ${reservas.length}`);
    console.log(`   • Mesas:     ${mesas.length}`);
    console.log(`   • Usuarios:  ${usuarios.length}`);
    console.log(`   • Productos: ${productos.length}`);
    console.log(`   • Pedidos:   ${pedidos.length}`);
    console.log(`   • TOTAL:     ${totalDocumentos} documentos\n`);
    console.log(`📁 Ubicación: ${exportFolder}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Desconectar
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB\n');

  } catch (error) {
    console.error('\n❌ ERROR AL EXPORTAR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar exportación
exportarBaseDeDatos();

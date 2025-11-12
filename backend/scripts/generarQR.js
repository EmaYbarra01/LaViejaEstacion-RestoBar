/**
 * Script para generar códigos QR del menú digital
 * HU1 - Escanear menú digital
 * 
 * Uso:
 * node scripts/generarQR.js
 * 
 * El QR se guardará en backend/public/qr/menu-qr.png
 */

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const config = {
  // URL del menú (cambiar según el entorno)
  menuUrl: process.env.MENU_URL || 'http://localhost:5173/menu',
  
  // Directorio de salida
  outputDir: path.join(__dirname, '../public/qr'),
  
  // Nombre del archivo
  filename: 'menu-qr.png',
  
  // Opciones del QR
  qrOptions: {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 2,
    width: 500,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }
};

/**
 * Generar código QR
 */
async function generarQR() {
  try {
    console.log('🎯 Generando código QR para el menú digital...\n');
    
    // Crear directorio si no existe
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
      console.log(`📁 Directorio creado: ${config.outputDir}`);
    }
    
    const outputPath = path.join(config.outputDir, config.filename);
    
    // Generar QR
    await QRCode.toFile(outputPath, config.menuUrl, config.qrOptions);
    
    console.log('✅ ¡Código QR generado exitosamente!\n');
    console.log(`📍 URL del menú: ${config.menuUrl}`);
    console.log(`💾 Archivo guardado en: ${outputPath}`);
    console.log('\n📝 Instrucciones:');
    console.log('1. Imprimir el código QR generado');
    console.log('2. Colocar en las mesas del restaurante');
    console.log('3. Los clientes pueden escanearlo para ver el menú\n');
    
    // También generar QR con información adicional
    await generarQRConInfo();
    
  } catch (error) {
    console.error('❌ Error al generar código QR:', error);
    process.exit(1);
  }
}

/**
 * Generar QR con diseño personalizado (PNG con texto)
 */
async function generarQRConInfo() {
  const outputPath = path.join(config.outputDir, 'menu-qr-completo.png');
  
  await QRCode.toFile(outputPath, config.menuUrl, {
    ...config.qrOptions,
    width: 600
  });
  
  console.log(`✨ QR adicional generado: ${outputPath}`);
}

/**
 * Generar QR para diferentes mesas (opcional)
 */
async function generarQRPorMesa(numeroMesa) {
  const mesaUrl = `${config.menuUrl}?mesa=${numeroMesa}`;
  const filename = `menu-qr-mesa-${numeroMesa}.png`;
  const outputPath = path.join(config.outputDir, filename);
  
  await QRCode.toFile(outputPath, mesaUrl, config.qrOptions);
  
  console.log(`✅ QR generado para mesa ${numeroMesa}: ${outputPath}`);
}

/**
 * Generar QR en formato SVG (vector escalable)
 */
async function generarQRSVG() {
  const outputPath = path.join(config.outputDir, 'menu-qr.svg');
  
  const svgString = await QRCode.toString(config.menuUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  fs.writeFileSync(outputPath, svgString);
  console.log(`📊 QR en formato SVG generado: ${outputPath}`);
}

/**
 * Generar QRs para múltiples mesas
 */
async function generarQRsMultiples(cantidadMesas = 10) {
  console.log(`\n🍽️ Generando QR para ${cantidadMesas} mesas...\n`);
  
  for (let i = 1; i <= cantidadMesas; i++) {
    await generarQRPorMesa(i);
  }
  
  console.log(`\n✅ ${cantidadMesas} códigos QR generados exitosamente!`);
}

// Ejecutar
(async () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   GENERADOR DE QR - LA VIEJA ESTACIÓN      ║');
  console.log('║   Menú Digital - HU1                       ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  await generarQR();
  await generarQRSVG();
  
  // Descomentar para generar QR por mesa
  // await generarQRsMultiples(10);
  
  console.log('\n🎉 ¡Proceso completado!\n');
})();

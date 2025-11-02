const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema de Producto para La Vieja Estación - RestoBar
 * Gestiona el menú de productos del establecimiento (HU2, HU10, RF4)
 */

const productoSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    enum: ['Bebidas', 'Bebidas Alcohólicas', 'Comidas', 'Postres', 'Entradas', 'Guarniciones', 'Otro'],
    default: 'Otro'
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  costo: {
    type: Number,
    default: 0,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  stockMinimo: {
    type: Number,
    default: 0,
    min: 0
  },
  unidadMedida: {
    type: String,
    enum: ['Unidad', 'Kg', 'Litro', 'Gramo', 'Ml', 'Porción'],
    default: 'Unidad'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  imagenUrl: {
    type: String,
    default: '/images/productos/default.jpg'
  },
  codigo: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
productoSchema.index({ nombre: 1 });
productoSchema.index({ categoria: 1 });
productoSchema.index({ disponible: 1 });

// Virtual para calcular margen de ganancia
productoSchema.virtual('margen').get(function() {
  if (this.costo > 0) {
    return ((this.precio - this.costo) / this.costo * 100).toFixed(2);
  }
  return 0;
});

// Virtual para verificar si necesita reposición
productoSchema.virtual('necesitaReposicion').get(function() {
  return this.stock <= this.stockMinimo;
});

productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Producto', productoSchema);

// Exporta el modelo para usarlo en otros archivos
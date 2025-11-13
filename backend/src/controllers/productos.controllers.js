import Producto from "../models/productoSchema.js";

/**
 * Obtener todos los productos
 * GET /api/productos
 */
export const obtenerProductos = async (req, res) => {
  try {
    const { categoria, disponible, necesitaReposicion } = req.query;
    
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (disponible !== undefined) filtro.disponible = disponible === 'true';
    
    let productos = await Producto.find(filtro).sort({ nombre: 1 });
    
    // Filtrar productos que necesitan reposición
    if (necesitaReposicion === 'true') {
      productos = productos.filter(p => p.stock <= p.stockMinimo);
    }
    
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al obtener productos' 
    });
  }
};

/**
 * Obtener un producto por ID
 * GET /api/productos/:id
 */
export const obtenerUnProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }
    
    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener el producto"
    });
  }
};

/**
 * Crear un nuevo producto
 * POST /api/productos
 */
export const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    
    await nuevoProducto.save();
    
    res.status(201).json({
      mensaje: "Producto creado exitosamente",
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe un producto con ese código"
      });
    }
    
    res.status(500).json({
      mensaje: "Error interno del servidor al crear producto"
    });
  }
};

/**
 * Actualizar un producto
 * PUT /api/productos/:id
 */
export const actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!productoActualizado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }
    
    res.status(200).json({
      mensaje: "Producto actualizado correctamente",
      producto: productoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        mensaje: "Ya existe un producto con ese código"
      });
    }
    
    res.status(500).json({
      mensaje: "Error interno del servidor al actualizar producto"
    });
  }
};

/**
 * Eliminar un producto
 * DELETE /api/productos/:id
 */
export const eliminarProducto = async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    
    if (!productoEliminado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }
    
    res.status(200).json({
      mensaje: "Producto eliminado correctamente",
      producto: productoEliminado
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor al eliminar producto"
    });
  }
};

/**
 * Actualizar stock de un producto
 * PUT /api/productos/:id/stock
 */
export const actualizarStock = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body;
    
    if (!cantidad || !operacion) {
      return res.status(400).json({
        mensaje: "Cantidad y operación son requeridas"
      });
    }
    
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }
    
    if (operacion === 'sumar') {
      producto.stock += cantidad;
    } else if (operacion === 'restar') {
      if (producto.stock < cantidad) {
        return res.status(400).json({
          mensaje: "Stock insuficiente"
        });
      }
      producto.stock -= cantidad;
    } else {
      return res.status(400).json({
        mensaje: "Operación no válida. Use 'sumar' o 'restar'"
      });
    }
    
    await producto.save();
    
    res.status(200).json({
      mensaje: "Stock actualizado correctamente",
      producto
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Cambiar disponibilidad de un producto
 * PUT /api/productos/:id/disponibilidad
 */
export const cambiarDisponibilidad = async (req, res) => {
  try {
    const { disponible } = req.body;
    
    if (disponible === undefined) {
      return res.status(400).json({
        mensaje: "El campo disponible es requerido"
      });
    }
    
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { disponible },
      { new: true }
    );
    
    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }
    
    res.status(200).json({
      mensaje: `Producto ${disponible ? 'habilitado' : 'deshabilitado'} correctamente`,
      producto
    });
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener productos por categoría
 * GET /api/productos/categoria/:categoria
 */
export const obtenerProductosPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    
    const productos = await Producto.find({ 
      categoria, 
      disponible: true 
    }).sort({ nombre: 1 });
    
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener productos que necesitan reposición
 * GET /api/productos/reposicion
 */
export const obtenerProductosParaReposicion = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ stock: 1 });
    
    const productosReposicion = productos.filter(p => p.stock <= p.stockMinimo);
    
    res.status(200).json(productosReposicion);
  } catch (error) {
    console.error('Error al obtener productos para reposición:', error);
    res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};

/**
 * Obtener menú digital público (HU1)
 * GET /api/menu
 * Endpoint público para el código QR - No requiere autenticación
 */
export const obtenerMenuPublico = async (req, res) => {
  try {
    // Obtener todos los productos con su stock (no solo disponibles)
    // para que MenuPage.jsx pueda mostrar badges de disponibilidad
    const productos = await Producto.find({})
      .select('nombre descripcion categoria precio imagenUrl disponible stock')
      .sort({ categoria: 1, nombre: 1 });
    
    // Devolver array simple de productos
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener menú público:', error);
    res.status(500).json({
      mensaje: "Error al cargar el menú. Intente nuevamente."
    });
  }
};
import Product from "../models/productsSchema.js";

export const obtenerProductos = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      mensaje: "Error interno del servidor al obtener productos" 
    });
  }
};

export const obtenerUnProducto = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        mensaje: "El producto no fue encontrado"
      });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error interno del servidor al obtener el producto"
    });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json({
      mensaje: "El producto se creó correctamente",
      producto: nuevoProducto
    });
  } catch (error) {
    console.error(error);
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

export const actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!productoActualizado) {
      return res.status(404).json({
        mensaje: "El producto no fue encontrado"
      });
    }
    
    res.status(200).json({
      mensaje: "El producto se actualizó correctamente",
      producto: productoActualizado
    });
  } catch (error) {
    console.error(error);
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

export const eliminarProducto = async (req, res) => {
  try {
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    
    if (!productoEliminado) {
      return res.status(404).json({
        mensaje: "El producto no fue encontrado"
      });
    }
    
    res.status(200).json({
      mensaje: "El producto se eliminó correctamente",
      producto: productoEliminado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error interno del servidor al eliminar producto"
    });
  }
};
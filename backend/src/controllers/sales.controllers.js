import Sale from '../models/salesSchema.js';
import Product from '../models/productsSchema.js';
import User from '../models/usersSchema.js';

// Función helper para transformar el formato de las ventas
const transformSaleFormat = (sale) => {
    // Validar que sale y sus propiedades existan
    if (!sale) return null;
    
    return {
        id: sale._id.toString(),
        items: sale.items.map(item => {
            // Si el producto fue eliminado, mostrar información básica
            if (!item.productId) {
                return {
                    id: 'deleted',
                    name: 'Producto eliminado',
                    price: item.priceAtSale,
                    quantity: item.quantity
                };
            }
            return {
                id: item.productId._id.toString(),
                name: item.productId.name,
                price: item.priceAtSale,
                quantity: item.quantity
            };
        }),
        total: sale.total,
        customerInfo: {
            // Si el usuario fue eliminado, mostrar información por defecto
            name: sale.userId?.username || 'Usuario eliminado',
            email: sale.userId?.email || 'N/A'
        },
        date: sale.date
    };
};

// Obtener todas las ventas (solo administradores)
export const obtenerVentas = async (req, res) => {
    try {
        const sales = await Sale.find().populate('userId', 'username email').populate('items.productId', 'name');
        const transformedSales = sales.map(transformSaleFormat).filter(sale => sale !== null);
        res.status(200).json(transformedSales); // Devolver array directo para AdminSales
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener ventas' });
    }   
};

// Obtener ventas del usuario autenticado (usuarios normales)
export const obtenerVentasUsuario = async (req, res) => {
    try {
        // Obtener el userId del token JWT
        const userId = req.user?.id || req.id;
        
        if (!userId) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }

        const sales = await Sale.find({ userId })
            .populate('userId', 'username email')
            .populate('items.productId', 'name')
            .sort({ date: -1 }); // Ordenar por fecha descendente
            
        const transformedSales = sales.map(transformSaleFormat).filter(sale => sale !== null);
        res.status(200).json(transformedSales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener ventas del usuario' });
    }   
};

export const obtenerUnaVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const sale = await Sale.findById(id).populate('userId', 'username email').populate('items.productId', 'name');
        if (!sale) {
            return res.status(404).json({ mensaje: 'Venta no encontrada' });
        }
        const transformedSale = transformSaleFormat(sale);
        res.status(200).json(transformedSale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor al obtener la venta' });
    }
};
export const crearVenta = async (req, res) => {
    try {
        // Obtener el userId del token JWT (más seguro que confiar en el body)
        const userId = req.user?.id || req.id;
        
        if (!userId) {
            return res.status(401).json({ mensaje: 'Usuario no autenticado' });
        }
        
        const { items } = req.body;
        
        // Validar que se enviaron items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ mensaje: 'Debe enviar al menos un producto en la venta' });
        }
        
        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        let total = 0;
        const processedItems = [];
        
        // Procesar cada item
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ mensaje: `Producto ${item.productId} no encontrado` });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ mensaje: `Stock insuficiente para ${product.name}` });
            }
            
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            processedItems.push({
                productId: item.productId,
                quantity: item.quantity,
                priceAtSale: product.price // Guardar precio actual
            });
            
            // Actualizar stock
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }
        
        const newSale = new Sale({
            userId,
            items: processedItems,
            total
        });
        
        await newSale.save();
        
        // Retornar la venta con populate
        const saleWithDetails = await Sale.findById(newSale._id)
            .populate('userId', 'username email')
            .populate('items.productId', 'name');
            
        const transformedSale = transformSaleFormat(saleWithDetails);
            
        res.status(201).json({ 
            mensaje: 'Venta creada exitosamente', 
            sale: transformedSale 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error interno del servidor al crear la venta' });
    }   
};


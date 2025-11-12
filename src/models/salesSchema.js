import {Schema, model} from 'mongoose';

//creamos un esquema para las ventas. Cada venta tiene un userId que referencia al usuario que hizo la compra y un array de productos con sus cantidades.
//la otra forma es embebiendo los productos, pero asi evitamos duplicar datos.
//de esta forma, es parecido a como lo hicimos en SQL con las tablas intermedias.

const salesSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    items: [
        {
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true, min: 1},
            priceAtSale: {type: Number, required: true, min: 0} // Guardar el precio del producto en el momento de la venta
        }
    ],
    total: {type: Number, required: true, min: 0},
    date: {type: Date, default: Date.now},
});

const Sale = model('sales', salesSchema);

export default Sale;
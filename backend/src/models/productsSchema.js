import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  imgUrl: { type: String, required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: {type: String, required:true, default: "General"}
});

const Product = model('Product', productSchema);

export default Product;
// Exporta el modelo para usarlo en otros archivos
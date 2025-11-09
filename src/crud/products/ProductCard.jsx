import React from 'react';
import './ProductCard.css'; 
import { getAllProducts } from '../../helpers/queriesProductos';
import { useState, useEffect } from 'react';

const ProductCard = () => {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const productsData = await getAllProducts();
            setProducts(productsData);
        } catch (err) {
            console.error('Error loading products:', err);
        }
    };

    
    return (

        products.map(product => (
            <div className='card' key={product.id}>
                <img src={product.imgUrl} alt={product.name} />
                <h3>{product.name}</h3>
                <p>Codigo: {product.code}</p>
                <p>Precio: ${product.price}</p>
            </div>
        ))


    );
};

export default ProductCard;
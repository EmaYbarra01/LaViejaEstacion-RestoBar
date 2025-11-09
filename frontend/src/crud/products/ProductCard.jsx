import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="card h-100 shadow-lg">
            <img
                src={product.image || '/assets/sample-food.svg'}
                alt={product.name || 'Producto'}
                className="card-img-top rounded-top"
                style={{ height: '180px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
                <h3 className="card-title text-center fw-bold mb-2">{product.name || 'Producto'}</h3>
                {product.description && (
                    <p className="card-text text-center text-secondary mb-2">
                        {product.description}
                    </p>
                )}
                {product.preparation && (
                    <p className="card-text text-center mb-2">
                        <span className="fw-semibold">Preparación:</span> {product.preparation}
                    </p>
                )}
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-warning fs-5">
                        ${product.price || '-'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
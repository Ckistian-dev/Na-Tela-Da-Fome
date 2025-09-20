import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductList = ({ products, onProductSelect }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
                // AQUI: Passando a função para o card com o nome 'onSelect'
                <ProductCard 
                    key={product.ID} 
                    product={product} 
                    onSelect={() => onProductSelect(product)} 
                />
            ))}
        </div>
    );
};


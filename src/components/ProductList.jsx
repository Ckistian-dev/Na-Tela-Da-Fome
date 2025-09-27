import React from 'react';
import { ProductCard } from './ProductCard';

export const ProductList = ({ products, onProductSelect }) => {
    // CAMADA DE SEGURANÇA: Garante que a lista de produtos existe e não está vazia.
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Nenhum produto encontrado.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* CAMADA DE SEGURANÇA: Filtra novamente no frontend para garantir que cada produto tem um ID antes de o renderizar. */}
            {products
                .filter(product => product && product.ID)
                .map(product => (
                    <ProductCard 
                        key={product.ID} 
                        product={product} 
                        onSelect={() => onProductSelect(product)} 
                    />
                ))
            }
        </div>
    );
};


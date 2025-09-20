import React from 'react';
import { ShoppingCart } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const CartBar = ({ totalItems, totalPrice, onOpenCart }) => {
    const show = totalItems > 0;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-out ${show ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="max-w-7xl mx-auto p-4">
                <button 
                    onClick={onOpenCart} 
                    className="w-full bg-primary text-white rounded-lg shadow-lg p-4 flex items-center justify-between transform hover:scale-105 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart size={24} />
                            <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {totalItems}
                            </span>
                        </div>
                        <span className="font-semibold">Ver carrinho</span>
                    </div>
                    <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
                </button>
            </div>
        </div>
    );
};

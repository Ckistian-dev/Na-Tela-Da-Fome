import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const CartModal = ({ isOpen, onClose, cart, updateCartItemQuantity, onGoToCheckout }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div onClick={handleClose} className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end md:items-center justify-center ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            <div onClick={(e) => e.stopPropagation()} className={`bg-gray-50 w-full max-w-2xl max-h-[90vh] md:rounded-xl shadow-xl flex flex-col ${isClosing ? 'animate-slideOutDown md:animate-fadeOut' : 'animate-slideInUp md:animate-fadeIn'}`}>
                <div className="p-4 border-b flex justify-between items-center bg-white md:rounded-t-xl sticky top-0"><h2 className="text-xl font-bold text-gray-800">Meu Pedido</h2><button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button></div>
                {cart.items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8"><ShoppingCart size={48} className="text-gray-300 mb-4" /><h3 className="text-lg font-semibold text-gray-700">Seu carrinho está vazio</h3><p className="text-gray-500">Adicione itens para vê-los aqui.</p></div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                        {cart.items.map(item => (
                            <div key={item.cartId} className="bg-white p-3 rounded-lg shadow-sm flex gap-3">
                                <img src={item.product['URL Imagem']} alt={item.product.Nome} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                <div className="flex-1"><p className="font-bold text-gray-800 text-sm leading-tight">{item.product.Nome}</p><div className="text-xs text-gray-500 mt-1">{item.options.map(opt => (<p key={opt.ID} className="truncate">{opt.quantity}x {opt.Nome}</p>))}</div></div>
                                <div className="flex flex-col items-end justify-between"><p className="font-bold text-base text-primary whitespace-nowrap">{formatCurrency(item.totalPrice)}</p><div className="flex items-center gap-2 mt-2"><button onClick={() => updateCartItemQuantity(item.cartId, item.mainQuantity - 1)} className="p-1 rounded-full bg-gray-200"><Minus size={16} /></button><span className="font-bold text-base w-6 text-center">{item.mainQuantity}</span><button onClick={() => updateCartItemQuantity(item.cartId, item.mainQuantity + 1)} className="p-1 rounded-full bg-gray-200"><Plus size={16} /></button></div></div>
                            </div>
                        ))}
                    </div>
                )}
                {cart.items.length > 0 && (
                    <div className="p-4 border-t bg-white md:rounded-b-xl sticky bottom-0 shadow-top">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
                            {cart.discount > 0 && (<div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(cart.discount)}</span></div>)}
                            <div className="flex justify-between font-bold text-xl text-gray-800"><span>Total</span><span>{formatCurrency(cart.total)}</span></div>
                        </div>
                        <button onClick={onGoToCheckout} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover">Finalizar Pedido</button>
                    </div>
                )}
            </div>
        </div>
    );
};


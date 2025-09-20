import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus, ChevronDown } from 'lucide-react';

const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
    return isNaN(parseFloat(cleanedValue)) ? 0 : parseFloat(cleanedValue);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const OptionItem = ({ option, quantity, onAdd, onRemove, isDisabled }) => (
    <div className="flex items-center gap-3 py-2">
        <img src={option['URL Imagem']} alt={option.Nome} className="w-12 h-12 object-cover rounded-md flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/56x56/e2e8f0/adb5bd?text=Img` }} />
        <div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{option.Nome}</p>{parseCurrency(option.Preço) > 0 && (<p className="text-xs text-primary font-bold">{formatCurrency(parseCurrency(option.Preço))}</p>)}</div>
        <div className="flex items-center gap-2">{quantity > 0 && (<><button onClick={onRemove} className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"><Minus size={16} /></button><span className="font-bold text-base w-5 text-center">{quantity}</span></>)}<button onClick={onAdd} disabled={isDisabled} className="p-1 rounded-full bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300"><Plus size={16} /></button></div>
    </div>
);

export const ProductModal = ({ isOpen, onClose, product, addOns, onAddToCart }) => {
    const [mainQuantity, setMainQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [openGroup, setOpenGroup] = useState(null);

    const accompanimentGroups = useMemo(() => {
        if (!product?.Acompanhamentos || !addOns) return [];
        try {
            const groupNames = product.Acompanhamentos.split(',').map(g => g.trim());
            const minChoices = product.min.split(',').map(m => parseInt(m.trim(), 10));
            const maxChoices = product.max.split(',').map(m => parseInt(m.trim(), 10));
            return groupNames.map((name, i) => ({
                name, min: minChoices[i] || 0, max: maxChoices[i] || 1,
                options: addOns.filter(a => a.Grupo === name && a.Situação === 'Ativo')
            })).filter(g => g.options.length > 0);
        } catch { return []; }
    }, [product, addOns]);

    const hasAccompaniments = accompanimentGroups.length > 0;

    useEffect(() => {
        if (product) {
            setMainQuantity(1);
            setSelectedOptions({});
            setOpenGroup(null);
        }
    }, [product]);

    const handleOptionAdd = (group, option) => {
        const groupOptions = Object.values(selectedOptions).filter(opt => opt.data.Grupo === group.name);
        const currentGroupQuantity = groupOptions.reduce((sum, opt) => sum + opt.quantity, 0);
        if (currentGroupQuantity >= group.max) return;
        setSelectedOptions(prev => ({ ...prev, [option.ID]: { data: option, quantity: (prev[option.ID]?.quantity || 0) + 1 } }));
    };

    const handleOptionRemove = (option) => {
        setSelectedOptions(prev => {
            if (!prev[option.ID] || prev[option.ID].quantity <= 1) {
                const { [option.ID]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [option.ID]: { ...prev[option.ID], quantity: prev[option.ID].quantity - 1 } };
        });
    };
    
    const validationStatus = useMemo(() => {
        const status = {};
        accompanimentGroups.forEach(group => {
            const groupOptions = Object.values(selectedOptions).filter(opt => opt.data.Grupo === group.name);
            const totalQuantity = groupOptions.reduce((sum, opt) => sum + opt.quantity, 0);
            status[group.name] = { isValid: totalQuantity >= group.min, totalQuantity };
        });
        return status;
    }, [selectedOptions, accompanimentGroups]);

    const isOrderValid = useMemo(() => Object.values(validationStatus).every(s => s.isValid), [validationStatus]);

    const basePrice = product ? (parseCurrency(product.Preço) - parseCurrency(product.Desconto)) : 0;
    const optionsPrice = useMemo(() => {
        return Object.values(selectedOptions).reduce((total, opt) => total + (parseCurrency(opt.data.Preço) * opt.quantity), 0);
    }, [selectedOptions]);
    
    const finalMainQuantity = hasAccompaniments ? 1 : mainQuantity;
    const totalPrice = (basePrice + optionsPrice) * finalMainQuantity;

    // CORREÇÃO: Monta o objeto completo aqui
    const handleConfirmAddToCart = () => {
        const finalOptions = Object.values(selectedOptions).map(opt => ({
            ...opt.data,
            quantity: opt.quantity
        }));

        const cartItem = {
            product,
            mainQuantity: finalMainQuantity,
            options: finalOptions,
            totalPrice
        };
        
        onAddToCart(cartItem); // Envia um único objeto
        onClose();
    };

    if (!isOpen || !product) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div onClick={(e) => e.stopPropagation()} className="bg-gray-50 w-full max-w-2xl max-h-[95vh] rounded-xl shadow-xl flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 bg-white rounded-t-xl sticky top-0 z-10 border-b">
                        <div className="flex gap-4">
                            <img src={product['URL Imagem']} alt={product.Nome} className="w-24 h-24 object-cover rounded-lg"/>
                            <div><h2 className="text-xl font-bold text-gray-800">{product.Nome}</h2><p className="text-sm text-gray-600 mt-1">{product.Descrição}</p></div>
                        </div>
                    </div>
                    <div className="p-4 md:p-6 space-y-3">
                        {accompanimentGroups.map((group) => {
                            const { totalQuantity } = validationStatus[group.name];
                            const isOpen = openGroup === group.name;
                            return (
                                <div key={group.name} className="bg-white rounded-lg border">
                                    <button onClick={() => setOpenGroup(isOpen ? null : group.name)} className="w-full flex justify-between items-center p-4 text-left">
                                        <div><h3 className="text-base font-semibold text-gray-800">{group.name}</h3><p className="text-xs font-medium text-gray-500 mt-0.5">{group.min > 0 ? `Obrigatório • ` : 'Opcional • '}Selecione até {group.max}</p></div>
                                        <div className="flex items-center gap-4">{totalQuantity > 0 && <span className="font-bold text-primary">{totalQuantity}</span>}<ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /></div>
                                    </button>
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                                        <div className="px-4 pb-2 divide-y">
                                            {group.options.map(option => (
                                                <OptionItem key={option.ID} option={option} quantity={selectedOptions[option.ID]?.quantity || 0} onAdd={() => handleOptionAdd(group, option)} onRemove={() => handleOptionRemove(option)} isDisabled={totalQuantity >= group.max && !selectedOptions[option.ID]} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t bg-white rounded-b-xl flex-shrink-0 flex items-center gap-4 shadow-top">
                    {!hasAccompaniments && (<div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1"><button onClick={() => setMainQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-md"><Minus size={20} /></button><span className="font-bold text-lg w-10 text-center">{mainQuantity}</span><button onClick={() => setMainQuantity(q => q + 1)} className="p-2 rounded-md"><Plus size={20} /></button></div>)}
                    <button onClick={handleConfirmAddToCart} disabled={!isOrderValid} className="flex-1 bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover disabled:bg-gray-400">Adicionar ({formatCurrency(totalPrice)})</button>
                </div>
            </div>
        </div>
    );
};


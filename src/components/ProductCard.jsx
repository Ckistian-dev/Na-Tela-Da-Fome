import React from 'react';

const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleanedValue = value.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
  const number = parseFloat(cleanedValue);
  return isNaN(number) ? 0 : number;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const ProductCard = ({ product, onSelect }) => {
  const originalPrice = parseCurrency(product.Preço);
  const discountValue = parseCurrency(product.Desconto);
  const hasDiscount = discountValue > 0;
  const finalPrice = originalPrice - discountValue;
  const buttonText = product.Encomenda === 'Sim' ? 'Encomendar' : 'Adicionar';

  return (
    <div className="flex bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn">
      {product['URL Imagem'] && (
        <div className="w-32 h-auto md:w-32 flex-shrink-0">
          <img
            src={product['URL Imagem']}
            alt={product.Nome}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/128x128/e2e8f0/adb5bd?text=Imagem` }}
          />
        </div>
      )}
      <div className="flex-1 p-2 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base leading-tight">{product.Nome}</h3>
          <p className="text-gray-500 text-sm mt-1 mb-2 line-clamp-2">{product.Descrição}</p>
        </div>
        <div className="flex items-end justify-between mt-2">
          {/* AQUI ESTÁ A MUDANÇA: Usamos 'visibility' para ocultar sem quebrar o layout */}
          <div style={{ visibility: originalPrice > 0 ? 'visible' : 'hidden' }}>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-xs mr-2">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className="font-bold text-primary text-lg">
              {formatCurrency(finalPrice)}
            </span>
          </div>
          {/* FIM DA MUDANÇA */}
          <button 
            onClick={onSelect}
            className="bg-primary text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary-hover transform hover:scale-105 transition-all duration-200"
            aria-label={`${buttonText} ${product.Nome} ao carrinho`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};
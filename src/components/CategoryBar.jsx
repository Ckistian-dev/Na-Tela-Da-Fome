import React, { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

export const CategoryBar = ({ categories, activeCategory, onCategorySelect, onSearchClick }) => {
  const activeRef = useRef(null);

  // Efeito para centralizar a categoria ativa na barra
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeCategory]);

  return (
    <nav className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm shadow-sm py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4">
        {/* Botão de Busca (sem card) */}
        <button 
            onClick={onSearchClick}
            className="rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Buscar no cardápio"
        >
            <Search className="text-gray-700" size={22} />
        </button>

        {/* Lista de Categorias com Scroll */}
        <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                ref={isActive ? activeRef : null}
                onClick={() => onCategorySelect(category)}
                // Classes para o estilo de CARD com borda
                className={`
                  flex-shrink-0 py-2 px-5 rounded-lg text-sm font-bold border-2 transition-all duration-300 ease-in-out
                  ${isActive
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};


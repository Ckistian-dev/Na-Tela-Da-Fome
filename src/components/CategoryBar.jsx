import React from 'react';
import { Search } from 'lucide-react';

export const CategoryBar = ({ categories, activeCategory, onCategorySelect, onSearchClick }) => {
    return (
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-2">
                    {/* Lupa */}
                    <button 
                        onClick={onSearchClick}
                        className="p-3 rounded-lg hover:bg-gray-200 transition-colors"
                        aria-label="Buscar produto"
                    >
                        <Search className="text-gray-700" size={20} />
                    </button>

                    {/* Container das Categorias com scroll */}
                    <div className="flex-1 overflow-x-auto whitespace-nowrap py-2 custom-scrollbar">
                        <div className="flex items-center gap-2">
                            {categories.map(category => (
                                <button 
                                    key={category} 
                                    onClick={() => onCategorySelect(category)}
                                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border-2 ${
                                        activeCategory === category 
                                        ? 'bg-primary border-primary text-white shadow-md' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-primary/50'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


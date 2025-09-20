import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose, categories, onCategorySelect, onSearchSubmit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    // Função que aciona a animação antes de fechar
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300); // Duração da animação
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearchSubmit(searchTerm.trim());
        }
    };

    const handleCategoryClick = (category) => {
        onCategorySelect(category);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            onClick={handleClose} 
            className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl flex flex-col"
            >
                <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Buscar no Cardápio</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="O que você procura?"
                                className="w-full bg-gray-100 border-2 border-transparent rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:bg-primary-hover transition-colors">
                            <Search size={24} />
                        </button>
                    </form>
                    
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Navegue por categorias</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categories.map((category) => (
                                <button 
                                    key={category} 
                                    onClick={() => handleCategoryClick(category)}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-center font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-colors"
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


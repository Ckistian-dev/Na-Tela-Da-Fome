import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const Toast = ({ message, show, onHide }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onHide();
            }, 3000); // O toast desaparecerá após 3 segundos
            return () => clearTimeout(timer);
        }
    }, [show, onHide]);

    // Oculta o componente do DOM se não for para mostrar, evitando renderizações vazias.
    if (!show) {
        return null;
    }

    return (
        <div 
            className={`fixed top-5 right-5 z-50 transition-all duration-300 ${
                show ? 'animate-toastIn' : 'animate-toastOut'
            }`}
        >
            {/* ALTERAÇÃO AQUI: Trocamos bg-gray-800 por bg-primary */}
            <div className="flex items-center gap-3 bg-primary text-white py-3 px-5 rounded-lg shadow-lg">
                <CheckCircle size={20} />
                <p className="font-semibold text-sm">{message}</p>
            </div>
        </div>
    );
};


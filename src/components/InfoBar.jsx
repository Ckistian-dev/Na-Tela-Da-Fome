import React from 'react';
import { Megaphone } from 'lucide-react';

export const InfoBar = ({ text, color }) => {
  // Se não houver texto, o componente não é renderizado
  if (!text || text.trim() === '') {
    return null;
  }

  return (
    // Utiliza a cor passada via props para o fundo
    <div
      className="absolute top-0 left-0 w-full p-2 text-white z-10 animate-slideDown animate-delay-500"
      style={{ backgroundColor: color || '#333' }} // Usa a cor da prop ou um fallback
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-3 px-4">
        <Megaphone className="w-5 h-5 flex-shrink-0" />
        <p className="font-semibold text-sm text-center">{text}</p>
      </div>
    </div>
  );
};


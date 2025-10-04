import React, { useState, useEffect, useMemo } from 'react';
import { Instagram, MapPin } from 'lucide-react';

// Função mais flexível e tolerante a formatos variados de dia e hora
const checkIsOpen = (daysString, hoursString) => {
    if (!daysString || !hoursString) {
        return { isOpen: false, statusText: "Fechado" };
    }

    const dayMap = {
        'dom': 0, 'domingo': 0,
        'seg': 1, 'segunda': 1,
        'ter': 2, 'terça': 2, 'terca': 2,
        'qua': 3, 'quarta': 3,
        'qui': 4, 'quinta': 4,
        'sex': 5, 'sexta': 5,
        'sab': 6, 'sábado': 6, 'sabado': 6
    };

    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    try {
        // --- 1️⃣ NORMALIZA DIAS ---
        let daysNormalized = daysString
            .toLowerCase()
            .replace(/e/g, ',')
            .replace(/a\s+/g, 'a ')
            .replace(/\s+/g, ' ')
            .trim();

        // Suporte a intervalos tipo "Seg a Sex"
        let workingDays = [];

        const dayParts = daysNormalized.split(',');
        dayParts.forEach(part => {
            const rangeMatch = part.match(/(\w+)\s*a\s*(\w+)/);
            if (rangeMatch) {
                const start = dayMap[rangeMatch[1]];
                const end = dayMap[rangeMatch[2]];
                if (start !== undefined && end !== undefined) {
                    for (let d = start; d <= end; d++) workingDays.push(d);
                }
            } else {
                const day = dayMap[part.trim()];
                if (day !== undefined) workingDays.push(day);
            }
        });

        const isWorkingDay = workingDays.includes(currentDay);
        if (!isWorkingDay) return { isOpen: false, statusText: "Fechado" };

        // --- 2️⃣ NORMALIZA HORÁRIO ---
        // Remove textos tipo "das", "às", "as", "h", etc.
        let normalizedHours = hoursString
            .toLowerCase()
            .replace(/[^\d:\-–a\s]/g, '') // remove letras e símbolos extras
            .replace(/as|às|a/g, '-')
            .replace(/\s+/g, '')
            .replace(/–/g, '-');

        // Extrai números
        const match = normalizedHours.match(/(\d{1,2}[:.]?\d{0,2})\s*-\s*(\d{1,2}[:.]?\d{0,2})/);
        if (!match) throw new Error("Formato de horário inválido");

        const parseTime = t => {
            let [h, m] = t.replace('.', ':').split(':').map(Number);
            if (isNaN(h)) h = 0;
            if (isNaN(m)) m = 0;
            return h * 60 + m;
        };

        const startTimeInMinutes = parseTime(match[1]);
        const endTimeInMinutes = parseTime(match[2]);

        // --- 3️⃣ VERIFICA SE ESTÁ ABERTO ---
        const isWithinHours = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;

        return {
            isOpen: isWithinHours,
            statusText: isWithinHours ? "Aberto" : "Fechado"
        };

    } catch (error) {
        console.error("Erro ao processar horário de funcionamento:", error);
        return { isOpen: false, statusText: "Fechado" };
    }
};



// Componente para exibir o status (sem mostrar os dias da semana)
const StoreStatus = ({ days, hours }) => {
    // A lógica continua usando os 'days' para o cálculo
    const status = useMemo(() => checkIsOpen(days, hours), [days, hours]);

    return (
        <div className="flex items-center space-x-2 text-xs mt-1">
            <div className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-400' : 'bg-red-500'}`}></div>
            <span className="font-semibold">{status.statusText}</span>
            {/* ALTERAÇÃO AQUI: Removemos a exibição dos dias da semana */}
            <span className="text-white/80">• {hours}</span>
        </div>
    );
};

export const Header = ({ customizations }) => {
    const images = useMemo(() => {
        return [
            customizations['URL Imagem 1'],
            customizations['URL Imagem 2'],
            customizations['URL Imagem 3'],
        ].filter(url => url && url.trim() !== '');
    }, [customizations]);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length > 1) {
            const timer = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, images.length]);

    if (images.length === 0) {
        // Renderiza um placeholder caso não hajam imagens, para manter a estrutura
        return <div className="w-full h-56 md:h-72 bg-gray-200"></div>;
    }

    return (
        <header className="relative w-full h-56 md:h-72 overflow-hidden bg-gray-300">
            {images.map((url, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="absolute inset-0 p-4 flex justify-between items-end text-white text-shadow max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                    <img 
                        src={customizations['URL Logo']} 
                        alt="Logo" 
                        className="w-20 h-20 md:w-20 md:h-20 rounded-xl object-cover shadow-lg"
                    />
                    <div>
                        <h1 className="font-bold text-xl md:text-2xl">{customizations['Nome']}</h1>
                        <StoreStatus 
                            days={customizations['Dias da Semana']} 
                            hours={customizations['Horário Funcionamento']} 
                        />
                        <p className="text-xs md:text-sm text-white/90 mt-1 flex items-center space-x-1">
                            <MapPin size={12}/>
                            <span>{customizations['Localização']}</span>
                        </p>
                    </div>
                </div>

                <a 
                    href={customizations['Instagram']} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                    aria-label="Visite nosso Instagram"
                >
                    <Instagram size={28} />
                </a>
            </div>
        </header>
    );
};


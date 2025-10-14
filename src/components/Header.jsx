import React, { useState, useEffect, useMemo } from 'react';
import { Instagram, MapPin, Timer } from 'lucide-react';

// Função flexível e tolerante a formatos variados de dia e hora
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
        let daysNormalized = daysString.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+e\s+/g, ',').replace(/\s*a\s+/g, ' a ').replace(/\s+/g, ' ').trim();
        const workingDays = [];
        const dayParts = daysNormalized.split(',');

        dayParts.forEach(part => {
            const rangeMatch = part.trim().match(/\b(\w+)\b\s*a\s*\b(\w+)\b/);
            if (rangeMatch) {
                const start = dayMap[rangeMatch[1].trim()];
                const end = dayMap[rangeMatch[2].trim()];
                if (start !== undefined && end !== undefined) {
                    if (start <= end) {
                        for (let d = start; d <= end; d++) workingDays.push(d);
                    } else {
                        for (let d = start; d <= 6; d++) workingDays.push(d);
                        for (let d = 0; d <= end; d++) workingDays.push(d);
                    }
                }
            } else {
                const day = dayMap[part.trim()];
                if (day !== undefined) workingDays.push(day);
            }
        });

        const isWorkingDay = workingDays.includes(currentDay);
        if (!isWorkingDay) {
            return { isOpen: false, statusText: "Fechado" };
        }

        let normalizedHours = hoursString.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/h/g, ':').replace(/as|a|às|ate|ate/g, '-').replace(/[^\d:,\-–]/g, '').replace(/–/g, '-').replace(/\s+/g, '');
        const intervals = normalizedHours.split(',').map(i => i.trim()).filter(Boolean);

        const parseTime = t => {
            let [h, m] = t.split(':').map(Number);
            if (isNaN(h)) h = 0;
            if (isNaN(m)) m = 0;
            return h * 60 + m;
        };

        let isWithinHours = false;
        for (const interval of intervals) {
            const [start, end] = interval.split('-').map(s => s.trim());
            if (!start || !end) continue;

            const startMins = parseTime(start);
            const endMins = parseTime(end);

            if (endMins < startMins) {
                if (currentTimeInMinutes >= startMins || currentTimeInMinutes <= endMins) {
                    isWithinHours = true;
                    break;
                }
            } else {
                if (currentTimeInMinutes >= startMins && currentTimeInMinutes <= endMins) {
                    isWithinHours = true;
                    break;
                }
            }
        }
        return {
            isOpen: isWithinHours,
            statusText: isWithinHours ? "Aberto" : "Fechado"
        };
    } catch (error) {
        console.error("ERRO CRÍTICO ao processar horário:", error);
        return { isOpen: false, statusText: "Fechado" };
    }
};

const StoreStatus = ({ days, hours, deliveryTime }) => {
    const status = useMemo(() => checkIsOpen(days, hours), [days, hours]);

    return (
        <div className="flex items-center flex-wrap space-x-2 text-xs mt-1">
            <div className="flex items-center space-x-2">
                <div
                    className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-green-400' : 'bg-red-500'
                        }`}
                ></div>
                <span className="font-semibold">
                    {status.statusText}
                </span>
                <span className="text-white/80">
                    • {hours || 'Horário indisponível'}
                </span>
            </div>

            {deliveryTime && (
                <div className="flex items-center space-x-2">
                    <span className="text-white/80">•</span>
                    <span className="text-white/80 flex items-center gap-1">
                        <Timer size={12} />
                        {deliveryTime}
                    </span>
                </div>
            )}
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

    if (!customizations) {
        return <div className="w-full h-56 md:h-72 bg-gray-200 animate-pulse"></div>;
    }

    return (
        <header className="relative w-full h-56 md:h-72 overflow-hidden bg-gray-300">
            {images.length > 0 ? images.map((url, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}>
                    <img src={url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                </div>
            )) : <div className="w-full h-full bg-gray-300"></div>}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            <div className="absolute inset-0 p-4 flex justify-between items-end text-white text-shadow max-w-7xl mx-auto">
                <div className="flex items-center space-x-4">
                    <img
                        src={customizations['URL Logo']}
                        alt="Logo"
                        className="w-20 h-20 md:w-20 md:h-20 rounded-xl object-cover shadow-lg"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/80x80/e2e8f0/adb5bd?text=Logo` }}
                    />
                    <div>
                        <h1 className="font-bold text-xl md:text-2xl">{customizations['Nome']}</h1>
                        <StoreStatus
                            days={customizations['Dias da Semana']}
                            hours={customizations['Horário Funcionamento']}
                            deliveryTime={customizations['Tempo de entrega']}
                        />
                        <p className="text-xs md:text-sm text-white/90 mt-1 flex items-center space-x-1">
                            <MapPin size={12} />
                            <span>{customizations['Localização']}</span>
                        </p>
                    </div>
                </div>

                {customizations['Instagram'] && (
                    <a
                        href={customizations['Instagram']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform"
                        aria-label="Visite nosso Instagram"
                    >
                        <Instagram size={28} />
                    </a>
                )}
            </div>
        </header>
    );
};

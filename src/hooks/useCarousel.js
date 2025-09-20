import React from 'react';

export const useCarousel = (totalSlides, interval = 5000) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    
    React.useEffect(() => {
        // Garante que só executa se houver slides para girar
        if (totalSlides > 1) {
            const slideInterval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % totalSlides);
            }, interval);
            // Limpa o intervalo quando o componente é desmontado
            return () => clearInterval(slideInterval);
        }
    }, [totalSlides, interval]);

    return currentSlide;
};

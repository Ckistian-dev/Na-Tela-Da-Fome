import React from 'react';

export const Footer = ({ restaurantName }) => {
    const currentYear = new Date().getFullYear();

    return (
        // ATUALIZAÇÃO: Trocado bg-gray-100 por bg-primary
        <footer className="bg-primary mt-auto w-full">
            {/* ATUALIZAÇÃO: Cores de texto ajustadas para branco com opacidade */}
            <div className="max-w-7xl mx-auto py-6 px-4 text-center text-white/80">
                <p className="text-sm">
                    Desenvolvido por{' '}
                    <a 
                        href="https://ckistian-programando-solucoes.vercel.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        // ATUALIZAÇÃO: Estilo do link ajustado para o fundo escuro
                        className="font-bold text-white hover:underline"
                    >
                        Ckistian Programando Soluções
                    </a>
                </p>
                <p className="text-xs mt-2 text-white/60">
                    &copy; {currentYear} {restaurantName}. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
};


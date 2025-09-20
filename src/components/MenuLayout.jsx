import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ProductCard } from './ProductCard';

export const MenuLayout = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('');
  const sectionsRef = useRef({});
  const sidebarRef = useRef(null);

  // Agrupa os produtos por categoria
  const categories = useMemo(() => {
    return products.reduce((acc, product) => {
      const category = product.Categoria;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  const categoryNames = Object.keys(categories);

  useEffect(() => {
    if (categoryNames.length > 0) {
      setActiveCategory(categoryNames[0]);
    }
  }, [categoryNames]);

  // Efeito para observar qual seção está visível (Scrollspy)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px' } // Ativa quando a seção está no meio da tela
    );

    Object.values(sectionsRef.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      Object.values(sectionsRef.current).forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [categories]);

  const handleCategoryClick = (categoryName) => {
    sectionsRef.current[categoryName]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <main className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Categorias (Esquerda) */}
        <aside ref={sidebarRef} className="md:w-1/4">
          <div className="sticky top-6 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Categorias</h2>
            <ul className="space-y-2">
              {categoryNames.map(name => (
                <li key={name}>
                  <button
                    onClick={() => handleCategoryClick(name)}
                    className={`w-full text-left px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
                      activeCategory === name
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Lista de Produtos (Direita) */}
        <div className="w-full md:w-3/4">
          {categoryNames.map(name => (
            <section
              key={name}
              id={name}
              ref={el => (sectionsRef.current[name] = el)}
              className="mb-12 scroll-mt-6"
            >
              <h2 className="text-2xl font-extrabold text-gray-800 mb-6 border-l-4 border-primary pl-3">{name}</h2>
              <div className="space-y-4">
                {categories[name].map(product => (
                  <ProductCard key={product.ID} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { fetchRestaurantData } from './services/gSheetParser';
import { InfoBar } from './components/InfoBar';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { SearchModal } from './components/SearchModal';
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { CartBar } from './components/CartBar';
import { CartModal } from './components/CartModal';
import { CheckoutForm } from './components/CheckoutForm';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
    return isNaN(parseFloat(cleanedValue)) ? 0 : parseFloat(cleanedValue);
};

const useCart = () => {
    const [items, setItems] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const addItem = (newItem) => { const optionsId = newItem.options.map(opt => `${opt.ID}x${opt.quantity}`).sort().join('_'); const uniqueId = `${newItem.product.ID}_${optionsId}`; const existingItem = items.find(item => item.uniqueId === uniqueId); if (existingItem) { updateItemQuantity(existingItem.cartId, existingItem.mainQuantity + newItem.mainQuantity); } else { setItems(prev => [...prev, { ...newItem, uniqueId, cartId: Date.now() }]); } };
    const updateItemQuantity = (cartId, newQuantity) => { setItems(prev => { if (newQuantity <= 0) return prev.filter(item => item.cartId !== cartId); return prev.map(item => { if (item.cartId === cartId) { const basePrice = parseCurrency(item.product.Preço) - parseCurrency(item.product.Desconto); const optionsPrice = item.options.reduce((total, opt) => total + (parseCurrency(opt.Preço) * opt.quantity), 0); return { ...item, mainQuantity: newQuantity, totalPrice: (basePrice + optionsPrice) * newQuantity }; } return item; }); }); };
    const applyCoupon = (couponCode, availableCoupons) => { const foundCoupon = availableCoupons.find(c => c['Código'] === couponCode); if (foundCoupon) { setCoupon(foundCoupon); return true; } setCoupon(null); return false; };
    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);
    const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.mainQuantity, 0), [items]);
    const discount = useMemo(() => { if (!coupon || subtotal === 0) return 0; const couponValue = parseCurrency(coupon.Valor); if (couponValue > 0 && couponValue < 1) { return subtotal * couponValue; } return Math.min(subtotal, couponValue); }, [coupon, subtotal]);
    const total = useMemo(() => subtotal - discount, [subtotal, discount]);
    return { items, addItem, updateItemQuantity, subtotal, totalItems, applyCoupon, discount, total, coupon };
};

function App() {
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState('menu');
  const [toast, setToast] = useState({ show: false, message: '' });
  const cart = useCart();

  const showToast = (message) => { setToast({ show: true, message }); };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const slug = window.location.pathname.replace('/', '') || 'ruachdelivery';
        const data = await fetchRestaurantData(slug);
        setRestaurantData(data);
        const primaryColor = data.customizations['Cor Principal'] || '#000000';
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        const hoverColor = primaryColor.length === 7 ? `${primaryColor}CC` : `${primaryColor.slice(0, 7)}CC`;
        document.documentElement.style.setProperty('--primary-hover-color', hoverColor);
      } catch (err) { setError(err.message || 'Falha ao carregar os dados.'); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const categories = useMemo(() => { if (!restaurantData) return []; const allCategories = restaurantData.products.filter(p => p.Situação === 'Ativo').map(p => p.Categoria); return [...new Set(allCategories)]; }, [restaurantData]);
  const allActiveProducts = useMemo(() => restaurantData ? restaurantData.products.filter(p => p.Situação === 'Ativo') : [], [restaurantData]);
  const displayedProducts = useMemo(() => { if (searchQuery) { const lowercasedQuery = searchQuery.toLowerCase(); return allActiveProducts.filter(p => p.Nome.toLowerCase().includes(lowercasedQuery) || p.Descrição.toLowerCase().includes(lowercasedQuery)); } if (activeCategory) return allActiveProducts.filter(product => product.Categoria === activeCategory); return []; }, [searchQuery, activeCategory, allActiveProducts]);

  const handleCategorySelect = (category) => {
    setSearchQuery('');
    setActiveCategory(prevActive => prevActive === category ? null : category);
    setIsSearchOpen(false);
  };
  
  const handleSearchSubmit = (term) => { setSearchQuery(term); setActiveCategory(null); setIsSearchOpen(false); };
  
  const isPreOrderInCart = useMemo(() => 
    cart.items.some(item => item.product.Encomenda === 'Sim'),
    [cart.items]
  );
  
  const renderContent = () => {
    if (searchQuery) { return (<div className="max-w-7xl mx-auto p-4"><div className="flex items-center gap-3 mb-6"><div className="w-1.5 h-7 bg-primary rounded-full"></div><h2 className="text-2xl font-bold text-gray-800">Resultados para "{searchQuery}"</h2></div><ProductList products={displayedProducts} onProductSelect={(p) => setSelectedProduct(p)} /></div>); }
    if (activeCategory) { return (<div className="max-w-7xl mx-auto p-4"><div className="flex items-center gap-3 mb-6"><div className="w-1.5 h-7 bg-primary rounded-full"></div><h2 className="text-2xl font-bold text-gray-800">{activeCategory}</h2></div><ProductList products={displayedProducts} onProductSelect={(p) => setSelectedProduct(p)} /></div>); }
    return (
      <div className="max-w-7xl mx-auto p-4 space-y-10">
        {categories.map(category => {
          const productsForCategory = allActiveProducts.filter(p => p.Categoria === category);
          return (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6"><div className="w-1.5 h-7 bg-primary rounded-full"></div><h2 className="text-2xl font-bold text-gray-800">{category}</h2></div>
              <ProductList products={productsForCategory} onProductSelect={(p) => setSelectedProduct(p)} />
            </div>
          );
        })}
      </div>
    );
  };
  
  if (loading) return <div className="w-full h-screen bg-gray-200 animate-pulse"></div>;
  if (error) return <div className="bg-red-500 p-4 text-white text-center"><p><strong>Erro:</strong> {error}</p></div>;

  const customizations = restaurantData?.customizations;
  const logoUrl = customizations?.['URL Logo'] || 'https://i.ibb.co/gZJHQ96G/Gemini-Generated-Image-9ttzu89ttzu89ttz.png';
  const companyName = customizations?.['Nome'] || 'Cardápio Digital';

  return (
    <>
      <Helmet>
        <title>{`${companyName} | Cardápio Digital`}</title>
        <meta name="description" content={`Confira o cardápio digital completo de ${companyName}! Faça seu pedido online de forma rápida e segura.`} />
        <link rel="icon" type="image/png" href={logoUrl} />
        <link rel="apple-touch-icon" href={logoUrl} />
        <meta property="og:title" content={`${companyName} | Nosso Cardápio Digital`} />
        <meta property="og:description" content="Clique no link para ver nossas delícias e fazer seu pedido online de forma fácil e rápida." />
        <meta property="og:image" content={logoUrl} />
        <meta property="og:site_name" content={companyName} />
        <meta name="twitter:title" content={`${companyName} | Nosso Cardápio Digital`} />
        <meta name="twitter:image" content={logoUrl} />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <div className="bg-gray-50">
            <div className="relative"><Header customizations={restaurantData.customizations} /><InfoBar text={restaurantData.customizations['Informações Importantes']} color={restaurantData.customizations['Cor Principal']} /></div>
            <main>
              {view === 'menu' ? (
                <>
                  <CategoryBar categories={categories} activeCategory={activeCategory} onCategorySelect={handleCategorySelect} onSearchClick={() => setIsSearchOpen(true)} />
                  {renderContent()}
                </>
              ) : (
                <CheckoutForm 
                  cart={cart} 
                  onBackToMenu={() => setView('menu')} 
                  restaurantData={restaurantData} 
                  showToast={showToast}
                  isPreOrderInCart={isPreOrderInCart}
                />
              )}
            </main>
          </div>
        </div>
        <Footer restaurantName={restaurantData?.customizations?.Nome || 'Cardápio Digital'} />
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} categories={categories} onCategorySelect={handleCategorySelect} onSearchSubmit={handleSearchSubmit} />
      <ProductModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} addOns={restaurantData?.addOns} onAddToCart={cart.addItem} />
      {view === 'menu' && <CartBar totalItems={cart.totalItems} totalPrice={cart.total} onOpenCart={() => setIsCartOpen(true)} />}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} updateCartItemQuantity={cart.updateItemQuantity} onGoToCheckout={() => { setIsCartOpen(false); setView('checkout'); }} />
      <Toast message={toast.message} show={toast.show} onHide={() => setToast({ ...toast, show: false })} />
    </>
  );
}

export default App;


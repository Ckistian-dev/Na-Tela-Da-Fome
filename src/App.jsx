import React from 'react';
import { Outlet } from 'react-router-dom';

// Componentes de Layout temporários
const Navbar = () => {
  return <nav className="bg-surface/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 p-4 text-center">Navbar</nav>;
};

const Footer = () => {
  return <footer className="bg-surface p-4 text-center mt-auto">Footer</footer>;
};


function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        {/* O Outlet renderiza o componente da rota filha correspondente */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;

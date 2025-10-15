// Exemplo de um componente de página da loja: src/pages/StorePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar'; // Seu componente de Navbar
import ProductList from '../components/ProductList'; // O resto da sua página

// Função de exemplo para buscar dados da sua API/planilha
const fetchStoreDataBySlug = async (slug) => {
  // ATENÇÃO: Substitua esta lógica pela sua chamada de API real.
  // Aqui, estamos simulando a busca.
  console.log(`Buscando dados para: ${slug}`);
  // A sua API receberia "summerice" e retornaria os dados correspondentes.
  const response = await fetch(`httpsa://sua-api.com/loja/${slug}`); 
  if (!response.ok) {
    throw new Error('Loja não encontrada');
  }
  const data = await response.json(); 
  // Supondo que a API retorna um objeto com os dados da loja, incluindo a "URL Logo".
  return data; 
};


const StorePage = () => {
  const { storeSlug } = useParams(); // Pega "summerice" da URL "/summerice"
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        // Aqui você chamaria sua função que busca na planilha pelo slug
        const data = await fetchStoreDataBySlug(storeSlug); 
        setStoreInfo(data);
      } catch (err) {
        setError('Não foi possível carregar os dados da loja.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStoreData();
  }, [storeSlug]); // Executa sempre que o slug da loja mudar na URL

  if (loading) {
    return <div>Carregando Cardápio...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Se não encontrou dados, mostra uma mensagem
  if (!storeInfo) {
    return <div>Loja não encontrada.</div>;
  }
  
  // Dados da loja que vieram da sua planilha/API
  const { nomeDaLoja, urlLogo, descricao } = storeInfo;

  return (
    <>
      {/* ========================================================== */}
      {/* AQUI ESTÁ A MÁGICA: Atualizando o <head> dinamicamente */}
      {/* ========================================================== */}
      <Helmet>
        <title>{`${nomeDaLoja} | Cardápio Digital`}</title>
        <meta name="description" content={`Confira o cardápio digital de ${nomeDaLoja}. ${descricao}`} />
        
        {/* Ícones (Favicon) */}
        <link rel="icon" type="image/png" href={urlLogo} />
        <link rel="apple-touch-icon" href={urlLogo} />

        {/* Tags para compartilhamento (WhatsApp, Facebook, etc) */}
        <meta property="og:title" content={`${nomeDaLoja} | Nosso Cardápio Digital`} />
        <meta property="og:image" content={urlLogo} />
        <meta name="twitter:image" content={urlLogo} />
      </Helmet>

      {/* Passando o logo para o Navbar */}
      <Navbar logoUrl={urlLogo} /> 

      {/* O resto da sua página */}
      <div className="container">
        <h1>{nomeDaLoja}</h1>
        <ProductList />
      </div>
    </>
  );
};

export default StorePage;
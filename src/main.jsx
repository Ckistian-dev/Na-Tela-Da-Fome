// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Seu componente principal da aplicação
import { HelmetProvider } from 'react-helmet-async'; // Importe o provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolva sua aplicação com o HelmetProvider */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
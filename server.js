import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiHandler from './api/index.js';

const app = express();
const PORT = 3001;

app.use(cors());
// Adiciona o middleware para processar JSON no corpo das requisições POST
app.use(express.json());

// A "ponte" para o nosso ficheiro de API. Todas as requisições para /api serão tratadas aqui.
app.use('/api', apiHandler);

app.listen(PORT, () => {
  console.log(`Servidor da API rodando em http://localhost:${PORT}`);
});


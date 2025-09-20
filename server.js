import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sheetDataRouter from './api/sheetData.js';
import submitOrderRouter from './api/submitOrder.js'; // Importa o novo roteador

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rota para buscar dados
app.use('/api/sheetData', sheetDataRouter);
// Rota para salvar pedidos
app.use('/api/submitOrder', submitOrderRouter);

app.listen(PORT, () => {
  console.log(`Servidor da API rodando em http://localhost:${PORT}`);
});


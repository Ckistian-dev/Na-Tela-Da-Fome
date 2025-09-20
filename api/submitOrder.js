import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Credenciais do Google não encontradas no .env");
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const rowsToObjects = (rows) => {
    if (!rows || rows.length < 2) return [];
    const header = rows[0];
    const data = rows.slice(1);
    return data.map(row => {
        const obj = {};
        header.forEach((key, index) => { obj[key] = row[index] || ''; });
        return obj;
    });
};

router.post('/', async (req, res) => {
    const { orderData, slug } = req.body;
    if (!orderData || !slug) return res.status(400).json({ error: 'Dados do pedido ou slug faltando.' });

    try {
        const masterSheetResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.MASTER_SHEET_ID,
            range: 'Página1',
        });
        const companies = rowsToObjects(masterSheetResponse.data.values);
        const companyInfo = companies.find(c => c['URL Empresa'] === slug);
        if (!companyInfo || !companyInfo['Link Planilha']) return res.status(404).json({ error: `Empresa '${slug}' não encontrada.` });
        
        const restaurantSheetId = companyInfo['Link Planilha'];
        const now = new Date();
        const formattedDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const orderId = `PED-${now.getTime()}`;

        const itemsString = orderData.cart.map(item => {
            let itemStr = `${item.mainQuantity}x ${item.product.Nome}`;
            if (item.options.length > 0) {
                const optionsStr = item.options.map(opt => `${opt.quantity}x ${opt.Nome}`).join(', ');
                itemStr += ` (${optionsStr})`;
            }
            return itemStr;
        }).join(' | ');
        
        const newRow = [
            orderId, formattedDate, orderData.customerName,
            orderData.deliveryType === 'pickup' ? 'Retirada' : 'Entrega',
            orderData.address || '', orderData.observations || '',
            orderData.paymentMethod, '', // Troco Para
            itemsString, orderData.subtotal, orderData.deliveryFee,
            orderData.coupon || '', // Salva o código do cupom
            orderData.total, 'Novo',
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: restaurantSheetId,
            range: 'Pedidos!A:N',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [newRow] },
        });

        res.status(200).json({ success: true, message: 'Pedido salvo!', orderId });
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        res.status(500).json({ error: 'Falha ao salvar o pedido.' });
    }
});

export default router;


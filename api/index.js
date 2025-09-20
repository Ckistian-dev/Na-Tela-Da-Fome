import { google } from 'googleapis';

const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace('R$', '').trim().replace(',', '.');
    return isNaN(parseFloat(cleanedValue)) ? 0 : parseFloat(cleanedValue);
};

// Helper function para converter linhas em objectos
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

// Configuração da autenticação
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// A função principal que a Vercel irá executar
export default async function handler(req, res) {
    
    if (req.method === 'GET') {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'Slug da empresa é obrigatório.' });

        try {
            const masterSheet = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.MASTER_SHEET_ID, range: 'Empresas',
            });
            const companies = rowsToObjects(masterSheet.data.values);
            const companyInfo = companies.find(c => c['URL Empresa'] === slug);
            if (!companyInfo || !companyInfo['Link Planilha']) return res.status(404).json({ error: `Empresa '${slug}' não encontrada.` });
            const restaurantSheetId = companyInfo['Link Planilha'];

            const ranges = ['Produtos', 'Acompanhamentos', 'Cupons', 'Customizações'];
            const response = await sheets.spreadsheets.values.batchGet({ spreadsheetId: restaurantSheetId, ranges });
            const [productsRows, addOnsRows, couponsRows, customizationsRows] = response.data.valueRanges.map(r => r.values);

            const customizationsObject = (customizationsRows || []).filter((row, index) => index > 0 && row && row[0]).reduce((obj, row) => { obj[row[0]] = row[1] || ''; return obj; }, {});

            const data = { products: rowsToObjects(productsRows), addOns: rowsToObjects(addOnsRows), coupons: rowsToObjects(couponsRows), customizations: customizationsObject };
            return res.status(200).json(data);
        } catch (error) {
            console.error('GET Error:', error);
            return res.status(500).json({ error: 'Falha ao buscar dados do cardápio.' });
        }
    }

    if (req.method === 'POST') {
        const { orderData, slug } = req.body;
        if (!orderData || !slug) return res.status(400).json({ error: 'Dados do pedido ou slug faltando.' });
        
        try {
            const masterSheet = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.MASTER_SHEET_ID, range: 'Página1' });
            const companies = rowsToObjects(masterSheet.data.values);
            const companyInfo = companies.find(c => c['URL Empresa'] === slug);
            if (!companyInfo || !companyInfo['Link Planilha']) return res.status(404).json({ error: `Empresa '${slug}' não encontrada.` });
            
            const restaurantSheetId = companyInfo['Link Planilha'];
            const now = new Date();
            const formattedDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            const orderId = `PED-${now.getTime()}`;

            const itemsString = orderData.cart.map(item => {
                let itemStr = `${item.mainQuantity}x ${item.product.Nome}`;
                if (item.options.length > 0) itemStr += ` (${item.options.map(o => `${o.quantity}x ${o.Nome}`).join(', ')})`;
                return itemStr;
            }).join(' | ');
            
            const paymentMethodMap = { credit: 'Cartão de Crédito', debit: 'Cartão de Débito', pix: 'PIX', cash: 'Dinheiro' };
            const translatedPaymentMethod = paymentMethodMap[orderData.paymentMethod] || orderData.paymentMethod;

            const newRow = [
                orderId, formattedDate, orderData.customerName,
                orderData.deliveryType === 'pickup' ? 'Retirada' : 'Entrega',
                orderData.address || '', orderData.observations || '',
                translatedPaymentMethod, '', itemsString, orderData.subtotal,
                orderData.deliveryFee, orderData.coupon || '', orderData.total, 'Novo',
            ];

            await sheets.spreadsheets.values.append({
                spreadsheetId: restaurantSheetId, range: 'Pedidos!A:N',
                valueInputOption: 'USER_ENTERED', requestBody: { values: [newRow] },
            });

            return res.status(200).json({ success: true, message: 'Pedido salvo com sucesso!' });
        } catch (error) {
            console.error('POST Error:', error);
            return res.status(500).json({ error: 'Falha ao salvar o pedido.' });
        }
    }
    
    return res.status(405).json({ error: 'Método não permitido.' });
}
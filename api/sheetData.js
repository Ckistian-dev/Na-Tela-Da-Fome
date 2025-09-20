import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

const rowsToObjects = (rows) => {
    if (!rows || rows.length < 2) return [];
    const filteredRows = rows.filter(row => row && row.some(cell => cell && cell.trim() !== ''));
    if (filteredRows.length < 2) return [];
    const header = filteredRows[0];
    const data = filteredRows.slice(1);
    return data.map(row => {
        const obj = {};
        header.forEach((key, index) => { obj[key] = row[index] || ''; });
        return obj;
    });
};

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Variáveis de ambiente do Google não encontradas. Verifique seu .env");
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

router.get('/', async (req, res) => {
    const companySlug = req.query.slug;
    if (!companySlug) return res.status(400).json({ error: 'Company slug is required' });

    try {
        const masterSheetResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.MASTER_SHEET_ID,
            range: 'Página1',
        });
        const companies = rowsToObjects(masterSheetResponse.data.values);
        const companyInfo = companies.find(c => c['URL Empresa'] === companySlug);

        if (!companyInfo || !companyInfo['Link Planilha']) {
            return res.status(404).json({ error: `Company '${companySlug}' not found.` });
        }
        const restaurantSheetId = companyInfo['Link Planilha'];

        const ranges = ['Produtos', 'Acompanhamentos', 'Cupons', 'Customizações'];
        const requests = ranges.map(range => sheets.spreadsheets.values.get({ spreadsheetId: restaurantSheetId, range }));
        const responses = await Promise.all(requests);
        const [productsRows, addOnsRows, couponsRows, customizationsRows] = responses.map(r => r.data.values);

        const customizationsObject = (customizationsRows || [])
            .filter((row, index) => index > 0 && row && row[0] && row[0].trim() !== '')
            .reduce((obj, row) => {
                const key = row[0];
                const value = row[1] || '';
                if (key) obj[key] = value;
                return obj;
            }, {});

        const data = {
            products: rowsToObjects(productsRows),
            addOns: rowsToObjects(addOnsRows),
            coupons: rowsToObjects(couponsRows),
            customizations: customizationsObject,
        };

        res.status(200).json(data);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from Google Sheets.', details: error.message });
    }
});

export default router;


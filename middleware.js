// Este ficheiro deve ser criado na raiz do seu projeto (ao mesmo nível que 'src' e 'public')

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  console.log(`[Middleware] A analisar o caminho: ${pathname}`);

  // Ignorar pedidos para a API, ficheiros estáticos e assets de desenvolvimento do Vite
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/src/') ||
    pathname.startsWith('/@vite/') ||
    pathname.startsWith('/@react-refresh') ||
    pathname.includes('.')
  ) {
    console.log(`[Middleware] A ignorar o caminho: ${pathname}`);
    // Simplesmente retornamos para deixar o pedido continuar sem modificação
    return;
  }

  console.log(`[Middleware] A processar o caminho: ${pathname}`);

  const slug = pathname.replace(/^\/|\/$/g, '') || 'ruachdelivery';

  try {
    const apiResponse = await fetch(`${url.origin}/api/index?slug=${slug}`);
    
    if (!apiResponse.ok) {
        console.error(`[Middleware] A chamada à API falhou para o slug '${slug}' com o estado: ${apiResponse.status}`);
        return; 
    }
    const data = await apiResponse.json();

    const htmlResponse = await fetch(`${url.origin}/index.html`);
    let html = await htmlResponse.text();

    const customizations = data.customizations;
    const logoUrl = customizations?.['URL Logo'] || 'https://i.ibb.co/gZJHQ96G/Gemini-Generated-Image-9ttzu89ttzu89ttz.png';
    const companyName = customizations?.['Nome'] || 'Cardápio Digital';
    const description = `Confira o cardápio digital completo de ${companyName}! Faça seu pedido online de forma rápida e segura.`;

    // Substituir o conteúdo padrão no HTML com os dados dinâmicos
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${companyName} | Cardápio Digital</title>`
    );

    html = html.replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${companyName} | Cardápio Digital" />`
    );
     html = html.replace(
      /<meta name="twitter:title" content=".*?"\>/,
      `<meta name="twitter:title" content="${companyName} | Cardápio Digital">`
    );

    html = html.replace(
      /<meta name="description" content=".*?"\>/,
      `<meta name="description" content="${description}">`
    );

    html = html.replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${description}" />`
    );
     html = html.replace(
      /<meta name="twitter:description" content=".*?"\>/,
      `<meta name="twitter:description" content="${description}">`
    );
    
    html = html.replace(
        /<meta property="og:url" content=".*?" \/>/,
        `<meta property="og:url" content="${url.href}" />`
    );

    html = html.replace(
        /<meta property="og:site_name" content=".*?" \/>/,
        `<meta property="og:site_name" content="${companyName}" />`
    );

    html = html.replace(/https?:\/\/i\.ibb\.co\/gZJHQ96G\/Gemini-Generated-Image-9ttzu89ttzu89ttz\.png/g, logoUrl);

    // Retornar o HTML modificado
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('[Middleware] Ocorreu um erro crítico:', error);
    // Em caso de erro, apenas continua e deixa o lado do cliente renderizar
    return;
  }
}


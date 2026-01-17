import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capturar TODOS os logs do console
  page.on('console', msg => {
    console.log('CONSOLE [' + msg.type() + ']:', msg.text());
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/data/')) {
      console.log('API RESPONSE:', response.status(), url);
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const body = await response.json();
          console.log('RESPONSE BODY (preview):', JSON.stringify(body).substring(0, 300));
        }
      } catch (e) {
        console.log('Could not parse response body');
      }
    }
  });

  console.log('Navegando...');
  await page.goto('https://aculpaedasovelhas.org/ler-biblia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Injetar código para verificar o state
  const stateInfo = await page.evaluate(() => {
    // Tentar acessar o state global (se exposto)
    if (typeof state !== 'undefined') {
      return { books: state.books?.length || 0, testament: state.testament };
    }
    return 'state not accessible';
  });
  console.log('\nState info:', stateInfo);

  // Verificar o conteúdo atual do select de livros
  const bookOptionsBeforeSelect = await page.$$eval('#selectBook option', opts =>
    opts.map(o => ({ value: o.value, text: o.text }))
  );
  console.log('\nLivros ANTES de selecionar testamento:', bookOptionsBeforeSelect.length);

  // Selecionar AT
  console.log('\n--- Selecionando Antigo Testamento ---');
  await page.selectOption('#selectTestament', 'AT');
  await page.waitForTimeout(2000);

  // Verificar novamente
  const bookOptionsAfterSelect = await page.$$eval('#selectBook option', opts =>
    opts.map(o => ({ value: o.value, text: o.text }))
  );
  console.log('Livros DEPOIS de selecionar testamento:', bookOptionsAfterSelect.length);

  if (bookOptionsAfterSelect.length > 1) {
    console.log('SUCCESS! Livros carregados:', bookOptionsAfterSelect.slice(0, 5));
  } else {
    console.log('FALHA: Livros não carregaram');

    // Verificar se há erros no DOM
    const errorMessages = await page.$$eval('[class*="error"], [class*="Error"]', els =>
      els.map(e => e.textContent)
    );
    console.log('Mensagens de erro no DOM:', errorMessages);

    // Verificar status da API exibido
    const apiStatusText = await page.$eval('#apiStatusText', el => el.textContent).catch(() => 'N/A');
    console.log('Status da API exibido:', apiStatusText);
  }

  console.log('\nMantendo navegador aberto por 30s...');
  await page.waitForTimeout(30000);
  await browser.close();
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capturar logs do console
  page.on('console', msg => {
    console.log('CONSOLE [' + msg.type() + ']:', msg.text());
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('/data/')) {
      console.log('API RESPONSE:', response.status(), response.url());
    }
  });

  console.log('Navegando...');
  await page.goto('https://aculpaedasovelhas.org/ler-biblia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Verificar opções do testamento
  const testamentOptions = await page.$$eval('#selectTestament option', opts => opts.map(o => ({ value: o.value, text: o.text })));
  console.log('\nTestamentos:', JSON.stringify(testamentOptions));

  // Selecionar AT
  console.log('\nSelecionando Antigo Testamento...');
  await page.selectOption('#selectTestament', 'AT');
  await page.waitForTimeout(2000);

  // Verificar livros carregados
  const bookOptions = await page.$$eval('#selectBook option', opts => opts.map(o => ({ value: o.value, text: o.text })));
  console.log('\nLivros disponíveis:', bookOptions.length);
  console.log('Primeiros 5:', JSON.stringify(bookOptions.slice(0, 5)));

  if (bookOptions.length > 1) {
    // Selecionar Gênesis
    console.log('\nSelecionando Gênesis...');
    await page.selectOption('#selectBook', 'GEN');
    await page.waitForTimeout(2000);

    // Verificar capítulos
    const chapterOptions = await page.$$eval('#selectChapter option', opts => opts.map(o => o.value));
    console.log('Capítulos disponíveis:', chapterOptions.length);

    // Selecionar capítulo 1
    console.log('\nSelecionando capítulo 1...');
    await page.selectOption('#selectChapter', '1');
    await page.waitForTimeout(3000);

    // Verificar se versículos carregaram
    const verses = await page.$$('.verse, .versiculo, [data-verse], .kindle-verse');
    console.log('\nVersículos renderizados:', verses.length);

    // Pegar conteúdo do container de leitura
    const contentArea = await page.$('.kindle-content, .content-area, #verses, .verses-container');
    if (contentArea) {
      const text = await contentArea.textContent();
      console.log('Conteúdo encontrado:', text.substring(0, 500));
    } else {
      console.log('Container de conteúdo não encontrado');
      // Listar todas as classes principais
      const mainDivs = await page.$$eval('div[class]', els => els.slice(0, 20).map(e => e.className));
      console.log('Classes principais:', mainDivs);
    }
  }

  console.log('\nMantendo navegador aberto por 60s...');
  await page.waitForTimeout(60000);
  await browser.close();
})();

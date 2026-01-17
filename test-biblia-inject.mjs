import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('CONSOLE [' + msg.type() + ']:', msg.text());
  });

  console.log('Navegando...');
  await page.goto('https://aculpaedasovelhas.org/ler-biblia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Injetar debug no escopo da página
  const debugResult = await page.evaluate(async () => {
    const API_BASE = 'https://biblia.aculpaedasovelhas.org';

    try {
      // Fazer fetch manualmente
      const response = await fetch(`${API_BASE}/api/v1/books`);
      const data = await response.json();

      return {
        status: response.status,
        success: data.success,
        dataLength: data.data?.length || 0,
        firstBook: data.data?.[0] || null,
        rawKeys: Object.keys(data)
      };
    } catch (error) {
      return { error: error.message };
    }
  });

  console.log('\n=== DEBUG FETCH MANUAL ===');
  console.log(JSON.stringify(debugResult, null, 2));

  if (debugResult.dataLength > 0) {
    console.log('\n✅ Dados da API estão corretos!');
    console.log('Primeiro livro:', debugResult.firstBook?.name_pt);

    // Agora injetar os livros diretamente no select
    await page.evaluate((books) => {
      const selectBook = document.getElementById('selectBook');
      if (selectBook) {
        selectBook.innerHTML = '<option value="">Selecione o livro</option>';
        // Simular que temos os livros do AT
        const testBooks = [
          { code: 'GEN', name_pt: 'Gênesis' },
          { code: 'EXO', name_pt: 'Êxodo' },
          { code: 'LEV', name_pt: 'Levítico' }
        ];
        testBooks.forEach(book => {
          const option = document.createElement('option');
          option.value = book.code;
          option.textContent = book.name_pt;
          selectBook.appendChild(option);
        });
        selectBook.disabled = false;
      }
    });

    console.log('\n✅ Livros injetados manualmente no dropdown');

    // Verificar se funcionou
    const bookOptions = await page.$$eval('#selectBook option', opts =>
      opts.map(o => ({ value: o.value, text: o.text }))
    );
    console.log('Opções no dropdown agora:', bookOptions);
  }

  console.log('\nMantendo navegador aberto por 60s para teste manual...');
  await page.waitForTimeout(60000);
  await browser.close();
})();

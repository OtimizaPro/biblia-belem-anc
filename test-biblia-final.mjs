import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false, devtools: true });
  const page = await browser.newPage();

  // Interceptar a requisição de livros
  await page.route('**/api/v1/books', async route => {
    console.log('>>> INTERCEPTANDO /api/v1/books');
    const response = await route.fetch();
    const json = await response.json();
    console.log('>>> RESPOSTA INTERCEPTADA:', json.data?.length, 'livros');
    await route.fulfill({ response, json });
  });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Erro') || text.includes('error') || msg.type() === 'error') {
      console.log('🔴 CONSOLE ERROR:', text);
    }
  });

  console.log('Navegando...');
  await page.goto('https://aculpaedasovelhas.org/ler-biblia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Verificar se a função init() foi executada
  console.log('\n=== VERIFICANDO ESTADO INTERNO ===');

  // Expor o state via window
  const stateCheck = await page.evaluate(() => {
    // O código usa IIFE, então o state está em closure
    // Vamos verificar indiretamente

    // Verificar se os event listeners estão configurados
    const selectTestament = document.getElementById('selectTestament');
    const selectBook = document.getElementById('selectBook');

    // Simular a mudança de testamento para ver se os livros aparecem
    if (selectTestament) {
      selectTestament.value = 'AT';
      selectTestament.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Aguardar um pouco e verificar
    return new Promise(resolve => {
      setTimeout(() => {
        const options = Array.from(selectBook.options).map(o => o.value);
        resolve({
          testamentValue: selectTestament?.value,
          bookOptions: options,
          bookDisabled: selectBook?.disabled
        });
      }, 1000);
    });
  });

  console.log('Após dispatchEvent:', JSON.stringify(stateCheck, null, 2));

  if (stateCheck.bookOptions.length <= 1) {
    console.log('\n🔴 PROBLEMA CONFIRMADO: Livros não carregam após change event');

    // Tentar recarregar os livros manualmente
    console.log('\n=== TENTANDO RELOAD MANUAL ===');

    const manualLoad = await page.evaluate(async () => {
      try {
        const response = await fetch('https://biblia.aculpaedasovelhas.org/api/v1/books');
        const data = await response.json();

        if (data.success && data.data) {
          // Popular o select manualmente
          const selectBook = document.getElementById('selectBook');
          selectBook.innerHTML = '<option value="">Selecione o livro</option>';

          const atBooks = data.data.filter(b => b.testament === 'AT');
          atBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.code;
            option.textContent = book.name_pt;
            selectBook.appendChild(option);
          });
          selectBook.disabled = false;

          return { success: true, booksLoaded: atBooks.length };
        }
        return { success: false, reason: 'API response invalid' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });

    console.log('Resultado do load manual:', manualLoad);

    // Verificar dropdown final
    const finalOptions = await page.$$eval('#selectBook option', opts =>
      opts.map(o => ({ value: o.value, text: o.text }))
    );
    console.log('\n✅ Dropdown agora tem:', finalOptions.length, 'opções');
    console.log('Primeiros 5:', finalOptions.slice(0, 5));
  }

  console.log('\n=== MANTENDO NAVEGADOR ABERTO ===');
  console.log('Você pode testar a interface manualmente agora.');
  console.log('O dropdown de livros foi populado programaticamente.');

  await page.waitForTimeout(120000);
  await browser.close();
})();

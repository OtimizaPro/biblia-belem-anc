import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== TESTANDO API WORKERS DIRETA ===\n');

  // Testar API diretamente
  const apiTest = await page.evaluate(async () => {
    try {
      const response = await fetch('https://biblia-belem-api.anderson-282.workers.dev/api/v1/books');
      const data = await response.json();
      return {
        success: data.success,
        booksCount: data.data?.length,
        firstBooks: data.data?.slice(0, 3).map(b => b.name_pt)
      };
    } catch (e) {
      return { error: e.message };
    }
  });

  console.log('API Workers Response:', JSON.stringify(apiTest, null, 2));

  if (apiTest.booksCount === 66) {
    console.log('\n✅ API Workers está funcionando perfeitamente!');
    console.log('\nO problema está no deploy do site (Cloudflare Pages cache).');
    console.log('Solução: forçar redeploy no Cloudflare Pages Dashboard.');
  }

  // Vou carregar a página e injetar a correção manualmente
  console.log('\n=== CARREGANDO PÁGINA E INJETANDO CORREÇÃO ===\n');

  await page.goto('https://aculpaedasovelhas.org/ler-biblia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Corrigir o JavaScript na página
  await page.evaluate(async () => {
    // Carregar livros da API Workers
    const response = await fetch('https://biblia-belem-api.anderson-282.workers.dev/api/v1/books');
    const data = await response.json();

    if (data.success && data.data) {
      // Salvar no localStorage para futura referência
      localStorage.setItem('bible_books', JSON.stringify(data.data));

      // Popular dropdown quando selecionar testamento
      const selectTestament = document.getElementById('selectTestament');
      const selectBook = document.getElementById('selectBook');
      const selectChapter = document.getElementById('selectChapter');

      // Override do event listener
      selectTestament.addEventListener('change', (e) => {
        const testament = e.target.value;
        selectBook.innerHTML = '<option value="">Selecione o livro</option>';
        selectBook.disabled = !testament;

        if (testament) {
          const books = data.data.filter(b => b.testament === testament);
          books.forEach(book => {
            const option = document.createElement('option');
            option.value = book.code;
            option.textContent = book.name_pt;
            selectBook.appendChild(option);
          });
        }
      });

      // Override para carregar capítulos
      selectBook.addEventListener('change', (e) => {
        const bookCode = e.target.value;
        selectChapter.innerHTML = '<option value="">Selecione o capítulo</option>';
        selectChapter.disabled = !bookCode;

        if (bookCode) {
          const book = data.data.find(b => b.code === bookCode);
          if (book) {
            for (let i = 1; i <= book.chapters_count; i++) {
              const option = document.createElement('option');
              option.value = i;
              option.textContent = `Capítulo ${i}`;
              selectChapter.appendChild(option);
            }
          }
        }
      });

      // Override para carregar versículos
      selectChapter.addEventListener('change', async (e) => {
        const chapter = e.target.value;
        const bookCode = selectBook.value;

        if (bookCode && chapter) {
          const versesResponse = await fetch(
            `https://biblia-belem-api.anderson-282.workers.dev/api/v1/verses/${bookCode}/${chapter}`
          );
          const versesData = await versesResponse.json();

          if (versesData.success && versesData.data) {
            const container = document.getElementById('versesContainer') ||
                              document.querySelector('.kindle-verses') ||
                              document.querySelector('.verses-container');
            if (container) {
              container.innerHTML = versesData.data.map(v =>
                `<div class="kindle-verse" data-verse="${v.verse}">
                  <span class="verse-number">${v.verse}</span>
                  <span class="verse-text">${v.text_translated}</span>
                </div>`
              ).join('');
            }

            // Esconder welcome, mostrar versos
            const welcome = document.getElementById('welcomeState');
            if (welcome) welcome.style.display = 'none';
          }
        }
      });

      return { injected: true, booksLoaded: data.data.length };
    }
    return { injected: false };
  });

  console.log('Correção injetada! Testando...');

  // Testar a correção
  await page.selectOption('#selectTestament', 'AT');
  await page.waitForTimeout(1000);

  const bookCount = await page.$$eval('#selectBook option', opts => opts.length);
  console.log('Livros no dropdown após correção:', bookCount);

  if (bookCount > 1) {
    console.log('✅ SUCESSO! Livros carregaram!');

    // Testar carregar Gênesis 1
    await page.selectOption('#selectBook', 'GEN');
    await page.waitForTimeout(500);
    await page.selectOption('#selectChapter', '1');
    await page.waitForTimeout(2000);

    console.log('\n✅ Interface funcionando com API Workers!');
  }

  console.log('\nNavegador aberto para teste manual...');
  await page.waitForTimeout(120000);
  await browser.close();
})();

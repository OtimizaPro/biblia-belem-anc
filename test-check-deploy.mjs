import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Adicionar cache busting
  const timestamp = Date.now();
  console.log('Navegando com cache busting...');
  await page.goto(`https://aculpaedasovelhas.org/ler-biblia.html?nocache=${timestamp}`, {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(3000);

  // Verificar qual API_BASE está sendo usado
  const pageContent = await page.content();
  const apiMatch = pageContent.match(/API_BASE\s*=\s*['"]([^'"]+)['"]/);
  console.log('\n=== API BASE DETECTADA ===');
  console.log(apiMatch ? apiMatch[1] : 'Não encontrada');

  // Verificar se usa Workers URL
  if (apiMatch && apiMatch[1].includes('workers.dev')) {
    console.log('✅ Deploy aplicado - usando Workers URL');
  } else {
    console.log('❌ Deploy ainda não propagou - usando URL antiga');
  }

  // Testar seleção de testamento
  console.log('\nTestando seleção de livros...');
  await page.selectOption('#selectTestament', 'AT');
  await page.waitForTimeout(2000);

  const bookOptions = await page.$$eval('#selectBook option', opts =>
    opts.map(o => ({ value: o.value, text: o.text }))
  );

  console.log('Livros no dropdown:', bookOptions.length);
  if (bookOptions.length > 1) {
    console.log('✅ SUCESSO! Livros carregaram:', bookOptions.slice(1, 6).map(b => b.text).join(', '));

    // Testar carregar versículos
    console.log('\nSelecionando Gênesis capítulo 1...');
    await page.selectOption('#selectBook', 'GEN');
    await page.waitForTimeout(1000);
    await page.selectOption('#selectChapter', '1');
    await page.waitForTimeout(3000);

    // Verificar se versículos carregaram
    const versesArea = await page.$('#versesContainer, .kindle-verses, .verses');
    if (versesArea) {
      const text = await versesArea.textContent();
      console.log('\n✅ Versículos carregados!');
      console.log('Preview:', text.substring(0, 300));
    }
  } else {
    console.log('❌ Livros não carregaram');
  }

  console.log('\nNavegador aberto por 60s...');
  await page.waitForTimeout(60000);
  await browser.close();
})();

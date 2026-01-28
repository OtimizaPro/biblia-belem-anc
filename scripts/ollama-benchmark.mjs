#!/usr/bin/env node
/**
 * Benchmark Ollama - Bíblia Belém An.C 2025
 * Testa performance de diferentes modelos para tradução
 *
 * Uso: node scripts/ollama-benchmark.mjs [--model=MODEL]
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

const OLLAMA_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Modelos para testar (em ordem de preferência)
const MODELS_TO_TEST = [
  'qwen2.5:14b',      // Melhor multilíngue
  'llama3.2:8b',      // Equilibrado
  'llama3.1:8b',      // Alternativa
  'mistral:7b',       // Mais rápido
  'gemma2:9b',        // Opção Google
];

// Palavras de teste (grego e hebraico)
const TEST_WORDS = {
  greek: [
    'λόγος',      // palavra/verbo
    'ἀγάπη',      // amor
    'πίστις',     // fé
    'ἐλπίς',      // esperança
    'χάρις',      // graça
    'δικαιοσύνη', // justiça
    'ἁμαρτία',    // pecado
    'σωτηρία',    // salvação
    'βασιλεία',   // reino
    'κόσμος',     // mundo
  ],
  hebrew: [
    'דָּבָר',      // palavra
    'אַהֲבָה',     // amor
    'אֱמוּנָה',    // fé
    'תִּקְוָה',    // esperança
    'חֶסֶד',      // graça/bondade
    'צֶדֶק',      // justiça
    'חַטָּאת',     // pecado
    'יְשׁוּעָה',   // salvação
    'מַלְכוּת',    // reino
    'עוֹלָם',     // mundo/eternidade
  ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

async function checkOllama() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!response.ok) throw new Error('Ollama não respondeu');
    const data = await response.json();
    return data.models || [];
  } catch (e) {
    throw new Error(`Ollama não está rodando em ${OLLAMA_URL}`);
  }
}

async function getModelInfo(model) {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function runTranslation(model, words, language) {
  const langName = language === 'greek' ? 'grego koiné' : 'hebraico bíblico';

  const prompt = `Você é um tradutor especialista em ${langName} bíblico para português brasileiro.

REGRAS:
1. Tradução LITERAL e RÍGIDA
2. Use hífens para compostas (em-o, de-a)
3. Responda APENAS com JSON válido

Traduza: ${JSON.stringify(words)}

Responda SOMENTE com JSON: {"palavra": "tradução"}`;

  const start = performance.now();

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_ctx: 4096
      }
    })
  });

  const end = performance.now();
  const elapsed = (end - start) / 1000;

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  // Tentar parsear JSON da resposta
  let translations = {};
  try {
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      translations = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Falhou ao parsear
  }

  return {
    elapsed,
    response: data.response,
    translations,
    tokensGenerated: data.eval_count || 0,
    tokensPerSecond: data.eval_count ? (data.eval_count / elapsed).toFixed(1) : 'N/A',
    promptTokens: data.prompt_eval_count || 0
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENCHMARK
// ═══════════════════════════════════════════════════════════════════════════════

async function benchmarkModel(model) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🤖 Testando: ${model}`);
  console.log('─'.repeat(70));

  // Info do modelo
  const info = await getModelInfo(model);
  if (info) {
    console.log(`   Tamanho: ${formatBytes(info.size || 0)}`);
    console.log(`   Família: ${info.details?.family || 'N/A'}`);
    console.log(`   Parâmetros: ${info.details?.parameter_size || 'N/A'}`);
    console.log(`   Quantização: ${info.details?.quantization_level || 'N/A'}`);
  }

  const results = {
    model,
    greek: null,
    hebrew: null,
    avgTime: 0,
    avgTokensPerSec: 0
  };

  // Teste Grego
  console.log(`\n   📖 Testando grego (${TEST_WORDS.greek.length} palavras)...`);
  try {
    results.greek = await runTranslation(model, TEST_WORDS.greek, 'greek');
    console.log(`      Tempo: ${results.greek.elapsed.toFixed(2)}s`);
    console.log(`      Tokens/s: ${results.greek.tokensPerSecond}`);
    console.log(`      Traduções: ${Object.keys(results.greek.translations).length}/${TEST_WORDS.greek.length}`);

    // Mostrar algumas traduções
    const sample = Object.entries(results.greek.translations).slice(0, 3);
    for (const [word, trans] of sample) {
      console.log(`        ${word} → ${trans}`);
    }
  } catch (e) {
    console.log(`      ❌ Erro: ${e.message}`);
  }

  // Teste Hebraico
  console.log(`\n   📜 Testando hebraico (${TEST_WORDS.hebrew.length} palavras)...`);
  try {
    results.hebrew = await runTranslation(model, TEST_WORDS.hebrew, 'hebrew');
    console.log(`      Tempo: ${results.hebrew.elapsed.toFixed(2)}s`);
    console.log(`      Tokens/s: ${results.hebrew.tokensPerSecond}`);
    console.log(`      Traduções: ${Object.keys(results.hebrew.translations).length}/${TEST_WORDS.hebrew.length}`);

    // Mostrar algumas traduções
    const sample = Object.entries(results.hebrew.translations).slice(0, 3);
    for (const [word, trans] of sample) {
      console.log(`        ${word} → ${trans}`);
    }
  } catch (e) {
    console.log(`      ❌ Erro: ${e.message}`);
  }

  // Calcular médias
  if (results.greek && results.hebrew) {
    results.avgTime = (results.greek.elapsed + results.hebrew.elapsed) / 2;
    const g = parseFloat(results.greek.tokensPerSecond) || 0;
    const h = parseFloat(results.hebrew.tokensPerSecond) || 0;
    results.avgTokensPerSec = ((g + h) / 2).toFixed(1);
  }

  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       BENCHMARK OLLAMA - BÍBLIA BELÉM An.C 2025                  ║');
  console.log('║       Teste de performance para tradução bíblica                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // Parse argumentos
  const args = process.argv.slice(2);
  let specificModel = null;
  for (const arg of args) {
    if (arg.startsWith('--model=')) {
      specificModel = arg.split('=')[1];
    }
  }

  // Verificar Ollama
  console.log(`\n🔌 Conectando ao Ollama em ${OLLAMA_URL}...`);
  let availableModels;
  try {
    availableModels = await checkOllama();
    console.log(`   ✓ Ollama está rodando`);
    console.log(`   Modelos disponíveis: ${availableModels.map(m => m.name).join(', ')}`);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    console.error('   Inicie o Ollama com: ollama serve');
    process.exit(1);
  }

  // Determinar modelos para testar
  const availableNames = availableModels.map(m => m.name);
  let modelsToTest;

  if (specificModel) {
    // Testar modelo específico
    const found = availableNames.find(n => n === specificModel || n.startsWith(specificModel + ':'));
    if (!found) {
      console.error(`\n❌ Modelo ${specificModel} não encontrado.`);
      console.error(`   Baixe com: ollama pull ${specificModel}`);
      process.exit(1);
    }
    modelsToTest = [found];
  } else {
    // Testar todos os modelos recomendados que estão disponíveis
    modelsToTest = MODELS_TO_TEST.filter(model =>
      availableNames.some(n => n === model || n.startsWith(model.split(':')[0]))
    );

    if (modelsToTest.length === 0) {
      console.log('\n⚠️  Nenhum modelo recomendado encontrado.');
      console.log('   Usando modelos disponíveis...');
      modelsToTest = availableNames.slice(0, 3);
    }
  }

  console.log(`\n📊 Modelos a testar: ${modelsToTest.join(', ')}`);

  // Executar benchmarks
  const allResults = [];

  for (const model of modelsToTest) {
    try {
      const result = await benchmarkModel(model);
      allResults.push(result);
    } catch (e) {
      console.error(`\n❌ Erro ao testar ${model}: ${e.message}`);
    }
  }

  // Resumo final
  if (allResults.length > 0) {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('                         RESUMO FINAL                              ');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('  Modelo                  Tempo Médio    Tokens/s    Qualidade');
    console.log('  ────────────────────────────────────────────────────────────');

    // Ordenar por tokens/s
    allResults.sort((a, b) => parseFloat(b.avgTokensPerSec) - parseFloat(a.avgTokensPerSec));

    for (const r of allResults) {
      const greekQuality = r.greek ? Object.keys(r.greek.translations).length : 0;
      const hebrewQuality = r.hebrew ? Object.keys(r.hebrew.translations).length : 0;
      const quality = `${greekQuality + hebrewQuality}/20`;

      console.log(`  ${r.model.padEnd(24)} ${r.avgTime.toFixed(2).padStart(8)}s    ${r.avgTokensPerSec.padStart(8)}    ${quality}`);
    }

    console.log('');
    console.log('  ────────────────────────────────────────────────────────────');

    // Recomendação
    const best = allResults[0];
    console.log('');
    console.log(`  🏆 Recomendação: ${best.model}`);
    console.log(`     Melhor equilíbrio entre velocidade e qualidade`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
  }
}

main().catch(console.error);

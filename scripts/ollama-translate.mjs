#!/usr/bin/env node
/**
 * Tradutor Local com Ollama + CUDA - Bíblia Belém An.C 2025
 * Traduz tokens não traduzidos usando glossário + Ollama local
 * Substitui completamente o Claude API
 *
 * Uso: node scripts/ollama-translate.mjs [BOOK_CODE] [--model=MODEL] [--batch-size=N]
 * Exemplo: node scripts/ollama-translate.mjs GEN --model=qwen2.5:14b --batch-size=50
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  ollama: {
    baseUrl: process.env.OLLAMA_HOST || 'http://localhost:11434',
    model: 'qwen2.5:14b',  // Melhor para multilíngue (PT, GRC, HE)
    timeout: 600000,       // 10 minutos por request (modelos grandes precisam de tempo)
    maxRetries: 5,
    retryDelay: 3000
  },
  batch: {
    size: 10,              // Palavras por batch (reduzido para maior confiabilidade)
    delayBetweenBatches: 500
  },
  translation: {
    temperature: 0.1,      // Baixa para consistência
    topP: 0.9,
    numCtx: 4096
  }
};

// Parse argumentos CLI
const args = process.argv.slice(2);
let BOOK_CODE = null;

for (const arg of args) {
  if (arg.startsWith('--model=')) {
    CONFIG.ollama.model = arg.split('=')[1];
  } else if (arg.startsWith('--batch-size=')) {
    CONFIG.batch.size = parseInt(arg.split('=')[1], 10);
  } else if (!arg.startsWith('--')) {
    BOOK_CODE = arg;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOSSÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════

const greekGlossaryPath = join(projectRoot, 'glossary', 'greek.json');
const hebrewGlossaryPath = join(projectRoot, 'glossary', 'hebrew.json');
const keepOriginalPath = join(projectRoot, 'glossary', 'keep_original.json');

let greekGlossary = existsSync(greekGlossaryPath)
  ? JSON.parse(readFileSync(greekGlossaryPath, 'utf-8'))
  : {};

let hebrewGlossary = existsSync(hebrewGlossaryPath)
  ? JSON.parse(readFileSync(hebrewGlossaryPath, 'utf-8'))
  : {};

const keepOriginal = existsSync(keepOriginalPath)
  ? new Set(JSON.parse(readFileSync(keepOriginalPath, 'utf-8')).all_words || [])
  : new Set([
    'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
    'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
    'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
    'יהוה', 'אֱלֹהִים', 'אֵל'
  ]);

// ═══════════════════════════════════════════════════════════════════════════════
// ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════════

const stats = {
  total: 0,
  fromGlossary: 0,
  fromOllama: 0,
  keptOriginal: 0,
  failed: 0,
  startTime: Date.now()
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE OLLAMA
// ═══════════════════════════════════════════════════════════════════════════════

class OllamaClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.timeout = config.timeout;
    this.maxRetries = config.maxRetries;
    this.retryDelay = config.retryDelay;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Ollama não está respondendo');
      const data = await response.json();
      return data.models || [];
    } catch (e) {
      throw new Error(`Ollama não está rodando em ${this.baseUrl}. Inicie com: ollama serve`);
    }
  }

  async checkModelAvailable() {
    const models = await this.checkHealth();
    const modelNames = models.map(m => m.name);

    // Verificar se o modelo está disponível (com ou sem tag)
    const isAvailable = modelNames.some(name =>
      name === this.model ||
      name.startsWith(this.model + ':') ||
      name === this.model + ':latest'
    );

    if (!isAvailable) {
      console.log(`\n⚠️  Modelo ${this.model} não encontrado.`);
      console.log(`   Modelos disponíveis: ${modelNames.join(', ')}`);
      console.log(`   Baixando ${this.model}...`);

      try {
        execSync(`ollama pull ${this.model}`, { stdio: 'inherit' });
      } catch (e) {
        throw new Error(`Falha ao baixar modelo ${this.model}`);
      }
    }

    return true;
  }

  async generate(prompt, options = {}) {
    const body = {
      model: this.model,
      prompt,
      stream: false,
      options: {
        temperature: CONFIG.translation.temperature,
        top_p: CONFIG.translation.topP,
        num_ctx: CONFIG.translation.numCtx,
        ...options
      }
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
      } catch (e) {
        lastError = e;
        if (attempt < this.maxRetries) {
          console.log(`\n  ⚠️  Tentativa ${attempt} falhou, retentando em ${this.retryDelay}ms...`);
          await new Promise(r => setTimeout(r, this.retryDelay));
        }
      }
    }

    throw lastError;
  }

  async translateBatch(words, script) {
    const language = script === 'GRC' ? 'grego koiné' : 'hebraico bíblico';

    const prompt = `Você é um tradutor especialista em ${language} bíblico para português brasileiro.

REGRAS ESTRITAS:
1. Tradução LITERAL e RÍGIDA - mantenha a estrutura gramatical original
2. Use hífens para palavras compostas (ex: "em-o" não "no", "de-a" não "da")
3. Mantenha artigos separados (o, a, os, as)
4. NÃO traduza nomes próprios de Deus (Θεός, יהוה, אֱלֹהִים) - mantenha no original
5. Mantenha a ordem das palavras do original quando possível
6. Responda APENAS com JSON válido, sem explicações ou markdown

Traduza cada palavra para português literal:

${JSON.stringify(words, null, 2)}

Responda SOMENTE com JSON no formato:
{
  "palavra_original": "tradução_literal"
}`;

    try {
      const response = await this.generate(prompt);

      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Tentar parse direto se não encontrar
      try {
        return JSON.parse(response);
      } catch {
        console.log('\n  ⚠️  Resposta não é JSON válido:', response.substring(0, 100));
        return {};
      }
    } catch (e) {
      console.error('\n  ❌ Erro na tradução:', e.message);
      return {};
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE BANCO DE DADOS
// ═══════════════════════════════════════════════════════════════════════════════

function executeD1(query) {
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  const result = execSync(
    `npx wrangler d1 execute biblia-belem --remote --command "${cleanQuery.replace(/"/g, '\\"')}" --json`,
    { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
  );
  return JSON.parse(result)[0].results;
}

function updateTokenTranslation(tokenId, translation) {
  const escaped = translation.replace(/'/g, "''");
  const query = `UPDATE tokens SET pt_literal = '${escaped}' WHERE id = ${tokenId}`;

  try {
    execSync(
      `npx wrangler d1 execute biblia-belem --remote --command "${query}"`,
      { cwd: projectRoot, stdio: 'pipe' }
    );
    return true;
  } catch (e) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE GLOSSÁRIO
// ═══════════════════════════════════════════════════════════════════════════════

function translateFromGlossary(word, script) {
  const cleanWord = word.replace(/[.,;:·()]/g, '').trim();

  // Verificar se deve manter original
  if (keepOriginal.has(cleanWord)) {
    return { translation: cleanWord, source: 'keep_original' };
  }

  // Buscar no glossário apropriado
  const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;

  if (glossary[cleanWord]) {
    return {
      translation: glossary[cleanWord].translation || glossary[cleanWord],
      source: 'glossary'
    };
  }

  // Tentar variações
  const variations = [
    cleanWord.toLowerCase(),
    cleanWord.toUpperCase(),
    cleanWord.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  ];

  for (const variant of variations) {
    if (glossary[variant]) {
      return {
        translation: glossary[variant].translation || glossary[variant],
        source: 'glossary'
      };
    }
  }

  return null;
}

function saveGlossary(script, updates) {
  const path = script === 'GRC' ? greekGlossaryPath : hebrewGlossaryPath;
  const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;

  let added = 0;
  for (const [word, translation] of Object.entries(updates)) {
    if (!glossary[word] && translation) {
      glossary[word] = {
        translation,
        source: 'ollama',
        model: CONFIG.ollama.model,
        added: new Date().toISOString()
      };
      added++;
    }
  }

  if (added > 0) {
    writeFileSync(path, JSON.stringify(glossary, null, 2), 'utf-8');
  }

  return added;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════════════════════

async function processBook(bookCode, ollamaClient) {
  console.log(`\n📖 Processando ${bookCode}...`);

  // Buscar tokens não traduzidos
  const query = `
    SELECT t.id, t.text_utf8 as word, t.script
    FROM tokens t
    JOIN verses v ON t.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE b.code = '${bookCode}'
    AND (t.pt_literal IS NULL OR t.pt_literal LIKE '%[%')
    LIMIT 1000
  `;

  const tokens = executeD1(query);

  if (tokens.length === 0) {
    console.log(`  ✓ ${bookCode} já está 100% traduzido!`);
    return;
  }

  console.log(`  📝 ${tokens.length} tokens para traduzir`);
  stats.total += tokens.length;

  // Separar por script
  const byScript = { GRC: [], HE: [] };
  for (const token of tokens) {
    const script = token.script || 'HE';
    byScript[script] = byScript[script] || [];
    byScript[script].push(token);
  }

  // Processar cada script
  for (const [script, scriptTokens] of Object.entries(byScript)) {
    if (!scriptTokens || scriptTokens.length === 0) continue;

    console.log(`  🔤 ${script === 'GRC' ? 'Grego' : 'Hebraico'}: ${scriptTokens.length} tokens`);

    // Primeiro: traduzir do glossário
    const needsOllama = [];

    for (const token of scriptTokens) {
      const result = translateFromGlossary(token.word, script);

      if (result) {
        if (result.source === 'keep_original') {
          stats.keptOriginal++;
        } else {
          stats.fromGlossary++;
        }

        if (updateTokenTranslation(token.id, result.translation)) {
          process.stdout.write('.');
        } else {
          stats.failed++;
          process.stdout.write('x');
        }
      } else {
        needsOllama.push(token);
      }
    }

    // Segundo: traduzir com Ollama
    if (needsOllama.length > 0) {
      console.log(`\n  🦙 Chamando Ollama para ${needsOllama.length} palavras...`);

      // Processar em batches
      for (let i = 0; i < needsOllama.length; i += CONFIG.batch.size) {
        const batch = needsOllama.slice(i, i + CONFIG.batch.size);
        const uniqueWords = [...new Set(batch.map(t => t.word))];

        const batchNum = Math.floor(i / CONFIG.batch.size) + 1;
        const totalBatches = Math.ceil(needsOllama.length / CONFIG.batch.size);
        console.log(`    Batch ${batchNum}/${totalBatches}: ${uniqueWords.length} palavras únicas`);

        const translations = await ollamaClient.translateBatch(uniqueWords, script);

        // Salvar no glossário
        const added = saveGlossary(script, translations);
        if (added > 0) {
          console.log(`    💾 +${added} entradas no glossário`);
        }

        // Atualizar tokens
        for (const token of batch) {
          const translation = translations[token.word];
          if (translation) {
            if (updateTokenTranslation(token.id, translation)) {
              stats.fromOllama++;
              process.stdout.write('+');
            } else {
              stats.failed++;
              process.stdout.write('x');
            }
          } else {
            stats.failed++;
            process.stdout.write('?');
          }
        }

        // Delay entre batches
        await new Promise(r => setTimeout(r, CONFIG.batch.delayBetweenBatches));
      }
    }

    console.log('');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       TRADUTOR LOCAL OLLAMA + CUDA - BÍBLIA BELÉM An.C 2025     ║');
  console.log('║       Tradução literal rígida com IA local                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  // Inicializar cliente Ollama
  const ollamaClient = new OllamaClient(CONFIG.ollama);

  // Verificar Ollama
  console.log(`🔌 Conectando ao Ollama em ${CONFIG.ollama.baseUrl}...`);
  try {
    await ollamaClient.checkHealth();
    console.log('   ✓ Ollama está rodando');
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  // Verificar modelo
  console.log(`🤖 Verificando modelo ${CONFIG.ollama.model}...`);
  try {
    await ollamaClient.checkModelAvailable();
    console.log(`   ✓ Modelo ${CONFIG.ollama.model} disponível`);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }

  console.log('');
  console.log('📊 Configuração:');
  console.log(`   Modelo: ${CONFIG.ollama.model}`);
  console.log(`   Batch size: ${CONFIG.batch.size}`);
  console.log(`   Temperatura: ${CONFIG.translation.temperature}`);
  console.log('');
  console.log(`📚 Glossário Grego: ${Object.keys(greekGlossary).length} entradas`);
  console.log(`📚 Glossário Hebraico: ${Object.keys(hebrewGlossary).length} entradas`);
  console.log(`🔒 Manter original: ${keepOriginal.size} palavras`);
  console.log('');

  if (BOOK_CODE) {
    await processBook(BOOK_CODE, ollamaClient);
  } else {
    const books = executeD1('SELECT code FROM books ORDER BY id');
    for (const book of books) {
      await processBook(book.code, ollamaClient);
    }
  }

  // Estatísticas finais
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const tokensPerSec = stats.total > 0 ? (stats.total / parseFloat(elapsed)).toFixed(1) : '0';

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                        RESULTADO FINAL                            ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Total processado:  ${stats.total}`);
  console.log(`  Do glossário:      ${stats.fromGlossary}`);
  console.log(`  Do Ollama:         ${stats.fromOllama}`);
  console.log(`  Mantido original:  ${stats.keptOriginal}`);
  console.log(`  Falhas:            ${stats.failed}`);
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Tempo total:       ${elapsed}s`);
  console.log(`  Velocidade:        ${tokensPerSec} tokens/s`);
  console.log(`  Modelo usado:      ${CONFIG.ollama.model}`);
  console.log('═══════════════════════════════════════════════════════════════════');
}

main().catch(console.error);

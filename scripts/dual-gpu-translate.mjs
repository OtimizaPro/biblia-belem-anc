#!/usr/bin/env node
/**
 * Tradutor Dual GPU - Bíblia Belém An.C 2025
 * Orquestra duas instâncias Ollama em GPUs separadas para tradução paralela.
 *
 * Uso:
 *   node scripts/dual-gpu-translate.mjs                     # Todos os livros
 *   node scripts/dual-gpu-translate.mjs --testament=NT      # Só Novo Testamento
 *   node scripts/dual-gpu-translate.mjs --testament=AT      # Só Antigo Testamento
 *   node scripts/dual-gpu-translate.mjs --book=JUD          # Livro específico
 *   node scripts/dual-gpu-translate.mjs --model=qwen2.5:7b  # Modelo alternativo
 *   node scripts/dual-gpu-translate.mjs --batch-size=20     # Ajustar batch
 *
 * Pré-requisito: .\scripts\start-dual-ollama.ps1
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  instances: [
    { id: 0, baseUrl: 'http://localhost:11434', label: 'GPU-0 (RTX 5060 Ti)' },
    { id: 1, baseUrl: 'http://localhost:11435', label: 'GPU-1 (RTX 4060)' }
  ],
  ollama: {
    model: 'qwen2.5:14b',
    timeout: 600000,
    maxRetries: 5,
    retryDelay: 3000
  },
  batch: {
    size: 10,
    delayBetweenBatches: 300
  },
  translation: {
    temperature: 0.1,
    topP: 0.9,
    numCtx: 2048  // Reduzido de 4096 para caber em 8GB VRAM
  },
  d1: {
    batchSize: 50,        // UPDATEs por arquivo SQL
    flushIntervalMs: 2000 // Flush a cada 2 segundos
  }
};

// Parse argumentos CLI
let FILTER_BOOK = null;
let FILTER_TESTAMENT = null;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--model=')) {
    CONFIG.ollama.model = arg.split('=')[1];
  } else if (arg.startsWith('--batch-size=')) {
    CONFIG.batch.size = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--testament=')) {
    FILTER_TESTAMENT = arg.split('=')[1].toUpperCase();
  } else if (arg.startsWith('--book=')) {
    FILTER_BOOK = arg.split('=')[1].toUpperCase();
  } else if (!arg.startsWith('--')) {
    FILTER_BOOK = arg.toUpperCase();
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
  workers: [
    { total: 0, fromGlossary: 0, fromOllama: 0, keptOriginal: 0, failed: 0, books: 0 },
    { total: 0, fromGlossary: 0, fromOllama: 0, keptOriginal: 0, failed: 0, books: 0 }
  ],
  startTime: Date.now()
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTE OLLAMA
// ═══════════════════════════════════════════════════════════════════════════════

class OllamaClient {
  constructor(config, instanceLabel) {
    this.baseUrl = config.baseUrl;
    this.model = CONFIG.ollama.model;
    this.timeout = CONFIG.ollama.timeout;
    this.maxRetries = CONFIG.ollama.maxRetries;
    this.retryDelay = CONFIG.ollama.retryDelay;
    this.label = instanceLabel;
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.models || [];
    } catch (e) {
      throw new Error(`Ollama nao responde em ${this.baseUrl} (${this.label}). Execute: .\\scripts\\start-dual-ollama.ps1`);
    }
  }

  async checkModelAvailable() {
    const models = await this.checkHealth();
    const modelNames = models.map(m => m.name);
    const isAvailable = modelNames.some(name =>
      name === this.model ||
      name.startsWith(this.model + ':') ||
      name === this.model + ':latest'
    );
    if (!isAvailable) {
      console.log(`  [${this.label}] Modelo ${this.model} nao encontrado. Baixando...`);
      try {
        const response = await fetch(`${this.baseUrl}/api/pull`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: this.model })
        });
        await response.json();
      } catch (e) {
        throw new Error(`Falha ao baixar modelo ${this.model} em ${this.label}`);
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
          await new Promise(r => setTimeout(r, this.retryDelay));
        }
      }
    }
    throw lastError;
  }

  extractJSON(text) {
    // 1. Tentar parse direto (cobre tanto {} quanto [{},{},...])
    try {
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) {
        return Object.assign({}, ...parsed.filter(o => o && typeof o === 'object'));
      }
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}

    // 2. Procurar array [...] no texto (modelo pode incluir texto extra)
    const arrStart = text.indexOf('[');
    if (arrStart !== -1) {
      let depth = 0;
      for (let i = arrStart; i < text.length; i++) {
        if (text[i] === '[') depth++;
        else if (text[i] === ']') depth--;
        if (depth === 0) {
          try {
            const arr = JSON.parse(text.substring(arrStart, i + 1));
            if (Array.isArray(arr)) {
              return Object.assign({}, ...arr.filter(o => o && typeof o === 'object'));
            }
          } catch { break; }
        }
      }
    }

    // 3. Procurar objeto {...} único por balanceamento de chaves
    const objStart = text.indexOf('{');
    if (objStart !== -1) {
      let depth = 0;
      for (let i = objStart; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        if (depth === 0) {
          try {
            return JSON.parse(text.substring(objStart, i + 1));
          } catch { break; }
        }
      }
    }

    return {};
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
      return this.extractJSON(response);
    } catch (e) {
      console.error(`  [${this.label}] Erro na tradução: ${e.message}`);
      return {};
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// D1 WRITE QUEUE — Batch de escritas D1 para performance
// ═══════════════════════════════════════════════════════════════════════════════

class D1WriteQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.totalWritten = 0;
    this.totalErrors = 0;
  }

  enqueue(tokenId, translation) {
    const escaped = translation.replace(/'/g, "''");
    this.queue.push(`UPDATE tokens SET pt_literal = '${escaped}' WHERE id = ${tokenId};`);
  }

  async flush() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const batch = this.queue.splice(0, CONFIG.d1.batchSize);
    const tmpFile = join(tmpdir(), `dual-gpu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sql`);

    try {
      writeFileSync(tmpFile, batch.join('\n'), 'utf-8');
      execSync(
        `npx wrangler d1 execute biblia-belem --remote --file "${tmpFile}" --json`,
        { cwd: projectRoot, encoding: 'utf-8', timeout: 120000, stdio: 'pipe' }
      );
      this.totalWritten += batch.length;
    } catch (e) {
      this.totalErrors += batch.length;
      // Requeue itens que falharam para retry
      this.queue.unshift(...batch);
      console.error(`  [D1] Erro no batch (${batch.length} itens): ${e.message?.substring(0, 200)}`);
      // Backoff antes do próximo retry
      await new Promise(r => setTimeout(r, 5000));
    } finally {
      try { unlinkSync(tmpFile); } catch {}
      this.isProcessing = false;
    }
  }

  async flushAll() {
    while (this.queue.length > 0) {
      await this.flush();
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE BANCO DE DADOS
// ═══════════════════════════════════════════════════════════════════════════════

function executeD1(query) {
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  try {
    const result = execSync(
      `npx wrangler d1 execute biblia-belem --remote --command "${cleanQuery.replace(/"/g, '\\"')}" --json`,
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, timeout: 120000 }
    );
    const jsonStart = result.indexOf('[');
    if (jsonStart !== -1) {
      return JSON.parse(result.substring(jsonStart))[0].results;
    }
    return JSON.parse(result)[0].results;
  } catch (e) {
    console.error(`  [D1] Erro na query: ${e.message?.substring(0, 200)}`);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE GLOSSÁRIO
// ═══════════════════════════════════════════════════════════════════════════════

function translateFromGlossary(word, script) {
  const cleanWord = word.replace(/[.,;:·()]/g, '').trim();

  if (keepOriginal.has(cleanWord)) {
    return { translation: cleanWord, source: 'keep_original' };
  }

  const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;

  if (glossary[cleanWord]) {
    return {
      translation: glossary[cleanWord].translation || glossary[cleanWord],
      source: 'glossary'
    };
  }

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

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING NORMALIZADO — resolve diferenças Unicode entre tokens D1 e respostas Ollama
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeWord(w) {
  // Remove sinais cantilados hebraicos, acentos gregos, pontuação
  return w
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // combining diacriticals (acentos gregos)
    .replace(/[\u0591-\u05C7]/g, '')   // Hebrew cantillation + vowel points
    .replace(/[\u0610-\u061A]/g, '')   // Arabic marks (aramaico)
    .replace(/[.,;:·\-()[\]{}]/g, '')  // pontuação
    .trim();
}

function findTranslation(tokenWord, translations) {
  // 1. Match exato
  if (translations[tokenWord]) return translations[tokenWord];

  // 2. Match normalizado: normalizar o token e comparar com chaves normalizadas
  const normToken = normalizeWord(tokenWord);

  for (const [key, value] of Object.entries(translations)) {
    if (!value) continue;

    // Match exato na chave
    if (key === tokenWord) return value;

    // Match normalizado
    if (normalizeWord(key) === normToken) return value;

    // Match parcial: chave está contida no token ou vice-versa
    const normKey = normalizeWord(key);
    if (normKey.length > 2 && normToken.length > 2) {
      if (normToken.includes(normKey) || normKey.includes(normToken)) return value;
    }
  }

  return null;
}

// Lock simples para escrita de glossário
let glossaryWriteLock = false;

async function saveGlossary(script, updates) {
  // Esperar se o outro worker está escrevendo
  let retries = 0;
  while (glossaryWriteLock && retries < 10) {
    await new Promise(r => setTimeout(r, 200));
    retries++;
  }
  glossaryWriteLock = true;

  try {
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
      // Escrita atômica: escreve em temp e renomeia para evitar corrupção
      const tmpPath = path + '.tmp';
      writeFileSync(tmpPath, JSON.stringify(glossary, null, 2), 'utf-8');
      renameSync(tmpPath, path);
    }
    return added;
  } finally {
    glossaryWriteLock = false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHECKPOINT
// ═══════════════════════════════════════════════════════════════════════════════

const checkpointPath = join(__dirname, 'dual-gpu-checkpoint.json');

function loadCheckpoint() {
  if (existsSync(checkpointPath)) {
    try {
      return JSON.parse(readFileSync(checkpointPath, 'utf-8'));
    } catch { return { completedBooks: [] }; }
  }
  return { completedBooks: [] };
}

function saveCheckpoint(completedBooks) {
  writeFileSync(checkpointPath, JSON.stringify({
    lastRun: new Date().toISOString(),
    completedBooks,
    stats: {
      worker0: stats.workers[0],
      worker1: stats.workers[1]
    }
  }, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIVISÃO DE TRABALHO
// ═══════════════════════════════════════════════════════════════════════════════

async function divideWork() {
  console.log('  Consultando tokens pendentes por livro...');

  let whereClause = '';
  if (FILTER_BOOK) {
    whereClause = `AND b.code = '${FILTER_BOOK}'`;
  } else if (FILTER_TESTAMENT) {
    whereClause = FILTER_TESTAMENT === 'NT'
      ? 'AND b.canon_order >= 40'
      : 'AND b.canon_order < 40';
  }

  const books = executeD1(`
    SELECT b.code, b.name_pt, b.testament,
      COUNT(t.id) as pending
    FROM books b
    JOIN verses v ON v.book_id = b.id
    JOIN tokens t ON t.verse_id = v.id
    WHERE (t.pt_literal IS NULL OR t.pt_literal LIKE '%[%')
    ${whereClause}
    GROUP BY b.id
    HAVING pending > 0
    ORDER BY pending DESC
  `);

  if (books.length === 0) {
    console.log('  Nenhum token pendente encontrado!');
    return [[], []];
  }

  // Filtrar livros já completos no checkpoint
  const checkpoint = loadCheckpoint();
  const pending = books.filter(b => !checkpoint.completedBooks.includes(b.code));

  if (pending.length === 0) {
    console.log('  Todos os livros do checkpoint já foram processados!');
    console.log('  (Delete scripts/dual-gpu-checkpoint.json para recomeçar)');
    return [[], []];
  }

  // Greedy partition em 2 filas
  const queues = [[], []];
  const loads = [0, 0];

  for (const book of pending) {
    // Preferência: AT→GPU0, NT→GPU1
    const preferred = book.testament === 'AT' ? 0 : 1;
    const target = loads[preferred] <= loads[1 - preferred] ? preferred : 1 - preferred;
    queues[target].push(book);
    loads[target] += book.pending;
  }

  console.log(`  Worker 0: ${queues[0].length} livros, ${loads[0].toLocaleString()} tokens`);
  console.log(`  Worker 1: ${queues[1].length} livros, ${loads[1].toLocaleString()} tokens`);

  return queues;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKER — Processa livros de uma fila
// ═══════════════════════════════════════════════════════════════════════════════

async function processBook(workerId, bookCode, ollamaClient, d1Queue) {
  const wStats = stats.workers[workerId];
  const label = CONFIG.instances[workerId].label;

  console.log(`  [${label}] Processando ${bookCode}...`);

  // Buscar tokens não traduzidos (até 1000 por vez)
  const tokens = executeD1(`
    SELECT t.id, t.text_utf8 as word, t.script
    FROM tokens t
    JOIN verses v ON t.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE b.code = '${bookCode}'
    AND (t.pt_literal IS NULL OR t.pt_literal LIKE '%[%')
    LIMIT 1000
  `);

  if (tokens.length === 0) {
    console.log(`  [${label}] ${bookCode} - 100% traduzido!`);
    return true;
  }

  console.log(`  [${label}] ${bookCode}: ${tokens.length} tokens pendentes`);
  wStats.total += tokens.length;

  // Separar por script
  const byScript = {};
  for (const token of tokens) {
    const script = token.script || 'HE';
    if (!byScript[script]) byScript[script] = [];
    byScript[script].push(token);
  }

  for (const [script, scriptTokens] of Object.entries(byScript)) {
    if (!scriptTokens || scriptTokens.length === 0) continue;

    const langName = script === 'GRC' ? 'Grego' : 'Hebraico';
    console.log(`  [${label}] ${bookCode} ${langName}: ${scriptTokens.length} tokens`);

    // Passo 1: Traduzir do glossário
    const needsOllama = [];
    for (const token of scriptTokens) {
      const result = translateFromGlossary(token.word, script);
      if (result) {
        if (result.source === 'keep_original') {
          wStats.keptOriginal++;
        } else {
          wStats.fromGlossary++;
        }
        d1Queue.enqueue(token.id, result.translation);
      } else {
        needsOllama.push(token);
      }
    }

    if (needsOllama.length > 0) {
      console.log(`  [${label}] ${bookCode}: ${needsOllama.length} para Ollama (${scriptTokens.length - needsOllama.length} do glossário)`);

      // Passo 2: Traduzir com Ollama em batches
      for (let i = 0; i < needsOllama.length; i += CONFIG.batch.size) {
        const batch = needsOllama.slice(i, i + CONFIG.batch.size);
        const uniqueWords = [...new Set(batch.map(t => t.word))];

        const batchNum = Math.floor(i / CONFIG.batch.size) + 1;
        const totalBatches = Math.ceil(needsOllama.length / CONFIG.batch.size);
        process.stdout.write(`  [${label}] Batch ${batchNum}/${totalBatches} `);

        const translations = await ollamaClient.translateBatch(uniqueWords, script);

        // Enfileirar updates (com matching normalizado) e coletar para glossário
        let ok = 0;
        const glossaryUpdates = {};
        for (const token of batch) {
          const translation = findTranslation(token.word, translations);
          if (translation) {
            d1Queue.enqueue(token.id, translation);
            wStats.fromOllama++;
            ok++;
            // Salvar com a chave do token original (não do modelo)
            glossaryUpdates[token.word] = translation;
          } else {
            wStats.failed++;
          }
        }

        // Salvar no glossário com chaves corretas
        const added = await saveGlossary(script, glossaryUpdates);
        if (added > 0) {
          process.stdout.write(`+${added}g `);
        }
        console.log(`(${ok}/${batch.length} ok)`);

        await new Promise(r => setTimeout(r, CONFIG.batch.delayBetweenBatches));
      }
    }
  }

  // Flush D1 após cada livro
  await d1Queue.flush();
  wStats.books++;
  return true;
}

async function runWorker(workerId, bookQueue, ollamaClient, d1Queue, completedBooks, sharedQueue) {
  const label = CONFIG.instances[workerId].label;

  // Processar fila própria
  for (const book of bookQueue) {
    await processBook(workerId, book.code, ollamaClient, d1Queue);
    completedBooks.push(book.code);
    saveCheckpoint(completedBooks);
  }

  // Work-stealing: pegar livros da outra fila se sobraram
  while (sharedQueue.length > 0) {
    const book = sharedQueue.shift();
    if (book) {
      console.log(`  [${label}] Work-stealing: ${book.code}`);
      await processBook(workerId, book.code, ollamaClient, d1Queue);
      completedBooks.push(book.code);
      saveCheckpoint(completedBooks);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════════

let shuttingDown = false;

function setupGracefulShutdown(d1Queue, completedBooks) {
  const handler = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n  Encerrando (${signal})... Flush D1 pendente...`);
    await d1Queue.flushAll();
    saveCheckpoint(completedBooks);
    printStats();
    process.exit(0);
  };

  process.on('SIGINT', () => handler('SIGINT'));
  process.on('SIGTERM', () => handler('SIGTERM'));
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPRESSÃO DE ESTATÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════════

function printStats() {
  const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
  const w0 = stats.workers[0];
  const w1 = stats.workers[1];
  const totalProcessed = w0.total + w1.total;
  const tokensPerSec = totalProcessed > 0 ? (totalProcessed / parseFloat(elapsed)).toFixed(1) : '0';

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('                    RESULTADO FINAL — DUAL GPU                     ');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  ${CONFIG.instances[0].label}:`);
  console.log(`    Livros: ${w0.books} | Total: ${w0.total} | Glossário: ${w0.fromGlossary} | Ollama: ${w0.fromOllama} | Original: ${w0.keptOriginal} | Falhas: ${w0.failed}`);
  console.log('');
  console.log(`  ${CONFIG.instances[1].label}:`);
  console.log(`    Livros: ${w1.books} | Total: ${w1.total} | Glossário: ${w1.fromGlossary} | Ollama: ${w1.fromOllama} | Original: ${w1.keptOriginal} | Falhas: ${w1.failed}`);
  console.log('');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Total processado:  ${totalProcessed}`);
  console.log(`  Do glossário:      ${w0.fromGlossary + w1.fromGlossary}`);
  console.log(`  Do Ollama:         ${w0.fromOllama + w1.fromOllama}`);
  console.log(`  Mantido original:  ${w0.keptOriginal + w1.keptOriginal}`);
  console.log(`  Falhas:            ${w0.failed + w1.failed}`);
  console.log(`  D1 escritas:       ${d1QueueRef?.totalWritten || 0} (erros: ${d1QueueRef?.totalErrors || 0})`);
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`  Tempo total:       ${elapsed}s`);
  console.log(`  Velocidade:        ${tokensPerSec} tokens/s`);
  console.log(`  Modelo:            ${CONFIG.ollama.model}`);
  console.log(`  Batch size:        ${CONFIG.batch.size}`);
  console.log(`  num_ctx:           ${CONFIG.translation.numCtx}`);
  console.log('═══════════════════════════════════════════════════════════════════');
}

// Referência global para printStats acessar
let d1QueueRef = null;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     TRADUTOR DUAL GPU - BÍBLIA BELÉM An.C 2025                  ║');
  console.log('║     Tradução literal rígida com 2 GPUs + Ollama                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');

  // 1. Inicializar clientes Ollama
  const clients = CONFIG.instances.map(inst =>
    new OllamaClient(inst, inst.label)
  );

  // 2. Health check ambas instâncias
  console.log('  Verificando instâncias Ollama...');
  for (const [i, client] of clients.entries()) {
    try {
      await client.checkHealth();
      console.log(`  ${CONFIG.instances[i].label}: OK`);
    } catch (e) {
      console.error(`  ${e.message}`);
      console.log('');
      console.log('  Execute primeiro: .\\scripts\\start-dual-ollama.ps1');
      process.exit(1);
    }
  }

  // 3. Verificar modelo em ambas
  console.log('');
  console.log(`  Verificando modelo ${CONFIG.ollama.model}...`);
  for (const client of clients) {
    await client.checkModelAvailable();
  }
  console.log(`  Modelo ${CONFIG.ollama.model} disponível em ambas instâncias`);

  // 4. Info
  console.log('');
  console.log('  Configuração:');
  console.log(`    Modelo:     ${CONFIG.ollama.model}`);
  console.log(`    Batch size: ${CONFIG.batch.size}`);
  console.log(`    num_ctx:    ${CONFIG.translation.numCtx}`);
  console.log(`    D1 batch:   ${CONFIG.d1.batchSize} UPDATEs/arquivo`);
  console.log(`    Glossário Grego: ${Object.keys(greekGlossary).length} entradas`);
  console.log(`    Glossário Hebraico: ${Object.keys(hebrewGlossary).length} entradas`);
  console.log(`    Manter original: ${keepOriginal.size} palavras`);
  if (FILTER_BOOK) console.log(`    Filtro: livro ${FILTER_BOOK}`);
  if (FILTER_TESTAMENT) console.log(`    Filtro: testamento ${FILTER_TESTAMENT}`);
  console.log('');

  // 5. Dividir trabalho
  const [queue0, queue1] = await divideWork();

  if (queue0.length === 0 && queue1.length === 0) {
    console.log('  Nada para traduzir. Saindo.');
    return;
  }

  // 6. Criar fila D1 compartilhada
  const d1Queue = new D1WriteQueue();
  d1QueueRef = d1Queue;

  // Flush periódico
  const flushTimer = setInterval(() => {
    if (!shuttingDown) d1Queue.flush();
  }, CONFIG.d1.flushIntervalMs);

  // 7. Tracking de livros completos
  const completedBooks = [...loadCheckpoint().completedBooks];

  // 8. Graceful shutdown
  setupGracefulShutdown(d1Queue, completedBooks);

  // 9. Fila compartilhada para work-stealing (livros que sobram)
  // Ambos workers podem puxar dessa fila quando terminam a própria
  const sharedStealQueue = [];

  console.log('');
  console.log('  Iniciando tradução paralela...');
  console.log('  (Ctrl+C para parar gracefully)');
  console.log('');

  // 10. Rodar ambos workers em paralelo
  await Promise.all([
    runWorker(0, queue0, clients[0], d1Queue, completedBooks, sharedStealQueue),
    runWorker(1, queue1, clients[1], d1Queue, completedBooks, sharedStealQueue)
  ]);

  // 11. Flush final
  clearInterval(flushTimer);
  await d1Queue.flushAll();
  saveCheckpoint(completedBooks);

  // 12. Stats
  printStats();
}

main().catch(e => {
  console.error('Erro fatal:', e);
  process.exit(1);
});

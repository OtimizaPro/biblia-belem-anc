#!/usr/bin/env node
/**
 * Tradutor Completo - Bíblia Belém An.C 2025
 * Traduz TODOS os tokens não traduzidos usando glossário + Claude API
 *
 * Uso: node scripts/translate-all.mjs [BOOK_CODE]
 * Exemplo: node scripts/translate-all.mjs GEN
 */

import 'dotenv/config';
import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuração
const BOOK_CODE = process.argv[2]; // Se vazio, traduz todos
const BATCH_SIZE = 100; // Tokens por batch para Claude
const DELAY_MS = 500; // Delay entre chamadas API

// Carregar glossários
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
    // Palavras que devem permanecer no original
    'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
    'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
    'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
    'יהוה', 'אֱלֹהִים', 'אֵל'
  ]);

// Inicializar cliente Anthropic
let anthropic;
const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  try {
    anthropic = new Anthropic({ apiKey });
  } catch (e) {
    console.error('⚠️  Erro ao inicializar Anthropic SDK:', e.message);
    anthropic = null;
  }
} else {
  console.error('⚠️  ANTHROPIC_API_KEY não definida. Usando apenas glossário local.');
  anthropic = null;
}

// Estatísticas
const stats = {
  total: 0,
  fromGlossary: 0,
  fromClaude: 0,
  keptOriginal: 0,
  failed: 0
};

/**
 * Executar query no D1
 */
function executeD1(query) {
  // Remover quebras de linha e espaços extras
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  const result = execSync(
    `npx wrangler d1 execute biblia-belem --remote --command "${cleanQuery.replace(/"/g, '\\"')}" --json`,
    { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
  );
  return JSON.parse(result)[0].results;
}

/**
 * Traduzir palavra usando glossário
 */
function translateFromGlossary(word, script) {
  // Limpar pontuação
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

  // Tentar variações (sem acentos, maiúsculas/minúsculas)
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

/**
 * Traduzir batch de palavras usando Claude
 */
async function translateWithClaude(words, script) {
  if (!anthropic) return {};

  const language = script === 'GRC' ? 'grego koiné' : 'hebraico bíblico';

  const prompt = `Você é um tradutor especialista em ${language} bíblico para português brasileiro.

REGRAS ESTRITAS:
1. Tradução LITERAL e RÍGIDA - mantenha a estrutura gramatical original
2. Use hífens para palavras compostas (ex: "em-o" não "no", "de-a" não "da")
3. Mantenha artigos separados (o, a, os, as)
4. NÃO traduza nomes próprios de Deus (Θεός, יהוה, אֱלֹהִים)
5. Mantenha a ordem das palavras do original quando possível
6. Responda APENAS com JSON, sem explicações

Traduza cada palavra para português literal:

${JSON.stringify(words, null, 2)}

Responda em JSON com formato:
{
  "palavra_original": "tradução_literal",
  ...
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;
    // Extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Erro Claude:', e.message);
  }

  return {};
}

/**
 * Salvar glossário atualizado
 */
function saveGlossary(script, updates) {
  const path = script === 'GRC' ? greekGlossaryPath : hebrewGlossaryPath;
  const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;

  for (const [word, translation] of Object.entries(updates)) {
    if (!glossary[word]) {
      glossary[word] = { translation, source: 'claude', added: new Date().toISOString() };
    }
  }

  writeFileSync(path, JSON.stringify(glossary, null, 2), 'utf-8');
}

/**
 * Atualizar tradução no banco D1
 */
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

/**
 * Processar livro
 */
async function processBook(bookCode) {
  console.log(`\n📖 Processando ${bookCode}...`);

  // Buscar tokens não traduzidos do livro
  let query = `
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

  // Separar por script (grego/hebraico)
  const byScript = { GRC: [], HE: [] };
  for (const token of tokens) {
    const script = token.script || 'HE';
    byScript[script] = byScript[script] || [];
    byScript[script].push(token);
  }

  // Processar cada script
  for (const [script, scriptTokens] of Object.entries(byScript)) {
    if (scriptTokens.length === 0) continue;

    console.log(`  🔤 ${script}: ${scriptTokens.length} tokens`);

    // Primeiro passo: traduzir do glossário
    const needsClaude = [];

    for (const token of scriptTokens) {
      const result = translateFromGlossary(token.word, script);

      if (result) {
        if (result.source === 'keep_original') {
          stats.keptOriginal++;
        } else {
          stats.fromGlossary++;
        }

        // Atualizar banco
        if (updateTokenTranslation(token.id, result.translation)) {
          process.stdout.write('.');
        } else {
          stats.failed++;
          process.stdout.write('x');
        }
      } else {
        needsClaude.push(token);
      }
    }

    // Segundo passo: traduzir com Claude
    if (needsClaude.length > 0 && anthropic) {
      console.log(`\n  🤖 Chamando Claude para ${needsClaude.length} palavras...`);

      // Processar em batches
      for (let i = 0; i < needsClaude.length; i += BATCH_SIZE) {
        const batch = needsClaude.slice(i, i + BATCH_SIZE);
        const words = [...new Set(batch.map(t => t.word))];

        console.log(`    Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${words.length} palavras únicas`);

        const translations = await translateWithClaude(words, script);

        // Salvar no glossário
        saveGlossary(script, translations);

        // Atualizar tokens
        for (const token of batch) {
          const translation = translations[token.word];
          if (translation) {
            if (updateTokenTranslation(token.id, translation)) {
              stats.fromClaude++;
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
        await new Promise(r => setTimeout(r, DELAY_MS));
      }
    }

    console.log('');
  }
}

/**
 * Main
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       TRADUTOR COMPLETO - BÍBLIA BELÉM An.C 2025                 ║');
  console.log('║       Glossário + Claude AI                                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📚 Glossário Grego: ${Object.keys(greekGlossary).length} entradas`);
  console.log(`📚 Glossário Hebraico: ${Object.keys(hebrewGlossary).length} entradas`);
  console.log(`🔒 Manter original: ${keepOriginal.size} palavras`);
  console.log(`🤖 Claude API: ${anthropic ? 'Disponível' : 'Não configurado'}`);
  console.log('');

  if (BOOK_CODE) {
    // Traduzir apenas um livro
    await processBook(BOOK_CODE);
  } else {
    // Traduzir todos os livros
    const books = executeD1('SELECT code FROM books ORDER BY id');

    for (const book of books) {
      await processBook(book.code);
    }
  }

  // Estatísticas finais
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('RESULTADO FINAL');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  Total processado:  ${stats.total}`);
  console.log(`  Do glossário:      ${stats.fromGlossary}`);
  console.log(`  Do Claude:         ${stats.fromClaude}`);
  console.log(`  Mantido original:  ${stats.keptOriginal}`);
  console.log(`  Falhas:            ${stats.failed}`);
  console.log('═══════════════════════════════════════════════════════════════════');
}

main().catch(console.error);

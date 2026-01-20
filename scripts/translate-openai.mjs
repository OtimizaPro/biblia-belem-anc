#!/usr/bin/env node
/**
 * Aplicador de Glossário - Bíblia Belém An.C 2025
 * Aplica o glossário expandido aos tokens não traduzidos (SEM API externa)
 *
 * Uso: node scripts/translate-openai.mjs [BOOK_CODE]
 * Exemplo: node scripts/translate-openai.mjs REV
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuração
const BOOK_CODE = process.argv[2];
const BATCH_SIZE = 100;

if (!BOOK_CODE) {
  console.error('❌ Uso: node scripts/translate-openai.mjs BOOK_CODE');
  console.error('   Exemplo: node scripts/translate-openai.mjs REV');
  process.exit(1);
}

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
    'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
    'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
    'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
    'יהוה', 'אֱלֹהִים', 'אֵל'
  ]);

// Estatísticas
const stats = {
  total: 0,
  fromGlossary: 0,
  keptOriginal: 0,
  notFound: 0
};

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       APLICADOR DE GLOSSÁRIO - BÍBLIA BELÉM An.C 2025           ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log();
console.log(`📚 Glossário Grego: ${Object.keys(greekGlossary).length} entradas`);
console.log(`📚 Glossário Hebraico: ${Object.keys(hebrewGlossary).length} entradas`);
console.log(`🔒 Manter original: ${keepOriginal.size} palavras`);
console.log();

/**
 * Executar query no D1
 */
function executeD1(query) {
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  try {
    const result = execSync(
      `npx wrangler d1 execute biblia-belem --remote --command "${cleanQuery.replace(/"/g, '\\"')}" --json`,
      { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return JSON.parse(result)[0].results;
  } catch (e) {
    return null;
  }
}

/**
 * Traduzir palavra usando glossário
 */
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

/**
 * Processar um livro
 */
async function processBook(bookCode) {
  console.log(`\n📖 Processando ${bookCode}...`);

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    // Buscar tokens não traduzidos (que têm [palavra] no pt_literal)
    const tokens = executeD1(`
      SELECT t.id, t.text_utf8, t.script
      FROM tokens t
      JOIN verses v ON t.verse_id = v.id
      JOIN books b ON v.book_id = b.id
      WHERE b.code = '${bookCode}'
      AND t.pt_literal LIKE '[%]'
      ORDER BY t.id
      LIMIT ${BATCH_SIZE} OFFSET ${offset}
    `);

    if (!tokens || !tokens.length) {
      hasMore = false;
      continue;
    }

    console.log(`  Batch ${Math.floor(offset/BATCH_SIZE) + 1}: ${tokens.length} tokens`);

    for (const token of tokens) {
      const result = translateFromGlossary(token.text_utf8, token.script);

      if (result) {
        const translation = result.translation.replace(/'/g, "''");
        const updated = executeD1(`UPDATE tokens SET pt_literal = '${translation}' WHERE id = ${token.id}`);

        if (updated !== null) {
          if (result.source === 'keep_original') {
            stats.keptOriginal++;
            process.stdout.write('K');
          } else {
            stats.fromGlossary++;
            process.stdout.write('.');
          }
        } else {
          process.stdout.write('!');
        }
      } else {
        stats.notFound++;
        process.stdout.write('?');
      }
      stats.total++;
    }

    process.stdout.write('\n');
    offset += BATCH_SIZE;

    if (tokens.length < BATCH_SIZE) {
      hasMore = false;
    }
  }
}

// Main
async function main() {
  try {
    await processBook(BOOK_CODE);

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('RESULTADO FINAL');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`  Total processado:  ${stats.total}`);
    console.log(`  Do glossário:      ${stats.fromGlossary}`);
    console.log(`  Mantido original:  ${stats.keptOriginal}`);
    console.log(`  Não encontrado:    ${stats.notFound}`);
    console.log('═══════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

main();

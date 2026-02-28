#!/usr/bin/env node
/**
 * export-d1-fast.mjs — Exportador rápido via D1 (wrangler)
 *
 * Exporta todos os 66 livros consultando D1 diretamente.
 * Em vez de 31.287 chamadas de API, faz 66 queries SQL (uma por livro).
 *
 * Uso: node scripts/export-d1-fast.mjs [--start N] [--book CODE]
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const OUTPUT_DIR = join(ROOT, 'export', 'txt');

// Nome especial para Revelação (Desvelação, NÃO Apocalipse)
const SPECIAL_NAMES = {
  'REV': 'Desvelação de Jesus Cristo (apocalipse)',
};

const SPECIAL_CODES = {
  'REV': 'DES',
};

function d1(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --json --command "${escaped}"`;
  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(result);
    if (parsed && parsed[0] && parsed[0].results) {
      return parsed[0].results;
    }
    return [];
  } catch (err) {
    // If command ran but wrangler had warnings, try parsing stdout anyway
    if (err.stdout) {
      try {
        const parsed = JSON.parse(err.stdout);
        if (parsed && parsed[0] && parsed[0].results) {
          return parsed[0].results;
        }
      } catch {}
    }
    console.error(`  SQL Error: ${(err.stderr || err.message).substring(0, 200)}`);
    return [];
  }
}

function getBooks() {
  return d1('SELECT id, code, name_pt, name_original, chapters_count, canon_order FROM books ORDER BY canon_order');
}

function getBookData(bookId) {
  // Single query: get all tokens for this book, ordered by chapter, verse, position
  // "AND 1=1" prevents Windows cmd from truncating trailing numbers before closing quote
  const sql = `SELECT v.chapter, v.verse, t.position, t.pt_literal FROM tokens t JOIN verses v ON t.verse_id = v.id WHERE v.book_id = ${bookId} AND 1=1 ORDER BY v.chapter, v.verse, t.position`;
  return d1(sql);
}

function buildBookText(book, tokens) {
  const lines = [];
  const displayName = SPECIAL_NAMES[book.code] || book.name_pt;

  // Cabeçalho
  lines.push('═'.repeat(70));
  lines.push(displayName.toUpperCase());
  lines.push('');
  lines.push('Tradução: Bíblia Belém An.C 2025');
  lines.push('Método: Literal Rígido - Fiel ao códice original');
  lines.push('Sem suavização. Sem normalização. Sem interferência do tradutor.');
  lines.push('═'.repeat(70));
  lines.push('');

  // Agrupar tokens por capítulo e versículo
  let currentChapter = 0;
  let currentVerse = 0;
  let verseTokens = [];
  let totalVerses = 0;
  let translatedVerses = 0;

  function flushVerse() {
    if (currentVerse === 0) return;
    totalVerses++;
    const text = verseTokens.length > 0
      ? verseTokens.map(t => t || '[?]').join(' ')
      : '[sem tradução]';
    if (text !== '[sem tradução]') translatedVerses++;
    lines.push(`${currentVerse}  ${text}`);
  }

  for (const row of tokens) {
    if (row.chapter !== currentChapter) {
      flushVerse();
      if (currentChapter > 0) lines.push('');
      currentChapter = row.chapter;
      currentVerse = 0;
      lines.push(`── Capítulo ${currentChapter} ──`);
      lines.push('');
    }
    if (row.verse !== currentVerse) {
      flushVerse();
      currentVerse = row.verse;
      verseTokens = [];
    }
    verseTokens.push(row.pt_literal);
  }
  flushVerse();
  lines.push('');

  // Rodapé
  lines.push('─'.repeat(70));
  lines.push(`Total de versículos: ${totalVerses}`);
  lines.push(`Versículos traduzidos: ${translatedVerses}`);
  lines.push(`Cobertura: ${totalVerses > 0 ? ((translatedVerses / totalVerses) * 100).toFixed(1) : 0}%`);
  lines.push('─'.repeat(70));

  return { text: lines.join('\n'), totalVerses, translatedVerses };
}

function main() {
  const args = process.argv.slice(2);
  const startIdx = args.includes('--start') ? parseInt(args[args.indexOf('--start') + 1]) : 1;
  const bookFilter = args.includes('--book') ? args[args.indexOf('--book') + 1].toUpperCase() : null;

  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     EXPORTADOR RÁPIDO D1 — BÍBLIA BELÉM An.C 2025              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Buscando lista de livros...');
  const books = getBooks();
  console.log(`Encontrados: ${books.length} livros\n`);

  const stats = [];

  for (const book of books) {
    if (bookFilter && book.code !== bookFilter) continue;
    if (book.canon_order < startIdx) continue;

    const displayName = SPECIAL_NAMES[book.code] || book.name_pt;
    const fileCode = SPECIAL_CODES[book.code] || book.code;
    process.stdout.write(`[${book.canon_order}/66] ${book.code} ${displayName}...`);

    const tokens = getBookData(book.id);
    const { text, totalVerses, translatedVerses } = buildBookText(book, tokens);

    const filename = `${String(book.canon_order).padStart(2, '0')}_${fileCode}_${displayName.replace(/\s/g, '_')}.txt`;
    writeFileSync(join(OUTPUT_DIR, filename), text, 'utf8');

    console.log(` ${translatedVerses}/${totalVerses} versos`);
    stats.push({ code: book.code, name: displayName, totalVerses, translatedVerses });
  }

  // Resumo
  const totalV = stats.reduce((s, x) => s + x.totalVerses, 0);
  const transV = stats.reduce((s, x) => s + x.translatedVerses, 0);

  console.log('\n' + '═'.repeat(70));
  console.log(`Livros exportados: ${stats.length}`);
  console.log(`Versículos: ${transV}/${totalV} (${((transV / totalV) * 100).toFixed(1)}%)`);
  console.log('═'.repeat(70));

  // Índice
  const idxLines = [
    'BÍBLIA BELÉM An.C 2025 - ÍNDICE',
    '═'.repeat(50), '',
    'Tradução Literal Rígida', '',
    '─'.repeat(50), '',
  ];
  for (const s of stats) {
    const pct = ((s.translatedVerses / s.totalVerses) * 100).toFixed(0);
    idxLines.push(`${s.code.padEnd(4)} ${s.name.padEnd(45)} ${s.translatedVerses}/${s.totalVerses} (${pct}%)`);
  }
  idxLines.push('', '─'.repeat(50), `TOTAL: ${transV}/${totalV} versículos`);
  writeFileSync(join(OUTPUT_DIR, '00_INDICE.txt'), idxLines.join('\n'), 'utf8');
  console.log('\nÍndice salvo em 00_INDICE.txt');
}

main();

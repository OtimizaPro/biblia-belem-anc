#!/usr/bin/env node
/**
 * rebuild-verse-translations.mjs
 *
 * Reconstrói verse_translations.literal_pt a partir dos tokens.pt_literal
 *
 * PROBLEMA: A tabela verse_translations foi gerada ANTES da aplicação do
 * keep_original.json, resultando em termos proibidos como "Deus", "Jesus",
 * "Senhor", "Cristo" no texto servido em produção. Enquanto isso, a tabela
 * tokens.pt_literal está correta (Elohim, Iesous, yhwh, Christos).
 *
 * SOLUÇÃO: Reconstruir literal_pt concatenando tokens.pt_literal por verse_id,
 * ordenados por position. Fonte única de verdade = tokens.
 *
 * USO:
 *   node scripts/rebuild-verse-translations.mjs --dry-run     # Preview sem alterar
 *   node scripts/rebuild-verse-translations.mjs --book GEN     # Só Gênesis
 *   node scripts/rebuild-verse-translations.mjs                # Todos os 66 livros
 *
 * REQUISITOS: npx wrangler configurado com acesso ao D1 biblia-belem
 */

import { execSync } from 'child_process';

// --- Config ---
const DB_NAME = 'biblia-belem';

// --- Args ---
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const bookIdx = args.indexOf('--book');
const SINGLE_BOOK = bookIdx !== -1 ? args[bookIdx + 1] : null;

// --- Helpers ---
function d1Run(sql, json = false) {
  // Flatten SQL to single line and escape double quotes
  const oneLine = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  const escaped = oneLine.replace(/"/g, '\\"');
  const jsonFlag = json ? ' --json' : '';
  const cmd = `npx wrangler d1 execute ${DB_NAME} --remote --command "${escaped}"${jsonFlag}`;
  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 50 * 1024 * 1024,
    });
    if (json) {
      const match = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return parsed[0]?.results || [];
      }
    }
    return true;
  } catch (e) {
    const msg = (e.stderr || e.message || '').substring(0, 200);
    if (msg && !msg.includes('update available')) {
      console.error(`  ✗ Erro: ${msg}`);
    }
    return null;
  }
}

function d1Query(sql) { return d1Run(sql, true) || []; }
function d1Execute(sql) { return d1Run(sql, false) !== null; }

function countTerm(term) {
  const result = d1Query(
    `SELECT COUNT(*) as total FROM verse_translations WHERE literal_pt LIKE '%${term}%'`
  );
  return result?.[0]?.total || 0;
}

// --- Main ---
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  REBUILD verse_translations — Bíblia Belém An.C 2025      ║');
console.log('║  Fonte: tokens.pt_literal → verse_translations.literal_pt ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

if (DRY_RUN) {
  console.log('⚠  MODO DRY-RUN — nenhuma alteração será feita\n');
}

// 1. Inventário ANTES
console.log('── Inventário ANTES ──\n');

const forbidden = [
  { term: 'Deus', correct: 'Elohim/Eloah/El/Theos' },
  { term: ' Jesus ', correct: 'Iesous' },
  { term: 'Senhor', correct: 'yhwh/Adonai' },
  { term: ' Cristo ', correct: 'Christos' },
];

const beforeCounts = {};
for (const { term, correct } of forbidden) {
  const count = countTerm(term.trim());
  beforeCounts[term] = count;
  const icon = count > 0 ? '✗' : '✓';
  console.log(`  ${icon} "${term.trim()}" → ${count} ocorrências${count > 0 ? ` (deveria ser "${correct}")` : ''}`);
}

const elohimBefore = countTerm('Elohim');
console.log(`  ℹ "Elohim" → ${elohimBefore} ocorrências\n`);

// 2. DRY-RUN: preview
if (DRY_RUN) {
  console.log('── Preview (5 versículos com "Deus") ──\n');

  const samples = d1Query(
    `SELECT vt.verse_id, v.canonical_ref, vt.literal_pt as atual,
       (SELECT GROUP_CONCAT(pt_literal, ' ') FROM (
         SELECT pt_literal FROM tokens WHERE verse_id = vt.verse_id ORDER BY position
       )) as reconstruido
     FROM verse_translations vt
     JOIN verses v ON v.id = vt.verse_id
     WHERE vt.literal_pt LIKE '%Deus%'
     LIMIT 5`
  );

  if (samples) {
    for (const s of samples) {
      console.log(`  ${s.canonical_ref} (verse_id: ${s.verse_id})`);
      console.log(`    ATUAL:        ${s.atual}`);
      console.log(`    RECONSTRUÍDO: ${s.reconstruido}`);
      console.log('');
    }
  }

  console.log('✓ Para executar, rode sem --dry-run');
  process.exit(0);
}

// 3. Buscar livros
const bookFilter = SINGLE_BOOK ? `WHERE b.code = '${SINGLE_BOOK.toUpperCase()}'` : '';
const books = d1Query(
  `SELECT b.id, b.code, b.name_pt, COUNT(v.id) as verse_count
   FROM books b JOIN verses v ON v.book_id = b.id
   ${bookFilter}
   GROUP BY b.id ORDER BY b.id`
);

if (!books || books.length === 0) {
  console.error('✗ Nenhum livro encontrado');
  process.exit(1);
}

console.log(`── Reconstruindo ${books.length} livro(s) ──\n`);

let totalUpdated = 0;
let totalErrors = 0;

for (const book of books) {
  const label = `  [${String(book.id).padStart(2)}] ${book.code.padEnd(4)} ${(book.name_pt || '').padEnd(20)} (${book.verse_count} vs)`;
  process.stdout.write(`${label}... `);

  // UPDATE em batch: reconstruir literal_pt e readable_pt a partir dos tokens
  const sql = `UPDATE verse_translations
    SET literal_pt = (
      SELECT GROUP_CONCAT(pt_literal, ' ') FROM (
        SELECT pt_literal FROM tokens
        WHERE verse_id = verse_translations.verse_id
        ORDER BY position
      )
    ),
    readable_pt = (
      SELECT GROUP_CONCAT(pt_literal, ' ') FROM (
        SELECT pt_literal FROM tokens
        WHERE verse_id = verse_translations.verse_id
        ORDER BY position
      )
    )
    WHERE verse_id IN (
      SELECT id FROM verses WHERE book_id = ${book.id}
    )`;

  const ok = d1Execute(sql);

  if (ok) {
    totalUpdated += book.verse_count;
    console.log('✓');
  } else {
    totalErrors++;
    console.log('✗ ERRO');
  }
}

console.log('');
console.log(`── Resultado ──`);
console.log(`  Atualizados: ${totalUpdated} versículos`);
if (totalErrors > 0) {
  console.log(`  Erros: ${totalErrors} livro(s) falharam`);
}

// 4. Inventário DEPOIS
console.log('\n── Inventário DEPOIS ──\n');

let allClean = true;
for (const { term } of forbidden) {
  const count = countTerm(term.trim());
  const before = beforeCounts[term];
  const icon = count > 0 ? '✗' : '✓';
  console.log(`  ${icon} "${term.trim()}" → ${count} (era ${before})${count === 0 ? ' — LIMPO' : ''}`);
  if (count > 0) allClean = false;
}

const elohimAfter = countTerm('Elohim');
console.log(`  ℹ "Elohim" → ${elohimAfter} (era ${elohimBefore})`);

console.log('');
if (allClean) {
  console.log('✓ SUCESSO — verse_translations reconstruída a partir dos tokens');
  console.log('  Fonte única de verdade: tokens.pt_literal');
} else {
  console.log('⚠ Alguns termos proibidos permanecem — investigar tokens.pt_literal');
}

#!/usr/bin/env node
/**
 * Exporta a Tradução bíblica Belem-2025 dos arquivos .txt canônicos
 * para os formatos de intercâmbio padrão do ecossistema bíblico:
 *
 *   dist/json/<CODE>.json     um arquivo por livro
 *   dist/json/belem-2025.json corpus completo em um único arquivo
 *   dist/usfm/<NN-CODE>.usfm  USFM 3.0, um arquivo por livro
 *   dist/sql/belem-2025.sql   dump SQL (books / chapters / verses)
 *   dist/sqlite/belem-2025.sqlite  (opcional, requer Node >= 22)
 *
 * Uso: node scripts/export-formats.mjs [--out dist]
 *
 * A fonte da verdade é sempre "Bible belem-pt-br/txt/". Nada aqui edita
 * o texto: o exportador só reempacota. Qualquer divergência entre os
 * formatos e o .txt é bug do exportador, nunca correção de tradução.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'Bible belem-pt-br', 'txt');

const outArg = process.argv.indexOf('--out');
const OUT = path.join(ROOT, outArg !== -1 ? process.argv[outArg + 1] : 'dist');

const TRANSLATION = {
  id: 'belem-2025',
  name: 'Tradução bíblica Belem-2025',
  abbrev: 'Belem An.C',
  language: 'pt-BR',
  method: 'Literal rígido, direto dos códices (hebraico / aramaico / grego)',
  license: 'CC BY 4.0',
  source: 'https://github.com/OtimizaPro/biblia-belem-anc',
};

// Códigos USFM 3.0. O nome em português é preservado em \h e \toc1;
// o identificador \id segue o padrão USFM para garantir interoperabilidade
// com Paratext, Scripture Burrito, unfoldingWord e leitores existentes.
// Único caso divergente: o livro 66 é publicado como "Desvelação",
// mas seu código USFM obrigatório é REV.
const USFM_CODE = { DES: 'REV' };

const CHAPTER_RE = /^──\s*Cap[íi]tulo\s+(\d+)\s*──$/;
const VERSE_RE = /^(\d+)\s+(.+)$/;
const RULE_RE = /^[─═]{5,}$/;
const FOOTER_RE = /^Total de vers[íi]culos:/i;

/** Extrai ordem canônica, código e nome a partir do nome do arquivo. */
function parseFileName(file) {
  const m = /^(\d{2})_([A-Z0-9]{3})_(.+)\.txt$/.exec(file);
  if (!m) throw new Error(`Nome de arquivo fora do padrão: ${file}`);
  return {
    order: Number(m[1]),
    code: m[2],
    name: m[3].replace(/_/g, ' ').replace(/\s*\(.*\)\s*$/, '').trim(),
  };
}

/**
 * Converte um .txt em { order, code, name, chapters: [{ chapter, verses: [{verse, text}] }] }.
 * Linhas que não abrem capítulo nem iniciam versículo são tratadas como
 * continuação do versículo anterior (o .txt quebra versículos longos).
 */
function parseBook(file) {
  const meta = parseFileName(file);
  const lines = readFileSync(path.join(SRC, file), 'utf8').split(/\r?\n/);

  const chapters = [];
  let current = null;
  let lastVerse = null;
  let started = false;
  let done = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || done) continue;

    const chap = CHAPTER_RE.exec(line);
    if (chap) {
      current = { chapter: Number(chap[1]), verses: [] };
      chapters.push(current);
      lastVerse = null;
      started = true;
      continue;
    }

    if (!started) continue; // cabeçalho do arquivo
    if (FOOTER_RE.test(line)) {
      done = true; // rodapé: nada de útil depois
      continue;
    }
    if (RULE_RE.test(line)) continue; // régua decorativa

    const verse = VERSE_RE.exec(line);
    if (verse) {
      lastVerse = { verse: Number(verse[1]), text: verse[2].trim() };
      current.verses.push(lastVerse);
      continue;
    }

    if (lastVerse) lastVerse.text += ' ' + line; // continuação
  }

  return { ...meta, chapters };
}

function write(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
}

function toUsfm(book) {
  const id = USFM_CODE[book.code] ?? book.code;
  const out = [
    `\\id ${id} ${TRANSLATION.name} (${TRANSLATION.abbrev}) — ${TRANSLATION.license}`,
    `\\usfm 3.0`,
    `\\ide UTF-8`,
    `\\h ${book.name}`,
    `\\toc1 ${book.name}`,
    `\\toc2 ${book.name}`,
    `\\toc3 ${book.code}`,
    `\\mt1 ${book.name.toUpperCase()}`,
  ];
  for (const ch of book.chapters) {
    out.push(`\\c ${ch.chapter}`, `\\p`);
    for (const v of ch.verses) out.push(`\\v ${v.verse} ${v.text}`);
  }
  return out.join('\n') + '\n';
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

function toSql(books) {
  const L = [
    '-- Tradução bíblica Belem-2025 — dump SQL',
    `-- ${TRANSLATION.source}`,
    `-- Licença: ${TRANSLATION.license}`,
    '-- Gerado por scripts/export-formats.mjs — não editar à mão.',
    '',
    'PRAGMA foreign_keys = ON;',
    '',
    'DROP TABLE IF EXISTS verses;',
    'DROP TABLE IF EXISTS chapters;',
    'DROP TABLE IF EXISTS books;',
    '',
    'CREATE TABLE books (',
    '  id INTEGER PRIMARY KEY,',
    '  code TEXT NOT NULL UNIQUE,',
    '  name TEXT NOT NULL,',
    '  testament TEXT NOT NULL,',
    '  chapters_count INTEGER NOT NULL',
    ');',
    '',
    'CREATE TABLE chapters (',
    '  id INTEGER PRIMARY KEY,',
    '  book_id INTEGER NOT NULL REFERENCES books(id),',
    '  number INTEGER NOT NULL,',
    '  verses_count INTEGER NOT NULL,',
    '  UNIQUE (book_id, number)',
    ');',
    '',
    'CREATE TABLE verses (',
    '  id INTEGER PRIMARY KEY,',
    '  book_id INTEGER NOT NULL REFERENCES books(id),',
    '  chapter INTEGER NOT NULL,',
    '  verse INTEGER NOT NULL,',
    '  text TEXT NOT NULL,',
    '  UNIQUE (book_id, chapter, verse)',
    ');',
    '',
    'CREATE INDEX idx_verses_ref ON verses (book_id, chapter, verse);',
    '',
    'BEGIN TRANSACTION;',
  ];

  let chapterId = 0;
  let verseId = 0;
  for (const b of books) {
    const testament = b.order <= 39 ? 'AT' : 'NT';
    L.push(
      `INSERT INTO books VALUES (${b.order}, ${sqlStr(b.code)}, ${sqlStr(b.name)}, ${sqlStr(testament)}, ${b.chapters.length});`
    );
    for (const ch of b.chapters) {
      L.push(
        `INSERT INTO chapters VALUES (${++chapterId}, ${b.order}, ${ch.chapter}, ${ch.verses.length});`
      );
      for (const v of ch.verses) {
        L.push(
          `INSERT INTO verses VALUES (${++verseId}, ${b.order}, ${ch.chapter}, ${v.verse}, ${sqlStr(v.text)});`
        );
      }
    }
  }
  L.push('COMMIT;', '');
  return L.join('\n');
}

async function buildSqlite(sql, target) {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = await import('node:sqlite'));
  } catch {
    return false; // Node < 22: dump .sql continua disponível
  }
  mkdirSync(path.dirname(target), { recursive: true });
  rmSync(target, { force: true });
  const db = new DatabaseSync(target);
  db.exec(sql);
  db.close();
  return true;
}

// ---------------------------------------------------------------------------

const files = readdirSync(SRC)
  .filter((f) => f.endsWith('.txt') && !f.startsWith('00_'))
  .sort();

const books = files.map(parseBook);

let totalChapters = 0;
let totalVerses = 0;
for (const b of books) {
  totalChapters += b.chapters.length;
  for (const ch of b.chapters) totalVerses += ch.verses.length;
}

rmSync(OUT, { recursive: true, force: true });

// JSON por livro + corpus completo
for (const b of books) {
  write(
    path.join(OUT, 'json', `${b.code}.json`),
    JSON.stringify({ translation: TRANSLATION, book: b }, null, 2)
  );
}
write(
  path.join(OUT, 'json', 'belem-2025.json'),
  JSON.stringify(
    {
      translation: TRANSLATION,
      stats: { books: books.length, chapters: totalChapters, verses: totalVerses },
      books,
    },
    null,
    2
  )
);

// USFM
for (const b of books) {
  const id = USFM_CODE[b.code] ?? b.code;
  write(path.join(OUT, 'usfm', `${String(b.order).padStart(2, '0')}-${id}.usfm`), toUsfm(b));
}

// SQL + SQLite
const sql = toSql(books);
write(path.join(OUT, 'sql', 'belem-2025.sql'), sql);
const sqlitePath = path.join(OUT, 'sqlite', 'belem-2025.sqlite');
const sqliteOk = await buildSqlite(sql, sqlitePath);

console.log(`Livros:      ${books.length}`);
console.log(`Capítulos:   ${totalChapters}`);
console.log(`Versículos:  ${totalVerses}`);
console.log(`Saída:       ${path.relative(ROOT, OUT)}/`);
console.log(`  json/      ${books.length + 1} arquivos`);
console.log(`  usfm/      ${books.length} arquivos`);
console.log(`  sql/       belem-2025.sql`);
console.log(`  sqlite/    ${sqliteOk ? 'belem-2025.sqlite' : '(pulado — requer Node >= 22)'}`);

if (books.length !== 66) {
  console.error(`\nERRO: esperados 66 livros, encontrados ${books.length}`);
  process.exit(1);
}

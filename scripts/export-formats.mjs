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
 * Uso:
 *   node scripts/export-formats.mjs                 # padrão: --source merge
 *   node scripts/export-formats.mjs --source txt    # só os .txt do repo
 *   node scripts/export-formats.mjs --source api    # só o D1 (via API pública)
 *   node scripts/export-formats.mjs --out dist
 *
 * Duas fontes existem e NÃO são idênticas:
 *
 *   - "Bible belem-pt-br/txt/" — versionado no repo, mas defasado.
 *   - D1 (https://biblia.aculpaedasovelhas.org) — recebeu revisões que nunca
 *     voltaram para os .txt. É o artefato mais avançado.
 *
 * Por isso o padrão é `merge`: usa o texto do D1 quando existe e não é vazio,
 * e cai para o .txt quando o D1 não tem o versículo. Assim o export nunca
 * regride a tradução. O relatório final informa de onde veio cada versículo.
 *
 * Nada aqui edita texto: o exportador só escolhe a fonte e reempacota.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'Bible belem-pt-br', 'txt');

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : def;
};
const OUT = path.resolve(ROOT, arg('--out', 'dist'));
const SOURCE = arg('--source', 'merge'); // 'txt' | 'api' | 'merge'
const API_CACHE = path.resolve(ROOT, arg('--api-cache', 'dist/.cache/d1-corpus.json'));
const REVERT_LIST = path.resolve(ROOT, arg('--revert', 'scripts/merge-revert.json'));

if (!['txt', 'api', 'merge'].includes(SOURCE)) {
  console.error(`--source inválido: ${SOURCE} (use txt | api | merge)`);
  process.exit(1);
}

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

/** Carrega o cache do D1 num índice code -> chapter -> verse -> texto. */
function loadApiIndex() {
  if (!existsSync(API_CACHE)) {
    console.error(
      `Fonte "${SOURCE}" requer o cache do D1, mas ${path.relative(ROOT, API_CACHE)} não existe.\n` +
        `Rode primeiro: node scripts/fetch-d1.mjs`
    );
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(API_CACHE, 'utf8'));
  const idx = new Map();
  for (const b of raw.books) {
    const chMap = new Map();
    for (const c of b.chapters) {
      const vMap = new Map();
      for (const v of c.verses) if (v.text) vMap.set(v.verse, v.text);
      chMap.set(c.chapter, vMap);
    }
    idx.set(b.code, chMap);
  }
  return idx;
}

// Escritas sem relação com os códices. Usado para NÃO regredir: o merge nunca
// troca um versículo limpo por uma versão que introduz estes caracteres.
const ALIEN_MERGE = new RegExp(
  ['[　-〿㐀-䶿一-鿿豈-﫿]', '[Ѐ-ӿԀ-ԯ]', '[؀-ۿݐ-ݿ]', '[가-힯ᄀ-ᇿ]', '[぀-ヿ]', '[ऀ-ॿ]', '[԰-֏]', '[฀-๿]'].join('|')
);

/**
 * Normalização mínima e inegociável sobre o texto vindo do D1.
 *
 * O D1 grava o tetragrama como "YHWH" (maiúsculo). A regra normativa da Escola
 * Belem é que yhwh é a ÚNICA designação divina em minúsculas, sempre. Preferir
 * o D1 sem isto reintroduziria a violação em todo o corpus. Rebaixamos apenas o
 * token exato YHWH (com fronteira de palavra) — nada mais é tocado.
 */
function normalizeD1(text) {
  return text.replace(/\bYHWH\b/g, 'yhwh');
}

/** Referências (BOOK CH:VS) auditadas como regressão do D1 → sempre .txt. */
function loadRevertSet() {
  if (SOURCE === 'txt' || !existsSync(REVERT_LIST)) return new Set();
  return new Set(JSON.parse(readFileSync(REVERT_LIST, 'utf8')).refs ?? []);
}

/**
 * Reconcilia a estrutura vinda do .txt com o texto do D1.
 *
 * A estrutura (quais livros/capítulos/versículos existem) vem SEMPRE do .txt,
 * que é a lista canônica versionada; só o TEXTO de cada versículo pode trocar.
 *
 * Duas salvaguardas garantem que o merge SÓ melhora o corpus:
 *
 *  1. "O mais limpo vence" — nenhuma das duas fontes é limpa. O D1 conserta
 *     contaminações do .txt mas introduz outras. Então prefere-se o D1 (mais
 *     avançado), EXCETO quando isso troca um versículo limpo por um contaminado.
 *
 *  2. Lista de reversão (scripts/merge-revert.json) — 205 versículos onde uma
 *     auditoria adversarial confirmou que o texto do D1 é PIOR que o .txt em
 *     latim (truncado, transliteração crua, nome corrompido). Estes ficam no
 *     .txt independentemente do resto.
 */
function applySource(books, apiIndex, revertSet, stats) {
  if (SOURCE === 'txt') return books;
  for (const b of books) {
    const chMap = apiIndex.get(b.code);
    for (const ch of b.chapters) {
      const vMap = chMap?.get(ch.chapter);
      for (const v of ch.verses) {
        const ref = `${b.code} ${ch.chapter}:${v.verse}`;
        if (revertSet.has(ref)) {
          stats.reverted++; // auditado como regressão do D1
          stats.fromTxt++;
          continue;
        }
        const rawApi = vMap?.get(v.verse);
        if (!rawApi) {
          stats.apiMissing++;
          stats.fromTxt++;
          continue;
        }
        const apiText = normalizeD1(rawApi);
        if (/\bYHWH\b/.test(rawApi)) stats.yhwhNormalized++;

        const dirtyTxt = ALIEN_MERGE.test(v.text);
        const dirtyApi = ALIEN_MERGE.test(apiText);

        if (dirtyApi && !dirtyTxt) {
          stats.regressionAvoided++; // D1 sujaria um versículo limpo → mantém .txt
          stats.fromTxt++;
          continue;
        }

        stats.fromApi++;
        if (dirtyTxt && !dirtyApi) stats.contaminationFixed++;
        if (apiText !== v.text) {
          v.text = apiText;
          stats.changed++;
        }
      }
    }
  }
  return books;
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

// Carrega o D1 ANTES de limpar OUT (o cache vive em OUT/.cache/).
const provenance = {
  changed: 0,
  fromApi: 0,
  fromTxt: 0,
  apiMissing: 0,
  contaminationFixed: 0,
  regressionAvoided: 0,
  reverted: 0,
  yhwhNormalized: 0,
};
const apiIndex = SOURCE === 'txt' ? null : loadApiIndex();
const revertSet = loadRevertSet();
applySource(books, apiIndex, revertSet, provenance);
TRANSLATION.textSource =
  SOURCE === 'txt'
    ? 'Bible belem-pt-br/txt (repo)'
    : SOURCE === 'api'
      ? 'D1 (biblia.aculpaedasovelhas.org)'
      : 'merge: D1 quando disponível, senão .txt';

let totalChapters = 0;
let totalVerses = 0;
for (const b of books) {
  totalChapters += b.chapters.length;
  for (const ch of b.chapters) totalVerses += ch.verses.length;
}

// Preserva o cache do D1 ao limpar OUT.
const cacheBackup = existsSync(API_CACHE) ? readFileSync(API_CACHE) : null;
rmSync(OUT, { recursive: true, force: true });
if (cacheBackup) {
  mkdirSync(path.dirname(API_CACHE), { recursive: true });
  writeFileSync(API_CACHE, cacheBackup);
}

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

console.log(`Fonte:       ${SOURCE} — ${TRANSLATION.textSource}`);
console.log(`Livros:      ${books.length}`);
console.log(`Capítulos:   ${totalChapters}`);
console.log(`Versículos:  ${totalVerses}`);
if (SOURCE !== 'txt') {
  console.log(`Proveniência do texto:`);
  console.log(`  do D1:                 ${provenance.fromApi}`);
  console.log(`  do .txt:               ${provenance.fromTxt}`);
  console.log(`    (D1 ausente:         ${provenance.apiMissing})`);
  console.log(`    (regressão evitada:  ${provenance.regressionAvoided})`);
  console.log(`    (revert auditado:    ${provenance.reverted})`);
  console.log(`  versículos alterados:  ${provenance.changed}`);
  console.log(`  contaminação corrigida:${provenance.contaminationFixed}`);
  console.log(`  YHWH→yhwh normalizados:${provenance.yhwhNormalized}`);
}
console.log(`Saída:       ${path.relative(ROOT, OUT)}/`);
console.log(`  json/      ${books.length + 1} arquivos`);
console.log(`  usfm/      ${books.length} arquivos`);
console.log(`  sql/       belem-2025.sql`);
console.log(`  sqlite/    ${sqliteOk ? 'belem-2025.sqlite' : '(pulado — requer Node >= 22)'}`);

if (books.length !== 66) {
  console.error(`\nERRO: esperados 66 livros, encontrados ${books.length}`);
  process.exit(1);
}

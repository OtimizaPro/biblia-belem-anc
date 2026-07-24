#!/usr/bin/env node
/**
 * Baixa o corpus completo do D1 (via API pública) para um cache local, de onde
 * o export-formats.mjs lê quando a fonte é `api` ou `merge`.
 *
 * O D1 é o artefato de tradução mais avançado — recebeu revisões que nunca
 * voltaram para os .txt do repo. Este script materializa esse estado num
 * arquivo, sem tocar em nada versionado.
 *
 * A API limita 100 req/min por IP, então a varredura completa (1.189 capítulos)
 * leva ~13 min. O script é RESUMÍVEL: relê o cache existente e só busca os
 * capítulos ainda ausentes, gravando progresso a cada lote. Rodar de novo após
 * um 429 simplesmente continua de onde parou.
 *
 * Uso: node scripts/fetch-d1.mjs [--out dist/.cache/d1-corpus.json] [--rpm 90]
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://biblia.aculpaedasovelhas.org';

const argv = process.argv.slice(2);
const arg = (name, def) => {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : def;
};
const OUT = path.resolve(ROOT, arg('--out', 'dist/.cache/d1-corpus.json'));
const RPM = Number(arg('--rpm', '90')); // margem sob o teto de 100/min
const MIN_INTERVAL = Math.ceil(60_000 / RPM);

const API_TO_TXT = { REV: 'DES' }; // livro 66: API usa REV, corpus .txt usa DES

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + MIN_INTERVAL;
  if (wait) await sleep(wait);
}

async function getChapter(code, ch) {
  const url = `${BASE}/api/v1/verses/${code}/${ch}`;
  for (let attempt = 1; attempt <= 8; attempt++) {
    await throttle();
    let res;
    try {
      res = await fetch(url);
    } catch {
      await sleep(1000 * attempt);
      continue;
    }
    if (res.ok) {
      const j = await res.json();
      const rows = Array.isArray(j?.data) ? j.data : [];
      return rows
        .map((r) => ({ verse: r.verse, text: (r.literal_pt ?? '').trim() }))
        .filter((v) => Number.isFinite(v.verse))
        .sort((a, b) => a.verse - b.verse);
    }
    if (res.status === 404) return [];
    if (res.status === 429) {
      const resetAt = Number(res.headers.get('X-RateLimit-Reset')) * 1000;
      const wait = Number.isFinite(resetAt) ? Math.max(1000, resetAt - Date.now() + 500) : 15_000;
      process.stderr.write(`\r  429 — aguardando ${Math.ceil(wait / 1000)}s${' '.repeat(20)}`);
      await sleep(wait);
      nextSlot = 0;
      continue;
    }
    await sleep(1000 * attempt);
  }
  return null; // esgotou tentativas
}

// Estrutura autoritativa dos livros
const books = (await getChapterList());
async function getChapterList() {
  const res = await fetch(`${BASE}/api/v1/books`);
  return (await res.json()).data;
}

// Cache existente (resume)
const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { base: BASE, books: [] };
const cacheByCode = new Map(cache.books.map((b) => [b.code, b]));

function ensureBook(code, order, name, count) {
  let b = cacheByCode.get(code);
  if (!b) {
    b = { code, order, name, chapters: Array.from({ length: count }, (_, i) => ({ chapter: i + 1, verses: [] })) };
    cacheByCode.set(code, b);
  }
  return b;
}

function persist() {
  const out = { base: BASE, books: [...cacheByCode.values()].sort((a, b) => a.order - b.order) };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out), 'utf8');
}

// Monta a lista de pendências (capítulos com 0 versículos no cache)
const todo = [];
for (const b of books) {
  const code = API_TO_TXT[b.code] ?? b.code;
  const cb = ensureBook(code, b.canon_order, b.name_pt, b.chapters_count);
  for (let ch = 1; ch <= b.chapters_count; ch++) {
    const cc = cb.chapters.find((c) => c.chapter === ch);
    if (!cc || cc.verses.length === 0) todo.push({ apiCode: b.code, txtCode: code, ch });
  }
}

const totalChapters = books.reduce((a, b) => a + b.chapters_count, 0);
console.error(`total ${totalChapters} capítulos | já em cache ${totalChapters - todo.length} | pendentes ${todo.length}`);

let done = 0;
let failed = 0;
for (const { apiCode, txtCode, ch } of todo) {
  const verses = await getChapter(apiCode, ch);
  if (verses && verses.length > 0) {
    const cb = cacheByCode.get(txtCode);
    const cc = cb.chapters.find((c) => c.chapter === ch);
    cc.verses = verses;
  } else {
    failed++;
  }
  done++;
  if (done % 25 === 0) {
    persist();
    process.stderr.write(`\r  ${done}/${todo.length} pendentes (falhas ${failed})${' '.repeat(15)}`);
  }
}
persist();
process.stderr.write('\n');

// Relatório
let totalVerses = 0;
let stillMissing = 0;
for (const b of cacheByCode.values()) {
  for (const c of b.chapters) {
    totalVerses += c.verses.length;
    if (c.verses.length === 0) stillMissing++;
  }
}
console.log(`Livros:        ${cacheByCode.size}`);
console.log(`Versículos:    ${totalVerses}`);
console.log(`Cap. faltando: ${stillMissing}`);
console.log(`Cache:         ${path.relative(ROOT, OUT)}`);
if (stillMissing > 0) {
  console.error(`\n${stillMissing} capítulos ainda ausentes — rode de novo para continuar.`);
  process.exit(1);
}

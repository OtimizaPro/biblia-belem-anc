#!/usr/bin/env node
/**
 * Diff bidirecional entre as duas fontes de texto: os .txt do repo e o D1.
 *
 * Não basta dizer "o D1 está à frente". É preciso saber, versículo a versículo,
 * o que ele CONSERTA e o que ele QUEBRA — senão um merge cego troca um defeito
 * por outro. Este relatório é o que justifica (ou não) regenerar o corpus a
 * partir do D1.
 *
 * Uso: node scripts/diff-sources.mjs [--api-cache dist/.cache/d1-corpus.json]
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'Bible belem-pt-br', 'txt');
const argv = process.argv.slice(2);
const arg = (n, d) => {
  const i = argv.indexOf(n);
  return i !== -1 ? argv[i + 1] : d;
};
const API_CACHE = path.resolve(ROOT, arg('--api-cache', 'dist/.cache/d1-corpus.json'));

const ALIEN = new RegExp(
  ['[　-〿㐀-䶿一-鿿豈-﫿]', '[Ѐ-ӿԀ-ԯ]', '[؀-ۿݐ-ݿ]', '[가-힯ᄀ-ᇿ]', '[぀-ヿ]', '[ऀ-ॿ]', '[԰-֏]', '[฀-๿]'].join('|')
);

const CHAPTER_RE = /^──\s*Cap[íi]tulo\s+(\d+)\s*──$/;
const VERSE_RE = /^(\d+)\s+(.+)$/;
const RULE_RE = /^[─═]{5,}$/;
const FOOTER_RE = /^Total de vers[íi]culos:/i;

function parseTxt(file) {
  const m = /^(\d{2})_([A-Z0-9]{3})_/.exec(file);
  const code = m[2];
  const lines = readFileSync(path.join(SRC, file), 'utf8').split(/\r?\n/);
  const map = new Map(); // "ch:vs" -> texto
  let cur = null,
    last = null,
    started = false,
    done = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || done) continue;
    const ch = CHAPTER_RE.exec(line);
    if (ch) {
      cur = Number(ch[1]);
      last = null;
      started = true;
      continue;
    }
    if (!started) continue;
    if (FOOTER_RE.test(line)) {
      done = true;
      continue;
    }
    if (RULE_RE.test(line)) continue;
    const v = VERSE_RE.exec(line);
    if (v) {
      last = `${cur}:${Number(v[1])}`;
      map.set(last, v[2].trim());
    } else if (last) {
      map.set(last, map.get(last) + ' ' + line);
    }
  }
  return { code, map };
}

// Índice do D1: code -> "ch:vs" -> texto
const cache = JSON.parse(readFileSync(API_CACHE, 'utf8'));
const api = new Map();
for (const b of cache.books) {
  const m = new Map();
  for (const c of b.chapters) for (const v of c.verses) if (v.text) m.set(`${c.chapter}:${v.verse}`, v.text);
  api.set(b.code, m);
}

const files = readdirSync(SRC)
  .filter((f) => f.endsWith('.txt') && !f.startsWith('00_'))
  .sort();

let total = 0,
  apiHas = 0,
  apiMissing = 0,
  identical = 0,
  differ = 0;
let alienTxt = 0,
  alienApi = 0,
  alienApiNorm = 0;
let fixes = 0, // txt sujo -> D1 limpo
  regress = 0, // txt limpo -> D1 sujo
  bothDirty = 0;
let yhwhUpper = 0; // D1 grava YHWH onde o token existe
const fixSamples = [];
const regressSamples = [];

for (const file of files) {
  const { code, map } = parseTxt(file);
  const am = api.get(code) ?? new Map();
  for (const [ref, txt] of map) {
    total++;
    const raw = am.get(ref);
    if (!raw) {
      apiMissing++;
      if (ALIEN.test(txt)) alienTxt++;
      continue;
    }
    apiHas++;
    const norm = raw.replace(/\bYHWH\b/g, 'yhwh');
    if (/\bYHWH\b/.test(raw)) yhwhUpper++;

    const dTxt = ALIEN.test(txt);
    const dApi = ALIEN.test(norm);
    if (dTxt) alienTxt++;
    if (ALIEN.test(raw)) alienApi++;
    if (dApi) alienApiNorm++;

    if (dTxt && !dApi) {
      fixes++;
      if (fixSamples.length < 8) fixSamples.push({ ref: `${code} ${ref}`, txt: txt.slice(0, 70), api: norm.slice(0, 70) });
    } else if (!dTxt && dApi) {
      regress++;
      if (regressSamples.length < 8) regressSamples.push({ ref: `${code} ${ref}`, txt: txt.slice(0, 70), api: norm.slice(0, 70) });
    } else if (dTxt && dApi) {
      bothDirty++;
    }

    if (norm === txt) identical++;
    else differ++;
  }
}

console.log('=== Diff .txt (repo) vs D1 (API), após normalizar YHWH→yhwh ===\n');
console.log(`versículos no .txt:            ${total}`);
console.log(`  com correspondente no D1:    ${apiHas}`);
console.log(`  ausentes no D1 (mantém .txt): ${apiMissing}`);
console.log(`\ntexto idêntico:               ${identical}`);
console.log(`texto diferente:              ${differ}`);
console.log(`\n--- contaminação (escritas alheias) ---`);
console.log(`versículos sujos no .txt:      ${alienTxt}`);
console.log(`versículos sujos no D1 (bruto):${alienApi}`);
console.log(`versículos sujos no D1 (norm): ${alienApiNorm}`);
console.log(`\nD1 CONSERTA (txt sujo→limpo):  ${fixes}`);
console.log(`D1 QUEBRA (txt limpo→sujo):    ${regress}`);
console.log(`ambos sujos:                   ${bothDirty}`);
console.log(`\nYHWH maiúsculo no D1 (normalizado): ${yhwhUpper}`);

console.log(`\n--- amostras onde o D1 conserta ---`);
for (const s of fixSamples) {
  console.log(`\n  ${s.ref}`);
  console.log(`    txt: ${s.txt}`);
  console.log(`    D1:  ${s.api}`);
}
if (regress > 0) {
  console.log(`\n--- amostras onde o D1 REGREDE (atenção) ---`);
  for (const s of regressSamples) {
    console.log(`\n  ${s.ref}`);
    console.log(`    txt: ${s.txt}`);
    console.log(`    D1:  ${s.api}`);
  }
}

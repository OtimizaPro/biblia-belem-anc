#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';

function queryDB(sql, label) {
  try {
    const r = execSync(
      `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
      { encoding: 'utf-8', timeout: 120000 }
    );
    const jsonStart = r.indexOf('[');
    return JSON.parse(r.substring(jsonStart))[0].results;
  } catch (err) {
    console.error(`Erro ${label}:`, err.message?.substring(0, 300));
    return null;
  }
}

function execFile(filePath) {
  try {
    const r = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${filePath}" --json`,
      { encoding: 'utf-8', timeout: 120000 }
    );
    const jsonStart = r.indexOf('[');
    if (jsonStart !== -1) {
      return JSON.parse(r.substring(jsonStart));
    }
    return null;
  } catch (err) {
    console.error('Erro execFile:', err.message?.substring(0, 300));
    return null;
  }
}

console.log('=== Propagacao AT v2 - Multi-fase ===\n');

// Phase 1: Get empty AT words (paginated)
console.log('Fase 1: Buscando palavras vazias AT...');
const emptyWords = new Set();
let offset = 0;
const pageSize = 5000;

while (true) {
  const sql = `SELECT DISTINCT t.text_utf8 FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '') LIMIT ${pageSize} OFFSET ${offset};`;
  const rows = queryDB(sql, `empty-words-${offset}`);
  if (!rows || rows.length === 0) break;
  for (const r of rows) emptyWords.add(r.text_utf8);
  console.log(`  ... ${emptyWords.size} palavras vazias`);
  if (rows.length < pageSize) break;
  offset += pageSize;
}
console.log(`Total palavras vazias unicas: ${emptyWords.size}\n`);

// Phase 2: Get translated AT words (paginated)
console.log('Fase 2: Buscando traducoes existentes AT...');
const translationMap = new Map();
offset = 0;

while (true) {
  const sql = `SELECT DISTINCT t.text_utf8, t.pt_literal FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' LIMIT ${pageSize} OFFSET ${offset};`;
  const rows = queryDB(sql, `translations-${offset}`);
  if (!rows || rows.length === 0) break;
  for (const r of rows) {
    if (!translationMap.has(r.text_utf8)) {
      translationMap.set(r.text_utf8, r.pt_literal);
    }
  }
  console.log(`  ... ${translationMap.size} traducoes coletadas`);
  if (rows.length < pageSize) break;
  offset += pageSize;
}
console.log(`Total traducoes unicas: ${translationMap.size}\n`);

// Phase 3: Match - find empty words that have existing translations
console.log('Fase 3: Cruzando dados...');
const propagatable = [];
for (const word of emptyWords) {
  if (translationMap.has(word)) {
    propagatable.push({ word, translation: translationMap.get(word) });
  }
}
console.log(`Palavras propagaveis: ${propagatable.length}`);
console.log(`Palavras sem traducao: ${emptyWords.size - propagatable.length}\n`);

// Phase 4: Generate and execute UPDATE statements
if (propagatable.length > 0) {
  console.log('Fase 4: Executando propagacao...');
  const batchSize = 50;
  let totalUpdated = 0;
  let batchNum = 0;

  for (let i = 0; i < propagatable.length; i += batchSize) {
    const batch = propagatable.slice(i, i + batchSize);
    const tmpFile = join(tmpdir(), `propagate-${Date.now()}.sql`);

    const statements = batch.map(({ word, translation }) => {
      const ew = word.replace(/'/g, "''");
      const et = translation.replace(/'/g, "''");
      return `UPDATE tokens SET pt_literal = '${et}' WHERE text_utf8 = '${ew}' AND (pt_literal IS NULL OR pt_literal = '');`;
    }).join('\n');

    writeFileSync(tmpFile, statements, 'utf-8');
    const result = execFile(tmpFile);
    try { unlinkSync(tmpFile); } catch {}

    if (result) {
      for (const r of result) {
        totalUpdated += r?.meta?.changes || 0;
      }
    }
    batchNum++;
    if (batchNum % 5 === 0 || i + batchSize >= propagatable.length) {
      console.log(`  ... batch ${batchNum} (${Math.min(i + batchSize, propagatable.length)}/${propagatable.length}) - ${totalUpdated} tokens atualizados`);
    }
  }
  console.log(`\nPropagacao completa: ${totalUpdated} tokens atualizados\n`);
} else {
  console.log('Nenhuma palavra propagavel encontrada.\n');
}

// Phase 5: Mark remaining empty tokens as [untranslated]
console.log('Fase 5: Marcando tokens vazios restantes como [sem-traducao]...');
const tmpFile = join(tmpdir(), `mark-empty-${Date.now()}.sql`);
writeFileSync(tmpFile, `UPDATE tokens SET pt_literal = '[sem-traducao]' WHERE pt_literal IS NULL OR pt_literal = '';`, 'utf-8');
const markResult = execFile(tmpFile);
try { unlinkSync(tmpFile); } catch {}

if (markResult) {
  const changes = markResult[0]?.meta?.changes || 0;
  console.log(`Tokens marcados como [sem-traducao]: ${changes}\n`);
}

// Phase 6: Verify
console.log('Fase 6: Verificando resultado...');
const verifySQL = `SELECT COUNT(*) as total, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' THEN 1 ELSE 0 END) as translated, SUM(CASE WHEN t.pt_literal LIKE '[%%]' THEN 1 ELSE 0 END) as pending FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40;`;
const verify = queryDB(verifySQL, 'verify');
if (verify && verify[0]) {
  const r = verify[0];
  const pct = ((r.translated / r.total) * 100).toFixed(2);
  console.log(`Total AT: ${r.total}`);
  console.log(`Traduzidos: ${r.translated}`);
  console.log(`Pendentes: ${r.pending}`);
  console.log(`Progresso: ${pct}%`);
}

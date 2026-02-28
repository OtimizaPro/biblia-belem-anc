#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `propagate-${Date.now()}.sql`);

// Step 1: Find all unique empty words that have an existing translation elsewhere
console.log('=== Passo 1: Buscando palavras vazias com traducao existente ===');
const sql1 = `SELECT DISTINCT e.text_utf8, (SELECT t2.pt_literal FROM tokens t2 WHERE t2.text_utf8 = e.text_utf8 AND t2.pt_literal IS NOT NULL AND t2.pt_literal != '' AND t2.pt_literal NOT LIKE '[%]' LIMIT 1) as existing FROM tokens e JOIN verses v ON e.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (e.pt_literal IS NULL OR e.pt_literal = '') AND EXISTS (SELECT 1 FROM tokens t2 WHERE t2.text_utf8 = e.text_utf8 AND t2.pt_literal IS NOT NULL AND t2.pt_literal != '' AND t2.pt_literal NOT LIKE '[%]');`;

let propagatable;
try {
  const r = execSync(
    `npx wrangler d1 execute ${DB} --remote --command "${sql1}" --json`,
    { encoding: 'utf-8', timeout: 120000 }
  );
  propagatable = JSON.parse(r.substring(r.indexOf('[')))[0].results;
  console.log(`Encontradas ${propagatable.length} palavras propagaveis\n`);
} catch (err) {
  console.error('Erro buscando propagaveis:', err.message?.substring(0, 300));
  process.exit(1);
}

// Step 2: Propagate each one
console.log('=== Passo 2: Propagando traducoes ===');
let success = 0;
let errors = 0;
let totalUpdated = 0;

for (const { text_utf8, existing } of propagatable) {
  try {
    const escapedWord = text_utf8.replace(/'/g, "''").replace(/\u2019/g, "\u2019");
    const escapedTranslation = existing.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND (pt_literal IS NULL OR pt_literal = '');`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const jsonStart = result.indexOf('[');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(result.substring(jsonStart));
      const changes = parsed[0]?.meta?.changes || 0;
      totalUpdated += changes;
    }
    success++;
    if (success % 50 === 0) console.log(`  ... ${success}/${propagatable.length} (${totalUpdated} tokens)`);
  } catch (err) {
    errors++;
    if (errors <= 5) console.error(`  ✗ ${text_utf8} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== Propagacao Completa ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total palavras: ${propagatable.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

// Step 3: Mark remaining empty tokens with [untranslated]
console.log('\n=== Passo 3: Marcando restantes como [untranslated] ===');
try {
  const sqlMark = `UPDATE tokens SET pt_literal = '[untranslated]' WHERE (pt_literal IS NULL OR pt_literal = '');`;
  writeFileSync(tmpFile, sqlMark, 'utf-8');
  const r = execSync(
    `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
    { encoding: 'utf-8', timeout: 60000 }
  );
  const jsonStart = r.indexOf('[');
  if (jsonStart !== -1) {
    const parsed = JSON.parse(r.substring(jsonStart));
    const changes = parsed[0]?.meta?.changes || 0;
    console.log(`Tokens marcados como [untranslated]: ${changes}`);
  }
  try { unlinkSync(tmpFile); } catch {}
} catch (err) {
  console.error('Erro marcando:', err.message?.substring(0, 200));
  try { unlinkSync(tmpFile); } catch {}
}

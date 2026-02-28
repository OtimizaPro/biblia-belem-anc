#!/usr/bin/env node
import { execSync } from 'child_process';

const DB = 'biblia-belem';

// General OT progress
const sql1 = `SELECT COUNT(*) as total, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' THEN 1 ELSE 0 END) as translated, SUM(CASE WHEN t.pt_literal LIKE '[%%]' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN t.pt_literal IS NULL OR t.pt_literal = '' THEN 1 ELSE 0 END) as empty FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40;`;

// Per-book breakdown
const sql2 = `SELECT b.name_pt, b.canon_order, COUNT(*) as total_tokens, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' THEN 1 ELSE 0 END) as translated, ROUND(100.0 * SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' THEN 1 ELSE 0 END) / COUNT(*), 1) as pct FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 GROUP BY b.id ORDER BY b.canon_order;`;

// Script info
const sql3 = `SELECT DISTINCT t.script FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 LIMIT 10;`;

try {
  const r1 = execSync(`npx wrangler d1 execute ${DB} --remote --command "${sql1}" --json`, { encoding: 'utf-8', timeout: 60000 });
  const p1 = JSON.parse(r1.substring(r1.indexOf('[')))[0].results[0];
  const pct = p1.total > 0 ? ((p1.translated / p1.total) * 100).toFixed(2) : '0.00';
  console.log(`\n=== Progresso AT (Antigo Testamento) ===`);
  console.log(`Total tokens: ${p1.total}`);
  console.log(`Traduzidos:   ${p1.translated}`);
  console.log(`Pendentes []: ${p1.pending}`);
  console.log(`Vazios:       ${p1.empty}`);
  console.log(`Progresso:    ${pct}%\n`);
} catch (err) {
  console.error('Erro SQL1:', err.message?.substring(0, 200));
}

try {
  const r3 = execSync(`npx wrangler d1 execute ${DB} --remote --command "${sql3}" --json`, { encoding: 'utf-8', timeout: 60000 });
  const p3 = JSON.parse(r3.substring(r3.indexOf('[')))[0].results;
  console.log(`Scripts no AT: ${p3.map(r => r.script).join(', ')}\n`);
} catch (err) {
  console.error('Erro SQL3:', err.message?.substring(0, 200));
}

try {
  const r2 = execSync(`npx wrangler d1 execute ${DB} --remote --command "${sql2}" --json`, { encoding: 'utf-8', timeout: 60000 });
  const p2 = JSON.parse(r2.substring(r2.indexOf('[')))[0].results;
  console.log(`=== Por Livro ===`);
  console.log(`${'Livro'.padEnd(20)} ${'Tokens'.padStart(7)} ${'Trad'.padStart(7)} ${'%'.padStart(7)}`);
  console.log('-'.repeat(45));
  for (const row of p2) {
    console.log(`${row.name_pt.padEnd(20)} ${String(row.total_tokens).padStart(7)} ${String(row.translated).padStart(7)} ${String(row.pct + '%').padStart(7)}`);
  }
} catch (err) {
  console.error('Erro SQL2:', err.message?.substring(0, 200));
}

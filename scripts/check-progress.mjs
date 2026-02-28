#!/usr/bin/env node
import { execSync } from 'child_process';

const DB = 'biblia-belem';

// Use --command with %% to escape % for Windows CMD
const sql = `SELECT COUNT(*) as total, SUM(CASE WHEN t.pt_literal IS NOT NULL AND t.pt_literal != '' AND t.pt_literal NOT LIKE '[%%]' THEN 1 ELSE 0 END) as translated, SUM(CASE WHEN t.pt_literal LIKE '[%%]' THEN 1 ELSE 0 END) as pending FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order >= 40;`;

try {
  const result = execSync(
    `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
    { encoding: 'utf-8', timeout: 60000 }
  );
  const jsonStart = result.indexOf('[');
  const jsonStr = result.substring(jsonStart);
  const parsed = JSON.parse(jsonStr);
  const r = parsed[0].results[0];
  const pct = ((r.translated / r.total) * 100).toFixed(2);
  console.log(`\n=== Progresso NT ===`);
  console.log(`Total tokens: ${r.total}`);
  console.log(`Traduzidos: ${r.translated}`);
  console.log(`Pendentes: ${r.pending}`);
  console.log(`Progresso: ${pct}%\n`);
} catch (err) {
  console.error('Erro:', err.message);
}

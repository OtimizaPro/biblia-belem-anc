#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const DB = 'biblia-belem';

// Extract AT words with frequency 5-9
console.log('=== Extraindo palavras AT freq 5-9 ===\n');

const pageSize = 2000;
let offset = 0;
const allWords = [];

while (true) {
  const sql = `SELECT text_utf8, script, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal LIKE '[%%]' GROUP BY t.text_utf8 HAVING freq >= 5 AND freq <= 9 ORDER BY freq DESC LIMIT ${pageSize} OFFSET ${offset};`;

  try {
    const r = execSync(
      `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
      { encoding: 'utf-8', timeout: 120000 }
    );
    const jsonStart = r.indexOf('[');
    const rows = JSON.parse(r.substring(jsonStart))[0].results;
    if (!rows || rows.length === 0) break;
    allWords.push(...rows);
    console.log(`  ... ${allWords.length} palavras extraidas`);
    if (rows.length < pageSize) break;
    offset += pageSize;
  } catch (err) {
    console.error('Erro:', err.message?.substring(0, 300));
    break;
  }
}

console.log(`\nTotal palavras freq 5-9: ${allWords.length}`);

const totalTokens = allWords.reduce((s, w) => s + w.freq, 0);
console.log(`Total tokens cobertos: ${totalTokens}`);

writeFileSync(
  'scripts/at-freq5-words.json',
  JSON.stringify(allWords, null, 2),
  'utf-8'
);
console.log('Salvo em scripts/at-freq5-words.json');

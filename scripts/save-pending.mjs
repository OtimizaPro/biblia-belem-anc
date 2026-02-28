#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const DB = 'biblia-belem';
const sql = `SELECT DISTINCT t.text_utf8 FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order >= 40 AND t.pt_literal LIKE '[%%]' ORDER BY t.text_utf8;`;

try {
  const result = execSync(
    `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
    { encoding: 'utf-8', timeout: 60000 }
  );
  const jsonStart = result.indexOf('[');
  const jsonStr = result.substring(jsonStart);
  const parsed = JSON.parse(jsonStr);
  const words = parsed[0].results.map(r => r.text_utf8);
  writeFileSync('scripts/pending-words.json', JSON.stringify(words), 'utf8');
  console.log(`Saved ${words.length} pending words to scripts/pending-words.json`);
} catch (err) {
  console.error('Error:', err.message);
}

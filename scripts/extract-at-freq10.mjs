#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const DB = 'biblia-belem';

// Extract all AT words with freq >= 10 that are still pending
const sql = `SELECT t.text_utf8, t.script, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal LIKE '[%%]' GROUP BY t.text_utf8 HAVING freq >= 10 ORDER BY freq DESC;`;

try {
  const result = execSync(
    `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
    { encoding: 'utf-8', timeout: 60000 }
  );
  const jsonStart = result.indexOf('[');
  const parsed = JSON.parse(result.substring(jsonStart))[0].results;

  const words = parsed.map(r => ({ word: r.text_utf8, script: r.script, freq: r.freq }));
  writeFileSync('scripts/at-freq10-words.json', JSON.stringify(words, null, 2), 'utf8');

  console.log(`Extraidas ${words.length} palavras com freq >= 10`);
  console.log(`Total tokens cobertos: ${words.reduce((s, w) => s + w.freq, 0)}`);

  for (const w of words) {
    console.log(`  ${w.word} (${w.script}) freq=${w.freq}`);
  }
} catch (err) {
  console.error('Erro:', err.message?.substring(0, 300));
}

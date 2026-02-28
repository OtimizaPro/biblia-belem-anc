#!/usr/bin/env node
/**
 * Corrige tokens com pt_literal NULL propagando traduções existentes
 * Bíblia Belém An.C 2025
 */

import { execSync } from 'child_process';

function d1(sql) {
  const oneLine = sql.replace(/\s+/g, ' ').trim();
  const escaped = oneLine.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}" --json`;
  try {
    const result = execSync(cmd, { cwd: process.cwd(), encoding: 'utf8', timeout: 60000 });
    const parsed = JSON.parse(result);
    return parsed[0]?.results || [];
  } catch (e) {
    console.error('SQL Error:', oneLine.substring(0, 80));
    return [];
  }
}

async function main() {
  console.log('=== Corrigindo tokens NULL no AT ===\n');

  const nullWords = d1("SELECT DISTINCT t.text_utf8 FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT' AND t.pt_literal IS NULL");

  console.log(`Palavras unicas sem traducao: ${nullWords.length}\n`);

  let fixed = 0;
  let notFound = [];

  for (const row of nullWords) {
    const word = row.text_utf8;
    const wordEsc = word.replace(/'/g, "''");

    const existing = d1(`SELECT pt_literal, COUNT(*) as qty FROM tokens WHERE text_utf8 = '${wordEsc}' AND pt_literal IS NOT NULL GROUP BY pt_literal ORDER BY qty DESC LIMIT 1`);

    if (existing.length > 0 && existing[0].pt_literal) {
      const translation = existing[0].pt_literal;
      const translationEsc = translation.replace(/'/g, "''");

      d1(`UPDATE tokens SET pt_literal = '${translationEsc}' WHERE text_utf8 = '${wordEsc}' AND pt_literal IS NULL`);
      fixed++;
      console.log(`  OK ${word} -> ${translation}`);
    } else {
      notFound.push(word);
      console.log(`  ?? ${word} -- sem traducao existente`);
    }
  }

  console.log(`\n=== Resultado ===`);
  console.log(`Corrigidos: ${fixed}`);
  console.log(`Sem traducao existente: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log(`\nPalavras sem traducao:`);
    notFound.forEach(w => console.log(`  - ${w}`));
  }

  const remaining = d1("SELECT COUNT(*) as total FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT' AND t.pt_literal IS NULL");
  console.log(`\nTokens AT ainda NULL: ${remaining[0]?.total || 0}`);
}

main().catch(console.error);

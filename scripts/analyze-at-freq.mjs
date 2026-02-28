#!/usr/bin/env node
import { execSync } from 'child_process';

const DB = 'biblia-belem';

// Frequency distribution of untranslated AT words
const sql1 = `SELECT t.text_utf8, t.script, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal LIKE '[%%]' GROUP BY t.text_utf8 ORDER BY freq DESC LIMIT 50;`;

// Frequency tiers summary
const sql2 = `SELECT CASE WHEN freq >= 100 THEN '100+' WHEN freq >= 50 THEN '50-99' WHEN freq >= 20 THEN '20-49' WHEN freq >= 10 THEN '10-19' WHEN freq >= 5 THEN '5-9' WHEN freq >= 2 THEN '2-4' ELSE '1' END as tier, COUNT(*) as unique_words, SUM(freq) as total_tokens FROM (SELECT t.text_utf8, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal LIKE '[%%]' GROUP BY t.text_utf8) sub GROUP BY tier ORDER BY MIN(freq) DESC;`;

// Empty tokens analysis
const sql3 = `SELECT t.script, COUNT(*) as cnt FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '') GROUP BY t.script;`;

// Sample empty tokens
const sql4 = `SELECT t.text_utf8, t.script, t.pt_literal, b.name_pt FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '') LIMIT 20;`;

// Total unique untranslated words
const sql5 = `SELECT COUNT(DISTINCT t.text_utf8) as unique_words FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND t.pt_literal LIKE '[%%]';`;

function run(sql, label) {
  try {
    const r = execSync(`npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`, { encoding: 'utf-8', timeout: 60000 });
    const parsed = JSON.parse(r.substring(r.indexOf('[')))[0].results;
    console.log(`\n=== ${label} ===`);
    console.table(parsed);
    return parsed;
  } catch (err) {
    console.error(`Erro ${label}:`, err.message?.substring(0, 200));
    return [];
  }
}

run(sql5, 'Total palavras unicas pendentes AT');
run(sql2, 'Distribuicao por frequencia');
run(sql1, 'Top 50 palavras mais frequentes pendentes');
run(sql3, 'Tokens vazios por script');
run(sql4, 'Amostra de tokens vazios');

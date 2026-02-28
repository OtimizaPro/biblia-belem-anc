#!/usr/bin/env node
import { execSync } from 'child_process';

const DB = 'biblia-belem';

// How many unique empty words?
const sql1 = `SELECT COUNT(DISTINCT t.text_utf8) as unique_empty FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '');`;

// Distribution by book
const sql2 = `SELECT b.name_pt, COUNT(*) as empty_count FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '') GROUP BY b.id ORDER BY empty_count DESC LIMIT 15;`;

// Do these empty tokens overlap with [%] tokens (same word)?
const sql3 = `SELECT COUNT(DISTINCT e.text_utf8) as overlap FROM tokens e JOIN verses v ON e.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (e.pt_literal IS NULL OR e.pt_literal = '') AND EXISTS (SELECT 1 FROM tokens t2 WHERE t2.text_utf8 = e.text_utf8 AND t2.pt_literal IS NOT NULL AND t2.pt_literal != '' AND t2.pt_literal NOT LIKE '[%%]');`;

// Sample of empty tokens with their translated versions
const sql4 = `SELECT e.text_utf8, e.pt_literal as empty_val, t2.pt_literal as existing_translation FROM tokens e JOIN verses v ON e.verse_id = v.id JOIN books b ON v.book_id = b.id LEFT JOIN tokens t2 ON t2.text_utf8 = e.text_utf8 AND t2.pt_literal IS NOT NULL AND t2.pt_literal != '' AND t2.pt_literal NOT LIKE '[%%]' WHERE b.canon_order < 40 AND (e.pt_literal IS NULL OR e.pt_literal = '') LIMIT 20;`;

// Frequency distribution of empty tokens
const sql5 = `SELECT CASE WHEN freq >= 50 THEN '50+' WHEN freq >= 20 THEN '20-49' WHEN freq >= 10 THEN '10-19' WHEN freq >= 5 THEN '5-9' WHEN freq >= 2 THEN '2-4' ELSE '1' END as tier, COUNT(*) as unique_words, SUM(freq) as total_tokens FROM (SELECT t.text_utf8, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.canon_order < 40 AND (t.pt_literal IS NULL OR t.pt_literal = '') GROUP BY t.text_utf8) sub GROUP BY tier ORDER BY MIN(freq) DESC;`;

function run(sql, label) {
  try {
    const r = execSync(`npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`, { encoding: 'utf-8', timeout: 120000 });
    const parsed = JSON.parse(r.substring(r.indexOf('[')))[0].results;
    console.log(`\n=== ${label} ===`);
    console.table(parsed);
    return parsed;
  } catch (err) {
    console.error(`Erro ${label}:`, err.message?.substring(0, 200));
    return [];
  }
}

run(sql1, 'Total palavras unicas vazias');
run(sql5, 'Freq distribution de tokens vazios');
run(sql2, 'Top 15 livros com mais tokens vazios');
run(sql3, 'Overlap: vazios que ja tem traducao em outro lugar');
run(sql4, 'Amostra de tokens vazios + traducao existente');

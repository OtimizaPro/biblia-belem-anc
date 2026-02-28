#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `final17-${Date.now()}.sql`);

// Note: apostrophe words use RIGHT SINGLE QUOTATION MARK (U+2019) = \u2019
const translations = [
  ["Αἰθίοψ", "etiope"],
  ["Γλεύκους", "mosto"],
  ["Δι\u2019", "por"],
  ["Θεότητος", "divindade"],
  ["Κατ\u2019", "segundo"],
  ["Μεθ\u2019", "com"],
  ["ΝΑΖΩΡΑΙΟΣ", "nazareno"],
  ["μηδ\u2019", "nem"],
  ["τροφὸς", "nutriz"],
  ["φανερούμενοι", "sendo-manifestados"],
  ["ἀγαπήσητε", "ameis"],
  ["ἀνεχώρησαν", "retiraram-se"],
  ["ἀρνήσεται", "negara"],
  ["Ἀφ\u2019", "desde"],
  ["Ἐπ\u2019", "sobre"],
  ["Ἐφ\u2019", "sobre"],
  ["ῥυπαρίαν", "imundicia"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''").replace(/\u2019/g, "\u2019");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const jsonStart = result.indexOf('[');
    if (jsonStart === -1) { success++; console.log(`  ✓ ${word} → ${translation}`); continue; }
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const meta = parsed[0]?.meta;
    const changes = meta?.changes || 0;
    totalUpdated += changes;
    success++;
    console.log(`  ✓ ${word} → ${translation} (${changes} tokens)`);
  } catch (err) {
    errors++;
    console.error(`  ✗ ${word} → ${translation} (ERRO: ${err.message?.substring(0, 80)})`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== Final 17 Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

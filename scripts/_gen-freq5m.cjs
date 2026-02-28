#!/usr/bin/env node
/**
 * Generator script: reads Hebrew words from at-freq5-slice-m.json
 * and writes apply-at-freq5m.mjs with exact byte-preserved Hebrew.
 * Run once: node scripts/_gen-freq5m.cjs
 * Then delete this file.
 */
const fs = require('fs');
const path = require('path');

const words = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'at-freq5-slice-m.json'), 'utf-8'
));

const translations = [
  "muito",
  "o-novilho",
  "a-Pascoa",
  "a-praga",
  "o-reino",
  "o-rei",
  "a-guerra",
  "o-altar",
  "o-altar",
  "a-obra",
  "a-noite",
  "o-pao",
  "os-levitas",
  "os-sacerdotes",
  "o-tudo",
  "a-prata",
  "os-judeus",
  "o-bom",
  "o-heveu",
  "o-jumento",
  "aquele",
  "o-que-fala",
  "o-sangue",
  "a-palavra",
  "a-palavra",
  "a-palavra",
  "as-palavras",
  "as-palavras",
  "declara",
  "a-casa",
  "a-casa",
  "louvai",
  "o-rei",
  "o-dia",
  "a-nuvem",
  "os-montes",
  "eis",
  "eles",
  "profetiza",
  "feriu",
  "ela",
  "acaso-nao",
  "fostes",
  "ele",
  "falei",
  "palavras-de",
  "que",
  "seus-caminhos",
  "nacoes",
  "homens",
  "resgatador",
  "Gedalias",
  "grande",
  "nele",
  "casas-de",
  "casas",
  "na-cidade",
  "Beor",
  "seus-filhos",
  "Balaque",
  "Balaque",
  "em-vos",
  "jovem",
  "na-terra",
  "no-fogo",
  "nela",
  "no-covado",
  "vieram",
  "nela",
  "no-campo",
  "no-lugar",
  "no-atrio-de",
  "no-caminho",
  "na-manha",
  "no-decimo",
  "pela-espada",
  "no-ano-de",
  "Benjamim",
  "Balaao",
  "Balaao",
  "entendimento",
  "vestes-de",
  "no-meio-deles",
  "em-Samaria",
  "no-topo",
  "na-minha-boca",
  "por",
  "nas-planicies-de",
  "nos-meus-olhos",
  "nos-olhos-de",
  "no-ribeiro-de",
  "seus-filhos",
  "no-lugar-de",
  "misturada",
  "em-sua-mao",
  "na-mao-de",
  "na-mao-de",
  "em-Israel",
  "suas-vestes",
  "nos-ouvidos-de",
];

if (words.length !== translations.length) {
  console.error(`MISMATCH: words=${words.length} translations=${translations.length}`);
  process.exit(1);
}

// Build pairs with exact Hebrew bytes from JSON
const pairs = words.map((w, i) =>
  `  [${JSON.stringify(w)}, ${JSON.stringify(translations[i])}]`
);

const script = `#!/usr/bin/env node
/**
 * Freq5-9 Batch M (palavras 1201-1300)
 * Aplica tradu\u00e7\u00f5es literais para palavras hebraicas freq 5-9 no AT (parte M)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), \`at-freq5m-\${Date.now()}.sql\`);

const translations = [
  // === Palavras 1201-1300 de at-freq5-slice-m.json (100 palavras) ===
${pairs.join(',\n')},
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(\`\\n=== Freq5-9 Batch M (palavras 1201-1300) ===\`);
console.log(\`Total de tradu\u00e7\u00f5es: \${translations.length}\\n\`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = \`UPDATE tokens SET pt_literal = '\${escapedTranslation}' WHERE text_utf8 = '\${escapedWord}' AND pt_literal LIKE '[%]';\`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      \`npx wrangler d1 execute \${DB} --remote --file "\${tmpFile}" --json\`,
      { encoding: 'utf-8', timeout: 30000 }
    );
    const jsonStart = result.indexOf('[');
    if (jsonStart === -1) { success++; continue; }
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    success++;
    if (success % 10 === 0) console.log(\`  ... \${success}/\${translations.length}\`);
  } catch (err) {
    errors++;
    console.error(\`  \u2717 \${word} (ERRO)\`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(\`\\n=== Freq5-9 Batch M Completo ===\`);
console.log(\`\u2713 \${success} | \u2717 \${errors} | Total: \${translations.length}\`);
console.log(\`Tokens atualizados: \${totalUpdated}\`);
`;

const outPath = path.join(__dirname, 'apply-at-freq5m.mjs');
fs.writeFileSync(outPath, script, 'utf-8');
console.log(`Written: ${outPath}`);

// Verify all Hebrew words are byte-exact in the output
const written = fs.readFileSync(outPath, 'utf-8');
let ok = 0, miss = 0;
for (const w of words) {
  if (written.includes(w)) { ok++; } else { miss++; console.log('MISSING:', w); }
}
console.log(`Verified: ${ok} found, ${miss} missing out of ${words.length}`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 5
 * Aplica traduções literais para palavras gregas freq 7-10 restantes no NT
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch5-${Date.now()}.sql`);

const translations = [
  // freq 17 (falhou no lote 1 por apóstrofo)
  ["τοῦτ'", "isto"],
  // freq 10
  ["Βαρνάβας", "Barnabé"],
  ["Μάρθα", "Marta"],
  ["αἵτινες", "as-quais"],
  ["βαπτισθῆναι", "ser-batizado"],
  ["γίνεσθαι", "tornar-se"],
  ["γενήσεται", "acontecerá"],
  ["γενεὰ", "geração"],
  ["γενεᾶς", "geração"],
  ["γινώσκομεν", "conhecemos"],
  ["γνωστὸν", "conhecido"],
  ["διδασκαλίᾳ", "ensino"],
  ["δοὺς", "dando"],
  ["εἰπών", "dizendo"],
  ["εἰσέλθητε", "entreis"],
  ["εἴπατε", "dizei"],
  ["εἴπωμεν", "digamos"],
  ["εἶναί", "ser"],
  ["θυσίαν", "sacrifício"],
  ["καθώς", "assim-como"],
  ["κώμας", "aldeias"],
  ["λαλοῦμεν", "falamos"],
  ["λεγόμενον", "chamado"],
  ["μετανοίας", "arrependimento"],
  ["μνημείου", "sepulcro"],
  ["οἰκοδομὴν", "edificação"],
  ["παρρησίαν", "ousadia"],
  ["ποιήσατε", "fazei"],
  ["πολλῆς", "muita"],
  ["προσευχῇ", "oração"],
  ["προφήτην", "profeta"],
  ["πρότερον", "antes"],
  ["πρὶν", "antes-de"],
  ["σκοτίᾳ", "trevas"],
  ["σταυρὸν", "cruz"],
  ["στραφεὶς", "voltando-se"],
  ["συμφέρει", "convém"],
  ["συνέδριον", "sinédrio"],
  ["συναγωγὴν", "sinagoga"],
  ["σωθῆναι", "ser-salvo"],
  ["τίνος", "de-quem"],
  ["ταχέως", "rapidamente"],
  ["τινι", "a-alguém"],
  ["τρόπον", "modo"],
  ["φόβῳ", "medo"],
  // freq 9 (falhou no lote 2 por apóstrofo)
  ["ὑφ'", "sob"],
  // freq 8
  ["μέν", "de-fato"],
  ["μήγε", "de-outro-modo"],
  ["οὐδ'", "nem"],
  // freq 7 (falharam no lote 4 por encoding)
  ["αἴρει", "levanta"],
  ["βασιλεῦ", "rei"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 5 (freq 7-10 restantes) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");

    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;

    // Usa arquivo temporário para evitar problemas de encoding no shell
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Strip non-JSON output (--file adds progress indicators)
    const jsonStart = result.indexOf('[');
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;

    if (changes > 0) {
      process.stdout.write(`✓ ${word} → ${translation} (${changes})\n`);
    } else {
      process.stdout.write(`· ${word} → ${translation} (0)\n`);
    }
    success++;
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 5 ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

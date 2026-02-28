#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ar
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 44/44 - ÚLTIMO LOTE)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ar-${Date.now()}.sql`);

const translations = [
  // === Palavras gregas com ῥ/Ῥ (rho) - freq 1 - slice-ar (68 palavras) ===

  // --- ῥ- palavras (minúsculas) - substantivos, verbos, adjetivos ---
  ["ῥίζης", "raiz"],
  ["ῥίψαν", "tendo-lançado"],
  ["ῥίψαντες", "tendo-lançado"],
  ["ῥίψας", "tendo-lançado"],
  ["ῥαβδίζειν", "açoitar-com-varas"],
  ["ῥαβδούχους", "portadores-de-varas"],
  ["ῥαβδοῦχοι", "portadores-de-varas"],
  ["ῥαντίζουσα", "aspergindo"],
  ["ῥαντίσωνται", "asperjam-a-si-mesmos"],
  ["ῥαντισμοῦ", "aspersão"],
  ["ῥαντισμὸν", "aspersão"],
  ["ῥαπίζει", "esbofeteia"],
  ["ῥαπίσμασιν", "bofetadas"],
  ["ῥαπίσματα", "bofetadas"],
  ["ῥεραντισμένοι", "tendo-sido-aspergidos"],
  ["ῥεύσουσιν", "fluirão"],
  ["ῥηθεὶς", "tendo-sido-dito"],
  ["ῥητῶς", "expressamente"],
  ["ῥιζῶν", "raízes"],
  ["ῥιπιζομένῳ", "sendo-agitado-pelas-ondas"],
  ["ῥιπτούντων", "lançando"],
  ["ῥιπῇ", "num-instante"],
  ["ῥοιζηδὸν", "com-estrondo"],
  ["ῥυπαρίαν", "imundícia"],
  ["ῥυπαρᾷ", "imunda"],
  ["ῥυσάσθω", "livre"],
  ["ῥυσθέντας", "tendo-sido-livrados"],
  ["ῥυσθῶ", "seja-livrado"],
  ["ῥυσθῶμεν", "sejamos-livrados"],
  ["ῥυτίδα", "ruga"],
  ["ῥυόμενον", "livrando"],
  ["ῥύεσθαι", "livrar"],
  ["ῥύμαις", "ruelas"],
  ["ῥύμας", "ruelas"],
  ["ῥύπου", "imundícia"],
  ["ῥύσεταί", "livrará"],
  ["ῥύσις", "fluxo"],
  ["ῥᾳδιουργίας", "vilania"],
  ["ῥᾳδιούργημα", "ato-perverso"],
  ["ῥῆγμα", "ruína"],
  ["ῥῆξον", "rasga"],
  ["ῥῦσαι", "livra"],

  // --- Ῥ- palavras (maiúsculas) - nomes próprios e especiais ---
  ["Ῥήγιον", "Régio"],
  ["Ῥαγαῦ", "Ragau"],
  ["Ῥακά", "Racá"],
  ["Ῥαμὰ", "Ramá"],
  ["Ῥαχάβ", "Raabe"],
  ["Ῥαχὴλ", "Raquel"],
  ["Ῥεβέκκα", "Rebeca"],
  ["Ῥησὰ", "Resá"],
  ["Ῥοβοάμ", "Roboão"],
  ["Ῥοβοὰμ", "Roboão"],
  ["Ῥομφά", "Renfã"],
  ["Ῥούθ", "Rute"],
  ["Ῥούφου", "Rufo"],
  ["Ῥοῦφον", "Rufo"],
  ["Ῥυόμενος", "Livrando"],
  ["Ῥωμαίους", "Romanos"],
  ["Ῥωμαίων", "Romanos"],
  ["Ῥωμαϊστί", "Em-romano"],
  ["Ῥωμαῖοί", "Romanos"],
  ["Ῥωμαῖον", "Romano"],
  ["Ῥωμαῖος", "Romano"],
  ["Ῥωμαῖός", "Romano"],
  ["Ῥόδη", "Rode"],
  ["Ῥόδον", "Rodes"],
  ["Ῥώμης", "Roma"],
  ["Ῥώμῃ", "Roma"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ar (freq 1, parte 44/44 - ÚLTIMO LOTE) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );
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

console.log(`\n=== Resultado Lote 11ar (ÚLTIMO LOTE) ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);
console.log(`🎉 TRADUÇÃO NT COMPLETA - Todos os 44 lotes processados!\n`);

#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12e-${Date.now()}.sql`);

const translations = [
  ["ἀμώμου", "irrepreensível"],
  ["ἀνάγκασον", "compele"],
  ["ἀνάμνησις", "recordação"],
  ["ἀνάπαυσιν", "descanso"],
  ["ἀνέβλεψαν", "recuperaram-a-visão"],
  ["ἀνέγκλητος", "irrepreensível"],
  ["ἀνήχθησαν", "foram-levados-ao-mar"],
  ["ἀνίσταται", "levanta-se"],
  ["ἀναβαθμούς", "degraus"],
  ["ἀναγγέλλων", "anunciando"],
  ["ἀναγινώσκετε", "ledes"],
  ["ἀναγινώσκοντες", "lendo"],
  ["ἀναγκαῖά", "necessárias"],
  ["ἀναδείξεως", "manifestação"],
  ["ἀναζητοῦντες", "buscando"],
  ["ἀνακαινώσεως", "renovação"],
  ["ἀνακριθῶ", "seja-interrogado"],
  ["ἀναλογίαν", "proporção"],
  ["ἀναλογίσασθε", "considerai"],
  ["ἀναλῶσαι", "consumir"],
  ["ἀνασταυροῦντας", "crucificando-de-novo"],
  ["ἀναστᾶσα", "tendo-se-levantado"],
  ["ἀνατείλῃ", "nasça"],
  ["ἀνείλατε", "matastes"],
  ["ἀνεβόησεν", "clamou-em-alta-voz"],
  ["ἀνελάβετε", "tomastes"],
  ["ἀνεξίκακον", "paciente"],
  ["ἀνευρόντες", "tendo-encontrado"],
  ["ἀνεχώρησαν", "retiraram-se"],
  ["ἀνεψιὸς", "primo"],
  ["ἀνθίστανται", "resistem"],
  ["ἀνθίστατο", "resistia"],
  ["ἀνθυπάτου", "procônsul"],
  ["ἀνοίξωσιν", "abram"],
  ["ἀνομίαι", "iniquidades"],
  ["ἀνταπόδομά", "retribuição"],
  ["ἀντελάβετο", "socorreu"],
  ["ἀντελοιδόρει", "não-injuriava-em-troca"],
  ["ἀντικατέστητε", "resististes"],
  ["ἀντιλέγεται", "é-contradito"],
  ["ἀντλῆσαι", "tirar-água"],
  ["ἀνωτερικὰ", "superiores"],
  ["ἀπέβησαν", "desembarcaram"],
  ["ἀπέλυσε", "libertou"],
  ["ἀπέσπασεν", "separou-se"],
  ["ἀπέστησαν", "apartaram-se"],
  ["ἀπέστησεν", "afastou"],
  ["ἀποφθέγγεσθαι", "pronunciar"],
  ["ἀποχωρήσας", "tendo-se-retirado"],
  ["ἀποχωρισθῆναι", "serem-separados"],
  ["ἀπόκειται", "está-reservado"],
  ["ἀπόλλυμαι", "pereço"],
  ["ἀπόλλυνται", "perecem"],
  ["ἀπόστειλον", "envia"],
  ["ἀρέσαι", "agradar"],
  ["ἀργυρίῳ", "prata"],
  ["ἀρεσκόντων", "agradando"],
  ["ἀριστήσατε", "comei-a-refeição-da-manhã"],
  ["ἀρνήσεται", "negará"],
  ["ἀροτριᾶν", "arar"],
  ["ἀροτριῶντα", "arando"],
  ["ἀρραβὼν", "penhor"],
  ["ἀρτυθήσεται", "será-temperado"],
  ["ἀρτύσετε", "temperareis"],
  ["ἀρχάγγελος", "arcanjo"],
  ["ἀρχαγγέλου", "arcanjo"],
  ["ἀσεβειῶν", "impiedades"],
  ["ἀσθενήματα", "fraquezas"],
  ["ἀσθενήσασαν", "tendo-adoecido"],
  ["ἀσπάζεσθαι", "saudar"],
  ["ἀσπίλου", "imaculada"],
  ["ἀσπασμοῦ", "saudação"],
  ["ἀστοχήσαντες", "tendo-se-desviado"],
  ["ἀστράπτουσα", "relampejando"],
  ["ἀστραπῇ", "relâmpago"],
  ["ἀσχήμονα", "indecorosas"],
  ["ἀσχημονεῖ", "age-indecentemente"],
  ["ἀσωτία", "dissolução"],
  ["ἀτιμάζεις", "desonras"],
  ["ἀτμίδα", "vapor"],
  ["ἀτόπων", "perversos"],
  ["ἀφήκατε", "deixastes"],
  ["ἀφήσεις", "deixarás"],
  ["ἀφήσουσιν", "deixarão"],
  ["ἀφίκετο", "chegou"],
  ["ἀφίομεν", "perdoamos"],
  ["ἀφαιρεθήσεται", "será-tirado"],
  ["ἀφροσύνης", "insensatez"],
  ["ἀφῆκέν", "deixou"],
  ["ἀψευδὴς", "que-não-mente"],
  ["ἁγιάζεται", "é-santificado"],
  ["ἁγιωσύνῃ", "santidade"],
  ["ἁγιωτάτῃ", "santíssima"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

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
    if (jsonStart === -1) { success++; continue; }
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.results?.[0]?.['Rows written'] || 0;
    totalUpdated += changes;
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    console.error(`  ✗ ${word} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== Retry 12e Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

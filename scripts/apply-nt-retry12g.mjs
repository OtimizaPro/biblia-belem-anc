#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12g-${Date.now()}.sql`);

const translations = [
  ["ἐξουθενείτω", "que-não-menospreze"],
  ["ἐξουθενημένα", "menosprezadas"],
  ["ἐξόδου", "partida"],
  ["ἐξῄεσαν", "saíam"],
  ["ἐπάξας", "tendo-trazido-sobre"],
  ["ἐπέγνωμεν", "conhecemos-plenamente"],
  ["ἐπέμεινα", "permaneci"],
  ["ἐπένευσεν", "consentiu"],
  ["ἐπέχρισέν", "ungiu-sobre"],
  ["ἐπέχων", "prestando-atenção"],
  ["ἐπιγεγραμμένη", "tendo-sido-inscrita"],
  ["ἐπισυναγωγῆς", "reunião"],
  ["ἐργάτην", "obreiro"],
  ["ἐρωτήσετε", "perguntareis"],
  ["ἐφυσιώθησάν", "foram-ensoberbecidos"],
  ["ἔζων", "viviam"],
  ["ἔκαμψαν", "dobraram"],
  ["ἔσπειρεν", "semeou"],
  ["ἔτιλλον", "arrancavam"],
  ["ἕτεραι", "outras"],
  ["ἕτοιμον", "preparado"],
  ["Ἐνδύσασθε", "Revesti-vos"],
  ["Ἐπ'", "sobre"],
  ["Ἐφ'", "sobre"],
  ["Ἑκουσίως", "Voluntariamente"],
  ["Ἕν", "Um"],
  ["ἠπατήθη", "foi-enganada"],
  ["ἠτακτήσαμεν", "fomos-desordenados"],
  ["ἠτιμάσατε", "desonrastes"],
  ["ἡγείσθωσαν", "que-liderem"],
  ["ἡγοῦνται", "consideram"],
  ["ἡμέτερον", "nosso"],
  ["ἡμίσειά", "metade"],
  ["ἡμετέραις", "nossas"],
  ["ἡμετέροις", "nossos"],
  ["ἡρμοσάμην", "desposei"],
  ["ἡσσώθητε", "fostes-inferiorizados"],
  ["ἡσυχίου", "tranquilo"],
  ["ἤγειραν", "levantaram"],
  ["ἤγεσθε", "éreis-conduzidos"],
  ["ἤπιον", "brandos"],
  ["ἤρεμον", "sereno"],
  ["ἦρεν", "levantou"],
  ["ἦς", "eras"],
  ["Ἡρῳδιὰς", "Herodias"],
  ["Ἡσαΐᾳ", "Isaías"],
  ["Ἥδιστα", "Muito-prazerosamente"],
  ["ἰατρὸς", "médico"],
  ["ἰκμάδα", "umidade"],
  ["ἰοῦ", "veneno"],
  ["ἰσάγγελοι", "iguais-a-anjos"],
  ["ἰσχυρότεροι", "mais-fortes"],
  ["ἰσχυρότερος", "mais-forte"],
  ["ἰσχυρὰν", "forte"],
  ["ἰσχυρᾶς", "forte"],
  ["ἰσχύσουσιν", "prevalecerão"],
  ["ἰσότης", "igualdade"],
  ["ἱερατεύειν", "exercer-sacerdócio"],
  ["ἱερόθυτόν", "sacrificado-em-templo"],
  ["ἱκαναῖς", "suficientes"],
  ["ἱκανοὺς", "suficientes"],
  ["ἱκανοῦ", "suficiente"],
  ["ἱματισμὸς", "vestimenta"],
  ["ἴαται", "cura"],
  ["Ἰάρετ", "Jared"],
  ["Ἰερειχώ", "Jericó"],
  ["Ἰερεμίου", "Jeremias"],
  ["ὀστράκινα", "de-barro"],
  ["ὀφθήσομαί", "serei-visto"],
  ["ὁδηγῇ", "guie"],
  ["ὁλόκληροι", "íntegros"],
  ["ὁρῶσαι", "vendo"],
  ["ὄνου", "jumento"],
  ["Ὀζείας", "Ozias"],
  ["ὑμετέραν", "vossa"],
  ["ὑψωθῆτε", "sede-exaltados"],
  ["ὠφείλομεν", "devemos"],
  ["ὡμίλει", "conversava"],
  ["ὡμίλουν", "conversavam"],
  ["ῥίψαν", "tendo-lançado"],
  ["ῥίψαντες", "tendo-lançado"],
  ["ῥαβδίζειν", "açoitar-com-varas"],
  ["ῥαντισμοῦ", "aspersão"],
  ["ῥαπίσματα", "bofetadas"],
  ["ῥοιζηδὸν", "com-estrondo"],
  ["ῥυπαρίαν", "imundícia"],
  ["ῥυσθῶμεν", "sejamos-livrados"],
  ["ῥυόμενον", "livrando"],
  ["ῥῆξον", "rasga"],
  ["ῥῦσαι", "livra"],
  ["Ῥησὰ", "Resa"],
  ["Ῥούφου", "Rufo"],
  ["Ῥυόμενος", "Livrando"],
  ["Ῥώμῃ", "Roma"],
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
console.log(`\n=== Retry 12g Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

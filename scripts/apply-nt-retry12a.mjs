#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12a-${Date.now()}.sql`);

const translations = [
  ["ΑΝΑΘΕΜΑ", "anátema"],
  ["Αἰθίοψ", "Etíope"],
  ["Αἴτησόν", "Pede"],
  ["Αὔριον", "Amanhã"],
  ["Βαπτιστής", "Batista"],
  ["Βαρβάροις", "bárbaros"],
  ["Βελιάρ", "Beliar"],
  ["Βλέπομεν", "vemos"],
  ["Βοανηργές", "Boanerges"],
  ["Γάζαν", "Gaza"],
  ["Γαββαθα", "Gabatá"],
  ["Γαλιλαίου", "Galileu"],
  ["Γενομένων", "tendo-acontecido"],
  ["Γινώσκειν", "conhecer"],
  ["Γλεύκους", "mosto"],
  ["Γολγοθᾶν", "Gólgota"],
  ["Γομόρρων", "Gomorra"],
  ["Δείξατέ", "Mostrai"],
  ["Διακούσομαί", "ouvirei-plenamente"],
  ["Διακόνους", "servos"],
  ["Διασπορὰν", "dispersão"],
  ["Διασπορᾶς", "dispersão"],
  ["Δι'", "por"],
  ["Δυνάμεις", "poderes"],
  ["Εὐλογητοῦ", "Bendito"],
  ["Ζηλωτὴν", "zelote"],
  ["Ζηλώσαντες", "tendo-zelado"],
  ["Θάρα", "Terá"],
  ["Θέλετε", "quereis"],
  ["Θαδδαῖος", "Tadeu"],
  ["Θαυμάζω", "admiro-me"],
  ["Θεότητος", "divindade"],
  ["Θυατείρων", "Tiatira"],
  ["Καί", "E"],
  ["Καίσαρί", "César"],
  ["Καλοὺς", "bons"],
  ["Κανδάκης", "Candace"],
  ["Κατ'", "segundo"],
  ["Κλωπᾶ", "Clopas"],
  ["Κυπρίῳ", "cipriota"],
  ["Κυρήνην", "Cirene"],
  ["Κωσὰμ", "Cosã"],
  ["Κύπριος", "cipriota"],
  ["Κῶ", "Cós"],
  ["Λαοδικέων", "Laodiceia"],
  ["Λευείτας", "levitas"],
  ["Λυδίαν", "Lídia"],
  ["Λυκίας", "Lícia"],
  ["Μαθθὰν", "Matã"],
  ["Μακάριος", "bem-aventurado"],
  ["Μακεδών", "macedônio"],
  ["Μαρίᾳ", "Maria"],
  ["Μεθ'", "com"],
  ["Μεσοποταμίαν", "Mesopotâmia"],
  ["Μεσσίαν", "Messias"],
  ["Μηδένα", "ninguém"],
  ["Μωϋσέα", "Moisés"],
  ["ΝΑΖΩΡΑΙΟΣ", "nazareno"],
  ["Ναΐν", "Naim"],
  ["Ναὶ", "Sim"],
  ["Νικόλαον", "Nicolau"],
  ["Νινευείταις", "ninivitas"],
  ["Νύμφαν", "Ninfa"],
  ["Ξένων", "hospedagens"],
  ["Οὐρίου", "Urias"],
  ["Πάγου", "Areópago"],
  ["Πάρθοι", "partos"],
  ["Πάταρα", "Pátara"],
  ["Πέργῃ", "Perge"],
  ["Παραγγέλλω", "ordeno"],
  ["Παρμενᾶν", "Pármenas"],
  ["Πειθαρχεῖν", "obedecer"],
  ["Πεποίθησιν", "confiança"],
  ["Περσίδα", "Pérsida"],
  ["Ποίμαινε", "pastoreia"],
  ["Ποιμένα", "pastor"],
  ["Ποντικὸν", "pôntico"],
  ["αὐλὸς", "flauta"],
  ["αὐτόπται", "testemunhas-oculares"],
  ["αὐχμηρῷ", "sombrio"],
  ["βάθη", "profundezas"],
  ["βάπτισαι", "batiza-te"],
  ["βάψας", "tendo-mergulhado"],
  ["βαΐα", "ramos-de-palmeira"],
  ["βαθέως", "profundamente"],
  ["βαλλόμενα", "sendo-lançadas"],
  ["βαλοῦσα", "tendo-lançado"],
  ["βαπτίζεις", "batizas"],
  ["βαπτισμῶν", "batismos"],
  ["βασιλίσσης", "rainha"],
  ["βασιλεύει", "reina"],
  ["βασιλεύς", "rei"],
  ["βεβαίωσιν", "confirmação"],
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
console.log(`\n=== Retry 12a Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

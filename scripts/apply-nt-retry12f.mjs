#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12f-${Date.now()}.sql`);

const translations = [
  ["ἁγιότητος", "santidade"],
  ["ἁγνάς", "puras"],
  ["ἁγνίζει", "purifica"],
  ["ἁγνὸν", "puro"],
  ["ἁλλόμενος", "saltando"],
  ["ἁμάρτητε", "pequeis"],
  ["ἁρμῶν", "juntas"],
  ["ἄγρια", "selvagens"],
  ["ἄδικός", "injusto"],
  ["ἄκαρποι", "infrutíferos"],
  ["ἄμμον", "areia"],
  ["ἄμμος", "areia"],
  ["ἄναλον", "insípido"],
  ["ἄπιστοι", "incrédulos"],
  ["ἄροτρον", "arado"],
  ["ἄρρωστοι", "enfermos"],
  ["ἄρχουσιν", "governantes"],
  ["ἄσπασαι", "saúda"],
  ["ἄφαντος", "invisível"],
  ["ἄφιξίν", "partida"],
  ["ἅπτει", "acende"],
  ["ἅρμα", "carro"],
  ["ἅψῃ", "toques"],
  ["ἆρόν", "levanta"],
  ["Ἀνοίξω", "Abrirei"],
  ["Ἀφ'", "de"],
  ["ἐβάσταζεν", "carregava"],
  ["ἐγκράτειαν", "domínio-próprio"],
  ["ἐγρηγόρησεν", "vigiou"],
  ["ἐδέξασθέ", "recebestes"],
  ["ἐζητεῖτο", "era-procurado"],
  ["ἐλεῶντος", "tendo-misericórdia"],
  ["ἐληλακότες", "tendo-remado"],
  ["ἐλθόντας", "tendo-vindo"],
  ["ἐλογίσθημεν", "fomos-considerados"],
  ["ἐλπίδα", "esperança"],
  ["ἐλυτρώθητε", "fostes-resgatados"],
  ["ἐμήν", "minha"],
  ["ἐμήνυσεν", "revelou"],
  ["ἐμαθητεύθη", "foi-feito-discípulo"],
  ["ἐμαρτυρήσαμεν", "testemunhamos"],
  ["ἐμβάντες", "tendo-embarcado"],
  ["ἐμβλέψατε", "olhai"],
  ["ἐμελέτησαν", "tramaram"],
  ["ἐμεσίτευσεν", "mediou"],
  ["ἐμπίπτουσιν", "caem-em"],
  ["ἐμπαίζειν", "escarnecer"],
  ["ἐμπαίξουσιν", "escarnecerão"],
  ["ἐμπορίαν", "comércio"],
  ["ἐμπορεύσονται", "negociarão"],
  ["ἐμφανίζειν", "manifestar"],
  ["ἐμφόβων", "atemorizados"],
  ["ἐνίψατο", "lavou"],
  ["ἐνδοξασθῆναι", "ser-glorificado"],
  ["ἐνεδείξατο", "demonstrou"],
  ["ἐνετειλάμην", "ordenei"],
  ["ἐνεχθεῖσαν", "tendo-sido-trazida"],
  ["ἐνεῖχεν", "guardava-rancor"],
  ["ἐνιαυτοὺς", "anos"],
  ["ἐνκαθέτους", "espiões"],
  ["ἐνταφιασμόν", "sepultamento"],
  ["ἐντετυπωμένη", "tendo-sido-gravada"],
  ["ἐντρέπομαι", "envergonho-me"],
  ["ἐντυγχάνειν", "interceder"],
  ["ἐνυπνιαζόμενοι", "sonhando"],
  ["ἐνόμισαν", "supuseram"],
  ["ἐνόμισας", "supuseste"],
  ["ἐξάγει", "conduz-para-fora"],
  ["ἐξάγουσιν", "conduzem-para-fora"],
  ["ἐξάπινα", "repentinamente"],
  ["ἐξάρατε", "expulsai"],
  ["ἐξέβησαν", "saíram"],
  ["ἐξέμασσεν", "enxugava"],
  ["ἐξέπεσαν", "caíram"],
  ["ἐξήλθομεν", "saímos"],
  ["ἐξήρανεν", "secou"],
  ["ἐξαγαγών", "tendo-conduzido-para-fora"],
  ["ἐξαιρούμενός", "livrando"],
  ["ἐξαπατηθεῖσα", "tendo-sido-enganada"],
  ["ἐξαπατῶσιν", "enganam"],
  ["ἐξαρτίσαι", "completar"],
  ["ἐξεθαύμαζον", "admiravam-grandemente"],
  ["ἐξεκομίζετο", "era-levado-para-fora"],
  ["ἐξεκόπης", "foste-cortado"],
  ["ἐξελέσθαι", "livrar"],
  ["ἐξεληλυθυῖαν", "tendo-saído"],
  ["ἐξενεγκεῖν", "levar-para-fora"],
  ["ἐξεπλήσσετο", "ficava-maravilhado"],
  ["ἐξετάσαι", "examinar"],
  ["ἐξεχύθη", "derramou-se"],
  ["ἐξισχύσητε", "sejais-plenamente-capazes"],
  ["ἐξολεθρευθήσεται", "será-totalmente-destruído"],
  ["ἐξομολογήσεται", "confessará"],
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
console.log(`\n=== Retry 12f Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

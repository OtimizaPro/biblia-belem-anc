#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12d-${Date.now()}.sql`);

const translations = [
  ["τιμήσατε", "honrai"],
  ["τιμᾶτε", "honrais"],
  ["τοιᾶσδε", "de-tal-tipo"],
  ["τοπάζιον", "topázio"],
  ["τοσοῦτοι", "tantos"],
  ["τρέχοντος", "correndo"],
  ["τρέχουσιν", "correm"],
  ["τραπέζαις", "mesas"],
  ["τριετίαν", "triênio"],
  ["τροφή", "alimento"],
  ["τροφὰς", "alimentos"],
  ["τροφὸς", "nutriz"],
  ["τροχὸν", "roda"],
  ["τρόμῳ", "tremor"],
  ["τρόπος", "modo"],
  ["τυγχάνοντες", "obtendo"],
  ["τυπικῶς", "tipologicamente"],
  ["τυφόμενον", "sendo-enfumaçado"],
  ["τύπους", "modelos"],
  ["τύπτοντί", "golpeando"],
  ["υἱοθεσίας", "adoção-como-filhos"],
  ["φάγῃς", "comas"],
  ["φάτνης", "manjedoura"],
  ["φέρουσαι", "carregando"],
  ["φέρουσαν", "carregando"],
  ["φίλας", "amigas"],
  ["φίλαυτοι", "amantes-de-si-mesmos"],
  ["φαινομένου", "aparecendo"],
  ["φανέρωσις", "manifestação"],
  ["φανερούμενοι", "sendo-manifestados"],
  ["φανεροῦντι", "manifestando"],
  ["φανερώσω", "manifestarei"],
  ["φανῇς", "apareças"],
  ["φανῶν", "lanternas"],
  ["φερομένης", "sendo-carregada"],
  ["φερώμεθα", "sejamos-levados"],
  ["φθαρτοῦ", "corruptível"],
  ["φθαρτῆς", "corruptível"],
  ["φθείρει", "corrompe"],
  ["φθονοῦντες", "invejando"],
  ["φθορὰ", "corrupção"],
  ["φιλάγαθον", "amante-do-bem"],
  ["φιλόνεικος", "contencioso"],
  ["χωροῦσαι", "contendo"],
  ["χόρτον", "erva"],
  ["ψευδαδέλφοις", "falsos-irmãos"],
  ["ψευδομαρτυρίαι", "falsos-testemunhos"],
  ["ψευδοπροφητῶν", "falsos-profetas"],
  ["ψεύσταις", "mentirosos"],
  ["ψηλαφήσειαν", "tateassem"],
  ["ψιθυριστάς", "murmuradores"],
  ["ψύχει", "esfria"],
  ["ἀΐδιος", "eterno"],
  ["ἀγαγόντα", "tendo-conduzido"],
  ["ἀγαθοποιοῦσαι", "fazendo-o-bem"],
  ["ἀγαθοὺς", "bons"],
  ["ἀγαλλιάσεως", "exultação"],
  ["ἀγανακτεῖν", "indignar-se"],
  ["ἀγανακτοῦντες", "indignando-se"],
  ["ἀγαπήσητε", "ameis"],
  ["ἀγενεαλόγητος", "sem-genealogia"],
  ["ἀγενῆ", "ignóbil"],
  ["ἀγνοίας", "ignorância"],
  ["ἀγριελαίου", "oliveira-brava"],
  ["ἀγρῶν", "campos"],
  ["ἀγόμενα", "sendo-conduzidos"],
  ["ἀδίκημα", "injustiça"],
  ["ἀδίκως", "injustamente"],
  ["ἀδιάκριτος", "imparcial"],
  ["ἀδικήσει", "cometerá-injustiça"],
  ["ἀδικεῖσθε", "sois-injustiçados"],
  ["ἀδόκιμοί", "reprovados"],
  ["ἀθά", "vem"],
  ["ἀθέμιτόν", "ilícito"],
  ["ἀθεμίτοις", "ilícitos"],
  ["ἀθετήσας", "tendo-rejeitado"],
  ["ἀκατάγνωστον", "irrepreensível"],
  ["ἀκοαί", "rumores"],
  ["ἀκολουθοῦντας", "seguindo"],
  ["ἀκολουθοῦντι", "seguindo"],
  ["ἀλάλους", "mudos"],
  ["ἀλαζόνας", "arrogantes"],
  ["ἀληθεύων", "falando-a-verdade"],
  ["ἀλλάξει", "mudará"],
  ["ἀλληγορούμενα", "sendo-alegorizado"],
  ["ἀλλοτρίαν", "alheia"],
  ["ἀμέλει", "descuida"],
  ["ἀμαράντινον", "imarcescível"],
  ["ἀμετάθετον", "imutável"],
  ["ἀμεταθέτων", "imutáveis"],
  ["ἀμνὸς", "cordeiro"],
  ["ἀμοιβὰς", "retribuições"],
  ["ἀμπέλῳ", "videira"],
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
console.log(`\n=== Retry 12d Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

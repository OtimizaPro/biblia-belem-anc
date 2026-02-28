#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12b-${Date.now()}.sql`);

const translations = [
  // === beta (β) words ===
  ["βεβαιούμενοι", "sendo-confirmados"],
  ["βεβαιῶν", "confirmando"],
  ["βεβλημένην", "tendo-sido-lançada"],
  ["βιβλία", "livros"],
  ["βιβλίῳ", "livro"],
  ["βλασφημίας", "blasfêmia"],
  ["βλασφημηθήσεται", "será-blasfemado"],
  ["βλασφημούντων", "blasfemando"],
  ["βλασφημοῦντας", "blasfemando"],
  ["βλεπόντων", "vendo"],
  ["βλητέον", "deve-ser-posto"],
  ["βοηθεῖτε", "auxiliai"],
  ["βοηθός", "auxiliador"],
  ["βοηθῆσαι", "auxiliar"],
  ["βούλημα", "vontade"],
  ["βραχίονι", "braço"],
  ["βρόχον", "laço"],

  // === zeta (ζ) words ===
  ["ζήτησις", "busca"],
  ["ζημιωθήσεται", "sofrerá-perda"],
  ["ζητήματά", "questões"],
  ["ζητήσῃ", "busque"],
  ["ζητείτω", "busque"],
  ["ζητοῦντι", "buscando"],
  ["ζιζάνιά", "joio"],
  ["ζυγόν", "jugo"],
  ["ζωοποιῆσαι", "vivificar"],
  ["ζόφῳ", "trevas"],
  ["ζώνην", "cinto"],
  ["ζῆτε", "vivais"],
  ["ζῶν", "vivendo"],

  // === eta (η) words ===
  ["ηὐδοκήσαμεν", "comprazemo-nos"],
  ["ηὐλίσθη", "hospedou-se"],

  // === theta (θ) words ===
  ["θάλπει", "cuida"],
  ["θάμβους", "espanto"],
  ["θέλοντί", "querendo"],
  ["θήκην", "bainha"],
  ["θήλειαι", "fêmeas"],
  ["θανάτοις", "mortes"],
  ["θαρρῆσαι", "ter-confiança"],
  ["θαρσεῖτε", "tende-ânimo"],
  ["θαυμάσαι", "maravilhar-se"],
  ["θαυμάσαντες", "tendo-se-maravilhado"],
  ["θελήματα", "vontades"],
  ["θεοσεβὴς", "piedoso-a-Theos"],
  ["θεραπεύει", "cura"],
  ["θερισμόν", "ceifa"],
  ["θεωρῶσιν", "contemplem"],
  ["θλίψεσίν", "tribulações"],
  ["θλίψεως", "tribulação"],
  ["θρησκείας", "religião"],
  ["θριαμβεύσας", "tendo-triunfado"],
  ["θροεῖσθαι", "alarmar-se"],
  ["θυγάτριον", "filhinha"],
  ["θυγάτριόν", "filhinha"],
  ["θυγατέρας", "filhas"],
  ["θυγατέρων", "filhas"],
  ["θυγατρός", "filha"],

  // === kappa (κ) words ===
  ["κακία", "maldade"],
  ["κατήλθαμεν", "descemos"],
  ["καταρώμεθα", "amaldiçoamos"],
  ["κεκράτηνται", "têm-sido-retidos"],
  ["κεκρατηκέναι", "ter-retido"],
  ["κενοδοξίαν", "vanglória"],
  ["κεραία", "til"],
  ["κερδήσας", "tendo-ganho"],
  ["κερδῆσαί", "ganhar"],
  ["κεχάρισταί", "tem-sido-concedido"],
  ["κεχάρισται", "tem-sido-concedido"],
  ["κεχαριτωμένη", "tendo-sido-agraciada"],
  ["κεχρηματισμένον", "tendo-sido-revelado"],
  ["κημώσεις", "amordaçarás"],
  ["κηρύξας", "tendo-proclamado"],
  ["κηρύξω", "proclamarei"],
  ["κηρύσσεται", "é-proclamado"],
  ["κινούμεθα", "movemo-nos"],
  ["κλήρου", "herança"],
  ["κλαίουσιν", "choram"],
  ["κληθέντος", "tendo-sido-chamado"],
  ["κλιναρίων", "leitos"],
  ["κλινουσῶν", "inclinando"],
  ["κλυδωνιζόμενοι", "sendo-agitados-por-ondas"],
  ["κλῶντές", "partindo"],
  ["κνηθόμενοι", "tendo-coceira"],
  ["κοδράντην", "quadrante"],
  ["κοδράντης", "quadrante"],
  ["κοιμηθησόμεθα", "adormeceremos"],
  ["κοιμωμένους", "adormecidos"],
  ["κοινωνεῖ", "participa"],
  ["κοκκίνην", "escarlate"],
  ["κολληθέντα", "tendo-sido-unido"],
  ["κολληθέντες", "tendo-sido-unidos"],
  ["κολλώμενοι", "unindo-se"],
  ["κολοβωθήσονται", "serão-encurtados"],
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
console.log(`\n=== Retry 12b Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

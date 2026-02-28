#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11n
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 14/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11n-${Date.now()}.sql`);

const translations = [
  // === freq 1 palavras gregas - lote 11n (parte 14/44) - 248 palavras ===

  // --- λιθ- / λιμ- palavras ---
  ["λιθοβολῆσαι", "apedrejar"],
  ["λιμένα", "porto"],
  ["λιμένος", "porto"],
  ["λιμοί", "fomes"],
  ["λιμὸν", "fome"],
  ["λιμῷ", "fome"],

  // --- λοίδ- / λογ- palavras ---
  ["λοίδοροι", "injuriadores"],
  ["λοίδορος", "injuriador"],
  ["λογίαι", "coletas"],
  ["λογίας", "coleta"],
  ["λογίζεσθαι", "considerar"],
  ["λογίζῃ", "consideras"],
  ["λογίσασθαί", "considerar"],
  ["λογίων", "oráculos"],
  ["λογιζομένους", "considerando"],
  ["λογιζομένῳ", "ao-que-considera"],
  ["λογιζόμεθα", "consideramos"],
  ["λογιζόμενος", "considerando"],
  ["λογικὴν", "racional"],
  ["λογικὸν", "racional"],
  ["λογισάμενος", "tendo-considerado"],
  ["λογισθήσεται", "será-considerado"],
  ["λογισθείη", "seja-considerado"],
  ["λογισμοὺς", "raciocínios"],
  ["λογισμῶν", "raciocínios"],
  ["λογομαχίας", "contenda-de-palavras"],
  ["λογομαχεῖν", "contender-sobre-palavras"],

  // --- λοιδ- palavras ---
  ["λοιδορίαν", "injúria"],
  ["λοιδορεῖς", "injurias"],
  ["λοιδορούμενοι", "sendo-injuriados"],
  ["λοιδορούμενος", "sendo-injuriado"],

  // --- λοιμ- / λοιπ- palavras ---
  ["λοιμοὶ", "pestilências"],
  ["λοιμὸν", "pestilento"],
  ["λοιποὶ", "restantes"],

  // --- λου- palavras ---
  ["λουσαμένη", "tendo-se-lavado"],
  ["λουτροῦ", "lavagem"],
  ["λουτρῷ", "lavagem"],
  ["λούσαντες", "tendo-lavado"],

  // --- λυ- palavras (λύω = desatar/soltar) ---
  ["λυθήσονται", "serão-desatados"],
  ["λυθείσης", "tendo-sido-desatada"],
  ["λυθῆναι", "ser-desatado"],
  ["λυθῇ", "seja-desatado"],
  ["λυομένων", "sendo-desatados"],

  // --- λυπ- palavras (λυπέω = entristecer) ---
  ["λυπεῖται", "entristece-se"],
  ["λυπεῖτε", "entristeceis"],
  ["λυπηθέντες", "tendo-sido-entristecidos"],
  ["λυπηθήσεσθε", "sereis-entristecidos"],
  ["λυπηθεὶς", "tendo-sido-entristecido"],
  ["λυπηθῆναι", "ser-entristecido"],
  ["λυπηθῆτε", "sejais-entristecidos"],
  ["λυπῆσθε", "estejais-entristecidos"],
  ["λυπῶ", "entristeço"],

  // --- λυσ- / λυτ- palavras ---
  ["λυσιτελεῖ", "é-proveitoso"],
  ["λυτροῦσθαι", "resgatar"],
  ["λυτρωτὴν", "resgatador"],
  ["λυτρώσηται", "resgate"],
  ["λυόντων", "desatando"],

  // --- λόγ- / λόγχ- / λύ- palavras ---
  ["λόγιος", "eloquente"],
  ["λόγχῃ", "lança"],
  ["λόγων", "palavras"],
  ["λύει", "desata"],
  ["λύκον", "lobo"],
  ["λύκος", "lobo"],
  ["λύοντες", "desatando"],
  ["λύουσιν", "desatam"],
  ["λύπας", "tristezas"],
  ["λύσατε", "desatai"],
  ["λύσητε", "desateis"],
  ["λύσιν", "soltura"],
  ["λύσω", "desatarei"],
  ["λύσῃς", "desates"],
  ["λύχνοι", "candeias"],
  ["λύχνῳ", "candeia"],

  // --- λῃστ- / λῆρ- palavras ---
  ["λῃσταὶ", "ladrões"],
  ["λῃσταῖς", "ladrões"],
  ["λῆρος", "tolice"],

  // --- μάγ- palavras ---
  ["μάγοι", "magos"],
  ["μάγον", "mago"],
  ["μάγος", "mago"],
  ["μάγους", "magos"],

  // --- μάθ- / μάμ- / μάν- palavras ---
  ["μάθητε", "aprendei"],
  ["μάμμῃ", "avó"],
  ["μάννα", "maná"],

  // --- μάρτ- palavras ---
  ["μάρτυρας", "testemunhas"],
  ["μάρτυρός", "testemunha"],

  // --- μάστ- palavras ---
  ["μάστιγας", "açoites"],
  ["μάστιγος", "açoite"],
  ["μάστιγός", "açoite"],
  ["μάστιξιν", "açoites"],

  // --- μάτ- / μάχ- palavras ---
  ["μάταιος", "vão"],
  ["μάχαιράν", "espada"],
  ["μάχαιραι", "espadas"],
  ["μάχεσθαι", "combater"],
  ["μάχεσθε", "combateis"],

  // --- μέ- palavras ---
  ["μέ", "me"],
  ["μέγεθος", "grandeza"],
  ["μέγιστα", "grandíssimas"],
  ["μέθαι", "bebedeiras"],
  ["μέθαις", "bebedeiras"],
  ["μέθυσοι", "bêbados"],
  ["μέθυσος", "bêbado"],
  ["μέθῃ", "bebedeira"],
  ["μέλαιναν", "preta"],
  ["μέλανι", "tinta"],
  ["μέλλομεν", "estamos-a-ponto-de"],
  ["μέμνησθε", "lembrai-vos"],
  ["μέμφεται", "censura"],
  ["μένε", "permanece"],
  ["μένεις", "permaneces"],
  ["μένητε", "permaneçais"],
  ["μένομεν", "permanecemos"],
  ["μένοντα", "permanecendo"],
  ["μένοντος", "permanecendo"],
  ["μένω", "permaneço"],
  ["μέριμναι", "ansiedades"],
  ["μέριμναν", "ansiedade"],
  ["μέσος", "meio"],

  // --- μήτ- / μίγ- / μίλ- / μίσθ- palavras ---
  ["μήτιγε", "quanto-mais"],
  ["μήτραν", "ventre"],
  ["μήτρας", "ventre"],
  ["μίγμα", "mistura"],
  ["μίλιον", "milha"],
  ["μίσθιοι", "assalariados"],

  // --- μαίν- palavras ---
  ["μαίνεσθε", "enlouqueceis"],
  ["μαίνεται", "enlouquece"],
  ["μαίνομαι", "enlouqueço"],

  // --- μαγ- palavras ---
  ["μαγίαις", "magias"],
  ["μαγεύων", "praticando-magia"],

  // --- μαθ- palavras ---
  ["μαθήτρια", "discípula"],
  ["μαθεῖν", "aprender"],
  ["μαθητευθεὶς", "tendo-sido-feito-discípulo"],
  ["μαθητεύσαντες", "tendo-feito-discípulos"],
  ["μαθητεύσατε", "fazei-discípulos"],
  ["μαθητοῦ", "discípulo"],

  // --- μακ- palavras ---
  ["μακάριον", "bem-aventurado"],
  ["μακέλλῳ", "mercado-de-carnes"],
  ["μακαρία", "bem-aventurada"],
  ["μακαρίαν", "bem-aventurada"],
  ["μακαρίζομεν", "consideramos-bem-aventurados"],
  ["μακαρίου", "bem-aventurado"],
  ["μακαριοῦσίν", "chamarão-bem-aventurada"],
  ["μακαρισμὸν", "bem-aventurança"],
  ["μακαριωτέρα", "mais-bem-aventurada"],
  ["μακράν", "longe"],
  ["μακροθυμήσας", "tendo-sido-paciente"],
  ["μακροθυμήσατε", "sede-pacientes"],
  ["μακροθυμεῖτε", "sede-pacientes"],
  ["μακροθυμῶν", "sendo-paciente"],
  ["μακροθύμως", "pacientemente"],
  ["μακροχρόνιος", "longevo"],

  // --- μαλ- / μαμ- / μαν- palavras ---
  ["μαλακοὶ", "efeminados"],
  ["μαλακὰ", "macias"],
  ["μαμωνᾶ", "mamom"],
  ["μανίαν", "loucura"],
  ["μανθάνοντα", "aprendendo"],
  ["μανθάνουσιν", "aprendem"],
  ["μανθάνωσιν", "aprendam"],
  ["μανθανέτω", "aprenda"],
  ["μαντευομένη", "adivinhando"],

  // --- μαρ- palavras ---
  ["μαρανθήσεται", "será-murchado"],
  ["μαργαρίταις", "pérolas"],
  ["μαργαρίτην", "pérola"],
  ["μαρτυρήσαντος", "tendo-testemunhado"],
  ["μαρτυρήσας", "tendo-testemunhado"],
  ["μαρτυρήσει", "testemunhará"],
  ["μαρτυρήσω", "testemunharei"],
  ["μαρτυρίαι", "testemunhos"],
  ["μαρτυρίαν", "testemunho"],
  ["μαρτυρίας", "testemunho"],
  ["μαρτυρεῖν", "testemunhar"],
  ["μαρτυρεῖς", "testemunhas"],
  ["μαρτυρεῖται", "é-testemunhado"],
  ["μαρτυρηθέντες", "tendo-sido-testemunhados"],
  ["μαρτυρουμένους", "sendo-testemunhados"],
  ["μαρτυρούμενός", "sendo-testemunhado"],
  ["μαρτυρούντων", "testemunhando"],
  ["μαρτυρούσης", "testemunhando"],
  ["μαρτυροῦν", "testemunhando"],
  ["μαρτυροῦντες", "testemunhando"],
  ["μαρτυροῦντι", "ao-que-testemunha"],
  ["μαρτυροῦντος", "testemunhando"],
  ["μαρτυροῦσαι", "testemunhando"],
  ["μαρτυροῦσιν", "testemunham"],
  ["μαρτυρόμενοι", "testificando"],
  ["μαρτυρόμενος", "testificando"],
  ["μαρτυρῆσαι", "testemunhar"],
  ["μαρτύρησον", "testemunha"],
  ["μαρὰν", "maran"],

  // --- μαστ- / ματ- / μαχ- palavras ---
  ["μαστίζειν", "açoitar"],
  ["μαστιγοῖ", "açoita"],
  ["μαστιγώσαντες", "tendo-açoitado"],
  ["μαστιγώσετε", "açoitareis"],
  ["μαστιγῶσαι", "açoitar"],
  ["ματαία", "vã"],
  ["ματαίας", "vãs"],
  ["ματαίων", "vãs"],
  ["ματαιολογίαν", "conversa-vã"],
  ["ματαιολόγοι", "faladores-vãos"],
  ["ματαιότητος", "vaidade"],
  ["μαχαίρῃ", "espada"],
  ["μαχομένοις", "aos-que-combatem"],

  // --- μείζ- / μεγ- palavras ---
  ["μείζονας", "maiores"],
  ["μείζονες", "maiores"],
  ["μεγάλαις", "grandes"],
  ["μεγάλην", "grande"],
  ["μεγάλου", "grande"],
  ["μεγάλων", "grandes"],
  ["μεγάλως", "grandemente"],
  ["μεγάλῳ", "grande"],
  ["μεγαλειότητι", "majestade"],
  ["μεγαλεῖα", "grandezas"],
  ["μεγαλοπρεποῦς", "majestosa"],
  ["μεγαλυνθήσεται", "será-engrandecido"],
  ["μεγαλυνθῆναι", "ser-engrandecido"],
  ["μεγαλυνόντων", "engrandecendo"],
  ["μεγαλωσύνη", "majestade"],
  ["μεγαλύνουσιν", "engrandecem"],
  ["μεγιστᾶσιν", "grandes-homens"],

  // --- μεθ- palavras ---
  ["μεθερμηνευόμενος", "sendo-traduzido"],
  ["μεθερμηνεύεται", "é-traduzido"],
  ["μεθιστάναι", "remover"],
  ["μεθοδίαν", "artimanha"],
  ["μεθοδίας", "artimanhas"],
  ["μεθυσθῶσιν", "embriaguem-se"],
  ["μεθυσκόμενοι", "embriagando-se"],
  ["μεθυόντων", "embriagando-se"],
  ["μεθύει", "embriaga-se"],
  ["μεθύσκεσθαι", "embriagar-se"],
  ["μεθύσκεσθε", "embriagai-vos"],

  // --- μειζ- / μελ- palavras ---
  ["μειζοτέραν", "maior"],
  ["μελέτα", "medita"],
  ["μελέτω", "importe"],
  ["μελλήσετε", "estareis-a-ponto-de"],
  ["μελλήσω", "estarei-a-ponto-de"],
  ["μελλόντων", "das-coisas-que-estão-a-ponto-de"],

  // --- μεμ- palavras ---
  ["μεμέρικεν", "tem-dividido"],
  ["μεμίανται", "têm-sido-contaminados"],
  ["μεμίσηκεν", "tem-odiado"],
  ["μεμαθηκώς", "tendo-aprendido"],
  ["μεμαρτύρηκα", "tenho-testemunhado"],
  ["μεμαρτύρηκας", "tens-testemunhado"],
  ["μεμβράνας", "pergaminhos"],
  ["μεμενήκεισαν", "tinham-permanecido"],
  ["μεμεστωμένοι", "tendo-sido-cheios"],
  ["μεμιαμμένοις", "tendo-sido-contaminados"],
  ["μεμιγμένον", "tendo-sido-misturado"],
  ["μεμισήκασιν", "têm-odiado"],
  ["μεμνημένος", "tendo-se-lembrado"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11n (freq 1, parte 14/44) ===`);
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
    const parsed = JSON.parse(result.substring(jsonStart));
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    process.stdout.write(changes > 0 ? `✓ ${word} → ${translation} (${changes})\n` : `· ${word} → ${translation} (0)\n`);
    success++;
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 11n ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

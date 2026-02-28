#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11k
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 11/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11k-${Date.now()}.sql`);

const translations = [
  // === κατακ- palavras (reclinar, condenar, dominar) ===
  ["κατακείμενοι", "reclinados"],
  ["κατακειμένου", "reclinado"],
  ["κατακλιθῆναι", "reclinar-se"],
  ["κατακλιθῇς", "te-reclines"],
  ["κατακλυσθεὶς", "tendo-sido-inundado"],
  ["κατακλυσμοῦ", "dilúvio"],
  ["κατακλυσμὸν", "dilúvio"],
  ["κατακολουθοῦσα", "seguindo"],
  ["κατακρίνεις", "condenas"],
  ["κατακρίνω", "condeno"],
  ["κατακρίσεως", "condenação"],
  ["κατακρημνίσαι", "precipitar"],
  ["κατακριθήσεται", "será-condenado"],
  ["κατακριθῶμεν", "sejamos-condenados"],
  ["κατακρινῶν", "condenando"],
  ["κατακυριεύοντες", "dominando"],
  ["κατακυριεύσας", "tendo-dominado"],
  ["κατακόπτων", "cortando"],

  // === καταλ- palavras (alcançar, falar-contra, deixar, reconciliar, destruir) ===
  ["καταλάβητε", "alcanceis"],
  ["καταλάβω", "alcance"],
  ["καταλάλους", "caluniadores"],
  ["καταλίπῃ", "deixe"],
  ["καταλαβέσθαι", "alcançar"],
  ["καταλαβόμενοι", "tendo-alcançado"],
  ["καταλαλεῖ", "fala-contra"],
  ["καταλαλεῖσθε", "sois-falados-contra"],
  ["καταλαλεῖτε", "falais-contra"],
  ["καταλαλιάς", "maledicências"],
  ["καταλαλιαί", "maledicências"],
  ["καταλαλοῦσιν", "falam-contra"],
  ["καταλαλῶν", "falando-contra"],
  ["καταλαμβάνομαι", "alcanço"],
  ["καταλείπει", "deixa"],
  ["καταλείψαντας", "tendo-deixado"],
  ["καταλεγέσθω", "seja-alistada"],
  ["καταλειπομένης", "sendo-deixada"],
  ["καταλειπόντες", "deixando"],
  ["καταλειφθῆναι", "ser-deixado"],
  ["καταλελειμμένος", "tendo-sido-deixado"],
  ["καταλιθάσει", "apedrejará"],
  ["καταλιπόντες", "tendo-deixado"],
  ["καταλλάγητε", "sede-reconciliados"],
  ["καταλλάξαντος", "tendo-reconciliado"],
  ["καταλλάσσων", "reconciliando"],
  ["καταλλαγέντες", "tendo-sido-reconciliados"],
  ["καταλλαγήτω", "seja-reconciliado"],
  ["καταλλαγὴ", "reconciliação"],
  ["καταλλαγὴν", "reconciliação"],
  ["καταλύματι", "hospedaria"],
  ["καταλύσει", "destruirá"],
  ["καταλύσω", "destruirei"],
  ["καταλύσωσιν", "destruam"],

  // === καταμ/κατανα/κατανο/καταντ- palavras ===
  ["καταμάθετε", "considerai-atentamente"],
  ["καταμένοντες", "permanecendo"],
  ["καταμενῶ", "permanecerei"],
  ["καταναλίσκον", "consumindo"],
  ["καταναρκήσω", "serei-peso"],
  ["κατανοήσας", "tendo-considerado"],
  ["κατανοοῦντι", "considerando"],
  ["κατανοῶμεν", "consideremos"],
  ["καταντήσαντες", "tendo-chegado"],
  ["καταντήσω", "chegarei"],
  ["καταντήσωμεν", "cheguemos"],
  ["καταντῆσαι", "chegar"],
  ["κατανύξεως", "torpor"],
  ["καταξιωθέντες", "tendo-sido-considerados-dignos"],
  ["καταξιωθῆναι", "ser-considerado-digno"],

  // === καταπ- palavras (tragar, pisar, cair, descansar) ===
  ["καταπίνοντες", "tragando"],
  ["καταπίπτειν", "cair"],
  ["καταπατήσας", "tendo-pisado"],
  ["καταπατήσουσιν", "pisarão"],
  ["καταπατεῖν", "pisar"],
  ["καταπατεῖσθαι", "ser-pisado"],
  ["καταπαύσεώς", "descanso"],
  ["καταπεσόντων", "tendo-caído"],
  ["καταπιεῖν", "tragar"],
  ["καταπονουμένῳ", "sendo-oprimido"],
  ["καταπονούμενον", "sendo-oprimido"],
  ["καταποντίζεσθαι", "ser-afundado"],
  ["καταποντισθῇ", "seja-afundado"],

  // === καταργ- palavras (anular, abolir) ===
  ["καταργήσαντος", "tendo-anulado"],
  ["καταργήσας", "tendo-anulado"],
  ["καταργεῖ", "anula"],
  ["καταργηθήσονται", "serão-anulados"],
  ["καταργηθῇ", "seja-anulado"],
  ["καταργουμένην", "sendo-anulada"],
  ["καταργουμένου", "sendo-anulado"],
  ["καταργουμένων", "sendo-anuladas"],
  ["καταργούμενον", "sendo-anulado"],
  ["καταργοῦμεν", "anulamos"],
  ["καταργῆσαι", "anular"],

  // === καταρτ/καταρ- palavras (restaurar, amaldiçoar) ===
  ["καταρτίζεσθε", "sede-restaurados"],
  ["καταρτίζετε", "restaurai"],
  ["καταρτίσει", "restaurará"],
  ["καταρτισμὸν", "aperfeiçoamento"],
  ["καταρωμένους", "tendo-sido-amaldiçoados"],
  ["καταράμεθα", "amaldiçoamos"],
  ["καταρᾶσθε", "amaldiçoais"],

  // === κατασκ/κατασο/καταστ- palavras (preparar, espiar, constituir) ===
  ["κατασκευάζεται", "é-preparado"],
  ["κατασκευαζομένης", "sendo-preparada"],
  ["κατασκηνώσει", "aninhará"],
  ["κατασκιάζοντα", "cobrindo-com-sombra"],
  ["κατασκοπῆσαι", "espiar"],
  ["κατασκόπους", "espiões"],
  ["κατασοφισάμενος", "tendo-agido-astutamente-contra"],
  ["καταστήματι", "comportamento"],
  ["καταστήσομεν", "constituiremos"],
  ["καταστήσῃς", "constituas"],
  ["κατασταθήσονται", "serão-constituídos"],
  ["καταστείλας", "tendo-acalmado"],
  ["καταστολῇ", "vestimenta"],
  ["καταστρηνιάσωσιν", "se-entreguem-à-sensualidade-contra"],

  // === κατασφ/κατασχ/κατασυ/κατατ/καταφ- palavras ===
  ["κατασφάξατε", "massacrai"],
  ["κατασχέσει", "posse"],
  ["κατασύρῃ", "arraste"],
  ["κατατομήν", "mutilação"],
  ["καταφάγεταί", "devorará"],
  ["καταφέροντες", "levando-contra"],
  ["καταφαγών", "tendo-devorado"],
  ["καταφερόμενος", "sendo-levado-para-baixo"],
  ["καταφιλοῦσά", "beijando"],
  ["καταφρονήσας", "tendo-desprezado"],
  ["καταφρονήσητε", "desprezeis"],
  ["καταφρονείτω", "despreze"],
  ["καταφρονείτωσαν", "desprezem"],
  ["καταφρονεῖς", "desprezas"],
  ["καταφρονεῖτε", "desprezais"],
  ["καταφρονηταί", "desprezadores"],
  ["καταφρονοῦντας", "desprezando"],
  ["καταφυγόντες", "tendo-fugido-para"],

  // === καταχ/καταψ- palavras ===
  ["καταχθέντες", "tendo-sido-conduzidos-abaixo"],
  ["καταχθονίων", "subterrâneos"],
  ["καταχρήσασθαι", "usar-plenamente"],
  ["καταχρώμενοι", "usando-plenamente"],
  ["καταψύξῃ", "refresque"],

  // === κατε- palavras (formas aoristo/perfeito) ===
  ["κατεάξει", "quebrará"],
  ["κατείδωλον", "cheia-de-ídolos"],
  ["κατείχετο", "era-retida"],
  ["κατεαγῶσιν", "sejam-quebrados"],
  ["κατεβάρησα", "fui-peso"],
  ["κατεγνωσμένος", "tendo-sido-condenado"],
  ["κατεδίωξεν", "perseguiu"],
  ["κατειλημμένην", "tendo-sido-apanhada"],
  ["κατειληφέναι", "ter-alcançado"],
  ["κατειργάσθαι", "ter-realizado"],
  ["κατειργάσθη", "foi-realizado"],
  ["κατειχόμεθα", "éramos-retidos"],
  ["κατεκλίθη", "reclinou-se"],
  ["κατεκληρονόμησεν", "deu-como-herança"],
  ["κατεκρίθη", "foi-condenado"],
  ["κατελήμφθην", "fui-alcançado"],
  ["κατελήφθη", "foi-alcançado"],
  ["κατελαβόμην", "alcancei"],
  ["κατελείφθη", "foi-deixado"],
  ["κατελθεῖν", "descer"],
  ["κατελθόντες", "tendo-descido"],
  ["κατελθόντων", "tendo-descido"],
  ["κατενεχθεὶς", "tendo-sido-levado-para-baixo"],
  ["κατενύγησαν", "foram-compungidos"],
  ["κατεπέστησαν", "levantaram-se-contra"],
  ["κατεπατήθη", "foi-pisado"],
  ["κατεπόθησαν", "foram-tragados"],

  // === κατεργ- palavras (realizar, produzir) ===
  ["κατεργάζεσθαι", "realizar"],
  ["κατεργάζεσθε", "realizais"],
  ["κατεργαζομένη", "realizando"],
  ["κατεργαζομένου", "realizando"],
  ["κατεργαζόμενοι", "realizando"],
  ["κατεργασάμενοι", "tendo-realizado"],
  ["κατεργασάμενον", "tendo-realizado"],
  ["κατεργασάμενος", "tendo-realizado"],

  // === κατερχ/κατεσθ/κατεσκ/κατεστ/κατευ/κατεφ/κατεχ- palavras ===
  ["κατερχομένη", "descendo"],
  ["κατεσθίει", "devora"],
  ["κατεσθίετε", "devoráveis"],
  ["κατεσθίοντες", "devorando"],
  ["κατεσθίουσιν", "devoram"],
  ["κατεσκήνωσεν", "aninhou-se"],
  ["κατεσκευάσθη", "foi-preparado"],
  ["κατεσκευασμένον", "tendo-sido-preparado"],
  ["κατεσκευασμένων", "tendo-sido-preparados"],
  ["κατεσκεύασεν", "preparou"],
  ["κατεστάθησαν", "foram-constituídos"],
  ["κατεσταλμένους", "acalmados"],
  ["κατεστραμμένα", "tendo-sido-arruinados"],
  ["κατεστρώθησαν", "foram-prostrados"],
  ["κατευθῦναι", "dirigir"],
  ["κατευλόγει", "abençoava"],
  ["κατεφίλει", "beijava"],
  ["κατεφίλουν", "beijavam"],
  ["κατεφθαρμένοι", "tendo-sido-corrompidos"],
  ["κατεχόντων", "retendo"],

  // === κατηγ- palavras (anunciar, acusar) ===
  ["κατηγγέλη", "foi-anunciado"],
  ["κατηγγείλαμεν", "anunciamos"],
  ["κατηγορήσω", "acusarei"],
  ["κατηγορίᾳ", "acusação"],
  ["κατηγορείτωσαν", "acusem"],
  ["κατηγορεῖσθαι", "ser-acusado"],
  ["κατηγορεῖται", "é-acusado"],
  ["κατηγορεῖτε", "acusais"],
  ["κατηγορούμενος", "sendo-acusado"],
  ["κατηγορούντων", "acusando"],
  ["κατηγοροῦμεν", "acusamos"],
  ["κατηγοροῦντες", "acusando"],
  ["κατηγοροῦσιν", "acusam"],
  ["κατηγορῶν", "acusando"],
  ["κατηγωνίσαντο", "venceram"],
  ["κατηγόροις", "acusadores"],
  ["κατηγόρουν", "acusavam"],
  ["κατηγόρους", "acusadores"],

  // === κατηλ/κατηξ/κατηρ/κατηχ- palavras ===
  ["κατηλλάγημεν", "fomos-reconciliados"],
  ["κατηξιώθησαν", "foram-considerados-dignos"],
  ["κατηράσω", "amaldiçoaste"],
  ["κατηραμένοι", "tendo-sido-amaldiçoados"],
  ["κατηργήθημεν", "fomos-anulados"],
  ["κατηργήθητε", "fostes-anulados"],
  ["κατηριθμημένος", "tendo-sido-contado-entre"],
  ["κατηρτίσθαι", "ter-sido-restaurado"],
  ["κατηρτισμένα", "tendo-sido-restaurados"],
  ["κατηρτισμένοι", "tendo-sido-restaurados"],
  ["κατηρτισμένος", "tendo-sido-restaurado"],
  ["κατηχήθης", "foste-instruído"],
  ["κατηχήθησαν", "foram-instruídos"],
  ["κατηχήσω", "instruirei"],
  ["κατηχημένος", "tendo-sido-instruído"],
  ["κατηχοῦντι", "instruindo"],

  // === κατισχ/κατοικ- palavras (prevalecer, habitar) ===
  ["κατισχύσητε", "prevaleçais"],
  ["κατισχύσουσιν", "prevalecerão"],
  ["κατοίκησιν", "habitação"],
  ["κατοικήσας", "tendo-habitado"],
  ["κατοικίας", "habitações"],
  ["κατοικεῖν", "habitar"],
  ["κατοικεῖτε", "habitais"],
  ["κατοικητήριον", "habitação"],
  ["κατοικοῦντας", "habitando"],
  ["κατοικοῦντι", "habitando"],
  ["κατοικῶν", "habitando"],
  ["κατοπτριζόμενοι", "contemplando-como-em-espelho"],

  // === κατω/κατῃσχ/κατῆλθ/κατῴκ- palavras ===
  ["κατωτέρω", "mais-abaixo"],
  ["κατώτερα", "inferiores"],
  ["κατῃσχύνθην", "fui-envergonhado"],
  ["κατῃσχύνοντο", "eram-envergonhados"],
  ["κατῆλθέν", "desceu"],
  ["κατῆλθεν", "desceu"],
  ["κατῴκισεν", "fez-habitar"],

  // === καυ- palavras (queimar, gloriar-se) ===
  ["καυθήσομαι", "serei-queimado"],
  ["καυχήματος", "glorificação"],
  ["καυχήσωνται", "gloriem-se"],
  ["καυχησόμεθα", "gloriar-nos-emos"],
  ["καυχωμένους", "gloriando-se"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11k (freq 1, parte 11/44) ===`);
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

console.log(`\n=== Resultado Lote 11k ===`);
console.log(`Sucesso: ${success}/${translations.length}\nErros: ${errors}\nTokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

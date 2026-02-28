#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ai
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 35/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ai-${Date.now()}.sql`);

const translations = [
  // === Lote 11ai — freq 1, parte 35/44 (248 palavras) ===

  // --- ἐλ- palavras ---
  ["ἐλεύσεως", "vinda"],
  ["ἐλεῆσαι", "ter-misericórdia"],
  ["ἐλεῶ", "tenho-misericórdia"],
  ["ἐλεῶν", "tendo-misericórdia"],
  ["ἐλεῶντος", "tendo-misericórdia"],
  ["ἐληλακότες", "tendo-remado"],
  ["ἐληλυθυῖαν", "tendo-vindo"],
  ["ἐληλυθότες", "tendo-vindo"],
  ["ἐληλύθεισαν", "tinham-vindo"],
  ["ἐλθοῦσαι", "tendo-vindo"],
  ["ἐλθόντας", "tendo-vindo"],
  ["ἐλθόντι", "tendo-vindo"],
  ["ἐλθὲ", "vem"],
  ["ἐλιθάσθην", "fui-apedrejado"],
  ["ἐλιθάσθησαν", "foram-apedrejados"],
  ["ἐλιθοβόλησαν", "apedrejaram"],
  ["ἐλλογεῖται", "é-imputado"],
  ["ἐλλόγα", "imputa"],
  ["ἐλογίσθημεν", "fomos-considerados"],
  ["ἐλογιζόμην", "eu-considerava"],
  ["ἐλοιδόρησαν", "injuriaram"],
  ["ἐλπίδα", "esperança"],
  ["ἐλπίζετε", "esperais"],
  ["ἐλπίζομεν", "esperamos"],
  ["ἐλπίζουσαι", "esperando"],
  ["ἐλπίσατε", "esperai"],
  ["ἐλπιζομένων", "sendo-esperados"],
  ["ἐλυμαίνετο", "devastava"],
  ["ἐλυπήθη", "foi-entristecido"],
  ["ἐλυτρώθητε", "fostes-resgatados"],
  ["ἐλύετο", "era-desatado"],
  ["ἐλύθη", "foi-desatado"],
  ["ἐλύπησα", "entristeci"],
  ["ἐλύπησεν", "entristeceu"],

  // --- ἐμ- palavras (pronome/prefixo) ---
  ["ἐμή", "minha"],
  ["ἐμήν", "minha"],
  ["ἐμήνυσεν", "denunciou"],
  ["ἐμίσησα", "odiei"],
  ["ἐμίσησας", "odiaste"],
  ["ἐμίσουν", "odiavam"],
  ["ἐμαθητεύθη", "foi-feito-discípulo"],
  ["ἐμαρτυρήθη", "foi-testemunhado"],
  ["ἐμαρτυρήθησαν", "foram-testemunhados"],
  ["ἐμαρτυρήσαμεν", "testemunhamos"],
  ["ἐμαρτυρεῖτο", "era-testemunhado"],
  ["ἐμαρτύρησάν", "testemunharam"],
  ["ἐμαρτύρησεν", "testemunhou"],
  ["ἐμαρτύρουν", "testemunhavam"],
  ["ἐμαστίγωσεν", "açoitou"],
  ["ἐματαιώθησαν", "foram-feitos-vãos"],

  // --- ἐμβ- palavras ---
  ["ἐμβάντες", "tendo-embarcado"],
  ["ἐμβάντι", "tendo-embarcado"],
  ["ἐμβάψας", "tendo-mergulhado"],
  ["ἐμβαίνοντος", "embarcando"],
  ["ἐμβαλεῖν", "lançar-dentro"],
  ["ἐμβαπτόμενος", "mergulhando"],
  ["ἐμβατεύων", "adentrando"],
  ["ἐμβλέψασα", "tendo-olhado-fixamente"],
  ["ἐμβλέψατε", "olhai-fixamente"],
  ["ἐμβριμησάμενος", "tendo-repreendido-severamente"],
  ["ἐμβριμώμενος", "repreendendo-severamente"],

  // --- ἐμε/ἐμι/ἐμμ- palavras ---
  ["ἐμεγαλύνετο", "era-engrandecido"],
  ["ἐμελέτησαν", "meditaram"],
  ["ἐμεσίτευσεν", "mediou"],
  ["ἐμισθώσατο", "alugou"],
  ["ἐμμένει", "permanece"],
  ["ἐμμένειν", "permanecer"],
  ["ἐμμαινόμενος", "enfurecendo-se"],
  ["ἐμνήσθημεν", "lembramo-nos"],
  ["ἐμνήσθην", "lembrei-me"],
  ["ἐμνημόνευον", "lembravam"],
  ["ἐμνημόνευσεν", "lembrou"],
  ["ἐμνηστευμένην", "tendo-sido-prometida-em-casamento"],
  ["ἐμνηστευμένῃ", "tendo-sido-prometida-em-casamento"],
  ["ἐμοίχευσεν", "adulterou"],
  ["ἐμοσχοποίησαν", "fizeram-um-bezerro"],
  ["ἐμοὺς", "meus"],

  // --- ἐμπ- palavras ---
  ["ἐμπίπτουσιν", "caem-em"],
  ["ἐμπαίζειν", "escarnecer"],
  ["ἐμπαίξας", "tendo-escarnecido"],
  ["ἐμπαίξουσιν", "escarnecerão"],
  ["ἐμπαιγμονῇ", "escárnio"],
  ["ἐμπαιγμῶν", "escárnios"],
  ["ἐμπαιχθήσεται", "será-escarnecido"],
  ["ἐμπαῖξαι", "escarnecer"],
  ["ἐμπεπλησμένοι", "tendo-sido-saciados"],
  ["ἐμπεσεῖν", "cair-em"],
  ["ἐμπεσοῦνται", "cairão-em"],
  ["ἐμπεσόντος", "tendo-caído-em"],
  ["ἐμπιπλῶν", "saciando"],
  ["ἐμπλέκεται", "enreda-se"],
  ["ἐμπλακέντες", "tendo-se-enredado"],
  ["ἐμπλησθῶ", "eu-seja-saciado"],
  ["ἐμπλοκῆς", "entrelaçamento"],
  ["ἐμπνέων", "respirando"],
  ["ἐμπορίαν", "comércio"],
  ["ἐμπορίου", "comércio"],
  ["ἐμπορευσόμεθα", "comerciaremos"],
  ["ἐμπορεύσονται", "comerciarão"],
  ["ἐμπτυσθήσεται", "será-cuspido"],
  ["ἐμπτύειν", "cuspir"],
  ["ἐμπτύσαντες", "tendo-cuspido"],
  ["ἐμπτύσουσιν", "cuspirão"],
  ["ἐμπόρῳ", "comerciante"],

  // --- ἐμφ- palavras ---
  ["ἐμφανίζειν", "revelar"],
  ["ἐμφανίζουσιν", "revelam"],
  ["ἐμφανίσατε", "revelai"],
  ["ἐμφανίσω", "revelarei"],
  ["ἐμφανισθῆναι", "ser-revelado"],
  ["ἐμφανὴς", "manifesto"],
  ["ἐμφανῆ", "manifesto"],
  ["ἐμφόβων", "atemorizados"],

  // --- ἐμ- restantes ---
  ["ἐμωράνθησαν", "foram-feitos-tolos"],
  ["ἐμόν", "meu"],
  ["ἐμώρανεν", "tornou-tolo"],
  ["ἐμὰς", "minhas"],
  ["ἐμῶν", "meus"],

  // --- ἐν- palavras (início) ---
  ["ἐνάτῃ", "nona"],
  ["ἐνέβημεν", "embarcamos"],
  ["ἐνέβλεπεν", "olhava-fixamente"],
  ["ἐνέβλεπον", "olhavam-fixamente"],
  ["ἐνέβλεψεν", "olhou-fixamente"],
  ["ἐνέγκαι", "trazer"],
  ["ἐνέκρυψεν", "escondeu-dentro"],
  ["ἐνέμειναν", "permaneceram"],
  ["ἐνένευον", "faziam-sinais"],
  ["ἐνέπαιζον", "escarneciam"],
  ["ἐνέπλησεν", "encheu"],
  ["ἐνέπρησεν", "incendiou"],
  ["ἐνέπτυον", "cuspiam-em"],
  ["ἐνέπτυσαν", "cuspiram-em"],
  ["ἐνέστηκεν", "tem-se-apresentado"],
  ["ἐνέτυχόν", "intercederam"],
  ["ἐνέχειν", "guardar-rancor"],
  ["ἐνέχεσθε", "estais-presos"],
  ["ἐνήργηκεν", "tem-operado"],
  ["ἐνήργησεν", "operou"],
  ["ἐνίσχυσεν", "fortaleceu"],
  ["ἐνίψατο", "lavou"],

  // --- ἐνα- palavras ---
  ["ἐναλίων", "marinhos"],
  ["ἐναντία", "contrárias"],
  ["ἐναντίους", "contrários"],
  ["ἐναντίων", "contrários"],
  ["ἐναρξάμενοι", "tendo-começado"],
  ["ἐναρξάμενος", "tendo-começado"],
  ["ἐναυάγησα", "naufragei"],
  ["ἐναυάγησαν", "naufragaram"],

  // --- ἐνγ/ἐνδ- palavras ---
  ["ἐνγέγραπται", "tem-sido-inscrito"],
  ["ἐνδέχεται", "é-possível"],
  ["ἐνδεής", "necessitado"],
  ["ἐνδείκνυνται", "mostram"],
  ["ἐνδείκνυσθαι", "mostrar"],
  ["ἐνδείξασθαι", "mostrar"],
  ["ἐνδείξωμαι", "eu-mostre"],
  ["ἐνδεδυμένος", "tendo-sido-vestido"],
  ["ἐνδεικνύμενοι", "mostrando"],
  ["ἐνδημῆσαι", "estar-em-casa"],
  ["ἐνδιδύσκουσιν", "vestem"],
  ["ἐνδοξασθῆναι", "ser-glorificado"],
  ["ἐνδοξασθῇ", "seja-glorificado"],
  ["ἐνδυναμοῦ", "fortalece-te"],
  ["ἐνδυναμοῦντί", "fortalecendo"],
  ["ἐνδυναμοῦσθε", "fortalecei-vos"],
  ["ἐνδυναμώσαντί", "tendo-fortalecido"],
  ["ἐνδυσάμενος", "tendo-vestido"],
  ["ἐνδυσώμεθα", "vistamo-nos"],
  ["ἐνδόξοις", "gloriosos"],
  ["ἐνδόξῳ", "glorioso"],
  ["ἐνδύμασιν", "vestes"],
  ["ἐνδύνοντες", "infiltrando-se"],
  ["ἐνδύσατε", "vesti"],
  ["ἐνδύσεως", "vestimenta"],

  // --- ἐνε- palavras ---
  ["ἐνείλησεν", "envolveu"],
  ["ἐνεβίβασεν", "fez-embarcar"],
  ["ἐνεβριμήθη", "foi-severamente-repreendido"],
  ["ἐνεβριμήσατο", "repreendeu-severamente"],
  ["ἐνεβριμῶντο", "repreendiam-severamente"],
  ["ἐνεδείξασθε", "mostrastes"],
  ["ἐνεδείξατο", "mostrou"],
  ["ἐνεδιδύσκετο", "vestia-se"],
  ["ἐνεδρεύοντες", "emboscando"],
  ["ἐνεδρεύουσιν", "emboscam"],
  ["ἐνεδυνάμωσέν", "fortaleceu"],
  ["ἐνεδυναμοῦτο", "era-fortalecido"],
  ["ἐνεδυναμώθη", "foi-fortalecido"],
  ["ἐνεδύσασθε", "vestistes"],
  ["ἐνεδύσατο", "vestiu-se"],
  ["ἐνεκάλουν", "acusavam"],
  ["ἐνεκαίνισεν", "inaugurou"],
  ["ἐνεκοπτόμην", "era-impedido"],
  ["ἐνεοί", "mudos"],
  ["ἐνεπαίχθη", "foi-escarnecido"],
  ["ἐνεπλήσθησαν", "foram-enchidos"],

  // --- ἐνεργ- palavras ---
  ["ἐνεργήματα", "operações"],
  ["ἐνεργής", "eficaz"],
  ["ἐνεργήσας", "tendo-operado"],
  ["ἐνεργείας", "operação"],
  ["ἐνεργεῖ", "opera"],
  ["ἐνεργεῖν", "operar"],
  ["ἐνεργημάτων", "operações"],
  ["ἐνεργουμένης", "sendo-operada"],

  // --- ἐνεστ- e ἐνετ- palavras ---
  ["ἐνεστηκότα", "tendo-se-apresentado"],
  ["ἐνεστῶσαν", "tendo-se-apresentado"],
  ["ἐνεστῶτος", "tendo-se-apresentado"],
  ["ἐνετειλάμην", "ordenei"],
  ["ἐνετρεπόμεθα", "respeitávamos"],
  ["ἐνευλογηθήσονται", "serão-abençoados-em"],

  // --- ἐνεφ/ἐνεχ- palavras ---
  ["ἐνεφάνισάν", "revelaram"],
  ["ἐνεφάνισας", "revelaste"],
  ["ἐνεφανίσθησαν", "foram-revelados"],
  ["ἐνεφύσησεν", "soprou-sobre"],
  ["ἐνεχθείσης", "tendo-sido-trazida"],
  ["ἐνεχθεῖσαν", "tendo-sido-trazida"],
  ["ἐνεῖχεν", "guardava-rancor"],

  // --- ἐνη/ἐνθ- palavras ---
  ["ἐνηργεῖτο", "era-operado"],
  ["ἐνθυμήσεων", "pensamentos"],
  ["ἐνθυμήσεως", "pensamento"],
  ["ἐνθυμεῖσθε", "pensais"],
  ["ἐνθυμηθέντος", "tendo-pensado"],

  // --- ἐνι- palavras ---
  ["ἐνιαυτούς", "anos"],
  ["ἐνιαυτοὺς", "anos"],
  ["ἐνισχύων", "fortalecendo"],
  ["ἐνιψάμην", "lavei"],

  // --- ἐνκ- palavras ---
  ["ἐνκαίνια", "inauguração"],
  ["ἐνκαθέτους", "espiões"],
  ["ἐνκακῶμεν", "desanimemos"],
  ["ἐνκαταλείψεις", "abandonarás"],
  ["ἐνκατελείφθη", "foi-abandonado"],
  ["ἐνκατοικῶν", "habitando-em"],
  ["ἐνκαυχᾶσθαι", "gloriar-se-em"],
  ["ἐνκεκαίνισται", "tem-sido-inaugurado"],
  ["ἐνκεντρίσαι", "enxertar"],
  ["ἐνκοπὴν", "impedimento"],
  ["ἐνκρῖναι", "classificar-entre"],
  ["ἐνκόπτεσθαι", "ser-impedido"],
  ["ἐνκόπτω", "impedo"],

  // --- ἐνν/ἐνο- palavras ---
  ["ἐννοιῶν", "pensamentos"],
  ["ἐννόμῳ", "legítima"],
  ["ἐνοικείτω", "habite-em"],
  ["ἐνοικοῦσα", "habitando-em"],
  ["ἐνομίζετο", "era-considerado"],
  ["ἐνομίζομεν", "considerávamos"],
  ["ἐνοσφίσατο", "desviou-para-si"],
  ["ἐνοχλούμενοι", "sendo-perturbados"],
  ["ἐνοχλῇ", "perturbe"],

  // --- ἐνπ/ἐνστ/ἐντ- palavras ---
  ["ἐνπεριπατήσω", "andarei-em"],
  ["ἐνστήσονται", "se-apresentarão"],
  ["ἐντέταλται", "tem-ordenado"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ai (freq 1, parte 35/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(`npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`, {
      encoding: 'utf-8',
      timeout: 30000
    });
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

console.log(`\n=== Resultado Lote 11ai ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

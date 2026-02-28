#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11q
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 17/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11q-${Date.now()}.sql`);

const translations = [
  // === Lote 11q: 248 palavras freq 1 (parte 17/44) ===

  // --- παλ- (regeneração, estalagem) ---
  ["παλινγενεσίας", "de-regeneração"],
  ["παλινγενεσίᾳ", "em-regeneração"],
  ["πανδοχεῖ", "hospedaria"],
  ["πανδοχεῖον", "hospedaria"],
  ["πανηγύρει", "em-assembleia-festiva"],
  ["πανοικεὶ", "com-toda-a-casa"],
  ["πανουργίαν", "astúcia"],
  ["πανοῦργος", "astuto"],
  ["πανπληθεὶ", "em-toda-a-multidão"],
  ["παντί", "a-todo"],
  ["πανταχῇ", "em-todo-lugar"],
  ["παντελές", "completo"],
  ["παντελὲς", "completo"],

  // --- παράγ-, παράδ-, παράθ-, παράκ- ---
  ["παράγοντά", "passando"],
  ["παράγοντι", "ao-que-passa"],
  ["παράδοξα", "coisas-paradoxais"],
  ["παράθου", "deposita"],
  ["παράκειταί", "está-presente"],
  ["παράκειται", "está-presente"],

  // --- παρέ- (aoristo, imperfeito, etc.) ---
  ["παρέβη", "transgrediu"],
  ["παρέδοσαν", "entregaram"],
  ["παρέδωκάν", "entregaram"],
  ["παρέθηκαν", "puseram-diante"],
  ["παρέκυψεν", "inclinou-se"],
  ["παρέλαβες", "recebeste"],
  ["παρέλθωσιν", "passem"],
  ["παρέξῃ", "fornecerá"],
  ["παρέρχεσθε", "passais"],
  ["παρέρχεται", "passa"],
  ["παρέσχον", "forneceram"],
  ["παρέτεινέν", "prolongou"],
  ["παρέχειν", "fornecer"],
  ["παρέχεσθε", "forneceis"],
  ["παρέχοντι", "ao-que-fornece"],
  ["παρέχουσιν", "fornecem"],
  ["παρήγγελλεν", "ordenava"],

  // --- παραβ- (transgressão, parábola) ---
  ["παραβάσει", "em-transgressão"],
  ["παραβάται", "transgressores"],
  ["παραβαίνετε", "transgredis"],
  ["παραβαίνουσιν", "transgridem"],
  ["παραβολάς", "parábolas"],
  ["παραβολευσάμενος", "tendo-arriscado"],
  ["παραβολὴ", "parábola"],

  // --- παραγ- (chegar, ordenar) ---
  ["παραγένωμαι", "eu-chegue"],
  ["παραγένωνται", "cheguem"],
  ["παραγγέλλει", "ordena"],
  ["παραγγέλλειν", "ordenar"],
  ["παραγγέλλων", "ordenando"],
  ["παραγγείλαντες", "tendo-ordenado"],
  ["παραγγείλῃς", "ordenes"],
  ["παραγενομένου", "tendo-chegado"],
  ["παραγενομένους", "tendo-chegado"],
  ["παραγενόμενον", "tendo-chegado"],
  ["παραγενόμενός", "tendo-chegado"],

  // --- παραδ- (entregar, tradição, aceitar) ---
  ["παραδέδοται", "tem-sido-entregue"],
  ["παραδέξονταί", "aceitarão"],
  ["παραδέχεσθαι", "aceitar"],
  ["παραδέχεται", "aceita"],
  ["παραδέχονται", "aceitam"],
  ["παραδέχου", "aceita"],
  ["παραδίδως", "entregas"],
  ["παραδεδομένοι", "tendo-sido-entregues"],
  ["παραδεδωκόσι", "aos-que-tinham-entregado"],
  ["παραδεδώκεισαν", "tinham-entregado"],
  ["παραδειγματίζοντας", "expondo-a-vergonha-pública"],
  ["παραδιδοῖ", "entrega"],
  ["παραδιδόμεθα", "somos-entregues"],
  ["παραδιδόντα", "entregando"],
  ["παραδιδόντος", "do-que-entrega"],
  ["παραδοθήσεσθε", "sereis-entregues"],
  ["παραδοθείσης", "tendo-sido-entregue"],
  ["παραδοθείσῃ", "tendo-sido-entregue"],
  ["παραδοθεὶς", "tendo-sido-entregue"],
  ["παραδοθῶ", "eu-seja-entregue"],
  ["παραδούς", "tendo-entregado"],
  ["παραδόντος", "do-que-entregou"],
  ["παραδόσει", "em-tradição"],
  ["παραδόσεων", "de-tradições"],
  ["παραδώσω", "entregarei"],
  ["παραδώσων", "estando-para-entregar"],
  ["παραδῶ", "eu-entregue"],
  ["παραδῶσιν", "entreguem"],

  // --- παραζ- (provocar-ciúme) ---
  ["παραζηλοῦμεν", "provocamos-a-ciúme"],
  ["παραζηλῶσαι", "provocar-a-ciúme"],

  // --- παραθ- (pôr-diante, marítimo) ---
  ["παραθήσω", "porei-diante"],
  ["παραθαλασσίαν", "marítima"],
  ["παραθεῖναι", "pôr-diante"],

  // --- παραιν-, παραιτ- (aconselhar, recusar) ---
  ["παραινῶ", "aconselho"],
  ["παραιτήσησθε", "recuseis"],
  ["παραιτεῖσθαι", "recusar"],
  ["παραιτησάμενοι", "tendo-recusado"],
  ["παραιτοῦμαι", "recuso"],

  // --- παρακ- (consolar, chamar, sentar-ao-lado) ---
  ["παρακάλεσον", "consola"],
  ["παρακαθεσθεῖσα", "tendo-se-sentado-ao-lado"],
  ["παρακαλεῖ", "consola"],
  ["παρακαλεῖσθε", "sois-consolados"],
  ["παρακαλεῖται", "é-consolado"],
  ["παρακαλοῦντος", "do-que-consola"],
  ["παρακαλῶνται", "sejam-consolados"],
  ["παρακεκαλυμμένον", "tendo-sido-encoberto"],
  ["παρακεκλήμεθα", "temos-sido-consolados"],
  ["παρακεχειμακότι", "tendo-invernado"],
  ["παρακληθήσονται", "serão-consolados"],
  ["παρακληθῆναι", "ser-consolado"],
  ["παρακληθῶσιν", "sejam-consolados"],
  ["παρακοήν", "desobediência"],
  ["παρακολουθήσει", "seguirá"],
  ["παρακούσας", "tendo-desobedecido"],
  ["παρακοὴ", "desobediência"],
  ["παρακοῆς", "de-desobediência"],
  ["παρακύψαι", "inclinar-se"],

  // --- παραλ- (tomar, paralítico, costa) ---
  ["παραλήμψομαι", "tomarei"],
  ["παραλίου", "costeira"],
  ["παραλαβεῖν", "tomar"],
  ["παραλαβόντα", "tendo-tomado"],
  ["παραλαμβάνοντες", "tomando"],
  ["παραλαμβάνουσιν", "tomam"],
  ["παραλεγόμενοι", "navegando-ao-longo"],
  ["παραλελυμένα", "tendo-sido-paralisados"],
  ["παραλελυμένοι", "tendo-sido-paralisados"],
  ["παραλελυμένῳ", "ao-tendo-sido-paralisado"],
  ["παραλλαγὴ", "variação"],
  ["παραλογίζηται", "engane"],
  ["παραλογιζόμενοι", "enganando"],
  ["παραλυτικούς", "paralíticos"],
  ["παραλυτικός", "paralítico"],
  ["παραλυτικὸς", "paralítico"],

  // --- παραμ- (permanecer, consolar) ---
  ["παραμένειν", "permanecer"],
  ["παραμείνας", "tendo-permanecido"],
  ["παραμενῶ", "permanecerei"],
  ["παραμυθήσωνται", "consolem"],
  ["παραμυθίαν", "consolação"],
  ["παραμυθεῖσθε", "consolai"],
  ["παραμύθιον", "consolo"],

  // --- παραν- (iniquidade, transgredir) ---
  ["παρανομίας", "de-iniquidade"],
  ["παρανομῶν", "transgredindo-a-lei"],

  // --- παραπ- (cair, semelhante, navegar) ---
  ["παραπεσόντας", "os-tendo-caído"],
  ["παραπλήσιον", "semelhante"],
  ["παραπλεῦσαι", "navegar-ao-longo"],
  ["παραπλησίως", "semelhantemente"],
  ["παραπορεύεσθαι", "passar-ao-lado"],
  ["παραπτώματος", "de-transgressão"],

  // --- παραρ-, παρασ- (desviar, insígnia, preparar) ---
  ["παραρυῶμεν", "nos-desviemos"],
  ["παρασήμῳ", "com-insígnia"],
  ["παρασκευάσεται", "preparar-se-á"],
  ["παρασκευαζόντων", "dos-que-preparam"],
  ["παραστήσωμεν", "apresentemos"],
  ["παραστήσῃ", "apresente"],
  ["παραστησόμεθα", "seremos-apresentados"],
  ["παραστῆναι", "apresentar"],
  ["παραστῆτε", "apresentai"],
  ["παρασχὼν", "tendo-fornecido"],

  // --- παρατ- (confiar, observar, pôr-diante) ---
  ["παρατίθεμαί", "confio"],
  ["παρατηρήσαντες", "tendo-observado"],
  ["παρατηρήσεως", "de-observação"],
  ["παρατηρεῖσθε", "observais"],
  ["παρατηρούμενοι", "observando"],
  ["παρατιθέμενα", "as-coisas-postas-diante"],
  ["παρατιθέμενον", "o-sendo-posto-diante"],
  ["παρατιθέμενος", "pondo-diante"],
  ["παρατιθέναι", "pôr-diante"],
  ["παρατιθέσθωσαν", "confiem"],
  ["παρατυγχάνοντας", "os-que-se-encontram"],

  // --- παραυ-, παραφ-, παραχ- ---
  ["παραυτίκα", "momentâneo"],
  ["παραφέρεσθε", "sois-levados"],
  ["παραφερόμεναι", "sendo-levadas"],
  ["παραφρονίαν", "loucura"],
  ["παραφρονῶν", "sendo-louco"],
  ["παραχειμάσω", "invernarei"],
  ["παραχειμασίαν", "invernada"],

  // --- παρε- (aoristo/imperfeito de vários verbos παρα-) ---
  ["παρείχετο", "fornecia"],
  ["παρεβάλομεν", "chegamos"],
  ["παρεβιάσαντο", "constrangeram"],
  ["παρεβιάσατο", "constrangeu"],
  ["παρεγίνοντο", "chegavam"],
  ["παρεδέχθησαν", "foram-aceitos"],
  ["παρεδίδετο", "era-entregue"],
  ["παρεδίδοσαν", "entregavam"],
  ["παρεδίδουν", "entregavam"],
  ["παρεδρεύοντες", "servindo-junto"],
  ["παρεδόθην", "fui-entregue"],
  ["παρεδόθητε", "fostes-entregues"],
  ["παρεδώκαμεν", "entregamos"],
  ["παρεθεωροῦντο", "eram-negligenciadas"],
  ["παρειμένας", "tendo-sido-enfraquecidas"],
  ["παρεισάκτους", "introduzidos-secretamente"],
  ["παρεισάξουσιν", "introduzirão-secretamente"],
  ["παρεισεδύησαν", "infiltraram-se"],
  ["παρεισενέγκαντες", "tendo-trazido-além-disso"],
  ["παρειστήκεισαν", "estavam-de-pé-junto"],
  ["παρεισῆλθεν", "entrou-secretamente"],
  ["παρεισῆλθον", "entraram-secretamente"],
  ["παρεκάλεσά", "consolei"],
  ["παρεκάλεσάς", "consolaste"],
  ["παρεκάλεσέν", "consolou"],
  ["παρεκαλοῦμεν", "consolávamos"],
  ["παρεκλήθη", "foi-consolado"],
  ["παρεκλήθησαν", "foram-consolados"],
  ["παρελέγοντο", "navegavam-ao-longo"],
  ["παρεληλυθέναι", "ter-passado"],
  ["παρεληλυθὼς", "tendo-passado"],
  ["παρελθάτω", "passe"],
  ["παρελθόντες", "tendo-passado"],

  // --- παρεμ-, παρεν-, παρεπ- ---
  ["παρεμβαλοῦσιν", "cercarão-com-trincheiras"],
  ["παρεμβολὰς", "acampamentos"],
  ["παρενοχλεῖν", "causar-perturbação"],
  ["παρεπίδημοί", "peregrinos"],
  ["παρεπίκραναν", "provocaram"],
  ["παρεπιδήμοις", "a-peregrinos"],
  ["παρεπιδήμους", "peregrinos"],
  ["παρεπορεύοντο", "passavam-ao-lado"],

  // --- παρεσ-, παρεστ-, παρετ-, παρεχ-, παρει- ---
  ["παρεσκευασμένοι", "tendo-sido-preparados"],
  ["παρεσκεύασται", "tem-sido-preparado"],
  ["παρεστήσατε", "apresentastes"],
  ["παρεστῶτα", "os-que-estão-de-pé-junto"],
  ["παρετήρουν", "observavam"],
  ["παρεχέτω", "forneça"],
  ["παρεχόμενος", "fornecendo"],
  ["παρεῖναί", "estar-presente"],
  ["παρεῖχαν", "forneciam"],
  ["παρεῖχεν", "fornecia"],

  // --- παρηγ-, παρηκ- (ordenar, seguir) ---
  ["παρηγγέλλομεν", "ordenávamos"],
  ["παρηγγελμένα", "as-coisas-tendo-sido-ordenadas"],
  ["παρηγορία", "consolo"],
  ["παρηκολουθηκότι", "ao-tendo-seguido"],
  ["παρηκολούθηκας", "seguiste"],
  ["παρηκολούθησάς", "seguiste"],

  // --- παρθ- (virgem) ---
  ["παρθένοις", "a-virgens"],
  ["παρθένου", "de-virgem"],
  ["παρθένων", "de-virgens"],
  ["παρθενίας", "de-virgindade"],

  // --- παροικ- (peregrino, peregrinar) ---
  ["παροίκους", "peregrinos"],
  ["παροικίας", "de-peregrinação"],
  ["παροικίᾳ", "em-peregrinação"],
  ["παροικεῖς", "peregrina"],

  // --- παροιμ-, παρομ-, παροξ-, παρορ-, παροψ- ---
  ["παροιμίας", "provérbios"],
  ["παρομοιάζετε", "assemelhais-vos"],
  ["παροξυσμός", "provocação"],
  ["παροξυσμὸν", "provocação"],
  ["παροξύνεται", "é-provocado"],
  ["παροργίζετε", "provocais-à-ira"],
  ["παροργισμῷ", "em-provocação-à-ira"],
  ["παροργιῶ", "provocarei-à-ira"],
  ["παροψίδος", "do-prato"],
  ["παρούσῃ", "presente"],
  ["παροῦσιν", "aos-presentes"],

  // --- παρρησ- (ousadia, falar-com-ousadia) ---
  ["παρρησιάζεσθαι", "falar-com-ousadia"],
  ["παρρησιάσωμαι", "eu-fale-com-ousadia"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11q (freq 1, parte 17/44) ===`);
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

console.log(`\n=== Resultado Lote 11q ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

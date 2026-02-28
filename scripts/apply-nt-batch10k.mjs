#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10k
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 11/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10k-${Date.now()}.sql`);

const translations = [
  // === Índices 2481-2728 de freq2-words.json (248 palavras) ===

  // --- ἐπι- palavras (continuação) ---
  ["ἐπιθυμεῖ", "deseja"],
  ["ἐπιθῇ", "imponha"],
  ["ἐπικαλέσηται", "invoque"],
  ["ἐπικαλεσαμένου", "tendo-invocado"],
  ["ἐπικαλεῖται", "é-invocado"],
  ["ἐπικαλούμενον", "sendo-invocado"],
  ["ἐπικαλοῦμαι", "invoco"],
  ["ἐπιλάβωνται", "apanhem"],
  ["ἐπιλαμβάνεται", "toma"],
  ["ἐπιλανθάνεσθε", "esqueceis"],
  ["ἐπιούσιον", "necessário"],
  ["ἐπιποθοῦντες", "desejando-ardentemente"],
  ["ἐπιποθῶ", "desejo-ardentemente"],
  ["ἐπιποθῶν", "desejando-ardentemente"],
  ["ἐπιπόθησιν", "desejo-ardente"],
  ["ἐπιρίψαντες", "tendo-lançado-sobre"],
  ["ἐπιστάντες", "tendo-se-apresentado"],
  ["ἐπιστεύετε", "acreditáveis"],
  ["ἐπιστεύθη", "foi-confiado"],
  ["ἐπιστεύθην", "fui-confiado"],
  ["ἐπιστεύσαμεν", "acreditamos"],
  ["ἐπιστολήν", "carta"],
  ["ἐπιστολὰς", "cartas"],
  ["ἐπιστρέφειν", "voltar"],
  ["ἐπιστρέψαι", "converter"],
  ["ἐπιστᾶσα", "tendo-se-apresentado"],
  ["ἐπιτελοῦντες", "completando"],
  ["ἐπιτιμᾶν", "repreender"],
  ["ἐπιτιμῶν", "repreendendo"],
  ["ἐπιτρέψῃ", "permita"],
  ["ἐπιφανείας", "manifestação"],
  ["ἐπιχορηγίας", "suprimento"],
  ["ἐπιχορηγῶν", "suprindo"],

  // --- ἐπλ- / ἐπο- / ἐπυ- palavras ---
  ["ἐπλήρωσαν", "cumpriram"],
  ["ἐπλεόνασεν", "abundou"],
  ["ἐπληροῦντο", "eram-preenchidos"],
  ["ἐποιήσαμεν", "fizemos"],
  ["ἐποτίσατέ", "destes-de-beber"],
  ["ἐπυνθάνοντο", "perguntavam"],
  ["ἐπότιζεν", "dava-de-beber"],
  ["ἐπῆραν", "levantaram"],
  ["ἐπῆρεν", "levantou"],

  // --- ἐρ- palavras ---
  ["ἐράντισεν", "aspergiu"],
  ["ἐρήμου", "deserto"],
  ["ἐργάζομαι", "trabalho"],
  ["ἐργαζόμενος", "trabalhando"],
  ["ἐργαζώμεθα", "trabalhemos"],
  ["ἐργασίας", "trabalho"],
  ["ἐργατῶν", "trabalhadores"],
  ["ἐρημίᾳ", "deserto"],
  ["ἐρημοῦται", "é-desolada"],
  ["ἐρημώσεως", "desolação"],
  ["ἐριθείαν", "contenda"],
  ["ἐριθείας", "contenda"],
  ["ἐριθεῖαι", "contendas"],
  ["ἐρριζωμένοι", "tendo-sido-enraizados"],
  ["ἐρχομένη", "vindo"],
  ["ἐρχομένου", "vindo"],
  ["ἐρχόμενα", "vindas"],
  ["ἐρχόμενοι", "vindos"],
  ["ἐρωτᾷς", "perguntas"],

  // --- ἐσ- palavras ---
  ["ἐσίγησαν", "silenciaram"],
  ["ἐσείσθη", "foi-sacudida"],
  ["ἐσθίοντα", "comendo"],
  ["ἐσθίωσιν", "comam"],
  ["ἐσθίῃ", "coma"],
  ["ἐσιώπα", "calava-se"],
  ["ἐσιώπων", "calavam-se"],
  ["ἐσκίρτησεν", "saltou"],
  ["ἐσκανδαλίζοντο", "eram-escandalizados"],
  ["ἐσπαρμένον", "tendo-sido-semeado"],
  ["ἐσταυρώσατε", "crucificastes"],
  ["ἐστρωμένον", "tendo-sido-estendido"],
  ["ἐσφραγίσθητε", "fostes-selados"],
  ["ἐσχάτῳ", "último"],
  ["ἐσχήκαμεν", "temos-tido"],

  // --- ἐτ- palavras ---
  ["ἐτάραξαν", "perturbaram"],
  ["ἐτέθην", "fui-colocado"],
  ["ἐτέθησαν", "foram-colocados"],
  ["ἐτέλεσαν", "completaram"],
  ["ἐτίθουν", "colocavam"],
  ["ἐταράχθησαν", "foram-perturbados"],
  ["ἐτύφλωσεν", "cegou"],

  // --- ἐφ- / ἐχ- / ἐψ- palavras ---
  ["ἐφημερίας", "divisão-sacerdotal"],
  ["ἐφθάσαμεν", "chegamos"],
  ["ἐφονεύσατε", "assassinastes"],
  ["ἐχθρῶν", "inimigos"],
  ["ἐχθὲς", "ontem"],
  ["ἐχορτάσθησαν", "foram-saciados"],
  ["ἐχούσης", "tendo"],
  ["ἐψευδομαρτύρουν", "testemunhavam-falsamente"],

  // --- ἑ- palavras (espírito áspero) ---
  ["ἑαυτῇ", "a-si-mesma"],
  ["ἑδραῖοι", "firmes"],
  ["ἑκατονταπλασίονα", "cem-vezes-mais"],
  ["ἑκατονταρχῶν", "centuriões"],
  ["ἑνδεκάτην", "décima-primeira"],
  ["ἑνότητα", "unidade"],
  ["ἑρμηνεύεται", "é-interpretado"],
  ["ἑρπετὰ", "répteis"],
  ["ἑρπετῶν", "répteis"],
  ["ἑστηκὼς", "tendo-ficado-de-pé"],
  ["ἑτέρας", "outra"],
  ["ἑτέροις", "outros"],
  ["ἑτοίμην", "preparada"],
  ["ἑτοιμάσωμεν", "preparemos"],
  ["ἑωράκατε", "tendes-visto"],
  ["ἑωρακὼς", "tendo-visto"],
  ["ἑώρακα", "tenho-visto"],

  // --- ἔ- palavras (aoristo/passado) ---
  ["ἔβρεξεν", "choveu"],
  ["ἔγραφεν", "escrevia"],
  ["ἔδειραν", "espancaram"],
  ["ἔδησαν", "amarraram"],
  ["ἔδοξαν", "glorificaram"],
  ["ἔδοξε", "pareceu"],
  ["ἔδοξεν", "pareceu"],
  ["ἔδραμεν", "correu"],
  ["ἔθη", "costumes"],
  ["ἔθηκας", "colocaste"],
  ["ἔθηκεν", "colocou"],
  ["ἔκβασιν", "saída"],
  ["ἔκδικος", "vingador"],
  ["ἔκειτο", "jazia"],
  ["ἔκλαιεν", "chorava"],
  ["ἔκπαλαι", "desde-outrora"],
  ["ἔκραξαν", "clamaram"],
  ["ἔκραξεν", "clamou"],
  ["ἔκρινα", "julguei"],
  ["ἔκτισεν", "criou"],
  ["ἔλαβες", "recebeste"],
  ["ἔλαττον", "menor"],
  ["ἔλεγξον", "repreende"],
  ["ἔμαθες", "aprendeste"],
  ["ἔμειναν", "permaneceram"],
  ["ἔμελεν", "importava"],
  ["ἔμφοβος", "aterrorizado"],
  ["ἔναντι", "diante-de"],
  ["ἔνθεν", "daqui"],
  ["ἔνιψεν", "lavou"],
  ["ἔντιμον", "honrado"],
  ["ἔξελε", "arranca"],
  ["ἔξοδον", "partida"],
  ["ἔοικεν", "assemelha-se"],
  ["ἔπαισεν", "golpeou"],
  ["ἔπεσαν", "caíram"],
  ["ἔπιεν", "bebeu"],
  ["ἔπιον", "beberam"],
  ["ἔπνευσαν", "sopraram"],
  ["ἔπραξεν", "praticou"],
  ["ἔρημος", "deserta"],
  ["ἔριν", "contenda"],
  ["ἔριψαν", "lançaram"],
  ["ἔρχεταί", "vem"],
  ["ἔρχηται", "venha"],
  ["ἔσεσθέ", "sereis"],
  ["ἔσομαι", "serei"],
  ["ἔσονταί", "serão"],
  ["ἔσπειρα", "semeei"],
  ["ἔστησαν", "colocaram-de-pé"],
  ["ἔστρεψεν", "virou"],
  ["ἔστρωσαν", "estenderam"],
  ["ἔσυρον", "arrastavam"],
  ["ἔσφαξεν", "matou"],
  ["ἔταξαν", "designaram"],
  ["ἔτεσιν", "anos"],
  ["ἔτος", "ano"],
  ["ἔχθρα", "inimizade"],
  ["ἔχθραν", "inimizade"],
  ["ἔχοι", "tivesse"],
  ["ἔχοντι", "tendo"],
  ["ἔχοντος", "tendo"],
  ["ἔχουσαν", "tendo"],
  ["ἔχρισέν", "ungiu"],

  // --- ἕ- palavras ---
  ["ἕκαστοι", "cada-um"],
  ["ἕκτην", "sexta"],
  ["ἕκτης", "sexta"],
  ["ἕξουσιν", "terão"],
  ["ἕστηκας", "tens-ficado-de-pé"],
  ["ἕτοιμα", "preparadas"],
  ["ἕτοιμός", "preparado"],

  // --- Ἐ- maiúsculas (início de frase) ---
  ["Ἐγερθεὶς", "Tendo-sido-levantado"],
  ["Ἐζήτουν", "Buscavam"],
  ["Ἐκάθισεν", "Sentou-se"],
  ["Ἐλεάζαρ", "Eleazar"],
  ["Ἐλιακεὶμ", "Eliaquim"],
  ["Ἐλωῒ", "Eloí"],
  ["Ἐντραπήσονται", "Envergonhar-se-ão"],
  ["Ἐνὼχ", "Enoque"],
  ["Ἐξομολογοῦμαί", "Confesso"],
  ["Ἐπίστευσεν", "Acreditou"],
  ["Ἐπαφρᾶς", "Epafras"],
  ["Ἐπειδὴ", "Porquanto"],
  ["Ἐπικατάρατος", "Maldito"],
  ["Ἐρωτήσω", "Perguntarei"],
  ["Ἐρωτῶμεν", "Perguntamos"],
  ["Ἐσρὼμ", "Esrom"],
  ["Ἐχάρην", "Alegrei-me"],

  // --- Ἑ- maiúsculas (espírito áspero) ---
  ["Ἑβραϊστί", "Em-hebraico"],
  ["Ἑβραϊστὶ", "Em-hebraico"],
  ["Ἑκατὸν", "Cem"],
  ["Ἑπτά", "Sete"],
  ["Ἑρμῆν", "Hermes"],

  // --- Ἔ- maiúsculas ---
  ["Ἔκτεινον", "Estende"],
  ["Ἔλεος", "Misericórdia"],
  ["Ἔξεστιν", "É-permitido"],
  ["Ἔπειτα", "Depois"],
  ["Ἔραστος", "Erasto"],
  ["Ἔρημός", "Deserta"],
  ["Ἔρχεσθε", "Vinde"],
  ["Ἔστιν", "É"],
  ["Ἔχομεν", "Temos"],

  // --- Ἕ- maiúsculas ---
  ["Ἕλληνες", "Gregos"],
  ["Ἕλληνι", "Grego"],

  // --- ἠ- palavras (aumento temporal) ---
  ["ἠγάγετε", "conduzistes"],
  ["ἠγάπησάς", "amaste"],
  ["ἠγάπησαν", "amaram"],
  ["ἠγέρθησαν", "foram-levantados"],
  ["ἠγνόουν", "ignoravam"],
  ["ἠγοράσθητε", "fostes-comprados"],
  ["ἠγόρασα", "comprei"],
  ["ἠγόρασαν", "compraram"],
  ["ἠδυνήθημεν", "pudemos"],
  ["ἠθέλησας", "quiseste"],
  ["ἠθέτησαν", "rejeitaram"],
  ["ἠκολουθήσαμέν", "seguimos"],
  ["ἠκολούθουν", "seguiam"],
  ["ἠκρίβωσεν", "averiguou-cuidadosamente"],
  ["ἠλεήθην", "fui-misericordiado"],
  ["ἠλπίκαμεν", "temos-esperado"],
  ["ἠμφιεσμένον", "tendo-sido-vestido"],
  ["ἠνάγκασεν", "compeliu"],
  ["ἠνέχθη", "foi-trazido"],
  ["ἠνέῳξέν", "abriu"],
  ["ἠπίστουν", "não-criam"],
  ["ἠρνήσασθε", "negastes"],
  ["ἠσθένησεν", "adoeceu"],
  ["ἠστόχησαν", "desviaram-se"],

  // --- ἡγ- palavras ---
  ["ἡγίασται", "tem-sido-santificado"],
  ["ἡγεμονεύοντος", "governando"],
  ["ἡγεμόνα", "governador"],
  ["ἡγεμόνας", "governadores"],
  ["ἡγεμόσιν", "governadores"],
  ["ἡγεῖσθε", "considerai"],
  ["ἡγησάμενος", "tendo-considerado"],
  ["ἡγησάμην", "considerei"],
  ["ἡγιασμένοι", "tendo-sido-santificados"],
  ["ἡγουμένους", "líderes"],
  ["ἡγούμενοι", "líderes"],

  // --- ἡδ- palavras ---
  ["ἡδοναῖς", "prazeres"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10k (freq 2, parte 11/12) ===`);
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
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;

    if (changes > 0) {
      process.stdout.write(`✓ ${word} → ${translation} (${changes})\n`);
    } else {
      process.stdout.write(`· ${word} → ${translation} (0)\n`);
    }
    success++;
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 10k ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

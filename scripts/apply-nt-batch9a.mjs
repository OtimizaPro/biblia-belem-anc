#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 9a
 * Aplica traduções literais para palavras gregas freq 3 no NT (parte 1/5)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch9a-${Date.now()}.sql`);

const translations = [
  // === Índices 0-246 de freq3-words.json ===

  // Verbos (maiúsculas iniciais - início de frase ou imperativo)
  ["Αἶρε", "Levanta"],
  ["Αὐτοὶ", "Eles-mesmos"],
  ["ΒΑΣΙΛΕΥΣ", "REI"],
  ["Βαπτιστήν", "Batista"],
  ["Βενιαμείν", "Benjamim"],
  ["Βηθανίᾳ", "Betânia"],
  ["Βηθσαϊδά", "Betsaida"],
  ["Βηθσαϊδάν", "Betsaida"],
  ["Βηθφαγὴ", "Betfagé"],
  ["Γαλατίας", "Galácia"],
  ["Γενομένης", "Tendo-acontecido"],
  ["Γερασηνῶν", "Gerasenos"],
  ["Γινώσκετε", "Conhecei"],
  ["Δέρβην", "Derbe"],
  ["Δίδυμος", "Dídimo"],
  ["Δαμασκὸν", "Damasco"],
  ["Δημᾶς", "Demas"],
  ["Διέλθωμεν", "Passemos-ao-outro-lado"],
  ["Διό", "Por-isso"],
  ["Δυνάμεθα", "Podemos"],
  ["Δός", "Dá"],
  ["Δὸς", "Dá"],
  ["Εἰπὲ", "Dize"],
  ["Εἰσῆλθεν", "Entrou"],
  ["Εἴπατε", "Dizei"],
  ["Εὐχαριστῶ", "Dou-graças"],
  ["Θέλεις", "Queres"],
  ["Θεσσαλονικέων", "Tessalonicenses"],
  ["Κάϊν", "Caim"],
  ["Καθὼς", "Assim-como"],
  ["Κανὰ", "Caná"],
  ["Καϊάφας", "Caifás"],
  ["Κιλικίαν", "Cilícia"],
  ["Κυρηναῖον", "Cireneu"],
  ["Κἂν", "Mesmo-se"],
  ["Λουκᾶς", "Lucas"],
  ["Λύστραν", "Listra"],
  ["Λύστροις", "Listra"],
  ["Μάρκον", "Marcos"],
  ["Μαγδαληνή", "Madalena"],
  ["Μαθθαῖον", "Mateus"],
  ["Μακεδονίᾳ", "Macedônia"],
  ["Μηκέτι", "Não-mais"],
  ["Μικρὸν", "Pouco"],
  ["Ναζωραῖον", "Nazareno"],
  ["Ναθαναήλ", "Natanael"],
  ["Ναθαναὴλ", "Natanael"],
  ["Οὕτως", "Assim"],
  ["Πέτρε", "Pedro"],
  ["Παμφυλίαν", "Panfília"],
  ["Παράκλητος", "Consolador"],
  ["Πειλάτου", "Pilatos"],
  ["Πεντηκοστῆς", "Pentecostes"],
  ["Πολλῆς", "Muita"],
  ["Πορεύεσθε", "Ide"],
  ["Πορεύθητι", "Vai"],
  ["Προφήτευσον", "Profetiza"],
  ["Πρὶν", "Antes-que"],
  ["Πόσους", "Quantos"],
  ["Σαμαρείτης", "Samaritano"],
  ["Σαμουὴλ", "Samuel"],
  ["Σαούλ", "Saul"],
  ["Σιδῶνος", "Sidom"],
  ["Σολομὼν", "Salomão"],
  ["Στέφανον", "Estêvão"],
  ["Σταύρωσον", "Crucifica"],
  ["Στεφανᾶ", "Estéfanas"],
  ["Τίνος", "De-quem"],
  ["Τίτος", "Tito"],
  ["Τιβεριάδος", "Tiberíades"],
  ["Τρῳάδα", "Trôade"],
  ["Τυχικὸς", "Tíquico"],
  ["Υἱός", "Filho"],
  ["Φαρὲς", "Fares"],
  ["Φρυγίαν", "Frígia"],
  ["Φῆστον", "Festo"],

  // αι- palavras
  ["αἰσχύνης", "vergonha"],
  ["αἰτεῖτε", "pedi"],
  ["αἰτοῦσιν", "pedem"],
  ["αἱρέσεις", "heresias"],
  ["αἱρέσεως", "heresia"],
  ["αἴτιον", "causa"],
  ["αὑτὸν", "si-mesmo"],

  // β- palavras
  ["βάλλεται", "é-lançado"],
  ["βάλω", "lance"],
  ["βάρβαρος", "bárbaro"],
  ["βίου", "vida"],
  ["βαλεῖν", "lançar"],
  ["βαπτίζω", "batizo"],
  ["βαπτίσει", "batizará"],
  ["βαπτισθήσεσθε", "sereis-batizados"],
  ["βαπτισθεὶς", "tendo-sido-batizado"],
  ["βασιλέα", "rei"],
  ["βασιλέως", "rei"],
  ["βαστάζων", "carregando"],
  ["βδέλυγμα", "abominação"],
  ["βεβήλους", "profanos"],
  ["βεβλημένον", "tendo-sido-lançado"],
  ["βλέπεις", "vês"],
  ["βλέπουσιν", "veem"],
  ["βλασφημίαι", "blasfêmias"],
  ["βλασφημεῖν", "blasfemar"],
  ["βλασφημοῦσιν", "blasfemam"],
  ["βοσκομένη", "sendo-apascentada"],
  ["βουλὴ", "conselho"],
  ["βουλῇ", "conselho"],
  ["βρέφη", "crianças-de-peito"],
  ["βραχύ", "pouco"],
  ["βραχὺ", "pouco"],
  ["βρώμασιν", "alimentos"],
  ["βόθυνον", "cova"],
  ["βόσκοντες", "apascentando"],

  // γ- palavras
  ["γάλακτος", "leite"],
  ["γέγονας", "tens-te-tornado"],
  ["γένη", "raças"],
  ["γαζοφυλάκιον", "tesouro"],
  ["γαλήνη", "calmaria"],
  ["γαμίζονται", "são-dados-em-casamento"],
  ["γεέννης", "geena"],
  ["γείτονας", "vizinhos"],
  ["γεγέννηκά", "gerei"],
  ["γεγονός", "tendo-acontecido"],
  ["γενέσεως", "origem"],
  ["γενήματος", "fruto"],
  ["γενεὰς", "gerações"],
  ["γεννηθεὶς", "tendo-sido-gerado"],
  ["γεννηθῆναι", "ser-gerado"],
  ["γεννηθῇ", "seja-gerado"],
  ["γενομένοις", "tendo-acontecido"],
  ["γεύσωνται", "provem"],
  ["γλῶσσαι", "línguas"],
  ["γνοῖ", "conheça"],
  ["γνωρίζω", "faço-conhecer"],
  ["γνωρίσαι", "fazer-conhecer"],
  ["γνῶσις", "conhecimento"],
  ["γνῷ", "conheça"],
  ["γράμμασιν", "letras"],
  ["γράμματος", "letra"],
  ["γράψας", "tendo-escrito"],
  ["γραμματεὺς", "escriba"],
  ["γραφὴν", "escritura"],
  ["γραφῆς", "escritura"],
  ["γυμνὸν", "nu"],
  ["γυναικῶν", "mulheres"],
  ["γυναιξίν", "mulheres"],
  ["γόνυ", "joelho"],

  // δ- palavras
  ["δέδεται", "tem-sido-atado"],
  ["δέδωκα", "tenho-dado"],
  ["δέξασθαι", "receber"],
  ["δέξασθε", "recebei"],
  ["δέχωνται", "recebam"],
  ["δίδοται", "é-dado"],
  ["δαιμονιζομένους", "endemoninhados"],
  ["δακτύλῳ", "dedo"],
  ["δεήσεις", "súplicas"],
  ["δείπνοις", "banquetes"],
  ["δείραντες", "tendo-espancado"],
  ["δεκαπέντε", "quinze"],
  ["δεκατέσσαρες", "quatorze"],
  ["δεξάμενος", "tendo-recebido"],
  ["δεσμὰ", "cadeias"],
  ["δευτέρῳ", "segundo"],
  ["δεόμενοι", "suplicando"],
  ["δεῖπνον", "ceia"],
  ["δηνάρια", "denários"],
  ["διάκονον", "servo"],
  ["διέτριβον", "permaneciam"],
  ["διακονίᾳ", "ministério"],
  ["διακονῇ", "sirva"],
  ["διακόνοις", "servos"],
  ["διαλογισμοὶ", "raciocínios"],
  ["διαλογισμοὺς", "raciocínios"],
  ["διαλογισμῶν", "raciocínios"],
  ["διδάξαι", "ensinar"],
  ["διδασκάλους", "mestres"],
  ["διδασκαλίαν", "ensino"],
  ["διδόντι", "dando"],
  ["διελθὼν", "tendo-passado"],
  ["διερχόμενος", "passando"],
  ["διεστείλατο", "ordenou-severamente"],
  ["διηνεκὲς", "perpetuidade"],
  ["δικαίωμα", "ordenança-justa"],
  ["διψήσει", "terá-sede"],
  ["διωγμοῖς", "perseguições"],
  ["διώκων", "perseguindo"],
  ["διώξουσιν", "perseguirão"],
  ["δοθείσης", "tendo-sido-dada"],
  ["δοθεῖσαν", "tendo-sido-dada"],
  ["δοθῇ", "seja-dada"],
  ["δοκιμάζειν", "provar"],
  ["δοκιμὴν", "prova"],
  ["δοκοῦντες", "parecendo"],
  ["δοξασθῇ", "seja-glorificado"],
  ["δουλεύοντες", "servindo"],
  ["δούλου", "servo"],
  ["δούλῳ", "servo"],
  ["δραμὼν", "tendo-corrido"],
  ["δρόμον", "corrida"],
  ["δυνάμενοι", "podendo"],
  ["δυνάμεων", "poderes"],
  ["δυναμένου", "podendo"],
  ["δυνατεῖ", "é-poderoso"],
  ["δυνατοὶ", "poderosos"],
  ["δυνατόν", "possível"],
  ["δυσκόλως", "dificilmente"],
  ["δωρεᾶς", "dom"],
  ["δόκιμος", "aprovado"],
  ["δόλος", "engano"],
  ["δόματα", "dons"],
  ["δόξας", "glórias"],
  ["δόξασόν", "glorifica"],
  ["δός", "dá"],
  ["δότε", "dai"],
  ["δύνασαι", "podes"],
  ["δύνῃ", "podes"],
  ["δώματος", "telhado"],
  ["δῶρά", "ofertas"],
  ["δῶρόν", "oferta"],
  ["δῶτε", "deis"],

  // ει- palavras
  ["εἰδωλοθύτων", "sacrificado-a-ídolos"],
  ["εἰκόνα", "imagem"],
  ["εἰποῦσα", "tendo-dito"],
  ["εἰπόντα", "tendo-dito"],
  ["εἰπόντες", "tendo-dito"],
  ["εἰρήκει", "tinha-dito"],
  ["εἰρηνεύετε", "tende-paz"],
  ["εἰσήγαγεν", "introduziu"],
  ["εἰσήγαγον", "introduziram"],
  ["εἰσελεύσεται", "entrará"],
  ["εἰσερχόμενος", "entrando"],
  ["εἰσπορευόμενον", "entrando"],
  ["εἰσπορεύεται", "entra"],
  ["εἴρηκέν", "tem-dito"],
  ["εἴσοδον", "entrada"],
  ["εἴχετε", "tínheis"],
  ["εἵνεκεν", "por-causa-de"],
  ["εἶπα", "disse"],
  ["εἶπας", "disseste"],

  // ευ- palavras
  ["εὐαγγέλιόν", "boa-nova"],
  ["εὐαγγελίζεται", "anuncia-boa-nova"],
  ["εὐαγγελιζόμενος", "anunciando-boa-nova"],
  ["εὐδοκία", "boa-vontade"],
  ["εὐηγγελίζετο", "anunciava-boa-nova"],
  ["εὐλογεῖτε", "bendizei"],
  ["εὐλογητὸς", "bendito"],
  ["εὐλογοῦμεν", "bendizemos"],
  ["εὐνοῦχοι", "eunucos"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 9a (freq 3, parte 1/5) ===`);
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

console.log(`\n=== Resultado Lote 9a ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

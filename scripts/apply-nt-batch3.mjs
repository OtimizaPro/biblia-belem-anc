#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 3
 * Aplica traduções literais para palavras gregas freq 7-8 no NT
 */

import { execSync } from 'child_process';

const DB = 'biblia-belem';

const translations = [
  // freq 8
  ["ῥίζαν", "raiz"],
  ["ὦσιν", "sejam"],
  ["Ὑψίστου", "Altíssimo"],
  ["ὄντως", "verdadeiramente"],
  ["ὀψίας", "tarde"],
  ["ὀφθαλμῷ", "olho"],
  ["Ἰούδαν", "Judas"],
  ["Ἰουδαίαν", "Judeia"],
  ["ἱματίου", "manto"],
  ["ἱκανὸς", "digno"],
  ["ἱερεὺς", "sacerdote"],
  ["ἤθελον", "queriam"],
  ["ἠρώτησαν", "perguntaram"],
  ["ἠρνήσατο", "negou"],
  ["ἠθέλησεν", "quis"],
  ["Ἔγειρε", "Levanta-te"],
  ["ἔσῃ", "serás"],
  ["ἔπεμψα", "enviei"],
  ["ἔμπροσθέν", "diante-de"],
  ["ἔμεινεν", "permaneceu"],
  ["ἔγραψεν", "escreveu"],
  ["ἑκατοντάρχης", "centurião"],
  ["ἐσχάτῃ", "última"],
  ["ἐσμέν", "somos"],
  ["ἐσθίουσιν", "comem"],
  ["ἐρωτῶ", "peço"],
  ["ἐποιήσατε", "fizestes"],
  ["ἐπειδὴ", "uma-vez-que"],
  ["ἐνθάδε", "aqui"],
  ["ἐνετείλατο", "ordenou"],
  ["ἐλπὶς", "esperança"],
  ["ἐλάλησα", "falei"],
  ["ἐκτὸς", "fora-de"],
  ["ἐκείνοις", "àqueles"],
  ["ἐθαύμασαν", "admiraram-se"],
  ["Ἀνανίας", "Ananias"],
  ["Ἀδὰμ", "Adão"],
  ["ἄρχοντες", "governantes"],
  ["ἄπιστος", "incrédulo"],
  ["ἁμαρτίαις", "pecados"],
  ["ἀσθενείας", "fraqueza"],
  ["ἀρχιερέα", "sumo-sacerdote"],
  ["ἀρξάμενος", "começando"],
  ["ἀπολύσω", "soltarei"],
  ["ἀπελθόντες", "tendo-ido-embora"],
  ["ἀπέλυσεν", "soltou"],
  ["ἀνέβησαν", "subiram"],
  ["ἀκούσωσιν", "ouçam"],
  ["ἀδελφόν", "irmão"],
  ["ἀγαπᾶν", "amar"],
  ["ἀγαθοῦ", "bom"],
  ["ψυχῇ", "alma"],
  ["χώρας", "região"],
  ["χεὶρ", "mão"],
  ["χαίρω", "alegro-me"],
  ["χήρα", "viúva"],
  ["χάρισμα", "dom"],
  ["φρόνιμοι", "prudentes"],
  ["φίλους", "amigos"],
  ["φίλος", "amigo"],
  ["τυφλοὶ", "cegos"],
  ["τινὰς", "alguns"],
  ["τελῶναι", "cobradores-de-impostos"],
  ["τέκνοις", "filhos"],
  ["τάξιν", "ordem"],
  ["τάλαντα", "talentos"],
  ["συνήχθησαν", "foram-reunidos"],
  ["σαρκός", "carne"],
  ["πρωῒ", "de-manhã"],
  ["προσῆλθεν", "aproximou-se"],
  ["πορευθεὶς", "tendo-ido"],
  ["πορευθέντες", "tendo-ido"],
  ["πολὺν", "muito"],
  ["πολλῇ", "muita"],
  ["πολλὰς", "muitas"],
  ["πνεῦμά", "espírito"],
  ["πιστεύσητε", "creiais"],
  ["πιστεύσαντες", "tendo-crido"],
  ["πατρὶ", "pai"],
  ["παρεκάλουν", "suplicavam"],
  ["παρεκάλει", "suplicava"],
  ["παραλαμβάνει", "toma-consigo"],
  ["παραγενόμενος", "tendo-chegado"],
  ["πίνων", "bebendo"],
  ["πέμψαι", "enviar"],
  ["οὔ", "não"],
  ["οὐδεμίαν", "nenhuma"],
  ["μιᾶς", "uma"],
  ["μηδένα", "ninguém"],
  ["μαρτύρων", "testemunhas"],
  ["μακρόθεν", "de-longe"],
  ["μήτι", "acaso"],
  ["μέσου", "meio"],
  ["μέντοι", "contudo"],
  ["κἀκεῖθεν", "e-de-lá"],
  ["κρυπτῷ", "oculto"],
  ["κινδύνοις", "perigos"],
  ["καρποὺς", "frutos"],
  ["κακόν", "mal"],
  ["κακοῦ", "mal"],
  ["θύρας", "porta"],
  ["θυσίας", "sacrifício"],
  ["θεμέλιον", "fundamento"],
  ["ζῆλος", "zelo"],
  ["ζητοῦντες", "buscando"],
  ["εὑρόντες", "tendo-encontrado"],
  ["εὑρήσετε", "encontrareis"],
  ["εὑρήσει", "encontrará"],
  ["εἰσέλθῃ", "entre"],
  ["εἰρήνῃ", "paz"],
  ["δύνασθαι", "poder"],
  ["δυνατὸς", "poderoso"],
  ["δίκτυα", "redes"],
  ["δέχεται", "recebe"],
  ["δέξηται", "receba"],
  ["δέδωκεν", "tem-dado"],
  ["γυναικὶ", "mulher"],
  ["γρηγορεῖτε", "vigiai"],
  ["γνώσει", "conhecimento"],
  ["γέενναν", "Geena"],
  ["βάλε", "lança"],
  ["αἰῶνι", "era"],
  ["Φαρισαῖος", "fariseu"],
  ["Τίνα", "Quem"],
  ["Σαῦλος", "Saulo"],
  ["Σαμαρίας", "Samaria"],
  ["Σαδδουκαίων", "saduceus"],
  ["Παρακαλῶ", "Exorto"],
  ["Νῶε", "Noé"],
  ["Μωϋσεῖ", "Moisés"],
  ["Μελχισέδεκ", "Melquisedeque"],
  ["Μαγδαληνὴ", "Madalena"],
  ["Λάζαρος", "Lázaro"],
  ["Καφαρναοὺμ", "Cafarnaum"],
  ["Καφαρναούμ", "Cafarnaum"],
  ["Καίσαρι", "César"],
  ["Θωμᾶς", "Tomé"],
  ["Δαμασκῷ", "Damasco"],
  ["Βαρνάβαν", "Barnabé"],
  ["Αἰγύπτου", "Egito"],
  // freq 7
  ["ὑπάρχοντα", "posses"],
  ["ὅραμα", "visão"],
  ["ὀφθαλμοῖς", "olhos"],
  ["ὀλίγοι", "poucos"],
  ["ὀδόντων", "dentes"],
  ["Ἰωνᾶ", "Jonas"],
  ["ἰχθύων", "peixes"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 3 ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");

    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;

    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const parsed = JSON.parse(result);
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

console.log(`\n=== Resultado Lote 3 ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 9c
 * Aplica traduções literais para palavras gregas freq 3 no NT (parte 3/5)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch9c-${Date.now()}.sql`);

const translations = [
  // índices 494-740 de freq3-words.json (247 palavras)
  ["παραβολὰς", "parábolas"],
  ["παραβολῆς", "parábola"],
  ["παραγίνεται", "chega"],
  ["παραδιδούς", "entregando"],
  ["παραδοθήσεται", "será-entregue"],
  ["παραδοῦναι", "entregar"],
  ["παραδῷ", "entregue"],
  ["παραθήκην", "depósito"],
  ["παρακαλεῖν", "exortar"],
  ["παρακαλεῖτε", "exortai"],
  ["παρακύψας", "inclinando-se"],
  ["παραπορευόμενοι", "passando-ao-lado"],
  ["παραπτώμασιν", "transgressões"],
  ["παραστήσει", "apresentará"],
  ["παρεκτὸς", "exceto"],
  ["παρεστηκὼς", "tendo-estado-de-pé"],
  ["παρεστῶσιν", "estejam-de-pé"],
  ["παρεῖναι", "estar-presente"],
  ["παρθένος", "virgem"],
  ["παρουσίαν", "vinda"],
  ["πατάξας", "tendo-ferido"],
  ["πατράσιν", "pais"],
  ["πατρίδα", "pátria"],
  ["παῖδας", "crianças"],
  ["πεινᾷ", "tem-fome"],
  ["πειρασμοῖς", "tentações"],
  ["πενθερὰ", "sogra"],
  ["πεπιστευκότων", "dos-que-creram"],
  ["πεπληρωμένη", "tendo-sido-preenchida"],
  ["πεπληρωμένοι", "tendo-sido-preenchidos"],
  ["περίκειται", "está-posto-ao-redor"],
  ["περιεπάτησεν", "andou"],
  ["περιπατήσωμεν", "andemos"],
  ["περιπατεῖ", "anda"],
  ["περιπατῶμεν", "andemos"],
  ["περισσείαν", "abundância"],
  ["περισσεύει", "abunda"],
  ["περισσοτέραν", "mais-abundante"],
  ["περισσότερόν", "mais-abundantemente"],
  ["περιστερὰς", "pombas"],
  ["περιχώρου", "região-circunvizinha"],
  ["περιῆγεν", "percorria"],
  ["πετεινῶν", "aves"],
  ["πετρώδη", "pedregosos"],
  ["πικρίας", "amargura"],
  ["πιστεύσασιν", "aos-que-creram"],
  ["πλάνῃ", "engano"],
  ["πλέξαντες", "tendo-trançado"],
  ["πλανήσουσιν", "enganarão"],
  ["πλατείας", "praças"],
  ["πλείονες", "mais-numerosos"],
  ["πλεονεξίας", "ganância"],
  ["πλεονεξίᾳ", "ganância"],
  ["πλεῖόν", "mais"],
  ["πληθυνθείη", "seja-multiplicada"],
  ["πληρώματος", "plenitude"],
  ["πληρῶσαι", "cumprir"],
  ["πλούσιον", "rico"],
  ["πνευματικοῖς", "espirituais"],
  ["πνευματικόν", "espiritual"],
  ["πνευματικὰ", "espirituais"],
  ["πνεύμασιν", "espíritos"],
  ["πνεύματί", "espírito"],
  ["ποίει", "faze"],
  ["ποδῶν", "pés"],
  ["ποιήσεις", "farás"],
  ["ποιήσῃ", "faça"],
  ["ποιεῖσθαι", "fazer"],
  ["ποιμένες", "pastores"],
  ["ποιμήν", "pastor"],
  ["ποιοῦντας", "fazendo"],
  ["πολέμους", "guerras"],
  ["πολλαί", "muitas"],
  ["πολλαὶ", "muitas"],
  ["πονηρίας", "maldade"],
  ["πονηροῖς", "maus"],
  ["πορευομένων", "indo"],
  ["πορευόμενος", "indo"],
  ["πορνεία", "prostituição"],
  ["πορνείαν", "prostituição"],
  ["πορφύραν", "púrpura"],
  ["ποσάκις", "quantas-vezes"],
  ["ποσὶν", "pés"],
  ["ποταμοὶ", "rios"],
  ["ποτὲ", "alguma-vez"],
  ["που", "em-algum-lugar"],
  ["πράγματι", "assunto"],
  ["πράσσοντας", "praticando"],
  ["πρέπει", "convém"],
  ["πραΰτητι", "mansidão"],
  ["πραθῆναι", "ser-vendido"],
  ["πρεσβύτερος", "ancião"],
  ["προάγοντες", "precedendo"],
  ["προκόψουσιν", "progredirão"],
  ["προσέθετο", "acrescentou"],
  ["προσέχοντες", "prestando-atenção"],
  ["προσαγωγὴν", "acesso"],
  ["προσδεχόμενοι", "aguardando"],
  ["προσδοκῶν", "esperando"],
  ["προσδοκῶντες", "esperando"],
  ["προσελάβοντο", "receberam-consigo"],
  ["προσετέθη", "foi-acrescentado"],
  ["προσευχόμενον", "orando"],
  ["προσεῖχον", "prestavam-atenção"],
  ["προσκυνεῖν", "adorar"],
  ["προσκόπτει", "tropeça"],
  ["προστεθήσεται", "será-acrescentado"],
  ["προσφέρειν", "oferecer"],
  ["προσωπολημψία", "acepção-de-pessoas"],
  ["πρωΐ", "de-manhã"],
  ["πρωτοκαθεδρίας", "primeiros-assentos"],
  ["πρωτοκλισίας", "primeiros-lugares"],
  ["πρωτότοκον", "primogênito"],
  ["πρόθυμον", "pronto"],
  ["πρόσωπόν", "face"],
  ["πρᾶγμα", "assunto"],
  ["πτωχὴ", "pobre"],
  ["πυρετός", "febre"],
  ["πόλεων", "cidades"],
  ["πόρνος", "fornicador"],
  ["πόρρω", "longe"],
  ["πύλης", "porta"],
  ["πύργον", "torre"],
  ["σαλευθήσονται", "serão-abalados"],
  ["σελήνη", "lua"],
  ["σημαίνων", "sinalizando"],
  ["σημείων", "sinais"],
  ["σινδόνα", "linho"],
  ["σινδόνι", "linho"],
  ["σκέλη", "pernas"],
  ["σκανδαλισθήσονται", "serão-escandalizados"],
  ["σκεύη", "vasos"],
  ["σκεῦος", "vaso"],
  ["σκηνάς", "tendas"],
  ["σκιᾷ", "sombra"],
  ["σκληροκαρδίαν", "dureza-de-coração"],
  ["σκληρύνητε", "endureçais"],
  ["σκορπίζει", "dispersa"],
  ["σοφοὺς", "sábios"],
  ["σπείρεις", "semeias"],
  ["σπείρης", "coorte"],
  ["σπερμάτων", "sementes"],
  ["σπεῖραν", "coorte"],
  ["σπορίμων", "searas"],
  ["σπουδαίως", "diligentemente"],
  ["σπουδῆς", "diligência"],
  ["σπουδῇ", "diligência"],
  ["σπυρίδας", "cestos"],
  ["σπόγγον", "esponja"],
  ["σπόρον", "semente"],
  ["στάσεως", "dissensão"],
  ["στάσιν", "dissensão"],
  ["στάχυας", "espigas"],
  ["στέγην", "telhado"],
  ["στέφανον", "coroa"],
  ["σταδίους", "estádios"],
  ["σταυρωθῆναι", "ser-crucificado"],
  ["σταυρωθῇ", "seja-crucificado"],
  ["στενάζομεν", "gememos"],
  ["στοᾷ", "pórtico"],
  ["στρατηγοὶ", "comandantes"],
  ["στρατηγοῖς", "comandantes"],
  ["στρατηγὸς", "comandante"],
  ["στρατιώταις", "soldados"],
  ["στόματα", "bocas"],
  ["στῆθι", "fica-de-pé"],
  ["στῆθος", "peito"],
  ["στῆσαι", "estabelecer"],
  ["συλλαβεῖν", "prender"],
  ["συμφέρον", "conveniente"],
  ["συνάγων", "reunindo"],
  ["συνήγαγον", "reuniram"],
  ["συνίστησιν", "recomenda"],
  ["συναναμίγνυσθαι", "misturar-se-com"],
  ["συνείδησις", "consciência"],
  ["συνεδρίου", "sinédrio"],
  ["συνειδήσει", "consciência"],
  ["συνελθεῖν", "reunir-se"],
  ["συνελθόντων", "tendo-se-reunido"],
  ["συνεργοί", "cooperadores"],
  ["συνετῶν", "entendidos"],
  ["συνηγμένοι", "tendo-sido-reunidos"],
  ["συντελείᾳ", "consumação"],
  ["σχεδὸν", "quase"],
  ["σωθήσῃ", "serás-salvo"],
  ["σωθῇ", "seja-salvo"],
  ["σωθῶσιν", "sejam-salvos"],
  ["σωφροσύνης", "sobriedade"],
  ["σώσεις", "salvarás"],
  ["σώσω", "salvarei"],
  ["σὴς", "tua"],
  ["σὸν", "teu"],
  ["σῆς", "tua"],
  ["σῖτον", "trigo"],
  ["σῦκα", "figos"],
  ["τάφον", "sepulcro"],
  ["τάχειον", "mais-rapidamente"],
  ["τέκνῳ", "filho"],
  ["τέρασιν", "prodígios"],
  ["τίνων", "de-quais"],
  ["ταπεινοφροσύνῃ", "humildade-de-mente"],
  ["ταπεινοῖς", "humildes"],
  ["ταπεινὸς", "humilde"],
  ["ταπεινῶν", "humildes"],
  ["ταῦτά", "estas-coisas"],
  ["τελειώσω", "aperfeiçoarei"],
  ["τελειῶσαι", "aperfeiçoar"],
  ["τελώνιον", "coletoria"],
  ["τετελείωται", "tem-sido-aperfeiçoado"],
  ["τετραάρχης", "tetrarca"],
  ["τετρααρχοῦντος", "sendo-tetrarca"],
  ["τηρεῖσθαι", "ser-guardado"],
  ["τιμᾷ", "honra"],
  ["τινός", "de-alguém"],
  ["τινὶ", "a-alguém"],
  ["τοιαύτη", "tal"],
  ["τοιούτοις", "tais"],
  ["τοσαῦτα", "tantas-coisas"],
  ["τοσοῦτον", "tanto"],
  ["τοὐναντίον", "pelo-contrário"],
  ["τρία", "três"],
  ["τρίβους", "caminhos"],
  ["τραπέζας", "mesas"],
  ["τρόμου", "tremor"],
  ["τυφλοῦ", "cego"],
  ["τύπτειν", "bater"],
  ["τύπτοντες", "batendo"],
  ["υἱοί", "filhos"],
  ["υἱοθεσίαν", "adoção-como-filhos"],
  ["φάτνῃ", "manjedoura"],
  ["φέγγος", "brilho"],
  ["φέρει", "carrega"],
  ["φίλων", "amigos"],
  ["φανερωθέντος", "tendo-sido-manifestado"],
  ["φανερόν", "manifesto"],
  ["φανερὰ", "manifesta"],
  ["φανερῶς", "manifestamente"],
  ["φευγέτωσαν", "fujam"],
  ["φεύγετε", "fugi"],
  ["φεῦγε", "foge"],
  ["φθαρτὸν", "corruptível"],
  ["φθορᾶς", "corrupção"],
  ["φιλεῖ", "ama"],
  ["φιλῶ", "amo"],
  ["φιλῶν", "amando"],
  ["φοβηθεὶς", "tendo-temido"],
  ["φονεύσεις", "assassinarás"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 9c (freq 3, parte 3/5) ===`);
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

console.log(`\n=== Resultado Lote 9c ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

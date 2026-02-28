#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11z
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 26/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11z-${Date.now()}.sql`);

const translations = [
  // === φιλ- / φιμ- / φλ- ===
  ["φιλῆσαι", "beijar"],
  ["φιμοῦν", "amordaçar"],
  ["φιμώσεις", "amordaçarás"],
  ["φλογίζουσα", "inflamando"],
  ["φλογιζομένη", "sendo-inflamada"],
  ["φλογός", "de-chama"],
  ["φλυαρῶν", "tagarelando"],
  ["φλύαροι", "tagarelas"],

  // === φοβ- ===
  ["φοβερὰ", "temível"],
  ["φοβεῖσθαι", "temer"],
  ["φοβηθέντες", "tendo-temido"],
  ["φοβηθήσομαι", "temerei"],
  ["φοβηθεῖσα", "tendo-temido"],
  ["φοβηθῇς", "temas"],
  ["φοβηθῶμεν", "temamos"],
  ["φοβουμένοις", "aos-que-temem"],
  ["φοβούμεθα", "tememos"],
  ["φοβούμεναι", "as-que-temem"],
  ["φοβοῦ", "teme"],
  ["φοβῆται", "tema"],
  ["φοβῇ", "temes"],

  // === φοιν- / φον- ===
  ["φοινίκων", "de-palmeiras"],
  ["φονέα", "homicida"],
  ["φονευσάντων", "dos-que-mataram"],
  ["φονεύεις", "matas"],
  ["φονεύετε", "matais"],
  ["φονεύς", "homicida"],
  ["φονεύσῃ", "mate"],
  ["φονεὺς", "homicida"],

  // === φορ- ===
  ["φορέσωμεν", "carreguemos-a-imagem"],
  ["φορεῖ", "carrega"],
  ["φοροῦντα", "carregando"],
  ["φοροῦντες", "carregando"],
  ["φορτίζετε", "carregais"],
  ["φορτίοις", "com-cargas"],
  ["φορτίου", "de-carga"],
  ["φορῶν", "carregando"],

  // === φρ- ===
  ["φρέαρ", "poço"],
  ["φρίσσουσιν", "estremecem"],
  ["φραγέλλιον", "flagelo"],
  ["φραγήσεται", "será-fechada"],
  ["φραγμοὺς", "cercas"],
  ["φραγμοῦ", "de-cerca"],
  ["φραγῇ", "seja-fechada"],
  ["φρεναπάται", "enganadores-de-mente"],
  ["φρεναπατᾷ", "engana-a-mente"],
  ["φρεσίν", "em-mentes"],
  ["φρεσὶν", "em-mentes"],
  ["φρονήσετε", "pensareis"],
  ["φρονίμως", "prudentemente"],
  ["φρονίμῳ", "ao-prudente"],
  ["φρονεῖ", "pensa"],
  ["φρονιμώτεροι", "mais-prudentes"],
  ["φρονοῦσιν", "pensam"],
  ["φροντίζωσιν", "cuidem"],
  ["φρονῆτε", "penseis"],
  ["φρονῶμεν", "pensemos"],
  ["φρονῶν", "pensando"],
  ["φρουρήσει", "guardará"],
  ["φρουρουμένους", "sendo-guardados"],
  ["φρυγάνων", "de-gravetos"],
  ["φρόνει", "pensa"],

  // === φυγ- / φυλ- ===
  ["φυγὴ", "fuga"],
  ["φυλάξατε", "guardai"],
  ["φυλάξῃ", "guarde"],
  ["φυλάξῃς", "guardes"],
  ["φυλάσσοντι", "ao-que-guarda"],
  ["φυλάσσου", "guarda-te"],
  ["φυλάσσουσιν", "guardam"],
  ["φυλακάς", "vigílias"],
  ["φυλακίζων", "aprisionando"],
  ["φυλακτήρια", "filactérios"],
  ["φυλακῆς", "de-prisão"],
  ["φυλασσόμενος", "guardando-se"],
  ["φυλαῖς", "às-tribos"],

  // === φυρ- / φυσ- / φυτ- ===
  ["φυράματος", "de-massa"],
  ["φυσικὰ", "naturais"],
  ["φυσικῶς", "naturalmente"],
  ["φυσιούμενος", "inchando-se"],
  ["φυσιοῖ", "incha"],
  ["φυσιοῦσθε", "estais-inchados"],
  ["φυσιοῦται", "incha-se"],
  ["φυσιώσεις", "inchações"],
  ["φυτεία", "plantação"],
  ["φυτεύει", "planta"],
  ["φυτεύθητι", "sê-plantada"],

  // === φων- ===
  ["φωνήσαντες", "tendo-chamado"],
  ["φωνήσει", "chamará"],
  ["φωνήσῃ", "chame"],
  ["φωναὶ", "vozes"],
  ["φωναῖς", "com-vozes"],
  ["φωνεῖτέ", "chamais"],
  ["φωνηθῆναι", "ser-chamado"],
  ["φωνοῦσιν", "chamam"],
  ["φωνὰς", "vozes"],
  ["φωνῆσαν", "chamou"],
  ["φωνῶν", "de-vozes"],

  // === φωσ- / φωτ- ===
  ["φωστῆρες", "luminares"],
  ["φωσφόρος", "portador-de-luz"],
  ["φωτίζει", "ilumina"],
  ["φωτίζῃ", "ilumine"],
  ["φωτίσαι", "iluminar"],
  ["φωτίσαντος", "do-que-iluminou"],
  ["φωτίσει", "iluminará"],
  ["φωτεινὴ", "luminosa"],
  ["φωτισθέντας", "os-tendo-sido-iluminados"],
  ["φωτισθέντες", "tendo-sido-iluminados"],

  // === φό- / φύ- / φώ- / φῶ- ===
  ["φόβητρά", "terrores"],
  ["φόβοι", "temores"],
  ["φόνῳ", "em-homicídio"],
  ["φύγητε", "fujais"],
  ["φύλακές", "guardas"],
  ["φύουσα", "produzindo"],
  ["φώνει", "chama"],
  ["φώνησον", "chama"],
  ["φώτων", "de-luzes"],
  ["φῶτα", "luzes"],

  // === χάρ- / χαίρ- / χαλ- ===
  ["χάρακά", "estacada"],
  ["χάρητε", "alegreis-vos"],
  ["χάρτου", "de-papel"],
  ["χάσμα", "abismo"],
  ["χαίρῃ", "alegra-se"],
  ["χαιρόντων", "dos-que-se-alegram"],
  ["χαλάσατε", "abaixai"],
  ["χαλάσω", "abaixarei"],
  ["χαλασάντων", "tendo-abaixado"],
  ["χαλεποί", "difíceis"],
  ["χαλεποὶ", "difíceis"],
  ["χαλιναγωγῆσαι", "refrear"],
  ["χαλιναγωγῶν", "refreando"],
  ["χαλινοὺς", "freios"],
  ["χαλκίων", "de-vasos-de-bronze"],
  ["χαλκεὺς", "ferreiro"],
  ["χαλκόν", "bronze"],
  ["χαλκὸς", "bronze"],
  ["χαλῶσι", "abaixam"],
  ["χαμαί", "ao-chão"],
  ["χαμαὶ", "ao-chão"],

  // === χαρα- / χαρι- ===
  ["χαράγματι", "com-marca"],
  ["χαράν", "alegria"],
  ["χαρήσομαι", "alegrar-me-ei"],
  ["χαρήσονται", "alegrar-se-ão"],
  ["χαρίζεσθαί", "perdoar"],
  ["χαρίζεσθε", "perdoai"],
  ["χαρίσασθέ", "perdoai"],
  ["χαρίσεται", "concederá"],
  ["χαρίσματι", "com-dom-de-graça"],
  ["χαρίσματος", "de-dom-de-graça"],
  ["χαρακτὴρ", "expressão-exata"],
  ["χαρισάμενος", "tendo-perdoado"],
  ["χαρισθέντα", "os-tendo-sido-concedidos-por-graça"],
  ["χαρισθήσομαι", "serei-concedido-por-graça"],
  ["χαρισθῆναι", "ser-concedido-por-graça"],
  ["χαρισμάτων", "de-dons-de-graça"],

  // === χειλ- / χειρ- / χειμ- ===
  ["χείλεσιν", "com-lábios"],
  ["χείρ", "mão"],
  ["χείρονος", "de-pior"],
  ["χειλέων", "de-lábios"],
  ["χειμάρρου", "de-torrente"],
  ["χειμαζομένων", "sendo-açoitados-pela-tempestade"],
  ["χειμών", "tempestade"],
  ["χειμὼν", "tempestade"],
  ["χειμῶνός", "de-inverno"],
  ["χειραγωγούμενος", "sendo-conduzido-pela-mão"],
  ["χειραγωγούς", "condutores-pela-mão"],
  ["χειραγωγοῦντες", "conduzindo-pela-mão"],
  ["χειροποίητα", "feitos-por-mãos"],
  ["χειροποίητον", "feito-por-mãos"],
  ["χειροτονήσαντες", "tendo-escolhido-por-mãos-estendidas"],
  ["χειροτονηθεὶς", "tendo-sido-escolhido-por-mãos-estendidas"],
  ["χειρόγραφον", "escrito-à-mão"],
  ["χειρὶ", "com-mão"],
  ["χειρῶν", "de-mãos"],
  ["χερσὶν", "com-mãos"],
  ["χεῖλος", "lábio"],
  ["χεῖρόν", "pior"],

  // === χιλ- / χιτ- / χλ- / χολ- / χορ- ===
  ["χιλιάδων", "de-milhares"],
  ["χιλιάσιν", "em-milhares"],
  ["χιτὼν", "túnica"],
  ["χιτῶνά", "túnica"],
  ["χλωρῷ", "verde"],
  ["χολὴν", "fel"],
  ["χολᾶτε", "irais-vos"],
  ["χολῆς", "de-fel"],
  ["χορηγήσει", "suprirá"],
  ["χορηγεῖ", "supre"],
  ["χορτάζεσθαι", "ser-saciado"],
  ["χορτάζεσθε", "sede-saciados"],
  ["χορτάσματα", "forragens"],
  ["χορτασθήσεσθε", "sereis-saciados"],
  ["χορτασθήσονται", "serão-saciados"],
  ["χορῶν", "de-danças"],

  // === χοϊ- / χοῖ- ===
  ["χοϊκοί", "terrenos"],
  ["χοϊκοῦ", "do-terreno"],
  ["χοῖροι", "porcos"],

  // === χρή- / χρί- / χρε- / χρη- ===
  ["χρή", "é-necessário"],
  ["χρήσιμον", "útil"],
  ["χρήσωμαι", "eu-use"],
  ["χρίσας", "tendo-ungido"],
  ["χρεοφειλέται", "devedores"],
  ["χρεοφειλετῶν", "de-devedores"],
  ["χρημάτων", "de-posses"],
  ["χρηματίζοντα", "advertindo-divinamente"],
  ["χρηματίσαι", "advertir-divinamente"],
  ["χρηματίσει", "advertirá-divinamente"],
  ["χρηματισθέντες", "tendo-sido-advertidos-divinamente"],
  ["χρηματισμός", "advertência-divina"],
  ["χρησάμενος", "tendo-usado"],
  ["χρηστεύεται", "é-benigno"],
  ["χρηστοί", "benignos"],
  ["χρηστολογίας", "de-belas-palavras"],
  ["χρηστότητος", "de-benignidade"],
  ["χρηστὰ", "boas"],
  ["χρηστὸν", "benigno"],

  // === χρον- ===
  ["χρονίζειν", "demorar"],
  ["χρονίζοντος", "demorando"],
  ["χρονίσει", "demorará"],
  ["χρονοτριβῆσαι", "gastar-tempo"],

  // === χρυσ- ===
  ["χρυσίων", "de-objetos-de-ouro"],
  ["χρυσοδακτύλιος", "com-anel-de-ouro"],
  ["χρυσόλιθος", "crisólito"],
  ["χρυσόν", "ouro"],
  ["χρυσόπρασος", "crisópraso"],

  // === χρωτ- / χρώ- / χρῄ- / χρῆ- / χρῶ- ===
  ["χρωτὸς", "de-pele"],
  ["χρώμεθα", "usamos"],
  ["χρώμενοι", "usando"],
  ["χρῄζει", "tem-necessidade"],
  ["χρῄζομεν", "temos-necessidade"],
  ["χρῄζῃ", "tenha-necessidade"],
  ["χρῆμα", "riqueza"],
  ["χρῆσαι", "usar"],
  ["χρῆσόν", "empresta"],
  ["χρῆται", "usa"],
  ["χρῶ", "usa"],

  // === χωλ- / χωρ- ===
  ["χωλόν", "manco"],
  ["χωλῶν", "de-mancos"],
  ["χωρήσειν", "conter"],
  ["χωρία", "campos"],
  ["χωρίζεται", "separa-se"],
  ["χωρίς", "separadamente"],
  ["χωρίσαι", "separar"],
  ["χωρίσει", "separará"],
  ["χωρίων", "de-campos"],
  ["χωρείτω", "dê-lugar"],
  ["χωριζέσθω", "separe-se"],
  ["χωρισθεὶς", "tendo-sido-separado"],
  ["χωρισθῆναι", "ser-separado"],
  ["χωρισθῇ", "seja-separado"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11z (freq 1, parte 26/44) ===`);
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

console.log(`\n=== Resultado Lote 11z ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

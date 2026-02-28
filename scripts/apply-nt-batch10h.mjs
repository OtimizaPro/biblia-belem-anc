#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10h
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 8/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10h-${Date.now()}.sql`);

const translations = [
  // === Índices 1736-1983 de freq2-words.json (248 palavras) ===

  // --- φυλ- palavras (guardar, vigiar) ---
  ["φυλάσσειν", "guardar"],
  ["φυλάσσεσθαι", "guardar-se"],
  ["φυλάσσεσθε", "guardai-vos"],
  ["φυλάσσοντες", "guardando"],
  ["φυλάσσων", "guardando"],
  ["φυλάσσῃ", "guarde"],
  ["φυλακὰς", "guardas"],
  ["φυλὰς", "tribos"],

  // --- φυσ/φυτ- palavras ---
  ["φυσικὴν", "natural"],
  ["φυτεύων", "plantando"],
  ["φυὲν", "tendo-crescido"],

  // --- φω- palavras (luz, toca) ---
  ["φωλεοὺς", "tocas"],
  ["φωτεινόν", "luminoso"],
  ["φωτεινὸν", "luminoso"],
  ["φωτισμὸν", "iluminação"],
  ["φωτὸς", "luz"],

  // --- φόν/φόρ/φύλ/φύσ- palavras ---
  ["φόνοι", "homicídios"],
  ["φόνου", "homicídio"],
  ["φόρους", "tributos"],
  ["φύλακας", "guardas"],
  ["φύλαξον", "guarda"],
  ["φύσεως", "natureza"],
  ["φύσις", "natureza"],

  // --- χ- palavras (graça, alegria) ---
  ["χάριτί", "graça"],
  ["χάριτα", "graça"],
  ["χήραις", "viúvas"],
  ["χαίρομεν", "alegramo-nos"],
  ["χαλάσαντες", "tendo-baixado"],
  ["χαλκὸν", "bronze"],
  ["χαρήσεται", "alegrará"],
  ["χαρίσασθαι", "conceder-graciosamente"],
  ["χαριζόμενοι", "concedendo-graciosamente"],
  ["χαρῆναι", "alegrar-se"],
  ["χαρῆτε", "alegreis-vos"],

  // --- χει- palavras (lábio, mão) ---
  ["χείλεσίν", "lábios"],
  ["χείλη", "lábios"],
  ["χείρων", "pior"],
  ["χειροποιήτοις", "feitos-por-mãos"],
  ["χειροποιήτου", "feito-por-mãos"],

  // --- χη/χι/χλ/χο/χρ- palavras ---
  ["χηρῶν", "viúvas"],
  ["χιλιάρχοις", "comandantes-de-mil"],
  ["χλαμύδα", "manto"],
  ["χορτάσαι", "saciar"],
  ["χορτασθῆναι", "ser-saciado"],
  ["χοϊκός", "terreno"],
  ["χρεία", "necessidade"],
  ["χρείαις", "necessidades"],
  ["χρηματισθεὶς", "tendo-sido-avisado-divinamente"],
  ["χρηστός", "benigno"],
  ["χρηστὸς", "benigno"],
  ["χρυσίου", "ouro"],
  ["χρυσὸν", "ouro"],
  ["χρυσὸς", "ouro"],
  ["χρόνοις", "tempos"],
  ["χρῄζετε", "necessitais"],
  ["χρῆσιν", "uso"],

  // --- χωλ/χωρ- palavras ---
  ["χωλούς", "coxos"],
  ["χωλοὺς", "coxos"],
  ["χωλὸν", "coxo"],
  ["χωλὸς", "coxo"],
  ["χωρίζεσθαι", "separar-se"],
  ["χωρίου", "campo"],
  ["χωρεῖ", "tem-espaço"],
  ["χωρεῖν", "ter-espaço"],
  ["χωριζέτω", "separe"],
  ["χώρα", "região"],

  // --- ψ- palavras (falso, alma) ---
  ["ψευδομαρτυρήσῃς", "testemunhes-falsamente"],
  ["ψευδόχριστοι", "falsos-ungidos"],
  ["ψεύδεσθε", "mentis"],
  ["ψεύστην", "mentiroso"],
  ["ψιχίων", "migalhas"],
  ["ψυχαὶ", "almas"],
  ["ψυχὰς", "almas"],
  ["ψυχῶν", "almas"],
  ["ψῦχος", "frio"],

  // --- ἀγ- palavras (conduzir, bom) ---
  ["ἀγάγετε", "conduzi"],
  ["ἀγάγῃ", "conduza"],
  ["ἀγαγεῖν", "conduzir"],
  ["ἀγαθέ", "bom"],
  ["ἀγαθοποιῶν", "fazendo-o-bem"],
  ["ἀγαθωσύνης", "bondade"],
  ["ἀγαθός", "bom"],
  ["ἀγαθῆς", "boa"],
  ["ἀγαθῇ", "boa"],
  ["ἀγαπητοῖς", "amados"],
  ["ἀγαπᾷς", "amas"],
  ["ἀγγελία", "mensagem"],
  ["ἀγνάφου", "não-pisoado"],

  // --- ἀγν- palavras (ignorar) ---
  ["ἀγνοεῖτε", "ignorais"],
  ["ἀγνοοῦντες", "ignorando"],
  ["ἀγνοοῦσιν", "ignoram"],
  ["ἀγνοῶν", "ignorando"],
  ["ἀγνωσίαν", "ignorância"],

  // --- ἀγο/ἀγρ- palavras ---
  ["ἀγοράζοντας", "comprando"],
  ["ἀγρούς", "campos"],
  ["ἀγρυπνίαις", "vigílias"],
  ["ἀγρυπνεῖτε", "vigiai"],
  ["ἀγρόν", "campo"],

  // --- ἀδ- palavras (injusto) ---
  ["ἀδίκους", "injustos"],
  ["ἀδημονεῖν", "angustiar-se"],
  ["ἀδικίαν", "injustiça"],
  ["ἀδικεῖτε", "praticais-injustiça"],
  ["ἀδικῶ", "pratico-injustiça"],
  ["ἀδικῶν", "praticando-injustiça"],
  ["ἀδυνατήσει", "será-impossível"],
  ["ἀδόκιμος", "reprovado"],

  // --- ἀθ/ἀκ- palavras ---
  ["ἀθέσμων", "iníquos"],
  ["ἀκάνθινον", "de-espinhos"],
  ["ἀκέραιοι", "puros"],
  ["ἀκαθάρτοις", "impuros"],
  ["ἀκαθάρτου", "impuro"],
  ["ἀκαθαρσία", "impureza"],
  ["ἀκαθαρσίαν", "impureza"],
  ["ἀκαταστασίας", "desordens"],
  ["ἀκηκόατε", "tendes-ouvido"],
  ["ἀκοή", "audição"],

  // --- ἀκολουθ- palavras (seguir) ---
  ["ἀκολουθήσατε", "segui"],
  ["ἀκολουθοῦντες", "seguindo"],
  ["ἀκολουθοῦσιν", "seguem"],
  ["ἀκολουθῆσαι", "seguir"],
  ["ἀκολουθῶν", "seguindo"],

  // --- ἀκού- palavras (ouvir) ---
  ["ἀκούοντάς", "ouvindo"],
  ["ἀκούοντα", "ouvindo"],
  ["ἀκούοντες", "ouvindo"],
  ["ἀκούσασα", "tendo-ouvido"],
  ["ἀκούσατέ", "ouvi"],
  ["ἀκούσετε", "ouvireis"],
  ["ἀκούσονται", "ouvirão"],
  ["ἀκοὴν", "audição"],
  ["ἀκοῦσαί", "ouvir"],

  // --- ἀκρο- palavras ---
  ["ἀκροαταὶ", "ouvintes"],
  ["ἀκροατὴς", "ouvinte"],
  ["ἀκροβυστίας", "incircuncisão"],

  // --- ἀλ- palavras (verdade, mudar) ---
  ["ἀλήθουσαι", "moendo"],
  ["ἀλεύρου", "farinha"],
  ["ἀληθές", "verdadeiro"],
  ["ἀληθινῆς", "verdadeira"],
  ["ἀληθινῷ", "verdadeiro"],
  ["ἀληθὲς", "verdadeiro"],
  ["ἀλλαγησόμεθα", "seremos-transformados"],
  ["ἀλλότριον", "alheio"],
  ["ἀλοῶντα", "debulhando"],
  ["ἀλώπεκες", "raposas"],

  // --- ἀμ- palavras ---
  ["ἀμέμπτως", "irrepreesivelmente"],
  ["ἀμελήσαντες", "tendo-negligenciado"],
  ["ἀμερίμνους", "livres-de-preocupação"],
  ["ἀμπέλου", "videira"],
  ["ἀμπελῶνι", "vinha"],

  // --- ἀνά/ἀνέ- palavras (subir, levantar) ---
  ["ἀνάγαιον", "aposento-superior"],
  ["ἀνάγεσθαι", "zarpar"],
  ["ἀνάγκαις", "necessidades"],
  ["ἀνάγκης", "necessidade"],
  ["ἀνάπεσε", "reclina-te"],
  ["ἀνέβη", "subiu"],
  ["ἀνέβλεψα", "recuperei-a-vista"],
  ["ἀνέζησεν", "reviveu"],
  ["ἀνέκραξεν", "clamou"],
  ["ἀνέμοις", "ventos"],
  ["ἀνέπεσαν", "reclinaram-se"],
  ["ἀνέστησαν", "levantaram"],
  ["ἀνέῳγεν", "tinha-aberto"],
  ["ἀνήχθη", "foi-levado-ao-mar"],
  ["ἀνίπτοις", "não-lavadas"],

  // --- ἀναβ/ἀναγ- palavras ---
  ["ἀναβάντα", "tendo-subido"],
  ["ἀναβαινόντων", "subindo"],
  ["ἀναβλέπουσιν", "recuperam-a-vista"],
  ["ἀναβλέψω", "recuperarei-a-vista"],
  ["ἀναγαγεῖν", "conduzir-para-cima"],
  ["ἀναγαγὼν", "tendo-conduzido-para-cima"],
  ["ἀναγγεῖλαι", "anunciar"],
  ["ἀναγινώσκεις", "lês"],
  ["ἀναγνωσθῇ", "seja-lida"],
  ["ἀναγνώσει", "leitura"],

  // --- ἀναδ/ἀναι/ἀνακ- palavras ---
  ["ἀναδεξάμενος", "tendo-recebido"],
  ["ἀναιρεθῆναι", "ser-morto"],
  ["ἀνακάμψαι", "retornar"],
  ["ἀνακειμένοις", "reclinados"],
  ["ἀνακειμένου", "reclinado"],
  ["ἀνακειμένους", "reclinados"],
  ["ἀνακλιθήσονται", "serão-reclinados"],
  ["ἀνακλιθῆναι", "ser-reclinado"],

  // --- ἀναπ/ἀναστ- palavras ---
  ["ἀναπέπαυται", "tem-descansado"],
  ["ἀναπήρους", "aleijados"],
  ["ἀναπαύεσθε", "descansai"],
  ["ἀναστρέφεσθαι", "conduzir-se"],
  ["ἀναστροφήν", "conduta"],
  ["ἀναστροφῇ", "conduta"],
  ["ἀναστῇ", "levante-se"],
  ["ἀναστῶσιν", "levantem-se"],

  // --- ἀνατ/ἀναφ/ἀναχ- palavras ---
  ["ἀνατείλαντος", "tendo-nascido"],
  ["ἀνατολῇ", "oriente"],
  ["ἀνατρέπουσιν", "transtornam"],
  ["ἀναφέρει", "oferece"],
  ["ἀναχθῆναι", "zarpar"],

  // --- ἀνδ/ἀνε- palavras ---
  ["ἀνδρί", "homem"],
  ["ἀνεγίνωσκεν", "lia"],
  ["ἀνεγκλήτους", "irrepreensíveis"],
  ["ἀνεθεμάτισαν", "amaldiçoaram-com-anátema"],
  ["ἀνεκάθισεν", "sentou-se"],
  ["ἀνενέγκας", "tendo-oferecido"],
  ["ἀνεπίλημπτον", "irrepreensível"],
  ["ἀνεχόμενοι", "suportando"],
  ["ἀνεῖλεν", "matou"],

  // --- ἀνη/ἀνθ- palavras ---
  ["ἀνηγγέλη", "foi-anunciado"],
  ["ἀνθέξεται", "apegar-se-á"],
  ["ἀνθέστηκεν", "tem-resistido"],
  ["ἀνθρακιὰν", "braseiro"],
  ["ἀνθρωπάρεσκοι", "agradadores-de-homens"],
  ["ἀνθρωπίνης", "humana"],
  ["ἀνθρωπίνῃ", "humana"],

  // --- ἀνο/ἀντ- palavras ---
  ["ἀνοικοδομήσω", "reedificarei"],
  ["ἀνομίᾳ", "iniquidade"],
  ["ἀντάλλαγμα", "resgate"],
  ["ἀντίδικος", "adversário"],
  ["ἀντίκειται", "opõe-se"],
  ["ἀντίστητε", "resisti"],
  ["ἀνταποδοθήσεται", "será-retribuído"],
  ["ἀνταποδοῦναι", "retribuir"],
  ["ἀνταποδώσω", "retribuirei"],
  ["ἀντειπεῖν", "contradizer"],
  ["ἀντιδίκου", "adversário"],
  ["ἀντιλέγοντας", "contradizendo"],
  ["ἀντιλογίας", "contradição"],
  ["ἀντιμισθίαν", "retribuição"],
  ["ἀντιπαρῆλθεν", "passou-pelo-lado-oposto"],

  // --- ἀνυ/ἀνό/ἀνώ/ἀνῆ- palavras ---
  ["ἀνυποκρίτου", "sem-hipocrisia"],
  ["ἀνυπόκριτος", "sem-hipocrisia"],
  ["ἀνόμων", "iníquos"],
  ["ἀνόμως", "sem-lei"],
  ["ἀνύδρων", "sem-água"],
  ["ἀνώτερον", "mais-acima"],
  ["ἀνῆκεν", "convinha"],
  ["ἀνῆλθον", "subi"],

  // --- ἀξ/ἀπ- palavras ---
  ["ἀξία", "digna"],
  ["ἀξίνη", "machado"],
  ["ἀπάγουσα", "conduzindo"],
  ["ἀπάτη", "engano"],
  ["ἀπάτης", "engano"],
  ["ἀπάτῃ", "engano"],
  ["ἀπέκοψεν", "cortou"],
  ["ἀπέκτεινεν", "matou"],
  ["ἀπέλθητε", "partais"],
  ["ἀπέλθω", "parta"],
  ["ἀπέλιπον", "deixei"],
  ["ἀπέπλευσαν", "navegaram"],
  ["ἀπέπνιξαν", "sufocaram"],
  ["ἀπέρχῃ", "partes"],
  ["ἀπέσταλκα", "tenho-enviado"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10h (freq 2, parte 8/12) ===`);
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

console.log(`\n=== Resultado Lote 10h ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

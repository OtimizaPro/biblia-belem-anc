#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10b
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 2/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10b-${Date.now()}.sql`);

const translations = [
  // === Índices 248-495 de freq2-words.json (248 palavras) ===

  // --- β- palavras (continuação) ---
  ["βούλεσθε", "quereis"],
  ["βούλεται", "quer"],
  ["βούληται", "queira"],
  ["βοῦν", "boi"],
  ["βοῶν", "clamando"],
  ["βοῶντες", "clamando"],
  ["βραβεῖον", "prêmio"],
  ["βραδὺς", "lento"],
  ["βροχὴ", "chuva"],
  ["βρώσεως", "alimento"],
  ["βυρσεῖ", "curtidor"],
  ["βόας", "bois"],
  ["βῆμα", "tribunal"],

  // --- γ- palavras ---
  ["γάλα", "leite"],
  ["γέγραφα", "tenho-escrito"],
  ["γέμει", "está-cheio"],
  ["γένωμαι", "me-torne"],
  ["γίνου", "torna-te"],
  ["γαμίζων", "dando-em-casamento"],
  ["γαμῶν", "casando"],
  ["γεγέννημαι", "tenho-sido-gerado"],
  ["γεγονότες", "tendo-se-tornado"],
  ["γεγραμμένοις", "tendo-sido-escritos"],
  ["γεγραμμένος", "tendo-sido-escrito"],
  ["γεγόναμεν", "tornamo-nos"],
  ["γεγόνασιν", "tornaram-se"],
  ["γεγόνατε", "tornastes-vos"],
  ["γενήσεσθε", "sereis"],
  ["γενεαῖς", "gerações"],
  ["γενεσίοις", "aniversário"],
  ["γενεῶν", "gerações"],
  ["γενηθέντες", "tendo-se-tornado"],
  ["γεννήματα", "crias"],
  ["γεννητοῖς", "nascidos"],
  ["γενομένων", "tendo-acontecido"],
  ["γευσάμενος", "tendo-provado"],
  ["γευσαμένους", "tendo-provado"],
  ["γεύσασθαι", "provar"],
  ["γεύσηται", "prove"],
  ["γινομένης", "acontecendo"],
  ["γινωσκέτω", "saiba"],
  ["γινόμενοι", "tornando-se"],
  ["γινώμεθα", "tornemo-nos"],
  ["γινώσκεται", "é-conhecido"],
  ["γινώσκων", "conhecendo"],
  ["γλυκὺ", "doce"],
  ["γλωσσόκομον", "bolsa"],
  ["γλωσσῶν", "línguas"],
  ["γλώσσης", "língua"],
  ["γνησίῳ", "genuíno"],
  ["γνωρίσει", "fará-conhecer"],
  ["γνωστὸς", "conhecido"],
  ["γνώμης", "parecer"],
  ["γνώσομαι", "conhecerei"],
  ["γογγυσμὸς", "murmuração"],
  ["γογγύζετε", "murmurais"],
  ["γονυπετῶν", "ajoelhando"],
  ["γράφομεν", "escrevemos"],
  ["γράψον", "escreve"],
  ["γραμματεύς", "escriba"],
  ["γραμματεῦσιν", "escribas"],
  ["γραφαὶ", "escrituras"],
  ["γραφῇ", "escritura"],
  ["γρηγορῆσαι", "vigiar"],
  ["γρηγορῶμεν", "vigiemos"],
  ["γυμνοὶ", "nus"],
  ["γυνή", "mulher"],
  ["γυναιξὶν", "mulheres"],
  ["γυναῖκά", "mulher"],
  ["γυναῖκές", "mulheres"],
  ["γωνίας", "esquina"],

  // --- δ- palavras ---
  ["δάκρυσιν", "lágrimas"],
  ["δάκτυλόν", "dedo"],
  ["δέησιν", "súplica"],
  ["δέησις", "súplica"],
  ["δένδρα", "árvores"],
  ["δέομαί", "suplico"],
  ["δέροντες", "espancando"],
  ["δέρων", "espancando"],
  ["δήσαντες", "tendo-amarrado"],
  ["δήσῃ", "amarre"],
  ["δίδασκε", "ensina"],
  ["δίδοτε", "dai"],
  ["δίδου", "dá"],
  ["δίδραχμα", "duas-dracmas"],
  ["δίκαια", "justas"],
  ["δίκην", "castigo"],
  ["δίωκε", "persegue"],
  ["δαιμονιζόμενον", "sendo-endemoninhado"],
  ["δαμάσαι", "domar"],
  ["δαρήσεται", "será-espancado"],
  ["δεήθητε", "suplicai"],
  ["δεήσεσιν", "súplicas"],
  ["δεήσεως", "súplica"],
  ["δείκνυσιν", "mostra"],
  ["δεδούλωται", "tem-sido-escravizado"],
  ["δεδώκει", "tinha-dado"],
  ["δεθῆναι", "ser-amarrado"],
  ["δειλοί", "covardes"],
  ["δεινῶς", "terrivelmente"],
  ["δειπνῆσαι", "cear"],
  ["δεκάτας", "dízimos"],
  ["δεκάτην", "décima"],
  ["δεκατεσσάρων", "quatorze"],
  ["δεξιόν", "direito"],
  ["δεξιὰ", "direita"],
  ["δερματίνην", "de-couro"],
  ["δεσμοφύλαξ", "carcereiro"],
  ["δεσμωτήριον", "prisão"],
  ["δεσμώτας", "prisioneiros"],
  ["δεσπόταις", "senhores"],
  ["δεσπότας", "senhores"],
  ["δευτέρου", "segundo"],
  ["δεόμενος", "suplicando"],
  ["δεύτερον", "segunda-vez"],

  // --- δι- palavras ---
  ["διά", "por-meio-de"],
  ["διάκονός", "servo"],
  ["διέρχεσθαι", "atravessar"],
  ["διέρχεται", "atravessa"],
  ["διέταξεν", "ordenou"],
  ["διέτριβεν", "permanecia"],
  ["διήνοιξεν", "abriu"],
  ["διήρχοντο", "atravessavam"],
  ["διαβλέψεις", "verás-claramente"],
  ["διαβόλους", "caluniadores"],
  ["διαγενομένου", "tendo-passado"],
  ["διαθήκῃ", "aliança"],
  ["διαθήσομαι", "estabelecerei"],
  ["διαθῆκαι", "alianças"],
  ["διαιρέσεις", "distribuições"],
  ["διακονήσαντες", "tendo-servido"],
  ["διακονεῖν", "servir"],
  ["διακονηθῆναι", "ser-servido"],
  ["διακονουμένῃ", "sendo-servida"],
  ["διακονοῦντες", "servindo"],
  ["διακονῆσαι", "servir"],
  ["διακοσίους", "duzentos"],
  ["διακοσίων", "duzentos"],
  ["διακρίσεις", "discernimentos"],
  ["διαλεγομένου", "discutindo"],
  ["διαλεγόμενος", "discutindo"],
  ["διαμαρτύρασθαι", "testificar-solenemente"],
  ["διανοίας", "entendimento"],
  ["διαπεράσαντες", "tendo-atravessado"],
  ["διαρπάσει", "saqueará"],
  ["διασκορπισθήσονται", "serão-dispersos"],
  ["διασπαρέντες", "tendo-sido-dispersos"],
  ["διαταχθέντα", "tendo-sido-ordenados"],
  ["διατεταγμένον", "tendo-sido-designado"],
  ["διαφέροντα", "importando"],
  ["διδάξει", "ensinará"],
  ["διδάξῃ", "ensine"],
  ["διδακτικόν", "apto-para-ensinar"],
  ["διδακτοῖς", "ensinados"],
  ["διδαχὴ", "ensino"],
  ["διδαχὴν", "ensino"],
  ["διδόντα", "dando"],
  ["διδόντες", "dando"],
  ["διδόντος", "dando"],
  ["διεγερθεὶς", "tendo-sido-despertado"],
  ["διεγόγγυζον", "murmuravam"],
  ["διελέξατο", "discutiu"],
  ["διελογίζετο", "deliberava"],
  ["διεμαρτύρατο", "testificou-solenemente"],
  ["διεπρίοντο", "ficavam-enfurecidos"],
  ["διερμηνεύῃ", "interprete"],
  ["διεσκόρπισεν", "dispersou"],
  ["διεστέλλετο", "ordenava"],
  ["διεστραμμένη", "tendo-sido-pervertida"],
  ["διεσώθησαν", "foram-salvos"],
  ["διηγήσαντο", "narraram"],
  ["διηγήσατο", "narrou"],
  ["διηπόρει", "ficava-perplexo"],

  // --- δικ- palavras ---
  ["δικαίαν", "justa"],
  ["δικαίως", "justamente"],
  ["δικαίωσιν", "justificação"],
  ["δικαίῳ", "justo"],
  ["δικαιοῦντα", "justificando"],
  ["δικαιωθέντες", "tendo-sido-justificados"],
  ["δικαιωθήσεται", "será-justificado"],
  ["δικαιωθῆναι", "ser-justificado"],
  ["δικαιωθῶμεν", "sejamos-justificados"],
  ["διορυχθῆναι", "ser-arrombada"],
  ["διορύσσουσιν", "arrombam"],
  ["διχοτομήσει", "cortará-em-dois"],
  ["διψᾷ", "tem-sede"],
  ["διψῶντα", "tendo-sede"],
  ["διωγμοῦ", "perseguição"],
  ["διωγμὸς", "perseguição"],
  ["διωκόμενοι", "sendo-perseguidos"],
  ["διϊσχυρίζετο", "afirmava-com-insistência"],
  ["διώκετε", "persegui"],
  ["διώκω", "persigo"],
  ["διῆλθεν", "atravessou"],

  // --- δο- palavras ---
  ["δοκίμιον", "prova"],
  ["δοκιμαζέτω", "examine"],
  ["δοκοῦσιν", "parecem"],
  ["δοκῶ", "penso"],
  ["δοξάζηται", "seja-glorificado"],
  ["δοξάζοντες", "glorificando"],
  ["δοξάσω", "glorificarei"],
  ["δοξάσωσιν", "glorifiquem"],
  ["δουλεύετε", "servis"],
  ["δουλεύω", "sirvo"],
  ["δουλεύων", "servindo"],
  ["δοχὴν", "banquete"],
  ["δοῦλα", "escrava"],
  ["δραχμὴν", "dracma"],
  ["δυνάμεσιν", "poderes"],
  ["δυνήσεσθε", "podereis"],
  ["δυνατά", "poderosas"],
  ["δυσὶ", "dois"],
  ["δωμάτων", "terraços"],
  ["δωρεὰ", "dom"],
  ["δόγμασιν", "decretos"],
  ["δόκιμοι", "aprovados"],
  ["δόκιμον", "aprovado"],
  ["δόλον", "engano"],
  ["δόλου", "engano"],
  ["δόντα", "tendo-dado"],
  ["δόντος", "tendo-dado"],
  ["δόξαντες", "tendo-parecido"],
  ["δύναιντο", "pudessem"],
  ["δύνανται", "podem"],
  ["δύναταί", "pode"],
  ["δώρημα", "dádiva"],
  ["δώσεις", "darás"],
  ["δώσουσιν", "darão"],
  ["δώσω", "darei"],
  ["δώῃ", "dê"],
  ["δῆλον", "evidente"],
  ["δῆμον", "povo"],
  ["δῆσαι", "amarrar"],
  ["δῶμα", "terraço"],

  // --- ει- palavras ---
  ["εἰδωλολάτραι", "idólatras"],
  ["εἰδωλολάτρης", "idólatra"],
  ["εἰδωλολατρεία", "idolatria"],
  ["εἰδωλόθυτον", "sacrificado-a-ídolo"],
  ["εἰλικρινίας", "sinceridade"],
  ["εἰπέ", "dize"],
  ["εἰρήνη", "paz"],
  ["εἰσάγεσθαι", "ser-introduzido"],
  ["εἰσήλθομεν", "entramos"],
  ["εἰσελθοῦσαι", "tendo-entrado"],
  ["εἰσελθόντος", "tendo-entrado"],
  ["εἰσελθόντων", "tendo-entrado"],
  ["εἰσενέγκῃς", "conduzas-para-dentro"],
  ["εἰσερχομένους", "entrando"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10b (freq 2, parte 2/12) ===`);
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

console.log(`\n=== Resultado Lote 10b ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

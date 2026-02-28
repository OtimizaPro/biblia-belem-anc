#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11g
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 7/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11g-${Date.now()}.sql`);

const translations = [
  // === Índices 1488-1735 de freq1-words.json (248 palavras) ===

  // --- διαφ- palavras ---
  ["διαφθείρει", "corrompe"],
  ["διαφθείρεται", "é-corrompido"],
  ["διαφορωτέρας", "mais-excelente"],
  ["διαφορώτερον", "mais-excelente"],
  ["διαφυλάξαι", "guardar"],
  ["διαφόροις", "diversas"],
  ["διαφύγῃ", "escape"],
  ["διαχειρίσασθαι", "matar"],
  ["διαχλευάζοντες", "zombando"],
  ["διαχωρίζεσθαι", "separar-se"],

  // --- διδ- palavras ---
  ["διδάξωσιν", "ensinem"],
  ["διδάσκοντι", "ensinando"],
  ["διδάσκοντος", "ensinando"],
  ["διδάσκω", "ensino"],
  ["διδάσκῃ", "ensine"],
  ["διδακτοὶ", "ensinados"],
  ["διδασκάλων", "mestres"],
  ["διδασκαλία", "ensino"],
  ["διδασκαλίαις", "ensinos"],
  ["διδαχή", "ensino"],
  ["διδαχαῖς", "ensinos"],
  ["διδόμενον", "sendo-dado"],

  // --- διε- palavras ---
  ["διεβλήθη", "foi-acusado"],
  ["διεγείρειν", "despertar"],
  ["διεγείρετο", "despertava-se"],
  ["διεγείρω", "desperto"],
  ["διεδίδετο", "era-distribuído"],
  ["διεζωσμένος", "tendo-se-cingido"],
  ["διεζώσατο", "cingiu-se"],
  ["διεκρίθη", "duvidou"],
  ["διεκρίθητε", "duvidastes"],
  ["διεκρίνομεν", "discerníamos"],
  ["διεκρίνοντο", "disputavam"],
  ["διεκώλυεν", "impedia"],
  ["διελάλουν", "conversavam"],
  ["διελέχθησαν", "discutiram"],
  ["διελαλεῖτο", "era-comentado"],
  ["διελεύσεται", "atravessará"],
  ["διεληλυθότα", "tendo-atravessado"],
  ["διελθόντα", "tendo-atravessado"],
  ["διελογίζεσθε", "discutíeis"],
  ["διελύθησαν", "foram-dispersos"],
  ["διεμάχοντο", "contendiam"],
  ["διεμέριζον", "repartiam"],
  ["διεμαρτυράμεθα", "testificamos-solenemente"],
  ["διεμαρτύρω", "testificaste-solenemente"],
  ["διεμερίσαντο", "repartiram"],
  ["διεμερίσθη", "foi-repartida"],
  ["διενέγκῃ", "carregue-através"],
  ["διενθυμουμένου", "ponderando"],
  ["διεξόδους", "saídas"],
  ["διεπέρασεν", "atravessou"],
  ["διεπορεύετο", "atravessava"],
  ["διεπορεύοντο", "atravessavam"],
  ["διεπραγματεύσατο", "negociou"],
  ["διερήσσετο", "rompia-se"],
  ["διερμήνευσεν", "interpretou"],
  ["διερμηνευέτω", "interprete"],
  ["διερμηνευομένη", "sendo-interpretada"],
  ["διερμηνευτής", "intérprete"],
  ["διερμηνεύουσιν", "interpretam"],
  ["διερχόμενον", "atravessando"],
  ["διερωτήσαντες", "tendo-indagado"],
  ["διεσάφησαν", "explicaram"],
  ["διεσκορπίσθησαν", "foram-dispersos"],
  ["διεσκορπισμένα", "tendo-sido-dispersos"],
  ["διεσκόρπισα", "dispersei"],
  ["διεσκόρπισας", "dispersaste"],
  ["διεσπάρησαν", "foram-espalhados"],
  ["διεσπάσθαι", "ter-sido-despedaçado"],
  ["διεστειλάμεθα", "ordenamos"],
  ["διεστραμμένα", "tendo-sido-pervertidas"],
  ["διεστραμμένης", "tendo-sido-pervertida"],
  ["διετάξατο", "ordenou"],
  ["διετήρει", "guardava"],
  ["διετίαν", "dois-anos"],
  ["διεταξάμην", "ordenei"],
  ["διεταράχθη", "perturbou-se"],
  ["διετοῦς", "de-dois-anos"],
  ["διετρίψαμεν", "permanecemos"],
  ["διεφέρετο", "era-divulgado"],
  ["διεφήμισαν", "divulgaram"],
  ["διεφημίσθη", "foi-divulgado"],
  ["διεφθαρμένων", "tendo-sido-corrompidos"],
  ["διεχειρίσασθε", "matastes"],
  ["διεῖλεν", "dividiu"],

  // --- διη- palavras ---
  ["διηγήσεται", "narrará"],
  ["διηγήσωνται", "narrem"],
  ["διηγούμενον", "narrando"],
  ["διηγοῦ", "narra"],
  ["διηκονήσαμέν", "servimos"],
  ["διηκόνησεν", "serviu"],
  ["διηνεκές", "perpétuo"],
  ["διηνοίχθησαν", "foram-abertos"],
  ["διηνοιγμένους", "tendo-sido-abertos"],
  ["διηποροῦντο", "ficavam-perplexos"],
  ["διηπόρουν", "ficavam-perplexos"],

  // --- διθ- / δικ- palavras ---
  ["διθάλασσον", "entre-dois-mares"],
  ["δικαίας", "justa"],
  ["δικαίοις", "justos"],
  ["δικαιοκρισίας", "justo-julgamento"],
  ["δικαιοσύνη", "justiça"],
  ["δικαιούμενοι", "sendo-justificados"],
  ["δικαιοῖ", "justifica"],
  ["δικαιοῦντες", "justificando"],
  ["δικαιοῦσθαι", "ser-justificado"],
  ["δικαιοῦσθε", "sois-justificados"],
  ["δικαιωθήσονται", "serão-justificados"],
  ["δικαιωθήσῃ", "sejas-justificado"],
  ["δικαιωθῇς", "sejas-justificado"],
  ["δικαιώμασιν", "ordenanças"],
  ["δικαιώματος", "ordenança"],
  ["δικαιώσει", "justificação"],
  ["δικαιῶν", "justificando"],
  ["δικαιῶσαι", "justificar"],
  ["δικαστήν", "juiz"],
  ["δικαστὴν", "juiz"],

  // --- διλ- / διο- / διπ- / δισ- / διχ- palavras ---
  ["διλόγους", "de-dupla-palavra"],
  ["διοπετοῦς", "caído-do-céu"],
  ["διορθωμάτων", "reformas"],
  ["διορθώσεως", "correção"],
  ["διπλότερον", "em-dobro"],
  ["διπλῆς", "dupla"],
  ["δισχίλιοι", "dois-mil"],
  ["διχάσαι", "dividir"],
  ["διχοστασίαι", "divisões"],
  ["διχοστασίας", "divisões"],

  // --- διψ- / διω- palavras ---
  ["διψῶ", "tenho-sede"],
  ["διψῶμεν", "tenhamos-sede"],
  ["διψῶντες", "tendo-sede"],
  ["διωγμοὺς", "perseguições"],
  ["διωγμὸν", "perseguição"],
  ["διωγμῶν", "perseguições"],
  ["διωκόντων", "perseguindo"],
  ["διωξάτω", "persiga"],
  ["διωχθήσονται", "serão-perseguidos"],

  // --- διϊ- / διϋ- / διό- / διώ- palavras ---
  ["διϊκνούμενος", "penetrando"],
  ["διϋλίζοντες", "coando"],
  ["διό", "pelo-que"],
  ["διόπερ", "pelo-que-também"],
  ["διώδευεν", "percorria"],
  ["διώκομαι", "sou-perseguido"],
  ["διώκομεν", "perseguimos"],
  ["διώκοντα", "perseguindo"],
  ["διώκοντας", "perseguindo"],
  ["διώκοντες", "perseguindo"],
  ["διώκτην", "perseguidor"],
  ["διώκωνται", "sejam-perseguidos"],
  ["διώκωσιν", "persigam"],
  ["διώξετε", "perseguireis"],
  ["διώξητε", "persigais"],
  ["διώξωσιν", "persigam"],

  // --- δογ- / δοθ- palavras ---
  ["δογμάτων", "decretos"],
  ["δογματίζεσθε", "sujeitais-vos-a-ordenanças"],
  ["δοθέντος", "tendo-sido-dado"],
  ["δοθείσῃ", "tendo-sido-dada"],
  ["δοθεῖσα", "tendo-sido-dada"],
  ["δοθῆναι", "ser-dado"],

  // --- δοκ- palavras ---
  ["δοκεῖν", "parecer"],
  ["δοκεῖς", "pareces"],
  ["δοκιμάζει", "examina"],
  ["δοκιμάζεις", "examinas"],
  ["δοκιμάζοντες", "examinando"],
  ["δοκιμάζοντι", "examinando"],
  ["δοκιμάζων", "examinando"],
  ["δοκιμάσαι", "examinar"],
  ["δοκιμάσει", "examinará"],
  ["δοκιμάσητε", "examineis"],
  ["δοκιμήν", "prova"],
  ["δοκιμαζέσθωσαν", "sejam-examinados"],
  ["δοκιμαζομένου", "sendo-examinado"],
  ["δοκιμασίᾳ", "provação"],
  ["δοκιμὴ", "prova"],
  ["δοκιμῆς", "prova"],
  ["δοκιμῇ", "prova"],
  ["δοκούντων", "parecendo"],
  ["δοκοῦμεν", "parecemos"],
  ["δοκοῦν", "parecendo"],
  ["δοκοῦντα", "parecendo"],
  ["δοκοῦσα", "parecendo"],
  ["δοκόν", "trave"],
  ["δοκὸς", "trave"],
  ["δοκῇ", "pareça"],
  ["δοκῶν", "parecendo"],

  // --- δολ- / δοξ- palavras ---
  ["δολοῦντες", "adulterando"],
  ["δοξάζειν", "glorificar"],
  ["δοξάζεται", "é-glorificado"],
  ["δοξάζητε", "glorifiqueis"],
  ["δοξάζω", "glorifico"],
  ["δοξάσαι", "glorificar"],
  ["δοξάσατε", "glorificai"],
  ["δοξάσῃ", "glorifique"],
  ["δοξαζέτω", "glorifique"],
  ["δοξαζόμενος", "sendo-glorificado"],
  ["δοξασθῶσιν", "sejam-glorificados"],

  // --- δουλ- palavras ---
  ["δουλαγωγῶ", "escravizo"],
  ["δουλείαν", "escravidão"],
  ["δουλευέτωσαν", "sirvam"],
  ["δουλεύει", "serve"],
  ["δουλεύουσιν", "servem"],
  ["δουλεύσει", "servirá"],
  ["δουλεύσουσιν", "servirão"],
  ["δουλεῦσαι", "servir"],
  ["δουλωθέντες", "tendo-sido-escravizados"],
  ["δουλώσουσιν", "escravizarão"],

  // --- δού- / δοῖ- / δοῦ- palavras ---
  ["δούλας", "escravas"],
  ["δούλη", "escrava"],
  ["δούλης", "escrava"],
  ["δούλοις", "escravos"],
  ["δούλων", "escravos"],
  ["δούς", "tendo-dado"],
  ["δοῖ", "dê"],
  ["δοῦλοί", "escravos"],
  ["δοῦλόν", "escravo"],
  ["δοῦναί", "dar"],

  // --- δρ- palavras ---
  ["δρασσόμενος", "apanhando"],
  ["δραχμὰς", "dracmas"],

  // --- δυν- palavras ---
  ["δυνάμεθά", "podemos"],
  ["δυνάμενά", "podendo"],
  ["δυνάμενα", "podendo"],
  ["δυνάμεναι", "podendo"],
  ["δυνάμεσι", "poderes"],
  ["δυνάστας", "poderosos"],
  ["δυνάστης", "poderoso"],
  ["δυνήσεταί", "poderá"],
  ["δυνήσονται", "poderão"],
  ["δυνήσῃ", "possas"],
  ["δυναίμην", "pudesse"],
  ["δυναμένη", "podendo"],
  ["δυναμένους", "podendo"],
  ["δυναμένων", "podendo"],
  ["δυναμούμενοι", "sendo-fortalecidos"],
  ["δυνατοί", "poderosos"],
  ["δυνηθῆτε", "possais"],
  ["δυνησόμεθα", "poderemos"],

  // --- δυσ- palavras ---
  ["δυσί", "dois"],
  ["δυσίν", "dois"],
  ["δυσβάστακτα", "difíceis-de-carregar"],
  ["δυσεντερίῳ", "disenteria"],
  ["δυσερμήνευτος", "difícil-de-explicar"],
  ["δυσνόητά", "difíceis-de-entender"],
  ["δυσφημίας", "difamação"],
  ["δυσφημούμενοι", "sendo-difamados"],

  // --- δω- palavras ---
  ["δωδέκατος", "décimo-segundo"],
  ["δωδεκάφυλον", "doze-tribos"],
  ["δωρεάν", "gratuitamente"],
  ["δωρεᾷ", "dom"],
  ["δόγμα", "decreto"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11g (freq 1, parte 7/44) ===`);
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

console.log(`\n=== Resultado Lote 11g ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

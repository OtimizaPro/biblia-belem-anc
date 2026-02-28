#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10g
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 7/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10g-${Date.now()}.sql`);

const translations = [
  // === Índices 1488-1735 de freq2-words.json (248 palavras) ===

  // --- σπ- palavras ---
  ["σπαρῇ", "seja-semeado"],
  ["σπασάμενος", "tendo-desembainhado"],
  ["σπείρουσιν", "semeiam"],
  ["σπειρόμενοι", "sendo-semeados"],
  ["σπεύσας", "tendo-se-apressado"],
  ["σπεῖραι", "semear"],
  ["σπλάγχνοις", "entranhas"],
  ["σποδῷ", "cinza"],
  ["σπουδάσατε", "apressai-vos"],
  ["σπούδασον", "apressa-te"],
  ["σπόρος", "semente"],

  // --- στ- palavras ---
  ["στήκει", "está-firme"],
  ["στήσαντες", "tendo-colocado-de-pé"],
  ["σταθέντες", "tendo-sido-colocados-de-pé"],
  ["σταυροῦσιν", "crucificam"],
  ["σταυρῶσαι", "crucificar"],
  ["σταύρωσον", "crucifica"],
  ["στενοχωρία", "angústia"],
  ["στενοχωρίαις", "angústias"],
  ["στενοχωρεῖσθε", "estais-angustiados"],
  ["στενῆς", "estreita"],
  ["στεῖρα", "estéril"],
  ["στηρίξει", "firmará"],
  ["στολαῖς", "vestes-longas"],
  ["στολὴν", "veste-longa"],
  ["στρατιώτῃ", "soldado"],
  ["στρουθία", "pardais"],
  ["στρουθίων", "pardais"],
  ["στόματί", "boca"],
  ["στὰς", "tendo-ficado-de-pé"],
  ["στῆτε", "ficai-de-pé"],

  // --- συγ- palavras ---
  ["συγγενείας", "parentela"],
  ["συγγενεῦσιν", "parentes"],
  ["συγγενῶν", "parentes"],

  // --- συλ- palavras ---
  ["συλλέγουσιν", "colhem"],

  // --- συμ- palavras ---
  ["συμπόσια", "grupos-de-banquete"],

  // --- συν- palavras ---
  ["συνάγονται", "reúnem-se"],
  ["συνάγουσιν", "reúnem"],
  ["συνάξω", "reunirei"],
  ["συνέβαλλον", "conferiam"],
  ["συνέδρια", "sinédrios"],
  ["συνέζευξεν", "juntou"],
  ["συνέθεντο", "combinaram"],
  ["συνέκλεισεν", "encerrou-junto"],
  ["συνέλαβον", "prenderam"],
  ["συνέρχησθε", "vos-reunis"],
  ["συνέρχονται", "reúnem-se"],
  ["συνέσει", "entendimento"],
  ["συνέσεως", "entendimento"],
  ["συνέταξεν", "ordenou"],
  ["συνέχομαι", "sou-constrangido"],
  ["συνήντησεν", "encontrou"],
  ["συναγαγόντες", "tendo-reunido"],
  ["συναγαγὼν", "tendo-reunido"],
  ["συναγωγήν", "sinagoga"],
  ["συναιχμάλωτός", "co-prisioneiro"],
  ["συνανέκειντο", "reclinavam-se-à-mesa-junto"],
  ["συνανακειμένων", "reclinando-se-à-mesa-junto"],
  ["συναντήσας", "tendo-encontrado"],
  ["συναποθανεῖν", "morrer-junto"],
  ["συναχθήσονται", "serão-reunidos"],
  ["συναχθῆναι", "ser-reunidos"],
  ["συνβιβαζόμενον", "sendo-unido-junto"],
  ["συνεβουλεύσαντο", "aconselharam-se-junto"],
  ["συνεζωοποίησεν", "vivificou-junto"],
  ["συνεισῆλθεν", "entrou-junto"],
  ["συνελάλουν", "falavam-entre-si"],
  ["συνεπέμψαμεν", "enviamos-junto"],
  ["συνεργοὶ", "cooperadores"],
  ["συνεργός", "cooperador"],
  ["συνεργὸν", "cooperador"],
  ["συνεσπάραξεν", "convulsionou"],
  ["συνετήρει", "guardava-junto"],
  ["συνευδοκεῖ", "consente-junto"],
  ["συνευδοκῶν", "consentindo-junto"],
  ["συνευωχούμενοι", "banqueteando-junto"],
  ["συνζητοῦντες", "disputando-junto"],
  ["συνηγάγετέ", "reunistes"],
  ["συνηγέρθητε", "fostes-ressuscitados-junto"],
  ["συνηγμένων", "tendo-sido-reunidos"],
  ["συνθλασθήσεται", "será-esmagado"],
  ["συνιέναι", "compreender"],
  ["συνιστάνοντες", "recomendando"],
  ["συνιῶσιν", "compreendam"],
  ["συνκακοπάθησον", "sofre-junto"],
  ["συνκαλεσάμενος", "tendo-convocado-junto"],
  ["συνκαλεῖ", "convoca-junto"],
  ["συνκοινωνὸς", "co-participante"],
  ["συνκρίνοντες", "comparando"],
  ["συνλαλοῦντες", "falando-junto"],
  ["συνμαρτυρούσης", "co-testemunhando"],
  ["συντελείας", "consumação"],
  ["συντελεῖσθαι", "consumar-se"],
  ["συντόμως", "brevemente"],
  ["συνχαίρει", "alegra-se-junto"],
  ["συνῆλθεν", "reuniu-se"],
  ["συνῆλθον", "reuniram-se"],
  ["συνῆτε", "compreendais"],
  ["συνῶσιν", "compreendam"],

  // --- σφ- palavras ---
  ["σφαγῆς", "matança"],
  ["σφραγισάμενος", "tendo-selado"],
  ["σφόδρα", "grandemente"],

  // --- σχ- palavras ---
  ["σχίσματα", "divisões"],
  ["σχῶμεν", "tenhamos"],

  // --- σω- palavras ---
  ["σωθήσομαι", "serei-salvo"],
  ["σωθησόμεθα", "seremos-salvos"],
  ["σωτήριον", "salvação"],
  ["σωφρονεῖν", "ser-sóbrio-de-mente"],
  ["σωφρονοῦντα", "sendo-sóbrio-de-mente"],

  // --- σύ- palavras ---
  ["σύμφορον", "proveitoso"],
  ["σύνδουλος", "co-servo"],
  ["σύνεσιν", "entendimento"],

  // --- σώ- palavras ---
  ["σώματί", "corpo"],
  ["σώφρονα", "sóbrio-de-mente"],
  ["σώφρονας", "sóbrios-de-mente"],

  // --- σ- outras ---
  ["σὰ", "tuas"],
  ["σῴζειν", "salvar"],
  ["σῶσόν", "salva"],

  // --- τά- palavras ---
  ["τάλαντά", "talentos"],
  ["τάλαντον", "talento"],
  ["τάραχος", "tumulto"],
  ["τάχα", "talvez"],
  ["τάχει", "rapidez"],
  ["τάχιον", "mais-rapidamente"],

  // --- τέ- palavras ---
  ["τέθνηκεν", "tem-morrido"],
  ["τέκνον", "filho"],
  ["τέκνου", "filho"],
  ["τέλειος", "perfeito"],
  ["τέλη", "fins"],
  ["τέξεται", "gerará"],

  // --- τί- palavras ---
  ["τίκτουσα", "dando-à-luz"],
  ["τίμα", "honra"],
  ["τίνας", "quais"],
  ["τίσιν", "quais"],
  ["τίτλον", "inscrição"],

  // --- τα- palavras ---
  ["ταμείοις", "aposentos-interiores"],
  ["ταπεινοφροσύνην", "humildade-de-mente"],
  ["ταπεινοφροσύνης", "humildade-de-mente"],
  ["ταράσσοντες", "perturbando"],
  ["ταρασσέσθω", "seja-perturbado"],
  ["ταύρων", "touros"],
  ["ταύταις", "estas"],

  // --- τε- palavras ---
  ["τείχους", "muro"],
  ["τεθεμελιωμένοι", "tendo-sido-fundamentados"],
  ["τεθνηκὼς", "tendo-morrido"],
  ["τεθῇ", "seja-posto"],
  ["τεκεῖν", "dar-à-luz"],
  ["τελέσητε", "completeis"],
  ["τελείωσις", "perfeição"],
  ["τελευτάτω", "morra"],
  ["τελεῖτε", "completais"],
  ["τετήρηκα", "tenho-guardado"],
  ["τετήρηται", "tem-sido-guardado"],
  ["τετράποδα", "quadrúpedes"],
  ["τετρακισχίλιοι", "quatro-mil"],
  ["τετρακισχιλίους", "quatro-mil"],
  ["τετρακόσια", "quatrocentos"],

  // --- τη- palavras ---
  ["τηρήσει", "guardará"],
  ["τηρήσητε", "guardeis"],
  ["τηρῶμεν", "guardemos"],

  // --- τι- palavras ---
  ["τιθέναι", "pôr"],
  ["τιμήσει", "honrará"],
  ["τιμὰς", "honras"],
  ["τιμῶσι", "honrem"],
  ["τινάς", "alguns"],
  ["τινές", "alguns"],
  ["τινὸς", "algum"],
  ["τινῶν", "alguns"],
  ["τισὶν", "alguns"],

  // --- το- palavras ---
  ["τοίνυν", "portanto"],
  ["τοιαύταις", "tais"],
  ["τοιούτῳ", "tal"],
  ["τολμᾷ", "ousa"],
  ["τοσαύτην", "tão-grande"],
  ["τοσούτου", "tão-grande"],
  ["τοσούτῳ", "tão-grande"],

  // --- τρ- palavras ---
  ["τράπεζα", "mesa"],
  ["τράπεζαν", "mesa"],
  ["τρέμουσα", "tremendo"],
  ["τρέφει", "alimenta"],
  ["τρέχω", "corro"],
  ["τρήματος", "orifício"],
  ["τρίτης", "terceira"],
  ["τρίτος", "terceiro"],
  ["τρίχες", "cabelos"],
  ["τριακοσίων", "trezentos"],
  ["τριχῶν", "cabelos"],
  ["τριῶν", "três"],
  ["τροφὴν", "alimento"],
  ["τρόπῳ", "modo"],

  // --- τυ- palavras ---
  ["τυφλούς", "cegos"],
  ["τυφλοὺς", "cegos"],
  ["τυφλοῖς", "cegos"],
  ["τυφλός", "cego"],
  ["τυφλὸς", "cego"],
  ["τυχεῖν", "obter"],

  // --- τό- palavras ---
  ["τόκῳ", "juro"],
  ["τόποις", "lugares"],
  ["τόπου", "lugar"],

  // --- τύ- palavras ---
  ["τύποι", "modelos"],
  ["τύπος", "modelo"],
  ["τύχοι", "aconteça"],
  ["τύχωσιν", "obtenham"],

  // --- υ- palavras ---
  ["υἱὲ", "filho"],

  // --- φά- palavras ---
  ["φάγεται", "comerá"],
  ["φάγητε", "comais"],
  ["φάγος", "comilão"],
  ["φάσκοντες", "declarando"],

  // --- φέ- palavras ---
  ["φέρε", "traz"],
  ["φέρειν", "trazer"],
  ["φέρετέ", "trazei"],
  ["φέρητε", "tragais"],
  ["φέρον", "trazendo"],
  ["φέρων", "trazendo"],

  // --- φή- palavras ---
  ["φήμη", "notícia"],

  // --- φί- palavras ---
  ["φίλον", "amigo"],

  // --- φα- palavras ---
  ["φαίνεσθε", "apareceis"],
  ["φαγόντες", "tendo-comido"],
  ["φανερωθῆναι", "ser-manifestado"],
  ["φανερώσει", "manifestação"],
  ["φανερῷ", "manifesto"],
  ["φανῶσιν", "apareçam"],

  // --- φαῦ- palavras ---
  ["φαῦλα", "vis"],

  // --- φε- palavras ---
  ["φείδομαι", "poupo"],
  ["φειδομένως", "poupadamente"],

  // --- φθ- palavras ---
  ["φθοράν", "corrupção"],
  ["φθορᾷ", "corrupção"],

  // --- φιλ- palavras ---
  ["φιλάργυροι", "amantes-de-dinheiro"],
  ["φιλήσω", "beijarei"],
  ["φιλαδελφίαν", "amor-fraternal"],
  ["φιλαδελφίᾳ", "amor-fraternal"],
  ["φιλεῖς", "amas"],
  ["φιλοῦσιν", "amam"],
  ["φιλόξενον", "hospitaleiro"],

  // --- φλ- palavras ---
  ["φλογὶ", "chama"],

  // --- φο- palavras ---
  ["φοβήθητε", "temei"],
  ["φοβερὸν", "terrível"],
  ["φοβούμενοί", "tementes"],
  ["φονεῖς", "assassinos"],

  // --- φορ- palavras ---
  ["φορτία", "cargas"],
  ["φορτίον", "carga"],

  // --- φρ- palavras ---
  ["φραγελλώσας", "tendo-açoitado"],
  ["φραγμὸν", "cerca"],
  ["φρονήσει", "prudência"],
  ["φρονίμοις", "prudentes"],
  ["φρόνιμος", "prudente"],

  // --- φυλ- palavras ---
  ["φυλάξαι", "guardar"],
  ["φυλάξει", "guardará"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10g (freq 2, parte 7/12) ===`);
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

console.log(`\n=== Resultado Lote 10g ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

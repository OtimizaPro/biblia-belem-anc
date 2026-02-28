#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10j
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 10/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10j-${Date.now()}.sql`);

const translations = [
  // === Índices 2232-2479 de freq2-words.json (248 palavras) ===

  // --- ἐγγ- / ἐγ- palavras (aproximar, levantar, gerar) ---
  ["ἐγγίζειν", "aproximar-se"],
  ["ἐγγίσας", "tendo-se-aproximado"],
  ["ἐγγύς", "perto"],
  ["ἐγείραντα", "tendo-levantado"],
  ["ἐγείρει", "levanta"],
  ["ἐγείρειν", "levantar"],
  ["ἐγείρεσθε", "levantai-vos"],
  ["ἐγεννήθημεν", "fomos-gerados"],
  ["ἐγερθέντι", "tendo-sido-levantado"],
  ["ἐγερθῆναί", "ser-levantado"],
  ["ἐγερθῇ", "seja-levantado"],
  ["ἐγεῖραι", "levanta"],
  ["ἐγηγερμένον", "tendo-sido-levantado"],
  ["ἐγκακοῦμεν", "desanimamos"],
  ["ἐγκαλοῦμαι", "sou-acusado"],
  ["ἐγκατέλιπεν", "abandonou"],
  ["ἐγνώρισα", "fiz-conhecido"],
  ["ἐγνώσθη", "foi-conhecido"],
  ["ἐγόγγυζον", "murmuravam"],

  // --- ἐδ- palavras (formas aoristos diversos) ---
  ["ἐδίδαξεν", "ensinou"],
  ["ἐδίδασκον", "ensinavam"],
  ["ἐδίδουν", "davam"],
  ["ἐδίψησα", "tive-sede"],
  ["ἐδίωξα", "persegui"],
  ["ἐδεήθην", "supliquei"],
  ["ἐδικαίωσεν", "justificou"],
  ["ἐδόκουν", "pensavam"],
  ["ἐδόξαζεν", "glorificava"],
  ["ἐδόξασα", "glorifiquei"],

  // --- ἐζ- / ἐθ- palavras ---
  ["ἐζυμώθη", "foi-levedado"],
  ["ἐθαμβοῦντο", "ficavam-assombrados"],
  ["ἐθεάσαντο", "contemplaram"],
  ["ἐθεασάμεθα", "contemplamos"],
  ["ἐθεώρουν", "observavam"],
  ["ἐθρηνήσαμεν", "lamentamos"],

  // --- ἐκ- palavras (chamar, cortar, lançar, sair, etc.) ---
  ["ἐκάλουν", "chamavam"],
  ["ἐκάμμυσαν", "fecharam"],
  ["ἐκέλευσα", "ordenei"],
  ["ἐκέρδησα", "ganhei"],
  ["ἐκέρδησεν", "ganhou"],
  ["ἐκήρυξαν", "proclamaram"],
  ["ἐκήρυξεν", "proclamou"],
  ["ἐκαθάρισεν", "purificou"],
  ["ἐκαθέζετο", "sentava-se"],
  ["ἐκαθαρίσθησαν", "foram-purificados"],
  ["ἐκαθερίσθη", "foi-purificado"],
  ["ἐκαυματίσθη", "foi-queimado"],
  ["ἐκβάλετε", "lançai-fora"],
  ["ἐκβάλλοντα", "lançando-fora"],
  ["ἐκβάλλων", "lançando-fora"],
  ["ἐκβαλόντες", "tendo-lançado-fora"],
  ["ἐκδίκησις", "vingança"],
  ["ἐκδύσαντες", "tendo-despido"],
  ["ἐκείνας", "aquelas"],
  ["ἐκείνην", "aquela"],
  ["ἐκεῖσε", "ali"],
  ["ἐκηρύξαμεν", "proclamamos"],
  ["ἐκκέχυται", "tem-sido-derramado"],
  ["ἐκλήθης", "foste-chamado"],
  ["ἐκλίπῃ", "desfaleça"],
  ["ἐκλείσθη", "foi-fechado"],
  ["ἐκλεξαμένους", "tendo-escolhido"],
  ["ἐκλυόμενοι", "desfalecendo"],
  ["ἐκοιμήθη", "adormeceu"],
  ["ἐκοιμήθησαν", "adormeceram"],
  ["ἐκολόβωσεν", "abreviou"],
  ["ἐκοπίασα", "trabalhei"],
  ["ἐκοπίασεν", "trabalhou"],
  ["ἐκπειράσεις", "tentarás"],
  ["ἐκπεσεῖν", "cair"],
  ["ἐκπορευομένοις", "saindo"],
  ["ἐκπορευόμενον", "saindo"],
  ["ἐκπορεύεσθαι", "sair"],
  ["ἐκρατήσατέ", "prendestes"],
  ["ἐκραταιοῦτο", "fortalecia-se"],
  ["ἐκτίσθη", "foi-criado"],
  ["ἐκτείνειν", "estender"],
  ["ἐκτελέσαι", "completar"],
  ["ἐκτενῶς", "fervorosamente"],
  ["ἐκτινάξατε", "sacudi"],
  ["ἐκφυγεῖν", "escapar"],
  ["ἐκφύῃ", "brote"],
  ["ἐκχεῶ", "derramarei"],
  ["ἐκωλύομεν", "impedíamos"],
  ["ἐκόπτοντο", "lamentavam-se"],
  ["ἐκώλυσεν", "impediu"],

  // --- ἐλ- palavras (falar, ter misericórdia, vir, libertar, etc.) ---
  ["ἐλάλησαν", "falaram"],
  ["ἐλάχιστος", "menor"],
  ["ἐλέει", "tem-misericórdia"],
  ["ἐλήλυθας", "tens-vindo"],
  ["ἐλαίας", "oliveira"],
  ["ἐλαίου", "azeite"],
  ["ἐλαλήθη", "foi-falado"],
  ["ἐλεγχόμενοι", "sendo-repreendidos"],
  ["ἐλεγχόμενος", "sendo-repreendido"],
  ["ἐλεημοσύναι", "esmolas"],
  ["ἐλεημοσύνας", "esmolas"],
  ["ἐλευθερία", "liberdade"],
  ["ἐλευθερίας", "liberdade"],
  ["ἐλευθερίᾳ", "liberdade"],
  ["ἐλευθερωθέντες", "tendo-sido-libertados"],
  ["ἐλεᾶτε", "tende-misericórdia"],
  ["ἐληλυθότα", "tendo-vindo"],
  ["ἐλθούσης", "tendo-vindo"],
  ["ἐλθόντα", "tendo-vindo"],
  ["ἐλθόντων", "tendo-vindo"],
  ["ἐλθὸν", "tendo-vindo"],
  ["ἐλιθοβόλουν", "apedrejavam"],
  ["ἐλπίζων", "esperando"],
  ["ἐλπιοῦσιν", "esperam"],
  ["ἐλυπήθησαν", "entristeceram-se"],

  // --- ἐμ- palavras (odiar, embarcar, permanecer, etc.) ---
  ["ἐμίσησεν", "odiou"],
  ["ἐμβάντα", "tendo-embarcado"],
  ["ἐμβῆναι", "embarcar"],
  ["ἐμείναμεν", "permanecemos"],
  ["ἐμεγάλυνεν", "engrandeceu"],
  ["ἐμερίσθη", "foi-dividido"],
  ["ἐμοῖς", "meus"],
  ["ἐμπαίζοντες", "zombando"],
  ["ἐμπαῖκται", "zombadores"],
  ["ἐμῆς", "minha"],

  // --- ἐν- palavras (entrar, vestir, operar, etc.) ---
  ["ἐνέβη", "embarcou"],
  ["ἐνέβησαν", "embarcaram"],
  ["ἐνέγκας", "tendo-trazido"],
  ["ἐνέδραν", "emboscada"],
  ["ἐνέδυσαν", "vestiram"],
  ["ἐνέκοψεν", "impediu"],
  ["ἐναγκαλισάμενος", "tendo-abraçado"],
  ["ἐναντίας", "contrária"],
  ["ἐναντίος", "contrário"],
  ["ἐνγεγραμμένη", "tendo-sido-inscrita"],
  ["ἐνδείξηται", "demonstre"],
  ["ἐνδεικνυμένους", "demonstrando"],
  ["ἐνδημοῦντες", "estando-presentes"],
  ["ἐνδύσασθε", "vesti-vos"],
  ["ἐνδύσηται", "vista-se"],
  ["ἐνεγκεῖν", "trazer"],
  ["ἐνεκεντρίσθης", "foste-enxertado"],
  ["ἐνεργουμένη", "sendo-operada"],
  ["ἐνεργουμένην", "sendo-operada"],
  ["ἐνεργοῦντος", "operando"],
  ["ἐνεργοῦσιν", "operam"],
  ["ἐνεργὴς", "eficaz"],
  ["ἐνεστῶτα", "presentes"],
  ["ἐνετύλιξεν", "envolveu"],
  ["ἐνεφάνισαν", "apresentaram"],
  ["ἐνθυμήσεις", "pensamentos"],
  ["ἐνκακεῖν", "desanimar"],
  ["ἐνκεντρισθήσονται", "serão-enxertados"],
  ["ἐνοικοῦντος", "habitando"],
  ["ἐντέλλομαι", "ordeno"],
  ["ἐντελεῖται", "ordena"],
  ["ἐντολήν", "mandamento"],
  ["ἐντραπῇ", "envergonhe-se"],
  ["ἐντροπὴν", "vergonha"],
  ["ἐντὸς", "dentro"],

  // --- ἐξ- palavras (sair, despir, examinar, etc.) ---
  ["ἐξέδυσαν", "despiram"],
  ["ἐξέλθῃς", "saias"],
  ["ἐξέμαξεν", "enxugou"],
  ["ἐξένισεν", "hospedou"],
  ["ἐξέπεσεν", "caiu"],
  ["ἐξέρχεσθε", "saí"],
  ["ἐξέρχονται", "saem"],
  ["ἐξέτεινεν", "estendeu"],
  ["ἐξέφυγον", "escaparam"],
  ["ἐξήρχετο", "saía"],
  ["ἐξήρχοντο", "saíam"],
  ["ἐξαγοραζόμενοι", "resgatando"],
  ["ἐξακολουθήσαντες", "tendo-seguido"],
  ["ἐξανέτειλεν", "brotou"],
  ["ἐξαναστήσῃ", "levante"],
  ["ἐξεθαμβήθησαν", "ficaram-muito-assombrados"],
  ["ἐξεκλάσθησαν", "foram-cortados"],
  ["ἐξελήλυθεν", "tem-saído"],
  ["ἐξελεύσονται", "sairão"],
  ["ἐξεληλύθει", "tinha-saído"],
  ["ἐξελθόντων", "tendo-saído"],
  ["ἐξεμυκτήριζον", "escarneciam"],
  ["ἐξενέγκαντες", "tendo-levado-para-fora"],
  ["ἐξετάσατε", "examinai"],
  ["ἐξετίθετο", "expunha"],
  ["ἐξετράπησαν", "desviaram-se"],
  ["ἐξηγήσατο", "relatou"],
  ["ἐξηραμμένην", "tendo-sido-secada"],
  ["ἐξιέναι", "sair"],
  ["ἐξορύξαντες", "tendo-cavado"],
  ["ἐξουσιάζει", "tem-autoridade"],

  // --- ἐπ- palavras (sofrer, lançar-sobre, voltar, etc.) ---
  ["ἐπάθετε", "sofrestes"],
  ["ἐπάραντες", "tendo-levantado"],
  ["ἐπάρατε", "levantai"],
  ["ἐπάταξεν", "feriu"],
  ["ἐπέβαλαν", "lançaram-sobre"],
  ["ἐπέγνωτε", "conhecestes-plenamente"],
  ["ἐπέδωκαν", "entregaram"],
  ["ἐπέλθῃ", "venha-sobre"],
  ["ἐπέστη", "apresentou-se"],
  ["ἐπέστρεψαν", "voltaram"],
  ["ἐπέστρεψεν", "voltou"],
  ["ἐπήγειραν", "levantaram-contra"],
  ["ἐπίγειος", "terreno"],
  ["ἐπίσκοπον", "supervisor"],
  ["ἐπίσταμαι", "conheço"],
  ["ἐπίστανται", "conhecem"],
  ["ἐπίσταται", "conhece"],
  ["ἐπίστευσας", "creste"],
  ["ἐπαγγειλάμενος", "tendo-prometido"],
  ["ἐπαγγελιῶν", "promessas"],
  ["ἐπαγγελλόμενοι", "prometendo"],
  ["ἐπαινῶ", "louvo"],
  ["ἐπαισχυνθήσεται", "envergonhar-se-á"],
  ["ἐπαισχυνθῇ", "envergonhe-se"],
  ["ἐπαισχύνεται", "envergonha-se"],
  ["ἐπαισχύνομαι", "envergonho-me"],
  ["ἐπαναστήσονται", "levantar-se-ão-contra"],
  ["ἐπαχύνθη", "engrossou-se"],
  ["ἐπαύσατο", "cessou"],
  ["ἐπείνασα", "tive-fome"],
  ["ἐπείρασαν", "tentaram"],
  ["ἐπείρασεν", "tentou"],
  ["ἐπείσθησαν", "foram-persuadidos"],
  ["ἐπεγίνωσκον", "reconheciam"],
  ["ἐπεθύμησα", "desejei"],
  ["ἐπεθύμησαν", "desejaram"],
  ["ἐπελάβετο", "apoderou-se"],
  ["ἐπελάθοντο", "esqueceram-se"],
  ["ἐπεμείναμεν", "permanecemos"],
  ["ἐπενδύσασθαι", "revestir-se"],
  ["ἐπερωτῶσιν", "perguntem"],
  ["ἐπεσκέψασθέ", "visitastes"],
  ["ἐπεσκέψατο", "visitou"],
  ["ἐπετίμησαν", "repreenderam"],

  // --- ἐπι- palavras (lançar-sobre, embarcar, inscrever, etc.) ---
  ["ἐπιβάλλει", "lança-sobre"],
  ["ἐπιβάντες", "tendo-embarcado"],
  ["ἐπιβαλὼν", "tendo-lançado-sobre"],
  ["ἐπιβαρῆσαί", "sobrecarregar"],
  ["ἐπιβουλῆς", "conspiração"],
  ["ἐπιγείων", "terrenas"],
  ["ἐπιγινώσκει", "conhece-plenamente"],
  ["ἐπιγνοῦσα", "tendo-conhecido-plenamente"],
  ["ἐπιγνώσεως", "pleno-conhecimento"],
  ["ἐπιγράψω", "inscreverei"],
  ["ἐπιγραφή", "inscrição"],
  ["ἐπιγραφὴ", "inscrição"],
  ["ἐπιδέχεται", "recebe"],
  ["ἐπιδημοῦντες", "residindo"],
  ["ἐπιζητῶ", "busco"],
  ["ἐπιθέντος", "tendo-posto-sobre"],
  ["ἐπιθυμήσεις", "desejarás"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10j (freq 2, parte 10/12) ===`);
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

console.log(`\n=== Resultado Lote 10j ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

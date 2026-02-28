#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10i
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 9/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10i-${Date.now()}.sql`);

const translations = [
  // === Índices 1985-2232 de freq2-words.json (248 palavras) ===

  // --- ἀπ- verbos e derivados (continuação) ---
  ["ἀπέστειλέν", "enviou"],
  ["ἀπέστη", "afastou-se"],
  ["ἀπέχοντος", "estando-distante"],
  ["ἀπίστοις", "incrédulos"],
  ["ἀπίστου", "incrédulo"],
  ["ἀπαγγέλλομεν", "anunciamos"],
  ["ἀπαγγεῖλαί", "anunciar"],
  ["ἀπαρνήσομαι", "negarei"],
  ["ἀπαρνησάσθω", "negue-a-si-mesmo"],
  ["ἀπείθειαν", "desobediência"],
  ["ἀπεθάνετε", "morrestes"],
  ["ἀπεθάνομεν", "morremos"],
  ["ἀπειθήσασιν", "tendo-desobedecido"],
  ["ἀπειθούντων", "desobedecendo"],
  ["ἀπεκάλυψας", "revelaste"],
  ["ἀπεκεφάλισα", "decapitei"],
  ["ἀπεκεφάλισεν", "decapitou"],
  ["ἀπεκρίθην", "respondi"],
  ["ἀπελθοῦσαι", "tendo-partido"],
  ["ἀπεστάλη", "foi-enviado"],
  ["ἀπεσταλμένους", "tendo-sido-enviados"],
  ["ἀπηλλοτριωμένοι", "tendo-sido-alienados"],
  ["ἀποβήσεται", "resultará"],
  ["ἀποβολὴ", "rejeição"],
  ["ἀπογράφεσθαι", "ser-registrado"],
  ["ἀποδεκατοῦτε", "dizimais"],
  ["ἀποδιδόντες", "retribuindo"],
  ["ἀποδοθῆναι", "ser-devolvido"],
  ["ἀποδοχῆς", "aceitação"],
  ["ἀποδῷς", "devolvas"],
  ["ἀποθήκας", "celeiros"],
  ["ἀποθανὼν", "tendo-morrido"],
  ["ἀποθνήσκομεν", "morremos"],
  ["ἀποθνήσκωμεν", "morramos"],
  ["ἀποθνῄσκει", "morre"],
  ["ἀποθνῄσκων", "morrendo"],
  ["ἀποκαλυφθῇ", "seja-revelado"],
  ["ἀποκειμένην", "tendo-sido-reservada"],
  ["ἀποκρίθητέ", "respondei"],
  ["ἀποκριθήσονται", "responderão"],
  ["ἀποκτείνας", "tendo-matado"],
  ["ἀποκτείνουσα", "matando"],
  ["ἀποκτείνωσιν", "matem"],
  ["ἀποκτεννόντων", "matando"],
  ["ἀπολέσθαι", "perecer"],
  ["ἀπολελυμένην", "tendo-sido-solta"],
  ["ἀπολεῖσθε", "perecereis"],
  ["ἀπολογίας", "defesa"],
  ["ἀπολογίᾳ", "defesa"],
  ["ἀπολογεῖσθαι", "defender-se"],
  ["ἀπολογουμένου", "defendendo-se"],
  ["ἀπολυτρώσεως", "redenção"],
  ["ἀπολωλός", "tendo-se-perdido"],
  ["ἀπολωλότα", "tendo-se-perdido"],
  ["ἀπολωλὼς", "tendo-se-perdido"],
  ["ἀπολύειν", "soltar"],
  ["ἀπολύσας", "tendo-soltado"],
  ["ἀπολύτρωσις", "redenção"],
  ["ἀπολύων", "soltando"],
  ["ἀπορούμενοι", "estando-perplexos"],
  ["ἀποστέλλουσιν", "enviam"],
  ["ἀποστασίου", "divórcio"],
  ["ἀποστείλῃ", "envie"],
  ["ἀποστερεῖτε", "defraudais"],
  ["ἀποστολὴν", "apostolado"],
  ["ἀποστολῆς", "apostolado"],
  ["ἀποστόλους", "apóstolos"],
  ["ἀποτόμως", "severamente"],
  ["ἀποφυγόντες", "tendo-escapado"],
  ["ἀπρόσκοποι", "sem-tropeço"],
  ["ἀπόδεκτον", "aceitável"],
  ["ἀπόδος", "devolve"],
  ["ἀπόθεσις", "remoção"],
  ["ἀπόκοψον", "corta-fora"],
  ["ἀπόκρισιν", "resposta"],
  ["ἀπόκρυφον", "oculto"],
  ["ἀπόλαυσιν", "deleite"],
  ["ἀπόλλυται", "perece"],
  ["ἀπόστητε", "afastai-vos"],
  ["ἀπώλεσα", "perdi"],

  // --- ἀρ- palavras ---
  ["ἀργαὶ", "ociosas"],
  ["ἀρεστόν", "agradável"],
  ["ἀρεστὰ", "agradáveis"],
  ["ἀρετῇ", "virtude"],
  ["ἀρκετὸν", "suficiente"],
  ["ἀρνούμενοι", "negando"],
  ["ἀρξάμενοι", "tendo-começado"],
  ["ἀροῦσίν", "levantarão"],
  ["ἀροῦσιν", "levantarão"],
  ["ἀρραβῶνα", "penhor"],
  ["ἀρχάς", "principados"],
  ["ἀρχαίοις", "antigos"],
  ["ἀρχαὶ", "principados"],
  ["ἀρχηγὸν", "príncipe"],
  ["ἀρχισυνάγωγος", "chefe-da-sinagoga"],
  ["ἀρχιτρίκλινος", "mestre-de-cerimônias"],
  ["ἀρχὰς", "principados"],

  // --- ἀσ- palavras ---
  ["ἀσέβειαν", "impiedade"],
  ["ἀσέλγεια", "devassidão"],
  ["ἀσβέστῳ", "inextinguível"],
  ["ἀσθενέσιν", "fracos"],
  ["ἀσθενειῶν", "enfermidades"],
  ["ἀσθενοῦς", "fraco"],
  ["ἀσθενὲς", "fraco"],
  ["ἀσθενῶ", "estou-fraco"],
  ["ἀσκοί", "odres"],
  ["ἀσκούς", "odres"],
  ["ἀσκοὶ", "odres"],
  ["ἀσπάσησθε", "saudeis"],
  ["ἀσφαλές", "seguro"],
  ["ἀσφαλὲς", "seguro"],
  ["ἀσωτίας", "dissolução"],
  ["ἀσύνετοί", "insensatos"],

  // --- ἀτ- palavras ---
  ["ἀτάκτως", "desordenadamente"],
  ["ἀτενίζοντες", "fitando-os-olhos"],
  ["ἀτενίσαι", "fitar-os-olhos"],
  ["ἀτιμίας", "desonra"],

  // --- ἀφ- palavras ---
  ["ἀφέσει", "perdão"],
  ["ἀφήσω", "deixarei"],
  ["ἀφίενταί", "são-perdoados"],
  ["ἀφίημι", "deixo"],
  ["ἀφανίζει", "desfigura"],
  ["ἀφεδρῶνα", "latrina"],
  ["ἀφεῖναι", "perdoar"],
  ["ἀφθάρτου", "incorruptível"],
  ["ἀφθάρτῳ", "incorruptível"],
  ["ἀφθαρσίᾳ", "incorruptibilidade"],
  ["ἀφιέτω", "deixe"],
  ["ἀφροσύνῃ", "insensatez"],
  ["ἀφῆκαν", "deixaram"],
  ["ἀχειροποίητον", "não-feito-por-mãos"],
  ["ἀόρατα", "invisíveis"],

  // --- ἁγ- palavras (espírito áspero) ---
  ["ἁγίας", "santa"],
  ["ἁγιάσῃ", "santifique"],
  ["ἁγιασμὸς", "santificação"],
  ["ἁγνείᾳ", "pureza"],
  ["ἁγνὴν", "pura"],

  // --- ἁλ- palavras ---
  ["ἁλισθήσεται", "será-salgado"],
  ["ἁλύσει", "cadeia"],
  ["ἁλύσεις", "cadeias"],

  // --- ἁμ- palavras ---
  ["ἁμάρτανε", "peca"],
  ["ἁμάρτῃ", "peque"],
  ["ἁμαρτάνοντες", "pecando"],
  ["ἁμαρτήσῃ", "peque"],
  ["ἁμαρτωλούς", "pecadores"],
  ["ἁμαρτωλοῖς", "pecadores"],

  // --- ἁπ- palavras ---
  ["ἁπαλὸς", "tenro"],
  ["ἁπλοῦς", "simples"],
  ["ἁπλότητος", "simplicidade"],

  // --- ἁρπ- palavras ---
  ["ἁρπάζει", "arrebata"],
  ["ἁρπάζειν", "arrebatar"],
  ["ἁρπάσαι", "arrebatar"],
  ["ἁρπαγῆς", "rapina"],
  ["ἁψάμενος", "tendo-tocado"],

  // --- ἄ- palavras (com acento agudo) ---
  ["ἄγει", "conduz"],
  ["ἄγνοιαν", "ignorância"],
  ["ἄγονται", "são-conduzidos"],
  ["ἄγριον", "silvestre"],
  ["ἄδικοι", "injustos"],
  ["ἄκαρπος", "infrutífero"],
  ["ἄκρον", "extremidade"],
  ["ἄκρου", "extremidade"],
  ["ἄκρων", "extremidades"],
  ["ἄλαλον", "mudo"],
  ["ἄλογα", "irracionais"],
  ["ἄμεμπτοι", "irrepreensíveis"],
  ["ἄμεμπτος", "irrepreensível"],
  ["ἄμετρα", "desmedidas"],
  ["ἄνοιξον", "abre"],
  ["ἄνυδροι", "sem-água"],
  ["ἄξιοι", "dignos"],
  ["ἄξιός", "digno"],
  ["ἄραντες", "tendo-levantado"],
  ["ἄρατε", "levantai"],
  ["ἄρξησθε", "comeceis"],
  ["ἄρξηται", "comece"],
  ["ἄρσενες", "machos"],
  ["ἄρτῳ", "pão"],
  ["ἄρχειν", "governar"],
  ["ἄσπιλον", "sem-mancha"],
  ["ἄτεκνος", "sem-filhos"],
  ["ἄτερ", "sem"],
  ["ἄτιμος", "sem-honra"],
  ["ἄφρονα", "insensato"],
  ["ἄφρονες", "insensatos"],
  ["ἄφωνον", "mudo"],
  ["ἄχρις", "até"],
  ["ἄχυρον", "palha"],

  // --- ἅ- palavras (espírito áspero com acento) ---
  ["ἅλωνα", "eira"],
  ["ἅπας", "todo"],
  ["ἅπασαν", "toda"],
  ["ἅπτεσθαι", "tocar"],
  ["ἅπτεται", "toca"],
  ["ἅτινα", "quaisquer"],
  ["ἅψας", "tendo-acendido"],
  ["ἅψηται", "toque"],
  ["ἅψωμαι", "toque"],

  // --- ἆ- palavras ---
  ["ἆρα", "acaso"],

  // --- Nomes próprios maiúsculos Ἀ- ---
  ["Ἀαρὼν", "Aarão"],
  ["Ἀβιά", "Abia"],
  ["Ἀθήναις", "Atenas"],
  ["Ἀθηναῖοι", "Atenienses"],
  ["Ἀθηνῶν", "Atenas"],
  ["Ἀκολουθήσω", "Seguirei"],
  ["Ἀκούετε", "Ouvi"],
  ["Ἀκοῇ", "Ouvido"],
  ["Ἀμήν", "Amém"],
  ["Ἀμιναδὰβ", "Aminadabe"],
  ["Ἀμνὸς", "Cordeiro"],
  ["Ἀμὼς", "Amós"],
  ["Ἀνανία", "Ananias"],
  ["Ἀναστάς", "Tendo-se-levantado"],
  ["Ἀναχθέντες", "Tendo-navegado"],
  ["Ἀνδρέου", "André"],
  ["Ἀπεσταλμένος", "Tendo-sido-enviado"],
  ["Ἀπολλῶν", "Apolo"],
  ["Ἀρχίππῳ", "Arquipo"],
  ["Ἀρχηγὸν", "Príncipe"],
  ["Ἀφέωνταί", "Têm-sido-perdoados"],
  ["Ἀφίενταί", "São-perdoados"],
  ["Ἀχαΐα", "Acaia"],
  ["Ἀχαΐαν", "Acaia"],
  ["Ἁλφαίου", "Alfeu"],
  ["Ἄγαρ", "Agar"],
  ["Ἄγε", "Vamos"],
  ["Ἄγουσιν", "Conduzem"],
  ["Ἄννα", "Ana"],
  ["Ἄννας", "Anás"],
  ["Ἄρθητι", "Sê-levantado"],
  ["Ἄρτεμις", "Ártemis"],
  ["Ἄχαζ", "Acaz"],
  ["Ἅγια", "Santas"],
  ["Ἅιδην", "Hades"],
  ["Ἆσσον", "Asso"],

  // --- ἐ- palavras (início de seção ε) ---
  ["ἐάνπερ", "se-de-fato"],
  ["ἐβάπτιζεν", "batizava"],
  ["ἐβαπτίσθησαν", "foram-batizados"],
  ["ἐβασιλεύσατε", "reinastes"],
  ["ἐβεβαιώθη", "foi-confirmado"],
  ["ἐβλάστησεν", "brotou"],
  ["ἐβλασφήμουν", "blasfemavam"],
  ["ἐβουλεύσαντο", "deliberaram"],
  ["ἐβουλόμην", "desejava"],
  ["ἐβούλοντο", "desejavam"],
  ["ἐγέμισαν", "encheram"],
  ["ἐγέννησα", "gerei"],
  ["ἐγένου", "tornaste-te"],
  ["ἐγγίζει", "aproxima-se"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10i (freq 2, parte 9/12) ===`);
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

console.log(`\n=== Resultado Lote 10i ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

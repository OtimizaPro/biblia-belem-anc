#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ah
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 34/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ah-${Date.now()}.sql`);

const translations = [
  // === Lote 11ah: freq 1, parte 34/44 (248 palavras) ===

  // --- ἐθ- palavras ---
  ["ἐθαύμαζεν", "admirava"],
  ["ἐθεάθη", "foi-contemplado"],
  ["ἐθεάσασθε", "contemplastes"],
  ["ἐθεάσατο", "contemplou"],
  ["ἐθελοθρησκίᾳ", "culto-voluntário"],
  ["ἐθεμελίωσας", "fundamentaste"],
  ["ἐθεράπευεν", "curava"],
  ["ἐθεράπευον", "curavam"],
  ["ἐθεραπεύθησαν", "foram-curados"],
  ["ἐθερμαίνοντο", "aqueciam-se"],
  ["ἐθεώρει", "contemplava"],
  ["ἐθηριομάχησα", "lutei-com-feras"],
  ["ἐθησαυρίσατε", "entesourastes"],
  ["ἐθνάρχης", "etnarca"],
  ["ἐθνικοί", "gentios"],
  ["ἐθνικοὶ", "gentios"],
  ["ἐθνικὸς", "gentio"],
  ["ἐθνικῶν", "gentios"],
  ["ἐθνικῶς", "à-maneira-dos-gentios"],
  ["ἐθορύβουν", "tumultuavam"],
  ["ἐθρέψαμεν", "nutrimos"],
  ["ἐθρέψατε", "nutriste"],
  ["ἐθρήνουν", "lamentavam"],
  ["ἐθυμώθη", "irou-se"],
  ["ἐθῶν", "costumes"],

  // --- ἐκάθ-/ἐκάκ-/ἐκάλ- palavras ---
  ["ἐκάθευδεν", "dormia"],
  ["ἐκάθευδον", "dormiam"],
  ["ἐκάκωσαν", "maltrataram"],
  ["ἐκάκωσεν", "maltratou"],
  ["ἐκάλεσα", "chamei"],

  // --- ἐκέ- palavras ---
  ["ἐκέκραξα", "clamei"],
  ["ἐκέλευον", "ordenavam"],
  ["ἐκέλευσέν", "ordenou"],
  ["ἐκένωσεν", "esvaziou"],
  ["ἐκέρδησας", "lucraste"],
  ["ἐκήρυσσον", "proclamavam"],

  // --- ἐκα- palavras ---
  ["ἐκαθαρίσθη", "foi-purificado"],
  ["ἐκαθεζόμην", "sentava-me"],
  ["ἐκαρτέρησεν", "perseverou"],

  // --- ἐκβ- palavras (lançar-fora) ---
  ["ἐκβάλλεις", "lanças-fora"],
  ["ἐκβάλλεται", "é-lançado-fora"],
  ["ἐκβάλλετε", "lançai-fora"],
  ["ἐκβαλλομένους", "sendo-lançados-fora"],
  ["ἐκβαλλόμενοι", "sendo-lançados-fora"],
  ["ἐκβαλοῦσα", "tendo-lançado-fora"],
  ["ἐκβαλοῦσιν", "lançarão-fora"],
  ["ἐκβεβλήκει", "tinha-lançado-fora"],
  ["ἐκβληθέντος", "tendo-sido-lançado-fora"],
  ["ἐκβληθήσεται", "será-lançado-fora"],
  ["ἐκβληθήσονται", "serão-lançados-fora"],
  ["ἐκβολὴν", "lançamento-fora"],

  // --- ἐκδ- palavras ---
  ["ἐκδέχεσθε", "esperai"],
  ["ἐκδέχεται", "espera"],
  ["ἐκδέχομαι", "espero"],
  ["ἐκδαπανηθήσομαι", "serei-totalmente-gasto"],
  ["ἐκδεχομένου", "esperando"],
  ["ἐκδεχομένων", "esperando"],
  ["ἐκδεχόμενος", "esperando"],
  ["ἐκδημοῦμεν", "estamos-ausentes"],
  ["ἐκδημοῦντες", "estando-ausentes"],
  ["ἐκδημῆσαι", "estar-ausente"],
  ["ἐκδιηγούμενοι", "narrando-plenamente"],
  ["ἐκδιηγῆται", "narre-plenamente"],
  ["ἐκδικήσεως", "vingança"],
  ["ἐκδικήσω", "vingarei"],
  ["ἐκδικοῦντες", "vingando"],
  ["ἐκδικῆσαι", "vingar"],
  ["ἐκδιωξάντων", "tendo-perseguido"],
  ["ἐκδοχὴ", "expectativa"],
  ["ἐκδύσασθαι", "despojar-se"],
  ["ἐκδώσεται", "arrendará"],

  // --- ἐκε- palavras ---
  ["ἐκεφαλίωσαν", "feriram-na-cabeça"],
  ["ἐκεῖθέν", "dali"],
  ["ἐκεῖνα", "aquelas-coisas"],
  ["ἐκεῖναί", "aquelas"],
  ["ἐκεῖνοί", "aqueles"],

  // --- ἐκζ- palavras ---
  ["ἐκζητήσας", "tendo-buscado-diligentemente"],
  ["ἐκζητήσεις", "buscas-diligentes"],
  ["ἐκζητήσωσιν", "busquem-diligentemente"],
  ["ἐκζητηθήσεται", "será-requerido"],
  ["ἐκζητηθῇ", "seja-requerido"],
  ["ἐκζητοῦσιν", "buscam-diligentemente"],
  ["ἐκζητῶν", "buscando-diligentemente"],

  // --- ἐκη-/ἐκθ-/ἐκι- palavras ---
  ["ἐκηρύχθη", "foi-proclamado"],
  ["ἐκθαμβεῖσθαι", "estar-grandemente-espantado"],
  ["ἐκθαμβεῖσθε", "estais-grandemente-espantadas"],
  ["ἐκινήθη", "foi-movida"],
  ["ἐκινδύνευον", "corriam-perigo"],

  // --- ἐκκ- palavras ---
  ["ἐκκαθάρατε", "limpai"],
  ["ἐκκαθάρῃ", "limpe"],
  ["ἐκκεχυμένον", "tendo-sido-derramado"],
  ["ἐκκλίνετε", "desviai-vos"],
  ["ἐκκλεῖσαι", "excluir"],
  ["ἐκκλινάτω", "desvie-se"],
  ["ἐκκολυμβήσας", "tendo-nadado-para-fora"],
  ["ἐκκοπήσῃ", "sejas-cortado-fora"],
  ["ἐκκόψεις", "cortarás-fora"],
  ["ἐκκόψω", "cortarei-fora"],

  // --- ἐκλ- palavras ---
  ["ἐκλάμψουσιν", "resplandecerão"],
  ["ἐκλέλησθε", "tendes-esquecido"],
  ["ἐκλαλῆσαι", "falar-fora"],
  ["ἐκλαύσατε", "chorai"],
  ["ἐκλείσθησαν", "foram-fechados"],
  ["ἐκλείψουσιν", "desfalecerão"],
  ["ἐκλεκτοί", "escolhidos"],
  ["ἐκλεκτοὶ", "escolhidos"],
  ["ἐκλεκτοῖς", "escolhidos"],
  ["ἐκλεκτόν", "escolhido"],
  ["ἐκλεκτός", "escolhido"],
  ["ἐκλεκτῆς", "escolhida"],
  ["ἐκλεκτῇ", "escolhida"],
  ["ἐκλελεγμένος", "tendo-sido-escolhido"],
  ["ἐκλεξάμενος", "tendo-escolhido"],
  ["ἐκληρώθημεν", "fomos-feitos-herança"],
  ["ἐκλιπόντος", "tendo-faltado"],
  ["ἐκλογὴ", "eleição"],
  ["ἐκλογῆς", "eleição"],
  ["ἐκλυθήσονται", "desfalecerão"],
  ["ἐκλυθῶσιν", "desfaleçam"],
  ["ἐκλύου", "desanimes"],

  // --- ἐκμ-/ἐκν- palavras ---
  ["ἐκμάξασα", "tendo-enxugado"],
  ["ἐκμάσσειν", "enxugar"],
  ["ἐκνήψατε", "tornai-à-sobriedade"],

  // --- ἐκο- palavras ---
  ["ἐκοινώνησαν", "participaram"],
  ["ἐκοινώνησεν", "participou"],
  ["ἐκολάφισαν", "esbofetearam"],
  ["ἐκολλήθη", "uniu-se"],
  ["ἐκολοβώθησαν", "foram-encurtados"],
  ["ἐκομίσαντο", "receberam-de-volta"],
  ["ἐκομίσατο", "recebeu-de-volta"],
  ["ἐκομισάμην", "recebi-de-volta"],
  ["ἐκούφιζον", "aliviavam"],

  // --- ἐκπ- palavras ---
  ["ἐκπέπτωκεν", "caiu-fora"],
  ["ἐκπέσητε", "caiais-fora"],
  ["ἐκπέσωμεν", "caiamos-fora"],
  ["ἐκπέσωσιν", "caiam-fora"],
  ["ἐκπειράζωμεν", "tentemos"],
  ["ἐκπειράζων", "tentando"],
  ["ἐκπεμφθέντες", "tendo-sido-enviados-fora"],
  ["ἐκπεπλήρωκεν", "tem-cumprido-plenamente"],
  ["ἐκπερισσῶς", "excessivamente"],
  ["ἐκπεφευγέναι", "ter-escapado"],
  ["ἐκπλήρωσιν", "cumprimento"],
  ["ἐκπλήσσεσθαι", "estar-assombrado"],
  ["ἐκπλεῦσαι", "navegar-para-fora"],
  ["ἐκπλησσόμενος", "estando-assombrado"],
  ["ἐκπορευέσθω", "saia"],
  ["ἐκπορευομένων", "saindo"],
  ["ἐκπορευομένῳ", "saindo"],
  ["ἐκπορευόμενά", "saindo"],
  ["ἐκπορευόμενα", "saindo"],
  ["ἐκπορευόμενοι", "saindo"],
  ["ἐκπορευόμενος", "saindo"],
  ["ἐκπορεύεται", "sai"],
  ["ἐκπορεύσονται", "sairão"],
  ["ἐκπορνεύσασαι", "tendo-fornicado-intensamente"],

  // --- ἐκρ- palavras ---
  ["ἐκρίθη", "foi-julgado"],
  ["ἐκρατήσαμεν", "seguramos"],
  ["ἐκρατοῦντο", "eram-segurados"],
  ["ἐκραύγαζον", "clamavam"],
  ["ἐκραύγασεν", "clamou"],
  ["ἐκριζωθέντα", "tendo-sido-desarraigado"],
  ["ἐκριζωθήσεται", "será-desarraigado"],
  ["ἐκριζώσητε", "desarraigueis"],
  ["ἐκρινόμεθα", "éramos-julgados"],

  // --- ἐκσ-/ἐκτ- palavras ---
  ["ἐκστάσεως", "êxtase"],
  ["ἐκτήσατο", "adquiriu"],
  ["ἐκταράσσουσιν", "perturbam-grandemente"],
  ["ἐκτεθέντος", "tendo-sido-exposto"],
  ["ἐκτενέστερον", "mais-fervorosamente"],
  ["ἐκτενείᾳ", "fervor"],
  ["ἐκτενεῖς", "fervorosos"],
  ["ἐκτενῆ", "fervorosa"],
  ["ἐκτησάμην", "adquiri"],
  ["ἐκτιναξάμενοι", "tendo-sacudido-fora"],
  ["ἐκτιναξάμενος", "tendo-sacudido-fora"],
  ["ἐκτρέφει", "nutre"],
  ["ἐκτρέφετε", "nutri"],
  ["ἐκτραπήσονται", "desviar-se-ão"],
  ["ἐκτραπῇ", "seja-desviado"],
  ["ἐκτρεπόμενος", "desviando-se"],
  ["ἐκτρώματι", "aborto"],

  // --- ἐκυ-/ἐκφ-/ἐκχ-/ἐκω-/ἐκό-/ἐκύ- palavras ---
  ["ἐκυλίετο", "revolvia-se"],
  ["ἐκφέρειν", "levar-para-fora"],
  ["ἐκφέρουσα", "produzindo"],
  ["ἐκφευξόμεθα", "escaparemos"],
  ["ἐκφεύξῃ", "escaparás"],
  ["ἐκφοβεῖν", "amedrontar"],
  ["ἐκφύγωσιν", "escapem"],
  ["ἐκχέαι", "derramar"],
  ["ἐκχεῖται", "é-derramado"],
  ["ἐκχυθήσεται", "será-derramado"],
  ["ἐκχωρείτωσαν", "retirem-se"],
  ["ἐκωλύθην", "fui-impedido"],
  ["ἐκωλύσατε", "impedistes"],
  ["ἐκόσμησαν", "adornaram"],
  ["ἐκόσμουν", "adornavam"],
  ["ἐκόψασθε", "lamentastes"],
  ["ἐκύκλωσαν", "cercaram"],

  // --- ἐλά- palavras ---
  ["ἐλάκησεν", "rebentou"],
  ["ἐλάλησέν", "falou"],
  ["ἐλάμβανον", "recebiam"],
  ["ἐλάσσονι", "menor"],
  ["ἐλάσσω", "menor"],
  ["ἐλάτρευσαν", "serviram-em-culto"],
  ["ἐλάχιστον", "mínimo"],
  ["ἐλάχιστόν", "mínimo"],

  // --- ἐλέ- palavras ---
  ["ἐλέγετε", "dizíeis"],
  ["ἐλέγξαι", "repreender"],
  ["ἐλέγξει", "repreenderá"],
  ["ἐλέγχει", "repreende"],
  ["ἐλέγχειν", "repreender"],
  ["ἐλέγχεται", "é-repreendido"],
  ["ἐλέγχετε", "repreendei"],

  // --- ἐλα- palavras ---
  ["ἐλαίᾳ", "oliveira"],
  ["ἐλαιῶν", "oliveiras"],
  ["ἐλαλήσαμεν", "falamos"],
  ["ἐλαλήσατε", "falastes"],
  ["ἐλαλοῦμεν", "falávamos"],
  ["ἐλαττοῦσθαι", "ser-diminuído"],
  ["ἐλατόμησεν", "escavou-na-rocha"],
  ["ἐλαυνόμενα", "sendo-impelidos"],
  ["ἐλαυνόμεναι", "sendo-impelidas"],
  ["ἐλαφρίᾳ", "leviandade"],
  ["ἐλαφρόν", "leve"],
  ["ἐλαφρὸν", "leve"],
  ["ἐλαχίστη", "mínima"],
  ["ἐλαχίστου", "mínimo"],
  ["ἐλαχιστοτέρῳ", "menor-de-todos"],
  ["ἐλαύνειν", "remar"],

  // --- ἐλε- palavras ---
  ["ἐλεήμονες", "misericordiosos"],
  ["ἐλεήμων", "misericordioso"],
  ["ἐλεήσῃ", "tenha-misericórdia"],
  ["ἐλεγμόν", "repreensão"],
  ["ἐλεγχθῇ", "seja-repreendido"],
  ["ἐλεγχόμενα", "sendo-repreendidas"],
  ["ἐλεεινότεροι", "mais-dignos-de-compaixão"],
  ["ἐλεεῖ", "tem-misericórdia"],
  ["ἐλεηθέντες", "tendo-recebido-misericórdia"],
  ["ἐλεηθήσονται", "receberão-misericórdia"],
  ["ἐλεηθῶσιν", "recebam-misericórdia"],
  ["ἐλεημοσυνῶν", "esmolas"],
  ["ἐλεημοσύνη", "esmola"],
  ["ἐλευθερωθήσεται", "será-libertado"],
  ["ἐλευθερώσει", "libertará"],
  ["ἐλευθερώσῃ", "liberte"],
  ["ἐλευσόμεθα", "viremos"],
  ["ἐλεύθεροί", "livres"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ah (freq 1, parte 34/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(`npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`, { encoding: 'utf-8', timeout: 30000 });
    const jsonStart = result.indexOf('[');
    const parsed = JSON.parse(result.substring(jsonStart));
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    process.stdout.write(changes > 0 ? `✓ ${word} → ${translation} (${changes})\n` : `· ${word} → ${translation} (0)\n`);
    success++;
  } catch (err) { process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`); errors++; }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 11ah ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

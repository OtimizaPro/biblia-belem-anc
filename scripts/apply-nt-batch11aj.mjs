#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11aj
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 36/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11aj-${Date.now()}.sql`);

const translations = [
  // === freq1-slice-aj.json (248 palavras) ===

  // --- ἐντ- palavras ---
  ["ἐντίμους", "honrados"],
  ["ἐνταφιάζειν", "embalsamar"],
  ["ἐνταφιάσαι", "embalsamar"],
  ["ἐνταφιασμοῦ", "embalsamento"],
  ["ἐνταφιασμόν", "embalsamento"],
  ["ἐντειλάμενος", "tendo-ordenado"],
  ["ἐντετυλιγμένον", "tendo-sido-enrolado"],
  ["ἐντετυπωμένη", "tendo-sido-gravada"],
  ["ἐντεύξεις", "intercessões"],
  ["ἐντεύξεως", "intercessão"],
  ["ἐντιμότερός", "mais-honrado"],
  ["ἐντολαὶ", "mandamentos"],
  ["ἐντρέπομαι", "envergonho-me"],
  ["ἐντρέπων", "envergonhando"],
  ["ἐντραπήσονται", "envergonhar-se-ão"],
  ["ἐντρεπόμενος", "envergonhando-se"],
  ["ἐντρεφόμενος", "sendo-nutrido"],
  ["ἐντρυφῶντες", "deleitando-se"],
  ["ἐντυγχάνειν", "interceder"],
  ["ἐντόπιοι", "locais"],

  // --- ἐνυ-/ἐνω- palavras ---
  ["ἐνυβρίσας", "tendo-ultrajado"],
  ["ἐνυπνίοις", "sonhos"],
  ["ἐνυπνιαζόμενοι", "sonhando"],
  ["ἐνυπνιασθήσονται", "sonharão"],
  ["ἐνωτίσασθε", "dai-ouvidos"],
  ["ἐνόμιζεν", "supunha"],
  ["ἐνόμιζον", "supunham"],
  ["ἐνόμισαν", "supuseram"],
  ["ἐνόμισας", "supuseste"],
  ["ἐνόντα", "estando-dentro"],
  ["ἐνύσταξαν", "cochilaram"],
  ["ἐνῴκησεν", "habitou-em"],

  // --- ἐξ- palavras (início) ---
  ["ἐξάγει", "conduz-para-fora"],
  ["ἐξάγουσιν", "conduzem-para-fora"],
  ["ἐξάπινα", "repentinamente"],
  ["ἐξάρατε", "tirai-fora"],
  ["ἐξέβαλλον", "expulsavam"],
  ["ἐξέβησαν", "saíram"],
  ["ἐξέθεντο", "expuseram"],
  ["ἐξέκλιναν", "desviaram-se"],
  ["ἐξέληται", "livre"],
  ["ἐξέλθατε", "saí"],
  ["ἐξέμασσεν", "enxugava"],
  ["ἐξένευσεν", "retirou-se"],
  ["ἐξέπεμψαν", "enviaram-para-fora"],
  ["ἐξέπεσαν", "caíram-fora"],
  ["ἐξέπλει", "navegava-para-fora"],
  ["ἐξέραμα", "vômito"],
  ["ἐξέστη", "ficou-fora-de-si"],
  ["ἐξέστημεν", "ficamos-fora-de-nós"],
  ["ἐξέστραπται", "tem-sido-pervertido"],
  ["ἐξήγγειλαν", "anunciaram"],
  ["ἐξήγειρά", "levantei"],
  ["ἐξήλθομεν", "saímos"],
  ["ἐξήνεγκεν", "carregou-para-fora"],
  ["ἐξήρανεν", "secou"],
  ["ἐξήρανται", "têm-sido-secados"],
  ["ἐξήχηται", "tem-ressoado"],
  ["ἐξίστασθαι", "ficar-fora-de-si"],
  ["ἐξίστατο", "ficava-fora-de-si"],

  // --- ἐξαγ- palavras ---
  ["ἐξαγαγέτωσαν", "conduzam-para-fora"],
  ["ἐξαγαγεῖν", "conduzir-para-fora"],
  ["ἐξαγαγόντες", "tendo-conduzido-para-fora"],
  ["ἐξαγαγών", "tendo-conduzido-para-fora"],
  ["ἐξαγαγὼν", "tendo-conduzido-para-fora"],
  ["ἐξαγγείλητε", "anuncieis"],
  ["ἐξαγοράσῃ", "resgatasse"],

  // --- ἐξαι-/ἐξακ-/ἐξαλ- palavras ---
  ["ἐξαιρούμενός", "livrando"],
  ["ἐξακολουθήσουσιν", "seguirão"],
  ["ἐξαλείψας", "tendo-apagado"],
  ["ἐξαλειφθῆναι", "ser-apagados"],
  ["ἐξαλλόμενος", "saltando"],

  // --- ἐξαν-/ἐξαπ- palavras ---
  ["ἐξανάστασιν", "ressurreição-dentre"],
  ["ἐξαπατάτω", "que-não-engane"],
  ["ἐξαπατήσῃ", "engane"],
  ["ἐξαπατηθεῖσα", "tendo-sido-enganada"],
  ["ἐξαπατῶσιν", "enganam"],
  ["ἐξαπεστάλη", "foi-enviado-para-fora"],
  ["ἐξαπορηθῆναι", "desesperar-se"],
  ["ἐξαπορούμενοι", "desesperando-se"],
  ["ἐξαποστέλλω", "envio-para-fora"],
  ["ἐξαποστελῶ", "enviarei-para-fora"],
  ["ἐξαρτίσαι", "completar"],
  ["ἐξαστράπτων", "resplandecendo"],

  // --- ἐξει- palavras ---
  ["ἐξείλατο", "livrou"],
  ["ἐξείλατό", "livrou"],

  // --- ἐξεβ-/ἐξεγ-/ἐξεδ-/ἐξεζ- palavras ---
  ["ἐξεβάλομεν", "expulsamos"],
  ["ἐξεβλήθη", "foi-expulso"],
  ["ἐξεγερεῖ", "ressuscitará"],
  ["ἐξεδέχετο", "esperava"],
  ["ἐξεζήτησαν", "buscaram-diligentemente"],
  ["ἐξεθαύμαζον", "admiravam-se-grandemente"],

  // --- ἐξειλ-/ἐξεκ- palavras ---
  ["ἐξειλάμην", "livrei"],
  ["ἐξεκέντησαν", "traspassaram"],
  ["ἐξεκαύθησαν", "inflamaram-se"],
  ["ἐξεκλείσθη", "foi-excluído"],
  ["ἐξεκομίζετο", "era-carregado-para-fora"],
  ["ἐξεκρέμετο", "pendia"],
  ["ἐξεκόπης", "foste-cortado-fora"],

  // --- ἐξελ- palavras ---
  ["ἐξελέγοντο", "foram-escolhidos"],
  ["ἐξελέξαντο", "escolheram"],
  ["ἐξελέξασθε", "escolhestes"],
  ["ἐξελέξω", "escolhi"],
  ["ἐξελέσθαι", "livrar"],
  ["ἐξεληλυθυῖαν", "tendo-saído"],
  ["ἐξεληλυθός", "tendo-saído"],
  ["ἐξεληλυθότας", "tendo-saído"],
  ["ἐξεληλύθασιν", "têm-saído"],
  ["ἐξελθοῦσαι", "tendo-saído"],
  ["ἐξελθοῦσαν", "tendo-saído"],
  ["ἐξελθόντι", "tendo-saído"],
  ["ἐξελκόμενος", "sendo-arrastado-para-fora"],

  // --- ἐξεν-/ἐξεπ- palavras ---
  ["ἐξενέγκατε", "trazei-para-fora"],
  ["ἐξενεγκεῖν", "trazer-para-fora"],
  ["ἐξενοδόχησεν", "hospedou-estrangeiros"],
  ["ἐξεπέσατε", "caístes-fora"],
  ["ἐξεπέτασα", "estendi"],
  ["ἐξεπήδησαν", "saltaram-para-fora"],
  ["ἐξεπλάγησαν", "ficaram-atônitos"],
  ["ἐξεπλήσσετο", "ficava-atônito"],
  ["ἐξεπλεύσαμεν", "navegamos-para-fora"],
  ["ἐξεπορεύοντο", "saíam"],
  ["ἐξεπτύσατε", "desprezastes"],

  // --- ἐξερ-/ἐξεσ-/ἐξετ-/ἐξεχ- palavras ---
  ["ἐξερχομένων", "saindo"],
  ["ἐξερχόμενος", "saindo"],
  ["ἐξερχώμεθα", "saiamos"],
  ["ἐξεστακέναι", "estar-fora-de-si"],
  ["ἐξετάσαι", "examinar"],
  ["ἐξετείνατε", "estendestes"],
  ["ἐξεχύθη", "foi-derramado"],
  ["ἐξεχύθησαν", "foram-derramados"],
  ["ἐξεχύννετο", "era-derramado"],

  // --- ἐξηγ-/ἐξηγ-/ἐξηπ-/ἐξηρ- palavras ---
  ["ἐξηγεῖτο", "narrava"],
  ["ἐξηγησάμενος", "tendo-narrado"],
  ["ἐξηγουμένων", "narrando"],
  ["ἐξηγοῦντο", "narravam"],
  ["ἐξηγόρασεν", "resgatou"],
  ["ἐξηπάτησέν", "enganou"],
  ["ἐξηπάτησεν", "enganou"],
  ["ἐξηράνθη", "secou-se"],
  ["ἐξηραύνησαν", "esquadrinharam"],
  ["ἐξηρτισμένος", "tendo-sido-completado"],

  // --- ἐξισ-/ἐξοι-/ἐξολ-/ἐξομ- palavras ---
  ["ἐξιστάνων", "fazendo-ficar-fora-de-si"],
  ["ἐξισχύσητε", "tenhais-plena-força"],
  ["ἐξοίσουσίν", "carregarão-para-fora"],
  ["ἐξολεθρευθήσεται", "será-completamente-destruído"],
  ["ἐξομολογήσεται", "confessará"],
  ["ἐξομολογήσηται", "confesse"],
  ["ἐξομολογήσομαί", "confessarei"],
  ["ἐξομολογεῖσθε", "confessai"],

  // --- ἐξορ-/ἐξουδ-/ἐξουθ- palavras ---
  ["ἐξορκιστῶν", "exorcistas"],
  ["ἐξουδενηθῇ", "seja-desprezado"],
  ["ἐξουθενήσας", "tendo-desprezado"],
  ["ἐξουθενήσατε", "desprezastes"],
  ["ἐξουθενήσῃ", "despreze"],
  ["ἐξουθενείτω", "que-não-despreze"],
  ["ἐξουθενεῖς", "desprezas"],
  ["ἐξουθενεῖτε", "desprezais"],
  ["ἐξουθενηθεὶς", "tendo-sido-desprezado"],
  ["ἐξουθενημένα", "tendo-sido-desprezadas"],
  ["ἐξουθενημένος", "tendo-sido-desprezado"],
  ["ἐξουθενημένους", "tendo-sido-desprezados"],
  ["ἐξουθενοῦντας", "desprezando"],

  // --- ἐξουσ- palavras ---
  ["ἐξουσία", "autoridade"],
  ["ἐξουσίαι", "autoridades"],
  ["ἐξουσιάζοντες", "exercendo-autoridade"],
  ["ἐξουσιασθήσομαι", "serei-dominado"],
  ["ἐξουσιῶν", "autoridades"],

  // --- ἐξοχ-/ἐξυπ-/ἐξυρ-/ἐξωμ-/ἐξόδ-/ἐξῃ-/ἐξῄ-/ἐξῆ-/ἐξῶ- palavras ---
  ["ἐξοχὴν", "eminência"],
  ["ἐξυπνίσω", "despertarei"],
  ["ἐξυρημένῃ", "tendo-sido-rapada"],
  ["ἐξωμολόγησεν", "confessou"],
  ["ἐξόδου", "saída"],
  ["ἐξῃτήσατο", "pediu"],
  ["ἐξῄεσαν", "saíam"],
  ["ἐξῆλθες", "saíste"],
  ["ἐξῶσαι", "empurrar-para-fora"],
  ["ἐξῶσεν", "empurrou-para-fora"],

  // --- ἐπάγ-/ἐπάν-/ἐπάξ-/ἐπάρ- palavras ---
  ["ἐπάγγελμα", "promessa"],
  ["ἐπάγοντες", "trazendo-sobre"],
  ["ἐπάναγκες", "necessariamente"],
  ["ἐπάξας", "tendo-trazido-sobre"],
  ["ἐπάρασά", "tendo-eu-amaldiçoado"],
  ["ἐπάρατοί", "malditos"],

  // --- ἐπέ- palavras ---
  ["ἐπέβαλλεν", "lançava-sobre"],
  ["ἐπέβην", "embarquei"],
  ["ἐπέβλεψεν", "olhou-sobre"],
  ["ἐπέγνωμεν", "reconhecemos-plenamente"],
  ["ἐπέθεντο", "colocaram-sobre"],
  ["ἐπέθηκέν", "colocou-sobre"],
  ["ἐπέκειλαν", "encalharam"],
  ["ἐπέκεινα", "além-de"],
  ["ἐπέκειντο", "pressionavam-sobre"],
  ["ἐπέκειτο", "pressionava-sobre"],
  ["ἐπέκρινεν", "sentenciou"],
  ["ἐπέλειχον", "lambiam"],
  ["ἐπέλυεν", "resolvia"],
  ["ἐπέμεινα", "permaneci"],
  ["ἐπέμενεν", "permanecia"],
  ["ἐπέμενον", "permaneciam"],
  ["ἐπέμφθη", "foi-enviado"],
  ["ἐπέμψαμεν", "enviamos"],
  ["ἐπέμψατε", "enviastes"],
  ["ἐπένευσεν", "consentiu-com-aceno"],
  ["ἐπέπεσαν", "caíram-sobre"],
  ["ἐπέσπειρεν", "semeou-sobre"],
  ["ἐπέστειλα", "escrevi"],
  ["ἐπέσχεν", "deteve"],
  ["ἐπέταξας", "ordenaste"],
  ["ἐπέτυχον", "obtiveram"],
  ["ἐπέφωσκεν", "amanhecia"],
  ["ἐπέχοντες", "retendo"],
  ["ἐπέχρισέν", "ungiu-sobre"],
  ["ἐπέχων", "dando-atenção"],

  // --- ἐπή- palavras ---
  ["ἐπήκουσά", "ouvi"],
  ["ἐπήρθη", "foi-levantado"],
  ["ἐπήρκεσεν", "socorreu"],

  // --- ἐπί palavras ---
  ["ἐπί", "sobre"],
  ["ἐπίασαν", "prenderam"],
  ["ἐπίασεν", "prendeu"],
  ["ἐπίγνωσις", "pleno-conhecimento"],
  ["ἐπίθες", "coloca-sobre"],
  ["ἐπίκειται", "está-colocado-sobre"],
  ["ἐπίλοιπον", "restante"],
  ["ἐπίμενε", "permanece"],
  ["ἐπίνοια", "pensamento"],
  ["ἐπίομεν", "bebemos"],
  ["ἐπίπρασκον", "vendiam"],
  ["ἐπίσημοι", "notáveis"],
  ["ἐπίσημον", "notável"],
  ["ἐπίστασίς", "conspiração"],
  ["ἐπίστασιν", "conhecimento-pleno"],
  ["ἐπίστευεν", "cria"],
  ["ἐπίστηθι", "apresenta-te"],
  ["ἐπίσχυον", "insistiam"],

  // --- ἐπαί-/ἐπαγ- palavras ---
  ["ἐπαίδευον", "disciplinavam"],
  ["ἐπαίρεται", "levanta-se"],
  ["ἐπαίροντας", "levantando"],
  ["ἐπαγαγεῖν", "trazer-sobre"],
  ["ἐπαγγέλματα", "promessas"],
  ["ἐπαγγειλάμενον", "tendo-prometido"],
  ["ἐπαγγελίαις", "promessas"],
  ["ἐπαγγελίᾳ", "promessa"],
  ["ἐπαγγελλομέναις", "prometendo"],
  ["ἐπαγωνίζεσθαι", "lutar-em-favor-de"],
  ["ἐπαθροιζομένων", "ajuntando-se-sobre"],
  ["ἐπαιδεύθη", "foi-disciplinado"],
  ["ἐπαινέσω", "louvarei"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11aj (freq 1, parte 36/44) ===`);
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

console.log(`\n=== Resultado Lote 11aj ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

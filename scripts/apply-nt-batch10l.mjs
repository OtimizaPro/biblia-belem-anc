#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10l
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 12/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10l-${Date.now()}.sql`);

const translations = [
  // === Índices 2728-2970 de freq2-words.json (243 palavras) ===
  // === ÚLTIMO LOTE (parte 12/12) ===

  // --- ἡ- palavras ---
  ["ἡδονῶν", "prazeres"],
  ["ἡδύοσμον", "hortelã"],
  ["ἡλίκον", "quão-grande"],
  ["ἡλικίας", "estatura"],
  ["ἡλικίᾳ", "estatura"],
  ["ἡνίκα", "quando"],
  ["ἡσυχίᾳ", "quietude"],
  ["ἡτοίμασας", "preparaste"],
  ["ἡτοίμασται", "tem-sido-preparado"],
  ["ἡτοιμασμένον", "tendo-sido-preparado"],

  // --- ἤ- palavras (aoristo/imperfeito com aumento) ---
  ["ἤγγισαν", "aproximaram-se"],
  ["ἤκουσα", "ouvi"],
  ["ἤλειψεν", "ungiu"],
  ["ἤνοιξέν", "abriu"],
  ["ἤτω", "seja"],
  ["ἤφιεν", "deixava"],
  ["ἤχθη", "foi-conduzido"],

  // --- ἥ- palavras ---
  ["ἥγημαι", "tenho-considerado"],
  ["ἥλων", "cravos"],
  ["ἥξουσιν", "virão"],
  ["ἥττημα", "derrota"],
  ["ἥψαντο", "tocaram"],

  // --- ἦ- palavras ---
  ["ἦσθα", "eras"],
  ["ἦχος", "som"],

  // --- ἧ- palavras ---
  ["ἧσσον", "menos"],

  // --- Ἠ/Ἡ- nomes próprios e maiúsculas ---
  ["Ἠγέρθη", "Foi-levantado"],
  ["Ἠκολούθει", "Seguia"],
  ["Ἡρῳδιάδα", "Herodíade"],
  ["Ἡρῴδην", "Herodes"],
  ["Ἡσαΐαν", "Isaías"],
  ["Ἤγγικεν", "Tem-se-aproximado"],
  ["Ἤκουον", "Ouviam"],
  ["Ἤκουσαν", "Ouviram"],
  ["Ἤρξατο", "Começou"],
  ["Ἥξει", "Virá"],
  ["Ἦμεν", "Éramos"],
  ["Ἦραν", "Levantaram"],

  // --- ἰ- palavras ---
  ["ἰδίαις", "próprias"],
  ["ἰδιώτης", "leigo"],
  ["ἰδιῶται", "leigos"],
  ["ἰδών", "tendo-visto"],
  ["ἰσχυροί", "fortes"],
  ["ἰσχυροῦ", "forte"],
  ["ἰσχύοντες", "sendo-fortes"],
  ["ἰσχύσαμεν", "fomos-capazes"],
  ["ἰσχύω", "sou-capaz"],
  ["ἰσχύϊ", "força"],
  ["ἰχθύδια", "peixinhos"],
  ["ἰχθύος", "peixe"],
  ["ἰχθὺν", "peixe"],
  ["ἰὸς", "veneno"],
  ["ἰᾶσθαι", "curar"],
  ["ἰᾶτο", "curava"],

  // --- ἱ- palavras ---
  ["ἱεράτευμα", "sacerdócio"],
  ["ἱερέα", "sacerdote"],
  ["ἱερέων", "sacerdotes"],
  ["ἱερεῦσιν", "sacerdotes"],
  ["ἱερωσύνης", "sacerdócio"],
  ["ἱερὰ", "sagradas"],
  ["ἱκανοί", "suficientes"],
  ["ἱκανόν", "suficiente"],
  ["ἱκανός", "suficiente"],
  ["ἱκανὰς", "suficientes"],
  ["ἱκανῷ", "suficiente"],
  ["ἱλαστήριον", "propiciatório"],
  ["ἱματισμένον", "tendo-sido-vestido"],
  ["ἱματισμῷ", "vestuário"],
  ["ἱππεῖς", "cavaleiros"],

  // --- ἴ- palavras ---
  ["ἴδω", "veja"],
  ["ἴσα", "iguais"],
  ["ἴσχυεν", "era-capaz"],

  // --- Ἰ- nomes próprios ---
  ["Ἰάειρος", "Jairo"],
  ["Ἰάσονος", "Jasão"],
  ["Ἰάσων", "Jasão"],
  ["Ἰακώβῳ", "Jacó"],
  ["Ἰερειχὼ", "Jericó"],
  ["Ἰεσσαὶ", "Jessé"],
  ["Ἰκόνιον", "Icônio"],
  ["Ἰορδάνην", "Jordão"],
  ["Ἰορδάνῃ", "Jordão"],
  ["Ἰουδαία", "Judeia"],
  ["Ἰουδαϊσμῷ", "Judaísmo"],
  ["Ἰουδαῖον", "Judeu"],
  ["Ἰοῦστος", "Justo"],
  ["Ἰσκαριώτου", "Iscariotes"],
  ["Ἰσκαριὼθ", "Iscariotes"],
  ["Ἰσραηλείτης", "Israelita"],
  ["Ἰταλίαν", "Itália"],
  ["Ἰταλίας", "Itália"],
  ["Ἰωάνα", "Joana"],
  ["Ἰωνᾶς", "Jonas"],
  ["Ἰόππης", "Jope"],

  // --- Ἱ- nomes próprios ---
  ["Ἱερειχώ", "Jericó"],
  ["Ἱερειχὼ", "Jericó"],

  // --- ὀ- palavras ---
  ["ὀγδοήκοντα", "oitenta"],
  ["ὀγδόῃ", "oitavo"],
  ["ὀδυνώμενοι", "sendo-atormentados"],
  ["ὀδόντας", "dentes"],
  ["ὀθόνην", "lençol"],
  ["ὀλίγας", "poucas"],
  ["ὀλίγος", "pouco"],
  ["ὀλίγων", "poucos"],
  ["ὀμόσαι", "jurar"],
  ["ὀνειδίσωσιν", "injuriem"],
  ["ὀνικὸς", "de-moinho"],
  ["ὀνομάτων", "nomes"],
  ["ὀπτασίαν", "visão"],
  ["ὀργισθεὶς", "tendo-se-irado"],
  ["ὀργυιὰς", "braças"],
  ["ὀρθῶς", "retamente"],
  ["ὀσμὴ", "aroma"],
  ["ὀστέων", "ossos"],
  ["ὀσφύος", "lombo"],
  ["ὀφείλετε", "deveis"],
  ["ὀφείλουσιν", "devem"],
  ["ὀφειλόμενον", "sendo-devido"],
  ["ὀφειλὴν", "dívida"],
  ["ὀφθαλμῶν", "olhos"],
  ["ὀψάριον", "peixinho"],
  ["ὀψαρίων", "peixinhos"],
  ["ὀψωνίοις", "soldos"],

  // --- ὁ- palavras ---
  ["ὁδηγοὶ", "guias"],
  ["ὁδούς", "caminhos"],
  ["ὁλοκαυτώματα", "holocaustos"],
  ["ὁμοιότητα", "semelhança"],
  ["ὁμολογήσει", "confessará"],
  ["ὁμολογεῖ", "confessa"],
  ["ὁμολογοῦσιν", "confessam"],
  ["ὁποῖος", "de-que-tipo"],
  ["ὁράματι", "visão"],
  ["ὁράματος", "visão"],
  ["ὁρίοις", "limites"],
  ["ὁρμὴ", "ímpeto"],
  ["ὁρῶ", "vejo"],
  ["ὁσάκις", "quantas-vezes"],
  ["ὁσιότητι", "santidade"],

  // --- ὄ- palavras ---
  ["ὄξος", "vinagre"],
  ["ὄρεσιν", "montes"],
  ["ὄρη", "montes"],
  ["ὄρνις", "galinha"],
  ["ὄφεων", "serpentes"],
  ["ὄψομαι", "verei"],

  // --- ὅ- palavras ---
  ["ὅπλων", "armas"],
  ["ὅρκον", "juramento"],
  ["ὅρκου", "juramento"],
  ["ὅρκῳ", "juramento"],

  // --- Ὀ/Ὄ/Ὅ- maiúsculas ---
  ["Ὀνησιφόρου", "Onesíforo"],
  ["Ὀρθῶς", "Retamente"],
  ["Ὄντως", "Verdadeiramente"],
  ["Ὄψονται", "Verão"],
  ["Ὅσιόν", "Santo"],

  // --- ὑ- palavras ---
  ["ὑγιαίνοντα", "sendo-saudável"],
  ["ὑετὸν", "chuva"],
  ["ὑμέτερον", "vosso"],
  ["ὑμετέρας", "vossa"],
  ["ὑμετέρῳ", "vosso"],
  ["ὑμνήσαντες", "tendo-cantado-hinos"],
  ["ὑπέδειξεν", "mostrou"],
  ["ὑπέμεινεν", "perseverou"],
  ["ὑπέρογκα", "arrogantes"],
  ["ὑπέστρεφον", "retornavam"],
  ["ὑπήντησαν", "encontraram"],
  ["ὑπακούει", "obedece"],
  ["ὑπακοῇ", "obediência"],
  ["ὑπαντῆσαι", "encontrar"],
  ["ὑπεδέξατο", "acolheu"],
  ["ὑπενόουν", "supunham"],
  ["ὑπεπλεύσαμεν", "navegamos-sob"],
  ["ὑπεραίρωμαι", "me-exalte"],
  ["ὑπερβάλλον", "excedente"],
  ["ὑπερβάλλουσαν", "excedente"],
  ["ὑπερεκπερισσοῦ", "superabundantemente"],
  ["ὑπερηφάνοις", "soberbos"],
  ["ὑπερηφάνους", "soberbos"],
  ["ὑπερλίαν", "super-eminentes"],
  ["ὑπερῴῳ", "quarto-superior"],
  ["ὑπερῷον", "quarto-superior"],
  ["ὑπεστειλάμην", "retraí-me"],
  ["ὑπηκούσατε", "obedecestes"],
  ["ὑπηρέτην", "servo"],
  ["ὑπηρέτῃ", "servo"],
  ["ὑποδείγματι", "exemplo"],
  ["ὑποκρίσει", "hipocrisia"],
  ["ὑποκριτά", "hipócrita"],
  ["ὑποκριταὶ", "hipócritas"],
  ["ὑποκριτῶν", "hipócritas"],
  ["ὑπομένει", "persevera"],
  ["ὑπομενεῖτε", "perseverareis"],
  ["ὑποπόδιόν", "estrado"],
  ["ὑποστάσει", "confiança"],
  ["ὑποστάσεως", "confiança"],
  ["ὑποστρέψαι", "retornar"],
  ["ὑποστρέψασαι", "tendo-retornado"],
  ["ὑποτάγητε", "sujeitai-vos"],
  ["ὑποτάξαι", "sujeitar"],
  ["ὑποτασσόμεναι", "sujeitando-se"],
  ["ὑποτασσόμενοι", "sujeitando-se"],
  ["ὑποτύπωσιν", "modelo"],
  ["ὑπόδημα", "sandália"],
  ["ὑπῆγον", "iam"],
  ["ὑπῆρχον", "existiam"],
  ["ὑστερηκέναι", "ter-faltado"],
  ["ὑψηλὰ", "altas"],
  ["ὑψωθήσῃ", "serás-exaltado"],
  ["ὑψωθῆναι", "ser-exaltado"],
  ["ὑψώσει", "exaltará"],
  ["ὑψῶν", "exaltando"],

  // --- ὕ- palavras ---
  ["ὕμνοις", "hinos"],
  ["ὕπνῳ", "sono"],
  ["ὕψος", "altura"],
  ["ὕψους", "altura"],
  ["ὕψωμα", "altivez"],

  // --- Ὑ- maiúsculas ---
  ["Ὑμέναιος", "Himeneu"],
  ["Ὑπάγω", "Vou"],

  // --- ὠ- palavras ---
  ["ὠδίνων", "dores-de-parto"],
  ["ὠνείδιζον", "injuriavam"],
  ["ὠνόμασεν", "nomeou"],
  ["ὠρχήσασθε", "dançastes"],
  ["ὠτάριον", "orelha"],
  ["ὠτίον", "orelha"],
  ["ὠφέλιμος", "proveitoso"],
  ["ὠφεληθῇς", "sejas-beneficiado"],

  // --- ὡ- palavras ---
  ["ὡραῖοι", "formosos"],

  // --- ὤ- palavras ---
  ["ὤμοσα", "jurei"],
  ["ὤμους", "ombros"],

  // --- Ὡ/Ὥ/Ὦ- maiúsculas ---
  ["Ὡμοιώθη", "Foi-comparado"],
  ["Ὡσαννά", "Hosana"],
  ["Ὡσαύτως", "Do-mesmo-modo"],
  ["Ὥστε", "De-modo-que"],
  ["Ὦ", "Ó"],

  // --- ᾄ- palavras ---
  ["ᾄδοντες", "cantando"],

  // --- ᾐ- palavras ---
  ["ᾐτήσαντο", "pediram"],
  ["ᾐτοῦντο", "pediam"],

  // --- ᾠ- palavras ---
  ["ᾠδαῖς", "cânticos"],

  // --- ῥ- palavras ---
  ["ῥάκους", "pano"],
  ["ῥήξει", "romperá"],
  ["ῥαφίδος", "agulha"],
  ["ῥύμην", "rua"],
  ["ῥύσει", "livrará"],

  // --- Ῥ- nomes próprios ---
  ["Ῥαββουνεί", "Rabôni"],
  ["Ῥαὰβ", "Raabe"],
  ["Ῥωμαίοις", "Romanos"],
  ["Ῥωμαῖοι", "Romanos"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10l (freq 2, parte 12/12) ===`);
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

console.log(`\n=== Resultado Lote 10l ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

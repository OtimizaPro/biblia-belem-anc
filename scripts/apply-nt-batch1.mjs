#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 1
 * Aplica traduções literais para as 80 palavras gregas mais frequentes sem tradução no NT
 * Filosofia: literalidade rígida, palavra por palavra
 */

import { execSync } from 'child_process';

const DB = 'biblia-belem';

const translations = [
  // freq 17
  ["τοῦτ'", "isto"],
  // freq 11
  ["Ἱεροσολύμων", "Jerusalém"],
  ["Ἰορδάνου", "Jordão"],
  ["ἴδητε", "vejais"],
  ["ἰδίου", "próprio"],
  ["ἤμελλεν", "estava-prestes-a"],
  ["Ἔλεγεν", "Dizia"],
  ["ἔχῃ", "tenha"],
  ["ἔχητε", "tenhais"],
  ["ἔστω", "seja"],
  ["ἑτέρῳ", "a-outro"],
  ["ἐφανερώθη", "foi-manifestado"],
  ["ἐμὴ", "minha"],
  ["ἐλπίδι", "esperança"],
  ["ἐκάθισεν", "sentou-se"],
  ["ἐκάθητο", "sentava-se"],
  ["Ἀντιόχειαν", "Antioquia"],
  ["ἀφεθήσεται", "será-perdoado"],
  ["ἀπελθεῖν", "ir-embora"],
  ["ἀμπελῶνα", "vinha"],
  ["ἀδελφούς", "irmãos"],
  ["τροφῆς", "alimento"],
  ["τέρατα", "prodígios"],
  ["σπείρων", "o-que-semeia"],
  ["σαββάτων", "sábados"],
  ["πόσῳ", "quanto"],
  ["πλήρωμα", "plenitude"],
  ["πετεινὰ", "aves"],
  ["παιδία", "crianças"],
  ["οὐδέποτε", "nunca"],
  ["οἶκόν", "casa"],
  ["μητρὸς", "mãe"],
  ["μετάνοιαν", "arrependimento"],
  ["μακρὰν", "longe"],
  ["μάχαιραν", "espada"],
  ["λελάληκα", "tenho-falado"],
  ["καθίσας", "sentando-se"],
  ["θυγάτηρ", "filha"],
  ["εἴη", "seria"],
  ["εἰσῆλθον", "entraram"],
  ["δωρεὰν", "gratuitamente"],
  ["δαιμόνιον", "demônio"],
  ["γυναῖκας", "mulheres"],
  ["Μακεδονίαν", "Macedônia"],
  ["Ζεβεδαίου", "Zebedeu"],
  // freq 10
  ["ὕστερον", "depois"],
  ["ὑποκριταί", "hipócritas"],
  ["ὄψεσθε", "vereis"],
  ["Ἰουδαῖος", "judeu"],
  ["Ἰουδαίᾳ", "Judeia"],
  ["ἰδίοις", "próprios"],
  ["Ἡσαΐας", "Isaías"],
  ["ἦραν", "levantaram"],
  ["ἠκούσαμεν", "ouvimos"],
  ["Ἐλαιῶν", "Oliveiras"],
  ["ἐφοβοῦντο", "temiam"],
  ["ἐσθίων", "comendo"],
  ["ἐσθίει", "come"],
  ["ἐποίησα", "fiz"],
  ["ἐπιθυμίαις", "desejos"],
  ["ἐπηρώτα", "perguntava"],
  ["ἐπίγνωσιν", "conhecimento-pleno"],
  ["ἐξελέξατο", "escolheu"],
  ["ἐντολὴ", "mandamento"],
  ["ἐκβάλλει", "expulsa"],
  ["ἐκάλεσεν", "chamou"],
  ["ἅπαντες", "todos"],
  ["ἅμα", "juntamente"],
  ["ἄρτος", "pão"],
  ["ἄλλῳ", "a-outro"],
  ["ἀρχιερέων", "sumos-sacerdotes"],
  ["ἀπολῦσαι", "soltar"],
  ["ἀπολέσει", "destruirá"],
  ["ἀπήγγειλεν", "anunciou"],
  ["ἀπέκτειναν", "mataram"],
  ["ἀνδρὸς", "homem"],
  ["ἀνέγνωτε", "lestes"],
  ["ἀμπελῶνος", "vinha"],
  ["ἀγαπῶμεν", "amemos"],
  ["χιλίαρχος", "quiliarca"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 1 ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");

    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;

    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const parsed = JSON.parse(result);
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;

    if (changes > 0) {
      process.stdout.write(`✓ ${word} → ${translation} (${changes})\n`);
      success++;
    } else {
      process.stdout.write(`· ${word} → ${translation} (0 - já traduzido ou não encontrado)\n`);
      success++;
    }
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

console.log(`\n=== Resultado ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

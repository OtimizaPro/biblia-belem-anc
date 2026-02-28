#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11e
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 5/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11e-${Date.now()}.sql`);

const translations = [
  // === Índices 992-1239 de freq1-words.json (248 palavras) ===

  // --- β- palavras (continuação) ---
  ["βρύει", "brota"],
  ["βρώματί", "alimento"],
  ["βρώματος", "alimento"],
  ["βρώσει", "alimento"],
  ["βρώσιμον", "comestível"],
  ["βρῶμά", "alimento"],
  ["βυθίζεσθαι", "serem-submergidos"],
  ["βυθίζουσιν", "submergem"],
  ["βυθῷ", "abismo"],
  ["βυρσέως", "curtidor"],
  ["βωμὸν", "altar"],
  ["βόησον", "clama"],
  ["βόσκειν", "apascentar"],
  ["βύσσον", "linho-fino"],

  // --- γ- palavras ---
  ["γάγγραινα", "gangrena"],
  ["γάζης", "Gaza"],
  ["γάμον", "casamento"],
  ["γάμος", "casamento"],
  ["γάμων", "casamento"],
  ["γέγοναν", "tornaram-se"],
  ["γέλως", "riso"],
  ["γένεσις", "origem"],
  ["γένηταί", "aconteça"],
  ["γένοιτό", "seja"],
  ["γέρων", "ancião"],
  ["γήμας", "tendo-casado"],
  ["γήμῃ", "case"],
  ["γήρει", "velhice"],
  ["γίνωνται", "tornem-se"],
  ["γίνωσκε", "conhece"],
  ["γαζοφυλακίου", "tesouro"],
  ["γαζοφυλακίῳ", "tesouro"],
  ["γαμήσας", "tendo-casado"],
  ["γαμήσασα", "tendo-casado"],
  ["γαμήσῃς", "cases"],
  ["γαμίζοντες", "dando-em-casamento"],
  ["γαμίσκονται", "são-dados-em-casamento"],
  ["γαμείτωσαν", "casem-se"],
  ["γαμηθῆναι", "ser-dada-em-casamento"],
  ["γαμησάτωσαν", "casem-se"],
  ["γαμοῦντες", "casando"],
  ["γαμῆσαι", "casar"],
  ["γαστέρες", "ventres"],
  ["γεέννῃ", "Geena"],
  ["γείτονες", "vizinhos"],
  ["γεγαμηκόσιν", "tendo-casado"],
  ["γεγενημένον", "tendo-sido-feito"],
  ["γεγεννημένα", "tendo-sido-gerados"],
  ["γεγεννημένου", "tendo-sido-gerado"],
  ["γεγενῆσθαι", "ter-sido-feito"],
  ["γεγονυῖα", "tendo-se-tornado"],
  ["γεγονότας", "tendo-se-tornado"],
  ["γεγονότι", "tendo-se-tornado"],
  ["γεγονὼς", "tendo-se-tornado"],
  ["γεγραμμένην", "tendo-sido-escrita"],
  ["γεγυμνασμένα", "tendo-sido-exercitados"],
  ["γεγυμνασμένην", "tendo-sido-exercitada"],
  ["γεγυμνασμένοις", "tendo-sido-exercitados"],
  ["γεγόνει", "tinha-se-tornado"],
  ["γελάσετε", "rireis"],
  ["γελῶντες", "rindo"],
  ["γεμίζεσθαι", "ser-enchido"],
  ["γεμίσαι", "encher"],
  ["γεμίσας", "tendo-enchido"],
  ["γεμισθῇ", "seja-enchido"],
  ["γενέσει", "nascimento"],
  ["γενέσθω", "aconteça"],
  ["γενήθητε", "tornai-vos"],
  ["γενήματα", "frutos"],
  ["γενεαί", "gerações"],
  ["γενεαλογίαις", "genealogias"],
  ["γενεαλογίας", "genealogias"],
  ["γενεαλογούμενος", "sendo-genealogizado"],
  ["γενετῆς", "nascimento"],
  ["γενηθέντας", "tendo-se-tornado"],
  ["γενηθέντων", "tendo-se-tornado"],
  ["γενηθῆναι", "tornar-se"],
  ["γενηθῶμεν", "tornemo-nos"],
  ["γενησόμενον", "havendo-de-acontecer"],
  ["γεννήσαντα", "tendo-gerado"],
  ["γεννήσει", "gerará"],
  ["γεννήσῃ", "gere"],
  ["γεννηθέντος", "tendo-sido-gerado"],
  ["γεννηθέντων", "tendo-sido-gerados"],
  ["γεννηθὲν", "tendo-sido-gerado"],
  ["γεννώμενον", "sendo-gerado"],
  ["γεννᾶται", "é-gerado"],
  ["γεννῶσα", "gerando"],
  ["γεννῶσιν", "geram"],
  ["γενώμεθα", "tornemo-nos"],
  ["γερουσίαν", "conselho-de-anciãos"],
  ["γεωργεῖται", "é-cultivada"],
  ["γεωργούς", "lavradores"],
  ["γεωργός", "lavrador"],
  ["γεωργὸν", "lavrador"],
  ["γεωργὸς", "lavrador"],
  ["γεωργῶν", "lavradores"],
  ["γεύσεταί", "provará"],
  ["γεύσῃ", "proves"],
  ["γεώργιον", "lavoura"],
  ["γηράσκον", "envelhecendo"],
  ["γηράσῃς", "envelheças"],
  ["γινομένας", "acontecendo"],
  ["γινομένη", "acontecendo"],
  ["γινομένοις", "acontecendo"],
  ["γινομένου", "acontecendo"],
  ["γινομένων", "acontecendo"],
  ["γινομένῃ", "acontecendo"],
  ["γινωσκομένη", "sendo-conhecida"],
  ["γινόμεναι", "acontecendo"],
  ["γινώσκειν", "conhecer"],
  ["γινώσκητε", "conheçais"],
  ["γινώσκουσί", "conhecem"],
  ["γινώσκουσιν", "conhecem"],
  ["γινώσκωσιν", "conheçam"],
  ["γινώσκῃ", "conheças"],
  ["γλῶσσά", "língua"],
  ["γλῶσσάν", "língua"],
  ["γλῶσσαν", "língua"],
  ["γνήσιε", "genuíno"],
  ["γνήσιον", "genuíno"],
  ["γναφεὺς", "lavandeiro"],
  ["γνησίως", "genuinamente"],
  ["γνωρίσας", "tendo-feito-conhecer"],
  ["γνωρίσουσιν", "farão-conhecer"],
  ["γνωρίσω", "farei-conhecer"],
  ["γνωρίσῃ", "faça-conhecer"],
  ["γνωριζέσθω", "seja-feito-conhecer"],
  ["γνωρισθέντος", "tendo-sido-feito-conhecer"],
  ["γνωρισθῇ", "seja-feito-conhecer"],
  ["γνωσθέντες", "tendo-sido-conhecidos"],
  ["γνωσθήτω", "seja-conhecido"],
  ["γνωσθῇ", "seja-conhecido"],
  ["γνωστοὶ", "conhecidos"],
  ["γνωστοῖς", "conhecidos"],
  ["γνωστὰ", "conhecidas"],
  ["γνωσόμεθα", "conheceremos"],
  ["γνόντα", "tendo-conhecido"],
  ["γνόφῳ", "trevas-espessas"],
  ["γνώμῃ", "parecer"],
  ["γνώσεται", "conhecerá"],
  ["γνώσονται", "conhecerão"],
  ["γνώστην", "conhecedor"],
  ["γνώσῃ", "conheças"],
  ["γνώτω", "conheça"],
  ["γνῶ", "conheça"],
  ["γνῶναί", "conhecer"],
  ["γογγυσμοῦ", "murmuração"],
  ["γογγυσμῶν", "murmurações"],
  ["γογγυσταί", "murmuradores"],
  ["γογγύζοντος", "murmurando"],
  ["γογγύζουσιν", "murmuram"],
  ["γονέων", "pais"],
  ["γονυπετήσαντες", "tendo-ajoelhado"],
  ["γονυπετήσας", "tendo-ajoelhado"],
  ["γράμμα", "letra"],
  ["γράμματι", "letra"],
  ["γράφε", "escreve"],
  ["γράφει", "escreve"],
  ["γράφεσθαι", "ser-escrito"],
  ["γράφηται", "seja-escrito"],
  ["γράφω", "escrevo"],
  ["γράφων", "escrevendo"],
  ["γράψαντες", "tendo-escrito"],
  ["γραπτὸν", "escrito"],
  ["γραφήν", "escritura"],
  ["γραφαί", "escrituras"],
  ["γραφόμενα", "sendo-escritos"],
  ["γραώδεις", "de-velhas"],
  ["γρηγορήσατε", "vigiai"],
  ["γρηγοροῦντας", "vigiando"],
  ["γρηγοροῦντες", "vigiando"],
  ["γρηγορῇ", "vigie"],
  ["γυμνασία", "exercício"],
  ["γυμνιτεύομεν", "estamos-nus"],
  ["γυμνοὺς", "nus"],
  ["γυμνοῦ", "nu"],
  ["γυμνός", "nu"],
  ["γυμνότης", "nudez"],
  ["γυμνότητι", "nudez"],
  ["γυμνὰ", "nus"],
  ["γυμνὸς", "nu"],
  ["γυναικάρια", "mulherzinhas"],
  ["γυναικείῳ", "feminino"],
  ["γυναικὸς", "mulher"],
  ["γυναιξὶ", "mulheres"],
  ["γωνίᾳ", "esquina"],
  ["γόητες", "impostores"],
  ["γόμον", "carga"],
  ["γόνασιν", "joelhos"],
  ["γόνατά", "joelhos"],
  ["γύμναζε", "exercita"],

  // --- δ- palavras ---
  ["δάκνετε", "mordeis"],
  ["δάνειον", "empréstimo"],
  ["δέδεκται", "tem-recebido"],
  ["δέδεμαι", "tenho-sido-amarrado"],
  ["δέδεσαι", "tens-sido-amarrado"],
  ["δέδωκας", "tens-dado"],
  ["δέησίς", "súplica"],
  ["δέκατος", "décimo"],
  ["δένδρον", "árvore"],
  ["δέξαι", "recebe"],
  ["δέξασθέ", "recebei"],
  ["δέξωνταί", "recebam"],
  ["δέξωνται", "recebam"],
  ["δέους", "temor"],
  ["δέρει", "bate"],
  ["δέρεις", "bates"],
  ["δέρμασιν", "peles"],
  ["δέσμας", "feixes"],
  ["δέσμιοι", "prisioneiros"],
  ["δέχηται", "receba"],
  ["δέχονται", "recebem"],
  ["δή", "pois"],
  ["δήμῳ", "povo"],
  ["δήποτε", "alguma-vez"],
  ["δήπου", "certamente"],
  ["δήσας", "tendo-amarrado"],
  ["δήσατε", "amarrai"],
  ["δήσητε", "amarreis"],
  ["δήσουσιν", "amarrarão"],
  ["δήσῃς", "amarres"],
  ["δίδαξον", "ensina"],
  ["δίδωσίν", "dá"],
  ["δίκαιε", "justo"],
  ["δίκαιόν", "justo"],
  ["δίς", "duas-vezes"],
  ["δίψει", "sede"],
  ["δίψυχοι", "de-dupla-mente"],
  ["δίψυχος", "de-dupla-mente"],
  ["δαίμονες", "demônios"],
  ["δαιμονίζεται", "é-endemoninhado"],
  ["δαιμονίοις", "demônios"],
  ["δαιμονιζομένου", "sendo-endemoninhado"],
  ["δαιμονιζομένων", "sendo-endemoninhados"],
  ["δαιμονιζομένῳ", "sendo-endemoninhado"],
  ["δαιμονιζόμενοι", "sendo-endemoninhados"],
  ["δαιμονιζόμενος", "sendo-endemoninhado"],
  ["δαιμονισθείς", "tendo-sido-endemoninhado"],
  ["δαιμονισθεὶς", "tendo-sido-endemoninhado"],
  ["δαιμονιώδης", "demoníaca"],
  ["δακτύλιον", "anel"],
  ["δακτύλου", "dedo"],
  ["δακτύλους", "dedos"],
  ["δακτύλων", "dedos"],
  ["δαμάζεται", "é-domada"],
  ["δαμάλεως", "novilha"],
  ["δανίζετε", "emprestais"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11e (freq 1, parte 5/44) ===`);
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

console.log(`\n=== Resultado Lote 11e ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

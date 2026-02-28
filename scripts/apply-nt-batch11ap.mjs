#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ap
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 42/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ap-${Date.now()}.sql`);

const translations = [
  // === Palavras de freq1-slice-ap.json (248 palavras) ===

  // --- Ἱ- palavras (nomes próprios e substantivos) ---
  ["Ἱερεμίου", "Jeremias"],
  ["Ἱεροσολυμειτῶν", "Jerosolimitas"],
  ["Ἱεροσολυμεῖται", "Jerosolimitas"],
  ["Ἱκανοῦ", "Suficiente"],
  ["Ἱκανόν", "Suficiente"],
  ["Ἵλεώς", "Propício"],

  // --- ὀ- palavras ---
  ["ὀδυνᾶσαι", "sofres-dor"],
  ["ὀδυνῶμαι", "sofro-dor"],
  ["ὀδυρμόν", "lamento"],
  ["ὀδυρμὸς", "lamento"],
  ["ὀδόντα", "dente"],
  ["ὀδόντος", "dente"],
  ["ὀδύναις", "dores"],
  ["ὀδύνη", "dor"],
  ["ὀθονίοις", "faixas-de-linho"],
  ["ὀθονίων", "faixas-de-linho"],
  ["ὀκνήσῃς", "hesites"],
  ["ὀκνηρέ", "preguiçoso"],
  ["ὀκνηροί", "preguiçosos"],
  ["ὀκνηρόν", "preguiçoso"],
  ["ὀκταήμερος", "de-oito-dias"],
  ["ὀκτώ", "oito"],
  ["ὀλίγα", "poucas-coisas"],
  ["ὀλίγαι", "poucas"],
  ["ὀλίγην", "pouca"],
  ["ὀλίγης", "pouca"],
  ["ὀλίγοις", "poucos"],
  ["ὀλίγου", "pouco"],
  ["ὀλίγως", "por-pouco"],
  ["ὀλιγοπιστίαν", "pouca-fé"],
  ["ὀλιγοψύχους", "desanimados"],
  ["ὀλιγώρει", "menospreza"],
  ["ὀλοθρευτοῦ", "destruidor"],
  ["ὀλοθρεύων", "destruindo"],
  ["ὀλολύζοντες", "lamentando-em-alta-voz"],
  ["ὀμμάτων", "olhos"],
  ["ὀμνύειν", "jurar"],
  ["ὀμνύετε", "jurais"],
  ["ὀμνύναι", "jurar"],
  ["ὀμνύουσιν", "juram"],
  ["ὀμόσῃς", "jures"],
  ["ὀνάριον", "jumentinho"],
  ["ὀναίμην", "eu-tenha-proveito"],
  ["ὀνειδίζειν", "injuriar"],
  ["ὀνειδίζεσθε", "sois-injuriados"],
  ["ὀνειδίζοντος", "injuriando"],
  ["ὀνειδιζόντων", "injuriando"],
  ["ὀνειδισμοὶ", "injúrias"],
  ["ὀνειδισμοῖς", "injúrias"],
  ["ὀνομάζειν", "nomear"],
  ["ὀνομάζεται", "é-nomeado"],
  ["ὀνομάζων", "nomeando"],
  ["ὀνομαζέσθω", "seja-nomeado"],
  ["ὀνομαζομένου", "sendo-nomeado"],
  ["ὀνομαζόμενος", "sendo-nomeado"],
  ["ὀνόματά", "nomes"],
  ["ὀξεῖς", "afiados"],
  ["ὀπαῖς", "cavernas"],
  ["ὀπτανόμενος", "aparecendo"],
  ["ὀπτασίας", "visão"],
  ["ὀπτασίᾳ", "visão"],
  ["ὀπτοῦ", "assado"],
  ["ὀπῆς", "caverna"],
  ["ὀρέγεται", "aspira"],
  ["ὀρέγονται", "aspiram"],
  ["ὀρέξει", "apetite"],
  ["ὀργίζεσθε", "irai-vos"],
  ["ὀργίλον", "irascível"],
  ["ὀργιζόμενος", "irando-se"],
  ["ὀρεγόμενοι", "aspirando"],
  ["ὀρεινὴν", "montanhosa"],
  ["ὀρεινῇ", "montanhosa"],
  ["ὀρθοποδοῦσιν", "andam-retamente"],
  ["ὀρθοτομοῦντα", "cortando-retamente"],
  ["ὀρθριναὶ", "madrugadoras"],
  ["ὀρθός", "reto"],
  ["ὀρθὰς", "retas"],
  ["ὀρφανούς", "órfãos"],
  ["ὀρφανοὺς", "órfãos"],
  ["ὀρχησαμένης", "tendo-dançado"],
  ["ὀσμῆς", "cheiro"],
  ["ὀστέα", "ossos"],
  ["ὀστράκινα", "de-barro"],
  ["ὀστρακίνοις", "de-barro"],
  ["ὀσφύας", "lombos"],
  ["ὀσφύες", "lombos"],
  ["ὀσφύϊ", "lombo"],
  ["ὀφείλημα", "dívida"],
  ["ὀφείλοντες", "devendo"],
  ["ὀφείλοντι", "devendo"],
  ["ὀφειλάς", "dívidas"],
  ["ὀφειλέταις", "devedores"],
  ["ὀφειλήματα", "dívidas"],
  ["ὀφθέντες", "tendo-aparecido"],
  ["ὀφθέντος", "tendo-aparecido"],
  ["ὀφθήσεται", "será-visto"],
  ["ὀφθήσομαί", "serei-visto"],
  ["ὀφθαλμοδουλίαις", "serviços-para-os-olhos"],
  ["ὀφθαλμοδουλίαν", "serviço-para-os-olhos"],
  ["ὀφθείς", "tendo-aparecido"],
  ["ὀφρύος", "precipício"],
  ["ὀχλοποιήσαντες", "tendo-amotinado-multidão"],
  ["ὀχλουμένους", "sendo-atormentados"],
  ["ὀχυρωμάτων", "fortalezas"],
  ["ὀψάρια", "peixinhos"],
  ["ὀψία", "tarde"],
  ["ὀψόμεθα", "veremos"],
  ["ὀψώνια", "soldos"],
  ["ὀψώνιον", "soldo"],

  // --- ὁ- palavras ---
  ["ὁδεύων", "caminhando"],
  ["ὁδηγήσει", "guiará"],
  ["ὁδηγεῖν", "guiar"],
  ["ὁδηγοί", "guias"],
  ["ὁδηγοῦ", "guia"],
  ["ὁδηγὸν", "guia"],
  ["ὁδηγῇ", "guie"],
  ["ὁδοιπορίαις", "jornadas"],
  ["ὁδοιπορίας", "jornada"],
  ["ὁδοιπορούντων", "viajando"],
  ["ὁδοὶ", "caminhos"],
  ["ὁδῶν", "caminhos"],
  ["ὁλοκαυτωμάτων", "holocaustos"],
  ["ὁλοκληρίαν", "integridade-completa"],
  ["ὁλοτελεῖς", "inteiramente"],
  ["ὁλόκληροι", "íntegros"],
  ["ὁλόκληρον", "íntegro"],
  ["ὁμίχλαι", "névoas"],
  ["ὁμειρόμενοι", "desejando-ardentemente"],
  ["ὁμιλήσας", "tendo-conversado"],
  ["ὁμιλίαι", "companhias"],
  ["ὁμιλεῖν", "conversar"],
  ["ὁμοίωσιν", "semelhança"],
  ["ὁμοιοπαθεῖς", "de-natureza-semelhante"],
  ["ὁμοιοπαθὴς", "de-natureza-semelhante"],
  ["ὁμοιωθέντες", "tendo-sido-assemelhados"],
  ["ὁμοιωθῆναι", "ser-assemelhado"],
  ["ὁμοιωθῆτε", "sejais-assemelhados"],
  ["ὁμοιώσωμεν", "assemelharemos"],
  ["ὁμολογήσαντες", "tendo-confessado"],
  ["ὁμολογήσω", "confessarei"],
  ["ὁμολογήσῃς", "confesses"],
  ["ὁμολογεῖται", "é-confessado"],
  ["ὁμολογουμένως", "confessadamente"],
  ["ὁμολογούντων", "confessando"],
  ["ὁμολογοῦντες", "confessando"],
  ["ὁμολογῶ", "confesso"],
  ["ὁμολογῶμεν", "confessemos"],
  ["ὁμολογῶν", "confessando"],
  ["ὁμότεχνον", "do-mesmo-ofício"],
  ["ὁμόφρονες", "de-mesmo-pensamento"],
  ["ὁπλίσασθε", "armai-vos"],
  ["ὁποίαν", "qual"],
  ["ὁποῖοί", "quais"],
  ["ὁποῖόν", "qual"],
  ["ὁπότε", "quando"],
  ["ὁράσεις", "visões"],
  ["ὁρίζει", "determina"],
  ["ὁρίσας", "tendo-determinado"],
  ["ὁρατὰ", "visíveis"],
  ["ὁρισθέντος", "tendo-sido-determinado"],
  ["ὁρκίζω", "conjuro"],
  ["ὁροθεσίας", "limites-determinados"],
  ["ὁρᾷ", "vê"],
  ["ὁρῶμεν", "vemos"],
  ["ὁρῶν", "vendo"],
  ["ὁρῶντες", "vendo"],
  ["ὁρῶσαι", "vendo"],
  ["ὁσίους", "santos"],
  ["ὁσίως", "santamente"],

  // --- ὂ / ὄ- palavras ---
  ["ὂν", "sendo"],
  ["ὄγδοον", "oitavo"],
  ["ὄγδοος", "oitavo"],
  ["ὄγκον", "peso"],
  ["ὄζει", "cheira-mal"],
  ["ὄλεθρος", "destruição"],
  ["ὄμματα", "olhos"],
  ["ὄνειδός", "opróbrio"],
  ["ὄνου", "jumento"],
  ["ὄπισθεν", "por-detrás"],
  ["ὄρθρον", "madrugada"],
  ["ὄρθρου", "madrugada"],
  ["ὄσφρησις", "olfato"],
  ["ὄφελόν", "oxalá"],
  ["ὄχλων", "multidões"],
  ["ὄψεται", "verá"],
  ["ὄψησθε", "vereis"],
  ["ὄψιμον", "tardio"],
  ["ὄψιν", "aparência"],

  // --- ὅ- palavras ---
  ["ὅλη", "toda"],
  ["ὅλους", "todos"],
  ["ὅμοιοί", "semelhantes"],
  ["ὅμοιοι", "semelhantes"],
  ["ὅρκος", "juramento"],
  ["ὅσια", "santas-coisas"],
  ["ὅσιον", "santo"],
  ["ὅσιος", "santo"],

  // --- Ὀ- palavras maiúsculas (nomes próprios e início de frase) ---
  ["Ὀζείαν", "Ozias"],
  ["Ὀζείας", "Ozias"],
  ["Ὀλιγόπιστε", "Pouca-fé"],
  ["Ὀλυμπᾶν", "Olimpas"],
  ["Ὀνήσιμον", "Onésimo"],
  ["Ὀνησίμῳ", "Onésimo"],
  ["Ὀστοῦν", "Osso"],
  ["Ὀφείλομεν", "Devemos"],
  ["Ὀφθαλμὸν", "Olho"],
  ["Ὀψὲ", "Tarde"],
  ["Ὁρκίζω", "Conjuro"],
  ["Ὄμβρος", "Chuva"],
  ["Ὄρθρου", "Madrugada"],
  ["Ὅλην", "Toda"],
  ["Ὅλως", "Totalmente"],
  ["Ὅστις", "Quem-quer-que"],

  // --- ὑ- palavras ---
  ["ὑάκινθος", "jacinto"],
  ["ὑβρίζεις", "ultrajas"],
  ["ὑβρίσαι", "ultrajar"],
  ["ὑβρισθέντες", "tendo-sido-ultrajados"],
  ["ὑβρισθήσεται", "será-ultrajado"],
  ["ὑβριστάς", "insolentes"],
  ["ὑβριστήν", "insolente"],
  ["ὑγιής", "são"],
  ["ὑγιαίνειν", "estar-são"],
  ["ὑγιαίνοντας", "estando-sãos"],
  ["ὑγιαίνοντες", "estando-sãos"],
  ["ὑγιαίνουσιν", "estão-sãos"],
  ["ὑγιαίνωσιν", "estejam-sãos"],
  ["ὑγιαινούσης", "sendo-sã"],
  ["ὑγιαινόντων", "estando-sãos"],
  ["ὑγιεῖς", "sãos"],
  ["ὑγρῷ", "verde"],
  ["ὑδρίαι", "talhas"],
  ["ὑδρίαν", "talha"],
  ["ὑδρίας", "talhas"],
  ["ὑδροπότει", "bebe-água"],
  ["ὑδρωπικὸς", "hidrópico"],
  ["ὑετοὺς", "chuvas"],
  ["ὑετόν", "chuva"],
  ["ὑμέτερος", "vosso"],
  ["ὑμετέρα", "vossa"],
  ["ὑμετέραν", "vossa"],
  ["ὑμετέρᾳ", "vossa"],
  ["ὑμνήσω", "hino-cantarei"],
  ["ὑπάγητε", "ide"],
  ["ὑπάγοντας", "indo"],
  ["ὑπάγοντες", "indo"],
  ["ὑπάρξεις", "posses"],
  ["ὑπάρχοντά", "pertences"],
  ["ὑπάρχοντας", "possuindo"],
  ["ὑπάρχωσιν", "existam"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ap (freq 1, parte 42/44) ===`);
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

console.log(`\n=== Resultado Lote 11ap ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

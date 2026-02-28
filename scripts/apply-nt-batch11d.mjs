#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11d
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 4/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11d-${Date.now()}.sql`);

const translations = [
  // === Índices 744-991 de freq1-words.json (248 palavras) ===

  // --- αἰχ- / αἰω- palavras ---
  ["αἰχμαλωτίζοντά", "levando-cativo"],
  ["αἰχμαλωτισθήσονται", "serão-levados-cativos"],
  ["αἰχμαλώτοις", "cativos"],
  ["αἰωνίοις", "eternos"],
  ["αἰωνίους", "eternos"],
  ["αἰώνιός", "eterno"],
  ["αἰῶνός", "era"],
  ["αἰῶσιν", "eras"],

  // --- αἱμ- palavras ---
  ["αἱματεκχυσίας", "derramamento-de-sangue"],
  ["αἱμορροοῦσα", "sofrendo-hemorragia"],

  // --- αἱρ- / αἴρ- palavras ---
  ["αἱρήσομαι", "escolherei"],
  ["αἱρετικὸν", "herético"],
  ["αἴρεται", "é-levantado"],
  ["αἴρετε", "levantai"],
  ["αἴροντος", "levantando"],
  ["αἴροντός", "levantando"],
  ["αἴρωσιν", "levantem"],
  ["αἴσθωνται", "percebam"],
  ["αἴτημα", "pedido"],
  ["αἴτιος", "causa"],
  ["αἵρεσις", "heresia"],

  // --- αὐ- palavras ---
  ["αὐγάσαι", "resplandecer"],
  ["αὐγῆς", "aurora"],
  ["αὐθάδεις", "arrogantes"],
  ["αὐθάδη", "arrogante"],
  ["αὐθαίρετοι", "por-vontade-própria"],
  ["αὐθαίρετος", "por-vontade-própria"],
  ["αὐθεντεῖν", "exercer-autoridade"],
  ["αὐλήν", "pátio"],
  ["αὐλητὰς", "flautistas"],
  ["αὐλούμενον", "sendo-tocado-flauta"],
  ["αὐλὸς", "flauta"],
  ["αὐξάνειν", "crescer"],
  ["αὐξάνετε", "crescei"],
  ["αὐξάνουσιν", "crescem"],
  ["αὐξάνων", "fazendo-crescer"],
  ["αὐξήσει", "fará-crescer"],
  ["αὐξήσωμεν", "façamos-crescer"],
  ["αὐξανομένης", "crescendo"],
  ["αὐξανόμενα", "crescendo"],
  ["αὐξανόμενοι", "crescendo"],
  ["αὐξανόμενον", "crescendo"],
  ["αὐξηθῆτε", "sejais-feitos-crescer"],
  ["αὐξηθῇ", "seja-feito-crescer"],
  ["αὐστηρός", "severo"],
  ["αὐστηρὸς", "severo"],
  ["αὐτάρκειαν", "suficiência"],
  ["αὐτάρκης", "autossuficiente"],
  ["αὐταρκείας", "suficiência"],
  ["αὐτοκατάκριτος", "autocondenado"],
  ["αὐτόπται", "testemunhas-oculares"],
  ["αὐτόχειρες", "com-as-próprias-mãos"],
  ["αὐχεῖ", "vangloria-se"],
  ["αὐχμηρῷ", "sombrio"],
  ["αὑτοὺς", "si-mesmos"],
  ["αὗταί", "estas"],

  // --- βά- palavras ---
  ["βάθη", "profundezas"],
  ["βάθους", "profundidade"],
  ["βάλητε", "lanceis"],
  ["βάλλομεν", "lançamos"],
  ["βάλλουσαν", "lançando"],
  ["βάλωσιν", "lancem"],
  ["βάπτισαι", "batiza-te"],
  ["βάρει", "peso"],
  ["βάρη", "pesos"],
  ["βάσεις", "pés"],
  ["βάτους", "sarças"],
  ["βάτῳ", "sarça"],
  ["βάψας", "tendo-mergulhado"],
  ["βάψω", "mergulharei"],
  ["βάψῃ", "mergulhe"],

  // --- βέ- / βή- / βί- palavras ---
  ["βέβαιος", "firme"],
  ["βέβηλος", "profano"],
  ["βέλη", "flechas"],
  ["βέλτιον", "melhor"],
  ["βήματι", "tribunal"],
  ["βήρυλλος", "berilo"],
  ["βίαν", "violência"],
  ["βίβλους", "livros"],
  ["βίωσίν", "vivam"],

  // --- βα- palavras ---
  ["βαΐα", "ramos-de-palmeira"],
  ["βαθέως", "profundamente"],
  ["βαθεῖ", "profundo"],
  ["βαθμὸν", "grau"],
  ["βαθύ", "profundo"],
  ["βαλέτω", "lance"],
  ["βαλεῖ", "lançará"],
  ["βαλλάντια", "bolsas"],
  ["βαλλαντίου", "bolsa"],
  ["βαλλόμενα", "sendo-lançados"],
  ["βαλοῦσα", "tendo-lançado"],
  ["βαλοῦσιν", "lançarão"],
  ["βαπτίζεις", "batizas"],
  ["βαπτίζονται", "são-batizados"],
  ["βαπτίζοντες", "batizando"],
  ["βαπτίσματι", "batismo"],
  ["βαπτιζόμενοι", "sendo-batizados"],
  ["βαπτισθέντος", "tendo-sido-batizado"],
  ["βαπτισθήτω", "seja-batizado"],
  ["βαπτισμοὺς", "batismos"],
  ["βαπτισμοῖς", "batismos"],
  ["βαπτισμῶν", "batismos"],
  ["βαπτιστὴς", "batista"],

  // --- βαρ- palavras ---
  ["βαρείσθω", "seja-pesado"],
  ["βαρεῖς", "pesados"],
  ["βαρηθῶσιν", "sejam-sobrecarregados"],
  ["βαρούμενοι", "sendo-sobrecarregados"],
  ["βαρυτίμου", "de-muito-valor"],
  ["βαρύτερα", "mais-pesadas"],

  // --- βασ- palavras ---
  ["βασάνου", "tormento"],
  ["βασίλειον", "real"],
  ["βασανίσαι", "atormentar"],
  ["βασανιζομένους", "sendo-atormentados"],
  ["βασανιζόμενον", "sendo-atormentado"],
  ["βασανιζόμενος", "sendo-atormentado"],
  ["βασανισταῖς", "torturadores"],
  ["βασιλέων", "reis"],
  ["βασιλίσσης", "rainha"],
  ["βασιλείοις", "palácios-reais"],
  ["βασιλευέτω", "reine"],
  ["βασιλευόντων", "reinando"],
  ["βασιλεύει", "reina"],
  ["βασιλεύειν", "reinar"],
  ["βασιλεύς", "rei"],
  ["βασιλεύσει", "reinará"],
  ["βασιλεύσῃ", "reine"],
  ["βασιλικός", "real"],
  ["βασιλικὴν", "real"],
  ["βασιλικὸν", "real"],
  ["βασιλικὸς", "real"],
  ["βασιλικῆς", "real"],

  // --- βαστ- palavras ---
  ["βαστάζει", "carrega"],
  ["βαστάζεις", "carregas"],
  ["βαστάζεσθαι", "ser-carregado"],
  ["βαστάζοντες", "carregando"],
  ["βαστάζω", "carrego"],
  ["βαστάσασά", "tendo-carregado"],
  ["βαστάσασι", "tendo-carregado"],

  // --- βαττ- / βδ- palavras ---
  ["βατταλογήσητε", "balbuciais-em-vão"],
  ["βδελυκτοὶ", "abomináveis"],
  ["βδελυσσόμενος", "abominando"],

  // --- βεβ- palavras ---
  ["βεβήλοις", "profanos"],
  ["βεβαίωσιν", "confirmação"],
  ["βεβαιούμενοι", "sendo-confirmados"],
  ["βεβαιοῦντος", "confirmando"],
  ["βεβαιοῦσθαι", "ser-confirmado"],
  ["βεβαιότερον", "mais-firme"],
  ["βεβαιῶν", "confirmando"],
  ["βεβαιῶσαι", "confirmar"],
  ["βεβαπτισμένοι", "tendo-sido-batizados"],
  ["βεβηλοῦσιν", "profanam"],
  ["βεβηλῶσαι", "profanar"],
  ["βεβληκότος", "tendo-lançado"],
  ["βεβλημένην", "tendo-sido-lançada"],
  ["βεβλημένος", "tendo-sido-lançado"],
  ["βεβρωκόσιν", "tendo-comido"],

  // --- βελ- / βι- palavras ---
  ["βελόνης", "agulha"],
  ["βιαίας", "violenta"],
  ["βιασταὶ", "violentos"],
  ["βιβλία", "livros"],
  ["βιβλίον", "livro"],
  ["βιβλίῳ", "livro"],
  ["βιωτικά", "desta-vida"],
  ["βιωτικαῖς", "desta-vida"],
  ["βιωτικὰ", "desta-vida"],
  ["βιῶσαι", "viver"],

  // --- βλά- / βλέ- palavras ---
  ["βλάσφημα", "blasfemas"],
  ["βλάσφημοι", "blasfemos"],
  ["βλάψαν", "tendo-danificado"],
  ["βλάψῃ", "danifique"],
  ["βλέμματι", "olhar"],
  ["βλέπειν", "ver"],
  ["βλέποντα", "vendo"],
  ["βλέπουσι", "veem"],
  ["βλέπωσιν", "vejam"],
  ["βλέπῃ", "veja"],

  // --- βλα- palavras ---
  ["βλαβεράς", "prejudiciais"],
  ["βλαστήσασα", "tendo-brotado"],
  ["βλαστᾷ", "brota"],
  ["βλασφημήσαντι", "tendo-blasfemado"],
  ["βλασφημήσωσιν", "blasfemem"],
  ["βλασφημήσῃ", "blasfeme"],
  ["βλασφημίαν", "blasfêmia"],
  ["βλασφημίας", "blasfêmia"],
  ["βλασφημείσθω", "seja-blasfemado"],
  ["βλασφημεῖται", "é-blasfemado"],
  ["βλασφημηθήσεται", "será-blasfemado"],
  ["βλασφημούμεθα", "somos-blasfemados"],
  ["βλασφημούντων", "blasfemando"],
  ["βλασφημοῦμαι", "sou-blasfemado"],
  ["βλασφημοῦντας", "blasfemando"],

  // --- βλεπ- / βλη- palavras ---
  ["βλεπομένη", "sendo-vista"],
  ["βλεπόμενον", "sendo-visto"],
  ["βλεπόντων", "vendo"],
  ["βληθήσῃ", "serás-lançado"],
  ["βληθείσῃ", "tendo-sido-lançada"],
  ["βληθεὶς", "tendo-sido-lançado"],
  ["βληθὲν", "tendo-sido-lançado"],
  ["βληθῇ", "seja-lançado"],
  ["βλητέον", "deve-ser-posto"],

  // --- βο- palavras ---
  ["βοήθειαν", "auxílio"],
  ["βοαὶ", "clamores"],
  ["βοηθείαις", "auxílios"],
  ["βοηθεῖτε", "auxiliai"],
  ["βοηθός", "auxiliador"],
  ["βοηθῆσαι", "auxiliar"],
  ["βολήν", "tiro"],
  ["βορβόρου", "lama"],
  ["βορρᾶ", "norte"],
  ["βοτάνην", "erva"],

  // --- βουλ- palavras ---
  ["βουλήματι", "vontade"],
  ["βουλήματος", "vontade"],
  ["βουλευτής", "conselheiro"],
  ["βουλευτὴς", "conselheiro"],
  ["βουλεύσεται", "deliberará"],
  ["βουληθεὶς", "tendo-querido"],
  ["βουληθῇ", "queira"],
  ["βουλομένους", "querendo"],
  ["βουλόμεθα", "queremos"],
  ["βουλόμενοι", "querendo"],
  ["βουλὰς", "propósitos"],
  ["βουλῆς", "conselho"],

  // --- βου- palavras ---
  ["βουνοῖς", "colinas"],
  ["βουνὸς", "colina"],
  ["βούλει", "queres"],
  ["βούλημα", "vontade"],
  ["βούλοιτο", "quisesse"],
  ["βούλομαί", "quero"],
  ["βοώντων", "clamando"],
  ["βοῦς", "boi"],
  ["βοῶντα", "clamando"],

  // --- βρ- palavras ---
  ["βρέξαι", "chover"],
  ["βρέφους", "criança-de-peito"],
  ["βρέχει", "chove"],
  ["βρέχειν", "chover"],
  ["βραβευέτω", "governe"],
  ["βραδεῖς", "lentos"],
  ["βραδυπλοοῦντες", "navegando-lentamente"],
  ["βραδύνει", "demora"],
  ["βραδύνω", "demoro"],
  ["βραδύτητα", "demora"],
  ["βραχέων", "poucas"],
  ["βραχίονι", "braço"],
  ["βραχίονος", "braço"],
  ["βραχίων", "braço"],
  ["βροντὴν", "trovão"],
  ["βρωμάτων", "alimentos"],
  ["βρόχον", "laço"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11d (freq 1, parte 4/44) ===`);
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

console.log(`\n=== Resultado Lote 11d ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

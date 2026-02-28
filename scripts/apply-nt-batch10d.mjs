#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10d
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 4/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10d-${Date.now()}.sql`);

const translations = [
  // === Índices 744-991 de freq2-words.json (248 palavras) ===

  // --- κεκ- palavras (perfeito passivo) ---
  ["κεκλημένοις", "tendo-sido-chamados"],
  ["κεκλημένους", "tendo-sido-chamados"],
  ["κεκοίμηται", "tem-adormecido"],
  ["κεκοιμημένων", "tendo-adormecido"],
  ["κεκοσμημένον", "tendo-sido-adornado"],
  ["κελεύσας", "tendo-ordenado"],
  ["κενοφωνίας", "palavras-vãs"],
  ["κενωθῇ", "seja-esvaziada"],
  ["κεράμιον", "cântaro"],
  ["κεραμέως", "oleiro"],
  ["κεφαλὰς", "cabeças"],
  ["κεχάρισμαι", "tenho-concedido-graciosamente"],
  ["κηρυχθήσεται", "será-proclamado"],
  ["κηρυχθῆναι", "ser-proclamado"],
  ["κηρυχθῇ", "seja-proclamado"],
  ["κηρύξατε", "proclamai"],
  ["κηρύσσει", "proclama"],
  ["κηρύσσω", "proclamo"],
  ["κηρῦξαι", "proclamar"],
  ["κιβωτόν", "arca"],
  ["κιβωτὸν", "arca"],
  ["κινδυνεύομεν", "corremos-perigo"],
  ["κινοῦντες", "movendo"],
  ["κλάδοι", "ramos"],
  ["κλάδοις", "ramos"],
  ["κλάδος", "ramo"],
  ["κλάδους", "ramos"],
  ["κλάσει", "partir"],
  ["κλάσματα", "pedaços"],
  ["κλέπτης", "ladrão"],
  ["κλέπτουσιν", "furtam"],
  ["κλέψεις", "furtarás"],
  ["κλέψῃς", "furtes"],
  ["κλήρους", "sortes"],
  ["κλήσει", "chamado"],
  ["κλίβανον", "forno"],
  ["κλίνῃ", "cama"],
  ["κλαίεις", "choras"],
  ["κλαίοντας", "chorando"],
  ["κλαίοντες", "chorando"],
  ["κλαύσατε", "chorai"],
  ["κλαύσετε", "chorareis"],
  ["κληθήσεταί", "será-chamado"],
  ["κληθήσονται", "serão-chamados"],
  ["κληθήσῃ", "serás-chamado"],
  ["κληθεὶς", "tendo-sido-chamado"],
  ["κληθῆτε", "sejais-chamados"],
  ["κληθῇς", "sejas-chamado"],
  ["κληρονομῆσαι", "herdar"],
  ["κληρονόμον", "herdeiro"],
  ["κλητοὶ", "chamados"],
  ["κλητὸς", "chamado"],
  ["κλοπαί", "furtos"],
  ["κλύδωνι", "onda"],
  ["κλῆρος", "sorte"],
  ["κλῆσιν", "chamado"],

  // --- κοι- palavras ---
  ["κοίνου", "comum"],
  ["κοίτην", "leito"],
  ["κοιμηθέντας", "tendo-adormecido"],
  ["κοιμωμένων", "adormecendo"],
  ["κοινά", "comuns"],
  ["κοιναῖς", "comuns"],
  ["κοινοῦντα", "tornando-comum"],
  ["κοινωνίᾳ", "comunhão"],
  ["κοινῶσαι", "tornar-comum"],
  ["κολλώμενος", "unindo-se"],
  ["κολυμβήθραν", "tanque"],
  ["κομίσεται", "receberá"],
  ["κομᾷ", "tem-cabelo-longo"],
  ["κοπιῶμεν", "labutamos"],
  ["κοπιῶντας", "labutando"],
  ["κοπιῶντες", "labutando"],
  ["κουστωδίας", "guarda"],

  // --- κρ- palavras ---
  ["κρέα", "carnes"],
  ["κρίματα", "julgamentos"],
  ["κρίματι", "julgamento"],
  ["κρίματος", "julgamento"],
  ["κρίνα", "lírios"],
  ["κρίναντες", "tendo-julgado"],
  ["κρίνοντα", "julgando"],
  ["κρίνοντες", "julgando"],
  ["κρατεῖτε", "segurai"],
  ["κρείσσονα", "melhor"],
  ["κρείττοσιν", "melhores"],
  ["κρεμάσαντες", "tendo-pendurado"],
  ["κριθῆναι", "ser-julgado"],
  ["κρινέτω", "julgue"],
  ["κριτήρια", "tribunais"],
  ["κριτὴν", "juiz"],
  ["κρούετε", "batei"],
  ["κρούοντι", "batendo"],
  ["κρούσαντος", "tendo-batido"],
  ["κρυβῆναι", "ser-escondido"],
  ["κρυφαίῳ", "secreto"],
  ["κτίσεως", "criação"],
  ["κτᾶσθαι", "adquirir"],
  ["κυλλὸν", "aleijado"],
  ["κυμάτων", "ondas"],
  ["κυνάρια", "cachorrinhos"],
  ["κυναρίοις", "cachorrinhos"],
  ["κυριεύει", "domina"],
  ["κυριότητος", "senhorio"],
  ["κωλυόντων", "impedindo"],
  ["κωλύει", "impede"],
  ["κωφοὶ", "mudos"],
  ["κωφοὺς", "mudos"],
  ["κόλασιν", "castigo"],
  ["κόπος", "labor"],
  ["κόπῳ", "labor"],
  ["κύματα", "ondas"],
  ["κώμοις", "orgias"],
  ["κἀμὲ", "também-a-mim"],
  ["κῆπος", "jardim"],

  // --- λ- palavras ---
  ["λάβωμεν", "recebamos"],
  ["λάμπει", "brilha"],
  ["λέγοντα", "dizendo"],
  ["λέγοντος", "dizendo"],
  ["λίθων", "pedras"],
  ["λαβοῦσαι", "tendo-recebido"],
  ["λαλήσαντες", "tendo-falado"],
  ["λαλήσας", "tendo-falado"],
  ["λαλήσουσιν", "falarão"],
  ["λαληθῆναι", "ser-falado"],
  ["λαλιὰν", "fala"],
  ["λαλούμενον", "sendo-falado"],
  ["λαλοῦντι", "falando"],
  ["λαλοῦσιν", "falam"],
  ["λαμβάνομεν", "recebemos"],
  ["λαμπάδων", "lâmpadas"],
  ["λαμπρὰν", "resplandecente"],
  ["λαμπρᾷ", "resplandecente"],
  ["λατρείαν", "serviço-sagrado"],
  ["λατρείας", "serviço-sagrado"],
  ["λατρεύοντες", "servindo-sagradamente"],
  ["λατρεύσεις", "servirás-sagradamente"],
  ["λαχάνων", "hortaliças"],
  ["λαῖλαψ", "tempestade"],
  ["λεγομένη", "sendo-chamada"],
  ["λεγομένης", "sendo-chamada"],
  ["λεγόμενοι", "sendo-chamados"],
  ["λειπόμενοι", "faltando"],
  ["λειτουργὸν", "ministro"],
  ["λελάληκεν", "tem-falado"],
  ["λελύπηκεν", "tem-entristecido"],
  ["λεπροῦ", "leproso"],
  ["λεπρὸς", "leproso"],
  ["λεπτὰ", "lepta"],
  ["λιθοβολοῦσα", "apedrejando"],
  ["λικμήσει", "esmagará"],
  ["λιμοὶ", "fomes"],
  ["λογίσηται", "considere"],
  ["λογισθῆναι", "ser-considerado"],
  ["λοιδορίας", "injúria"],
  ["λοιπαὶ", "restantes"],
  ["λοιποί", "restantes"],
  ["λοιποῖς", "restantes"],
  ["λοιποῦ", "restante"],
  ["λοιπόν", "restante"],
  ["λοιπὰς", "restantes"],
  ["λοιπῶν", "restantes"],
  ["λυπεῖσθαι", "entristecer-se"],
  ["λυπούμενοι", "entristecendo-se"],
  ["λύετε", "desatai"],
  ["λύκοι", "lobos"],
  ["λύκων", "lobos"],
  ["λύπῃ", "tristeza"],
  ["λύσαντες", "tendo-desatado"],
  ["λύσας", "tendo-desatado"],
  ["λύσῃ", "desate"],
  ["λύτρον", "resgate"],
  ["λῃστάς", "salteadores"],
  ["λῃστής", "salteador"],
  ["λῃσταί", "salteadores"],

  // --- μα- palavras ---
  ["μάγων", "magos"],
  ["μάρτυρές", "testemunhas"],
  ["μάρτυρες", "testemunhas"],
  ["μάρτυσιν", "testemunhas"],
  ["μάταιοι", "vãos"],
  ["μάτην", "em-vão"],
  ["μάχαι", "contendas"],
  ["μάχας", "contendas"],

  // --- μέ- palavras ---
  ["μέλανος", "tinta"],
  ["μέλεσίν", "membros"],
  ["μέλι", "mel"],
  ["μέλλει", "está-a-ponto-de"],
  ["μέλλεις", "estás-a-ponto-de"],
  ["μέλλετε", "estais-a-ponto-de"],
  ["μέλλον", "estando-a-ponto-de"],
  ["μέλλουσιν", "estão-a-ponto-de"],
  ["μέλλῃ", "esteja-a-ponto-de"],
  ["μένει", "permanece"],
  ["μένειν", "permanecer"],
  ["μένουσιν", "permanecem"],
  ["μέριμνα", "preocupação"],
  ["μέσης", "meio"],
  ["μέτρου", "medida"],
  ["μέχρι", "até"],
  ["μήπω", "ainda-não"],

  // --- μα- palavras (continuação) ---
  ["μαθὼν", "tendo-aprendido"],
  ["μακάριός", "bem-aventurado"],
  ["μακαρισμὸς", "bem-aventurança"],
  ["μακροθυμία", "longanimidade"],
  ["μακρὰ", "longa"],
  ["μαλακοῖς", "moles"],
  ["μανθανέτωσαν", "aprendam"],
  ["μαργαρίτας", "pérolas"],
  ["μαρτυρουμένη", "sendo-testificada"],
  ["μαρτυρούμενος", "sendo-testificado"],
  ["μαστίγων", "açoites"],
  ["μαστιγώσουσιν", "açoitarão"],
  ["μαστοὶ", "seios"],
  ["ματαιότητι", "vaidade"],

  // --- μει/μεγ- palavras ---
  ["μείζω", "maior"],
  ["μείνητε", "permaneçais"],
  ["μεγάλα", "grandes"],
  ["μεγάλας", "grandes"],
  ["μεγάλης", "grande"],
  ["μεγάλοι", "grandes"],
  ["μεγαλειότητος", "grandeza"],
  ["μεθύουσιν", "embriagam-se"],

  // --- μελ/μεμ/μεν- palavras ---
  ["μελῶν", "membros"],
  ["μεμέρισται", "tem-sido-dividido"],
  ["μεμαρτύρηται", "tem-sido-testificado"],
  ["μενεῖτε", "permanecereis"],
  ["μενοῦνγε", "antes-pelo-contrário"],

  // --- μερ- palavras ---
  ["μερίδα", "porção"],
  ["μεριμνήσει", "preocupar-se-á"],
  ["μερισθεῖσα", "tendo-sido-dividida"],
  ["μερισθῇ", "seja-dividida"],
  ["μερὶς", "porção"],

  // --- μεσ- palavras ---
  ["μεσημβρίαν", "meio-dia"],
  ["μεσονυκτίου", "meia-noite"],
  ["μεσονύκτιον", "meia-noite"],
  ["μεστοὺς", "cheios"],
  ["μεστὴ", "cheia"],
  ["μεστὸν", "cheio"],

  // --- μετ- palavras ---
  ["μετάπεμψαι", "mandar-buscar"],
  ["μετέστησεν", "removeu"],
  ["μετέχειν", "participar"],
  ["μετήλλαξαν", "trocaram"],
  ["μεταβῇ", "passe"],
  ["μεταμεληθεὶς", "tendo-se-arrependido"],
  ["μετανοεῖν", "arrepender-se"],
  ["μετανοοῦντι", "arrependendo-se"],
  ["μετεκαλέσατο", "mandou-chamar"],
  ["μετεμορφώθη", "foi-transfigurado"],
  ["μετρηθήσεται", "será-medido"],
  ["μετόχους", "participantes"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10d (freq 2, parte 4/12) ===`);
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

console.log(`\n=== Resultado Lote 10d ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

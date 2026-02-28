#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11j
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 10/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11j-${Date.now()}.sql`);

const translations = [
  // === κ- palavras freq 1 (parte 10/44, 248 palavras) ===

  // --- θῶμεν (colocar - subjuntivo aoristo) ---
  ["θῶμεν", "coloquemos"],

  // --- κάθ-, κάλ-, κάμ- (sentar, chamar, cansar, curvar) ---
  ["κάθῃ", "te-sentas"],
  ["κάκωσιν", "maltrato"],
  ["κάλει", "chama"],
  ["κάλλιον", "muito-bem"],
  ["κάμητε", "desfaleceis"],
  ["κάμνοντα", "estando-enfermo"],
  ["κάμπτω", "dobro"],
  ["κάμψει", "dobrará"],
  ["κάμψῃ", "dobre"],

  // --- κέκ- (perfeito de vários verbos) ---
  ["κέκλεισται", "tem-sido-fechado"],
  ["κέκληταί", "tem-sido-chamado"],
  ["κέκλικεν", "tem-declinado"],
  ["κέκραγεν", "tem-clamado"],
  ["κέκρικεν", "tem-julgado"],
  ["κέκρυπται", "tem-sido-escondido"],

  // --- κέλ- (ordenar) ---
  ["κέλευσον", "ordena"],
  ["κέλευσόν", "ordena"],

  // --- κέρ- (lucro, moedas) ---
  ["κέρδη", "lucros"],
  ["κέρδος", "lucro"],
  ["κέρδους", "lucro"],
  ["κέρματα", "moedas"],

  // --- κέχ- (usar) ---
  ["κέχρημαι", "tenho-usado"],

  // --- κήν-, κήρ-, κήτ- (censo, pregação, baleia) ---
  ["κήνσου", "censo"],
  ["κήρυγμά", "pregação"],
  ["κήρυκα", "pregador"],
  ["κήρυξ", "pregador"],
  ["κήρυξον", "prega"],
  ["κήτους", "grande-peixe"],

  // --- κίν- (perigo, movimento) ---
  ["κίνδυνος", "perigo"],
  ["κίνησιν", "movimento"],

  // --- καί- (mesmo, queimar, embora) ---
  ["καίγε", "e-de-fato"],
  ["καίεται", "queima-se"],
  ["καίουσιν", "acendem"],
  ["καίτοιγε", "embora"],

  // --- καθάρ- (purificar, limpar) ---
  ["καθάρισον", "purifica"],
  ["καθήκοντα", "convindo"],
  ["καθήμεναι", "estando-sentadas"],
  ["καθήμενος", "estando-sentado"],

  // --- καθίζ- (sentar) ---
  ["καθίζετε", "sentais"],
  ["καθίσαι", "sentar"],
  ["καθίσαντος", "tendo-sentado"],
  ["καθίσατε", "sentai-vos"],
  ["καθίσει", "sentará"],
  ["καθίσωμεν", "sentemo-nos"],
  ["καθίσωσιν", "sentem-se"],
  ["καθίσῃ", "sente-se"],

  // --- καθαίρ- (podar, demolir) ---
  ["καθαίρει", "poda"],
  ["καθαιρεῖσθαι", "ser-demolido"],
  ["καθαιροῦντες", "demolindo"],

  // --- καθαρ- (puro, purificar) ---
  ["καθαρά", "pura"],
  ["καθαρίζει", "purifica"],
  ["καθαρίζεσθαι", "ser-purificado"],
  ["καθαρίζεται", "é-purificado"],
  ["καθαρίζων", "purificando"],
  ["καθαρίσατε", "purificai"],
  ["καθαρίσωμεν", "purifiquemo-nos"],
  ["καθαριεῖ", "purificará"],
  ["καθαροὶ", "puros"],
  ["καθαροῖς", "puros"],
  ["καθαρός", "puro"],
  ["καθαρότητα", "pureza"],
  ["καθαρῷ", "puro"],

  // --- καθεζ- (sentar-se) ---
  ["καθεζομένους", "sentando-se"],
  ["καθεζόμενοι", "sentando-se"],
  ["καθεζόμενον", "sentando-se"],
  ["καθεζόμενος", "sentando-se"],

  // --- καθελ- (derrubar) ---
  ["καθελεῖν", "derrubar"],
  ["καθελόντες", "tendo-derrubado"],
  ["καθελῶ", "derrubarei"],

  // --- καθεύδ- (dormir) ---
  ["καθεύδειν", "dormir"],
  ["καθεύδεις", "dormes"],
  ["καθεύδετε", "dormis"],
  ["καθεύδοντες", "dormindo"],
  ["καθεύδουσιν", "dormem"],
  ["καθεύδῃ", "durma"],

  // --- καθεῖ- (derrubar, cada-um) ---
  ["καθεῖλεν", "derrubou"],
  ["καθεῖς", "cada-um"],

  // --- καθηγ- (mestre, guia) ---
  ["καθηγηταί", "mestres"],
  ["καθηγητὴς", "mestre"],

  // --- καθημ- (sentar, diário) ---
  ["καθημένου", "estando-sentado"],
  ["καθημένους", "estando-sentados"],
  ["καθημένῳ", "estando-sentado"],
  ["καθημερινῇ", "diária"],

  // --- καθιέ-, καθιστ- (baixar, estabelecer) ---
  ["καθιέμενον", "sendo-baixado"],
  ["καθιεμένην", "sendo-baixada"],
  ["καθιστάνοντες", "estabelecendo"],

  // --- καθορ- (perceber-claramente) ---
  ["καθορᾶται", "é-percebido-claramente"],

  // --- καθωπλ- (armar) ---
  ["καθωπλισμένος", "tendo-se-armado"],

  // --- καθόλ-, καθώσπ-, καθά, καθῆ- (de-todo, como, conforme, convir, atar) ---
  ["καθόλου", "de-todo"],
  ["καθώσπερ", "assim-como"],
  ["καθὰ", "conforme"],
  ["καθῆκεν", "convinha"],
  ["καθῆψεν", "atou"],

  // --- καιν- (novo) ---
  ["καιναῖς", "novas"],
  ["καινόν", "novo"],
  ["καινότερον", "mais-novo"],
  ["καινὴν", "nova"],
  ["καινὸν", "novo"],
  ["καινῷ", "novo"],

  // --- καιομ-, καιρ-, καιόμ- (queimando, tempo) ---
  ["καιομένη", "queimando"],
  ["καιρός", "tempo"],
  ["καιόμενοι", "queimando-se"],

  // --- κακ- (mau, maldade, maltratar) ---
  ["κακήν", "má"],
  ["κακία", "maldade"],
  ["κακαί", "más"],
  ["κακοηθείας", "malícia"],
  ["κακολογοῦντες", "amaldiçoando"],
  ["κακολογῆσαί", "amaldiçoar"],
  ["κακοπάθησον", "sofre-dificuldades"],
  ["κακοπαθείας", "sofrimento"],
  ["κακοπαθῶ", "sofro-dificuldades"],
  ["κακοποιοῦντας", "fazendo-o-mal"],
  ["κακοποιὸς", "malfeitor"],
  ["κακουχουμένων", "sendo-maltratados"],
  ["κακουχούμενοι", "sendo-maltratados"],
  ["κακούργους", "malfeitores"],
  ["κακούργων", "malfeitores"],
  ["κακοὶ", "maus"],
  ["κακοὺς", "maus"],
  ["κακοῦργοι", "malfeitores"],
  ["κακοῦργος", "malfeitor"],
  ["κακώσουσιν", "maltratarão"],
  ["κακώσων", "tendo-maltratado"],
  ["κακῷ", "mau"],

  // --- καλ- (chamar, bom, belo) ---
  ["καλάμην", "palha"],
  ["καλάμου", "cana"],
  ["καλέσαντα", "tendo-chamado"],
  ["καλέσαντες", "tendo-chamado"],
  ["καλέσατε", "chamai"],
  ["καλέσητε", "chameis"],
  ["καλέσουσιν", "chamarão"],
  ["καλεῖν", "chamar"],
  ["καλεῖτε", "chamais"],
  ["καλλιέλαιον", "oliveira-cultivada"],
  ["καλοδιδασκάλους", "ensinando-o-bem"],
  ["καλοποιοῦντες", "fazendo-o-bem"],
  ["καλουμένης", "sendo-chamada"],
  ["καλοὶ", "bons"],
  ["καλοῦνται", "são-chamados"],
  ["καλοῦντες", "chamando"],
  ["καλοῦσα", "chamando"],
  ["καλύπτεσθαι", "cobrir-se"],
  ["καλύψει", "cobrirá"],
  ["καλῷ", "bom"],

  // --- κανόν- (regra, norma) ---
  ["κανόνα", "regra"],
  ["κανόνος", "regra"],

  // --- καπηλ- (mercadejar) ---
  ["καπηλεύοντες", "mercadejando"],

  // --- καρδιογν- (conhecedor-de-corações) ---
  ["καρδιογνώστης", "conhecedor-de-corações"],
  ["καρδιογνῶστα", "conhecedor-de-corações"],

  // --- καρποφ- (frutificar) ---
  ["καρποφορήσωμεν", "frutifiquemos"],
  ["καρποφορούμενον", "frutificando"],
  ["καρποφοροῦντες", "frutificando"],
  ["καρποφορῆσαι", "frutificar"],
  ["καρποφόρους", "frutíferas"],

  // --- καρπ- (fruto) ---
  ["καρπούς", "frutos"],
  ["καρπόν", "fruto"],
  ["καρπός", "fruto"],

  // --- κατά (preposição) ---
  ["κατά", "segundo"],

  // --- κατάδ-, κατάκ-, κατάλ-, κατάρ-, κατάσ- (composto com κατά) ---
  ["κατάδηλόν", "evidente"],
  ["κατάκειται", "está-reclinado"],
  ["κατάκρισιν", "condenação"],
  ["κατάλοιποι", "restantes"],
  ["κατάλυε", "destrói"],
  ["κατάλυμά", "hospedaria"],
  ["κατάλυμα", "hospedaria"],
  ["κατάραν", "maldição"],
  ["κατάρτισιν", "aperfeiçoamento"],
  ["κατάσχεσιν", "posse"],

  // --- κατέ- (aoristo de vários verbos com κατά) ---
  ["κατέβην", "desci"],
  ["κατέδησεν", "atou"],
  ["κατέδραμεν", "correu-para-baixo"],
  ["κατέθηκεν", "depositou"],
  ["κατέκαιον", "queimavam"],
  ["κατέκλεισα", "encerrei"],
  ["κατέκλεισεν", "encerrou"],
  ["κατέκλιναν", "reclinaram"],
  ["κατέκριναν", "condenaram"],
  ["κατέλειπεν", "deixou"],
  ["κατέλιπε", "deixou"],
  ["κατέλιπον", "deixaram"],
  ["κατέλυσα", "destruí"],
  ["κατένευσαν", "acenaram"],
  ["κατέπαυσαν", "cessaram"],
  ["κατέπεσεν", "caiu"],
  ["κατέπλευσαν", "navegaram-para"],
  ["κατέσεισεν", "acenou"],
  ["κατέσκαψαν", "derrubaram"],
  ["κατέφαγεν", "devorou"],
  ["κατέφυγον", "refugiaram-se"],
  ["κατέχον", "retendo"],
  ["κατέχουσιν", "retêm"],
  ["κατέχωμεν", "retenhamos"],
  ["κατέχων", "retendo"],

  // --- κατή- (aoristo/imperfeito de vários verbos com κατά) ---
  ["κατήγγειλαν", "anunciaram"],
  ["κατήγγελλον", "anunciavam"],
  ["κατήγοροι", "acusadores"],
  ["κατήλθαμεν", "descemos"],
  ["κατήλθομεν", "descemos"],
  ["κατήνεγκα", "trouxe"],
  ["κατήντηκεν", "tem-chegado"],
  ["κατήργηκα", "tenho-abolido"],
  ["κατήφειαν", "abatimento"],
  ["κατήχηνται", "têm-sido-instruídos"],
  ["κατήχθημεν", "fomos-levados-para-baixo"],

  // --- κατίσχ-, κατίωτ- (prevalecer, enferrujar) ---
  ["κατίσχυον", "prevaleciam"],
  ["κατίωται", "tem-enferrujado"],

  // --- καταβ- (descer) ---
  ["καταβάσει", "descida"],
  ["καταβαίνοντας", "descendo"],
  ["καταβαίνοντες", "descendo"],
  ["καταβαίνοντος", "descendo"],
  ["καταβαρυνόμενοι", "sendo-pesados"],
  ["καταβεβηκότες", "tendo-descido"],
  ["καταβολὴν", "fundação"],
  ["καταβραβευέτω", "desqualifique"],
  ["καταβὰν", "tendo-descido"],

  // --- καταγ- (levar-para-baixo, anunciar) ---
  ["καταγάγῃ", "faça-descer"],
  ["καταγάγῃς", "faças-descer"],
  ["καταγαγεῖν", "fazer-descer"],
  ["καταγαγόντες", "tendo-feito-descer"],
  ["καταγαγὼν", "tendo-feito-descer"],
  ["καταγγέλλετε", "anunciais"],
  ["καταγγέλλομεν", "anunciamos"],
  ["καταγγέλλων", "anunciando"],
  ["καταγγελεὺς", "anunciador"],

  // --- καταδ- (condenar, escravizar, oprimir) ---
  ["καταδίκην", "condenação"],
  ["καταδικάζετε", "condenais"],
  ["καταδικασθήσῃ", "serás-condenado"],
  ["καταδικασθῆτε", "sejais-condenados"],
  ["καταδουλοῖ", "escraviza"],
  ["καταδουλώσουσιν", "escravizarão"],
  ["καταδυναστευομένους", "sendo-oprimidos"],
  ["καταδυναστεύουσιν", "oprimem"],

  // --- καταθ-, καταισχ- (amaldiçoar, envergonhar) ---
  ["καταθεματίζειν", "amaldiçoar"],
  ["καταισχυνθῇ", "seja-envergonhado"],
  ["καταισχυνθῶμεν", "sejamos-envergonhados"],
  ["καταισχυνθῶσιν", "sejam-envergonhados"],
  ["καταισχύνετε", "envergonhais"],

  // --- κατακ- (condenar, queimar, cobrir, gloriar-se) ---
  ["κατακέκριται", "tem-sido-condenado"],
  ["κατακαήσεται", "será-queimado"],
  ["κατακαλυπτέσθω", "cubra-se"],
  ["κατακαλύπτεσθαι", "cobrir-se"],
  ["κατακαλύπτεται", "cobre-se"],
  ["κατακαυχᾶσαι", "glorias-te-contra"],
  ["κατακαυχᾶσθε", "gloriais-vos-contra"],
  ["κατακαυχᾶται", "gloria-se-contra"],
  ["κατακαυχῶ", "glorio-me-contra"],
  ["κατακαῦσαι", "queimar"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11j (freq 1, parte 10/44) ===`);
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

console.log(`\n=== Resultado Lote 11j ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

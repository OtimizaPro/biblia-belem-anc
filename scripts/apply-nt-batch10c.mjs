#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10c
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 3/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10c-${Date.now()}.sql`);

const translations = [
  // === Índices 496-743 de freq2-words.json (248 palavras) ===

  // --- εἰσ- palavras (entrar, adentrar) ---
  ["εἰσερχόμενοι", "entrando"],
  ["εἰσηκούσθη", "foi-ouvido"],
  ["εἰσπορευόμενος", "adentrando"],
  ["εἰσπορεύονται", "adentram"],
  ["εἰσῄει", "entrava"],
  ["εἰωθὸς", "costumado"],
  ["εἰώθει", "costumava"],

  // --- εἰδ/εἰρ/εἰχ- palavras ---
  ["εἴδαμεν", "vimos"],
  ["εἴδομέν", "vimos"],
  ["εἴδους", "forma"],
  ["εἴρηκα", "tenho-dito"],
  ["εἴχοσαν", "tinham"],
  ["εἴων", "permitiam"],
  ["εἵλκυσεν", "arrastou"],
  ["εἶδος", "forma"],
  ["εἶδόν", "viram"],
  ["εἶπε", "disse"],
  ["εἶπες", "disseste"],
  ["εἶτεν", "disse"],

  // --- εὐαγγελ- palavras (boa-nova) ---
  ["εὐαγγελίζεσθαι", "anunciar-boa-nova"],
  ["εὐαγγελίζονται", "anunciam-boa-nova"],
  ["εὐαγγελίζωμαι", "anuncie-boa-nova"],
  ["εὐαγγελίσασθαί", "ter-anunciado-boa-nova"],
  ["εὐαγγελισθὲν", "tendo-sido-anunciado-como-boa-nova"],
  ["εὐαγγελιστοῦ", "anunciador-de-boa-nova"],

  // --- εὐδοκ- palavras (boa-vontade) ---
  ["εὐδοκίας", "boa-vontade"],
  ["εὐδοκοῦμεν", "temos-prazer"],
  ["εὐδόκησας", "tiveste-prazer"],
  ["εὐηγγελίσατο", "anunciou-boa-nova"],

  // --- εὐκαιρ- palavras ---
  ["εὐκαίρως", "oportunamente"],
  ["εὐκαιρίαν", "oportunidade"],
  ["εὐκοπώτερόν", "mais-fácil"],

  // --- εὐλαβ/εὐλογ- palavras ---
  ["εὐλαβείας", "reverência"],
  ["εὐλαβεῖς", "reverentes"],
  ["εὐλογίαις", "bênçãos"],
  ["εὐλογημένος", "tendo-sido-bendito"],
  ["εὐλογοῦντες", "bendizendo"],
  ["εὐλογῶν", "bendizendo"],

  // --- εὐσεβ- palavras (piedade) ---
  ["εὐσέβεια", "piedade"],
  ["εὐσεβείας", "piedade"],
  ["εὐσεβῶς", "piedosamente"],

  // --- εὐ- palavras diversas ---
  ["εὐτόνως", "vigorosamente"],
  ["εὐφροσύνης", "alegria"],
  ["εὐχαριστεῖ", "dá-graças"],
  ["εὐχαριστῶν", "dando-graças"],
  ["εὐχόμεθα", "oramos"],
  ["εὐωδίας", "fragrância"],

  // --- εὑρ- palavras (encontrar) ---
  ["εὑρέθη", "foi-encontrada"],
  ["εὑρήσετέ", "encontrareis"],
  ["εὑρίσκοντες", "encontrando"],
  ["εὑρεθῶ", "seja-encontrado"],
  ["εὔσπλαγχνοι", "compassivos"],
  ["εὔχρηστον", "útil"],
  ["εὕρητε", "encontreis"],
  ["εὕρομεν", "encontramos"],
  ["εὗρόν", "encontraram"],

  // --- ζ- palavras (ζῆλος, ζητέω, ζύμη, ζωή) ---
  ["ζήλου", "zelo"],
  ["ζήλῳ", "zelo"],
  ["ζήσῃ", "viva"],
  ["ζήτει", "busca"],
  ["ζηλωταὶ", "zelosos"],
  ["ζηλωτὴς", "zeloso"],
  ["ζητήσεως", "investigação"],
  ["ζητεῖν", "buscar"],
  ["ζητεῖς", "buscas"],
  ["ζητημάτων", "questões"],
  ["ζητοῦν", "buscando"],
  ["ζητοῦντές", "buscando"],
  ["ζητοῦσίν", "buscam"],
  ["ζυμοῖ", "leveda"],
  ["ζωοποιοῦν", "vivificando"],
  ["ζόφος", "escuridão"],
  ["ζύμη", "fermento"],
  ["ζῶσιν", "vivam"],

  // --- η- palavras ---
  ["ηὐδόκησαν", "tiveram-prazer"],
  ["ηὔξησεν", "fez-crescer"],
  ["ηὕρισκον", "encontravam"],

  // --- θ- palavras (θάνατος, θαυμάζω, θεός, θεραπεύω) ---
  ["θάμβος", "espanto"],
  ["θάνατε", "morte"],
  ["θέλοντος", "querendo"],
  ["θέμενος", "tendo-posto"],
  ["θήσει", "porá"],
  ["θίγῃ", "toque"],
  ["θανατῶσαι", "matar"],
  ["θαρρῶ", "tenho-ânimo"],
  ["θαυμάζειν", "admirar"],
  ["θαυμάζοντες", "admirando"],
  ["θαυμαζόντων", "admirando"],
  ["θαυμαστὴ", "admirável"],
  ["θείας", "divina"],
  ["θεαθῆναι", "ser-contemplado"],
  ["θεασάμενοι", "tendo-contemplado"],
  ["θελήσῃ", "queira"],
  ["θεοὺς", "deuses"],
  ["θερίζουσιν", "ceifam"],
  ["θερίσομεν", "ceifaremos"],
  ["θεραπείας", "cura"],
  ["θεραπεύειν", "curar"],
  ["θεραπεύετε", "curai"],
  ["θεραπεύων", "curando"],
  ["θερισμὸν", "ceifa"],
  ["θερισμὸς", "ceifa"],
  ["θεωρεῖν", "contemplar"],
  ["θεωροῦσαι", "contemplando"],
  ["θηρία", "feras"],
  ["θησαυρίζετε", "entesourais"],
  ["θησαυρίζων", "entesourando"],
  ["θλιβομένοις", "aos-que-são-afligidos"],
  ["θλῖψιν", "aflição"],
  ["θορυβεῖσθε", "perturbai-vos"],
  ["θρησκεία", "religião"],
  ["θροεῖσθε", "alarmeis-vos"],
  ["θρόνων", "tronos"],
  ["θρὶξ", "cabelo"],
  ["θυγατέρες", "filhas"],
  ["θυμιάματος", "incenso"],
  ["θυμοί", "iras"],
  ["θυρίδος", "janela"],
  ["θυρωρῷ", "porteiro"],
  ["θυσιαστηρίου", "altar"],
  ["θυσιῶν", "sacrifícios"],
  ["θύειν", "sacrificar"],
  ["θύουσιν", "sacrificam"],
  ["θύραι", "portas"],
  ["θύραις", "portas"],
  ["θώρακα", "couraça"],
  ["θῇ", "ponha"],
  ["θῦσον", "sacrifica"],

  // --- κά- palavras ---
  ["κάθου", "senta-te"],
  ["κάμινον", "fornalha"],
  ["κάτω", "abaixo"],

  // --- κέ- palavras (κέκληκα, κρίνω) ---
  ["κέκληκεν", "tem-chamado"],
  ["κέκρικα", "tenho-julgado"],
  ["κέκριται", "tem-sido-julgado"],
  ["κέντρον", "aguilhão"],
  ["κήπῳ", "jardim"],

  // --- καί- palavras ---
  ["καίτοι", "embora"],

  // --- καθ- palavras (sentar, purificar, dormir) ---
  ["καθήσεσθε", "sentareis"],
  ["καθίσαντες", "tendo-sentado"],
  ["καθίστησιν", "constitui"],
  ["καθαρίζονται", "são-purificados"],
  ["καθαρίσας", "tendo-purificado"],
  ["καθαρίσῃ", "purifique"],
  ["καθαρισμὸν", "purificação"],
  ["καθαρὸς", "puro"],
  ["καθαρᾶς", "pura"],
  ["καθεύδωμεν", "durmamos"],
  ["καθεύδων", "dormindo"],
  ["καθῆκαν", "desceram"],
  ["καθῆσθαι", "sentar"],

  // --- καιν- palavras (novo) ---
  ["καινούς", "novos"],
  ["καινοὺς", "novos"],
  ["καινοῦ", "novo"],
  ["καινότητι", "novidade"],

  // --- καιρ- palavras (tempo oportuno) ---
  ["καιρόν", "tempo-oportuno"],
  ["καιρὸς", "tempo-oportuno"],

  // --- κακ- palavras (mau) ---
  ["κακά", "males"],
  ["κακίαν", "malícia"],
  ["κακολογῶν", "falando-mal"],
  ["κακοποιῆσαι", "fazer-mal"],
  ["κακῶσαί", "maltratar"],

  // --- καλ- palavras (bom, chamar, cobrir) ---
  ["καλήν", "boa"],
  ["καλουμένη", "sendo-chamada"],
  ["καλουμένου", "sendo-chamado"],
  ["καλύπτει", "cobre"],
  ["καλῆς", "boa"],
  ["καλῇ", "boa"],

  // --- καμ/κανον/καρ- palavras ---
  ["καμήλου", "camelo"],
  ["κανόνι", "regra"],
  ["καρδίαι", "corações"],
  ["καρποφορεῖ", "frutifica"],
  ["καρποφοροῦσιν", "frutificam"],

  // --- κατά- palavras (prefixo: para-baixo, contra) ---
  ["κατάρα", "maldição"],
  ["κατάσχωμεν", "retenhamos"],
  ["κατέαξαν", "quebraram"],
  ["κατέκλασεν", "partiu"],
  ["κατέλαβεν", "alcançou"],
  ["κατέλιπεν", "deixou"],
  ["κατέστρεψεν", "derrubou"],
  ["κατέχεεν", "derramou"],
  ["κατέχειν", "reter"],
  ["κατέχοντες", "retendo"],
  ["κατήγαγον", "conduziram-abaixo"],
  ["κατήγοροί", "acusadores"],
  ["κατήντησαν", "chegaram"],
  ["κατήντησεν", "chegou"],

  // --- καταβ- palavras (descer) ---
  ["καταβάντες", "tendo-descido"],
  ["καταβέβηκα", "tenho-descido"],
  ["καταβήσεται", "descerá"],
  ["καταβήσῃ", "desças"],
  ["καταβαίνων", "descendo"],
  ["καταβαινόντων", "descendo"],
  ["καταβαλλόμενοι", "sendo-derrubados"],
  ["καταβολῆς", "fundação"],
  ["καταβῆναι", "descer"],
  ["καταβῇ", "desça"],

  // --- καταγ/καταθ/καταισχ- palavras ---
  ["καταγγέλλειν", "anunciar"],
  ["καταγγέλλω", "anuncio"],
  ["καταγινώσκῃ", "condene"],
  ["καταθέσθαι", "depositar-favor"],
  ["καταισχυνθήσεται", "será-envergonhado"],
  ["καταισχύνῃ", "envergonhe"],

  // --- κατακ- palavras ---
  ["κατακαίεται", "é-queimado"],
  ["κατακαύσει", "queimará"],
  ["κατακεῖσθαι", "estar-reclinado"],
  ["κατακλυσμὸς", "dilúvio"],
  ["κατακρινεῖ", "condenará"],
  ["κατακυριεύουσιν", "dominam"],

  // --- καταλ- palavras ---
  ["καταλλαγῆς", "reconciliação"],
  ["καταλυθῇ", "seja-destruído"],
  ["καταλύων", "destruindo"],

  // --- κατανο/καταπ/καταργ- palavras ---
  ["κατανοεῖς", "consideras"],
  ["κατανοῆσαι", "considerar"],
  ["καταπετάσματος", "véu"],
  ["καταποθῇ", "seja-tragado"],
  ["καταργεῖται", "é-anulado"],
  ["καταργηθήσεται", "será-anulado"],

  // --- καταρτ/κατασκ/καταστ/καταφρ- palavras ---
  ["καταρτίζοντας", "restaurando"],
  ["καταρτίσαι", "restaurar"],
  ["κατασκευάσας", "tendo-preparado"],
  ["κατασκηνοῖν", "aninhar"],
  ["κατασκηνώσεις", "aninharás"],
  ["καταστήσω", "constituirei"],
  ["καταστροφῇ", "ruína"],
  ["καταφρονήσει", "desprezará"],

  // --- κατε- palavras ---
  ["κατεδικάσατε", "condenastes"],
  ["κατενάρκησα", "fui-peso"],
  ["κατενόησεν", "considerou"],
  ["κατενόουν", "consideravam"],
  ["κατεξουσιάζουσιν", "exercem-autoridade-sobre"],
  ["κατευθύναι", "dirigir"],
  ["κατεῖχον", "retinham"],

  // --- κατηγ/κατηρτ/κατηχ/κατοικ- palavras ---
  ["κατηγορήσωσιν", "acusem"],
  ["κατηγορίαν", "acusação"],
  ["κατηγοροῦσίν", "acusam"],
  ["κατηρτίσω", "preparaste"],
  ["κατηχούμενος", "sendo-instruído"],
  ["κατοικοῦσιν", "habitam"],

  // --- καυ- palavras (queimar, gloriar-se) ---
  ["καυσούμενα", "sendo-consumidas-pelo-fogo"],
  ["καυχήσασθαι", "ter-se-gloriado"],
  ["καυχήσηται", "glorie-se"],
  ["καυχήσωμαι", "me-glorie"],
  ["καυχώμεθα", "gloriamo-nos"],
  ["καυχώμενος", "gloriando-se"],
  ["καυχᾶσθαι", "gloriar-se"],
  ["καυχῶνται", "gloriam-se"],
  ["καύχησιν", "glorificação"],

  // --- κεκλ- palavras ---
  ["κεκλεισμένων", "tendo-sido-fechadas"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10c (freq 2, parte 3/12) ===`);
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

console.log(`\n=== Resultado Lote 10c ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

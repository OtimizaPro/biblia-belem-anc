#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11i
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 9/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11i-${Date.now()}.sql`);

const translations = [
  // === Índices 1984-2231 de freq1-words.json (248 palavras) ===

  // --- εὔθ- (apropriado, animados) ---
  ["εὔθετόν", "apropriado"],
  ["εὔθετός", "apropriado"],
  ["εὔθυμοι", "animados"],

  // --- εὔκ- (oportuno) ---
  ["εὔκαιρον", "oportuno"],

  // --- εὔσ- (claro, decoroso) ---
  ["εὔσημον", "claro"],
  ["εὔσχημον", "decoroso"],

  // --- εὔφ- (respeitáveis) ---
  ["εὔφημα", "respeitáveis"],

  // --- εὔχ- (orar, útil) ---
  ["εὔχομαί", "oro"],
  ["εὔχρηστος", "útil"],

  // --- εὕρ- (encontrar, achar) ---
  ["εὕραμεν", "encontramos"],
  ["εὕρηκα", "tenho-encontrado"],
  ["εὕρισκον", "encontravam"],
  ["εὕροιεν", "encontrassem"],
  ["εὕρω", "encontre"],
  ["εὕρωμεν", "encontremos"],

  // --- ζέ- (ferventes, fervendo) ---
  ["ζέοντες", "fervendo"],
  ["ζέων", "fervendo"],

  // --- ζήσ- (viver) ---
  ["ζήσασα", "tendo-vivido"],
  ["ζήσεσθε", "vivereis"],
  ["ζήσετε", "vivereis"],
  ["ζήσουσιν", "viverão"],
  ["ζήσω", "viverei"],

  // --- ζήτ- (busca, buscar) ---
  ["ζήτησιν", "busca"],
  ["ζήτησις", "busca"],
  ["ζήτησον", "busca"],

  // --- ζευ- (correias, par) ---
  ["ζευκτηρίας", "correias"],
  ["ζεῦγος", "par"],

  // --- ζηλ- (zelar, ter-ciúmes, zelosos) ---
  ["ζηλοῖ", "tem-ciúmes"],
  ["ζηλοῦσθαι", "ser-zelados"],
  ["ζηλοῦσιν", "têm-ciúmes"],
  ["ζηλωταί", "zelosos"],
  ["ζηλωτὴν", "zeloso"],
  ["ζηλώσαντες", "tendo-sido-zelosos"],
  ["ζηλῶ", "zelo"],

  // --- ζημ- (perda, sofrer-perda) ---
  ["ζημίας", "perda"],
  ["ζημιωθήσεται", "sofrerá-perda"],
  ["ζημιωθείς", "tendo-sofrido-perda"],
  ["ζημιωθῆναι", "sofrer-perda"],
  ["ζημιωθῆτε", "sofrais-perda"],
  ["ζημιωθῇ", "sofra-perda"],

  // --- ζητ- (buscar, questão) ---
  ["ζητήματά", "questões"],
  ["ζητήματα", "questões"],
  ["ζητήματος", "questão"],
  ["ζητήσουσιν", "buscarão"],
  ["ζητήσῃ", "busque"],
  ["ζητείτω", "busque"],
  ["ζητεῖται", "é-buscado"],
  ["ζητηθήσεται", "será-buscado"],
  ["ζητησάτω", "busque"],
  ["ζητούντων", "buscando"],
  ["ζητοῦμέν", "buscamos"],
  ["ζητοῦντι", "buscando"],
  ["ζητῆσαι", "buscar"],

  // --- ζιζ- (joio) ---
  ["ζιζάνιά", "joio"],
  ["ζιζανίων", "joio"],

  // --- ζυγ- (jugo) ---
  ["ζυγόν", "jugo"],
  ["ζυγός", "jugo"],
  ["ζυγῷ", "jugo"],

  // --- ζωή (vida) ---
  ["ζωή", "vida"],

  // --- ζωγρ- (capturando-vivos) ---
  ["ζωγρῶν", "capturando-vivos"],

  // --- ζωογον- (vivificar, preservar-vivos) ---
  ["ζωογονήσει", "preservará-vivos"],
  ["ζωογονεῖσθαι", "ser-preservados-vivos"],
  ["ζωογονοῦντος", "preservando-vivos"],

  // --- ζωοποι- (vivificar) ---
  ["ζωοποιήσει", "vivificará"],
  ["ζωοποιεῖται", "é-vivificado"],
  ["ζωοποιηθήσονται", "serão-vivificados"],
  ["ζωοποιηθεὶς", "tendo-sido-vivificado"],
  ["ζωοποιοῦντος", "vivificando"],
  ["ζωοποιῆσαι", "vivificar"],

  // --- ζόφ- (trevas) ---
  ["ζόφον", "trevas"],
  ["ζόφου", "trevas"],
  ["ζόφῳ", "trevas"],

  // --- ζύμ- (fermento) ---
  ["ζύμην", "fermento"],

  // --- ζών- (cinto) ---
  ["ζώνη", "cinto"],
  ["ζώνην", "cinto"],

  // --- ζώσ- (cingir) ---
  ["ζώσει", "cingirá"],

  // --- ζῆτε (viver) ---
  ["ζῆτε", "vivais"],

  // --- ζῶν, ζῶντος, ζῶσα, ζῶσι (vivendo, vivo) ---
  ["ζῶν", "vivendo"],
  ["ζῶντος", "vivendo"],
  ["ζῶσα", "vivendo"],
  ["ζῶσι", "vivem"],

  // --- ηὐ- (formas aumentadas com εὐ-) ---
  ["ηὐδοκήσαμεν", "comprazemo-nos"],
  ["ηὐκαίρουν", "tinham-oportunidade"],
  ["ηὐλίζετο", "hospedava-se"],
  ["ηὐλίσθη", "hospedou-se"],
  ["ηὐφράνθη", "alegrou-se"],
  ["ηὐχαρίστησαν", "deram-graças"],
  ["ηὐχόμην", "desejava"],
  ["ηὑρίσκετο", "era-encontrado"],
  ["ηὔχοντο", "desejavam"],

  // --- θάλπ- (aquecer, cuidar) ---
  ["θάλπει", "cuida"],
  ["θάλπῃ", "cuide"],

  // --- θάμβ- (espanto) ---
  ["θάμβους", "espanto"],

  // --- θάρσ- (coragem) ---
  ["θάρσος", "coragem"],

  // --- θέλ- (querer, desejar) ---
  ["θέλετέ", "quereis"],
  ["θέλημά", "vontade"],
  ["θέλησιν", "vontade"],
  ["θέλοντές", "querendo"],
  ["θέλοντί", "querendo"],
  ["θέλοντα", "querendo"],
  ["θέλοντας", "querendo"],
  ["θέλοντι", "querendo"],
  ["θέλωσι", "queiram"],

  // --- θέν- (tendo-posto) ---
  ["θέντες", "tendo-posto"],
  ["θέντος", "tendo-posto"],

  // --- θέρμ- (calor) ---
  ["θέρμης", "calor"],

  // --- θέτε (ponde) ---
  ["θέτε", "ponde"],

  // --- θήκ- (bainha) ---
  ["θήκην", "bainha"],

  // --- θήλ- (fêmeas) ---
  ["θήλειαι", "fêmeas"],

  // --- θήρ- (caça, armadilha) ---
  ["θήραν", "caça"],

  // --- θήσ- (porás) ---
  ["θήσεις", "porás"],

  // --- θίγ- (tocar) ---
  ["θίγῃς", "toques"],

  // --- θαν- (mortal, morte, matar) ---
  ["θανάσιμόν", "mortal"],
  ["θανάτοις", "mortes"],
  ["θανατηφόρου", "mortífero"],
  ["θανατούμεθα", "somos-mortos"],
  ["θανατούμενοι", "sendo-mortos"],
  ["θανατοῦτε", "matais"],
  ["θανατωθεὶς", "tendo-sido-morto"],
  ["θανατώσωσιν", "matem"],

  // --- θαρρ- (ter-confiança) ---
  ["θαρροῦμεν", "temos-confiança"],
  ["θαρροῦντας", "tendo-confiança"],
  ["θαρρῆσαι", "ter-confiança"],

  // --- θαρσ- (ter-ânimo) ---
  ["θαρσεῖτε", "tende-ânimo"],

  // --- θαυμ- (maravilhar-se, admirar) ---
  ["θαυμάζητε", "maravilheis"],
  ["θαυμάζων", "maravilhando-se"],
  ["θαυμάσαι", "maravilhar-se"],
  ["θαυμάσαντες", "tendo-se-maravilhado"],
  ["θαυμάσατε", "maravilhai-vos"],
  ["θαυμάσια", "maravilhas"],
  ["θαυμάσῃς", "maravilles"],
  ["θαυμασθῆναι", "ser-maravilhado"],
  ["θαυμαστὸν", "maravilhoso"],

  // --- θαψ- (sepultar) ---
  ["θαψάντων", "tendo-sepultado"],

  // --- θαῦμα (maravilha) ---
  ["θαῦμα", "maravilha"],

  // --- θεά- (contemplar, assistir) ---
  ["θεάσασθε", "contemplai"],
  ["θεέ", "Theos"],
  ["θεασαμένοις", "tendo-contemplado"],
  ["θεατριζόμενοι", "sendo-expostos-publicamente"],

  // --- θει- (divindade) ---
  ["θειότης", "divindade"],

  // --- θελ- (vontades, querer) ---
  ["θελήματά", "vontades"],
  ["θελήματα", "vontades"],
  ["θελήσαντάς", "tendo-querido"],
  ["θελήσω", "quererei"],

  // --- θεμ- (fundamento, fundar) ---
  ["θεμέλια", "fundamentos"],
  ["θεμέλιος", "fundamento"],
  ["θεμελίου", "fundamento"],
  ["θεμελίους", "fundamentos"],
  ["θεμελίῳ", "fundamento"],
  ["θεμελιώσει", "firmará"],

  // --- θεο- (ensinados-por-Theos, lutadores-contra-Theos, piedade, piedoso, odiadores-de-Theos, deuses) ---
  ["θεοδίδακτοί", "ensinados-por-Theos"],
  ["θεομάχοι", "lutadores-contra-Theos"],
  ["θεοσέβειαν", "piedade-a-Theos"],
  ["θεοσεβὴς", "piedoso-a-Theos"],
  ["θεοστυγεῖς", "odiadores-de-Theos"],
  ["θεοῖς", "deuses"],

  // --- θεράπ- (curar, servo) ---
  ["θεράπευσον", "cura"],
  ["θεράπων", "servo"],

  // --- θερίζ- (ceifar) ---
  ["θερίζειν", "ceifar"],
  ["θερίζεις", "ceifas"],
  ["θερίζω", "ceifo"],

  // --- θεραπ- (curar) ---
  ["θεραπευθῆναι", "ser-curado"],
  ["θεραπεύει", "cura"],
  ["θεραπεύεσθαι", "ser-curado"],
  ["θεραπεύεσθε", "sois-curados"],
  ["θεραπεύεται", "é-curado"],
  ["θεραπεύοντες", "curando"],
  ["θεραπεύσει", "curará"],
  ["θεραπεύσω", "curarei"],

  // --- θερισ- (ceifa, ceifeiros) ---
  ["θερισάντων", "tendo-ceifado"],
  ["θερισμόν", "ceifa"],
  ["θερισμός", "ceifa"],
  ["θερισταὶ", "ceifeiros"],
  ["θερισταῖς", "ceifeiros"],

  // --- θερμ- (aquecer-se) ---
  ["θερμαίνεσθε", "aquecei-vos"],
  ["θερμαινόμενον", "aquecendo-se"],

  // --- θεωρ- (contemplar, ver) ---
  ["θεωρήσαντες", "tendo-contemplado"],
  ["θεωρήσουσιν", "contemplarão"],
  ["θεωρήσῃ", "contemple"],
  ["θεωρίαν", "espetáculo"],
  ["θεωρούντων", "contemplando"],
  ["θεωροῦντος", "contemplando"],
  ["θεωρῆσαι", "contemplar"],
  ["θεωρῆτε", "contempleis"],
  ["θεωρῇ", "contemple"],
  ["θεωρῶσιν", "contemplem"],

  // --- θεόπ- (inspirado-por-Theos) ---
  ["θεόπνευστος", "inspirado-por-Theos"],

  // --- θεᾶς (deusa) ---
  ["θεᾶς", "deusa"],

  // --- θεῖον (enxofre) ---
  ["θεῖον", "enxofre"],

  // --- θηλ- (amamentando, fêmeas) ---
  ["θηλαζόντων", "amamentando"],
  ["θηλείας", "fêmea"],

  // --- θηρ- (fera, apanhar) ---
  ["θηρίον", "fera"],
  ["θηρεῦσαί", "apanhar"],

  // --- θησ- (entesourar, tesouro) ---
  ["θησαυρίζειν", "entesourar"],
  ["θησαυρίζεις", "entesourás"],
  ["θησαυροὶ", "tesouros"],
  ["θησαυρός", "tesouro"],
  ["θησαυρὸς", "tesouro"],
  ["θησαυρῶν", "tesouros"],
  ["θησαυρῷ", "tesouro"],

  // --- θλίβ- (afligir, tribulação) ---
  ["θλίβεσθαι", "ser-afligido"],
  ["θλίβουσιν", "afligem"],
  ["θλίβωσιν", "aflinjam"],
  ["θλίψεις", "tribulações"],
  ["θλίψεσίν", "tribulações"],
  ["θλίψεως", "tribulação"],
  ["θλιβόμεθα", "somos-afligidos"],

  // --- θνητ- (mortal) ---
  ["θνητὰ", "mortal"],
  ["θνητῇ", "mortal"],
  ["θνητῷ", "mortal"],

  // --- θορυβ- (perturbar-se, tumulto) ---
  ["θορυβάζῃ", "perturbas-te"],
  ["θορυβούμενον", "sendo-tumultuado"],
  ["θορύβου", "tumulto"],

  // --- θρέμμ- (rebanhos) ---
  ["θρέμματα", "rebanhos"],

  // --- θρην- (lamentar) ---
  ["θρηνήσετε", "lamentareis"],

  // --- θρησκ- (religião, religioso) ---
  ["θρησκείας", "religião"],
  ["θρησκείᾳ", "religião"],
  ["θρησκὸς", "religioso"],

  // --- θριαμβ- (triunfar) ---
  ["θριαμβεύοντι", "triunfando"],
  ["θριαμβεύσας", "tendo-triunfado"],

  // --- θροε- (alarmar-se) ---
  ["θροεῖσθαι", "alarmar-se"],

  // --- θρόμ- (gotas) ---
  ["θρόμβοι", "gotas"],

  // --- θρόν- (trono) ---
  ["θρόνου", "trono"],

  // --- θυέλλ- (tempestade) ---
  ["θυέλλῃ", "tempestade"],

  // --- θυγ- (filhinha, filhas, filha) ---
  ["θυγάτριον", "filhinha"],
  ["θυγάτριόν", "filhinha"],
  ["θυγατέρας", "filhas"],
  ["θυγατέρων", "filhas"],
  ["θυγατρός", "filha"],
  ["θυγατρὶ", "filha"],

  // --- θυμι- (incensário, queimar-incenso) ---
  ["θυμιατήριον", "incensário"],
  ["θυμιᾶσαι", "queimar-incenso"],

  // --- θυμο- (furioso, furor) ---
  ["θυμομαχῶν", "furioso"],
  ["θυμόν", "furor"],
  ["θυμὸν", "furor"],

  // --- θυρε- (escudo) ---
  ["θυρεὸν", "escudo"],

  // --- θυρωρ- (porteiro) ---
  ["θυρωρός", "porteiro"],
  ["θυρωρὸς", "porteiro"],

  // --- θυσ- (sacrifício, altar) ---
  ["θυσία", "sacrifício"],
  ["θυσίαι", "sacrifícios"],
  ["θυσίᾳ", "sacrifício"],
  ["θυσιαστήριά", "altares"],
  ["θυσιαστήριον", "altar"],

  // --- θύγ- (filha) ---
  ["θύγατερ", "filha"],

  // --- θύε- (sacrificar) ---
  ["θύεσθαι", "ser-sacrificado"],

  // --- θύρα (porta) ---
  ["θύρα", "porta"],

  // --- θύσ- (sacrificar) ---
  ["θύσατε", "sacrificai"],
  ["θύσῃ", "sacrifique"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11i (freq 1, parte 9/44) ===`);
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

console.log(`\n=== Resultado Lote 11i ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

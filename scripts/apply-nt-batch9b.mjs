#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 9b
 * Aplica traduções literais para palavras gregas freq 3 no NT (parte 2/5)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch9b-${Date.now()}.sql`);

const translations = [
  ["εὐλογοῦμεν", "bendizemos"],
  ["εὐνοῦχοι", "eunucos"],
  ["εὐσεβείᾳ", "piedade"],
  ["εὐσχημόνως", "decorosamente"],
  ["εὐχαριστίᾳ", "ação-de-graças"],
  ["εὐχαριστοῦντες", "dando-graças"],
  ["εὕρωσιν", "encontrem"],
  ["εὖ", "bem"],
  ["ζήσει", "viverá"],
  ["ζημίαν", "perda"],
  ["ζητήσεις", "buscas"],
  ["ζητήσετέ", "buscareis"],
  ["ζητεῖτέ", "buscais"],
  ["ζωοποιεῖ", "vivifica"],
  ["θέατρον", "teatro"],
  ["θέλοι", "quisesse"],
  ["θέλῃ", "queira"],
  ["θέρος", "verão"],
  ["θήσω", "porei"],
  ["θαλάσσῃ", "mar"],
  ["θανατώσουσιν", "matarão"],
  ["θεασάμενος", "tendo-contemplado"],
  ["θελόντων", "dos-que-querem"],
  ["θεραπεῦσαι", "curar"],
  ["θερμαινόμενος", "aquecendo-se"],
  ["θεωροῦσιν", "contemplam"],
  ["θηλαζούσαις", "às-que-amamentam"],
  ["θησαυροὺς", "tesouros"],
  ["θλίψεων", "tribulações"],
  ["θλιβόμενοι", "sendo-atribulados"],
  ["θνητὸν", "mortal"],
  ["θυγατρὸς", "filha"],
  ["θυσίαις", "sacrifícios"],
  ["θόρυβον", "tumulto"],
  ["θόρυβος", "tumulto"],
  ["θύρᾳ", "porta"],
  ["θῆλυ", "fêmea"],
  ["καθέδρας", "cadeiras"],
  ["καθήμενον", "sentado"],
  ["καθαίρεσιν", "destruição"],
  ["καθαρίζετε", "limpais"],
  ["καθαρίσαι", "purificar"],
  ["καθαρίσθητι", "sê-purificado"],
  ["καθαροί", "puros"],
  ["καθαρὰ", "pura"],
  ["καθαρᾷ", "pura"],
  ["καθελὼν", "tendo-derrubado"],
  ["καθεύδει", "dorme"],
  ["καιροὶ", "tempos"],
  ["καιρῶν", "tempos"],
  ["κακοποιῶν", "malfeitores"],
  ["καλάμῳ", "cana"],
  ["καλέσεις", "chamarás"],
  ["καλεῖσθαι", "ser-chamado"],
  ["καλουμένην", "chamada"],
  ["καλοὺς", "bons"],
  ["καλοῖς", "boas"],
  ["καλοῦ", "bom"],
  ["καλός", "bom"],
  ["κατάκριμα", "condenação"],
  ["κατάπαυσίν", "repouso"],
  ["κατάρας", "maldição"],
  ["κατέβαινεν", "descia"],
  ["κατέπαυσεν", "descansou"],
  ["κατέχετε", "retende"],
  ["κατήργηται", "tem-sido-anulado"],
  ["καταβάς", "tendo-descido"],
  ["καταγγέλλεται", "é-anunciado"],
  ["καταισχύνει", "envergonha"],
  ["κατακείμενον", "reclinado"],
  ["καταλάβῃ", "alcance"],
  ["καταλείψει", "deixará"],
  ["καταλυθήσεται", "será-destruído"],
  ["καταμαρτυροῦσιν", "testemunham-contra"],
  ["κατανοήσατε", "considerai"],
  ["καταργήσει", "anulará"],
  ["καταργήσῃ", "anule"],
  ["κατασείσας", "tendo-acenado"],
  ["κατασκευάσει", "preparará"],
  ["καταστήσει", "estabelecerá"],
  ["κατεγέλων", "riam-se"],
  ["κατειργάσατο", "produziu"],
  ["κατελθὼν", "tendo-descido"],
  ["κατενώπιον", "diante-de"],
  ["κατεργάζομαι", "produzo"],
  ["κατεφίλησεν", "beijou-intensamente"],
  ["κατηντήσαμεν", "chegamos"],
  ["κατοικῆσαι", "habitar"],
  ["κατῴκησεν", "habitou"],
  ["καυχάσθω", "glorie-se"],
  ["καυχήσεως", "glorificação"],
  ["καυχώμενοι", "gloriando-se"],
  ["καυχᾶσαι", "glorias-te"],
  ["κείμενα", "postos"],
  ["κεκαλυμμένον", "tendo-sido-coberto"],
  ["κενόν", "vazio"],
  ["κενὴ", "vazia"],
  ["κλάδων", "ramos"],
  ["κλαίουσα", "chorando"],
  ["κληθῆναι", "ser-chamado"],
  ["κληρονομήσω", "herdarei"],
  ["κληρονομία", "herança"],
  ["κλῆμα", "ramo"],
  ["κοιλία", "ventre"],
  ["κοινωνίας", "comunhão"],
  ["κολλυβιστῶν", "cambistas"],
  ["κολλᾶσθαι", "unir-se"],
  ["κορασίῳ", "menina"],
  ["κράτιστε", "excelentíssimo"],
  ["κρίμα", "juízo"],
  ["κρίνομαι", "sou-julgado"],
  ["κρίσεως", "juízo"],
  ["κρατήσαντες", "tendo-agarrado"],
  ["κρεῖσσον", "melhor"],
  ["κρημνοῦ", "precipício"],
  ["κριθῆτε", "sejais-julgados"],
  ["κριταὶ", "juízes"],
  ["κτήματα", "propriedades"],
  ["κόκκον", "grão"],
  ["κόκκῳ", "grão"],
  ["κόποις", "labores"],
  ["κύριός", "senhor"],
  ["κύψας", "tendo-se-inclinado"],
  ["κἀκεῖνον", "e-aquele"],
  ["κῆνσον", "tributo"],
  ["λάβωσιν", "recebam"],
  ["λάλει", "fala"],
  ["λέγεται", "é-dito"],
  ["λέγοντας", "dizendo"],
  ["λέγωσιν", "digam"],
  ["λέγῃ", "diga"],
  ["λέπρα", "lepra"],
  ["λίθοις", "pedras"],
  ["λίθους", "pedras"],
  ["λαλήσητε", "faleis"],
  ["λαληθήσεται", "será-falado"],
  ["λαλουμένοις", "coisas-faladas"],
  ["λαμβάνουσιν", "recebem"],
  ["λαμβάνων", "recebendo"],
  ["λαμπάδας", "lâmpadas"],
  ["λατρεύειν", "servir-cultualmente"],
  ["λογίζεσθε", "considerai"],
  ["λογιζέσθω", "considere"],
  ["λοιποὺς", "restantes"],
  ["λυπούμενος", "entristecendo-se"],
  ["λόγια", "oráculos"],
  ["λύπης", "tristeza"],
  ["λύτρωσιν", "redenção"],
  ["λῃστὴν", "ladrão"],
  ["μάρτυρα", "testemunha"],
  ["μέγαν", "grande"],
  ["μέλεσιν", "membros"],
  ["μέλλοντας", "estando-para"],
  ["μένον", "permanecendo"],
  ["μέρει", "parte"],
  ["μέρη", "partes"],
  ["μέτοχοι", "participantes"],
  ["μέχρις", "até"],
  ["μαθητὴν", "discípulo"],
  ["μαθητῇ", "discípulo"],
  ["μακάριος", "bem-aventurado"],
  ["μακροθυμεῖ", "é-longânimo"],
  ["μαλακίαν", "enfermidade"],
  ["μαμωνᾷ", "mamom"],
  ["μαρτυρήσῃ", "testemunhe"],
  ["μαρτυρία", "testemunho"],
  ["μαρτυρεῖτε", "testemunhais"],
  ["μαρτύρομαι", "testifico"],
  ["μαχαίρης", "espada"],
  ["μείζονος", "maior"],
  ["μείνωσιν", "permaneçam"],
  ["μεριμνῶν", "preocupando-se"],
  ["μεταβὰς", "tendo-passado"],
  ["μεταλαβεῖν", "participar"],
  ["μετοικεσίας", "deportação"],
  ["μετρεῖτε", "medis"],
  ["μηδενὸς", "nenhum"],
  ["μικροῦ", "pequeno"],
  ["μικρότερος", "menor"],
  ["μικρῶν", "pequenos"],
  ["μισθαποδοσίαν", "recompensa"],
  ["μνήμασιν", "sepulcros"],
  ["μνήματι", "sepulcro"],
  ["μνημείων", "sepulcros"],
  ["μνημόσυνον", "memorial"],
  ["μνησθῆναι", "lembrar-se"],
  ["μνᾶ", "mina"],
  ["μνῆμα", "sepulcro"],
  ["μοιχαλὶς", "adúltera"],
  ["μοιχεύσεις", "adulterarás"],
  ["μοιχεύσῃς", "adulteres"],
  ["μονογενὴς", "unigênito"],
  ["μονογενῆ", "unigênito"],
  ["μωρία", "loucura"],
  ["μωραὶ", "tolas"],
  ["μόδιον", "alqueire"],
  ["μόνους", "somente"],
  ["μόσχον", "novilho"],
  ["μύθοις", "fábulas"],
  ["μύρῳ", "ungüento"],
  ["νίψαι", "lavar"],
  ["ναί", "sim"],
  ["ναοῦ", "santuário"],
  ["νεανίσκον", "jovem"],
  ["νεανίσκος", "jovem"],
  ["νεκρά", "morta"],
  ["νεκρὸς", "morto"],
  ["νενικήκατε", "tendes-vencido"],
  ["νεωτέρας", "mais-jovens"],
  ["νεότητος", "juventude"],
  ["νηπίοις", "infantes"],
  ["νηστείαις", "jejuns"],
  ["νηστεύσουσιν", "jejuarão"],
  ["νοΐ", "mente"],
  ["νοῒ", "mente"],
  ["νυμφῶνος", "câmara-nupcial"],
  ["νόσοις", "doenças"],
  ["νόσον", "doença"],
  ["νόσους", "doenças"],
  ["ξένος", "estrangeiro"],
  ["ξενίζεται", "hospeda-se"],
  ["οἰκοδομήσω", "edificarei"],
  ["οἰκοδομῆσαι", "edificar"],
  ["οἰκονόμον", "administrador"],
  ["οἰκονόμος", "administrador"],
  ["οἰκτιρμῶν", "compaixões"],
  ["οἵτινές", "os-quais"],
  ["οἷον", "qual"],
  ["οὐδεμία", "nenhuma"],
  ["οὐθὲν", "nada"],
  ["οὐχί", "não"],
  ["πάντοθεν", "de-todo-lado"],
  ["πάρεστιν", "está-presente"],
  ["πίητε", "bebais"],
  ["πίνητε", "bebais"],
  ["πίνω", "bebo"],
  ["παγίδα", "laço"],
  ["παιδὸς", "servo"],
  ["παλαιούς", "velhos"],
  ["παλαιὸν", "velho"],
  ["πανοπλίαν", "armadura-completa"],
  ["παντός", "todo"],
  ["παράκλησις", "consolação"],
  ["παράλαβε", "recebe"],
  ["παράπτωμα", "transgressão"],
  ["παρέθηκεν", "pôs-diante"],
  ["παρέστησαν", "apresentaram"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 9b (freq 3, parte 2/5) ===`);
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

console.log(`\n=== Resultado Lote 9b ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10e
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 5/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10e-${Date.now()}.sql`);

const translations = [
  // === Índices 992-1239 de freq2-words.json (248 palavras) ===

  // --- μ- palavras (continuação) ---
  ["μετῆρεν", "partiu"],
  ["μεῖζόν", "maior"],
  ["μηδείς", "ninguém"],
  ["μητέρας", "mães"],
  ["μιανθῶσιν", "sejam-contaminados"],
  ["μικρότερον", "menor"],
  ["μικρὰ", "pequena"],
  ["μιμεῖσθαι", "imitar"],
  ["μιμηταί", "imitadores"],
  ["μισήσει", "odiará"],
  ["μισοῦντες", "odiando"],
  ["μνήσθητε", "lembrai-vos"],
  ["μνημονεύοντες", "lembrando"],
  ["μοιχεύει", "comete-adultério"],
  ["μοιχεύεις", "cometes-adultério"],
  ["μοιχεῖαι", "adultérios"],
  ["μονογενοῦς", "unigênito"],
  ["μονόφθαλμον", "com-um-só-olho"],
  ["μορφῇ", "forma"],
  ["μού", "meu"],
  ["μυρίους", "dez-mil"],
  ["μυριάσιν", "miríades"],
  ["μυστήριον", "mistério"],
  ["μυστηρίῳ", "mistério"],
  ["μωρανθῇ", "torne-se-insípido"],
  ["μωροὶ", "tolos"],
  ["μωρὰς", "tolas"],
  ["μόνας", "somente"],
  ["μόνου", "somente"],
  ["μόρφωσιν", "forma-exterior"],
  ["μόσχων", "bezerros"],
  ["μόχθῳ", "labor"],
  ["μύθους", "fábulas"],
  ["μύλος", "pedra-de-moinho"],
  ["μὴν", "certamente"],

  // --- ν- palavras ---
  ["νάρδου", "nardo"],
  ["νέας", "novas"],
  ["νέκρωσιν", "mortificação"],
  ["νήπιοι", "criancinhas"],
  ["νήστεις", "em-jejum"],
  ["νήφωμεν", "sejamos-sóbrios"],
  ["νίπτειν", "lavar"],
  ["ναὸν", "santuário"],
  ["νεκροῖς", "mortos"],
  ["νεκρόν", "morto"],
  ["νενομοθέτηται", "tem-sido-legislado"],
  ["νεφέλαις", "nuvens"],
  ["νεφέλῃ", "nuvem"],
  ["νεωτέρους", "mais-jovens"],
  ["νεώτεροι", "mais-jovens"],
  ["νηπίων", "criancinhas"],
  ["νηστεύειν", "jejuar"],
  ["νηστεύοντες", "jejuando"],
  ["νηστεύων", "jejuando"],
  ["νηφαλίους", "sóbrios"],
  ["νοείτω", "entenda"],
  ["νομίμως", "legitimamente"],
  ["νομίσητε", "penseis"],
  ["νομικοῖς", "legistas"],
  ["νομοδιδάσκαλοι", "mestres-da-lei"],
  ["νομὴν", "pasto"],
  ["νοοῦμεν", "entendemos"],
  ["νουθεσίαν", "admoestação"],
  ["νουθετεῖτε", "admoestai"],
  ["νουθετοῦντες", "admoestando"],
  ["νουθετῶν", "admoestando"],
  ["νοός", "mente"],
  ["νοῦς", "mente"],
  ["νυμφίον", "noivo"],
  ["νωθροὶ", "lentos"],
  ["νόμους", "leis"],
  ["νόσων", "doenças"],
  ["νύμφην", "noiva"],
  ["νῆσον", "ilha"],

  // --- ξ- palavras ---
  ["ξένον", "estranho"],
  ["ξενίαν", "hospedagem"],
  ["ξηράν", "seca"],
  ["ξηρὰν", "seca"],

  // --- οι- palavras ---
  ["οἰκεῖν", "habitar"],
  ["οἰκητήριον", "habitação"],
  ["οἰκοδεσπότου", "dono-de-casa"],
  ["οἰκοδομῆς", "edificação"],
  ["οἰκοδομῶ", "edifico"],
  ["οἰκοδομῶν", "edificando"],
  ["οἰκονομίας", "administração"],
  ["οἰκονόμους", "administradores"],
  ["οἰκουμένῃ", "terra-habitada"],
  ["οἰκτίρμων", "misericordioso"],
  ["οἰνοπότης", "bebedor-de-vinho"],
  ["οἵα", "quais"],
  ["οἵους", "quais"],
  ["οἶνον", "vinho"],
  ["οἷος", "qual"],

  // --- ου- palavras ---
  ["οὐδείς", "ninguém"],
  ["οὐδενός", "ninguém"],
  ["οὐθέν", "nada"],
  ["οὐρανούς", "céus"],
  ["οὐρανόθεν", "do-céu"],
  ["οὖς", "ouvido"],

  // --- π- palavras (πά-) ---
  ["πάντοτέ", "sempre"],
  ["πάρεχε", "apresenta"],
  ["πάροινον", "não-dado-ao-vinho"],
  ["πάσχοντες", "sofrendo"],
  ["πάσχων", "sofrendo"],
  ["πάτερ", "pai"],

  // --- πέ- palavras ---
  ["πέδαις", "grilhões"],
  ["πέμψαντος", "tendo-enviado"],
  ["πέποιθα", "tenho-confiado"],
  ["πέποιθεν", "tem-confiado"],
  ["πέρυσι", "desde-o-ano-passado"],
  ["πέτρα", "rocha"],
  ["πέτρᾳ", "rocha"],

  // --- πί- palavras ---
  ["πίεσθε", "bebereis"],
  ["πίνετε", "bebei"],
  ["πίνοντες", "bebendo"],
  ["πίνῃ", "beba"],
  ["πίωμεν", "bebamos"],

  // --- παι- palavras ---
  ["παίσας", "tendo-golpeado"],
  ["παιδίοις", "criancinhas"],
  ["παιδίσκην", "serva"],
  ["παιδείαν", "disciplina"],
  ["παιδείας", "disciplina"],
  ["παιδεύει", "disciplina"],
  ["παιδεύσας", "tendo-disciplinado"],

  // --- παλ- palavras ---
  ["παλαιά", "velha"],
  ["παλαιόν", "velho"],
  ["παλαιὰν", "velha"],
  ["παλαιῷ", "velho"],

  // --- παρ- palavras ---
  ["παράβασις", "transgressão"],
  ["παράγγελλε", "ordena"],
  ["παράγει", "passa"],
  ["παράγεται", "passa"],
  ["παρέδωκας", "entregaste"],
  ["παρέθεντο", "confiaram"],
  ["παρένεγκε", "afasta"],
  ["παρέστη", "apresentou-se"],
  ["παρέστηκεν", "tem-estado-de-pé"],
  ["παρέστησεν", "apresentou"],
  ["παρέχετε", "apresentai"],
  ["παρήγγειλαν", "ordenaram"],
  ["παραβάσεων", "transgressões"],
  ["παραβάσεως", "transgressão"],
  ["παραβάτην", "transgressor"],
  ["παραβάτης", "transgressor"],
  ["παραβολή", "parábola"],
  ["παραβολῇ", "parábola"],
  ["παραγγέλλομεν", "ordenamos"],
  ["παραγγέλλω", "ordeno"],
  ["παραγγελίαν", "ordem"],
  ["παραγγελίας", "ordem"],
  ["παραδίδοσθαι", "ser-entregue"],
  ["παραδιδόναι", "entregar"],
  ["παραδιδόντες", "entregando"],
  ["παραδοθῆναι", "ser-entregue"],
  ["παραδόσεις", "tradições"],
  ["παραζηλώσω", "provocarei-a-ciúmes"],
  ["παρακαλέσας", "tendo-exortado"],
  ["παρακαλέσῃ", "exorte"],
  ["παρακαλούμεθα", "somos-exortados"],
  ["παρακαλοῦσιν", "exortam"],
  ["παρακούσῃ", "recuse-ouvir"],
  ["παραλαβόντες", "tendo-recebido"],
  ["παραλαμβάνεται", "é-tomado"],
  ["παραλελυμένος", "tendo-sido-paralisado"],
  ["παραλημφθήσεται", "será-tomado"],
  ["παραλυτικὸν", "paralítico"],
  ["παραμυθούμενοι", "consolando"],
  ["παραπικρασμῷ", "provocação"],
  ["παραπτωμάτων", "transgressões"],
  ["παραστήσατε", "apresentai"],
  ["παρατίθεμαι", "confio"],
  ["παρατιθῶσιν", "confiem"],
  ["παραχειμάσαι", "passar-o-inverno"],
  ["παρεγενόμην", "cheguei"],
  ["παρεδίδου", "entregava"],
  ["παρεδώκατε", "entregastes"],
  ["παρεκάλεσεν", "exortou"],
  ["παρεκλήθημεν", "fomos-exortados"],
  ["παρελεύσεται", "passará"],
  ["παρελθὼν", "tendo-passado"],
  ["παρεμβολῆς", "acampamento"],
  ["παρεστηκότων", "tendo-estado-de-pé"],
  ["παρεστῶτες", "estando-de-pé"],
  ["παρετηροῦντο", "observavam"],
  ["παρηγγείλαμεν", "ordenamos"],
  ["παριστάνετε", "apresentai"],
  ["παροιμίαις", "provérbios"],
  ["παροιμίαν", "provérbio"],
  ["παρρησία", "ousadia"],
  ["παρρησιαζόμενος", "falando-ousadamente"],
  ["παρῃτημένον", "tendo-sido-rejeitado"],
  ["παρῆλθεν", "passou"],
  ["πασῶν", "todas"],
  ["πατήρ", "pai"],
  ["πατρί", "pai"],
  ["παῖδα", "servo"],

  // --- πει- palavras ---
  ["πείθεσθαι", "obedecer"],
  ["πείθων", "persuadindo"],
  ["πείσαντες", "tendo-persuadido"],
  ["πείσομεν", "persuadiremos"],
  ["πεζῇ", "a-pé"],
  ["πεινῶντα", "tendo-fome"],
  ["πεινῶντες", "tendo-fome"],
  ["πειρασθῆναι", "ser-tentado"],

  // --- πεπ- palavras ---
  ["πεπίστευκα", "tenho-crido"],
  ["πεπίστευκεν", "tem-crido"],
  ["πεπίστευμαι", "tenho-sido-confiado"],
  ["πεπιστευκότες", "tendo-crido"],
  ["πεπιστεύκαμεν", "temos-crido"],
  ["πεπλήρωκεν", "tem-cumprido"],
  ["πεπλήρωμαι", "tenho-sido-preenchido"],
  ["πεποίηκα", "tenho-feito"],
  ["πεποιηκώς", "tendo-feito"],
  ["πεποιθότας", "tendo-confiado"],
  ["πεποιθότες", "tendo-confiado"],
  ["πεπραγμένον", "tendo-sido-praticado"],

  // --- περ- palavras ---
  ["περάτων", "confins"],
  ["περίλυπος", "profundamente-triste"],
  ["περίσσευμα", "abundância"],
  ["περιΐστασο", "evita"],
  ["περιέθηκεν", "colocou-ao-redor"],
  ["περιέτεμεν", "circuncidou"],
  ["περιεβάλετέ", "vestistes"],
  ["περιεβάλετο", "vestiu-se"],
  ["περιθεὶς", "tendo-posto-ao-redor"],
  ["περικεφαλαίαν", "capacete"],
  ["περιλειπόμενοι", "restando"],
  ["περιπατεῖν", "andar"],
  ["περιπατεῖς", "andas"],
  ["περιπατοῦντος", "andando"],
  ["περιπατῆσαι", "andar"],
  ["περιπατῆτε", "andeis"],
  ["περισσευθήσεται", "será-feito-abundar"],
  ["περισσεύματος", "abundância"],
  ["περισσεύοντες", "abundando"],
  ["περισσεύοντος", "abundando"],
  ["περισσεύσῃ", "abunde"],
  ["περισσεύῃ", "abunde"],
  ["περισσεῦον", "abundando"],
  ["περιτέμνειν", "circuncidar"],
  ["περιτέμνεσθαι", "ser-circuncidado"],
  ["περιτεμεῖν", "circuncidar"],
  ["περιτομήν", "circuncisão"],

  // --- πεσ- / πεφ- / πει- palavras finais ---
  ["πεσεῖται", "cairá"],
  ["πεσοῦνται", "cairão"],
  ["πεφανέρωται", "tem-sido-manifestado"],
  ["πεφανερῶσθαι", "ter-sido-manifestado"],
  ["πεῖραν", "prova"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10e (freq 2, parte 5/12) ===`);
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

console.log(`\n=== Resultado Lote 10e ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

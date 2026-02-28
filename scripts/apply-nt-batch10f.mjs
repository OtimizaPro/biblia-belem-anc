#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10f
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 6/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10f-${Date.now()}.sql`);

const translations = [
  // === Índices 1240-1487 de freq2-words.json (248 palavras) ===

  // --- πι- palavras ---
  ["πιάσας", "tendo-agarrado"],
  ["πιάσωσιν", "agarrem"],
  ["πιεῖν", "beber"],
  ["πικρῶς", "amargamente"],
  ["πινέτω", "beba"],
  ["πιπτόντων", "caindo"],
  ["πιστά", "fiéis"],
  ["πιστέ", "fiel"],
  ["πιστεύσας", "tendo-crido"],
  ["πιστεύσετε", "crereis"],
  ["πιστεύσω", "creia"],
  ["πιστεύσωμεν", "creiamos"],
  ["πιστεύσῃς", "creias"],
  ["πιστεύῃ", "creia"],
  ["πιστικῆς", "genuína"],
  ["πιστοὶ", "fiéis"],
  ["πιστοὺς", "fiéis"],
  ["πιστοῦ", "fiel"],
  ["πιστός", "fiel"],
  ["πιστῶν", "fiéis"],

  // --- πλ- palavras ---
  ["πλάνοι", "enganadores"],
  ["πλάνος", "enganador"],
  ["πλήκτην", "agressor"],
  ["πλήρη", "cheio"],
  ["πλανηθῇ", "seja-desviado"],
  ["πλαξὶν", "tábuas"],
  ["πλατείαις", "praças"],
  ["πλείονα", "mais"],
  ["πλείοσιν", "mais"],
  ["πλεονάζοντα", "abundando"],
  ["πλεονάσῃ", "abunde"],
  ["πλεονέκτης", "ganancioso"],
  ["πλεονεξίαν", "ganância"],
  ["πλεῖστος", "muito-grande"],
  ["πληροφορίᾳ", "plena-convicção"],
  ["πληρωθῆναι", "ser-cumprido"],
  ["πληρωθῆτε", "sejais-preenchidos"],
  ["πληρωθῶσιν", "sejam-cumpridos"],
  ["πληρώματα", "plenitudes"],
  ["πληρώσῃ", "cumpra"],
  ["πλησθεὶς", "tendo-sido-preenchido"],
  ["πλοιάρια", "barquinhos"],
  ["πλοιάριον", "barquinho"],
  ["πλουσίοις", "ricos"],
  ["πλουσίου", "rico"],
  ["πλουσίους", "ricos"],
  ["πλουτεῖν", "enriquecer"],
  ["πλουτῶν", "enriquecendo"],
  ["πλοῦν", "navegação"],

  // --- πν- palavras ---
  ["πνευματικαῖς", "espirituais"],
  ["πνευματικός", "espiritual"],
  ["πνευματικὸς", "espiritual"],
  ["πνευματικῇ", "espiritual"],
  ["πνεύμασι", "espíritos"],
  ["πνεύματα", "espíritos"],

  // --- ποι- palavras ---
  ["ποίας", "de-qual"],
  ["ποίμνην", "rebanho"],
  ["ποίμνης", "rebanho"],
  ["ποίμνιον", "pequeno-rebanho"],
  ["ποιήσετε", "fareis"],
  ["ποιείτω", "faça"],
  ["ποιησάμενος", "tendo-feito"],
  ["ποιηταὶ", "praticantes"],
  ["ποιητὴς", "praticante"],
  ["ποικίλοις", "variados"],
  ["ποιμνίου", "rebanho"],
  ["ποιοῦμαι", "faço"],
  ["ποιοῦντι", "fazendo"],
  ["ποιῶμεν", "façamos"],

  // --- πολ- palavras ---
  ["πολέμων", "guerras"],
  ["πολιτάρχας", "politarcas"],
  ["πολλήν", "muita"],
  ["πολλαπλασίονα", "muitas-vezes-mais"],
  ["πολύ", "muito"],
  ["πολύς", "muito"],

  // --- πον- palavras ---
  ["πονηραί", "más"],
  ["πονηρούς", "maus"],
  ["πονηρός", "mau"],
  ["πονηρότερα", "piores"],
  ["πονηρᾷ", "má"],
  ["πονηρῷ", "mau"],

  // --- πορ- palavras ---
  ["πορευθῆναι", "ir"],
  ["πορευθῶ", "vá"],
  ["πορευομένου", "indo"],
  ["πορευομένους", "indo"],
  ["πορευόμενον", "indo"],
  ["πορεύεται", "vai"],
  ["πορεύσομαι", "irei"],
  ["πορεύωμαι", "vá"],
  ["πορνεῖαι", "fornicações"],
  ["ποσίν", "pés"],
  ["ποτίζων", "regando"],
  ["ποτίσῃ", "dê-de-beber"],

  // --- πρ- palavras ---
  ["πράξεις", "ações"],
  ["πράσσετε", "praticais"],
  ["πράσσοντες", "praticando"],
  ["πράσσουσιν", "praticam"],
  ["πρέπον", "conveniente"],
  ["πραΰτητα", "mansidão"],
  ["πραιτωρίῳ", "pretório"],
  ["πραξάντων", "tendo-praticado"],
  ["πρασιαὶ", "canteiros"],
  ["πρεσβείαν", "embaixada"],
  ["πρεσβυτέριον", "conselho-de-anciãos"],
  ["πρεσβυτέρους", "anciãos"],
  ["πρεσβύτης", "ancião"],

  // --- προ- palavras ---
  ["προΐστασθαι", "presidir"],
  ["προάγειν", "conduzir-adiante"],
  ["προάγων", "precedendo"],
  ["προάξω", "conduzirei-adiante"],
  ["προέγνω", "conheceu-de-antemão"],
  ["προέθετο", "propôs"],
  ["προαγαγεῖν", "trazer-adiante"],
  ["προβάτιά", "ovelhinhas"],
  ["προβεβηκυῖα", "tendo-avançado"],
  ["προβὰς", "tendo-avançado"],
  ["προδόται", "traidores"],
  ["προεγράφη", "foi-escrito-antes"],
  ["προειρημένων", "tendo-sido-ditos-antes"],
  ["προελθόντες", "tendo-ido-adiante"],
  ["προελθὼν", "tendo-ido-adiante"],
  ["προητοίμασεν", "preparou-de-antemão"],
  ["προθέσει", "propósito"],
  ["προθυμία", "prontidão"],
  ["προθυμίαν", "prontidão"],
  ["προκειμένης", "estando-posta-diante"],
  ["προκοπὴν", "progresso"],
  ["προλέγω", "digo-de-antemão"],
  ["προπεμφθῆναι", "ser-enviado-adiante"],

  // --- προσ- palavras ---
  ["προσέκοψαν", "tropeçaram"],
  ["προσένεγκε", "oferece"],
  ["προσέρηξεν", "arrojou-se-contra"],
  ["προσέρχονται", "aproximam-se"],
  ["προσέφερον", "ofereciam"],
  ["προσήλυτον", "prosélito"],
  ["προσαίτης", "mendigo"],
  ["προσδεχομένοις", "esperando"],
  ["προσδεχόμενος", "esperando"],
  ["προσδοκίας", "expectativa"],
  ["προσδοκᾷ", "espera"],
  ["προσδραμὼν", "tendo-corrido-até"],
  ["προσελάβετο", "tomou-consigo"],
  ["προσεληλύθατε", "tendes-vos-aproximado"],
  ["προσελθοῦσα", "tendo-se-aproximado"],
  ["προσενέγκας", "tendo-oferecido"],
  ["προσερχομένου", "aproximando-se"],
  ["προσερχομένους", "aproximando-se"],
  ["προσερχόμενοι", "aproximando-se"],
  ["προσερχώμεθα", "aproximemo-nos"],
  ["προσευχάς", "orações"],
  ["προσευχέσθω", "ore"],
  ["προσευχομένου", "orando"],
  ["προσευχὴ", "oração"],
  ["προσευχὴν", "oração"],
  ["προσεύξομαι", "orarei"],
  ["προσεύξωμαι", "ore"],
  ["προσεύχεται", "ora"],
  ["προσεύχησθε", "oreis"],
  ["προσηνέχθη", "foi-oferecido"],
  ["προσθεῖναι", "acrescentar"],
  ["προσκαλεσάμενοι", "tendo-chamado-a-si"],
  ["προσκαλεσάμενός", "tendo-chamado-a-si"],
  ["προσκαλεῖται", "chama-a-si"],
  ["προσκυνήσων", "para-adorar"],
  ["προσκυνήσῃς", "adores"],
  ["προσκόψῃς", "tropeçes"],
  ["προσλαβόμενοι", "tendo-tomado-consigo"],
  ["προσλαβόμενος", "tendo-tomado-consigo"],
  ["προσλαμβάνεσθε", "acolhei"],
  ["προσμένειν", "permanecer-junto"],
  ["προσμένουσίν", "permanecem-junto"],
  ["προσφέρονται", "são-oferecidos"],
  ["προσφέρῃ", "ofereça"],
  ["προσφορὰ", "oferta"],
  ["προσφορὰν", "oferta"],

  // --- προφ- palavras ---
  ["προφέρει", "produz"],
  ["προφητείαν", "profecia"],
  ["προφητεύειν", "profetizar"],
  ["προφητεύητε", "profetizeis"],
  ["προφητεύσουσιν", "profetizarão"],
  ["προῆλθον", "foram-adiante"],

  // --- πρ- restantes ---
  ["πρωτοκλισίαν", "primeiro-assento"],
  ["πρόβατον", "ovelha"],
  ["πρόθεσις", "propósito"],
  ["πρόσκομμα", "tropeço"],
  ["πρᾶξιν", "ação"],

  // --- πτ- palavras ---
  ["πτερύγιον", "pináculo"],
  ["πτωχῶν", "pobres"],
  ["πτύον", "pá"],
  ["πτύσας", "tendo-cuspido"],

  // --- πυ- palavras ---
  ["πυλῶνος", "portão"],
  ["πυρετῷ", "febre"],
  ["πυρράζει", "avermelha"],

  // --- πω- palavras ---
  ["πωλούντων", "vendendo"],

  // --- π- com acentos/espíritos diversos ---
  ["πόλεις", "cidades"],
  ["πόλεμον", "guerra"],
  ["πόλεσιν", "cidades"],
  ["πόρναι", "prostitutas"],
  ["πόρνη", "prostituta"],
  ["πόρρωθεν", "de-longe"],
  ["πόσα", "quantas"],
  ["πόσις", "bebida"],
  ["πόσον", "quanto"],
  ["πόσους", "quantos"],
  ["πύλη", "porta"],
  ["πώλησον", "vende"],
  ["πᾶσάν", "toda"],
  ["πῆχυν", "côvado"],

  // --- σ- palavras ---
  ["σά", "tuas"],
  ["σάκκῳ", "saco"],
  ["σάλπιγγι", "trombeta"],
  ["σάτα", "satas"],
  ["σέβονταί", "adoram"],
  ["σίτου", "trigo"],
  ["σαβαχθανεί", "sabactâni"],
  ["σαλευθῆναι", "ser-abalado"],
  ["σαλευόμενον", "sendo-abalado"],
  ["σαπρόν", "podre"],
  ["σαρκικοί", "carnais"],
  ["σαρκικὰ", "carnais"],
  ["σεβομένων", "adorando"],
  ["σεισμοὶ", "terremotos"],
  ["σεισμὸς", "terremoto"],
  ["σεμνούς", "dignos"],
  ["σεσαρωμένον", "tendo-sido-varrido"],
  ["σεσῳσμένοι", "tendo-sido-salvos"],
  ["σιαγόνα", "face"],
  ["σιγάτω", "cale-se"],
  ["σιτευτόν", "cevado"],

  // --- σκ- palavras ---
  ["σκάφης", "bote"],
  ["σκανδάλου", "tropeço"],
  ["σκανδαλίζεται", "é-escandalizado"],
  ["σκανδαλίζῃ", "escandaliza"],
  ["σκανδαλισθήσεσθε", "sereis-escandalizados"],
  ["σκανδαλισθῇ", "seja-escandalizado"],
  ["σκεύει", "vaso"],
  ["σκεῦός", "vaso"],
  ["σκιὰ", "sombra"],
  ["σκληρῶν", "duros"],
  ["σκολιᾶς", "perversa"],
  ["σκοτεινόν", "tenebroso"],
  ["σκοτισθήσεται", "será-obscurecido"],
  ["σκυθρωποί", "de-rosto-triste"],

  // --- σο- palavras ---
  ["σουδαρίῳ", "lenço"],
  ["σοφοὶ", "sábios"],
  ["σοφός", "sábio"],

  // --- σπ- palavras ---
  ["σπένδομαι", "sou-derramado-como-libação"],
  ["σπέρματί", "semente"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10f (freq 2, parte 6/12) ===`);
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

console.log(`\n=== Resultado Lote 10f ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

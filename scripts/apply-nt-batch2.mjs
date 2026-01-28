#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 2
 * Aplica traduções literais para palavras gregas freq 9 no NT
 * Filosofia: literalidade rígida, palavra por palavra
 */

import { execSync } from 'child_process';

const DB = 'biblia-belem';

const translations = [
  // freq 9
  ["Ὕπαγε", "Vai"],
  ["ὑφ'", "sob"],
  ["ὑπηρέται", "servos"],
  ["ὑπέστρεψαν", "retornaram"],
  ["ὀργὴ", "ira"],
  ["ὀκτὼ", "oito"],
  ["ἴδωσιν", "vejam"],
  ["ἴδια", "próprias"],
  ["ἤλθομεν", "viemos"],
  ["Ἐλεισάβετ", "Elisabete"],
  ["ἔσχατοι", "últimos"],
  ["ἔστη", "pôs-se-de-pé"],
  ["ἔσεσθε", "sereis"],
  ["ἑώρακεν", "tem-visto"],
  ["ἑστὼς", "estando-de-pé"],
  ["ἑαυτόν", "a-si-mesmo"],
  ["ἐπηρώτων", "perguntavam"],
  ["ἐξεπλήσσοντο", "ficavam-espantados"],
  ["ἐξελθεῖν", "sair"],
  ["ἐξήλθατε", "saístes"],
  ["ἐντολῆς", "mandamento"],
  ["ἐντεῦθεν", "daqui"],
  ["ἐμὸν", "meu"],
  ["ἐλπίζω", "espero"],
  ["ἐλεύσονται", "virão"],
  ["ἐκείνων", "daqueles"],
  ["ἐδίδου", "dava"],
  ["ἐγερθεὶς", "levantando-se"],
  ["ἐγείρονται", "são-levantados"],
  ["ἐγήγερται", "foi-levantado"],
  ["Ἀγαπητοί", "Amados"],
  ["Ἀγαπήσεις", "Amarás"],
  ["ἅπαντα", "todas-as-coisas"],
  ["ἄφες", "deixa"],
  ["ἄλλους", "outros"],
  ["ἄλλος", "outro"],
  ["ἁμαρτωλοὶ", "pecadores"],
  ["ἀνεχώρησεν", "retirou-se"],
  ["ἀκροβυστία", "incircuncisão"],
  ["ἀκούουσιν", "ouvem"],
  ["ἀκάθαρτον", "impuro"],
  ["ἀγρῷ", "campo"],
  ["χαίρετε", "alegrai-vos"],
  ["φόβου", "medo"],
  ["τύπον", "modelo"],
  ["τοιαῦτα", "tais-coisas"],
  ["στρατιῶται", "soldados"],
  ["σπλάγχνα", "entranhas"],
  ["σάρξ", "carne"],
  ["πτωχοῖς", "pobres"],
  ["προφήταις", "profetas"],
  ["προσευχόμενοι", "orando"],
  ["προβάτων", "ovelhas"],
  ["πλείους", "mais"],
  ["πλήρης", "cheio"],
  ["περισσότερον", "abundantemente"],
  ["περιπατεῖτε", "andai"],
  ["παῖς", "servo"],
  ["παρουσίᾳ", "presença"],
  ["παραλαβὼν", "tomando-consigo"],
  ["παρακαλῶν", "exortando"],
  ["παράδοσιν", "tradição"],
  ["οὖσιν", "estando"],
  ["οὐδενὶ", "a-ninguém"],
  ["οἰκία", "casa"],
  ["νυμφίος", "noivo"],
  ["νέον", "novo"],
  ["μεταξὺ", "entre"],
  ["μέλλων", "estando-prestes-a"],
  ["λοιπὸν", "restante"],
  ["λίθος", "pedra"],
  ["κἀκεῖ", "e-ali"],
  ["κρίνων", "julgando"],
  ["κρίνετε", "julgais"],
  ["κληθήσεται", "será-chamado"],
  ["κλαυθμὸς", "choro"],
  ["καύχημα", "orgulho"],
  ["καταβὰς", "descendo"],
  ["κατέναντι", "defronte-de"],
  ["καλὴν", "boa"],
  ["θεωρεῖ", "contempla"],
  ["ζητῶν", "buscando"],
  ["ζητεῖ", "busca"],
  ["ζήσεται", "viverá"],
  ["εὑρὼν", "encontrando"],
  ["εὐχαριστήσας", "tendo-dado-graças"],
  ["εὐλόγησεν", "abençoou"],
  ["δοκεῖτε", "pensais"],
  ["διδάσκοντες", "ensinando"],
  ["διδάσκαλος", "mestre"],
  ["δίκαιοι", "justos"],
  ["δέδωκάς", "tens-dado"],
  ["βήματος", "tribunal"],
  ["Φίλιππον", "Filipe"],
  ["Σήμερον", "Hoje"],
  ["Μήτι", "Acaso"],
  ["Κύριός", "Senhor"],
  ["Βαραββᾶν", "Barrabás"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 2 ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");

    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;

    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --command "${sql}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    const parsed = JSON.parse(result);
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

console.log(`\n=== Resultado Lote 2 ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

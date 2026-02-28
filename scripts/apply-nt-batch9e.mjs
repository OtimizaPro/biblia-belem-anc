#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 9e
 * Aplica traduções literais para palavras gregas freq 3 no NT (parte 5/5)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch9e-${Date.now()}.sql`);

const translations = [
  // índices 988-1234 de freq3-words.json (parte 5/5, 247 palavras)
  ["ἐμά", "minhas"],
  ["ἐμπέσῃ", "caia-dentro"],
  ["ἐμῷ", "meu"],
  ["ἐνάτης", "nona"],
  ["ἐνδύματος", "vestimenta"],
  ["ἐνδύσασθαι", "vestir"],
  ["ἐνεργεῖται", "é-operado"],
  ["ἐνεργῶν", "operando"],
  ["ἐννέα", "nove"],
  ["ἐντάλματα", "mandamentos"],
  ["ἐντολαῖς", "mandamentos"],
  ["ἐντολῶν", "mandamentos"],
  ["ἐντυγχάνει", "intercede"],
  ["ἐνώπιόν", "diante-de"],
  ["ἐξέδετο", "arrendou"],
  ["ἐξέλθητε", "saiais"],
  ["ἐξέπνευσεν", "expirou"],
  ["ἐξέρχεται", "sai"],
  ["ἐξέψυξεν", "expirou"],
  ["ἐξελθοῦσα", "tendo-saído"],
  ["ἐξελθόντα", "tendo-saído"],
  ["ἐξελθόντος", "tendo-saído"],
  ["ἐξεπορεύετο", "saía"],
  ["ἐξομολογούμενοι", "confessando"],
  ["ἐξουσίαις", "autoridades"],
  ["ἐξώτερον", "exterior"],
  ["ἐξὸν", "sendo-lícito"],
  ["ἐξῆλθαν", "saíram"],
  ["ἐπέβαλεν", "lançou-sobre"],
  ["ἐπέβαλον", "lançaram-sobre"],
  ["ἐπέταξεν", "ordenou"],
  ["ἐπέτυχεν", "alcançou"],
  ["ἐπήγγελται", "tem-prometido"],
  ["ἐπίγεια", "terrenas"],
  ["ἐπίτρεψόν", "permite"],
  ["ἐπαγγελίαι", "promessas"],
  ["ἐπαύσαντο", "cessaram"],
  ["ἐπείθοντο", "eram-persuadidos"],
  ["ἐπερωτῆσαι", "perguntar"],
  ["ἐπετίμων", "repreendiam"],
  ["ἐπεφώνουν", "clamavam"],
  ["ἐπιγινώσκετε", "conheceis-plenamente"],
  ["ἐπιγνώσεσθε", "conhecereis-plenamente"],
  ["ἐπιδεῖξαι", "mostrar"],
  ["ἐπιζητεῖ", "busca"],
  ["ἐπιζητοῦσιν", "buscam"],
  ["ἐπιθέντες", "tendo-posto-sobre"],
  ["ἐπιθέσεως", "imposição"],
  ["ἐπιθυμίᾳ", "desejo"],
  ["ἐπικαλουμένους", "invocando"],
  ["ἐπιμεῖναι", "permanecer"],
  ["ἐπισκοπῆς", "supervisão"],
  ["ἐπιστολὴ", "carta"],
  ["ἐπιστολῆς", "carta"],
  ["ἐπιστολῇ", "carta"],
  ["ἐπιστρέψωσιν", "convertam-se"],
  ["ἐπιστρέψῃ", "converta"],
  ["ἐπιστραφεὶς", "tendo-se-voltado"],
  ["ἐπιστρεψάτω", "volte"],
  ["ἐπιτάσσει", "ordena"],
  ["ἐπιτίμησον", "repreende"],
  ["ἐπιφάνειαν", "manifestação"],
  ["ἐπληθύνετο", "multiplicava-se"],
  ["ἐποίησέν", "fez"],
  ["ἐποίουν", "faziam"],
  ["ἐποικοδομεῖ", "edifica-sobre"],
  ["ἐπουράνια", "celestiais"],
  ["ἐπουρανίων", "celestiais"],
  ["ἐπὰν", "quando"],
  ["ἐρήμοις", "desertos"],
  ["ἐργάζεσθε", "trabalhai"],
  ["ἐργάτης", "trabalhador"],
  ["ἐργαζομένῳ", "trabalhando"],
  ["ἐρεῖς", "dirás"],
  ["ἐρωτήσω", "perguntarei"],
  ["ἐρύσατο", "livrou"],
  ["ἐσθίοντες", "comendo"],
  ["ἐσθιέτω", "coma"],
  ["ἐσθιόντων", "comendo"],
  ["ἐσθῆτα", "veste"],
  ["ἐσχάταις", "últimas"],
  ["ἐτάφη", "foi-sepultado"],
  ["ἐτήρουν", "guardavam"],
  ["ἐταράχθη", "perturbou-se"],
  ["ἐφίλει", "amava"],
  ["ἐφύλαξα", "guardei"],
  ["ἐχάρη", "alegrou-se"],
  ["ἐχέτω", "tenha"],
  ["ἐχομένῃ", "seguinte"],
  ["ἐχούσαις", "tendo"],
  ["ἐχόντων", "tendo"],
  ["ἑαυτάς", "si-mesmas"],
  ["ἑκατόνταρχος", "centurião"],
  ["ἑκατὸν", "cem"],
  ["ἑορτὴν", "festa"],
  ["ἑστάναι", "estar-de-pé"],
  ["ἑτέραις", "outras"],
  ["ἑτέραν", "outra"],
  ["ἑτοίμως", "prontamente"],
  ["ἑτοιμάσατε", "preparai"],
  ["ἑώρακας", "tens-visto"],
  ["ἔγνωκεν", "tem-conhecido"],
  ["ἔγνως", "conheceste"],
  ["ἔδραμον", "correram"],
  ["ἔδωκάς", "deste"],
  ["ἔθαψαν", "sepultaram"],
  ["ἔθηκα", "pus"],
  ["ἔκβαλε", "expulsa"],
  ["ἔκκοψον", "corta"],
  ["ἔκλαυσεν", "chorou"],
  ["ἔκρυψεν", "escondeu"],
  ["ἔκστασις", "êxtase"],
  ["ἔλαμψεν", "resplandeceu"],
  ["ἔλεγχε", "repreende"],
  ["ἔμελλεν", "estava-prestes"],
  ["ἔνδειξιν", "demonstração"],
  ["ἔντρομος", "tremendo"],
  ["ἔπεμψεν", "enviou"],
  ["ἔπινον", "bebiam"],
  ["ἔσπειρας", "semeaste"],
  ["ἔτυπτον", "batiam"],
  ["ἕκτη", "sexta"],
  ["ἕνδεκα", "onze"],
  ["ἕνεκα", "por-causa-de"],
  ["Ἐλθὼν", "tendo-vindo"],
  ["Ἐφεσίων", "efésios"],
  ["Ἑβραΐδι", "hebraico"],
  ["Ἑλλήνων", "gregos"],
  ["Ἑταῖρε", "companheiro"],
  ["Ἕλληνος", "grego"],
  ["ἠγάπησας", "amaste"],
  ["ἠγανάκτησαν", "indignaram-se"],
  ["ἠγαπημένοι", "tendo-sido-amados"],
  ["ἠδυνήθησαν", "puderam"],
  ["ἠδύναντο", "podiam"],
  ["ἠθέλησα", "quis"],
  ["ἠθέλησαν", "quiseram"],
  ["ἠθελήσατε", "quisestes"],
  ["ἠκούσθη", "foi-ouvido"],
  ["ἠνεῴχθησαν", "foram-abertos"],
  ["ἠργάσατο", "trabalhou"],
  ["ἠσθένει", "estava-doente"],
  ["ἡγήσατο", "considerou"],
  ["ἡγιασμένοις", "tendo-sido-santificados"],
  ["ἡγούμενος", "liderando"],
  ["ἡγοῦμαι", "considero"],
  ["ἡδέως", "prazerosamente"],
  ["ἡλικίαν", "estatura"],
  ["ἡσύχασαν", "aquietaram-se"],
  ["ἤνεγκαν", "trouxeram"],
  ["ἤρατε", "levastes"],
  ["ἤρθη", "foi-levantado"],
  ["ἥκω", "venho"],
  ["ἥμαρτεν", "pecou"],
  ["ἦλθες", "vieste"],
  ["Ἠσαΐου", "Isaías"],
  ["Ἠσαῦ", "Esaú"],
  ["Ἡλεὶ", "Eli"],
  ["Ἡρῳδιάδος", "Herodíades"],
  ["Ἡρῳδιανῶν", "herodianos"],
  ["Ἡρῴδῃ", "Herodes"],
  ["Ἦσαν", "eram"],
  ["ἰάσομαι", "curarei"],
  ["ἰαμάτων", "curas"],
  ["ἰατροῦ", "médico"],
  ["ἰσχυρότερός", "mais-forte"],
  ["ἱερεῖ", "sacerdote"],
  ["ἱκανοὶ", "suficientes"],
  ["ἱκανῶν", "suficientes"],
  ["ἱμάντα", "correia"],
  ["ἱματίων", "vestes"],
  ["ἴσχυον", "tinham-força"],
  ["ἴσχυσαν", "tiveram-força"],
  ["ἴχνεσιν", "pegadas"],
  ["Ἰεσσαί", "Jessé"],
  ["Ἰκονίῳ", "Icônio"],
  ["Ἰουδαίῳ", "judeu"],
  ["Ἰουδαῖός", "judeu"],
  ["Ἰωάνει", "João"],
  ["Ἰωβὴδ", "Obede"],
  ["Ἰωσῆτος", "José"],
  ["ὀθόνια", "faixas-de-linho"],
  ["ὀμνύει", "jura"],
  ["ὀμόσας", "tendo-jurado"],
  ["ὀνειδισμὸν", "opróbrio"],
  ["ὀνόματός", "nome"],
  ["ὀργήν", "ira"],
  ["ὀργῇ", "ira"],
  ["ὀσμὴν", "cheiro"],
  ["ὀσφὺν", "lombo"],
  ["ὀφείλεις", "deves"],
  ["ὀφειλέται", "devedores"],
  ["ὀφειλέτης", "devedor"],
  ["ὀφθαλμοὶ", "olhos"],
  ["ὀψὲ", "tarde"],
  ["ὁδοῖς", "caminhos"],
  ["ὁμοία", "semelhante"],
  ["ὁμοιωθήσεται", "será-semelhante"],
  ["ὁμολογήσῃ", "confesse"],
  ["ὁμολογίαν", "confissão"],
  ["ὁμολογίας", "confissão"],
  ["ὁρᾶτε", "vede"],
  ["ὄλεθρον", "destruição"],
  ["ὄφεις", "serpentes"],
  ["ὄφελος", "proveito"],
  ["ὄφιν", "serpente"],
  ["ὄψεσθέ", "vereis"],
  ["ὄψῃ", "verás"],
  ["ὅλου", "inteiro"],
  ["ὅλως", "totalmente"],
  ["ὅμοιός", "semelhante"],
  ["ὅμως", "contudo"],
  ["ὅρκους", "juramentos"],
  ["Ὅθεν", "de-onde"],
  ["ὑγιαινούσῃ", "sã"],
  ["ὑπάγει", "vai"],
  ["ὑπάντησιν", "encontro"],
  ["ὑπάρχει", "existe"],
  ["ὑπάρχοντος", "existindo"],
  ["ὑπέταξεν", "sujeitou"],
  ["ὑπήκουσεν", "obedeceu"],
  ["ὑπακοήν", "obediência"],
  ["ὑπακοῆς", "obediência"],
  ["ὑπεράνω", "muito-acima"],
  ["ὑπηρέτας", "servos"],
  ["ὑπηρετῶν", "servindo"],
  ["ὑποδείξω", "mostrarei"],
  ["ὑποδημάτων", "sandálias"],
  ["ὑπομείνας", "tendo-perseverado"],
  ["ὑπομνήσει", "lembrará"],
  ["ὑπομονῆς", "perseverança"],
  ["ὑποστρέψαντες", "tendo-retornado"],
  ["ὑποτάσσεσθαι", "sujeitar-se"],
  ["ὑπόδειγμα", "exemplo"],
  ["ὑστερήματα", "carências"],
  ["ὑστερεῖσθαι", "ter-falta"],
  ["ὑψωθήσεται", "será-exaltado"],
  ["Ὑπάγετε", "ide"],
  ["ὤρυξεν", "cavou"],
  ["ὤφειλεν", "devia"],
  ["ὥρμησεν", "precipitou-se"],
  ["ὦμεν", "sejamos"],
  ["ῥάβδον", "vara"],
  ["ῥάβδος", "vara"],
  ["ῥήματά", "palavras"],
  ["ῥύσεται", "livrará"],
  ["ῥῆμά", "palavra"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 9e (freq 3, parte 5/5) ===`);
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

console.log(`\n=== Resultado Lote 9e ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

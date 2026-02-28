#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 8c
 * Aplica traduções literais para palavras gregas freq 4 no NT (parte 3/3)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch8c-${Date.now()}.sql`);

const translations = [
  // Remaining ὕ/ὠ/ῥ words
  ["ὕπνου", "sono"],
  ["ὕψωσεν", "exaltou"],
  ["ὠφελεῖ", "aproveita"],
  ["ὡμολόγησεν", "confessou"],
  ["Ὡσαννὰ", "Hosana"],
  ["ῥήματι", "palavra"],
  ["Ῥώμην", "Roma"],

  // ἀ words (smooth breathing alpha)
  ["ἀγαπήσει", "amará"],
  ["ἀγαπητοὶ", "amados"],
  ["ἀγαπητὸς", "amado"],
  ["ἀγαπητῷ", "amado"],
  ["ἀγρὸν", "campo"],
  ["ἀδελφὰς", "irmãs"],
  ["ἀδιαλείπτως", "incessantemente"],
  ["ἀδικία", "injustiça"],
  ["ἀδόκιμοι", "reprovados"],
  ["ἀθετεῖ", "rejeita"],
  ["ἀθετῶν", "rejeitando"],
  ["ἀκαθάρτων", "impuros"],
  ["ἀκολουθείτω", "siga"],
  ["ἀκούοντας", "ouvintes"],
  ["ἀκοὰς", "ouvidos"],
  ["ἀκριβέστερον", "mais-exatamente"],
  ["ἀλάβαστρον", "alabastro"],
  ["ἀληθινὸν", "verdadeiro"],
  ["ἀληθῆ", "verdadeiras"],
  ["ἀλλοτρίων", "estranhos"],
  ["ἀλλοτρίῳ", "estranho"],
  ["ἀμφότερα", "ambos"],
  ["ἀνάθεμα", "anátema"],
  ["ἀνάστασις", "ressurreição"],
  ["ἀνάστηθι", "levanta-te"],
  ["ἀνέβλεψεν", "olhou-para-cima"],
  ["ἀνέμων", "ventos"],
  ["ἀνέμῳ", "vento"],
  ["ἀνέπεσεν", "reclinou-se"],
  ["ἀνέστησεν", "levantou"],
  ["ἀνήχθημεν", "navegamos"],
  ["ἀναγγελεῖ", "anunciará"],
  ["ἀναγκαῖον", "necessário"],
  ["ἀνακειμένων", "reclinados"],
  ["ἀναστήσεται", "ressuscitará"],
  ["ἀναστήσονται", "ressuscitarão"],
  ["ἀναστήσω", "ressuscitarei"],
  ["ἀνατολῶν", "oriente"],
  ["ἀνοιγήσεται", "será-aberto"],
  ["ἀνομίας", "iniquidade"],
  ["ἀντιστῆναι", "resistir"],
  ["ἀπέλυσαν", "soltaram"],
  ["ἀπέναντι", "diante-de"],
  ["ἀπέσταλκεν", "enviou"],
  ["ἀπέστειλα", "enviei"],
  ["ἀπίστων", "incrédulos"],
  ["ἀπαρχὴ", "primícias"],
  ["ἀπεδοκίμασαν", "rejeitaram"],
  ["ἀπιστίαν", "incredulidade"],
  ["ἀποκαλυφθῆναι", "ser-revelado"],
  ["ἀποκρίνῃ", "respondes"],
  ["ἀποκτείνωμεν", "matemos"],
  ["ἀποκτεῖναι", "matar"],
  ["ἀπολέσωσιν", "destruam"],
  ["ἀπολλυμένοις", "perecendo"],
  ["ἀπολοῦνται", "perecerão"],
  ["ἀποστέλλει", "envia"],
  ["ἀποστείλαντά", "enviante"],
  ["ἀποστελεῖ", "enviará"],
  ["ἀποταξάμενος", "despedindo-se"],
  ["ἀπώλεια", "perdição"],
  ["ἀπώλεσεν", "perdeu"],
  ["ἀράτω", "levante"],
  ["ἀρέσῃ", "agrade"],
  ["ἀρχαίων", "antigos"],
  ["ἀρχαῖς", "governos"],
  ["ἀρχιερεύς", "sumo-sacerdote"],
  ["ἀσελγείαις", "dissoluções"],
  ["ἀσθένειαν", "fraqueza"],
  ["ἀσθενείαις", "fraquezas"],
  ["ἀσθενοῦντας", "enfermos"],
  ["ἀσπάζονται", "saúdam"],
  ["ἀσπασμοὺς", "saudações"],
  ["ἀσπασμὸς", "saudação"],
  ["ἀφίησιν", "perdoa"],
  ["ἀφόβως", "sem-temor"],
  ["ἀχθῆναι", "ser-levado"],

  // ἁ words (rough breathing)
  ["ἁμαρτωλὸς", "pecador"],
  ["ἁπλότητι", "simplicidade"],

  // ἄ words (acute accent)
  ["ἄγωμεν", "vamos"],
  ["ἄνεσιν", "alívio"],
  ["ἄνθος", "flor"],
  ["ἄνθρωπός", "homem"],
  ["ἄξια", "dignos"],
  ["ἄρσεν", "macho"],
  ["ἄρτοι", "pães"],
  ["ἄρχοντι", "governante"],
  ["ἄρχων", "governante"],

  // ἅ words
  ["ἅγια", "santas"],
  ["ἅπαν", "todo"],
  ["ἅπαντας", "todos"],

  // Ἀ words (capitalized with breathing)
  ["Ἀλέξανδρος", "Alexandre"],
  ["Ἀνδρέαν", "André"],
  ["Ἀντιοχείᾳ", "Antioquia"],
  ["Ἀπολλῶ", "Apolo"],
  ["Ἀπολλῶς", "Apolo"],
  ["Ἄνθρωπε", "Homem"],

  // ἐ words (epsilon with breathing)
  ["ἐβάπτισα", "batizei"],
  ["ἐβάπτισεν", "batizou"],
  ["ἐβαπτίσθητε", "fostes-batizados"],
  ["ἐγένεσθε", "tornastes-vos"],
  ["ἐγένοντο", "tornaram-se"],
  ["ἐγίνωσκεν", "conhecia"],
  ["ἐγερθήσονται", "serão-levantados"],
  ["ἐγνώκατε", "conhecestes"],
  ["ἐγράφη", "foi-escrito"],
  ["ἐδόξασαν", "glorificaram"],
  ["ἐκβαλεῖν", "expulsar"],
  ["ἐκείναις", "naquelas"],
  ["ἐκεῖναι", "aquelas"],
  ["ἐκεῖνον", "aquele"],
  ["ἐκκλησίαι", "assembleias"],
  ["ἐκλεκτοὺς", "eleitos"],
  ["ἐκλεκτῶν", "eleitos"],
  ["ἐκράτησαν", "agarraram"],
  ["ἐκραύγασαν", "gritaram"],
  ["ἐκρύβη", "escondeu-se"],
  ["ἐκχυννόμενον", "derramado"],
  ["ἐλαχίστων", "menores"],
  ["ἐλευθέρας", "livre"],
  ["ἐλεύθεροι", "livres"],
  ["ἐλεύσεται", "virá"],
  ["ἐμάθετε", "aprendestes"],
  ["ἐμέρισεν", "dividiu"],
  ["ἐνέπαιξαν", "zombaram"],
  ["ἐνδυσάμενοι", "vestidos"],
  ["ἐνδύσησθε", "vistais"],
  ["ἐνενήκοντα", "noventa"],
  ["ἐνιαυτοῦ", "ano"],
  ["ἐντολάς", "mandamentos"],
  ["ἐντολή", "mandamento"],
  ["ἐντολὰς", "mandamentos"],
  ["ἐξήγαγεν", "conduziu-fora"],
  ["ἐξελεξάμην", "escolhi"],
  ["ἐξερχόμενοι", "saindo"],
  ["ἐπέγνωσαν", "reconheceram"],
  ["ἐπίβλημα", "remendo"],
  ["ἐπίστευον", "criam"],
  ["ἐπερίσσευσεν", "abundou"],
  ["ἐπιγνῶναι", "reconhecer"],
  ["ἐπιδώσει", "dará"],
  ["ἐπιθυμία", "desejo"],
  ["ἐπιλαβόμενοι", "agarrando"],
  ["ἐπιστάμενος", "sabendo"],
  ["ἐπιστολὴν", "carta"],
  ["ἐπιστολῶν", "cartas"],
  ["ἐπιστὰς", "aproximando-se"],
  ["ἐπλήρωσεν", "cumpriu"],
  ["ἐπορεύθησαν", "foram"],
  ["ἐπουρανίου", "celestial"],
  ["ἐπροφήτευσεν", "profetizou"],
  ["ἐργάται", "trabalhadores"],
  ["ἐργασίαν", "trabalho"],
  ["ἐρεῖτε", "direis"],
  ["ἐροῦσιν", "dirão"],
  ["ἐρχομένῳ", "vindo"],
  ["ἐσθῆτι", "veste"],
  ["ἐσταυρωμένον", "crucificado"],
  ["ἐσταυρώθη", "foi-crucificado"],
  ["ἐσόμεθα", "seremos"],
  ["ἐσώθη", "foi-salvo"],
  ["ἐτελεύτησεν", "morreu"],
  ["ἐτόλμα", "ousava"],
  ["ἐφείσατο", "poupou"],
  ["ἐφύτευσεν", "plantou"],
  ["ἐχθροὶ", "inimigos"],
  ["ἐχιδνῶν", "víboras"],

  // ἑ words (rough breathing)
  ["ἑκατοντάρχῃ", "centurião"],
  ["ἑνός", "um"],
  ["ἑορτὴ", "festa"],
  ["ἑπτάκις", "sete-vezes"],
  ["ἑστήκατε", "estais-de-pé"],
  ["ἑστηκότων", "estando-de-pé"],
  ["ἑστῶτα", "de-pé"],
  ["ἑτέρους", "outros"],
  ["ἑτέρων", "outros"],
  ["ἑτέρᾳ", "outra"],
  ["ἑτοιμάσαι", "preparar"],
  ["ἑωράκαμεν", "vimos"],

  // ἔ words (acute accent)
  ["ἔδειξεν", "mostrou"],
  ["ἔθεντο", "puseram"],
  ["ἔλθωσιν", "venham"],
  ["ἔμενεν", "permanecia"],
  ["ἔνδυμα", "veste"],
  ["ἔξελθε", "sai"],
  ["ἔπαθεν", "sofreu"],
  ["ἔπαινος", "louvor"],
  ["ἔρις", "contenda"],
  ["ἔρχεσθαι", "vir"],
  ["ἔσεσθαι", "ser"],
  ["ἔσωσεν", "salvou"],
  ["ἔφερον", "traziam"],
  ["ἔφθασεν", "chegou"],
  ["ἔχε", "tem"],
  ["ἔχωσιν", "tenham"],

  // ἕ words
  ["ἕξεις", "terás"],
  ["ἕστηκεν", "está-de-pé"],
  ["ἕτερα", "outras"],

  // Ἐ/Ἑ/Ἕ words (capitalized)
  ["Ἐμοὶ", "A-mim"],
  ["Ἑτοιμάσατε", "Preparai"],
  ["Ἕλλην", "grego"],
  ["Ἕλλησιν", "gregos"],

  // ἠ/ἡ/ἤ/ἥ/Ἡ words (eta with breathing)
  ["ἠγάπησα", "amei"],
  ["ἠγαλλιάσατο", "exultou"],
  ["ἠδύνατο", "podia"],
  ["ἡγεμόνι", "governador"],
  ["ἡγεμὼν", "governador"],
  ["ἡτοίμασαν", "prepararam"],
  ["ἤρεσεν", "agradou"],
  ["ἤρχετο", "vinha"],
  ["ἤσθιον", "comiam"],
  ["ἥκει", "chegou"],
  ["Ἡλείᾳ", "Elias"],

  // ἰ/ἴ/Ἰ/Ἴ words (iota with breathing)
  ["ἰάθη", "foi-curado"],
  ["ἰάσατο", "curou"],
  ["ἰσχύει", "tem-poder"],
  ["ἴσχυσεν", "prevaleceu"],
  ["Ἰόππην", "Jope"],
  ["Ἰόππῃ", "Jope"],
  ["Ἴδετε", "Vede"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 8c (freq 4, parte 3/3) ===`);
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

console.log(`\n=== Resultado Lote 8c ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 10a
 * Aplica traduções literais para palavras gregas freq 2 no NT (parte 1/12)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch10a-${Date.now()}.sql`);

const translations = [
  // === Índices 0-247 de freq2-words.json (248 palavras) ===

  // --- Nomes próprios e maiúsculas (Α-Χ) ---
  ["Αἰγύπτιον", "Egípcio"],
  ["Βάτου", "Sarça"],
  ["Βαλαὰμ", "Balaão"],
  ["Βαπτιστὴς", "Batista"],
  ["Βαραββᾶς", "Barrabás"],
  ["Βαρθολομαῖον", "Bartolomeu"],
  ["Βαρθολομαῖος", "Bartolomeu"],
  ["Βαρσαββᾶν", "Barsabás"],
  ["Βασιλεῦ", "Rei"],
  ["Βερνίκη", "Berenice"],
  ["Βηθανίας", "Betânia"],
  ["Βηθλεὲμ", "Belém"],
  ["Βόες", "Boaz"],
  ["Βόσκε", "Apascenta"],
  ["Γάϊον", "Gaio"],
  ["Γάϊος", "Gaio"],
  ["Γέγραπται", "Tem-sido-escrito"],
  ["Γίνεσθε", "Tornai-vos"],
  ["Γαβριὴλ", "Gabriel"],
  ["Γαλατικὴν", "Galática"],
  ["Γαλιλαῖος", "Galileu"],
  ["Γαλιλαῖός", "Galileu"],
  ["Γαμαλιήλ", "Gamaliel"],
  ["Γεθσημανεί", "Getsêmani"],
  ["Γενηθήτω", "Seja-feito"],
  ["Γεννήματα", "Crias"],
  ["Γεννησαρέτ", "Genesaré"],
  ["Γολγοθᾶ", "Gólgota"],
  ["Γρηγορεῖτε", "Vigiai"],
  ["Γόμορρα", "Gomorra"],
  ["Δέξαι", "Recebe"],
  ["Δέσποτα", "Soberano"],
  ["Δεκαπόλεως", "Decápolis"],
  ["Δεῦτε", "Vinde"],
  ["Δημήτριος", "Demétrio"],
  ["Δορκάς", "Dorcas"],
  ["Δῶρον", "Oferta"],
  ["Εἰπὸν", "Dize"],
  ["Εἰρήνην", "Paz"],
  ["Εἷς", "Um"],
  ["Εὐλογημένη", "Tendo-sido-abençoada"],
  ["Εὐχαριστοῦμεν", "Damos-graças"],
  ["Εὖ", "Bem"],
  ["Ζακχαῖος", "Zaqueu"],
  ["Ζαχαρίαν", "Zacarias"],
  ["Ηὐλήσαμεν", "Tocamos-flauta"],
  ["Θαρσεῖτε", "Tende-coragem"],
  ["Θεσσαλονίκην", "Tessalônica"],
  ["Θεσσαλονίκῃ", "Tessalônica"],
  ["Θεωρεῖτε", "Contemplai"],
  ["Θεόφιλε", "Teófilo"],
  ["Θυγάτηρ", "Filha"],
  ["Θωμᾶν", "Tomé"],
  ["Καθίσατε", "Sentai-vos"],
  ["Καθεύδετε", "Dormis"],
  ["Καϊάφαν", "Caifás"],
  ["Καϊνὰμ", "Cainã"],
  ["Κενχρεαῖς", "Cencreia"],
  ["Κηφᾷ", "Cefas"],
  ["Κορνήλιε", "Cornélio"],
  ["Κρήτην", "Creta"],
  ["Κρήτης", "Creta"],
  ["Κρανίου", "Crânio"],
  ["Κρῆτες", "Cretenses"],
  ["Κόρινθον", "Corinto"],
  ["Κἀκεῖθεν", "E-dali"],
  ["Λίθον", "Pedra"],
  ["Λευείτης", "Levita"],
  ["Λευεὶν", "Levi"],
  ["Λευεὶς", "Levi"],
  ["Λούκιος", "Lúcio"],
  ["Λυσίας", "Lísias"],
  ["Λύδδα", "Lida"],
  ["Λύσατε", "Desatai"],
  ["Λώτ", "Ló"],
  ["Λὼτ", "Ló"],
  ["Μάρθαν", "Marta"],
  ["Μέλλων", "Estando-a-ponto-de"],
  ["Μαίνῃ", "Enlouqueces"],
  ["Μαθθίαν", "Matias"],
  ["Μαθθαῖος", "Mateus"],
  ["Μακροθύμησον", "Tem-paciência"],
  ["Ματταθίου", "Matatias"],
  ["Μεγαλωσύνης", "Majestade"],
  ["Μελχεὶ", "Melqui"],
  ["Μετανοεῖτε", "Arrependei-vos"],
  ["Μηδαμῶς", "De-nenhum-modo"],
  ["Μηδενὶ", "A-ninguém"],
  ["Μυσίαν", "Mísia"],
  ["Μᾶρκος", "Marcos"],
  ["Ναασσὼν", "Naassom"],
  ["Ναζαρέθ", "Nazaré"],
  ["Ναζαρέτ", "Nazaré"],
  ["Ναζαρηνέ", "Nazareno"],
  ["Ναζαρηνοῦ", "Nazareno"],
  ["Ναζαρὲτ", "Nazaré"],
  ["Νεφθαλείμ", "Naftali"],
  ["Νινευεῖται", "Ninivitas"],
  ["Νυνὶ", "Agora"],
  ["ΟΥΤΟΣ", "ESTE"],
  ["Οὐαὶ", "Ai"],
  ["Οὐδεὶς", "Ninguém"],
  ["Οὔπω", "Ainda-não"],
  ["Οὔτε", "Nem"],
  ["Πάντως", "Certamente"],
  ["Πάφου", "Pafos"],
  ["Παιδία", "Criancinhas"],
  ["Παμφυλίας", "Panfília"],
  ["Παράκλητον", "Consolador"],
  ["Παραγενόμενος", "Tendo-chegado"],
  ["Παρακαλοῦμεν", "Exortamos"],
  ["Παρασκευὴ", "Preparação"],
  ["Πατάξω", "Ferirei"],
  ["Πατρί", "Pai"],
  ["Παῖδα", "Servo"],
  ["Παῦλε", "Paulo"],
  ["Περίλυπός", "Profundamente-triste"],
  ["Πισιδίαν", "Pisídia"],
  ["Ποντίου", "Pôncio"],
  ["Πρίσκαν", "Prisca"],
  ["Πρίσκιλλα", "Priscila"],
  ["Προσεύχεσθε", "Orai"],
  ["Προφήτην", "Profeta"],
  ["Προφήτης", "Profeta"],
  ["Πόθεν", "De-onde"],
  ["Σάρρᾳ", "Sara"],
  ["Σίμωνά", "Simão"],
  ["Σαβαὼθ", "Sabaoth"],
  ["Σαλήμ", "Salém"],
  ["Σαλαθιὴλ", "Salatiel"],
  ["Σαλώμη", "Salomé"],
  ["Σαλὰ", "Salá"],
  ["Σατανᾷ", "Satanás"],
  ["Σαύλου", "Saulo"],
  ["Σιδῶνα", "Sidom"],
  ["Σιλουανοῦ", "Silvano"],
  ["Σιλουανὸς", "Silvano"],
  ["Σιλωὰμ", "Siloé"],
  ["Σιλᾷ", "Silas"],
  ["Σοδόμοις", "Sodoma"],
  ["Σολομῶντος", "Salomão"],
  ["Σπανίαν", "Espanha"],
  ["Σπλαγχνίζομαι", "Tenho-compaixão"],
  ["Σπούδασον", "Apressa-te"],
  ["Σταθεὶς", "Tendo-ficado-de-pé"],
  ["Σταυρωθήτω", "Seja-crucificado"],
  ["Στεφάνῳ", "Estêvão"],
  ["Συνχάρητέ", "Alegrai-vos-comigo"],
  ["Συρίας", "Síria"],
  ["Σωτὴρ", "Salvador"],
  ["Σόδομα", "Sodoma"],
  ["Τέκνον", "Filho"],
  ["Ταβειθά", "Tabita"],
  ["Ταῦτά", "Estas-coisas"],
  ["Τιμοθέου", "Timóteo"],
  ["Τιμοθέῳ", "Timóteo"],
  ["Τιμόθεε", "Timóteo"],
  ["Τοῦτον", "Este"],
  ["Τοῦτό", "Isto"],
  ["Τρόφιμον", "Trófimo"],
  ["Τρῳάδι", "Trôade"],
  ["Τύρον", "Tiro"],
  ["Υἱῷ", "Filho"],
  ["Φίλε", "Amigo"],
  ["Φαρισαίοις", "Fariseus"],
  ["Φαρισαίου", "Fariseu"],
  ["Φιλίπποις", "Filipos"],
  ["Φιμώθητι", "Cala-te"],
  ["Φοινίκην", "Fenícia"],
  ["Χαίρετε", "Alegrai-vos"],
  ["Χανάαν", "Canaã"],
  ["Χαρράν", "Harã"],
  ["Χοραζείν", "Corazim"],
  ["Χρονίζει", "Demora"],

  // --- Palavras comuns (minúsculas) αι- ---
  ["αἰγιαλόν", "praia"],
  ["αἰνοῦντες", "louvando"],
  ["αἰσχρὸν", "vergonhoso"],
  ["αἰσχυνθήσομαι", "serei-envergonhado"],
  ["αἰτήματα", "pedidos"],
  ["αἰτήσας", "tendo-pedido"],
  ["αἰτήσωνται", "peçam"],
  ["αἰτία", "causa"],
  ["αἰτίας", "causa"],
  ["αἰτείτω", "peça"],
  ["αἰτεῖσθαι", "pedir"],
  ["αἰτοῦντί", "pedindo"],
  ["αἰτώμεθα", "peçamos"],
  ["αἰτῶν", "pedindo"],
  ["αἰφνίδιος", "repentino"],
  ["αἰχμαλωτίζοντες", "levando-cativos"],
  ["αἰωνίαν", "eterna"],
  ["αἰωνίων", "eternas"],
  ["αἰώνων", "eras"],
  ["αἴρεις", "levantas"],
  ["αἴρων", "levantando"],
  ["αἵρεσιν", "heresia"],
  ["αἶνον", "louvor"],

  // --- αυ- palavras ---
  ["αὐλῇ", "pátio"],
  ["αὐτομάτη", "por-si-mesma"],
  ["αὑτούς", "si-mesmos"],
  ["αὔξει", "faz-crescer"],
  ["αὔξησιν", "crescimento"],

  // --- β- palavras ---
  ["βάλλοντας", "lançando"],
  ["βάλλοντες", "lançando"],
  ["βάλῃ", "lance"],
  ["βάρβαροι", "bárbaros"],
  ["βάτου", "sarça"],
  ["βέβληται", "tem-sido-lançado"],
  ["βίας", "violência"],
  ["βίβλῳ", "livro"],
  ["βαλλάντιον", "bolsa"],
  ["βαλλόμενον", "sendo-lançado"],
  ["βαλλόντων", "lançando"],
  ["βαπτίζει", "batiza"],
  ["βαπτίζειν", "batizar"],
  ["βαπτίζομαι", "sou-batizado"],
  ["βαπτίσματος", "batismo"],
  ["βαπτισθέντες", "tendo-sido-batizados"],
  ["βαρέα", "pesados"],
  ["βαρέως", "pesadamente"],
  ["βαρεῖαι", "pesadas"],
  ["βασάνοις", "tormentos"],
  ["βασίλισσα", "rainha"],
  ["βασανίσῃς", "atormentes"],
  ["βασιλεῖς", "reis"],
  ["βασιλεῦσαι", "reinar"],
  ["βαστάζειν", "carregar"],
  ["βαστάζετε", "carregai"],
  ["βαστάσει", "carregará"],
  ["βεβαία", "firme"],
  ["βεβαιώσει", "confirmação"],
  ["βεβαρημένοι", "tendo-sido-sobrecarregados"],
  ["βιάζεται", "é-tomado-à-força"],
  ["βλάσφημον", "blasfemo"],
  ["βλέποντας", "vendo"],
  ["βλέποντες", "vendo"],
  ["βλέψετε", "vereis"],
  ["βλήθητι", "sê-lançado"],
  ["βλασφημεῖ", "blasfema"],
  ["βλασφημῆται", "seja-blasfemado"],
  ["βλεπέτω", "veja"],
  ["βλεπομένων", "sendo-vistas"],
  ["βοήθει", "ajuda"],
  ["βοήθησον", "socorre"],
  ["βολίσαντες", "tendo-lançado-sonda"],
  ["βουλεύομαι", "delibero"],
  ["βουλομένου", "querendo"],
  ["βουλόμενός", "querendo"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 10a (freq 2, parte 1/12) ===`);
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

console.log(`\n=== Resultado Lote 10a ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

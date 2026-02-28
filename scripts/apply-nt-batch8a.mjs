#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 8a
 * Aplica traduções literais para palavras gregas freq 4 (primeira metade) no NT
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch8a-${Date.now()}.sql`);

const translations = [
  // === PROPER NOUNS ===
  ["Αἰγύπτῳ", "em-Egito"],
  ["Βασιλέα", "Rei"],
  ["Γαλιλαῖοι", "Galileus"],
  ["Γύναι", "Mulher"],
  ["Δαιμόνιον", "Demônio"],
  ["Δαμασκόν", "Damasco"],
  ["Εἰρήνη", "Paz"],
  ["Εὐλογητὸς", "Bendito"],
  ["Ζαχαρίας", "Zacarias"],
  ["Ζαχαρίου", "de-Zacarias"],
  ["Θάρσει", "tem-ânimo"],
  ["ΙΟΥΔΑΙΩΝ", "DOS-JUDEUS"],
  ["Καϊάφα", "Caifás"],
  ["Κορίνθῳ", "em-Corinto"],
  ["Κύπρον", "Chipre"],
  ["Μηδὲν", "Nada"],
  ["Μωϋσῆν", "Moisés"],
  ["Ναζαρὲθ", "Nazaré"],
  ["Ναζωραίου", "do-Nazareno"],
  ["Ναζωραῖος", "Nazareno"],
  ["Πατρὶ", "Pai"],
  ["Πορεύου", "Vai"],
  ["Πρὸ", "Antes-de"],
  ["Σαμαρειτῶν", "dos-samaritanos"],
  ["Σατανᾶν", "Satanás"],
  ["Σαῦλον", "Saulo"],
  ["Σιδῶνι", "em-Sidom"],
  ["Σιλᾶς", "Silas"],
  ["Σινᾶ", "Sinai"],
  ["Σιὼν", "Sião"],
  ["Σοδόμων", "de-Sodoma"],
  ["Σωτῆρα", "Salvador"],
  ["Τίτον", "Tito"],
  ["Τεκνία", "Filhinhos"],
  ["Τύρῳ", "em-Tiro"],
  ["Φαραὼ", "Faraó"],
  ["Ἀλέξανδρος", "Alexandre"],
  ["Ἀνδρέαν", "André"],
  ["Ἀντιοχείᾳ", "em-Antioquia"],
  ["Ἀπολλῶ", "de-Apolo"],
  ["Ἀπολλῶς", "Apolo"],
  ["Ἄνθρωπε", "Homem"],
  ["Ἐμοὶ", "A-mim"],
  ["Ἑτοιμάσατε", "Preparai"],
  ["Ἕλλην", "grego"],
  ["Ἕλλησιν", "aos-gregos"],
  ["Ἡλείᾳ", "em-Elias"],
  ["Ἰόππην", "Jope"],
  ["Ἰόππῃ", "em-Jope"],
  ["Ἴδετε", "Vede"],
  ["Ὡσαννὰ", "Hosana"],
  ["Ῥώμην", "Roma"],
  // === α WORDS ===
  ["αἰγιαλὸν", "praia"],
  ["αἰτήσητε", "peçais"],
  ["αἰτεῖσθε", "pedis"],
  ["αἰτούμενοι", "pedindo"],
  ["αἰῶνας", "eras"],
  ["αὐλὴν", "pátio"],
  ["αὐλῆς", "do-pátio"],
  ["αὑτῷ", "a-si-mesmo"],
  // === β WORDS ===
  ["βάλλουσιν", "lançam"],
  ["βλέπομεν", "vemos"],
  ["βλασφημία", "blasfêmia"],
  ["βλεπόμενα", "vistas"],
  ["βληθῆναι", "ser-lançado"],
  ["βουλὴν", "conselho"],
  ["βούλομαι", "quero"],
  ["βοῶντος", "do-clamante"],
  ["βρέφος", "criança"],
  ["βρῶσιν", "alimento"],
  ["βρῶσις", "alimento"],
  // === γ WORDS ===
  ["γέγονα", "tornei-me"],
  ["γένωνται", "tornem-se"],
  ["γαμήσῃ", "case"],
  ["γαμεῖν", "casar"],
  ["γαμοῦσιν", "casam"],
  ["γεγεννημένον", "gerado"],
  ["γεγεννημένος", "gerado"],
  ["γεγονέναι", "ter-acontecido"],
  ["γεγραμμένα", "escritas"],
  ["γενεαὶ", "gerações"],
  ["γενεὰν", "geração"],
  ["γενομένην", "acontecida"],
  ["γενόμεναι", "acontecidas"],
  ["γενόμενον", "acontecido"],
  ["γεωργοὺς", "lavradores"],
  ["γινόμενον", "acontecendo"],
  ["γνωσθήσεται", "será-conhecido"],
  ["γραφαῖς", "Escrituras"],
  ["γραφὰς", "Escrituras"],
  ["γραφῶν", "das-Escrituras"],
  // === δ WORDS ===
  ["δέδωκέν", "deu"],
  ["δέομαι", "rogo"],
  ["δίκαιός", "justo"],
  ["δίκτυον", "rede"],
  ["δαιμονίου", "de-demônio"],
  ["δείξει", "mostrará"],
  ["δείπνου", "da-ceia"],
  ["δεδεμένος", "amarrado"],
  ["δεδομένον", "dado"],
  ["δεχόμενος", "recebendo"],
  ["δεύτερος", "segundo"],
  ["δεῖξον", "mostra"],
  ["δεῦτε", "vinde"],
  ["δημοσίᾳ", "publicamente"],
  ["δηναρίων", "de-denários"],
  ["διάνοιαν", "entendimento"],
  ["διήρχετο", "passava"],
  ["διαβόλῳ", "ao-diabo"],
  ["διακονῶν", "servindo"],
  ["διαλογίζεσθε", "raciocinais"],
  ["διαμαρτυρόμενος", "testemunhando"],
  ["διαφέρει", "difere"],
  ["διαφέρετε", "diferis"],
  ["διδάσκαλοι", "mestres"],
  ["διδάσκαλον", "mestre"],
  ["διελέγετο", "dialogava"],
  ["διελθεῖν", "atravessar"],
  ["διελθόντες", "atravessando"],
  ["διηκόνει", "servia"],
  ["δικαιοῦται", "é-justificado"],
  ["διῆλθον", "atravessaram"],
  ["δοθεῖσάν", "dada"],
  ["δοκιμάζετε", "examinai"],
  ["δοκὸν", "trave"],
  ["δοξάζων", "glorificando"],
  ["δοξάσει", "glorificará"],
  ["δουλείας", "de-escravidão"],
  ["δυνάμεθα", "podemos"],
  ["δυνάμενον", "podendo"],
  ["δυνήσεται", "poderá"],
  ["δυναμένῳ", "ao-podendo"],
  ["δυνατὰ", "poderosas"],
  ["δυσμῶν", "do-ocidente"],
  ["δυσὶν", "em-dois"],
  ["δόλῳ", "com-engano"],
  ["δύνασαί", "podes"],
  ["δὴ", "pois"],
  ["δῴη", "dê"],
  ["δῶρα", "presentes"],
  ["δῶρον", "presente"],
  // === ε WORDS ===
  ["εἰδώλων", "dos-ídolos"],
  ["εἰρημένον", "dito"],
  ["εἰσέλθῃς", "entres"],
  ["εἰσελθόντα", "entrando"],
  ["εἰσελθόντες", "entrando"],
  ["εἰσπορευόμενοι", "entrando"],
  ["εἱστήκεισαν", "estavam-de-pé"],
  ["εἴασεν", "permitiu"],
  ["εἴπας", "disseste"],
  ["εἴπῃς", "digas"],
  ["εἴσελθε", "entra"],
  ["εὐδοκίαν", "boa-vontade"],
  ["εὐηγγελισάμην", "evangelizei"],
  ["εὐλογίας", "de-bênção"],
  ["εὐπρόσδεκτος", "aceitável"],
  // === ζ WORDS ===
  ["ζήσομεν", "viveremos"],
  ["ζήσωμεν", "vivamos"],
  ["ζητῶ", "busco"],
  ["ζωῇ", "em-vida"],
  ["ζύμῃ", "em-fermento"],
  ["ζῆλον", "zelo"],
  ["ζῶντας", "viventes"],
  // === θ WORDS ===
  ["θάψαι", "sepultar"],
  ["θέλειν", "querer"],
  ["θέλητε", "queirais"],
  ["θέλῃς", "queiras"],
  ["θανάτῳ", "em-morte"],
  ["θαυμάζετε", "admirais"],
  ["θεάσασθαι", "contemplar"],
  ["θεοὶ", "deuses"],
  ["θερισμοῦ", "da-colheita"],
  ["θεωροῦντες", "contemplando"],
  ["θεωρῶ", "contemplo"],
  ["θεωρῶν", "contemplando"],
  ["θεὶς", "pondo"],
  ["θεῖναι", "pôr"],
  ["θησαυροῦ", "do-tesouro"],
  ["θριξὶν", "com-cabelos"],
  ["θυγατέρα", "filha"],
  ["θυρῶν", "das-portas"],
  ["θύραν", "porta"],
  // === κ WORDS ===
  ["κάλυμμα", "véu"],
  ["κάμηλον", "camelo"],
  ["καθίσταται", "é-constituído"],
  ["καθημένοις", "aos-assentados"],
  ["καθὸ", "conforme"],
  ["κακίας", "de-maldade"],
  ["κακίᾳ", "em-maldade"],
  ["κακὰ", "males"],
  ["κακῶν", "dos-males"],
  ["καλέσαι", "chamar"],
  ["καλέσαντος", "do-chamante"],
  ["καλεῖ", "chama"],
  ["καλούμενον", "chamado"],
  ["καλοῦντος", "do-chamante"],
  ["καρδιῶν", "dos-corações"],
  ["καρποῦ", "do-fruto"],
  ["κατάβηθι", "desce"],
  ["κατέκειτο", "jazia"],
  ["κατέκρινεν", "condenou"],
  ["καταγγέλλουσιν", "anunciam"],
  ["κατακρινοῦσιν", "condenarão"],
  ["καταπέτασμα", "véu"],
  ["κατῆλθον", "desceram"],
  ["κείμενον", "posto"],
  ["κεφαλῇ", "cabeça"],
  ["κηρύσσομεν", "pregamos"],
  ["κλάσας", "partindo"],
  ["κλέπται", "ladrões"],
  ["κλίνης", "da-cama"],
  ["κλαίετε", "chorai"],
  ["κληρονομήσουσιν", "herdarão"],
  ["κληρονομίας", "da-herança"],
  ["κοιλίαν", "ventre"],
  ["κοφίνους", "cestos"],
  ["κράβαττον", "leito"],
  ["κράβαττόν", "leito"],
  ["κράζει", "clama"],
  ["κράξας", "clamando"],
  ["κρίνειν", "julgar"],
  ["κρίνεσθαι", "ser-julgado"],
  ["κρασπέδου", "da-orla"],
  ["κρατῆσαι", "prender"],
  ["κρεῖττον", "melhor"],
  ["κριτής", "juiz"],
  ["κριτὴς", "juiz"],
  ["κρυπτὰ", "ocultas"],
  ["κρυπτὸν", "oculto"],
  ["κτίσει", "em-criação"],
  ["κωφός", "mudo"],
  ["κωφὸν", "mudo"],
  ["κόλπον", "seio"],
  ["κόπους", "trabalhos"],
  ["κώμης", "da-aldeia"],
  ["κἀκεῖνα", "e-aquelas-coisas"],
  ["κἀμοὶ", "e-a-mim"],
  // === λ WORDS ===
  ["λάθρᾳ", "secretamente"],
  ["λέγεσθαι", "ser-dito"],
  ["λέγομεν", "dizemos"],
  ["λέγουσαι", "dizendo"],
  ["λήμψονται", "receberão"],
  ["λίθοι", "pedras"],
  ["λαλήσει", "falará"],
  ["λαλεῖς", "falas"],
  ["λαλεῖτε", "falais"],
  ["λαλούντων", "dos-falantes"],
  ["λαμβάνειν", "receber"],
  ["λαμβάνετε", "recebeis"],
  ["λατρεύω", "sirvo"],
  ["λαός", "povo"],
  ["λεγομένην", "chamada"],
  ["λεγομένοις", "ditos"],
  ["λεπροὶ", "leprosos"],
  ["λιμὸς", "fome"],
  ["λογίζομαι", "considero"],
  ["λόγοι", "palavras"],
  ["λύχνον", "lâmpada"],
  ["λῃστῶν", "dos-ladrões"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 8a (freq 4, parte 1) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");

    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;

    // Usa arquivo temporário para evitar problemas de encoding no shell
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(
      `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
      { encoding: 'utf-8', timeout: 30000 }
    );

    // Strip non-JSON output (--file adds progress indicators)
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

console.log(`\n=== Resultado Lote 8a ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

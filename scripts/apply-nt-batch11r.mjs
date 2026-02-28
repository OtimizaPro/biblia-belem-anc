#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11r
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 18/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11r-${Date.now()}.sql`);

const translations = [
  // === Lote 11r: freq 1, parte 18/44 (248 palavras) ===

  // --- παρ- palavras (continuação) ---
  ["παρρησιαζόμενοι", "falando-com-ousadia"],
  ["παρρησιασάμενοί", "tendo-falado-com-ousadia"],
  ["παρωξύνετο", "era-provocado"],
  ["παρόδῳ", "passagem"],
  ["παρόμοια", "semelhantes"],
  ["παρόντες", "estando-presentes"],
  ["παρόντος", "estando-presente"],
  ["παρώτρυναν", "incitaram"],
  ["παρὸν", "estando-presente"],
  ["παρῃτήσαντο", "recusaram"],
  ["παρῃτοῦντο", "recusavam"],
  ["παρῄνει", "exortava"],
  ["παρῆλθον", "passaram"],
  ["παρῆσαν", "estavam-presentes"],
  ["παρῳχημέναις", "tendo-passado"],
  ["παρῴκησεν", "peregrinou"],

  // --- πασ-/πατ- palavras ---
  ["πασχέτω", "sofra"],
  ["πατάξομεν", "feriremos"],
  ["πατεῖν", "pisar"],
  ["πατουμένη", "sendo-pisada"],
  ["πατριάρχαι", "patriarcas"],
  ["πατριάρχας", "patriarcas"],
  ["πατριάρχης", "patriarca"],
  ["πατριάρχου", "patriarca"],
  ["πατριαὶ", "famílias"],
  ["πατρικῶν", "paternais"],
  ["πατριὰ", "família"],
  ["πατριᾶς", "família"],
  ["πατρολῴαις", "parricidas"],
  ["πατροπαραδότου", "transmitida-pelos-pais"],
  ["πατρῴοις", "paternos"],
  ["πατρῴου", "paterno"],
  ["πατρῴῳ", "paterno"],

  // --- παυ- palavras ---
  ["παυσάτω", "cesse"],
  ["παυόμεθα", "cessamos"],
  ["παύεται", "cessa"],
  ["παύομαι", "cesso"],
  ["παύσασθαι", "cessar"],
  ["παύσονται", "cessarão"],
  ["παύσῃ", "cesse"],

  // --- πει- palavras ---
  ["πείθεις", "persuades"],
  ["πείθομαι", "sou-persuadido"],
  ["πείθομεν", "persuadimos"],
  ["πείθω", "persuado"],
  ["πείσας", "tendo-persuadido"],
  ["πεδινοῦ", "planície"],
  ["πεζεύειν", "ir-a-pé"],
  ["πειθαρχήσαντάς", "tendo-obedecido"],
  ["πειθαρχεῖν", "obedecer"],
  ["πειθαρχοῦσιν", "obedecem"],
  ["πειθομένοις", "sendo-persuadidos"],
  ["πειθομένου", "sendo-persuadido"],
  ["πειθοῖς", "persuasivas"],
  ["πειθόμεθα", "somos-persuadidos"],
  ["πεινάσετε", "tereis-fome"],
  ["πεινάσῃ", "tenha-fome"],
  ["πεινᾶν", "ter-fome"],
  ["πεινῶμεν", "temos-fome"],
  ["πεινῶντας", "tendo-fome"],

  // --- πειρ- palavras ---
  ["πειράζει", "tenta"],
  ["πειράζεται", "é-tentado"],
  ["πειράζομαι", "sou-tentado"],
  ["πειράζῃ", "tente"],
  ["πειραζομένοις", "sendo-tentados"],
  ["πειρασθείς", "tendo-sido-tentado"],
  ["πειρασθῇς", "sejas-tentado"],
  ["πειρασμὸς", "tentação"],
  ["πειρασμῶν", "tentações"],
  ["πειρασμῷ", "tentação"],
  ["πεισθήσονται", "serão-persuadidos"],
  ["πεισθῇς", "sejas-persuadido"],
  ["πεισμονὴ", "persuasão"],

  // --- πελ-/πεμ-/πεν- palavras ---
  ["πελάγει", "profundeza-do-mar"],
  ["πεμπομένοις", "sendo-enviados"],
  ["πεμφθέντες", "tendo-sido-enviados"],
  ["πενθήσατε", "lamentai"],
  ["πενθήσετε", "lamentareis"],
  ["πενθήσω", "lamentarei"],
  ["πενθεράν", "sogra"],
  ["πενθερὰν", "sogra"],
  ["πενθερὸς", "sogro"],
  ["πενθερᾶς", "sogra"],
  ["πενθεῖν", "lamentar"],
  ["πενθοῦσι", "lamentam"],
  ["πενιχρὰν", "pobre"],

  // --- πεντ- palavras ---
  ["πεντάκις", "cinco-vezes"],
  ["πεντακισχιλίους", "cinco-mil"],
  ["πεντακισχιλίων", "cinco-mil"],
  ["πεντακοσίοις", "quinhentos"],
  ["πεντακόσια", "quinhentos"],
  ["πεντεκαιδεκάτῳ", "décimo-quinto"],

  // --- πεπ- palavras (perfeito) ---
  ["πεπίστευκας", "tens-crido"],
  ["πεπαιδευμένος", "tendo-sido-instruído"],
  ["πεπαλαίωκεν", "tem-tornado-obsoleto"],
  ["πεπειρασμένον", "tendo-sido-tentado"],
  ["πεπεισμένος", "tendo-sido-persuadido"],
  ["πεπιεσμένον", "tendo-sido-pressionado"],
  ["πεπιστευκόσιν", "tendo-crido"],
  ["πεπιστευκότας", "tendo-crido"],
  ["πεπιστευκὼς", "tendo-crido"],
  ["πεπιστεύκατε", "tendes-crido"],
  ["πεπιστεύκεισαν", "tinham-crido"],
  ["πεπλάνησθε", "tendes-sido-enganados"],
  ["πεπλάτυνται", "tem-sido-alargado"],
  ["πεπλανημένοις", "tendo-sido-enganados"],
  ["πεπληροφορημένοι", "tendo-sido-plenamente-assegurados"],
  ["πεπληροφορημένων", "tendo-sido-plenamente-asseguradas"],
  ["πεπληρωκέναι", "ter-cumprido"],
  ["πεπληρωμένην", "tendo-sido-cumprida"],
  ["πεπληρωμένους", "tendo-sido-cumpridos"],
  ["πεπληρώκατε", "tendes-enchido"],
  ["πεποίθαμεν", "temos-confiado"],
  ["πεποίθησιν", "confiança"],
  ["πεποιήκαμεν", "temos-feito"],
  ["πεποιήκατε", "tendes-feito"],
  ["πεποιήκεισαν", "tinham-feito"],
  ["πεποιηκέναι", "ter-feito"],
  ["πεποιηκόσιν", "tendo-feito"],
  ["πεποιηκότες", "tendo-feito"],
  ["πεποιηκότος", "tendo-feito"],
  ["πεποιημένων", "tendo-sido-feitas"],
  ["πεποιθέναι", "ter-confiado"],
  ["πεπολίτευμαι", "tenho-vivido-como-cidadão"],
  ["πεπορευμένους", "tendo-ido"],
  ["πεπραμένος", "tendo-sido-vendido"],
  ["πεπραχέναι", "ter-praticado"],
  ["πεπτωκυῖαν", "tendo-caído"],
  ["πεπυρωμένα", "tendo-sido-refinados-pelo-fogo"],
  ["πεπωρωμένη", "tendo-sido-endurecida"],
  ["πεπωρωμένην", "tendo-sido-endurecida"],
  ["πεπόνθασιν", "têm-sofrido"],

  // --- περί- palavras (prefixo) ---
  ["περίεργα", "curiosas"],
  ["περίεργοι", "curiosos"],
  ["περίκειμαι", "estou-rodeado"],
  ["περίοικοι", "vizinhos"],
  ["περίχωρος", "região-circunvizinha"],
  ["περίψημα", "refugo"],

  // --- περ- palavras ---
  ["περαιτέρω", "mais-além"],
  ["περιάγειν", "andar-ao-redor"],
  ["περιάγετε", "percorreis"],
  ["περιάγων", "andando-ao-redor"],
  ["περιέβαλον", "vestiram"],
  ["περιέδραμον", "correram-ao-redor"],
  ["περιέθηκαν", "colocaram-ao-redor"],
  ["περιέκρυβεν", "escondia-se"],
  ["περιέλαμψεν", "resplandeceu-ao-redor"],
  ["περιέπειραν", "traspassaram"],
  ["περιέπεσεν", "caiu-entre"],
  ["περιέστησαν", "cercaram"],
  ["περιέσχεν", "envolveu"],
  ["περιέχει", "contém"],
  ["περιήστραψεν", "resplandeceu-ao-redor"],
  ["περιαιρεῖται", "é-removido"],
  ["περιαστράψαι", "resplandecer-ao-redor"],
  ["περιαψάντων", "tendo-acendido"],
  ["περιβαλώμεθα", "vistamo-nos"],
  ["περιβαλὼν", "tendo-vestido"],
  ["περιβεβλημένον", "tendo-sido-vestido"],
  ["περιβεβλημένος", "tendo-sido-vestido"],
  ["περιβλεψάμενοι", "tendo-olhado-ao-redor"],
  ["περιβολαίου", "manto"],
  ["περιβόλαιον", "manto"],
  ["περιεβάλομεν", "vestimos"],
  ["περιεβλέπετο", "olhava-ao-redor"],
  ["περιεδέδετο", "tinha-sido-amarrado-ao-redor"],
  ["περιεζωσμέναι", "tendo-sido-cingidas"],
  ["περιελεῖν", "remover"],
  ["περιελθόντες", "tendo-percorrido"],
  ["περιελόντες", "tendo-removido"],
  ["περιεπάτεις", "andavas"],
  ["περιεπάτουν", "andavam"],
  ["περιεπατήσαμεν", "andamos"],
  ["περιεπατήσατέ", "andastes"],
  ["περιεπατήσατε", "andastes"],
  ["περιεποιήσατο", "adquiriu"],
  ["περιεργαζομένους", "intrometendo-se"],
  ["περιερχομένων", "andando-ao-redor"],
  ["περιερχόμεναι", "andando-ao-redor"],
  ["περιεσπᾶτο", "estava-distraída"],
  ["περιεστῶτα", "tendo-estado-ao-redor"],
  ["περιετμήθητε", "fostes-circuncidados"],

  // --- περιζ-/περιθ-/περικ- palavras ---
  ["περιζωσάμενοι", "tendo-se-cingido"],
  ["περιζωσάμενος", "tendo-se-cingido"],
  ["περιζώσεται", "se-cingirá"],
  ["περιθέντες", "tendo-colocado-ao-redor"],
  ["περιθέσεως", "adorno"],
  ["περικαθάρματα", "imundícies"],
  ["περικαλύπτειν", "cobrir"],
  ["περικαλύψαντες", "tendo-coberto"],
  ["περικείμενον", "rodeando"],
  ["περικεκαλυμμένην", "tendo-sido-coberta"],
  ["περικρατεῖς", "tendo-domínio"],
  ["περικυκλώσουσίν", "cercarão"],

  // --- περιλ-/περιμ-/περιο-/περιπ- palavras ---
  ["περιλάμψαν", "tendo-resplandecido-ao-redor"],
  ["περιμένειν", "esperar"],
  ["περιοικοῦντας", "habitando-ao-redor"],
  ["περιοχὴ", "passagem"],
  ["περιούσιον", "peculiar"],
  ["περιπέσητε", "caiais-entre"],
  ["περιπατήσῃ", "ande"],
  ["περιπατείτω", "ande"],
  ["περιπατοῦμεν", "andamos"],
  ["περιπατοῦντι", "andando"],
  ["περιπεσόντες", "tendo-caído-entre"],
  ["περιποιήσασθαι", "adquirir"],
  ["περιποιήσεως", "aquisição"],
  ["περιποιοῦνται", "adquirem"],
  ["περιρήξαντες", "tendo-rasgado"],

  // --- περισ- palavras ---
  ["περισσεία", "abundância"],
  ["περισσεύετε", "abundais"],
  ["περισσεύματα", "sobras"],
  ["περισσεύομεν", "abundamos"],
  ["περισσεύονται", "abundam"],
  ["περισσεύουσα", "abundando"],
  ["περισσεύσαι", "abundar"],
  ["περισσεύσαντα", "tendo-abundado"],
  ["περισσεύω", "abundo"],
  ["περισσεῦσαι", "abundar"],
  ["περισσεῦσαν", "abundou"],
  ["περισσοτέρᾳ", "mais-abundante"],
  ["περισσοῦ", "abundante"],
  ["περισσόν", "abundante"],

  // --- περιστ- palavras ---
  ["περιστεράς", "pombas"],
  ["περιστεραί", "pombas"],
  ["περιστερῶν", "pombas"],

  // --- περιτ- palavras ---
  ["περιτέμνετε", "circuncidais"],
  ["περιτέμνησθε", "sejais-circuncidados"],
  ["περιτίθεμεν", "colocamos-ao-redor"],
  ["περιτεμνέσθω", "seja-circuncidado"],
  ["περιτεμνομένῳ", "sendo-circuncidado"],
  ["περιτεμνόμενοι", "sendo-circuncidados"],
  ["περιτετμημένος", "tendo-sido-circuncidado"],
  ["περιτιθέασιν", "colocam-ao-redor"],
  ["περιτμηθῆναι", "ser-circuncidado"],
  ["περιτμηθῆτε", "sejais-circuncidados"],
  ["περιτρέπει", "enlouquece"],

  // --- περιφ-/περιχ-/περιη- palavras ---
  ["περιφέρειν", "carregar-ao-redor"],
  ["περιφέροντες", "carregando-ao-redor"],
  ["περιφερόμενοι", "sendo-levados-ao-redor"],
  ["περιφρονείτω", "despreze"],
  ["περιχώρῳ", "região-circunvizinha"],
  ["περιῃρεῖτο", "era-removida"],
  ["περιῆλθον", "percorreram"],

  // --- περπ-/πεσ- palavras ---
  ["περπερεύεται", "vangloria-se"],
  ["πεσεῖν", "cair"],
  ["πεσόν", "tendo-caído"],
  ["πεσόντα", "tendo-caído"],
  ["πεσόντας", "tendo-caído"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11r (freq 1, parte 18/44) ===`);
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
    const parsed = JSON.parse(result.substring(jsonStart));
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    process.stdout.write(changes > 0 ? `✓ ${word} → ${translation} (${changes})\n` : `· ${word} → ${translation} (0)\n`);
    success++;
  } catch (err) {
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 11r ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11w
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 23/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11w-${Date.now()}.sql`);

const translations = [
  // === 248 palavras gregas freq 1 — parte 23/44 (συμφ-συνσ) ===

  // --- συμφων- (formas de συμφωνέω — concordar) ---
  ["συμφωνήσας", "tendo-concordado"],
  ["συμφωνήσει", "concordará"],
  ["συμφωνήσωσιν", "concordem"],
  ["συμφωνίας", "sinfonia"],
  ["συμφωνοῦσιν", "concordam"],
  ["συμφώνησις", "concordância"],
  ["συμφώνου", "acordo"],

  // --- συνάγ- (formas de συνάγω — reunir/ajuntar) ---
  ["συνάγει", "reúne"],
  ["συνάγεται", "é-reunido"],
  ["συνάγω", "reúno"],
  ["συνάξει", "reunirá"],

  // --- συνέ- (aoristo/imperfeito com prefixo συν-) ---
  ["συνέβαινεν", "acontecia"],
  ["συνέβαλλεν", "ponderava"],
  ["συνέβη", "aconteceu"],
  ["συνέδραμεν", "correu-junto"],
  ["συνέδραμον", "correram-junto"],
  ["συνέθλιβον", "comprimiam"],
  ["συνέκδημος", "com-viajante"],
  ["συνέκλεισαν", "encerraram-junto"],
  ["συνέλαβεν", "concebeu"],
  ["συνέλεξαν", "recolheram"],
  ["συνέλθῃ", "reúna-se"],
  ["συνέξουσίν", "conterão"],
  ["συνέπεσεν", "caiu-junto"],
  ["συνέπνιγον", "sufocavam"],
  ["συνέπνιξαν", "sufocaram"],
  ["συνέρχεσθε", "reunis-vos"],
  ["συνέρχεται", "reúne-se"],
  ["συνέστειλαν", "envolveram"],
  ["συνέστηκεν", "subsiste"],
  ["συνέσχον", "apertaram"],
  ["συνέταξέν", "ordenou"],
  ["συνέφαγες", "comeste-com"],
  ["συνέχαιρον", "alegravam-se-com"],
  ["συνέχει", "constrange"],
  ["συνέχεον", "confundiam"],
  ["συνέχοντες", "constrangendo"],
  ["συνέχουσίν", "constrangem"],
  ["συνέχυννεν", "confundia"],

  // --- συνή- (aoristo/imperfeito com prefixo συν-) ---
  ["συνήγειρεν", "co-ressuscitou"],
  ["συνήδομαι", "deleito-me-com"],
  ["συνήθεια", "costume"],
  ["συνήθειαν", "costume"],
  ["συνήθλησάν", "combateram-junto"],
  ["συνήλλασσεν", "reconciliava"],
  ["συνήργει", "cooperava"],
  ["συνήρπασαν", "arrebataram"],
  ["συνήρχετο", "reunia-se"],
  ["συνήρχοντο", "reuniam-se"],
  ["συνήσθιεν", "comia-com"],
  ["συνήσουσιν", "compreenderão"],

  // --- συνί- (formas de συνίημι — compreender) ---
  ["συνίουσιν", "compreendem"],
  ["συνίστασθαι", "recomendar-se"],
  ["συνίων", "compreendendo"],

  // --- συναίρ- (συναίρω — ajustar contas) ---
  ["συναίρει", "ajusta-contas"],
  ["συναίρειν", "ajustar-contas"],

  // --- συναγ- (formas de συνάγω — reunir) ---
  ["συναγάγετε", "reuni"],
  ["συναγάγῃ", "reúna"],
  ["συναγαγούσῃ", "tendo-reunido"],
  ["συναγωγάς", "sinagogas"],
  ["συναγωγὴ", "sinagoga"],
  ["συναγωγῶν", "sinagogas"],

  // --- συναγων- a συναθρ- ---
  ["συναγωνίσασθαί", "lutar-junto-com"],
  ["συναθλοῦντες", "combatendo-junto"],
  ["συναθροίσας", "tendo-reunido"],

  // --- συναιχ- a συνακολ- ---
  ["συναιχμαλώτους", "co-prisioneiros"],
  ["συνακολουθοῦσαι", "seguindo-junto"],
  ["συνακολουθῆσαι", "seguir-junto"],

  // --- συναλ- a συνανακ- ---
  ["συναλιζόμενος", "reunindo-se-com"],
  ["συναναβᾶσαι", "tendo-subido-com"],
  ["συναναβᾶσιν", "tendo-subido-com"],
  ["συνανακείμενοι", "reclinando-se-à-mesa-com"],
  ["συνανακειμένοις", "reclinando-se-à-mesa-com"],
  ["συνανακειμένους", "reclinando-se-à-mesa-com"],

  // --- συναναπ- a συναντ- ---
  ["συναναπαύσωμαι", "descanse-com"],
  ["συναντήσει", "encontrará"],
  ["συναντήσοντά", "havendo-de-encontrar"],
  ["συναντιλάβηται", "ajude-junto"],
  ["συναντιλαμβάνεται", "ajuda-junto"],

  // --- συναπ- (formas com prefixo συν- + ἀπό-) ---
  ["συναπέστειλα", "enviei-junto"],
  ["συναπήχθη", "foi-levado-junto"],
  ["συναπαγόμενοι", "sendo-levados-junto"],
  ["συναπαχθέντες", "tendo-sido-levados-junto"],
  ["συναπεθάνομεν", "co-morremos"],
  ["συναπώλετο", "pereceu-junto"],

  // --- συναρμ- a συναυξ- ---
  ["συναρμολογουμένη", "sendo-ajustada-junto"],
  ["συναρμολογούμενον", "sendo-ajustado-junto"],
  ["συναρπάσαντες", "tendo-arrebatado"],
  ["συναρπασθέντος", "tendo-sido-arrebatado"],
  ["συναυξάνεσθαι", "crescer-junto"],

  // --- συναχ- (formas de συνάγω — reunir, passivo) ---
  ["συναχθέντες", "tendo-sido-reunidos"],
  ["συναχθέντων", "tendo-sido-reunidos"],

  // --- συνβ- (formas com prefixo συν- + β-) ---
  ["συνβάλλουσα", "ponderando"],
  ["συνβασιλεύσομεν", "co-reinaremos"],
  ["συνβασιλεύσωμεν", "co-reinemos"],
  ["συνβιβασθέντες", "tendo-sido-unidos"],

  // --- συνγ- ---
  ["συνγνώμην", "concessão"],

  // --- συνδ- (formas com δεσμός, δοῦλος, δοξάζω) ---
  ["συνδέσμων", "ligaduras"],
  ["συνδέσμῳ", "ligadura"],
  ["συνδεδεμένοι", "tendo-sido-amarrados-com"],
  ["συνδοξασθῶμεν", "sejamos-co-glorificados"],
  ["συνδούλου", "co-servo"],
  ["συνδούλους", "co-servos"],
  ["συνδούλων", "co-servos"],
  ["συνδρομὴ", "concurso"],

  // --- συνει- (formas de συνείδησις — consciência) ---
  ["συνείληφεν", "concebeu"],
  ["συνείπετο", "seguia-com"],
  ["συνείχετο", "era-constrangido"],
  ["συνείχοντο", "eram-constrangidos"],

  // --- συνεβ- a συνεζ- ---
  ["συνεβάλετο", "contribuiu"],
  ["συνεβίβασαν", "concluíram"],
  ["συνεζήτει", "discutia"],

  // --- συνειδ- (consciência) ---
  ["συνειδήσεσιν", "consciências"],
  ["συνειδήσεώς", "consciência"],
  ["συνειδυίης", "estando-ciente"],

  // --- συνεκ- (formas com prefixo συν- + ἐκ-) ---
  ["συνεκάθισεν", "fez-sentar-junto"],
  ["συνεκάλεσαν", "convocaram"],
  ["συνεκέρασεν", "misturou"],
  ["συνεκίνησάν", "agitaram"],
  ["συνεκδήμους", "com-viajantes"],
  ["συνεκλεκτὴ", "co-eleita"],
  ["συνεκόμισαν", "levaram-para-sepultar"],

  // --- συνελ- (formas de συνέρχομαι — vir junto) ---
  ["συνελάλησεν", "conversou-com"],
  ["συνεληλυθυῖαι", "tendo-se-reunido"],
  ["συνεληλυθότας", "tendo-se-reunido"],
  ["συνεληλύθεισαν", "tinham-se-reunido"],
  ["συνελθούσαις", "tendo-se-reunido"],
  ["συνελθόντα", "tendo-se-reunido"],
  ["συνελθόντας", "tendo-se-reunido"],
  ["συνελθόντες", "tendo-se-reunido"],
  ["συνελογίσαντο", "raciocinaram"],

  // --- συνεν- a συνεπ- ---
  ["συνενέγκαντες", "tendo-carregado-junto"],
  ["συνεπέθεντο", "atacaram-junto"],
  ["συνεπέστη", "levantou-se-junto"],
  ["συνεπίομεν", "bebemos-com"],
  ["συνεπαθήσατε", "compadecestes-vos"],
  ["συνεπιμαρτυροῦντος", "co-testificando"],
  ["συνεπληροῦντο", "enchiam-se"],
  ["συνεπορεύετο", "caminhava-junto"],
  ["συνεπορεύοντο", "caminhavam-junto"],

  // --- συνεργ- (formas de συνεργέω — cooperar) ---
  ["συνεργεῖ", "coopera"],
  ["συνεργούς", "cooperadores"],
  ["συνεργοῦντι", "cooperando"],
  ["συνεργοῦντος", "cooperando"],
  ["συνεργῶν", "cooperando"],
  ["συνεργῷ", "cooperador"],

  // --- συνερχ- (formas de συνέρχομαι — vir junto) ---
  ["συνερχομένων", "reunindo-se"],
  ["συνερχόμενοι", "reunindo-se"],

  // --- συνεσθ- (comer junto) ---
  ["συνεσθίει", "come-com"],
  ["συνεσθίειν", "comer-com"],

  // --- συνεστ- (formas diversas com prefixo συν-) ---
  ["συνεστήσατε", "recomendaste"],
  ["συνεσταλμένος", "tendo-sido-contraído"],
  ["συνεσταυρωμένοι", "tendo-sido-co-crucificados"],
  ["συνεσταυρώθη", "foi-co-crucificado"],
  ["συνεσταύρωμαι", "tenho-sido-co-crucificado"],
  ["συνεστῶσα", "tendo-subsistido"],
  ["συνεστῶτας", "tendo-se-reunido"],

  // --- συνετ- (formas diversas) ---
  ["συνετάφημεν", "fomos-co-sepultados"],
  ["συνετέθειντο", "tinham-combinado"],
  ["συνετῷ", "prudente"],

  // --- συνευ- (formas com εὐ-) ---
  ["συνευδοκεῖτε", "consentis"],
  ["συνευδοκοῦσιν", "consentem"],

  // --- συνεφ- (formas com ἐπί-/φωνέω) ---
  ["συνεφάγομεν", "comemos-com"],
  ["συνεφωνήθη", "foi-combinado"],
  ["συνεφώνησάς", "combinaste"],

  // --- συνεχ- (formas de συνέχω — constranger) ---
  ["συνεχομένη", "sendo-constrangida"],
  ["συνεχομένους", "sendo-constrangidos"],
  ["συνεχόμενον", "sendo-constrangido"],

  // --- συνεχ- a συνεψ- ---
  ["συνεχύθη", "foi-confundida"],
  ["συνεψήφισαν", "contaram-junto"],

  // --- συνζ- (formas com ζάω/ζητέω) ---
  ["συνζήσομεν", "co-viveremos"],
  ["συνζητεῖτε", "discutis"],
  ["συνζητητὴς", "disputador"],
  ["συνζητούντων", "discutindo"],
  ["συνζητοῦντας", "discutindo"],
  ["συνζῆν", "co-viver"],

  // --- συνηγ- a συνηρ- ---
  ["συνηγάγομεν", "reunimos"],
  ["συνηθείᾳ", "costume"],
  ["συνηθροισμένοι", "tendo-sido-reunidos"],
  ["συνηκολούθει", "seguia-junto"],
  ["συνηλικιώτας", "contemporâneos"],
  ["συνηρπάκει", "tinha-arrebatado"],

  // --- συνθ- (formas com θλίβω/θρύπτω) ---
  ["συνθλίβοντά", "comprimindo"],
  ["συνθρύπτοντές", "enternecendo"],

  // --- συνι- (formas de συνίημι — compreender) ---
  ["συνιέντος", "compreendendo"],
  ["συνιδόντες", "tendo-percebido"],
  ["συνιδών", "tendo-percebido"],
  ["συνιείς", "compreendes"],
  ["συνιστάνειν", "recomendar"],
  ["συνιστάνομεν", "recomendamos"],
  ["συνιστάνω", "recomendo"],
  ["συνιστάνων", "recomendando"],
  ["συνιστανόντων", "recomendando"],
  ["συνιᾶσιν", "compreendem"],

  // --- συνκαθ- (formas com κάθημαι — sentar) ---
  ["συνκαθήμενοι", "sentando-se-com"],
  ["συνκαθήμενος", "sentando-se-com"],
  ["συνκαθισάντων", "tendo-sentado-com"],

  // --- συνκακ- a συνκαλ- ---
  ["συνκακουχεῖσθαι", "ser-maltratado-com"],
  ["συνκαλέσασθαι", "convocar"],
  ["συνκαλοῦσιν", "convocam"],

  // --- συνκατ- (formas com κατά-) ---
  ["συνκατάθεσις", "acordo"],
  ["συνκαταβάντες", "tendo-descido-com"],
  ["συνκατατεθειμένος", "tendo-consentido"],
  ["συνκατεψηφίσθη", "foi-contado-com"],

  // --- συνκεκ- a συνκρ- ---
  ["συνκεκερασμένος", "tendo-sido-misturado"],
  ["συνκλειόμενοι", "sendo-encerrados"],
  ["συνκληρονόμα", "co-herdeira"],
  ["συνκληρονόμοι", "co-herdeiros"],
  ["συνκληρονόμοις", "co-herdeiros"],
  ["συνκληρονόμων", "co-herdeiros"],
  ["συνκοινωνήσαντές", "tendo-participado-com"],
  ["συνκοινωνεῖτε", "participais-com"],
  ["συνκοινωνούς", "co-participantes"],
  ["συνκρῖναι", "comparar"],
  ["συνκύπτουσα", "estando-encurvada"],

  // --- συνλ- (formas com λαλέω/λαμβάνω/λυπέω) ---
  ["συνλαλήσας", "tendo-conversado-com"],
  ["συνλαμβάνου", "ajuda"],
  ["συνλυπούμενος", "entristecendo-se-com"],

  // --- συνμ- (formas com μέτοχος/μαθητής/μαρτυρέω/μερίζω) ---
  ["συνμέτοχα", "co-participantes"],
  ["συνμέτοχοι", "co-participantes"],
  ["συνμαθηταῖς", "co-discípulos"],
  ["συνμαρτυρεῖ", "co-testifica"],
  ["συνμερίζονται", "repartem-entre-si"],

  // --- συνοδ- a συνομ- ---
  ["συνοδίᾳ", "caravana"],
  ["συνοδεύοντες", "viajando-junto"],
  ["συνοικοδομεῖσθε", "sois-co-edificados"],
  ["συνοικοῦντες", "habitando-com"],
  ["συνομιλῶν", "conversando-com"],
  ["συνομοροῦσα", "fazendo-fronteira-com"],

  // --- συνοχ- ---
  ["συνοχὴ", "angústia"],
  ["συνοχῆς", "angústia"],

  // --- συνπ- (formas com πάσχω/παρά-/πλήρ-/πνίγ-/πολίτ-/πορεύ-/πρεσβ-) ---
  ["συνπάσχει", "sofre-com"],
  ["συνπάσχομεν", "sofremos-com"],
  ["συνπαθῆσαι", "compadecer-se"],
  ["συνπαραγενόμενοι", "tendo-se-apresentado-junto"],
  ["συνπαρακληθῆναι", "ser-co-encorajado"],
  ["συνπαραλαβεῖν", "levar-consigo"],
  ["συνπαραλαβόντες", "tendo-levado-consigo"],
  ["συνπαραλαβὼν", "tendo-levado-consigo"],
  ["συνπαραλαμβάνειν", "levar-consigo"],
  ["συνπαρόντες", "estando-presentes-com"],
  ["συνπληροῦσθαι", "ser-enchido"],
  ["συνπνίγονται", "são-sufocados"],
  ["συνπνίγουσιν", "sufocam"],
  ["συνπολῖται", "co-cidadãos"],
  ["συνπορεύονται", "caminham-junto"],
  ["συνπρεσβύτερος", "co-presbítero"],

  // --- συνσ- (formas com σταυρόω — crucificar) ---
  ["συνσταυρωθέντες", "tendo-sido-co-crucificados"],
];

let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11w (freq 1, parte 23/44) ===`);
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

console.log(`\n=== Resultado Lote 11w ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

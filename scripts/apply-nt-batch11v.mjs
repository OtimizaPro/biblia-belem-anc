#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11v
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 22/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11v-${Date.now()}.sql`);

const translations = [
  // === Lote 11v — freq 1, parte 22/44 (247 palavras) ===

  // --- σκ- palavras: cavar, tenda, escândalo, cobrir ---
  ["σκάψω", "cavarei"],
  ["σκήνει", "tenda"],
  ["σκήνους", "tenda"],
  ["σκήνωμα", "habitação"],
  ["σκανδάλων", "escândalos"],
  ["σκανδαλίζονται", "são-escandalizados"],
  ["σκανδαλίσω", "escandalizarei"],
  ["σκανδαλίσωμεν", "escandalizemos"],
  ["σκανδαλισθήσομαι", "serei-escandalizado"],
  ["σκανδαλισθῆτε", "sejais-escandalizados"],
  ["σκεπάσματα", "coberturas"],
  ["σκευὴν", "equipamento"],
  ["σκεύεσιν", "vasos"],
  ["σκηνήν", "tenda"],
  ["σκηναῖς", "tendas"],
  ["σκηνοπηγία", "festa-das-tendas"],
  ["σκηνοποιοὶ", "fabricantes-de-tendas"],
  ["σκηνώματι", "habitação"],
  ["σκηνώματός", "habitação"],
  ["σκηνὰς", "tendas"],
  ["σκηνὴ", "tenda"],
  ["σκηνὴν", "tenda"],
  ["σκηνῇ", "tenda"],
  ["σκιρτήσατε", "saltai-de-alegria"],
  ["σκιὰν", "sombra"],
  ["σκληρυνθῇ", "seja-endurecido"],
  ["σκληρόν", "duro"],
  ["σκληρότητά", "dureza"],
  ["σκληρύνει", "endurece"],
  ["σκληρὸς", "duro"],

  // --- σκολ- / σκοπ- palavras: torto, observar ---
  ["σκολιοῖς", "tortuosos"],
  ["σκολιὰ", "tortuosas"],
  ["σκοπεῖν", "observar"],
  ["σκοπεῖτε", "observai"],
  ["σκοπούντων", "observando"],
  ["σκοποῦντες", "observando"],
  ["σκοπὸν", "alvo"],
  ["σκοπῶν", "observando"],

  // --- σκορπ- palavras: escorpião, dispersar ---
  ["σκορπίον", "escorpião"],
  ["σκορπίων", "escorpiões"],
  ["σκορπισθῆτε", "sejais-dispersos"],

  // --- σκοτ- palavras: trevas, escuridão ---
  ["σκοτίας", "trevas"],
  ["σκοτεινὸν", "tenebroso"],
  ["σκοτισθήτωσαν", "sejam-obscurecidos"],

  // --- σκ- palavras diversas ---
  ["σκωληκόβρωτος", "comido-por-vermes"],
  ["σκόλοψ", "espinho"],
  ["σκόπει", "observa"],
  ["σκύβαλα", "refugo"],
  ["σκύλλε", "incomodes"],
  ["σκύλλεις", "incomodas"],
  ["σκύλλου", "incomodes"],
  ["σκώληξ", "verme"],
  ["σκῦλα", "despojos"],

  // --- σμ- palavras: mirra ---
  ["σμύρναν", "mirra"],
  ["σμύρνης", "mirra"],

  // --- σο- palavras: caixão, lenço ---
  ["σοροῦ", "caixão"],
  ["σουδάρια", "lenços"],
  ["σουδάριον", "lenço"],

  // --- σοφ- palavras: sabedoria, sábio ---
  ["σοφίαν", "sabedoria"],
  ["σοφίσαι", "tornar-sábio"],
  ["σοφοί", "sábios"],
  ["σοφούς", "sábios"],
  ["σοφοῖς", "sábios"],
  ["σοφώτερον", "mais-sábio"],
  ["σοφῷ", "sábio"],
  ["σούς", "teus"],

  // --- σπ- palavras: semente, mancha ---
  ["σπέρμασιν", "sementes"],
  ["σπέρματος", "semente"],
  ["σπίλοι", "manchas"],
  ["σπίλον", "mancha"],

  // --- σπαρ- palavras: convulsionar, semear ---
  ["σπαράξαν", "tendo-convulsionado"],
  ["σπαράξας", "tendo-convulsionado"],
  ["σπαράσσει", "convulsiona"],
  ["σπαρέντες", "tendo-sido-semeados"],
  ["σπαταλῶσα", "vivendo-em-luxúria"],

  // --- σπείρ- palavras: semear, coorte ---
  ["σπείραντι", "tendo-semeado"],
  ["σπείραντος", "tendo-semeado"],
  ["σπείρας", "tendo-semeado"],
  ["σπείρει", "semeia"],
  ["σπείροντι", "semeando"],
  ["σπείρῃ", "semeie"],
  ["σπεκουλάτορα", "guarda-executor"],
  ["σπερμολόγος", "tagarela"],
  ["σπεύδοντας", "apressando-se"],
  ["σπεύσαντες", "tendo-se-apressado"],
  ["σπεῖρα", "coorte"],

  // --- σπ- palavras diversas ---
  ["σπηλαίοις", "cavernas"],
  ["σπιλάδες", "rochas-ocultas"],
  ["σπιλοῦσα", "manchando"],
  ["σποδὸς", "cinza"],
  ["σπορᾶς", "semente"],

  // --- σπουδ- palavras: diligência, zelo ---
  ["σπουδάζοντες", "sendo-diligentes"],
  ["σπουδάσω", "serei-diligente"],
  ["σπουδήν", "diligência"],
  ["σπουδαιοτέρως", "mais-diligentemente"],
  ["σπουδαιότερον", "mais-diligente"],
  ["σπουδαιότερος", "mais-diligente"],
  ["σπουδαῖον", "diligente"],

  // --- σπυρ- palavras: cesto ---
  ["σπυρίδι", "cesto"],
  ["σπυρίδων", "cestos"],

  // --- στ- palavras: posição, coluna, espiga ---
  ["στάμνος", "vaso"],
  ["στάντος", "tendo-ficado-de-pé"],
  ["στάσει", "dissensão"],
  ["στάσεις", "dissensões"],
  ["στάσις", "dissensão"],
  ["στάχυν", "espiga"],
  ["στάχυϊ", "espiga"],

  // --- στέ- palavras: cobrir, suportar, enviar ---
  ["στέγει", "suporta"],
  ["στέγομεν", "suportamos"],
  ["στέγοντες", "suportando"],
  ["στέγων", "suportando"],
  ["στέλλεσθαι", "afastar-se"],
  ["στέμματα", "grinaldas"],
  ["στέφανός", "coroa"],

  // --- στή- palavras: firmar, estabelecer ---
  ["στήθη", "peitos"],
  ["στήκοντες", "permanecendo-firmes"],
  ["στήρισον", "firma"],
  ["στήσει", "estabelecerá"],
  ["στήσῃ", "estabeleça"],
  ["στήσῃς", "estabeleças"],

  // --- στί- palavras: marca, resplandecer ---
  ["στίγματα", "marcas"],
  ["στίλβοντα", "resplandecentes"],

  // --- σταδ- / σταθ- palavras: estádio, ficar de pé ---
  ["σταδίῳ", "estádio"],
  ["σταθέντα", "tendo-sido-posto-de-pé"],
  ["σταθήσεσθε", "sereis-postos-de-pé"],
  ["σταθῆναι", "ser-posto-de-pé"],
  ["σταθῆτε", "sejais-postos-de-pé"],
  ["σταθῇ", "seja-posto-de-pé"],

  // --- στασ- / στατ- palavras: sedição, moeda ---
  ["στασιαστῶν", "insurgentes"],
  ["στατῆρα", "estáter"],

  // --- σταυρ- palavras: crucificar, cruz ---
  ["σταυροῦνται", "são-crucificados"],
  ["σταυρώσαντες", "tendo-crucificado"],
  ["σταυρώσατε", "crucificai"],
  ["σταυρώσετε", "crucificareis"],
  ["σταυρώσω", "crucificarei"],
  ["σταυρώσωσιν", "crucifiquem"],
  ["σταυρὸς", "cruz"],
  ["σταυρῶσαί", "crucificar"],

  // --- σταφ- palavras: uva ---
  ["σταφυλὰς", "uvas"],
  ["σταφυλὴν", "uva"],
  ["σταύρου", "cruz"],

  // --- στε- palavras: estéril, enviar, gemer ---
  ["στείρᾳ", "estéril"],
  ["στελλόμενοι", "afastando-se"],
  ["στενάζετε", "gemeis"],
  ["στενάζοντες", "gemendo"],
  ["στεναγμοῖς", "gemidos"],
  ["στεναγμοῦ", "gemido"],
  ["στενοχωρούμενοι", "sendo-angustiados"],
  ["στενὴ", "estreita"],

  // --- στερ- palavras: firmeza, sólido ---
  ["στερέωμα", "firmeza"],
  ["στερεοὶ", "sólidos"],
  ["στερεὰ", "sólida"],
  ["στερεὸς", "sólido"],
  ["στερεᾶς", "sólida"],

  // --- στεφ- / στει- palavras: coroar ---
  ["στεφανοῦται", "é-coroado"],
  ["στεῖραι", "estéreis"],

  // --- στηρ- palavras: firmar, fortalecer ---
  ["στηρίζων", "firmando"],
  ["στηρίξατε", "firmai"],
  ["στηριγμοῦ", "firmeza"],
  ["στηριχθῆναι", "ser-firmado"],

  // --- στιβ- / στιγ- palavras: ramos, instante ---
  ["στιβάδας", "ramos"],
  ["στιγμῇ", "instante"],

  // --- στοιχ- palavras: caminhar, elementos ---
  ["στοιχήσουσιν", "caminharão"],
  ["στοιχείων", "elementos"],
  ["στοιχεῖν", "caminhar"],
  ["στοιχεῖς", "caminhas"],
  ["στοιχοῦσιν", "caminham"],
  ["στοιχῶμεν", "caminhemos"],

  // --- στο- palavras: pórtico ---
  ["στοὰς", "pórticos"],

  // --- στρ- palavras: exército, soldado, virar ---
  ["στράτευμα", "exército"],
  ["στρέψον", "vira"],
  ["στρατείαν", "guerra"],
  ["στρατείας", "guerra"],
  ["στρατευομένων", "guerreando"],
  ["στρατευόμεθα", "guerreamos"],
  ["στρατευόμενοι", "guerreando"],
  ["στρατευόμενος", "guerreando"],
  ["στρατεύεται", "guerreia"],
  ["στρατεύμασιν", "exércitos"],
  ["στρατεύματι", "exército"],
  ["στρατεύονται", "guerreiam"],
  ["στρατεύῃ", "guerreies"],
  ["στρατηγοὺς", "comandantes"],
  ["στρατιώτην", "soldado"],
  ["στρατιώτης", "soldado"],
  ["στρατιᾶς", "exército"],
  ["στρατιᾷ", "exército"],
  ["στρατολογήσαντι", "tendo-alistado"],
  ["στρατοπέδων", "exércitos"],
  ["στραφέντες", "tendo-se-virado"],
  ["στραφεῖσα", "tendo-se-virado"],
  ["στραφῆτε", "vireis-vos"],
  ["στραφῶσιν", "virem-se"],
  ["στρεβλοῦσιν", "torcem"],
  ["στρεφόμεθα", "viramo-nos"],
  ["στρῶσον", "prepara"],

  // --- στυ- / στο- palavras: odioso, sombrio ---
  ["στυγητοί", "odiosos"],
  ["στυγνάζων", "ficando-sombrio"],
  ["στυγνάσας", "tendo-ficado-sombrio"],
  ["στόματός", "boca"],
  ["στόμαχον", "estômago"],
  ["στᾶσα", "tendo-ficado-de-pé"],

  // --- συγ- palavras: parentesco, cobrir, misturar ---
  ["συγγένειαν", "parentela"],
  ["συγγενίς", "parenta"],
  ["συγγενὴς", "parente"],
  ["συγγενῆ", "parente"],
  ["συγκεκαλυμμένον", "tendo-sido-encoberto"],
  ["συγκεχυμένη", "tendo-sido-confundida"],
  ["συγκυρίαν", "coincidência"],
  ["συγχύσεως", "confusão"],

  // --- συζ- / συκ- palavras: viver-com, figo ---
  ["συζήσομεν", "viveremos-com"],
  ["συκαμίνῳ", "sicômoro"],
  ["συκομορέαν", "sicômoro"],
  ["συκοφαντήσητε", "extorquais"],
  ["συκῇ", "figueira"],

  // --- συλ- palavras: despojar, colher, prender ---
  ["συλαγωγῶν", "fazendo-presa"],
  ["συλλέγεται", "é-colhido"],
  ["συλλέγοντες", "colhendo"],
  ["συλλέξουσιν", "colherão"],
  ["συλλέξωμεν", "colhamos"],
  ["συλλήμψῃ", "conceberás"],
  ["συλλαβέσθαι", "prender"],
  ["συλλαβοῦσα", "tendo-concebido"],
  ["συλλαβοῦσιν", "prendam"],
  ["συλλαβόμενοι", "tendo-prendido"],
  ["συλλημφθέντα", "tendo-sido-concebido"],
  ["συλλημφθῆναι", "ser-concebido"],

  // --- συμβ- palavras: acontecer, reunir, aconselhar ---
  ["συμβάντων", "tendo-acontecido"],
  ["συμβέβηκεν", "tem-acontecido"],
  ["συμβαίνειν", "acontecer"],
  ["συμβαίνοντος", "acontecendo"],
  ["συμβαλεῖν", "ponderar"],
  ["συμβεβηκότι", "tendo-acontecido"],
  ["συμβιβάζοντες", "unindo"],
  ["συμβιβάζων", "unindo"],
  ["συμβιβάσει", "unirá"],
  ["συμβουλίου", "conselho"],
  ["συμβουλεύσας", "tendo-aconselhado"],
  ["συμβούλιόν", "conselho"],

  // --- συμμ- / συμπ- palavras: conformar, compadecer ---
  ["συμμορφιζόμενος", "sendo-conformado"],
  ["συμμόρφους", "conformes"],
  ["συμπαθεῖς", "compassivos"],
  ["συμπεριλαβὼν", "tendo-abraçado"],
  ["συμπληροῦσθαι", "ser-completado"],
  ["συμπνίγει", "sufoca"],

  // --- συμφ- palavras: conveniente, compatriota ---
  ["συμφερόντων", "sendo-convenientes"],
  ["συμφυλετῶν", "compatriotas"],
];

let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11v (freq 1, parte 22/44) ===`);
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

console.log(`\n=== Resultado Lote 11v ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

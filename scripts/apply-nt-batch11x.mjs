#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11x
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 24/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11x-${Date.now()}.sql`);

const translations = [
  // === Lote 11x: freq 1, parte 24/44 (248 palavras) ===

  // --- συν- compostos (co-/com-/junto-) ---
  ["συνσταυρωθέντος", "co-crucificado"],
  ["συνστενάζει", "geme-junto"],
  ["συνστοιχεῖ", "corresponde"],
  ["συνστρατιώτην", "co-soldado"],
  ["συνσχηματίζεσθε", "conformai-vos"],
  ["συντέλεια", "consumação"],
  ["συντέμνων", "abreviando"],
  ["συνταφέντες", "co-sepultados"],
  ["συντελέσας", "tendo-completado"],
  ["συντελέσω", "completarei"],
  ["συντελεσθεισῶν", "tendo-sido-completadas"],
  ["συντελῶν", "completando"],
  ["συντετριμμένον", "tendo-sido-quebrado"],
  ["συντετρῖφθαι", "ter-sido-quebrado"],
  ["συντηροῦνται", "são-preservados"],
  ["συντρίψασα", "tendo-quebrado"],
  ["συντρίψει", "quebrará"],
  ["συντρεχόντων", "correndo-junto"],
  ["συντριβήσεται", "será-quebrado"],
  ["συντρῖβον", "quebrando"],
  ["συντυχεῖν", "encontrar"],
  ["συνυπεκρίθησαν", "dissimularam-junto"],
  ["συνυπουργούντων", "cooperando"],
  ["συνφυεῖσαι", "tendo-crescido-junto"],
  ["συνχαίρετέ", "alegrai-vos-comigo"],
  ["συνχαίρω", "alegro-me-junto"],
  ["συνχρῶνται", "têm-trato-com"],
  ["συνχύννεται", "é-confundida"],
  ["συνωδίνει", "sofre-dores-de-parto-junto"],
  ["συνωμοσίαν", "conspiração"],
  ["συνόντων", "estando-junto"],
  ["συνᾶραι", "ajustar-contas"],
  ["συνῆλθαν", "vieram-junto"],
  ["συνῆσαν", "estavam-junto"],

  // --- συσ- compostos ---
  ["συστατικῶν", "de-recomendação"],
  ["συστρέψαντος", "tendo-ajuntado"],
  ["συστρατιώτῃ", "co-soldado"],
  ["συστροφὴν", "ajuntamento"],
  ["συστροφῆς", "de-ajuntamento"],
  ["συσχηματιζόμενοι", "conformando-se"],

  // --- σφ- palavras ---
  ["σφάγια", "vítimas-de-sacrifício"],
  ["σφαγὴν", "matança"],
  ["σφοδρῶς", "veementemente"],
  ["σφραγίσαντες", "tendo-selado"],
  ["σφυδρά", "violenta"],

  // --- σχ- palavras ---
  ["σχήματι", "em-forma"],
  ["σχίσας", "tendo-rasgado"],
  ["σχίσει", "rasgará"],
  ["σχίσωμεν", "rasguemos"],
  ["σχιζομένους", "sendo-rasgados"],
  ["σχοινία", "cordas"],
  ["σχοινίων", "de-cordas"],
  ["σχολάζοντα", "estando-desocupado"],
  ["σχολάσητε", "dediqueis-vos"],
  ["σχολῇ", "escola"],
  ["σχῆμα", "forma"],
  ["σχῆτε", "tenhais"],

  // --- σω- palavras (salvar/corpo/são) ---
  ["σωζομένοις", "aos-sendo-salvos"],
  ["σωθῆτε", "sejais-salvos"],
  ["σωθῶ", "seja-salvo"],
  ["σωματικὴ", "corporal"],
  ["σωματικῶς", "corporalmente"],
  ["σωματικῷ", "corporal"],
  ["σωρεύσεις", "amontoarás"],
  ["σωσάτω", "salve"],
  ["σωτήριος", "salvífico"],
  ["σωτήριόν", "salvação"],
  ["σωτηρία", "salvação"],
  ["σωτηρίου", "de-salvação"],
  ["σωτὴρ", "salvador"],
  ["σωφρονήσατε", "sede-sóbrios"],
  ["σωφρονίζωσιν", "ensinem-a-ser-sóbrias"],
  ["σωφρονισμοῦ", "de-sobriedade"],
  ["σωφρονοῦμεν", "somos-sóbrios"],
  ["σωφρόνως", "sobriamente"],

  // --- σ- com acentos diversos ---
  ["σόν", "teu"],
  ["σύκων", "de-figos"],
  ["σύμβουλος", "conselheiro"],
  ["σύμμορφον", "conforme"],
  ["σύμφυτοι", "co-plantados"],
  ["σύνδεσμον", "vínculo"],
  ["σύνδεσμος", "vínculo"],
  ["σύνδουλόν", "co-servo"],
  ["σύνεσίν", "entendimento"],
  ["σύνετε", "entendei"],
  ["σύνζυγε", "companheiro-de-jugo"],
  ["σύνκαμψον", "curva-junto"],
  ["σύνοιδα", "tenho-consciência"],
  ["σύνσωμα", "co-corpo"],
  ["σύντριμμα", "destruição"],
  ["σύντροφος", "criado-junto"],
  ["σύνφημι", "concordo"],
  ["σύνψυχοι", "de-uma-só-alma"],
  ["σύροντες", "arrastando"],
  ["σύρων", "arrastando"],
  ["σύσσημον", "sinal-combinado"],
  ["σώζεται", "é-salvo"],
  ["σώσαντος", "tendo-salvo"],
  ["σώσας", "tendo-salvo"],
  ["σώσων", "havendo-de-salvar"],
  ["σὴν", "tua"],
  ["σὸς", "teu"],
  ["σῖτος", "trigo"],
  ["σῳζομένοις", "aos-sendo-salvos"],
  ["σῳζομένους", "os-sendo-salvos"],
  ["σῳζόμενοι", "os-sendo-salvos"],
  ["σῴζει", "salva"],
  ["σῴζεσθαι", "ser-salvo"],
  ["σῴζεσθε", "sois-salvos"],
  ["σῴζετε", "salvais"],

  // === τ- palavras ===

  // --- τά- palavras ---
  ["τάγματι", "em-ordem"],
  ["τάλαντόν", "talento"],
  ["τάξει", "em-ordem"],
  ["τάφοις", "em-sepulcros"],
  ["τάφος", "sepulcro"],
  ["τάφου", "de-sepulcro"],
  ["τάφους", "sepulcros"],
  ["τάχιστα", "o-mais-rapidamente"],

  // --- τέ- palavras ---
  ["τέθεικά", "tenho-posto"],
  ["τέθειται", "tem-sido-posto"],
  ["τέκνων", "de-filhos"],
  ["τέκτονος", "de-carpinteiro"],
  ["τέκτων", "carpinteiro"],
  ["τέλειός", "perfeito"],
  ["τέξῃ", "dará-à-luz"],
  ["τέρασι", "em-prodígios"],
  ["τέσσερα", "quatro"],
  ["τέτακταί", "tem-sido-designado"],
  ["τέτυχεν", "tem-obtido"],
  ["τέχνῃ", "em-arte"],

  // --- τή- palavras ---
  ["τήκεται", "é-derretido"],
  ["τήρησιν", "guarda"],
  ["τήρησις", "guarda"],
  ["τήρησον", "guarda"],

  // --- τί- palavras ---
  ["τίκτει", "dá-à-luz"],
  ["τίκτῃ", "dê-à-luz"],
  ["τίλλειν", "arrancar"],
  ["τίλλοντες", "arrancando"],
  ["τίμια", "preciosas"],
  ["τίμιον", "precioso"],
  ["τίμιος", "precioso"],
  ["τίσουσιν", "pagarão"],

  // --- τα- palavras ---
  ["τακτῇ", "designada"],
  ["ταλάντων", "de-talentos"],
  ["ταλαιπωρήσατε", "lamentai"],
  ["ταλαιπωρία", "miséria"],
  ["ταλαιπωρίαις", "em-misérias"],
  ["ταμεῖον", "quarto-interior"],
  ["ταμεῖόν", "quarto-interior"],
  ["ταπείνωσιν", "humilhação"],
  ["ταπεινούς", "humildes"],
  ["ταπεινοὺς", "humildes"],
  ["ταπεινοῦσθαι", "ser-humilhado"],
  ["ταπεινόφρονες", "humildes-de-mente"],
  ["ταπεινώθητε", "sede-humilhados"],
  ["ταπεινώσεως", "de-humilhação"],
  ["ταπεινώσῃ", "humilhe"],
  ["ταράσσων", "perturbando"],
  ["ταραχθῆτε", "sejais-perturbados"],
  ["ταραχθῇ", "seja-perturbado"],
  ["ταραχὴν", "perturbação"],
  ["ταρταρώσας", "tendo-lançado-ao-Tártaro"],
  ["τασσόμενος", "sendo-designado"],
  ["ταφὴν", "sepultamento"],
  ["ταχινή", "breve"],
  ["ταχινὴν", "breve"],
  ["ταχὺς", "rápido"],
  ["ταύρους", "touros"],
  ["ταύτας", "estas"],
  ["ταῦροί", "touros"],

  // --- τε- palavras ---
  ["τείχη", "muros"],
  ["τεθέαται", "tem-contemplado"],
  ["τεθεάμεθα", "temos-contemplado"],
  ["τεθείκατε", "tendes-posto"],
  ["τεθεικώς", "tendo-posto"],
  ["τεθειμένος", "tendo-sido-posto"],
  ["τεθεμελίωτο", "tinha-sido-fundada"],
  ["τεθεραπευμέναι", "tendo-sido-curadas"],
  ["τεθεραπευμένον", "tendo-sido-curado"],
  ["τεθεραπευμένῳ", "tendo-sido-curado"],
  ["τεθησαυρισμένοι", "tendo-sido-entesourados"],
  ["τεθλιμμένη", "tendo-sido-estreitada"],
  ["τεθνήκασιν", "têm-morrido"],
  ["τεθνηκέναι", "ter-morrido"],
  ["τεθνηκότα", "tendo-morrido"],
  ["τεθνηκότος", "tendo-morrido"],
  ["τεθραμμένος", "tendo-sido-criado"],
  ["τεθραυσμένους", "os-tendo-sido-quebrantados"],
  ["τεθυμένα", "tendo-sido-sacrificadas"],
  ["τεθῶσιν", "sejam-postos"],

  // --- τεκ- / τελ- palavras ---
  ["τεκμηρίοις", "em-provas-infalíveis"],
  ["τεκνογονίας", "de-geração-de-filhos"],
  ["τεκνογονεῖν", "gerar-filhos"],
  ["τελεία", "perfeita"],
  ["τελείοις", "aos-perfeitos"],
  ["τελείων", "de-perfeitos"],
  ["τελείως", "perfeitamente"],
  ["τελειοτέρας", "mais-perfeita"],
  ["τελειοῦμαι", "sou-aperfeiçoado"],
  ["τελειωθεὶς", "tendo-sido-aperfeiçoado"],
  ["τελειωθῇ", "seja-aperfeiçoado"],
  ["τελειωθῶσιν", "sejam-aperfeiçoados"],
  ["τελειωσάντων", "tendo-aperfeiçoado"],
  ["τελειωτὴν", "aperfeiçoador"],
  ["τελειότητα", "perfeição"],
  ["τελειότητος", "de-perfeição"],
  ["τελειώσας", "tendo-aperfeiçoado"],
  ["τελεσθήσεται", "será-completado"],
  ["τελεσθῆναι", "ser-completado"],
  ["τελεσθῇ", "seja-completado"],
  ["τελεσφοροῦσιν", "frutificam-até-o-fim"],
  ["τελευτᾶν", "morrer"],
  ["τελευτᾷ", "morre"],
  ["τελευτῆς", "de-morte"],
  ["τελευτῶν", "morrendo"],
  ["τελεῖ", "completa"],
  ["τελεῖται", "é-completado"],
  ["τελοῦσα", "completando"],
  ["τελώνην", "cobrador-de-impostos"],

  // --- τερ- / τεσ- palavras ---
  ["τεράτων", "de-prodígios"],
  ["τεσσάρων", "de-quatro"],
  ["τεσσαρεσκαιδεκάτη", "décima-quarta"],
  ["τεσσερακονταέτης", "de-quarenta-anos"],
  ["τεσσερακονταετῆ", "de-quarenta-anos"],

  // --- τετ- palavras (perfeito) ---
  ["τετάρακται", "tem-sido-perturbado"],
  ["τετάρτης", "quarta"],
  ["τετάρτῃ", "quarta"],
  ["τετέλεκα", "tenho-completado"],
  ["τετέλεσται", "tem-sido-completado"],
  ["τετήρηκαν", "têm-guardado"],
  ["τετήρηκας", "tens-guardado"],
  ["τετήρηκεν", "tem-guardado"],
  ["τεταγμέναι", "tendo-sido-designadas"],
  ["τεταγμένοι", "tendo-sido-designados"],
  ["τεταραγμένοι", "tendo-sido-perturbados"],
  ["τεταρταῖος", "de-quatro-dias"],
  ["τετελείωκεν", "tem-aperfeiçoado"],
  ["τετελείωμαι", "tenho-sido-aperfeiçoado"],
  ["τετελειωμένη", "tendo-sido-aperfeiçoada"],
  ["τετελειωμένοι", "tendo-sido-aperfeiçoados"],
  ["τετελειωμένον", "tendo-sido-aperfeiçoado"],
  ["τετελειωμένων", "tendo-sido-aperfeiçoados"],
  ["τετελευτηκότος", "tendo-morrido"],
  ["τετηρημένην", "tendo-sido-guardada"],
  ["τετηρημένοις", "aos-tendo-sido-guardados"],
  ["τετιμημένου", "tendo-sido-honrado"],
  ["τετράμηνός", "de-quatro-meses"],
  ["τετραάρχου", "de-tetrarca"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11x (freq 1, parte 24/44) ===`);
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

console.log(`\n=== Resultado Lote 11x ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

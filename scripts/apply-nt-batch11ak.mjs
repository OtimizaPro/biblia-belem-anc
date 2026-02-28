#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ak
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 37/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ak-${Date.now()}.sql`);

const translations = [
  // === Palavras de freq1-slice-ak.json (248 palavras) ===

  // --- ἐπαιν- palavras ---
  ["ἐπαινεσάτωσαν", "Louvem"],
  ["ἐπαιρόμενον", "sendo-levantado"],
  ["ἐπαισχυνθῇς", "te-envergonhes"],
  ["ἐπαισχύνεσθε", "vos-envergonhais"],
  ["ἐπαισχύνθη", "envergonhou-se"],
  ["ἐπαιτεῖν", "mendigar"],
  ["ἐπαιτῶν", "mendigando"],

  // --- ἐπακολουθ- palavras ---
  ["ἐπακολουθήσητε", "tenhais-seguido"],
  ["ἐπακολουθούντων", "seguindo"],
  ["ἐπακολουθοῦσιν", "seguem"],

  // --- ἐπαν- palavras ---
  ["ἐπανέρχεσθαί", "retornar"],
  ["ἐπαναγαγεῖν", "conduzir-para-o-alto"],
  ["ἐπαναγαγὼν", "tendo-conduzido-para-o-alto"],
  ["ἐπαναμιμνήσκων", "relembrando"],
  ["ἐπαναπαήσεται", "descansará-sobre"],
  ["ἐπαναπαύῃ", "descansas-sobre"],
  ["ἐπανελθεῖν", "retornar"],
  ["ἐπανόρθωσιν", "correção"],

  // --- ἐπαρ- palavras ---
  ["ἐπαρκέσῃ", "socorra"],
  ["ἐπαρκείτω", "socorra"],
  ["ἐπαρρησιάζετο", "falava-com-ousadia"],
  ["ἐπαρρησιάσατο", "falou-com-ousadia"],
  ["ἐπαρρησιασάμεθα", "falamos-com-ousadia"],
  ["ἐπαρχείας", "província"],
  ["ἐπαρχείῳ", "província"],

  // --- ἐπαυ- palavras ---
  ["ἐπαυσάμην", "cessei"],
  ["ἐπαυτοφώρῳ", "em-flagrante"],
  ["ἐπαφρίζοντα", "espumando-sobre"],
  ["ἐπαύοντο", "cessavam"],

  // --- ἐπει- palavras ---
  ["ἐπείθετο", "obedecia"],
  ["ἐπείνασαν", "tiveram-fome"],
  ["ἐπείραζεν", "tentava"],
  ["ἐπείραζον", "tentavam"],

  // --- ἐπεβ-/ἐπεγ- palavras ---
  ["ἐπεβίβασαν", "fizeram-montar"],
  ["ἐπεγέγραπτο", "tinha-sido-inscrito"],
  ["ἐπεγίνωσκόν", "reconheciam"],
  ["ἐπεγνωκέναι", "ter-reconhecido"],
  ["ἐπεγνωκόσι", "tendo-reconhecido"],
  ["ἐπεγνώσθην", "fui-reconhecido"],

  // --- ἐπεδ- palavras ---
  ["ἐπεδίδου", "entregava"],
  ["ἐπεδόθη", "foi-entregue"],

  // --- ἐπεζ- palavras ---
  ["ἐπεζήτησεν", "buscou"],
  ["ἐπεζήτουν", "buscavam"],

  // --- ἐπεθ- palavras ---
  ["ἐπεθύμει", "desejava"],

  // --- ἐπειρ- palavras ---
  ["ἐπειράσθησαν", "foram-tentados"],
  ["ἐπειρῶντο", "tentavam"],

  // --- ἐπεισ- palavras ---
  ["ἐπεισαγωγὴ", "introdução-de"],
  ["ἐπεισελεύσεται", "sobrevirá"],

  // --- ἐπεκ- palavras ---
  ["ἐπεκάθισεν", "sentou-se-sobre"],
  ["ἐπεκάλεσαν", "invocaram"],
  ["ἐπεκέκλητο", "tinha-sido-chamado"],
  ["ἐπεκαλύφθησαν", "foram-cobertos"],
  ["ἐπεκλήθη", "foi-chamado"],
  ["ἐπεκτεινόμενος", "estendendo-se-para"],

  // --- ἐπελ- palavras ---
  ["ἐπελάθετο", "esqueceu-se"],
  ["ἐπελεύσεται", "sobrevirá"],
  ["ἐπελθόντος", "tendo-sobrevindo"],
  ["ἐπελθὼν", "tendo-sobrevindo"],

  // --- ἐπεμ-/ἐπεν- palavras ---
  ["ἐπεμελήθη", "cuidou"],
  ["ἐπενδύτην", "veste-exterior"],
  ["ἐπενεγκεῖν", "proferir"],
  ["ἐπενθήσατε", "lamentai"],

  // --- ἐπεπ-/ἐπερ- palavras ---
  ["ἐπεποίθει", "confiava"],
  ["ἐπερίσσευον", "abundavam"],
  ["ἐπερίσσευσαν", "abundaram"],
  ["ἐπερχομέναις", "sobrevindo"],
  ["ἐπερχομένοις", "sobrevindo"],
  ["ἐπερχομένων", "sobrevindo"],

  // --- ἐπερωτ- palavras ---
  ["ἐπερωτάτωσαν", "perguntem"],
  ["ἐπερωτήσας", "tendo-perguntado"],
  ["ἐπερωτήσατε", "perguntai"],
  ["ἐπερωτᾶν", "perguntar"],
  ["ἐπερωτῶντα", "perguntando"],
  ["ἐπερώτημα", "pergunta"],

  // --- ἐπεσ-/ἐπεστ- palavras ---
  ["ἐπεσκίαζεν", "fazia-sombra-sobre"],
  ["ἐπεσκίασεν", "fez-sombra-sobre"],
  ["ἐπεστήριξαν", "fortaleceram"],
  ["ἐπεστείλαμεν", "escrevemos"],
  ["ἐπεστράφητε", "vos-convertestes"],
  ["ἐπεστρέψατε", "convertestes"],

  // --- ἐπετ-/ἐπεφ- palavras ---
  ["ἐπετίθεσαν", "impunham"],
  ["ἐπετίμα", "repreendia"],
  ["ἐπετράπη", "foi-permitido"],
  ["ἐπεφάνη", "apareceu"],
  ["ἐπεφώνει", "clamava"],

  // --- ἐπεχ- palavras ---
  ["ἐπεχείρησαν", "empreenderam"],
  ["ἐπεχείρουν", "empreendiam"],

  // --- ἐπεῖ- palavras ---
  ["ἐπεῖδεν", "olhou-sobre"],
  ["ἐπεῖχεν", "retinha"],

  // --- ἐπηγ-/ἐπηκ-/ἐπηρ- palavras ---
  ["ἐπηγγείλαντο", "prometeram"],
  ["ἐπηκολούθησεν", "seguiu"],
  ["ἐπηκροῶντο", "escutavam"],
  ["ἐπηρεάζοντες", "maltratando"],
  ["ἐπηρεαζόντων", "maltratando"],
  ["ἐπηρώτησέν", "perguntou"],

  // --- ἐπιάσ- palavras ---
  ["ἐπιάσατε", "prendei"],

  // --- ἐπιβ- palavras ---
  ["ἐπιβάλλον", "pertencendo"],
  ["ἐπιβάλλουσιν", "lançam-sobre"],
  ["ἐπιβάλω", "lançarei-sobre"],
  ["ἐπιβαίνειν", "embarcar"],
  ["ἐπιβαλεῖν", "lançar-sobre"],
  ["ἐπιβαλοῦσιν", "lançarão-sobre"],
  ["ἐπιβαρῶ", "serei-pesado-sobre"],
  ["ἐπιβεβηκὼς", "tendo-montado"],
  ["ἐπιβιβάσαντες", "tendo-feito-montar"],
  ["ἐπιβιβάσας", "tendo-feito-montar"],
  ["ἐπιβλέψαι", "olhar-sobre"],
  ["ἐπιβλέψητε", "olheis-sobre"],
  ["ἐπιβουλαῖς", "conspirações"],
  ["ἐπιβουλὴ", "conspiração"],
  ["ἐπιβὰς", "tendo-embarcado"],

  // --- ἐπιγ- palavras ---
  ["ἐπιγαμβρεύσει", "casará-por-levirato"],
  ["ἐπιγεγραμμένη", "tendo-sido-inscrita"],
  ["ἐπιγενομένου", "tendo-sobrevindo"],
  ["ἐπιγινωσκέτω", "reconheça"],
  ["ἐπιγινωσκόμενοι", "sendo-reconhecidos"],
  ["ἐπιγινώσκεις", "reconheces"],
  ["ἐπιγνοῦσιν", "tendo-reconhecido"],
  ["ἐπιγνώσομαι", "reconhecerei"],
  ["ἐπιγνῷ", "reconheça"],
  ["ἐπιγνῷς", "reconheças"],
  ["ἐπιγραφήν", "inscrição"],

  // --- ἐπιδ- palavras ---
  ["ἐπιδείξατέ", "mostrai"],
  ["ἐπιδείξατε", "mostrai"],
  ["ἐπιδεικνύμεναι", "sendo-mostradas"],
  ["ἐπιδεικνὺς", "mostrando"],
  ["ἐπιδιατάσσεται", "acrescenta-disposições"],
  ["ἐπιδιορθώσῃ", "corrigas"],
  ["ἐπιδυέτω", "ponha-se"],
  ["ἐπιδόντες", "tendo-entregue"],

  // --- ἐπιε- palavras ---
  ["ἐπιεικέσιν", "moderados"],
  ["ἐπιεικής", "moderado"],
  ["ἐπιεικείας", "moderação"],
  ["ἐπιεικείᾳ", "moderação"],
  ["ἐπιεικεῖς", "moderados"],
  ["ἐπιεικὲς", "moderado"],
  ["ἐπιεικῆ", "moderado"],

  // --- ἐπιζ- palavras ---
  ["ἐπιζητήσας", "tendo-buscado"],
  ["ἐπιζητεῖτε", "buscais"],
  ["ἐπιζητοῦμεν", "buscamos"],

  // --- ἐπιθ- palavras ---
  ["ἐπιθέντα", "tendo-imposto"],
  ["ἐπιθέσεώς", "imposição"],
  ["ἐπιθήσεταί", "imporá"],
  ["ἐπιθήσουσιν", "imporão"],
  ["ἐπιθανατίους", "condenados-à-morte"],
  ["ἐπιθεῖναι", "impor"],
  ["ἐπιθυμήσετε", "desejareis"],
  ["ἐπιθυμίαι", "desejos"],
  ["ἐπιθυμεῖτε", "desejais"],
  ["ἐπιθυμητὰς", "desejadores"],
  ["ἐπιθυμιῶν", "desejos"],
  ["ἐπιθυμοῦμεν", "desejamos"],
  ["ἐπιθυμοῦσιν", "desejam"],
  ["ἐπιθυμῆσαι", "desejar"],
  ["ἐπιθυμῶν", "desejando"],
  ["ἐπιθῇς", "imponhas"],
  ["ἐπιθῶ", "imponha"],

  // --- ἐπικ- palavras ---
  ["ἐπικάλυμμα", "cobertura"],
  ["ἐπικέκλησαι", "tens-sido-chamado"],
  ["ἐπικέκληται", "tem-sido-chamado"],
  ["ἐπικαλέσασθαι", "invocar"],
  ["ἐπικαλέσωνται", "invoquem"],
  ["ἐπικαλεσάμενος", "tendo-invocado"],
  ["ἐπικαλεῖσθαι", "invocar"],
  ["ἐπικαλεῖσθε", "invocais"],
  ["ἐπικαλουμένοις", "invocando"],
  ["ἐπικαλουμένου", "invocando"],
  ["ἐπικαλουμένων", "invocando"],
  ["ἐπικαλούμενος", "invocando"],
  ["ἐπικείμενα", "impostas"],
  ["ἐπικείμενον", "imposto-sobre"],
  ["ἐπικειμένου", "imposto-sobre"],
  ["ἐπικεῖσθαι", "estar-imposto-sobre"],
  ["ἐπικληθέντα", "tendo-sido-chamado"],
  ["ἐπικληθεὶς", "tendo-sido-chamado"],
  ["ἐπικληθὲν", "tendo-sido-chamado"],
  ["ἐπικουρίας", "socorro"],

  // --- ἐπιλ- palavras ---
  ["ἐπιλαβέσθαι", "tomar-de"],
  ["ἐπιλαβομένου", "tendo-tomado-de"],
  ["ἐπιλαβοῦ", "toma-de"],
  ["ἐπιλαβόμενοί", "tendo-tomado-de"],
  ["ἐπιλαθέσθαι", "esquecer-se"],
  ["ἐπιλανθανόμενος", "esquecendo-se"],
  ["ἐπιλείψει", "faltará"],
  ["ἐπιλεγομένη", "sendo-chamada"],
  ["ἐπιλελησμένον", "tendo-sido-esquecido"],
  ["ἐπιλεξάμενος", "tendo-escolhido"],
  ["ἐπιλησμονῆς", "esquecimento"],
  ["ἐπιλυθήσεται", "será-desatada"],
  ["ἐπιλύσεως", "interpretação"],

  // --- ἐπιμ- palavras ---
  ["ἐπιμένειν", "permanecer"],
  ["ἐπιμένετε", "permaneceis"],
  ["ἐπιμένωμεν", "permaneçamos"],
  ["ἐπιμένωσιν", "permaneçam"],
  ["ἐπιμένῃς", "permaneças"],
  ["ἐπιμαρτυρῶν", "testificando"],
  ["ἐπιμελήσεται", "cuidará"],
  ["ἐπιμελείας", "cuidado"],
  ["ἐπιμελῶς", "cuidadosamente"],
  ["ἐπιμενῶ", "permanecerei"],

  // --- ἐπιο- palavras ---
  ["ἐπιορκήσεις", "jurarás-falsamente"],

  // --- ἐπιπ- palavras ---
  ["ἐπιπίπτειν", "cair-sobre"],
  ["ἐπιπεπτωκός", "tendo-caído-sobre"],
  ["ἐπιπεσόντες", "tendo-caído-sobre"],
  ["ἐπιπλήξῃς", "repreendas"],
  ["ἐπιποθήσατε", "desejai-ardentemente"],
  ["ἐπιποθίαν", "desejo-ardente"],
  ["ἐπιποθεῖ", "deseja-ardentemente"],
  ["ἐπιποθούντων", "desejando-ardentemente"],
  ["ἐπιπορευομένων", "acorrendo"],
  ["ἐπιπόθητοι", "ardentemente-desejados"],

  // --- ἐπιρ- palavras ---
  ["ἐπιράπτει", "costura-sobre"],

  // --- ἐπισ- palavras ---
  ["ἐπισιτισμόν", "provisão"],
  ["ἐπισκέπτεσθαι", "visitar"],
  ["ἐπισκέπτῃ", "visitas"],
  ["ἐπισκέψασθαι", "visitar"],
  ["ἐπισκέψασθε", "visitai"],
  ["ἐπισκέψεται", "visitará"],
  ["ἐπισκευασάμενοι", "tendo-nos-preparado"],
  ["ἐπισκεψώμεθα", "visitemos"],
  ["ἐπισκηνώσῃ", "habite-sobre"],
  ["ἐπισκιάζουσα", "fazendo-sombra-sobre"],
  ["ἐπισκιάσει", "fará-sombra-sobre"],
  ["ἐπισκιάσῃ", "faça-sombra-sobre"],
  ["ἐπισκοποῦντες", "supervisionando"],
  ["ἐπισκοπὴν", "supervisão"],
  ["ἐπισκόποις", "supervisores"],
  ["ἐπισκόπους", "supervisores"],
  ["ἐπισπάσθω", "não-se-desfaça-a-circuncisão"],

  // --- ἐπιστ- palavras ---
  ["ἐπιστάτα", "mestre"],
  ["ἐπιστήμων", "entendido"],
  ["ἐπιστεύθησαν", "foram-confiados"],
  ["ἐπιστεῖλαι", "escrever"],
  ["ἐπιστηρίζοντες", "fortalecendo"],
  ["ἐπιστηρίζων", "fortalecendo"],
  ["ἐπιστολή", "carta"],
  ["ἐπιστολαὶ", "cartas"],
  ["ἐπιστολαῖς", "cartas"],
  ["ἐπιστομίζειν", "silenciar"],
  ["ἐπιστρέφετε", "convertei-vos"],
  ["ἐπιστρέφουσιν", "convertem-se"],
  ["ἐπιστρέψας", "tendo-voltado"],
  ["ἐπιστρέψατε", "convertei-vos"],
  ["ἐπιστρέψει", "converterá"],
  ["ἐπιστρέψω", "voltarei"],
  ["ἐπιστραφήτω", "volte-se"],
  ["ἐπιστροφὴν", "conversão"],
  ["ἐπιστώθης", "foste-confirmado"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ak (freq 1, parte 37/44) ===`);
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

console.log(`\n=== Resultado Lote 11ak ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

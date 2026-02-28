#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11f
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 6/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11f-${Date.now()}.sql`);

const translations = [
  // === Índices 1240-1487 de freq1-words.json (248 palavras) ===

  // --- δαν- (emprestar, gastar) ---
  ["δανίζουσιν", "emprestam"],
  ["δανίσασθαι", "tomar-emprestado"],
  ["δανίσητε", "emprestardes"],
  ["δανιστῇ", "credor"],
  ["δαπάνην", "despesa"],
  ["δαπάνησον", "gasta"],
  ["δαπανήσαντος", "tendo-gastado"],
  ["δαπανήσασα", "tendo-gastado"],
  ["δαπανήσητε", "gasteis"],
  ["δαπανήσω", "gastarei"],

  // --- δαρ-, δεή- (açoitar, suplicar) ---
  ["δαρήσεσθε", "sereis-açoitados"],
  ["δεήθητι", "suplica"],
  ["δεήσεσίν", "súplicas"],

  // --- δείκ-, δείπ- (mostrar, ceia) ---
  ["δείκνυμι", "mostro"],
  ["δείπνῳ", "ceia"],

  // --- δεδ- (formas perfeitas diversas) ---
  ["δεδάμασται", "tem-sido-domada"],
  ["δεδέσθαι", "ter-sido-amarrado"],
  ["δεδεκάτωκεν", "tem-dizimado"],
  ["δεδεκάτωται", "tem-sido-dizimado"],
  ["δεδεκώς", "tendo-recebido"],
  ["δεδεμένα", "tendo-sido-amarradas"],
  ["δεδεμένην", "tendo-sido-amarrada"],
  ["δεδικαίωμαι", "tenho-sido-justificado"],
  ["δεδικαίωται", "tem-sido-justificado"],
  ["δεδικαιωμένος", "tendo-sido-justificado"],
  ["δεδιωγμένοι", "tendo-sido-perseguidos"],
  ["δεδοκιμάσμεθα", "temos-sido-aprovados"],
  ["δεδομένην", "tendo-sido-dada"],
  ["δεδοξασμένον", "tendo-sido-glorificado"],
  ["δεδοξασμένῃ", "tendo-sido-glorificada"],
  ["δεδουλεύκαμεν", "temos-servido"],
  ["δεδουλωμένας", "tendo-sido-escravizadas"],
  ["δεδουλωμένοι", "tendo-sido-escravizados"],
  ["δεδωρημένης", "tendo-sido-concedida"],
  ["δεδόξασμαι", "tenho-sido-glorificado"],
  ["δεδόξασται", "tem-sido-glorificado"],
  ["δεδώκεισαν", "tinham-dado"],
  ["δεδώρηται", "tem-sido-concedido"],

  // --- δεη-, δειγ-, δεικ- (suplicar, expor, mostrar) ---
  ["δεηθέντων", "tendo-suplicado"],
  ["δειγματίσαι", "expor-publicamente"],
  ["δεικνύειν", "mostrar"],
  ["δεικνύεις", "mostras"],

  // --- δειλ- (covardia, timidez) ---
  ["δειλίας", "covardia"],
  ["δειλιάτω", "acovarde-se"],

  // --- δειξ-, δειπν- (mostrar, jantar) ---
  ["δειξάτω", "mostre"],
  ["δειπνήσω", "cearei"],

  // --- δεισιδ- (superstição, religioso) ---
  ["δεισιδαιμονίας", "superstição"],
  ["δεισιδαιμονεστέρους", "mais-supersticiosos"],

  // --- δειχ-, δεκ- (mostrado, décimo, aceitável) ---
  ["δειχθέντα", "tendo-sido-mostradas"],
  ["δεκάτη", "décima"],
  ["δεκτήν", "aceitável"],
  ["δεκτόν", "aceitável"],
  ["δεκτός", "aceitável"],
  ["δεκτὸς", "aceitável"],
  ["δεκτῷ", "aceitável"],

  // --- δελ- (enganar, seduzir) ---
  ["δελεάζοντες", "seduzindo"],
  ["δελεάζουσιν", "seduzem"],
  ["δελεαζόμενος", "sendo-seduzido"],

  // --- δεξ- (receber, direita) ---
  ["δεξάμενοι", "tendo-recebido"],
  ["δεξαμένη", "tendo-recebido"],
  ["δεξιολάβους", "lanceiros"],
  ["δεξιοῖς", "direitos"],
  ["δεξιὰς", "direitas"],
  ["δεξιὸς", "direito"],
  ["δεξιᾷ", "direita"],

  // --- δεσμ- (prisioneiro, prisão, cadeias) ---
  ["δεσμίοις", "prisioneiros"],
  ["δεσμίους", "prisioneiros"],
  ["δεσμίων", "prisioneiros"],
  ["δεσμεύουσιν", "amarram"],
  ["δεσμεύων", "amarrando"],
  ["δεσμοφύλακι", "carcereiro"],
  ["δεσμούς", "cadeias"],
  ["δεσμοῦ", "cadeia"],
  ["δεσμωτηρίου", "prisão"],
  ["δεσμωτηρίῳ", "prisão"],
  ["δεσμὸς", "cadeia"],

  // --- δεσπ- (senhor, mestre) ---
  ["δεσπότην", "Soberano"],
  ["δεσπότῃ", "soberano"],

  // --- δευτ- (segundo) ---
  ["δευτέρα", "segunda"],
  ["δευτέρας", "segunda"],
  ["δευτέρᾳ", "segunda"],
  ["δευτεραῖοι", "no-segundo-dia"],

  // --- δεό- (suplicar, necessitar) ---
  ["δεόμεθα", "suplicamos"],

  // --- δεῖ- (exemplo, fulano, mostrar) ---
  ["δεῖγμα", "exemplo"],
  ["δεῖνα", "fulano"],
  ["δεῖξόν", "mostra"],

  // --- δηλ- (manifestar, revelar) ---
  ["δηλοῖ", "manifesta"],
  ["δηλοῦντος", "manifestando"],
  ["δηλώσας", "tendo-manifestado"],
  ["δηλώσει", "manifestará"],

  // --- δημ-, δην- (artífice, denário) ---
  ["δημιουργὸς", "artífice"],
  ["δηναρίου", "denário"],

  // --- διάβολ- (diabo, caluniador) ---
  ["διάβολοι", "caluniadores"],
  ["διάβολον", "diabo"],
  ["διάβολός", "diabo"],

  // --- διά- (diversos prefixos com διά-) ---
  ["διάγγελλε", "anuncia"],
  ["διάγνωσιν", "decisão"],
  ["διάγοντες", "vivendo"],
  ["διάγωμεν", "vivamos"],
  ["διάδος", "distribui"],
  ["διάδοχον", "sucessor"],
  ["διάκρισιν", "discernimento"],
  ["διάστημα", "intervalo"],
  ["διάταγμα", "decreto"],
  ["διάφορα", "diferentes"],

  // --- διέ- (formas aoristo com διά-) ---
  ["διέβησαν", "atravessaram"],
  ["διέβλεψεν", "viu-claramente"],
  ["διέδωκεν", "distribuiu"],
  ["διέζωσεν", "cingiu"],
  ["διέθετο", "estabeleceu"],
  ["διέθετό", "estabeleceu"],
  ["διέκρινεν", "distinguiu"],
  ["διέλειπεν", "cessou"],
  ["διέλθω", "passe"],
  ["διέμενεν", "permanecia"],
  ["διέρρηξεν", "rasgou"],
  ["διέρχομαι", "passo-através"],
  ["διέρχωμαι", "passe-através"],
  ["διέστη", "separou-se"],
  ["διέταξα", "ordenei"],
  ["διέτριψαν", "permaneceram"],

  // --- διή- (despertaram, narração, abria) ---
  ["διήγειραν", "despertaram"],
  ["διήγησιν", "narração"],
  ["διήνοιγεν", "abria"],

  // --- διαβ- (afirmar, diabo, atravessar) ---
  ["διαβεβαιοῦνται", "afirmam-com-certeza"],
  ["διαβεβαιοῦσθαι", "afirmar-com-certeza"],
  ["διαβόλου", "diabo"],
  ["διαβῆναι", "atravessar"],

  // --- διαγ- (anunciar, transcorrer, conhecer, despertar) ---
  ["διαγγέλλων", "anunciando"],
  ["διαγγελῇ", "seja-anunciado"],
  ["διαγενομένων", "tendo-transcorrido"],
  ["διαγινώσκειν", "examinar"],
  ["διαγνώσομαι", "examinarei"],
  ["διαγρηγορήσαντες", "tendo-despertado-completamente"],

  // --- διαδ- (distribuir, suceder) ---
  ["διαδίδωσιν", "distribui"],
  ["διαδεξάμενοι", "tendo-sucedido"],

  // --- διαθ- (dispor, aliança) ---
  ["διαθέμενος", "tendo-disposto"],
  ["διαθεμένου", "tendo-disposto"],
  ["διαθηκῶν", "alianças"],

  // --- διαι-, διακ- (dividir, limpar, refutar, servir, distinguir) ---
  ["διαιροῦν", "dividindo"],
  ["διακαθαριεῖ", "limpará-completamente"],
  ["διακαθᾶραι", "limpar-completamente"],
  ["διακατηλέγχετο", "refutava-vigorosamente"],
  ["διακονήσει", "servirá"],
  ["διακονίαν", "serviço"],
  ["διακονείτωσαν", "sirvam"],
  ["διακονεῖ", "serve"],
  ["διακονηθεῖσα", "tendo-sido-servida"],
  ["διακονιῶν", "serviços"],
  ["διακονούντων", "servindo"],
  ["διακονοῦσαι", "servindo"],

  // --- διακρ- (julgar, distinguir, discernir) ---
  ["διακρίναντα", "tendo-distinguido"],
  ["διακρίνει", "distingue"],
  ["διακρίνειν", "distinguir"],
  ["διακρίνων", "distinguindo"],
  ["διακριθῆτε", "sejais-divididos"],
  ["διακριθῇ", "seja-dividido"],
  ["διακρινέτωσαν", "julguem"],
  ["διακρινομένους", "sendo-divididos"],
  ["διακρῖναι", "distinguir"],

  // --- διακ- (servir, duzentos) ---
  ["διακόνει", "serve"],
  ["διακόνους", "servos"],
  ["διακόσιαι", "duzentas"],

  // --- διαλ- (conversar, reconciliar, raciocinar) ---
  ["διαλέγεται", "conversa"],
  ["διαλεγόμενον", "conversando"],
  ["διαλλάγηθι", "reconcilia-te"],
  ["διαλογίζεσθαι", "raciocinar"],
  ["διαλογίζονται", "raciocinam"],
  ["διαλογιζομένων", "raciocinando"],
  ["διαλογιζόμενοι", "raciocinando"],
  ["διαλογισμοί", "raciocínios"],
  ["διαλογισμοῖς", "raciocínios"],
  ["διαλογισμοῦ", "raciocínio"],
  ["διαλογισμὸν", "raciocínio"],
  ["διαλογισμὸς", "raciocínio"],

  // --- διαμ- (permanecer, testificar, dividir) ---
  ["διαμένει", "permanece"],
  ["διαμένεις", "permaneces"],
  ["διαμαρτυράμενοι", "tendo-testificado-solenemente"],
  ["διαμαρτύρεταί", "testifica-solenemente"],
  ["διαμαρτύρηται", "testifique-solenemente"],
  ["διαμαρτύρομαι", "testifico-solenemente"],
  ["διαμείνῃ", "permaneça"],
  ["διαμεμενηκότες", "tendo-permanecido"],
  ["διαμεμερισμένοι", "tendo-sido-divididos"],
  ["διαμερίζονται", "dividem"],
  ["διαμερίσατε", "dividi"],
  ["διαμεριζόμεναι", "sendo-divididas"],
  ["διαμεριζόμενοι", "sendo-divididos"],
  ["διαμερισθήσονται", "serão-divididos"],
  ["διαμερισθεῖσα", "tendo-sido-dividida"],
  ["διαμερισμόν", "divisão"],

  // --- διαν- (espalhar, acenar, pensamentos, abrir, pernoitar, completar) ---
  ["διανεμηθῇ", "seja-espalhado"],
  ["διανεύων", "acenando"],
  ["διανοήματα", "pensamentos"],
  ["διανοίγων", "abrindo"],
  ["διανοιῶν", "mentes"],
  ["διανοῖγον", "abrindo"],
  ["διανυκτερεύων", "passando-a-noite"],
  ["διανύσαντες", "tendo-completado"],

  // --- διαπ- (atritos, atravessar, navegar, indignar, perturbar) ---
  ["διαπαρατριβαὶ", "atritos-constantes"],
  ["διαπεράσαντος", "tendo-atravessado"],
  ["διαπερῶν", "atravessando"],
  ["διαπερῶσιν", "atravessem"],
  ["διαπλεύσαντες", "tendo-navegado-através"],
  ["διαπονηθεὶς", "tendo-se-indignado"],
  ["διαπονούμενοι", "estando-indignados"],
  ["διαπορευομένου", "passando-através"],
  ["διαπορευόμενος", "passando-através"],
  ["διαπορεύεσθαι", "passar-através"],

  // --- διαρ- (rasgar, saquear) ---
  ["διαρήσσων", "rasgando"],
  ["διαρπάσαι", "saquear"],
  ["διαρρήξαντες", "tendo-rasgado"],
  ["διαρρήξας", "tendo-rasgado"],

  // --- διασ- (extorquir, dispersar, rasgar, separar, distinguir, perverter, salvar) ---
  ["διασείσητε", "extorquais"],
  ["διασκορπίζων", "dispersando"],
  ["διασπασθῇ", "seja-despedaçado"],
  ["διαστάσης", "tendo-se-separado"],
  ["διαστήσαντες", "tendo-separado"],
  ["διαστελλόμενον", "sendo-ordenado"],
  ["διαστολή", "distinção"],
  ["διαστολὴ", "distinção"],
  ["διαστολὴν", "distinção"],
  ["διαστρέφοντα", "pervertendo"],
  ["διαστρέφων", "pervertendo"],
  ["διαστρέψαι", "perverter"],
  ["διασωθέντα", "tendo-sido-salvo"],
  ["διασωθέντες", "tendo-sido-salvos"],
  ["διασωθῆναι", "ser-salvo"],
  ["διασώσωσι", "salvem"],
  ["διασώσῃ", "salve"],
  ["διασῶσαι", "salvar"],

  // --- διατ- (ordenar, dispor, perseverar, guardar) ---
  ["διατάξομαι", "ordenarei"],
  ["διατάσσομαι", "ordeno"],
  ["διατάσσων", "ordenando"],
  ["διατίθεμαι", "disponho"],
  ["διαταγεὶς", "tendo-sido-ordenado"],
  ["διαταγὰς", "ordenanças"],
  ["διαταγῇ", "ordenança"],
  ["διαταξάμενος", "tendo-ordenado"],
  ["διατελεῖτε", "persistis"],
  ["διατεταγμένος", "tendo-sido-ordenado"],
  ["διατεταχέναι", "ter-ordenado"],
  ["διατηροῦντες", "guardando"],
  ["διατρίβοντες", "permanecendo"],
  ["διατροφὰς", "alimentos"],

  // --- διαυ-, διαφ- (amanhecer, carregar, espalhar) ---
  ["διαυγάσῃ", "amanheça"],
  ["διαφερομένων", "sendo-carregados"],
  ["διαφημίζειν", "espalhar"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11f (freq 1, parte 6/44) ===`);
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

console.log(`\n=== Resultado Lote 11f ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

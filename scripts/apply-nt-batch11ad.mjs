#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ad
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 30/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ad-${Date.now()}.sql`);

const translations = [
  // === Lote 11ad: freq 1, parte 30/44 (248 palavras) ===
  // === Prefixo ἀπ- (verbos e substantivos compostos com ἀπό) ===

  // --- ἀπαρ- palavras ---
  ["ἀπαρασκευάστους", "despreparados"],
  ["ἀπαρνηθήσεται", "negará"],
  ["ἀπαρτισμόν", "completamento"],
  ["ἀπαρχήν", "primícia"],
  ["ἀπαρχὴν", "primícia"],
  ["ἀπατάτω", "engane"],
  ["ἀπατῶν", "enganando"],
  ["ἀπαχθῆναι", "ser-levado"],
  ["ἀπαύγασμα", "resplendor"],

  // --- ἀπειρ- / ἀπεδ- palavras ---
  ["ἀπείραστός", "não-tentável"],
  ["ἀπεδέξαντο", "receberam"],
  ["ἀπεδέξατο", "recebeu"],
  ["ἀπεδέχετο", "recebia"],
  ["ἀπεδίδουν", "devolviam"],
  ["ἀπεδοκιμάσθη", "foi-rejeitado"],

  // --- ἀπειθ- palavras (desobediência) ---
  ["ἀπειθήσαντες", "tendo-desobedecido"],
  ["ἀπειθήσασίν", "aos-que-desobedeceram"],
  ["ἀπειθείᾳ", "desobediência"],
  ["ἀπειθοῦντα", "desobedecendo"],
  ["ἀπειθοῦντες", "desobedecendo"],
  ["ἀπειθοῦσι", "desobedecem"],
  ["ἀπειθοῦσιν", "desobedecem"],
  ["ἀπειθὴς", "desobediente"],
  ["ἀπειθῶν", "desobedecendo"],

  // --- ἀπειλ- palavras (ameaça) ---
  ["ἀπειλήν", "ameaça"],
  ["ἀπειλησώμεθα", "ameacemos"],
  ["ἀπειλὰς", "ameaças"],
  ["ἀπειλῆς", "ameaça"],

  // --- ἀπειπ- / ἀπεκ- palavras ---
  ["ἀπειπάμεθα", "renunciamos"],
  ["ἀπεκάλυψέν", "revelou"],
  ["ἀπεκάλυψεν", "revelou"],
  ["ἀπεκατέστη", "foi-restaurado"],
  ["ἀπεκδέχεται", "aguarda-ansiosamente"],
  ["ἀπεκδεχομένοις", "aos-que-aguardam-ansiosamente"],
  ["ἀπεκδεχομένους", "aos-que-aguardam-ansiosamente"],
  ["ἀπεκδεχόμενοι", "aguardando-ansiosamente"],
  ["ἀπεκδυσάμενοι", "tendo-se-despojado"],
  ["ἀπεκδυσάμενος", "tendo-se-despojado"],
  ["ἀπεκδύσει", "despojamento"],
  ["ἀπεκρίθης", "respondeste"],
  ["ἀπεκτείνατε", "matastes"],
  ["ἀπεκύησεν", "gerou"],
  ["ἀπεκύλισεν", "rolou"],

  // --- ἀπελ- palavras ---
  ["ἀπελήλυθεν", "tem-partido"],
  ["ἀπελεγμὸν", "descrédito"],
  ["ἀπελευσόμεθα", "iremos"],
  ["ἀπελεύθερος", "liberto"],
  ["ἀπελεύσομαι", "irei"],
  ["ἀπελεύσονται", "irão"],
  ["ἀπεληλύθεισαν", "tinham-partido"],
  ["ἀπελθοῦσα", "tendo-partido"],
  ["ἀπελθόντι", "ao-que-partiu"],
  ["ἀπελογεῖτο", "defendia-se"],
  ["ἀπελούσασθε", "fostes-lavados"],
  ["ἀπελπίζοντες", "nada-esperando-em-retorno"],
  ["ἀπελύθησαν", "foram-soltos"],
  ["ἀπελύοντο", "eram-soltos"],

  // --- ἀπεν- / ἀπεξ- / ἀπεπ- palavras ---
  ["ἀπενίψατο", "lavou"],
  ["ἀπενεγκεῖν", "levar"],
  ["ἀπενεχθῆναι", "ser-levado"],
  ["ἀπεξεδέχετο", "aguardava-ansiosamente"],
  ["ἀπεπλανήθησαν", "foram-desviados"],
  ["ἀπεπνίγη", "afogou-se"],

  // --- ἀπερ- palavras ---
  ["ἀπεράντοις", "intermináveis"],
  ["ἀπερίτμητοι", "incircuncisos"],
  ["ἀπερισπάστως", "sem-distração"],
  ["ἀπερχομένων", "partindo"],

  // --- ἀπεσ- / ἀπεφ- / ἀπει- palavras ---
  ["ἀπεσπάσθη", "foi-arrancado"],
  ["ἀπεστάλκαμεν", "temos-enviado"],
  ["ἀπεστάλκατε", "enviastes"],
  ["ἀπεστέγασαν", "destelharam"],
  ["ἀπεσταλμένοι", "tendo-sido-enviados"],
  ["ἀπεσταλμένος", "tendo-sido-enviado"],
  ["ἀπεστερημένων", "dos-que-foram-privados"],
  ["ἀπεστράφησάν", "desviaram-se"],
  ["ἀπεφθέγξατο", "pronunciou"],
  ["ἀπεῖχεν", "estava-distante"],

  // --- ἀπηγ- / ἀπηλ- / ἀπησ- palavras ---
  ["ἀπηγγέλη", "foi-anunciado"],
  ["ἀπηλγηκότες", "tendo-se-tornado-insensíveis"],
  ["ἀπηλλάχθαι", "ter-sido-libertado"],
  ["ἀπηλλοτριωμένους", "tendo-sido-alienados"],
  ["ἀπησπασάμεθα", "despedimo-nos"],

  // --- ἀπιστ- palavras (incredulidade) ---
  ["ἀπιστήσας", "tendo-desacreditado"],
  ["ἀπιστία", "incredulidade"],
  ["ἀπιστίας", "incredulidade"],
  ["ἀπιστούντων", "dos-que-não-creem"],
  ["ἀπιστοῦμεν", "não-cremos"],
  ["ἀπιστοῦσιν", "não-creem"],

  // --- ἀποβ- palavras ---
  ["ἀποβάλητε", "lanceis-fora"],
  ["ἀποβάντες", "tendo-desembarcado"],
  ["ἀποβαλὼν", "tendo-lançado-fora"],
  ["ἀπογεγραμμένων", "dos-que-foram-inscritos"],
  ["ἀπογενόμενοι", "tendo-morrido"],
  ["ἀπογράψασθαι", "ser-registrado"],
  ["ἀπογραφὴ", "registro"],
  ["ἀπογραφῆς", "registro"],

  // --- ἀποδ- palavras ---
  ["ἀποδέξασθαι", "receber"],
  ["ἀποδίδωμι", "devolvo"],
  ["ἀποδίδωσιν", "devolve"],
  ["ἀποδείξει", "demonstração"],
  ["ἀποδεδειγμένον", "tendo-sido-demonstrado"],
  ["ἀποδεδοκιμασμένον", "tendo-sido-rejeitado"],
  ["ἀποδεικνύντα", "demonstrando"],
  ["ἀποδεκατεύω", "dou-o-dízimo"],
  ["ἀποδεκατοῖν", "dizimar"],
  ["ἀποδεξάμενοι", "tendo-recebido"],
  ["ἀποδεξάμενος", "tendo-recebido"],
  ["ἀποδεχόμεθα", "recebemos"],
  ["ἀποδεῖξαι", "demonstrar"],
  ["ἀποδημῶν", "viajando"],
  ["ἀποδιδόναι", "devolver"],
  ["ἀποδιδότω", "devolva"],
  ["ἀποδιορίζοντες", "causando-divisões"],
  ["ἀποδοὺς", "tendo-devolvido"],
  ["ἀποδώσεις", "devolverás"],
  ["ἀποδώσοντες", "devolvendo"],

  // --- ἀποθ- palavras ---
  ["ἀποθάνωμεν", "morramos"],
  ["ἀποθέσθαι", "despojar-se"],
  ["ἀποθήκη", "celeiro"],
  ["ἀποθανεῖται", "morrerá"],
  ["ἀποθανόντα", "tendo-morrido"],
  ["ἀποθανόντες", "tendo-morrido"],
  ["ἀποθανόντι", "ao-que-morreu"],
  ["ἀποθανόντος", "do-que-morreu"],
  ["ἀποθανών", "tendo-morrido"],
  ["ἀποθησαυρίζοντας", "entesourando"],
  ["ἀποθλίβουσιν", "comprimem"],
  ["ἀποθνήσκοντες", "morrendo"],
  ["ἀποθνήσκουσιν", "morrem"],
  ["ἀποθώμεθα", "despojemo-nos"],

  // --- ἀποκ- palavras (revelar, restaurar, responder) ---
  ["ἀποκαθιστάνει", "restaura"],
  ["ἀποκαθιστάνεις", "restauras"],
  ["ἀποκαλυφθῶσιν", "sejam-revelados"],
  ["ἀποκαλύπτεσθαι", "ser-revelado"],
  ["ἀποκαλύψεις", "revelações"],
  ["ἀποκαλύψεων", "revelações"],
  ["ἀποκαραδοκία", "ardente-expectativa"],
  ["ἀποκαραδοκίαν", "ardente-expectativa"],
  ["ἀποκατήλλαξεν", "reconciliou"],
  ["ἀποκαταλλάξαι", "reconciliar"],
  ["ἀποκαταλλάξῃ", "reconcilie"],
  ["ἀποκαταστάσεως", "restauração"],
  ["ἀποκαταστήσει", "restaurará"],
  ["ἀποκατασταθῶ", "seja-restaurado"],
  ["ἀποκεκρυμμένην", "tendo-sido-escondida"],
  ["ἀποκεκρυμμένον", "tendo-sido-escondido"],
  ["ἀποκεκρυμμένου", "do-que-tem-sido-escondido"],
  ["ἀποκεκυλισμένον", "tendo-sido-rolado"],
  ["ἀποκλείσῃ", "feche"],
  ["ἀποκρίνεσθαι", "responder"],
  ["ἀποκρίσει", "resposta"],
  ["ἀποκρίσεσιν", "respostas"],
  ["ἀποκριθήσεται", "será-respondido"],
  ["ἀποκριθεῖσα", "tendo-respondido"],
  ["ἀποκριθὲν", "tendo-respondido"],
  ["ἀποκριθῆναι", "responder"],
  ["ἀποκριθῆτε", "respondais"],
  ["ἀποκριθῇ", "responda"],
  ["ἀποκριθῶσιν", "respondam"],

  // --- ἀποκτ- palavras (matar) ---
  ["ἀποκτέννοντες", "matando"],
  ["ἀποκτανθεὶς", "tendo-sido-morto"],
  ["ἀποκτείνει", "mata"],
  ["ἀποκτεινάντων", "dos-que-mataram"],
  ["ἀποκτενεῖ", "matará"],
  ["ἀποκτενεῖτε", "matareis"],
  ["ἀποκυλίσει", "rolará"],
  ["ἀποκόψονται", "cortarão-fora"],
  ["ἀποκύει", "gera"],

  // --- ἀπολ- palavras (receber, perder, destruir) ---
  ["ἀπολάβητε", "recebais"],
  ["ἀπολάβωμεν", "recebamos"],
  ["ἀπολάβωσιν", "recebam"],
  ["ἀπολέλυσαι", "tens-sido-solta"],
  ["ἀπολέσητε", "percais"],
  ["ἀπολέσω", "destrua"],
  ["ἀπολήμψεσθε", "recebereis"],
  ["ἀπολαβόμενος", "tendo-tomado-à-parte"],
  ["ἀπολαμβάνομεν", "recebemos"],
  ["ἀπολαμβάνοντες", "recebendo"],
  ["ἀπολελυμένον", "tendo-sido-solto"],
  ["ἀπολεῖται", "perecerá"],
  ["ἀπολιπόντας", "tendo-abandonado"],
  ["ἀπολλυμένην", "sendo-destruída"],
  ["ἀπολλυμένου", "do-que-está-perecendo"],
  ["ἀπολλύει", "destrói"],
  ["ἀπολλύμενοι", "perecendo"],

  // --- ἀπολογ- palavras (defesa) ---
  ["ἀπολογήσησθε", "vos-defendais"],
  ["ἀπολογία", "defesa"],
  ["ἀπολογηθῆναι", "defender-se"],
  ["ἀπολογουμένων", "defendendo-se"],
  ["ἀπολογούμεθα", "defendemo-nos"],
  ["ἀπολογοῦμαι", "defendo-me"],

  // --- ἀπολ- palavras (continuação) ---
  ["ἀπολομένου", "do-que-pereceu"],
  ["ἀπολυθέντες", "tendo-sido-soltos"],
  ["ἀπολυθήσεσθε", "sereis-soltos"],
  ["ἀπολυθῆτε", "sejais-soltos"],
  ["ἀπολωλὸς", "tendo-se-perdido"],
  ["ἀπολύει", "solta"],
  ["ἀπολύεις", "soltas"],
  ["ἀπολύετε", "soltai"],
  ["ἀπολύσασα", "tendo-soltado"],
  ["ἀπολύσῃς", "soltes"],
  ["ἀπολῦσαί", "soltar"],

  // --- ἀπομ- / ἀπον- / ἀποπ- palavras ---
  ["ἀπομασσόμεθα", "limpamos"],
  ["ἀπονέμοντες", "atribuindo"],
  ["ἀποπλανᾶν", "desviar"],
  ["ἀποπλεύσαντες", "tendo-navegado"],
  ["ἀποπλεῖν", "navegar"],

  // --- ἀπορ- palavras ---
  ["ἀπορίψαντας", "tendo-lançado"],
  ["ἀπορίᾳ", "perplexidade"],
  ["ἀπορεῖσθαι", "estar-perplexo"],
  ["ἀπορούμενος", "estando-perplexo"],
  ["ἀποροῦμαι", "estou-perplexo"],
  ["ἀπορφανισθέντες", "tendo-sido-tornados-órfãos"],

  // --- ἀποσ- palavras ---
  ["ἀποσκίασμα", "sombra-de-variação"],
  ["ἀποσπασθέντας", "tendo-sido-arrancados"],
  ["ἀποσπᾶν", "arrancar"],
  ["ἀποστάντα", "tendo-se-afastado"],
  ["ἀποστάσιον", "carta-de-divórcio"],
  ["ἀποστέλλειν", "enviar"],
  ["ἀποστέλλῃ", "envie"],
  ["ἀποστήσονταί", "afastar-se-ão"],
  ["ἀποσταλέντι", "ao-que-foi-enviado"],
  ["ἀποσταλῶσιν", "sejam-enviados"],
  ["ἀποστασία", "apostasia"],
  ["ἀποστασίαν", "apostasia"],
  ["ἀποστείλαντας", "os-que-enviaram"],
  ["ἀποστείλαντες", "tendo-enviado"],
  ["ἀποστείλας", "tendo-enviado"],
  ["ἀποστείλω", "envie"],
  ["ἀποστελλόμενα", "sendo-enviados"],
  ["ἀποστερήσῃς", "prives"],
  ["ἀποστερεῖσθε", "sois-privados"],
  ["ἀποστεῖλαι", "enviar"],
  ["ἀποστοματίζειν", "interrogar-insidiosamente"],
  ["ἀποστρέφειν", "desviar"],
  ["ἀποστρέφοντα", "desviando"],
  ["ἀποστρέψει", "desviará"],
  ["ἀποστρέψουσιν", "desviarão"],
  ["ἀποστραφῇς", "te-desvies"],
  ["ἀποστρεφομένων", "dos-que-se-desviam"],
  ["ἀποστρεφόμενοι", "desviando-se"],
  ["ἀποστυγοῦντες", "abominando"],
  ["ἀποστόλου", "apóstolo"],
  ["ἀποστὰς", "tendo-se-afastado"],
  ["ἀποστῆναι", "afastar-se"],
  ["ἀποστῇ", "afaste-se"],

  // --- ἀποσυν- palavras ---
  ["ἀποσυνάγωγοι", "expulsos-da-sinagoga"],
  ["ἀποσυνάγωγος", "expulso-da-sinagoga"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ad (freq 1, parte 30/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(`npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`, { encoding: 'utf-8', timeout: 30000 });
    const jsonStart = result.indexOf('[');
    const parsed = JSON.parse(result.substring(jsonStart));
    const changes = parsed[0]?.meta?.changes || 0;
    totalUpdated += changes;
    process.stdout.write(changes > 0 ? `✓ ${word} → ${translation} (${changes})\n` : `· ${word} → ${translation} (0)\n`);
    success++;
  } catch (err) { process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`); errors++; }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Resultado Lote 11ad ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11l
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 12/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11l-${Date.now()}.sql`);
const translations = [
  // === Palavras gregas freq 1 no NT - Lote 11l (248 palavras) ===

  // --- καυχ- (gloriar-se, glória) ---
  ["καυχᾶσθε", "gloriais-vos"],
  ["καυχῶμαι", "glorio-me"],
  ["καύσωνα", "calor-ardente"],
  ["καύσωνι", "calor-ardente"],
  ["καύχημά", "glória"],
  ["καῦσιν", "queima"],

  // --- κειμ- (jazer, estar-posto) ---
  ["κείμεθα", "jazemos"],
  ["κείμεναι", "jazendo"],
  ["κείμενος", "jazendo"],
  ["κείρασθαι", "rapar"],
  ["κείροντος", "tosquiando"],
  ["κειμένη", "jazendo"],
  ["κειμένην", "jazendo"],
  ["κειράμενος", "tendo-rapado"],
  ["κειράσθω", "rape"],
  ["κειρίαις", "faixas"],

  // --- κεκ- (formas do perfeito) ---
  ["κεκάθικεν", "tem-sentado"],
  ["κεκένωται", "tem-sido-esvaziado"],
  ["κεκαθαρισμένους", "tendo-sido-purificados"],
  ["κεκαυμένῳ", "tendo-sido-queimado"],
  ["κεκαυστηριασμένων", "tendo-sido-cauterizados"],
  ["κεκαύχημαι", "tenho-me-gloriado"],
  ["κεκλεισμένον", "tendo-sido-fechado"],
  ["κεκληκότι", "tendo-chamado"],
  ["κεκληκώς", "tendo-chamado"],
  ["κεκλημένος", "tendo-sido-chamado"],
  ["κεκλημένων", "tendo-sido-chamados"],
  ["κεκληρονόμηκεν", "tem-herdado"],
  ["κεκοίνωκεν", "tem-tornado-comum"],
  ["κεκοινωμένους", "tendo-sido-tornados-comuns"],
  ["κεκοινώνηκεν", "tem-participado"],
  ["κεκονιαμένε", "tendo-sido-caiado"],
  ["κεκονιαμένοις", "tendo-sido-caiados"],
  ["κεκοπίακα", "tenho-trabalhado"],
  ["κεκοπιάκασιν", "têm-trabalhado"],
  ["κεκοπιάκατε", "tendes-trabalhado"],
  ["κεκοπιακὼς", "tendo-trabalhado"],
  ["κεκορεσμένοι", "tendo-sido-saciados"],
  ["κεκράτηνται", "têm-sido-retidos"],
  ["κεκρίκατέ", "tendes-julgado"],
  ["κεκρίκει", "tinha-julgado"],
  ["κεκρατηκέναι", "ter-retido"],
  ["κεκριμένα", "tendo-sido-julgadas"],
  ["κεκρυμμένα", "tendo-sido-escondidas"],
  ["κεκρυμμένον", "tendo-sido-escondido"],
  ["κεκρυμμένος", "tendo-sido-escondido"],
  ["κεκρυμμένῳ", "tendo-sido-escondido"],
  ["κεκυρωμένην", "tendo-sido-ratificada"],
  ["κεκόσμηται", "tem-sido-adornado"],

  // --- κελ- (ordenar) ---
  ["κελεύεις", "ordenas"],
  ["κελεύσαντες", "tendo-ordenado"],
  ["κελεύσαντος", "tendo-ordenado"],
  ["κελεύσματι", "ordem"],

  // --- κεν- (vazio, vão) ---
  ["κενά", "vazias"],
  ["κενέ", "vão"],
  ["κενοδοξίαν", "vanglória"],
  ["κενούς", "vazios"],
  ["κενοῖς", "vazios"],
  ["κενόδοξοι", "vaidosos"],
  ["κενώσει", "esvaziará"],
  ["κενὸς", "vazio"],
  ["κενῆς", "vazia"],
  ["κενῶς", "em-vão"],

  // --- κεντ- (centurião) ---
  ["κεντυρίων", "centurião"],
  ["κεντυρίωνα", "centurião"],
  ["κεντυρίωνος", "centurião"],

  // --- κερ- (telha, til, oleiro, alfarrobas, ganhar) ---
  ["κεράμων", "telhas"],
  ["κεραία", "til"],
  ["κεραίαν", "til"],
  ["κεραμεὺς", "oleiro"],
  ["κερατίων", "alfarrobas"],
  ["κερδάνω", "ganhe"],
  ["κερδήσας", "tendo-ganho"],
  ["κερδήσομεν", "ganharemos"],
  ["κερδήσῃ", "ganhe"],
  ["κερδηθήσονται", "serão-ganhos"],
  ["κερδῆσαί", "ganhar"],
  ["κερδῆσαι", "ganhar"],

  // --- κερμ- (cambistas) ---
  ["κερματιστὰς", "cambistas"],

  // --- κεφ- (rolo, soma) ---
  ["κεφαλίδι", "rolo"],
  ["κεφαλαίου", "soma"],

  // --- κεχ- (formas do perfeito com χ) ---
  ["κεχάρισταί", "tem-sido-concedido"],
  ["κεχάρισται", "tem-sido-concedido"],
  ["κεχαριτωμένη", "tendo-sido-agraciada"],
  ["κεχρημάτισται", "tem-sido-revelado"],
  ["κεχρηματισμένον", "tendo-sido-revelado"],
  ["κεχωρισμένος", "tendo-sido-separado"],

  // --- κεῖμαι (jazo) ---
  ["κεῖμαι", "jazo"],

  // --- κημ- (amordaçar) ---
  ["κημώσεις", "amordaçarás"],

  // --- κηπ- (jardineiro) ---
  ["κηπουρός", "jardineiro"],

  // --- κηρ- (proclamar, pregação) ---
  ["κηρυχθέντος", "tendo-sido-proclamado"],
  ["κηρυχθείς", "tendo-sido-proclamado"],
  ["κηρύγματι", "proclamação"],
  ["κηρύγματος", "proclamação"],
  ["κηρύξαι", "proclamar"],
  ["κηρύξας", "tendo-proclamado"],
  ["κηρύξω", "proclamarei"],
  ["κηρύξωσιν", "proclamem"],
  ["κηρύσσεται", "é-proclamado"],
  ["κηρύσσετε", "proclamais"],
  ["κηρύσσοντας", "proclamando"],
  ["κηρύσσοντος", "proclamando"],
  ["κηρύσσουσιν", "proclamam"],

  // --- κιβ- (arca) ---
  ["κιβωτοῦ", "arca"],

  // --- κιθ- (cítara) ---
  ["κιθάρα", "cítara"],
  ["κιθαριζόμενον", "sendo-tocado-cítara"],

  // --- κινδ- (correr-perigo) ---
  ["κινδυνεύει", "corre-perigo"],

  // --- κιν- (mover) ---
  ["κινούμεθα", "movemo-nos"],
  ["κινοῦντα", "movendo"],
  ["κινῆσαι", "mover"],

  // --- κλάσ- (partir) ---
  ["κλάσαι", "partir"],

  // --- κλέ- (glória, furtar) ---
  ["κλέος", "glória"],
  ["κλέπτειν", "furtar"],
  ["κλέπτεις", "furtas"],
  ["κλέπτων", "furtando"],
  ["κλέψωσιν", "furtem"],
  ["κλέψῃ", "furte"],

  // --- κλήμ- (ramos) ---
  ["κλήματα", "ramos"],

  // --- κλήρ- (herança, sortes) ---
  ["κλήρου", "herança"],
  ["κλήρων", "sortes"],

  // --- κλίμ- (regiões) ---
  ["κλίμασι", "regiões"],
  ["κλίμασιν", "regiões"],
  ["κλίματα", "regiões"],

  // --- κλίν- (inclinar) ---
  ["κλίνας", "tendo-inclinado"],
  ["κλίνειν", "inclinar"],

  // --- κλαί- (chorar) ---
  ["κλαίειν", "chorar"],
  ["κλαίουσαι", "chorando"],
  ["κλαίουσαν", "chorando"],
  ["κλαίουσιν", "choram"],
  ["κλαίων", "chorando"],
  ["κλαιόντων", "chorando"],

  // --- κλαύ- (chorar) ---
  ["κλαύσῃ", "chore"],

  // --- κλεί- (fechar) ---
  ["κλείετε", "fechais"],
  ["κλείσας", "tendo-fechado"],
  ["κλείσῃ", "feche"],

  // --- κλεπτ- (furtar) ---
  ["κλεπτέτω", "furte"],

  // --- κλεῖδ- (chaves) ---
  ["κλεῖδας", "chaves"],

  // --- κληθ- (ser-chamado) ---
  ["κληθέντος", "tendo-sido-chamado"],
  ["κληθὲν", "tendo-sido-chamado"],
  ["κληθῶμεν", "sejamos-chamados"],

  // --- κληρονομ- (herdar) ---
  ["κληρονομήσατε", "herdai"],
  ["κληρονομήσητε", "herdeis"],
  ["κληρονομεῖ", "herda"],
  ["κληρονομεῖν", "herdar"],
  ["κληρονομούντων", "herdando"],
  ["κληρονόμοις", "herdeiros"],
  ["κληρονόμους", "herdeiros"],

  // --- κλιν- (leito, maca, cama) ---
  ["κλινίδιόν", "leito"],
  ["κλιναρίων", "leitos"],
  ["κλινιδίῳ", "leito"],
  ["κλινουσῶν", "inclinando"],

  // --- κλισ- (grupos) ---
  ["κλισίας", "grupos"],

  // --- κλυδ- (sendo-agitados-por-ondas) ---
  ["κλυδωνιζόμενοι", "sendo-agitados-por-ondas"],

  // --- κλῆσ- (chamado) ---
  ["κλῆσις", "chamado"],

  // --- κλῶ- (partir) ---
  ["κλῶμεν", "partimos"],
  ["κλῶντές", "partindo"],

  // --- κνηθ- (coçando) ---
  ["κνηθόμενοι", "tendo-coceira"],

  // --- κοίτ- (leito) ---
  ["κοίταις", "leitos"],
  ["κοίτη", "leito"],

  // --- κοδρ- (quadrante) ---
  ["κοδράντην", "quadrante"],
  ["κοδράντης", "quadrante"],

  // --- κοιλ- (ventre) ---
  ["κοιλίαι", "ventres"],

  // --- κοιμ- (dormir) ---
  ["κοιμήσεως", "sono"],
  ["κοιμηθέντες", "tendo-adormecido"],
  ["κοιμηθησόμεθα", "adormeceremos"],
  ["κοιμηθῇ", "adormeça"],
  ["κοιμωμένους", "adormecidos"],
  ["κοιμώμενος", "dormindo"],
  ["κοιμῶνται", "dormem"],

  // --- κοινων- (participar, comunhão) ---
  ["κοινωνεῖ", "participa"],
  ["κοινωνεῖτε", "participais"],
  ["κοινωνικούς", "generosos"],
  ["κοινωνοί", "participantes"],
  ["κοινωνοὺς", "participantes"],
  ["κοινωνοῦντες", "participando"],
  ["κοινωνόν", "participante"],
  ["κοινωνός", "participante"],
  ["κοινωνὸς", "participante"],

  // --- κοιν- (comum, tornar-comum) ---
  ["κοινόν", "comum"],
  ["κοινώνει", "torna-comum"],
  ["κοινὴν", "comum"],
  ["κοινῆς", "comum"],

  // --- κοιτ- (quarto) ---
  ["κοιτῶνος", "quarto"],

  // --- κοκκ- (escarlate) ---
  ["κοκκίνην", "escarlate"],
  ["κοκκίνου", "escarlate"],

  // --- κολ- (punir, castigar) ---
  ["κολάσωνται", "punam"],
  ["κολαζομένους", "sendo-punidos"],
  ["κολακίας", "lisonja"],
  ["κολαφίζειν", "esbofetear"],
  ["κολαφίζῃ", "esbofeteie"],
  ["κολαφιζόμεθα", "somos-esbofeteados"],
  ["κολαφιζόμενοι", "sendo-esbofeteados"],

  // --- κολλ- (unir, aderir) ---
  ["κολλήθητι", "une-te"],
  ["κολληθέντα", "tendo-sido-unido"],
  ["κολληθέντες", "tendo-sido-unidos"],
  ["κολληθήσεται", "será-unido"],
  ["κολλώμενοι", "unindo-se"],

  // --- κολοβ- (encurtar) ---
  ["κολοβωθήσονται", "serão-encurtados"],

  // --- κολυμβ- (tanque, nadar) ---
  ["κολυμβήθρα", "tanque"],
  ["κολυμβήθρᾳ", "tanque"],
  ["κολυμβᾶν", "nadar"],

  // --- κολων- (colônia) ---
  ["κολωνία", "colônia"],

  // --- κομ- (receber, trazer) ---
  ["κομίσασα", "tendo-trazido"],
  ["κομίσησθε", "recebais"],
  ["κομίσηται", "receba"],
  ["κομιεῖσθε", "recebereis"],
  ["κομιζόμενοι", "recebendo"],
  ["κομισάμενοι", "tendo-recebido"],

  // --- κομψ- (melhor) ---
  ["κομψότερον", "melhor"],

  // --- κοπ- (lamento, trabalhar) ---
  ["κοπετὸν", "lamento"],
  ["κοπιάσαντες", "tendo-trabalhado"],
  ["κοπιάτω", "trabalhe"],
  ["κοπιώσας", "tendo-trabalhado"],
  ["κοπιῶ", "trabalho"],
  ["κοπιῶντα", "trabalhando"],
  ["κοπιῶντι", "trabalhando"],
  ["κοπιῶσιν", "trabalham"],
  ["κοπρίαν", "esterco"],
  ["κοπῆς", "matança"],

  // --- κορβ- (corbã) ---
  ["κορβανᾶν", "corbã"],

  // --- κορεσ- (tendo-sido-saciados) ---
  ["κορεσθέντες", "tendo-sido-saciados"],

  // --- κοσμ- (adorno, adornar, mundano) ---
  ["κοσμίῳ", "decoroso"],
  ["κοσμεῖν", "adornar"],
  ["κοσμεῖτε", "adornais"],
  ["κοσμικόν", "mundano"],
  ["κοσμικὰς", "mundanas"],
  ["κοσμοκράτορας", "dominadores-do-mundo"],
  ["κοσμῶσιν", "adornem"],

  // --- κουστ- (guarda) ---
  ["κουστωδίαν", "guarda"],

  // --- κοφ- (cestos) ---
  ["κοφίνων", "cestos"],

  // --- κούμ (levanta) ---
  ["κούμ", "levanta"],

  // --- κράζ- (clamar) ---
  ["κράζειν", "clamar"],
  ["κράζομεν", "clamamos"],
  ["κράζοντας", "clamando"],
  ["κράξαντες", "tendo-clamado"],
  ["κράξουσιν", "clamarão"],

  // --- κράσπ- (franjas) ---
  ["κράσπεδα", "franjas"],

  // --- κράτ- (poder) ---
  ["κράτους", "poder"],

  // --- κρέμ- (pender) ---
  ["κρέμαται", "pende"],

  // --- κρίν- (julgar) ---
  ["κρίναντας", "tendo-julgado"],
  ["κρίναντος", "tendo-julgado"],
  ["κρίνεις", "julgas"],
  ["κρίνεσθαί", "ser-julgado"],
  ["κρίνοντι", "julgando"],
  ["κρίνωμεν", "julguemos"],
  ["κρίνῃ", "julgue"],

  // --- κρίσ- (juízo) ---
  ["κρίσις", "juízo"],

  // --- κραβ- (leitos) ---
  ["κραβάττοις", "leitos"],
];
let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11l (freq 1, parte 12/44) ===`);
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
console.log(`\n=== Resultado Lote 11l ===`);
console.log(`Sucesso: ${success}/${translations.length}\nErros: ${errors}\nTokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

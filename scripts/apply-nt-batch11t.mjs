#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11t
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 20/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11t-${Date.now()}.sql`);

const translations = [
  // === Palavras freq 1 do NT — Lote 11t (parte 20/44) — 248 palavras ===

  // --- πράκτωρ / πράσσω (cobrador / praticar) ---
  ["πράκτορι", "cobrador"],
  ["πράκτωρ", "cobrador"],
  ["πράξαντες", "tendo-praticado"],
  ["πράξας", "tendo-praticado"],
  ["πράξει", "prática"],
  ["πράξεσιν", "práticas"],
  ["πράξετε", "praticareis"],
  ["πράξῃς", "pratiques"],
  ["πράσσει", "pratica"],
  ["πράσσεις", "praticas"],
  ["πράσσοντι", "praticando"],
  ["πράσσων", "praticando"],
  ["πράσσῃς", "pratiques"],

  // --- πραΰς / πραότης (manso / mansidão) ---
  ["πραέως", "mansamente"],
  ["πραΰς", "manso"],
  ["πραΰτης", "mansidão"],
  ["πραγματείαις", "negócios"],
  ["πραεῖς", "mansos"],
  ["πραθὲν", "tendo-sido-vendido"],
  ["πραϋπαθίαν", "brandura-de-espírito"],
  ["πραῢς", "manso"],

  // --- πρεσβεύω / πρεσβύτερος (ser-embaixador / ancião) ---
  ["πρεσβεύομεν", "somos-embaixadores"],
  ["πρεσβεύω", "sou-embaixador"],
  ["πρεσβυτέρας", "anciãs"],
  ["πρεσβυτέρου", "ancião"],
  ["πρεσβυτερίου", "conselho-de-anciãos"],
  ["πρεσβύτας", "anciãos"],
  ["πρεσβύτιδας", "mulheres-idosas"],

  // --- πρηνής (de-cabeça-para-baixo) ---
  ["πρηνὴς", "de-cabeça-para-baixo"],

  // --- προάγω (ir-adiante / preceder) ---
  ["προάγει", "vai-adiante"],
  ["προάγουσαι", "indo-adiante"],
  ["προάγουσιν", "vão-adiante"],

  // --- προ- verbos compostos (prefixo: antes / adiante) ---
  ["προέγραψα", "escrevi-de-antemão"],
  ["προέδραμεν", "correu-adiante"],
  ["προέδωκεν", "deu-de-antemão"],
  ["προέκοπτεν", "progredia"],
  ["προέκοπτον", "progredia"],
  ["προέκοψεν", "progrediu"],
  ["προέλαβεν", "antecipou"],
  ["προέλθωσιν", "avancem"],
  ["προέπεμπον", "acompanhavam"],
  ["προέτειναν", "estenderam"],
  ["προέφθασεν", "precedeu"],
  ["προήγαγον", "conduziram-adiante"],
  ["προήρχετο", "ia-adiante"],
  ["προαγαγὼν", "tendo-conduzido-adiante"],
  ["προαγούσας", "indo-adiante"],
  ["προαγούσης", "indo-adiante"],
  ["προαύλιον", "pátio-exterior"],

  // --- προβάλλω / πρόβατον (lançar-adiante / ovelha) ---
  ["προβάλωσιν", "brotem"],
  ["προβάτου", "ovelha"],
  ["προβαλόντων", "tendo-brotado"],
  ["προβατικῇ", "das-ovelhas"],
  ["προβεβηκότες", "tendo-avançado-em-idade"],
  ["προβιβασθεῖσα", "tendo-sido-instigada"],
  ["προβλεψαμένου", "tendo-provido-de-antemão"],

  // --- προγ- (antes / de-antemão) ---
  ["προγεγονότων", "tendo-acontecido-antes"],
  ["προγεγραμμένοι", "tendo-sido-escritos-de-antemão"],
  ["προγινώσκοντές", "conhecendo-de-antemão"],
  ["προγινώσκοντες", "conhecendo-de-antemão"],
  ["προγνώσει", "presciência"],
  ["προγόνοις", "antepassados"],
  ["προγόνων", "antepassados"],

  // --- προδ- (antes / traição) ---
  ["προδραμὼν", "tendo-corrido-adiante"],
  ["προδότης", "traidor"],

  // --- προε- (antes / previamente) ---
  ["προείπαμεν", "dissemos-de-antemão"],
  ["προείρηκεν", "tem-dito-de-antemão"],
  ["προείρηται", "tem-sido-dito-de-antemão"],
  ["προεγνωσμένου", "tendo-sido-conhecido-de-antemão"],
  ["προεθέμην", "propus"],
  ["προειρήκαμεν", "temos-dito-de-antemão"],
  ["προελέγομεν", "dizíamos-de-antemão"],
  ["προελεύσεται", "irá-adiante"],
  ["προενήρξασθε", "começastes-de-antemão"],
  ["προενήρξατο", "começou-de-antemão"],
  ["προεπηγγείλατο", "prometeu-de-antemão"],
  ["προεπηγγελμένην", "tendo-sido-prometida-de-antemão"],
  ["προεστῶτες", "presidindo"],
  ["προευηγγελίσατο", "anunciou-boas-novas-de-antemão"],
  ["προεχειρίσατό", "designou-de-antemão"],
  ["προεχόμεθα", "temos-vantagem"],
  ["προεωρακότες", "tendo-visto-antes"],
  ["προεῖπεν", "disse-de-antemão"],
  ["προεῖπον", "disse-de-antemão"],

  // --- προη- (antes / previamente) ---
  ["προηγούμενοι", "considerando-superiores"],
  ["προηκούσατε", "ouvistes-antes"],
  ["προηλπικότας", "tendo-esperado-de-antemão"],
  ["προημαρτηκόσιν", "tendo-pecado-antes"],
  ["προημαρτηκότων", "tendo-pecado-antes"],

  // --- προθ- (disposição / prazo) ---
  ["προθεσμίας", "prazo-designado"],
  ["προθυμίας", "prontidão"],
  ["προθύμως", "prontamente"],

  // --- προκ- (antes / adiante) ---
  ["προκαλούμενοι", "provocando"],
  ["προκατήγγειλεν", "anunciou-de-antemão"],
  ["προκαταγγείλαντας", "tendo-anunciado-de-antemão"],
  ["προκαταρτίσωσιν", "preparem-de-antemão"],
  ["προκείμενον", "posto-diante"],
  ["προκεκυρωμένην", "tendo-sido-ratificada-de-antemão"],
  ["προκεχειρισμένον", "tendo-sido-designado-de-antemão"],
  ["προκεχειροτονημένοις", "tendo-sido-escolhidos-de-antemão"],
  ["προκηρύξαντος", "tendo-proclamado-de-antemão"],
  ["προκοπὴ", "progresso"],
  ["προκρίματος", "prejulgamento"],

  // --- προλ- / προμ- (tomar-antes / cuidar-de-antemão) ---
  ["προλαμβάνει", "toma-de-antemão"],
  ["προλημφθῇ", "seja-surpreendido"],
  ["προμαρτυρόμενον", "testificando-de-antemão"],
  ["προμελετᾶν", "premeditando"],
  ["προμεριμνᾶτε", "preocupai-vos-de-antemão"],

  // --- πρόνοια (providência / cuidado) ---
  ["προνοίας", "providência"],
  ["προνοεῖ", "cuida"],
  ["προνοούμενοι", "cuidando"],
  ["προνοοῦμεν", "cuidamos"],

  // --- προορίζω (predeterminar) ---
  ["προορίσας", "tendo-predeterminado"],
  ["προορισθέντες", "tendo-sido-predeterminados"],

  // --- προπ- (enviar-adiante / antepassado) ---
  ["προπάτορα", "antepassado"],
  ["προπέμψας", "tendo-enviado-adiante"],
  ["προπέμψατε", "enviai-adiante"],
  ["προπέμψητε", "envieis-adiante"],
  ["προπαθόντες", "tendo-sofrido-antes"],
  ["προπεμπόντων", "enviando-adiante"],
  ["προπεμφθέντες", "tendo-sido-enviados-adiante"],
  ["προπετεῖς", "precipitados"],
  ["προπετὲς", "precipitado"],
  ["προπορεύσονται", "irão-adiante"],
  ["προπορεύσῃ", "irás-adiante"],

  // --- προσ- (junto-a / em-direção-a) ---
  ["προσάββατον", "véspera-de-sábado"],
  ["προσάγαγε", "traz"],
  ["προσάγειν", "trazer"],
  ["προσέθηκεν", "acrescentou"],
  ["προσένεγκον", "oferece"],
  ["προσέπεσαν", "caíram-diante"],
  ["προσέπιπτον", "caíam-diante"],
  ["προσέρχεσθαι", "aproximar-se"],
  ["προσέρχεται", "aproxima-se"],
  ["προσέσχηκεν", "tem-atentado"],
  ["προσέφερεν", "oferecia"],
  ["προσέχοντας", "atentando"],
  ["προσήλυτοι", "prosélitos"],
  ["προσήνεγκα", "ofereci"],
  ["προσήρχοντο", "aproximavam-se"],
  ["προσήχθη", "foi-trazido"],
  ["προσαγάγῃ", "conduza"],
  ["προσαγαγόντες", "tendo-conduzido"],
  ["προσαγορευθεὶς", "tendo-sido-designado"],
  ["προσαιτῶν", "mendigando"],

  // --- προσαν- (além / acrescentar) ---
  ["προσανάβηθι", "sobe-mais-acima"],
  ["προσανέθεντο", "consultaram"],
  ["προσαναπληροῦσα", "suprindo"],
  ["προσανεθέμην", "consultei"],
  ["προσανεπλήρωσαν", "supriram"],
  ["προσαπειλησάμενοι", "tendo-ameaçado-ainda-mais"],

  // --- προσδ- (esperar / receber) ---
  ["προσδέξησθε", "recebais"],
  ["προσδέχεσθε", "recebei"],
  ["προσδέχεται", "recebe"],
  ["προσδέχονται", "recebem"],
  ["προσδαπανήσῃς", "gastes-além"],
  ["προσδεξάμενοι", "tendo-recebido"],
  ["προσδεόμενός", "necessitando"],
  ["προσδοκώντων", "esperando"],
  ["προσδοκῶντας", "esperando"],
  ["προσεδέξασθε", "recebestes"],
  ["προσεδέχετο", "esperava"],
  ["προσεδόκων", "esperavam"],

  // --- προσεκ- (chamar / inclinar / aderir) ---
  ["προσεκαλέσατο", "chamou-a-si"],
  ["προσεκλίθη", "inclinou-se-a"],
  ["προσεκληρώθησαν", "uniram-se"],
  ["προσεκύλισεν", "rolou-para"],
  ["προσεκύνουν", "prostavam-se"],

  // --- προσελ- / προσεν- (aproximar / oferecer) ---
  ["προσελθοῦσαι", "tendo-se-aproximado"],
  ["προσελθόντων", "tendo-se-aproximado"],
  ["προσενέγκαι", "oferecer"],
  ["προσενέγκῃ", "ofereça"],
  ["προσενήνοχεν", "tem-oferecido"],
  ["προσενεχθεὶς", "tendo-sido-oferecido"],
  ["προσεποιήσατο", "fingiu"],

  // --- προσερ- / προσετ- (aproximar / acrescentar) ---
  ["προσερχόμενον", "aproximando-se"],
  ["προσετέθησαν", "foram-acrescentados"],
  ["προσετίθει", "acrescentava"],
  ["προσετίθεντο", "eram-acrescentados"],

  // --- προσευχή / προσεύχομαι (oração / orar) ---
  ["προσευξάμενος", "tendo-orado"],
  ["προσευξάσθωσαν", "orem"],
  ["προσευξώμεθα", "oremos"],
  ["προσευχαί", "orações"],
  ["προσευχαῖς", "orações"],
  ["προσευχομένη", "orando"],
  ["προσευχόμεθα", "oramos"],
  ["προσευχὰς", "orações"],
  ["προσεφώνει", "chamava"],
  ["προσεύξηται", "ore"],
  ["προσεύχομαι", "oro"],
  ["προσεύχονται", "oram"],
  ["προσεύχωμαι", "ore"],
  ["προσεύχῃ", "oras"],

  // --- προσεῶντος (permitindo) ---
  ["προσεῶντος", "permitindo"],

  // --- προσηλ- (prosélito / pregar) ---
  ["προσηλύτων", "prosélitos"],
  ["προσηλώσας", "tendo-pregado"],
  ["προσηνέγκατέ", "oferecestes"],
  ["προσηνέχθησαν", "foram-oferecidos"],
  ["προσηργάσατο", "ganhou-além"],
  ["προσηύξαντο", "oraram"],

  // --- προσθ- (acrescentar) ---
  ["προσθεὶς", "tendo-acrescentado"],

  // --- προσκ- (chamar / perseverar / adorar) ---
  ["προσκέκλημαι", "tenho-sido-chamado"],
  ["προσκέκληται", "tem-sido-chamado"],
  ["προσκαλέσηται", "chame-a-si"],
  ["προσκαλεσάσθω", "chame-a-si"],
  ["προσκαρτερήσει", "perseverança"],
  ["προσκαρτερήσομεν", "perseveraremos"],
  ["προσκαρτερεῖτε", "perseverai"],
  ["προσκαρτερούντων", "perseverando"],
  ["προσκαρτερῇ", "persevere"],
  ["προσκαρτερῶν", "perseverando"],
  ["προσκεφάλαιον", "travesseiro"],
  ["προσκολληθήσεται", "será-unido"],
  ["προσκοπήν", "tropeço"],
  ["προσκυλίσας", "tendo-rolado-para"],

  // --- προσκυνέω (prostrar-se / adorar) ---
  ["προσκυνήσαντες", "tendo-se-prostrado"],
  ["προσκυνήσει", "prostrar-se-á"],
  ["προσκυνήσεις", "prostrar-te-ás"],
  ["προσκυνήσετε", "prostrar-vos-eis"],
  ["προσκυνήσω", "prostrar-me-ei"],
  ["προσκυνεῖτε", "prostrais-vos"],
  ["προσκυνησάτωσαν", "prostrem-se"],
  ["προσκυνηταὶ", "adoradores"],
  ["προσκυνοῦμεν", "prostramo-nos"],
  ["προσκυνοῦσα", "prostrando-se"],
  ["προσκόπτουσιν", "tropeçam"],

  // --- προσλ- (receber / falar) ---
  ["προσλαβοῦ", "recebe"],
  ["προσλαλοῦντες", "falando-a"],
  ["προσλαλῆσαι", "falar-a"],

  // --- προσμ- (permanecer) ---
  ["προσμένει", "permanece"],
  ["προσμείνας", "tendo-permanecido"],
  ["προσμεῖναι", "permanecer"],

  // --- προσο- / προσπ- (dever-além / cair-diante) ---
  ["προσοφείλεις", "deves-além"],
  ["προσπήξαντες", "tendo-pregado"],
  ["προσπεσοῦσα", "tendo-caído-diante"],
  ["προσπορεύονται", "aproximam-se"],

  // --- προστ- (presidir / acrescentar / ordenar) ---
  ["προστάτις", "protetora"],
  ["προστεθῆναι", "ser-acrescentado"],
  ["προστεταγμένα", "tendo-sido-ordenados"],
  ["προστεταγμένους", "tendo-sido-ordenados"],
  ["προστρέχοντες", "correndo-para"],
  ["προστῆναι", "presidir"],

  // --- προσφ- (oferecer / recentemente) ---
  ["προσφάγιον", "comida"],
  ["προσφάτως", "recentemente"],
  ["προσφέρει", "oferece"],
  ["προσφέρεται", "é-oferecido"],
  ["προσφέροντες", "oferecendo"],
  ["προσφέρουσιν", "oferecem"],
];

let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11t (freq 1, parte 20/44) ===`);
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

console.log(`\n=== Resultado Lote 11t ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

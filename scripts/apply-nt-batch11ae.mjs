#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ae
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 31/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ae-${Date.now()}.sql`);

const translations = [
  // === Lote 11ae - freq 1 (parte 31/44) - 248 palavras ===

  // --- ἀπο- palavras (continuação) ---
  ["ἀποσυναγώγους", "expulsos-da-sinagoga"],
  ["ἀποτάξασθαι", "despedir-se"],
  ["ἀποτάσσεται", "despede-se"],
  ["ἀποτίσω", "pagarei"],
  ["ἀποτελεσθεῖσα", "tendo-sido-completada"],
  ["ἀποτελῶ", "completo"],
  ["ἀποτινάξας", "tendo-sacudido"],
  ["ἀποτινάσσετε", "sacudi"],
  ["ἀποτολμᾷ", "ousa"],
  ["ἀποτομία", "severidade"],
  ["ἀποτομίαν", "severidade"],
  ["ἀποτρέπου", "afasta-te"],
  ["ἀπουσίᾳ", "ausência"],
  ["ἀποφέρεσθαι", "ser-levado"],
  ["ἀποφεύγοντας", "escapando"],
  ["ἀποφθέγγεσθαι", "proclamar"],
  ["ἀποφθέγγομαι", "proclamo"],
  ["ἀποφορτιζόμενον", "descarregando"],
  ["ἀποχρήσει", "uso-pleno"],
  ["ἀποχωρήσας", "tendo-se-retirado"],
  ["ἀποχωρεῖ", "retira-se"],
  ["ἀποχωρεῖτε", "retirai-vos"],
  ["ἀποχωρισθῆναι", "ser-separado"],
  ["ἀποψυχόντων", "desfalecendo"],
  ["ἀπροσωπολήμπτως", "sem-parcialidade"],
  ["ἀπρόσιτον", "inacessível"],
  ["ἀπρόσκοπον", "sem-tropeço"],
  ["ἀπταίστους", "sem-tropeçar"],
  ["ἀπωθεῖσθε", "rejeitais"],
  ["ἀπωσάμενοι", "tendo-rejeitado"],
  ["ἀπόβλητον", "rejeitável"],
  ["ἀπόδημος", "viajante"],
  ["ἀπόθεσθε", "despoji-vos"],
  ["ἀπόκειταί", "está-reservado"],
  ["ἀπόκειται", "está-reservado"],
  ["ἀπόκριμα", "sentença"],
  ["ἀπόκρυφοι", "ocultos"],
  ["ἀπόλλυε", "destrói"],
  ["ἀπόλλυμαι", "pereço"],
  ["ἀπόλλυνται", "perecem"],
  ["ἀπόλουσαι", "lava-te"],
  ["ἀπόλωνται", "pereçam"],
  ["ἀπόντες", "estando-ausentes"],
  ["ἀπόστειλον", "envia"],
  ["ἀπόστολον", "apóstolo"],
  ["ἀπώλετο", "pereceu"],
  ["ἀπώλλυντο", "pereciam"],
  ["ἀπώσαντο", "rejeitaram"],
  ["ἀπῄεσαν", "iam-embora"],
  ["ἀπῆλθαν", "partiram"],
  ["ἀπῆλθόν", "parti"],

  // --- ἀρ- palavras ---
  ["ἀρέσαι", "agradar"],
  ["ἀρέσκοντες", "agradando"],
  ["ἀρέσκω", "agrado"],
  ["ἀρίστου", "refeição"],
  ["ἀργή", "ociosa"],
  ["ἀργαί", "ociosas"],
  ["ἀργεῖ", "está-ocioso"],
  ["ἀργοί", "ociosos"],
  ["ἀργούς", "ociosos"],
  ["ἀργοὺς", "ociosos"],
  ["ἀργυρίῳ", "prata"],
  ["ἀργυροκόπος", "ourives-de-prata"],
  ["ἀργυροῦς", "de-prata"],
  ["ἀργύριά", "moedas-de-prata"],
  ["ἀργύριόν", "prata"],
  ["ἀργύρῳ", "prata"],
  ["ἀργὸν", "ocioso"],
  ["ἀρεσκέτω", "agrade"],
  ["ἀρεσκείαν", "agrado"],
  ["ἀρεσκόντων", "agradando"],
  ["ἀρετήν", "virtude"],
  ["ἀρετὰς", "virtudes"],
  ["ἀρετὴ", "virtude"],
  ["ἀρθήτω", "seja-levantado"],
  ["ἀρθῇ", "seja-levantado"],
  ["ἀρθῶσιν", "sejam-levantados"],
  ["ἀριθμοῦ", "número"],
  ["ἀριθμῷ", "número"],
  ["ἀριστήσατε", "comei-a-refeição"],
  ["ἀριστήσῃ", "coma-a-refeição"],
  ["ἀριστερά", "esquerda"],
  ["ἀρκέσῃ", "baste"],
  ["ἀρκεσθησόμεθα", "seremos-suficientes"],
  ["ἀρκετὸς", "suficiente"],
  ["ἀρκεῖ", "basta"],
  ["ἀρκεῖσθε", "contentai-vos"],
  ["ἀρκούμενοι", "contentando-se"],
  ["ἀρκούμενος", "contentando-se"],
  ["ἀρκοῦσιν", "bastam"],
  ["ἀρνήσασθαι", "negar"],
  ["ἀρνήσεται", "negará"],
  ["ἀρνήσηταί", "negue"],
  ["ἀρνήσομαι", "negarei"],
  ["ἀρνήσῃ", "negues"],
  ["ἀρνία", "cordeiros"],
  ["ἀρνεῖσθαι", "negar"],
  ["ἀρνησάμενοι", "tendo-negado"],
  ["ἀρνησάμενός", "tendo-negado"],
  ["ἀρνησάσθω", "negue"],
  ["ἀρνησόμεθα", "negaremos"],
  ["ἀρνουμένων", "negando"],
  ["ἀρνοῦνται", "negam"],
  ["ἀρξαμένου", "tendo-começado"],
  ["ἀροτριᾶν", "arar"],
  ["ἀροτριῶν", "arando"],
  ["ἀροτριῶντα", "arando"],
  ["ἀρραβὼν", "penhor"],
  ["ἀρρώστοις", "enfermos"],
  ["ἀρσενοκοίταις", "sodomitas"],
  ["ἀρσενοκοῖται", "sodomitas"],
  ["ἀρτέμωνα", "vela-de-proa"],
  ["ἀρτιγέννητα", "recém-nascidos"],
  ["ἀρτυθήσεται", "será-temperado"],
  ["ἀρτύσετε", "temperareis"],
  ["ἀρχάγγελος", "arcanjo"],
  ["ἀρχή", "princípio"],
  ["ἀρχαίου", "antigo"],
  ["ἀρχαίῳ", "antigo"],
  ["ἀρχαγγέλου", "arcanjo"],
  ["ἀρχαῖα", "antigas"],
  ["ἀρχιερατικοῦ", "sumo-sacerdotal"],
  ["ἀρχισυνάγωγοι", "chefes-da-sinagoga"],
  ["ἀρχισυνάγωγον", "chefe-da-sinagoga"],
  ["ἀρχισυναγώγων", "chefes-da-sinagoga"],
  ["ἀρχισυναγώγῳ", "chefe-da-sinagoga"],
  ["ἀρχιτέκτων", "mestre-construtor"],
  ["ἀρχιτελώνης", "chefe-dos-cobradores-de-impostos"],
  ["ἀρχιτρικλίνῳ", "mestre-de-cerimônias"],
  ["ἀρχομένων", "começando"],
  ["ἀρχόμενος", "começando"],
  ["ἀρχὴ", "princípio"],
  ["ἀρωμάτων", "aromas"],
  ["ἀρᾶς", "maldição"],
  ["ἀρῶ", "levantarei"],

  // --- ἀσ- palavras ---
  ["ἀσάλευτον", "inabalável"],
  ["ἀσάλευτος", "inabalável"],
  ["ἀσέλγειαν", "devassidão"],
  ["ἀσήμου", "insignificante"],
  ["ἀσεβέσι", "ímpios"],
  ["ἀσεβειῶν", "impiedades"],
  ["ἀσεβεῖν", "ser-ímpio"],
  ["ἀσεβὴς", "ímpio"],
  ["ἀσεβῆ", "ímpio"],
  ["ἀσθένεια", "fraqueza"],
  ["ἀσθενέστερα", "mais-fracos"],
  ["ἀσθενήματα", "fraquezas"],
  ["ἀσθενήσας", "tendo-adoecido"],
  ["ἀσθενήσασαν", "tendo-adoecido"],
  ["ἀσθενεστέρῳ", "mais-fraco"],
  ["ἀσθενοῦμεν", "somos-fracos"],
  ["ἀσθενοῦσαν", "estando-enferma"],
  ["ἀσθενῶμεν", "sejamos-fracos"],
  ["ἀσιτίας", "abstinência-de-comida"],
  ["ἀσκῶ", "exercito-me"],
  ["ἀσμένως", "alegremente"],
  ["ἀσπάζεσθαι", "saudar"],
  ["ἀσπάζομαι", "saúdo"],
  ["ἀσπάζονταί", "saúdam"],
  ["ἀσπάζου", "saúda"],
  ["ἀσπίδων", "víboras"],
  ["ἀσπίλου", "imaculado"],
  ["ἀσπασμοῦ", "saudação"],
  ["ἀσπασμὸν", "saudação"],
  ["ἀσσαρίου", "asse"],
  ["ἀσσαρίων", "asses"],
  ["ἀστέρες", "estrelas"],
  ["ἀστέρος", "estrela"],
  ["ἀστέρων", "estrelas"],
  ["ἀστήρικτοι", "instáveis"],
  ["ἀστατοῦμεν", "somos-sem-lar"],
  ["ἀστεῖον", "belo"],
  ["ἀστεῖος", "belo"],
  ["ἀστηρίκτους", "instáveis"],
  ["ἀστοχήσαντες", "tendo-se-desviado"],
  ["ἀστράπτουσα", "relampejando"],
  ["ἀστραπτούσῃ", "relampejante"],
  ["ἀστραπὴν", "relâmpago"],
  ["ἀστραπῇ", "relâmpago"],
  ["ἀστόργους", "sem-afeição-natural"],
  ["ἀστὴρ", "estrela"],
  ["ἀσυνέτους", "sem-entendimento"],
  ["ἀσυνέτῳ", "sem-entendimento"],
  ["ἀσυνθέτους", "sem-aliança"],
  ["ἀσφάλεια", "segurança"],
  ["ἀσφάλειαν", "segurança"],
  ["ἀσφαλίσασθε", "assegurai"],
  ["ἀσφαλείᾳ", "segurança"],
  ["ἀσφαλισθῆναι", "ser-assegurado"],
  ["ἀσφαλῆ", "seguro"],
  ["ἀσχήμονα", "indecorosos"],
  ["ἀσχημονεῖ", "age-indecentemente"],
  ["ἀσχημονεῖν", "agir-indecentemente"],
  ["ἀσωτία", "devassidão"],
  ["ἀσύμφωνοι", "em-desacordo"],
  ["ἀσύνετος", "sem-entendimento"],
  ["ἀσώτως", "dissolutamente"],

  // --- ἀτ- palavras ---
  ["ἀτάκτους", "desordenados"],
  ["ἀτενίζετε", "fitais"],
  ["ἀτενίσαντες", "tendo-fitado"],
  ["ἀτενίσασα", "tendo-fitado"],
  ["ἀτιμάζεις", "desonras"],
  ["ἀτιμάζεσθαι", "ser-desonrado"],
  ["ἀτιμάζετέ", "desonrais"],
  ["ἀτιμάσαντες", "tendo-desonrado"],
  ["ἀτιμία", "desonra"],
  ["ἀτιμίᾳ", "desonra"],
  ["ἀτιμασθῆναι", "ser-desonrado"],
  ["ἀτιμότερα", "menos-honrosos"],
  ["ἀτμίδα", "vapor"],
  ["ἀτμὶς", "vapor"],
  ["ἀτόμῳ", "átomo"],
  ["ἀτόπων", "perversos"],

  // --- ἀφ- palavras ---
  ["ἀφέθησαν", "foram-perdoados"],
  ["ἀφέλωμαι", "tire"],
  ["ἀφέωνταί", "têm-sido-perdoados"],
  ["ἀφήκατε", "deixastes"],
  ["ἀφήσεις", "deixarás"],
  ["ἀφήσουσιν", "deixarão"],
  ["ἀφίδω", "veja"],
  ["ἀφίκετο", "chegou"],
  ["ἀφίομεν", "perdoamos"],
  ["ἀφίστανται", "afastam-se"],
  ["ἀφίστατο", "afastava-se"],
  ["ἀφαιρεθήσεται", "será-tirado"],
  ["ἀφαιρεῖν", "tirar"],
  ["ἀφαιρεῖται", "é-tirado"],
  ["ἀφανίζουσιν", "desfiguram"],
  ["ἀφανίσθητε", "sede-destruídos"],
  ["ἀφανιζομένη", "desvanecendo-se"],
  ["ἀφανισμοῦ", "destruição"],
  ["ἀφανὴς", "invisível"],
  ["ἀφεθήσεταί", "será-perdoado"],
  ["ἀφειδίᾳ", "severidade"],
  ["ἀφελεῖν", "tirar"],
  ["ἀφελότητι", "simplicidade"],
  ["ἀφθορίαν", "incorrupção"],
  ["ἀφιλάγαθοι", "sem-amor-ao-bem"],
  ["ἀφιλάργυρον", "sem-amor-ao-dinheiro"],
  ["ἀφορίζει", "separa"],
  ["ἀφορίσας", "tendo-separado"],
  ["ἀφορίσει", "separará"],
  ["ἀφορίσθητε", "sede-separados"],
  ["ἀφορίσωσιν", "separem"],
  ["ἀφοριοῦσιν", "separarão"],
  ["ἀφορμήν", "ocasião"],
  ["ἀφορῶντες", "olhando-fixamente"],
  ["ἀφρίζει", "espuma"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ae (freq 1, parte 31/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(`npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`, {
      encoding: 'utf-8',
      timeout: 30000
    });
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

console.log(`\n=== Resultado Lote 11ae ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

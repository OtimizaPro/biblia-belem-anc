#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11al
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 38/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11al-${Date.now()}.sql`);

const translations = [
  // === freq1-slice-al.json — 248 hapax legomena (freq 1) ===

  // --- ἐπι- palavras (verbos compostos com ἐπί) ---
  ["ἐπιστῇ", "Sobrevenha"],
  ["ἐπισυνάγει", "Reúne"],
  ["ἐπισυνάξαι", "Reunir"],
  ["ἐπισυνάξει", "Reunirá"],
  ["ἐπισυνάξουσιν", "Reunirão"],
  ["ἐπισυναγαγεῖν", "Reunir"],
  ["ἐπισυναγωγὴν", "Reunião"],
  ["ἐπισυναγωγῆς", "Reunião"],
  ["ἐπισυναχθήσονται", "Serão-reunidos"],
  ["ἐπισυναχθεισῶν", "Tendo-sido-reunidas"],
  ["ἐπισυνηγμένη", "Tendo-sido-reunida"],
  ["ἐπισυντρέχει", "Corre-junto"],
  ["ἐπισφαλοῦς", "Perigosa"],
  ["ἐπισωρεύσουσιν", "Amontoarão"],
  ["ἐπιτάξῃ", "Ordene"],
  ["ἐπιτάσσειν", "Ordenar"],
  ["ἐπιτάσσω", "Ordeno"],
  ["ἐπιτήδεια", "Necessárias"],
  ["ἐπιτίθει", "Põe-sobre"],
  ["ἐπιτίθεσθαι", "Pôr-sobre"],
  ["ἐπιτίθησιν", "Põe-sobre"],
  ["ἐπιταγήν", "Mandamento"],
  ["ἐπιταγῆς", "Mandamento"],
  ["ἐπιτελέσαι", "Completar"],
  ["ἐπιτελέσας", "Tendo-completado"],
  ["ἐπιτελέσατε", "Completai"],
  ["ἐπιτελέσει", "Completará"],
  ["ἐπιτελέσῃ", "Complete"],
  ["ἐπιτελεῖν", "Completar"],
  ["ἐπιτελεῖσθαι", "Ser-completado"],
  ["ἐπιτελεῖσθε", "Completais"],
  ["ἐπιτιθέασιν", "Põem-sobre"],
  ["ἐπιτιθεὶς", "Tendo-posto-sobre"],
  ["ἐπιτιμήσας", "Tendo-repreendido"],
  ["ἐπιτιμία", "Repreensão"],
  ["ἐπιτρέπεται", "É-permitido"],
  ["ἐπιτρέπω", "Permito"],
  ["ἐπιτρέπῃ", "Permita"],
  ["ἐπιτρέψαντος", "Tendo-permitido"],
  ["ἐπιτροπῆς", "Comissão"],
  ["ἐπιτρόπου", "Procurador"],
  ["ἐπιτρόπους", "Procuradores"],
  ["ἐπιτρόπῳ", "Procurador"],
  ["ἐπιτυχεῖν", "Alcançar"],
  ["ἐπιφέρων", "Trazendo-sobre"],
  ["ἐπιφαινόντων", "Aparecendo"],
  ["ἐπιφανείᾳ", "Manifestação"],
  ["ἐπιφανῆ", "Manifesto"],
  ["ἐπιφαύσει", "Resplandecerá"],
  ["ἐπιφωσκούσῃ", "Amanhecendo"],
  ["ἐπιφᾶναι", "Resplandecer"],
  ["ἐπιχέων", "Derramando-sobre"],
  ["ἐπιχορηγήσατε", "Supliai"],
  ["ἐπιχορηγηθήσεται", "Será-suprido"],
  ["ἐπιχορηγούμενον", "Sendo-suprido"],
  ["ἐπιόρκοις", "Perjuros"],

  // --- ἐπλ- palavras (verbos aoristo/passado com ἐ-) ---
  ["ἐπλάσθη", "Foi-formada"],
  ["ἐπλέομεν", "Navegávamos"],
  ["ἐπλήρου", "Cumpria"],
  ["ἐπλεονέκτησα", "Explorei"],
  ["ἐπλεονέκτησεν", "Explorou"],
  ["ἐπλεονεκτήσαμεν", "Exploramos"],
  ["ἐπληθύνθη", "Foi-multiplicado"],
  ["ἐπληροῦτο", "Era-cumprido"],
  ["ἐπλουτήσατε", "Enriquecestes"],
  ["ἐπλουτίσθητε", "Fostes-enriquecidos"],
  ["ἐπνίγοντο", "Eram-afogados"],

  // --- ἐπο- palavras ---
  ["ἐποίησας", "Fizeste"],
  ["ἐποιησάμην", "Fiz-para-mim"],
  ["ἐποικοδομηθέντες", "Tendo-sido-edificados-sobre"],
  ["ἐποικοδομούμενοι", "Sendo-edificados-sobre"],
  ["ἐποικοδομοῦντες", "Edificando-sobre"],
  ["ἐποικοδόμησεν", "Edificou-sobre"],
  ["ἐποιοῦντο", "Faziam-para-si"],
  ["ἐπονομάζῃ", "Te-denominas"],
  ["ἐποπτεύοντες", "Observando"],
  ["ἐποπτεύσαντες", "Tendo-observado"],
  ["ἐπορευόμεθα", "Caminhávamos"],
  ["ἐπορευόμην", "Caminhava"],
  ["ἐποτίσαμεν", "Demos-de-beber"],
  ["ἐποτίσθημεν", "Fomos-feitos-beber"],
  ["ἐπουράνιοι", "Celestiais"],
  ["ἐπουράνιον", "Celestial"],
  ["ἐπουράνιος", "Celestial"],
  ["ἐπουρανίῳ", "Celestial"],

  // --- ἐπρ- palavras ---
  ["ἐπράθη", "Foi-vendido"],
  ["ἐπράξαμεν", "Praticamos"],
  ["ἐπράξατε", "Praticastes"],
  ["ἐπρίσθησαν", "Foram-serrados"],
  ["ἐπροφήτευον", "Profetizavam"],
  ["ἐπροφήτευσαν", "Profetizaram"],
  ["ἐπροφητεύσαμεν", "Profetizamos"],
  ["ἐπτώχευσεν", "Empobreceu"],
  ["ἐπωρώθη", "Foi-endurecido"],
  ["ἐπωρώθησαν", "Foram-endurecidos"],
  ["ἐπόπται", "Testemunhas-oculares"],
  ["ἐπόρθει", "Devastava"],
  ["ἐπόρθουν", "Devastavam"],
  ["ἐπόρνευσαν", "Fornicaram"],
  ["ἐπότισα", "Dei-de-beber"],
  ["ἐπότισεν", "Deu-de-beber"],
  ["ἐπύθετο", "Inquiriu"],
  ["ἐπώλησεν", "Vendeu"],
  ["ἐπώλουν", "Vendiam"],
  ["ἐπώρωσεν", "Endureceu"],
  ["ἐπᾶραι", "Levantar"],
  ["ἐπῄνεσεν", "Elogiou"],

  // --- ἐρ- palavras ---
  ["ἐράπισαν", "Esbofetearam"],
  ["ἐρήμους", "Desertos"],
  ["ἐρήμωσις", "Desolação"],
  ["ἐρίου", "Lã"],
  ["ἐρίσει", "Contenderá"],
  ["ἐρίφια", "Cabritos"],
  ["ἐρίφων", "Cabritos"],
  ["ἐραβδίσθην", "Fui-açoitado-com-varas"],
  ["ἐραυνᾶτε", "Examinais"],
  ["ἐραυνᾷ", "Examina"],
  ["ἐραυνῶν", "Examinando"],
  ["ἐραυνῶντες", "Examinando"],
  ["ἐραύνησον", "Examina"],
  ["ἐργάζου", "Trabalha"],
  ["ἐργάζῃ", "Trabalhas"],
  ["ἐργάσῃ", "Trabalhe"],
  ["ἐργάτην", "Trabalhador"],
  ["ἐργαζομένους", "Trabalhando"],
  ["ἐρείσασα", "Tendo-encalhado"],
  ["ἐρεθίζετε", "Provoqueis"],
  ["ἐρεύξομαι", "Proclamarei"],
  ["ἐρεῖτέ", "Direis"],
  ["ἐρημίαις", "Desertos"],
  ["ἐρημίας", "Deserto"],
  ["ἐριθεία", "Contenda"],
  ["ἐροῦσίν", "Dirão"],
  ["ἐρρέθησαν", "Foram-ditas"],
  ["ἐρριμμένοι", "Tendo-sido-lançados"],
  ["ἐρρύσατο", "Livrou"],
  ["ἐρχέσθω", "Venha"],
  ["ἐρχομένης", "Vindo"],
  ["ἐρχομένους", "Vindo"],
  ["ἐρχομένων", "Vindo"],
  ["ἐρωτήσατε", "Perguntai"],
  ["ἐρωτήσετε", "Perguntareis"],
  ["ἐρωτήσωσιν", "Perguntem"],
  ["ἐρωτήσῃ", "Pergunte"],
  ["ἐρωτώντων", "Perguntando"],
  ["ἐρωτᾶν", "Perguntar"],
  ["ἐρωτῆσαί", "Perguntar"],
  ["ἐρωτῆσαι", "Perguntar"],
  ["ἐρωτῶμεν", "Perguntamos"],
  ["ἐρωτῶν", "Perguntando"],
  ["ἐρωτῶντες", "Perguntando"],
  ["ἐρύσθην", "Fui-livrado"],
  ["ἐρώτησον", "Pergunta"],

  // --- ἐσ- palavras ---
  ["ἐσάλευσεν", "Sacudiu"],
  ["ἐσήμαινεν", "Significava"],
  ["ἐσαλεύθη", "Foi-sacudido"],
  ["ἐσείσθησαν", "Foram-sacudidos"],
  ["ἐσεβάσθησαν", "Veneraram"],
  ["ἐσθήσεσι", "Vestes"],
  ["ἐσθίητε", "Comais"],
  ["ἐσθίοντι", "Comendo"],
  ["ἐσκήνωσεν", "Habitou-em-tenda"],
  ["ἐσκανδαλίσθησαν", "Foram-escandalizados"],
  ["ἐσκληρύνοντο", "Eram-endurecidos"],
  ["ἐσκοτίσθη", "Foi-obscurecido"],
  ["ἐσκοτωμένοι", "Tendo-sido-obscurecidos"],
  ["ἐσκυλμένοι", "Tendo-sido-esfolados"],
  ["ἐσμυρνισμένον", "Tendo-sido-misturado-com-mirra"],
  ["ἐσπαργάνωσεν", "Envolveu-em-panos"],
  ["ἐσπαργανωμένον", "Tendo-sido-envolto-em-panos"],
  ["ἐσπαταλήσατε", "Vivestes-em-deleites"],
  ["ἐσπείραμεν", "Semeamos"],
  ["ἐσπιλωμένον", "Tendo-sido-manchado"],
  ["ἐσπουδάσαμεν", "Nos-esforçamos"],
  ["ἐσπούδασα", "Esforcei-me"],
  ["ἐστάθησαν", "Foram-postos-em-pé"],
  ["ἐστέναξεν", "Gemeu"],
  ["ἐστήρικται", "Tem-sido-firmado"],
  ["ἐστήρισεν", "Firmou"],
  ["ἐστί", "É"],
  ["ἐσταυρωμένος", "Tendo-sido-crucificado"],
  ["ἐσταύρωται", "Tem-sido-crucificado"],
  ["ἐστερέωσεν", "Fortaleceu"],
  ["ἐστερεοῦντο", "Eram-fortalecidos"],
  ["ἐστερεώθησαν", "Foram-fortalecidos"],
  ["ἐστεφάνωσας", "Coroaste"],
  ["ἐστεφανωμένον", "Tendo-sido-coroado"],
  ["ἐστηριγμένους", "Tendo-sido-firmados"],
  ["ἐστράφη", "Voltou-se"],
  ["ἐστράφησαν", "Voltaram-se"],
  ["ἐστρώννυον", "Estendiam"],
  ["ἐσυκοφάντησα", "Extorqui"],
  ["ἐσφράγισεν", "Selou"],
  ["ἐσχάτους", "Últimos"],
  ["ἐσχάτως", "Extremamente"],
  ["ἐσχίσθησαν", "Foram-rasgados"],
  ["ἐσχηκότα", "Tendo-tido"],
  ["ἐσωτέραν", "Interior"],
  ["ἐσόμενον", "Estando-para-ser"],
  ["ἐσόπτρου", "Espelho"],
  ["ἐσόπτρῳ", "Espelho"],
  ["ἐσύλησα", "Despojei"],
  ["ἐσώθημεν", "Fomos-salvos"],
  ["ἐσώτερον", "Interior"],
  ["ἐσῴζοντο", "Eram-salvos"],

  // --- ἐτ- palavras ---
  ["ἐτάξατο", "Designou-para-si"],
  ["ἐτάραξεν", "Perturbou"],
  ["ἐτάρασσε", "Perturbava"],
  ["ἐτέθη", "Foi-posto"],
  ["ἐτέχθη", "Foi-gerado"],
  ["ἐτήρησα", "Guardei"],
  ["ἐτήρησαν", "Guardaram"],
  ["ἐτίθει", "Punha"],
  ["ἐτίθεσαν", "Punham"],
  ["ἐτίμησαν", "Honraram"],
  ["ἐταπείνωσεν", "Humilhou"],
  ["ἐτεκνοτρόφησεν", "Criou-filhos"],
  ["ἐτελείωσεν", "Aperfeiçoou"],
  ["ἐτελειώθη", "Foi-aperfeiçoado"],
  ["ἐτηρεῖτο", "Era-guardado"],
  ["ἐτιμήσαντο", "Avaliaram"],
  ["ἐτροποφόρησεν", "Suportou-os-modos"],
  ["ἐτρυφήσατε", "Vivestes-em-delícias"],
  ["ἐτυμπανίσθησαν", "Foram-torturados"],
  ["ἐτόλμησέν", "Ousou"],
  ["ἐτόλμησεν", "Ousou"],
  ["ἐτόλμων", "Ousavam"],
  ["ἐτύθη", "Foi-sacrificado"],

  // --- ἐφ- palavras ---
  ["ἐφάγετε", "Comestes"],
  ["ἐφάγομεν", "Comemos"],
  ["ἐφάνησαν", "Apareceram"],
  ["ἐφέροντο", "Eram-levados"],
  ["ἐφέστηκεν", "Está-presente"],
  ["ἐφίμωσεν", "Amordaçou"],
  ["ἐφαλόμενος", "Tendo-saltado-sobre"],
  ["ἐφερόμεθα", "Éramos-levados"],
  ["ἐφεστὼς", "Estando-presente"],
  ["ἐφεστῶτα", "Estando-presente"],
  ["ἐφευρετὰς", "Inventores"],
  ["ἐφημέρου", "Diária"],
  ["ἐφθείραμεν", "Corrompemos"],
  ["ἐφικέσθαι", "Alcançar"],
  ["ἐφικνούμενοι", "Alcançando"],
  ["ἐφιμώθη", "Foi-amordaçado"],
  ["ἐφοβεῖτο", "Temia"],
  ["ἐφοβούμην", "Eu-temia"],
  ["ἐφορέσαμεν", "Trouxemos"],
  ["ἐφρονεῖτε", "Pensáveis"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11al (freq 1, parte 38/44) ===`);
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

console.log(`\n=== Resultado Lote 11al ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

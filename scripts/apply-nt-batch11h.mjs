#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11h
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 8/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11h-${Date.now()}.sql`);

const translations = [
  // === Índices 1736-1983 de freq1-words.json (248 palavras) ===

  // --- δόγ-, δόλ-, δόμ- (decretos, enganosos, dom) ---
  ["δόγματα", "decretos"],
  ["δόλιοι", "enganosos"],
  ["δόμα", "dom"],

  // --- δόξ- (glorificar, pensar) ---
  ["δόξητε", "penseis"],
  ["δόξω", "glorificarei"],

  // --- δόσ- (dádiva, dar) ---
  ["δόσεως", "dádiva"],
  ["δόσις", "dádiva"],
  ["δότην", "dador"],
  ["δότω", "dê"],

  // --- δύν- (poder, ser-capaz) ---
  ["δύναμίν", "poder"],
  ["δύναμαί", "posso"],
  ["δύνανταί", "podem"],
  ["δύνωνται", "possam"],

  // --- δύσ- (ocidente, difícil) ---
  ["δύσεως", "ocidente"],
  ["δύσκολόν", "difícil"],

  // --- δώρ- (presentes, presente) ---
  ["δώροις", "presentes"],
  ["δώρῳ", "presente"],

  // --- δώσ- (dar), δῆλ-, δῆμ-, δῷς ---
  ["δώσῃ", "dê"],
  ["δῆλόν", "evidente"],
  ["δῆμος", "povo"],
  ["δῷς", "dês"],

  // --- εἰδ- (aparência, ídolo) ---
  ["εἰδέα", "aparência"],
  ["εἰδωλίῳ", "templo-de-ídolo"],
  ["εἰδωλολατρείαις", "idolatrias"],
  ["εἰδωλολατρείας", "idolatria"],
  ["εἰδωλόθυτόν", "sacrificado-a-ídolos"],
  ["εἰδώλου", "ídolo"],
  ["εἰδώλῳ", "ídolo"],

  // --- εἰθ-, εἰκ- (acostumar, vinte-e-três, imagem) ---
  ["εἰθισμένον", "tendo-sido-acostumado"],
  ["εἰκοσιτρεῖς", "vinte-e-três"],
  ["εἰκὼν", "imagem"],

  // --- εἰλ- (receber, sinceridade) ---
  ["εἰληφὼς", "tendo-recebido"],
  ["εἰλικρινίᾳ", "sinceridade"],
  ["εἰλικρινεῖς", "sinceros"],
  ["εἰλικρινῆ", "sincero"],

  // --- εἰπ- (dizer) ---
  ["εἰπάτωσαν", "digam"],
  ["εἰπόν", "dize"],
  ["εἰπόντος", "tendo-dito"],

  // --- εἰρ- (dizer, trabalhar) ---
  ["εἰρήκασιν", "têm-dito"],
  ["εἰρήκατε", "tendes-dito"],
  ["εἰργασμένα", "tendo-sido-trabalhadas"],
  ["εἰρηκέναι", "ter-dito"],
  ["εἰρηκότος", "tendo-dito"],

  // --- εἰρην- (paz, pacificar) ---
  ["εἰρηνεύοντες", "vivendo-em-paz"],
  ["εἰρηνική", "pacífica"],
  ["εἰρηνικὸν", "pacífico"],
  ["εἰρηνοποιήσας", "tendo-feito-paz"],
  ["εἰρηνοποιοί", "pacificadores"],

  // --- εἰσ- (entrar, introduzir) ---
  ["εἰσάγαγε", "introduze"],
  ["εἰσέλθωμεν", "entremos"],
  ["εἰσέλθωσιν", "entrem"],
  ["εἰσέρχεσθε", "entrais"],
  ["εἰσέρχεται", "entra"],
  ["εἰσέρχησθε", "entreis"],
  ["εἰσήλθατε", "entrastes"],
  ["εἰσίασιν", "entram"],
  ["εἰσαγάγῃ", "introduza"],
  ["εἰσαγαγεῖν", "introduzir"],
  ["εἰσακουσθήσονται", "serão-ouvidos"],
  ["εἰσακουσθεὶς", "tendo-sido-ouvido"],
  ["εἰσακούσονταί", "ouvirão"],
  ["εἰσδέξομαι", "receberei"],
  ["εἰσδραμοῦσα", "tendo-corrido-para-dentro"],
  ["εἰσελήλυθαν", "têm-entrado"],
  ["εἰσελεύσεσθαι", "entrar"],
  ["εἰσεληλύθατε", "tendes-entrado"],
  ["εἰσελθάτω", "entre"],
  ["εἰσελθούσης", "tendo-entrado"],
  ["εἰσελθοῦσα", "tendo-entrado"],
  ["εἰσελθόντι", "tendo-entrado"],
  ["εἰσενέγκωσιν", "tragam-para-dentro"],
  ["εἰσενεγκεῖν", "trazer-para-dentro"],
  ["εἰσεπήδησεν", "saltou-para-dentro"],
  ["εἰσεπορεύετο", "entrava"],
  ["εἰσερχέσθωσαν", "entrem"],
  ["εἰσερχομένην", "entrando"],
  ["εἰσερχομένου", "entrando"],
  ["εἰσερχόμενον", "entrando"],
  ["εἰσηνέγκαμεν", "trouxemos-para-dentro"],
  ["εἰσιέναι", "entrar"],
  ["εἰσκαλεσάμενος", "tendo-chamado-para-dentro"],
  ["εἰσπορευομένους", "entrando"],
  ["εἰσπορευομένων", "entrando"],
  ["εἰσπορευόμεναι", "entrando"],
  ["εἰσφέρεις", "trazes-para-dentro"],
  ["εἰσφέρεται", "é-trazido-para-dentro"],
  ["εἰσφέρωσιν", "tragam-para-dentro"],
  ["εἰσόδου", "entrada"],
  ["εἰσῆλθες", "entraste"],
  ["εἰσῆλθόν", "entraram"],

  // --- εἱλ- (ulcerado) ---
  ["εἱλκωμένος", "tendo-sido-ulcerado"],

  // --- εἴα, εἴασαν (permitir) ---
  ["εἴα", "permitia"],
  ["εἴασαν", "permitiram"],

  // --- εἴδ- (forma, ídolo) ---
  ["εἴδει", "forma"],
  ["εἴδωλον", "ídolo"],
  ["εἴδωλόν", "ídolo"],

  // --- εἴξ- (ceder) ---
  ["εἴξαμεν", "cedemos"],

  // --- εἴπ- (dizer) ---
  ["εἴπατέ", "dizei"],
  ["εἴπητέ", "disserdes"],

  // --- εἴρ- (dizer) ---
  ["εἴρηκας", "tens-dito"],

  // --- εἴς (para/entrada) ---
  ["εἴς", "um"],
  ["εἴσοδος", "entrada"],

  // --- εἴχ- (ter) ---
  ["εἴχαμεν", "tínhamos"],
  ["εἴχομεν", "tínhamos"],

  // --- εἵλ- (escolher, arrastar) ---
  ["εἵλατο", "escolheu"],
  ["εἵλκυσαν", "arrastaram"],

  // --- εἶδ-, εἶπ-, εἶχ- (ver, dizer, ter) ---
  ["εἶδές", "viste"],
  ["εἶπάν", "disseram"],
  ["εἶχέν", "tinha"],
  ["εἶχαν", "tinham"],
  ["εἶχες", "tinhas"],
  ["εἷλκον", "arrastavam"],

  // --- εὐάρ- (agradável) ---
  ["εὐάρεστοι", "agradáveis"],
  ["εὐάρεστος", "agradável"],
  ["εὐάρεστόν", "agradável"],

  // --- εὐαγγ- (evangelizar, anunciar-boas-novas) ---
  ["εὐαγγελίζομαι", "anuncio-boas-novas"],
  ["εὐαγγελίσηται", "anuncie-boas-novas"],
  ["εὐαγγελίσωμαι", "anuncie-boas-novas"],
  ["εὐαγγελιζομένου", "anunciando-boas-novas"],
  ["εὐαγγελιζομένων", "anunciando-boas-novas"],
  ["εὐαγγελιζομένῳ", "anunciando-boas-novas"],
  ["εὐαγγελιζόμεθα", "anunciamos-boas-novas"],
  ["εὐαγγελιζόμενοί", "anunciando-boas-novas"],
  ["εὐαγγελισαμένου", "tendo-anunciado-boas-novas"],
  ["εὐαγγελισαμένων", "tendo-anunciado-boas-novas"],
  ["εὐαγγελισθέντες", "tendo-sido-anunciadas-boas-novas"],
  ["εὐαγγελιστάς", "evangelistas"],

  // --- εὐαρ- (agradável, agradar) ---
  ["εὐαρέστους", "agradáveis"],
  ["εὐαρέστως", "agradavelmente"],
  ["εὐαρεστεῖται", "agrada-se"],
  ["εὐαρεστηκέναι", "ter-agradado"],
  ["εὐαρεστῆσαι", "agradar"],

  // --- εὐγ- (nobre) ---
  ["εὐγενέστεροι", "mais-nobres"],
  ["εὐγενεῖς", "nobres"],
  ["εὐγενὴς", "nobre"],

  // --- εὐδοκ- (comprazer-se) ---
  ["εὐδοκήσαντες", "tendo-se-comprazido"],
  ["εὐδοκεῖ", "compraz-se"],
  ["εὐδοκῶ", "comprazo-me"],

  // --- εὐεργ- (benfeitor, beneficência) ---
  ["εὐεργέται", "benfeitores"],
  ["εὐεργεσίας", "beneficência"],
  ["εὐεργεσίᾳ", "beneficência"],
  ["εὐεργετῶν", "fazendo-bem"],

  // --- εὐηγγ- (evangelizar - aoristo/perfeito) ---
  ["εὐηγγελίζοντο", "anunciavam-boas-novas"],
  ["εὐηγγελίσθη", "foram-anunciadas-boas-novas"],
  ["εὐηγγελισάμεθα", "anunciamos-boas-novas"],
  ["εὐηγγελισμένοι", "tendo-sido-anunciadas-boas-novas"],

  // --- εὐθ- (reto, direto, navegar) ---
  ["εὐθεῖα", "reta"],
  ["εὐθεῖαν", "reta"],
  ["εὐθυδρομήσαμεν", "navegamos-em-linha-reta"],
  ["εὐθυδρομήσαντες", "tendo-navegado-em-linha-reta"],
  ["εὐθυμεῖ", "está-alegre"],
  ["εὐθυμεῖν", "estar-alegre"],
  ["εὐθυμεῖτε", "tende-ânimo"],
  ["εὐθύμως", "alegremente"],
  ["εὐθύνοντος", "endireitando"],
  ["εὐθύς", "reto"],
  ["εὐθύτητος", "retidão"],

  // --- εὐκαίρ- (oportuno, ter-oportunidade) ---
  ["εὐκαίρου", "oportuno"],
  ["εὐκαίρουν", "tinham-oportunidade"],
  ["εὐκαιρήσῃ", "tenha-oportunidade"],

  // --- εὐλαβ- (piedoso, reverente) ---
  ["εὐλαβής", "piedoso"],
  ["εὐλαβηθεὶς", "tendo-sido-reverente"],
  ["εὐλαβὴς", "piedoso"],

  // --- εὐλογ- (abençoar, bênção) ---
  ["εὐλογήσω", "abençoarei"],
  ["εὐλογίαν", "bênção"],
  ["εὐλογίᾳ", "bênção"],
  ["εὐλογεῖν", "abençoar"],
  ["εὐλογεῖται", "é-abençoado"],
  ["εὐλογημένοι", "tendo-sido-abençoados"],
  ["εὐλογοῦντα", "abençoando"],
  ["εὐλογοῦνται", "são-abençoados"],
  ["εὐλογῇς", "abençoes"],
  ["εὐλόγηκεν", "tem-abençoado"],

  // --- εὐμ- (generoso) ---
  ["εὐμεταδότους", "generosos"],

  // --- εὐν- (benevolência, eunuco) ---
  ["εὐνοίας", "benevolência"],
  ["εὐνουχίσθησαν", "foram-feitos-eunucos"],
  ["εὐνούχισαν", "fizeram-eunucos"],
  ["εὐνοῶν", "sendo-benevolente"],

  // --- εὐοδ- (prosperar) ---
  ["εὐοδοῦσθαι", "prosperar"],
  ["εὐοδοῦταί", "prospera"],
  ["εὐοδωθήσομαι", "serei-prosperado"],
  ["εὐοδῶται", "seja-prosperado"],

  // --- εὐπ- (assíduo, obediente, facilmente-envolvente, beneficência, prosperidade, beleza) ---
  ["εὐπάρεδρον", "assíduo"],
  ["εὐπειθής", "obediente"],
  ["εὐπερίστατον", "facilmente-envolvente"],
  ["εὐποιΐας", "beneficência"],
  ["εὐπορία", "prosperidade"],
  ["εὐπορεῖτό", "prosperava"],
  ["εὐπρέπεια", "beleza"],
  ["εὐπροσδέκτους", "aceitáveis"],
  ["εὐπροσωπῆσαι", "fazer-boa-aparência"],

  // --- εὐρ- (espaçoso) ---
  ["εὐρύχωρος", "espaçoso"],

  // --- εὐσεβ- (piedade, piedoso) ---
  ["εὐσεβείαις", "piedades"],
  ["εὐσεβεῖν", "ser-piedoso"],
  ["εὐσεβεῖς", "piedosos"],
  ["εὐσεβεῖτε", "sois-piedosos"],
  ["εὐσεβὴς", "piedoso"],
  ["εὐσεβῆ", "piedoso"],

  // --- εὐσχ- (decoroso, decoro) ---
  ["εὐσχήμονα", "decoroso"],
  ["εὐσχήμονας", "decorosos"],
  ["εὐσχήμων", "decoroso"],
  ["εὐσχημοσύνην", "decoro"],
  ["εὐσχημόνων", "decorosos"],

  // --- εὐτραπ- (gracejos) ---
  ["εὐτραπελία", "gracejos-obscenos"],

  // --- εὐφ- (boa-fama, alegrar) ---
  ["εὐφημίας", "boa-fama"],
  ["εὐφραίνεσθαι", "alegrar-se"],
  ["εὐφραίνοντο", "alegravam-se"],
  ["εὐφραίνου", "alegra-te"],
  ["εὐφραίνων", "alegrando"],
  ["εὐφραινόμενος", "alegrando-se"],
  ["εὐφρανθῆναι", "alegrar-se"],
  ["εὐφρανθῶ", "alegre-me"],
  ["εὐφρανθῶμεν", "alegremo-nos"],
  ["εὐφόρησεν", "produziu-abundantemente"],

  // --- εὐχ- (agradecido, voto, agradecer) ---
  ["εὐχάριστοι", "agradecidos"],
  ["εὐχήν", "voto"],
  ["εὐχαρίστησεν", "deu-graças"],
  ["εὐχαριστήσαντος", "tendo-dado-graças"],
  ["εὐχαριστεῖν", "dar-graças"],
  ["εὐχαριστεῖς", "dás-graças"],
  ["εὐχαριστεῖτε", "dai-graças"],
  ["εὐχαριστηθῇ", "seja-dada-graças"],
  ["εὐχαριστιῶν", "ações-de-graças"],
  ["εὐχαριστοῦμεν", "damos-graças"],
  ["εὐχὴ", "voto"],
  ["εὐχὴν", "voto"],

  // --- εὐψ- (ter-bom-ânimo) ---
  ["εὐψυχῶ", "tenho-bom-ânimo"],

  // --- εὐω- (fragrância) ---
  ["εὐωδία", "fragrância"],

  // --- εὑρ- (encontrar, achar) ---
  ["εὑράμενος", "tendo-encontrado"],
  ["εὑρέθημεν", "fomos-encontrados"],
  ["εὑρέθησαν", "foram-encontrados"],
  ["εὑρήκαμεν", "encontramos"],
  ["εὑρήσεις", "encontrarás"],
  ["εὑρήσομεν", "encontraremos"],
  ["εὑρίσκομεν", "encontramos"],
  ["εὑρίσκον", "encontravam"],
  ["εὑρεθήσεται", "será-encontrado"],
  ["εὑρεθεὶς", "tendo-sido-encontrado"],
  ["εὑρεθησόμεθα", "seremos-encontrados"],
  ["εὑρεθῆναι", "ser-encontrado"],
  ["εὑρεθῆτε", "sejais-encontrados"],
  ["εὑρεθῶσιν", "sejam-encontrados"],
  ["εὑρηκέναι", "ter-encontrado"],
  ["εὑρισκόμεθα", "somos-encontrados"],
  ["εὑροῦσα", "tendo-encontrado"],
  ["εὑροῦσαι", "tendo-encontrado"],
  ["εὑρών", "tendo-encontrado"],

  // --- εὔθ- (apropriado) ---
  ["εὔθετον", "apropriado"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11h (freq 1, parte 8/44) ===`);
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

console.log(`\n=== Resultado Lote 11h ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

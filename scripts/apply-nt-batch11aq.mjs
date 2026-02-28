#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11aq
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 43/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11aq-${Date.now()}.sql`);

const translations = [
  // === freq1-slice-aq.json (248 palavras) ===

  // --- ὑπ- verbos (aoristo/imperfeito) ---
  ["ὑπέβαλον", "Subornaram"],
  ["ὑπέδειξα", "Mostrei"],
  ["ὑπέθηκαν", "Puseram-sob"],
  ["ὑπέλαβεν", "Tomou"],
  ["ὑπέμεινάν", "Perseveraram"],
  ["ὑπέρακμος", "Além-da-flor-da-idade"],
  ["ὑπέστελλεν", "Retraía-se"],
  ["ὑπέστρεψα", "Retornei"],
  ["ὑπέταξας", "Sujeitaste"],
  ["ὑπέχουσαι", "Sofrendo"],

  // --- ὑπή- palavras ---
  ["ὑπήκοοί", "Obedientes"],
  ["ὑπήκοοι", "Obedientes"],
  ["ὑπήκοος", "Obediente"],
  ["ὑπήκουον", "Obedeciam"],
  ["ὑπήκουσαν", "Obedeceram"],
  ["ὑπήνεγκα", "Suportei"],

  // --- ὑπακο- palavras ---
  ["ὑπακοή", "Obediência"],
  ["ὑπακούειν", "Obedecer"],
  ["ὑπακοὴ", "Obediência"],
  ["ὑπακοῦσαι", "Obedecer"],

  // --- ὑπαρ/ὑπε- palavras ---
  ["ὑπαρχούσης", "Existindo"],
  ["ὑπείκετε", "Submetei-vos"],
  ["ὑπελείφθην", "Fui-deixado"],
  ["ὑπεμείνατε", "Perseverastes"],
  ["ὑπεμνήσθη", "Lembrou-se"],

  // --- ὑπεναντ- palavras ---
  ["ὑπεναντίον", "Contrário"],
  ["ὑπεναντίους", "Contrários"],

  // --- ὑπενεγκ- ---
  ["ὑπενεγκεῖν", "Suportar"],

  // --- ὑπερ- palavras (superlativos/intensivos) ---
  ["ὑπερέκεινα", "Além-de"],
  ["ὑπερέχον", "Excedendo"],
  ["ὑπερέχοντας", "Superiores"],
  ["ὑπερέχοντι", "Ao-que-excede"],
  ["ὑπερέχουσα", "Que-excede"],
  ["ὑπερήφανοι", "Soberbos"],
  ["ὑπεραιρόμενος", "Exaltando-se-acima"],
  ["ὑπεραυξάνει", "Cresce-excedentemente"],
  ["ὑπερβαίνειν", "Transgredir"],
  ["ὑπερβαλλούσης", "Excedente"],
  ["ὑπερβαλλόντως", "Excedentemente"],
  ["ὑπερβολὴ", "Excesso"],
  ["ὑπερβολῇ", "Excesso"],
  ["ὑπερεκπερισσῶς", "Superabundantemente"],
  ["ὑπερεκτείνομεν", "Estendemo-nos-além"],
  ["ὑπερεκχυννόμενον", "Transbordando"],
  ["ὑπερεντυγχάνει", "Intercede-acima"],
  ["ὑπερεπερίσσευσεν", "Superabundou"],
  ["ὑπερεπλεόνασεν", "Superabundou"],
  ["ὑπερεχούσαις", "Superiores"],
  ["ὑπερηφανία", "Soberba"],
  ["ὑπεριδὼν", "Tendo-desconsiderado"],
  ["ὑπερνικῶμεν", "Somos-mais-que-vencedores"],
  ["ὑπεροχὴν", "Superioridade"],
  ["ὑπεροχῇ", "Superioridade"],
  ["ὑπερπερισσεύομαι", "Superabundo"],
  ["ὑπερπερισσῶς", "Superabundantemente"],
  ["ὑπερφρονεῖν", "Ter-altivez"],
  ["ὑπερύψωσεν", "Superexaltou"],
  ["ὑπεστρώννυον", "Estendiam"],
  ["ὑπετάγη", "Foi-sujeitado"],
  ["ὑπετάγησαν", "Foram-sujeitados"],
  ["ὑπεχώρησεν", "Retirou-se"],

  // --- ὑπηρ- palavras (servir/ministrar) ---
  ["ὑπηρέταις", "Servos"],
  ["ὑπηρέτησαν", "Serviram"],
  ["ὑπηρετήσας", "Tendo-servido"],
  ["ὑπηρετεῖν", "Servir"],

  // --- ὑπο- palavras ---
  ["ὑπογραμμὸν", "Exemplo"],
  ["ὑποδέδεκται", "Tem-recebido"],
  ["ὑποδήματος", "Sandália"],
  ["ὑποδείγματα", "Exemplos"],
  ["ὑποδεδεμένους", "Tendo-calçado"],
  ["ὑποδεξαμένη", "Tendo-recebido"],
  ["ὑποδησάμενοι", "Tendo-calçado"],
  ["ὑποδραμόντες", "Tendo-navegado-sob"],
  ["ὑποζυγίου", "Animal-de-carga"],
  ["ὑποζωννύντες", "Cingindo-por-baixo"],
  ["ὑποζύγιον", "Animal-de-carga"],
  ["ὑποκάτω", "Debaixo-de"],
  ["ὑποκρίσεις", "Hipocrisias"],
  ["ὑποκρίσεως", "Hipocrisia"],
  ["ὑποκρινομένους", "Fingindo"],
  ["ὑπολήνιον", "Tanque-do-lagar"],
  ["ὑπολαβὼν", "Tendo-respondido"],
  ["ὑπολαμβάνειν", "Supor"],
  ["ὑπολαμβάνετε", "Supondes"],
  ["ὑπολιμπάνων", "Deixando"],

  // --- ὑπομ- palavras (perseverança) ---
  ["ὑπομένετε", "Perseverais"],
  ["ὑπομένομεν", "Perseveramos"],
  ["ὑπομένοντες", "Perseverando"],
  ["ὑπομένω", "Persevero"],
  ["ὑπομίμνῃσκε", "Lembra"],
  ["ὑπομείναντας", "Tendo-perseverado"],
  ["ὑπομεμενηκότα", "Tendo-perseverado"],
  ["ὑπομιμνῄσκειν", "Lembrar"],
  ["ὑπομνήσω", "Lembrarei"],
  ["ὑπομονῇ", "Perseverança"],

  // --- ὑπον/ὑποστ- palavras ---
  ["ὑπονοεῖτε", "Supondes"],
  ["ὑποστείληται", "Retraia-se"],
  ["ὑποστολῆς", "Retrocesso"],
  ["ὑποστρέφοντι", "Retornando"],
  ["ὑποστρέφων", "Retornando"],
  ["ὑποστρέψαντι", "Tendo-retornado"],

  // --- ὑποτ- palavras (sujeição) ---
  ["ὑποτάξαντα", "Tendo-sujeitado"],
  ["ὑποτάξαντι", "Ao-que-sujeitou"],
  ["ὑποτάξαντος", "Tendo-sujeitado"],
  ["ὑποτάσσεσθε", "Sujeitai-vos"],
  ["ὑποτάσσησθε", "Sujeiteis-vos"],
  ["ὑποτέτακται", "Tem-sido-sujeitado"],
  ["ὑποταγέντων", "Tendo-sido-sujeitados"],
  ["ὑποταγήσεται", "Será-sujeitado"],
  ["ὑποταγησόμεθα", "Seremos-sujeitados"],
  ["ὑποτασσέσθω", "Sujeite-se"],
  ["ὑποτασσέσθωσαν", "Sujeitem-se"],
  ["ὑποτασσομένας", "Sujeitando-se"],
  ["ὑποτασσόμενος", "Sujeitando-se"],
  ["ὑποτεταγμένα", "Tendo-sido-sujeitadas"],
  ["ὑποτιθέμενος", "Pondo-diante"],
  ["ὑποφέρει", "Suporta"],
  ["ὑποχωρῶν", "Retirando-se"],

  // --- ὑπωπ- palavras ---
  ["ὑπωπιάζω", "Golpeio-sob-o-olho"],
  ["ὑπωπιάζῃ", "Golpeie-sob-o-olho"],

  // --- ὑπό- palavras (com acento) ---
  ["ὑπό", "Sob"],
  ["ὑπόδησαι", "Calça"],
  ["ὑπόδικος", "Sob-juízo"],
  ["ὑπόκρισιν", "Hipocrisia"],
  ["ὑπόκρισις", "Hipocrisia"],
  ["ὑπόλειμμα", "Remanescente"],
  ["ὑπόμνησιν", "Lembrança"],
  ["ὑπόνοιαι", "Suspeitas"],
  ["ὑπόστασις", "Substância"],

  // --- ὑσσ- palavras (hissopo) ---
  ["ὑσσώπου", "Hissopo"],
  ["ὑσσώπῳ", "Hissopo"],

  // --- ὑστέρ- palavras (falta/atraso) ---
  ["ὑστέρημά", "Falta"],
  ["ὑστέρησα", "Faltei"],
  ["ὑστέρησιν", "Falta"],
  ["ὑστέροις", "Últimos"],
  ["ὑστερήματος", "Falta"],
  ["ὑστερήσαντος", "Tendo-faltado"],
  ["ὑστερήσατε", "Faltastes"],
  ["ὑστερήσεως", "Falta"],
  ["ὑστερεῖ", "Falta"],
  ["ὑστερηθεὶς", "Tendo-faltado"],
  ["ὑστερουμένῳ", "Faltando"],
  ["ὑστερούμεθα", "Faltamos"],
  ["ὑστερούμενοι", "Faltando"],
  ["ὑστεροῦνται", "São-privados"],
  ["ὑστερῶ", "Falto"],
  ["ὑστερῶν", "Faltando"],

  // --- ὑφ/ὑψ- palavras ---
  ["ὑφαίνει", "Tece"],
  ["ὑφαντὸς", "Tecido"],
  ["ὑψηλοφρονεῖν", "Ter-pensamentos-altivos"],
  ["ὑψηλοῖς", "Alturas"],
  ["ὑψηλοῦ", "Alto"],
  ["ὑψηλότερος", "Mais-alto"],
  ["ὑψωθεὶς", "Tendo-sido-exaltado"],
  ["ὑψωθῆτε", "Sejais-exaltados"],
  ["ὑψωθῶ", "Seja-exaltado"],
  ["ὑψώσητε", "Exalteis"],
  ["ὑψώσῃ", "Exalte"],

  // --- ὕ- palavras (espírito áspero) ---
  ["ὕβρεσιν", "Ultrajes"],
  ["ὕβρεως", "Ultraje"],
  ["ὕβριν", "Ultraje"],
  ["ὕβρισαν", "Ultrajaram"],
  ["ὕλην", "Matéria"],
  ["ὕμνουν", "Cantavam-hinos"],
  ["ὕπανδρος", "Sob-marido"],
  ["ὕπαρξιν", "Bens"],
  ["ὕστερος", "Último"],
  ["ὕψει", "Altura"],

  // --- Ὑ- maiúsculas ---
  ["Ὑπέστρεψαν", "Retornaram"],
  ["Ὑποκριταί", "Hipócritas"],
  ["Ὑπολαμβάνω", "Suponho"],
  ["Ὑπομίμνῃσκε", "Lembra"],
  ["Ὑπομνῆσαι", "Lembrar"],
  ["Ὑποπνεύσαντος", "Tendo-soprado-suavemente"],
  ["Ὑποστρέψω", "Retornarei"],
  ["Ὑποτάγητε", "Sujeitai-vos"],
  ["Ὑπόστρεφε", "Retorna"],
  ["Ὕστερον", "Depois"],
  ["Ὕψιστος", "Altíssimo"],
  ["Ὗς", "Porca"],

  // --- ὠδ- palavras (dores de parto) ---
  ["ὠδίνουσα", "Tendo-dores-de-parto"],
  ["ὠδίνω", "Tenho-dores-de-parto"],
  ["ὠδὶν", "Dor-de-parto"],
  ["ὠδῖνας", "Dores-de-parto"],

  // --- ὠν- palavras ---
  ["ὠνήσατο", "Comprou"],
  ["ὠνείδισεν", "Censurou"],
  ["ὠνομάσθη", "Foi-nomeado"],

  // --- ὠρ- palavras ---
  ["ὠργίσθη", "Irou-se"],
  ["ὠρυόμενος", "Rugindo"],
  ["ὠρχήσατο", "Dançou"],

  // --- ὠσ/ὠτ- palavras ---
  ["ὠσίν", "Ouvidos"],
  ["ὠτίου", "Orelha"],

  // --- ὠφ- palavras (proveito/benefício) ---
  ["ὠφέλεια", "Proveito"],
  ["ὠφέλησεν", "Aproveitou"],
  ["ὠφέλιμα", "Proveitosas"],
  ["ὠφέλιμός", "Proveitoso"],
  ["ὠφείλετε", "Devíeis"],
  ["ὠφείλομεν", "Devíamos"],
  ["ὠφελήθησαν", "Foram-aproveitados"],
  ["ὠφελήσει", "Aproveitará"],
  ["ὠφελήσω", "Aproveitarei"],
  ["ὠφελείας", "Proveito"],
  ["ὠφελεῖται", "É-aproveitado"],
  ["ὠφελεῖτε", "Aproveitais"],
  ["ὠφεληθήσεται", "Será-aproveitado"],
  ["ὠφεληθεῖσα", "Tendo-sido-aproveitada"],
  ["ὠφελοῦμαι", "Sou-aproveitado"],

  // --- ὡμ- palavras ---
  ["ὡμίλει", "Conversava"],
  ["ὡμίλουν", "Conversavam"],
  ["ὡμοιώθη", "Foi-comparado"],
  ["ὡμοιώθημεν", "Fomos-comparados"],
  ["ὡμολόγησας", "Confessaste"],
  ["ὡμολόγουν", "Confessavam"],

  // --- ὡρ- palavras ---
  ["ὡρισμένον", "Tendo-sido-determinado"],
  ["ὡρισμένος", "Tendo-sido-determinado"],
  ["ὡρισμένῃ", "Tendo-sido-determinada"],

  // --- ὡσπερεί ---
  ["ὡσπερεὶ", "Como-que"],

  // --- ὤ- palavras ---
  ["ὤρθριζεν", "Madrugava"],
  ["ὤφειλον", "Devia"],
  ["ὤφθην", "Fui-visto"],
  ["ὤφθησαν", "Foram-vistos"],

  // --- ὥ- palavras ---
  ["ὥρισαν", "Determinaram"],
  ["ὥρισεν", "Determinou"],
  ["ὥρμησάν", "Precipitaram-se"],
  ["ὥρμησαν", "Precipitaram-se"],

  // --- ὦτά ---
  ["ὦτά", "Orelhas"],

  // --- Ὡ- maiúsculas ---
  ["Ὡραίαν", "Formosa"],
  ["Ὡραίᾳ", "Formosa"],
  ["Ὡσηὲ", "Oseias"],
  ["Ὧδε", "Aqui"],

  // --- ᾐ- palavras (aumento com iota subscrito) ---
  ["ᾐτήκαμεν", "Pedimos"],
  ["ᾐτήσασθε", "Pedistes"],
  ["ᾐτήσατε", "Pedistes"],
  ["ᾐχμαλώτευσεν", "Levou-cativo"],
  ["ᾑρέτισα", "Escolhi"],
  ["ᾔτησας", "Pediste"],
  ["ᾖς", "Fosses"],

  // --- ᾠ- palavras ---
  ["ᾠκοδόμητο", "Tinha-sido-edificado"],
  ["ᾠκοδόμουν", "Edificavam"],
  ["ᾠόν", "Ovo"],

  // --- ῥ- palavras ---
  ["ῥάβδου", "Vara"],
  ["ῥάπισμα", "Bofetada"],
  ["ῥήγνυνται", "Rompem-se"],
  ["ῥήμασιν", "Palavras"],
  ["ῥήματί", "Palavra"],
  ["ῥήξωσιν", "Rompam"],
  ["ῥήσσει", "Convulsiona"],
  ["ῥήτορος", "Orador"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11aq (freq 1, parte 43/44) ===`);
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

console.log(`\n=== Resultado Lote 11aq ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

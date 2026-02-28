#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ac
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 29/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ac-${Date.now()}.sql`);

const translations = [
  // === Lote 11ac: freq 1, parte 29/44 (248 palavras) ===

  // --- ἀναστ- palavras (ressurreição / levantar / subverter) ---
  ["ἀναστάσεώς", "ressurreição"],
  ["ἀναστατοῦντες", "subvertendo"],
  ["ἀναστατώσαντες", "tendo-subvertido"],
  ["ἀναστατώσας", "tendo-subvertido"],
  ["ἀνασταυροῦντας", "crucificando-de-novo"],
  ["ἀναστενάξας", "tendo-gemido-profundamente"],
  ["ἀναστράφητε", "conduzi-vos"],
  ["ἀναστρέψαντες", "tendo-retornado"],
  ["ἀναστρέψω", "retornarei"],
  ["ἀναστρεφομένους", "conduzindo-se"],
  ["ἀναστρεφομένων", "conduzindo-se"],
  ["ἀναστροφαῖς", "condutas"],
  ["ἀναστὰν", "tendo-levantado"],
  ["ἀναστᾶσα", "tendo-levantado"],

  // --- ἀνατ- palavras (levantar / nascer / ordenar) ---
  ["ἀνατάξασθαι", "compor-em-ordem"],
  ["ἀνατέλλει", "faz-nascer"],
  ["ἀνατέλλουσαν", "nascendo"],
  ["ἀνατέταλκεν", "tem-nascido"],
  ["ἀνατείλῃ", "nasça"],
  ["ἀνατεθραμμένος", "tendo-sido-criado"],
  ["ἀνατολὴ", "oriente"],
  ["ἀνατολῆς", "oriente"],

  // --- ἀναφ- palavras (levar para cima / oferecer) ---
  ["ἀναφάναντες", "tendo-avistado"],
  ["ἀναφέρειν", "oferecer"],
  ["ἀναφέρωμεν", "ofereçamos"],
  ["ἀναφαίνεσθαι", "aparecer"],

  // --- ἀναχ- palavras (partir / retirar-se) ---
  ["ἀναχθέντες", "tendo-zarpado"],
  ["ἀναχωρήσαντες", "tendo-se-retirado"],
  ["ἀναχωρήσας", "tendo-se-retirado"],

  // --- ἀναψ- palavras ---
  ["ἀναψύξεως", "refrigério"],

  // --- ἀνδρ- palavras (homem / varão) ---
  ["ἀνδρίζεσθε", "portai-vos-como-homens"],
  ["ἀνδραποδισταῖς", "escravizadores"],
  ["ἀνδροφόνοις", "homicidas"],
  ["ἀνδρός", "varão"],
  ["ἀνδρῶν", "varões"],

  // --- ἀνε- palavras (subir / clamar / buscar / etc.) ---
  ["ἀνείλατε", "matastes"],
  ["ἀνείλατο", "tomou"],
  ["ἀνείχεσθέ", "suportáveis"],
  ["ἀνεβαίνομεν", "subíamos"],
  ["ἀνεβόησεν", "clamou"],
  ["ἀνεζήτουν", "buscavam"],
  ["ἀνεθάλετε", "reverdecestes"],
  ["ἀνεθέμην", "expus"],
  ["ἀνεθεματίσαμεν", "amaldiçoamo-nos-com-maldição"],
  ["ἀνεθρέψατο", "criou"],
  ["ἀνεκδιηγήτῳ", "inexprimível"],
  ["ἀνεκλαλήτῳ", "indizível"],
  ["ἀνελάβετε", "tomastes"],
  ["ἀνελεήμονας", "sem-misericórdia"],
  ["ἀνελεῖ", "matará"],
  ["ἀνεμιζομένῳ", "sendo-agitado-pelo-vento"],
  ["ἀνεμνήσθη", "lembrou-se"],
  ["ἀνενέγκαι", "oferecer"],
  ["ἀνενεγκεῖν", "oferecer"],
  ["ἀνεξίκακον", "paciente"],
  ["ἀνεξεραύνητα", "inescrutáveis"],
  ["ἀνεξιχνίαστοι", "inescrutáveis"],
  ["ἀνεξιχνίαστον", "inescrutável"],
  ["ἀνεπίλημπτοι", "irrepreensíveis"],
  ["ἀνεπαίσχυντον", "que-não-se-envergonha"],
  ["ἀνεπλήρωσαν", "supriram"],
  ["ἀνεσπάσθη", "foi-arrancado"],
  ["ἀνεστράφημέν", "conduzimo-nos"],
  ["ἀνεστράφημεν", "conduzimo-nos"],
  ["ἀνεσχόμην", "suportei"],
  ["ἀνετάζειν", "interrogar"],
  ["ἀνετάζεσθαι", "ser-interrogado"],
  ["ἀνετράφη", "foi-criado"],
  ["ἀνευθέτου", "inconveniente"],
  ["ἀνευρόντες", "tendo-encontrado"],
  ["ἀνεφέρετο", "era-levado-para-cima"],
  ["ἀνεφώνησεν", "exclamou"],
  ["ἀνεχόμεθα", "suportamos"],
  ["ἀνεχώρησαν", "retiraram-se"],
  ["ἀνεψιὸς", "primo"],
  ["ἀνεῖλαν", "mataram"],
  ["ἀνεῖλες", "mataste"],
  ["ἀνεῦραν", "encontraram"],
  ["ἀνεῳγμένας", "tendo-sido-abertas"],
  ["ἀνεῳγμένης", "tendo-sido-aberta"],
  ["ἀνεῳγμένον", "tendo-sido-aberto"],
  ["ἀνεῳγμένος", "tendo-sido-aberto"],
  ["ἀνεῳγμένων", "tendo-sido-abertas"],
  ["ἀνεῳγότα", "tendo-sido-abertos"],
  ["ἀνεῳχθῆναι", "ser-aberto"],
  ["ἀνεῴχθη", "foi-aberto"],
  ["ἀνεῴχθησαν", "foram-abertos"],

  // --- ἀνθ- palavras (resistir / humano / procônsul) ---
  ["ἀνθίστανται", "resistem"],
  ["ἀνθίστατο", "resistia"],
  ["ἀνθεστηκότες", "tendo-resistido"],
  ["ἀνθρωπίνων", "humanas"],
  ["ἀνθρώπινον", "humano"],
  ["ἀνθρώπινος", "humano"],
  ["ἀνθυπάτου", "procônsul"],
  ["ἀνθυπάτῳ", "procônsul"],
  ["ἀνθωμολογεῖτο", "dava-graças"],
  ["ἀνθύπατοί", "procônsules"],
  ["ἀνθύπατον", "procônsul"],
  ["ἀνθύπατος", "procônsul"],

  // --- ἀνι- palavras ---
  ["ἀνιέντες", "cessando"],
  ["ἀνιστάμενος", "levantando-se"],

  // --- ἀνο- palavras (insensato / abrir / iniquidade / etc.) ---
  ["ἀνοήτοις", "insensatos"],
  ["ἀνοήτους", "insensatos"],
  ["ἀνοίας", "insensatez"],
  ["ἀνοίγειν", "abrir"],
  ["ἀνοίξει", "abrirá"],
  ["ἀνοίξωσιν", "abram"],
  ["ἀνοιγῶσιν", "abram"],
  ["ἀνομία", "iniquidade"],
  ["ἀνομίαι", "iniquidades"],
  ["ἀνομιῶν", "iniquidades"],
  ["ἀνορθώθη", "foi-endireitada"],
  ["ἀνορθώσατε", "endireitai"],
  ["ἀνορθώσω", "endireitarei"],
  ["ἀνοσίοις", "profanos"],
  ["ἀνοχῆς", "paciência"],
  ["ἀνοχῇ", "paciência"],

  // --- ἀντ- palavras (contra / em lugar de / opor-se) ---
  ["ἀντέλεγον", "contradiziam"],
  ["ἀντέστη", "resistiu"],
  ["ἀντέστην", "resisti"],
  ["ἀντέστησαν", "resistiram"],
  ["ἀντέχεσθε", "apegai-vos"],
  ["ἀντίλυτρον", "resgate"],
  ["ἀντίτυπα", "antítipos"],
  ["ἀντίτυπον", "antítipo"],
  ["ἀντίχριστοι", "anticristos"],
  ["ἀνταγωνιζόμενοι", "lutando-contra"],
  ["ἀνταναπληρῶ", "completo-no-lugar"],
  ["ἀνταποδοῦναί", "retribuir"],
  ["ἀνταποκριθῆναι", "responder-de-volta"],
  ["ἀνταποκρινόμενος", "respondendo-de-volta"],
  ["ἀνταπόδομά", "retribuição"],
  ["ἀνταπόδομα", "retribuição"],
  ["ἀνταπόδοσιν", "retribuição"],
  ["ἀντελάβετο", "ajudou"],
  ["ἀντελοιδόρει", "injuriava-de-volta"],
  ["ἀντεχόμενον", "apegando-se"],
  ["ἀντιβάλλετε", "discutis"],
  ["ἀντιδίκῳ", "adversário"],
  ["ἀντιδιατιθεμένους", "opondo-se"],
  ["ἀντιθέσεις", "oposições"],
  ["ἀντικαλέσωσίν", "convidem-de-volta"],
  ["ἀντικατέστητε", "resististes"],
  ["ἀντικείμενος", "opondo-se"],
  ["ἀντικειμένων", "opondo-se"],
  ["ἀντικειμένῳ", "opondo-se"],
  ["ἀντιλέγει", "contradiz"],
  ["ἀντιλέγεται", "é-contradito"],
  ["ἀντιλέγοντα", "contradizendo"],
  ["ἀντιλέγοντες", "contradizendo"],
  ["ἀντιλήμψεις", "socorros"],
  ["ἀντιλαμβάνεσθαι", "socorrer"],
  ["ἀντιλαμβανόμενοι", "socorrendo"],
  ["ἀντιλεγόμενον", "sendo-contradito"],
  ["ἀντιλεγόντων", "contradizendo"],
  ["ἀντιλογίαν", "contradição"],
  ["ἀντιλογίᾳ", "contradição"],
  ["ἀντιμετρηθήσεται", "será-medido-de-volta"],
  ["ἀντιπέρα", "do-lado-oposto"],
  ["ἀντιπίπτετε", "resistis"],
  ["ἀντιστρατευόμενον", "guerreando-contra"],
  ["ἀντιτασσομένων", "opondo-se"],
  ["ἀντιτασσόμενος", "opondo-se"],
  ["ἀντιχρίστου", "anticristo"],
  ["ἀντλεῖν", "tirar-água"],
  ["ἀντλῆσαι", "tirar-água"],
  ["ἀντοφθαλμεῖν", "enfrentar"],

  // --- ἀνυπ- palavras (sem hipocrisia / insubmisso) ---
  ["ἀνυποκρίτῳ", "sem-hipocrisia"],
  ["ἀνυποτάκτοις", "insubmissos"],
  ["ἀνυπόκριτον", "sem-hipocrisia"],
  ["ἀνυπότακτα", "insubmissas"],
  ["ἀνυπότακτοι", "insubmissos"],
  ["ἀνυπότακτον", "insubmisso"],

  // --- ἀνω- palavras ---
  ["ἀνωτερικὰ", "superiores"],
  ["ἀνωφελές", "inútil"],
  ["ἀνωφελεῖς", "inúteis"],

  // --- ἀνό- palavras ---
  ["ἀνόητοί", "insensatos"],
  ["ἀνόμους", "sem-lei"],
  ["ἀνόσιοι", "profanos"],

  // --- ἀνὰ / ἀνῃ- / ἀνῆ- / ἀνῶ- ---
  ["ἀνὰ", "cada"],
  ["ἀνῃρέθη", "foi-morto"],
  ["ἀνῆκον", "convindo"],
  ["ἀνῆλθεν", "subiu"],
  ["ἀνῶ", "deixarei"],

  // --- ἀξ- palavras (digno) ---
  ["ἀξιούσθωσαν", "sejam-considerados-dignos"],
  ["ἀξιοῦμεν", "consideramos-digno"],
  ["ἀξιωθήσεται", "será-considerado-digno"],
  ["ἀξιώσῃ", "considere-digno"],

  // --- ἀορ- palavras (invisível) ---
  ["ἀοράτου", "invisível"],
  ["ἀοράτῳ", "invisível"],

  // --- ἀπ- palavras ---
  ["ἀπ ̓", "de"],

  // --- ἀπάγ- / ἀπάτ- palavras ---
  ["ἀπάγγειλον", "anuncia"],
  ["ἀπάγετε", "conduzi"],
  ["ἀπάταις", "enganos"],
  ["ἀπάτωρ", "sem-pai"],

  // --- ἀπέ- palavras (diversos aoristas e imperfeitos) ---
  ["ἀπέβησαν", "desembarcaram"],
  ["ἀπέβλεπεν", "olhava"],
  ["ἀπέδειξεν", "demonstrou"],
  ["ἀπέδετο", "depositou"],
  ["ἀπέδοντο", "venderam"],
  ["ἀπέδοσθε", "vendestes"],
  ["ἀπέδωκεν", "devolveu"],
  ["ἀπέθεντο", "depuseram"],
  ["ἀπέθετο", "depôs"],
  ["ἀπέθνῃσκεν", "morria"],
  ["ἀπέκοψαν", "cortaram"],
  ["ἀπέκρυψας", "escondeste"],
  ["ἀπέλαβεν", "recebeu-de-volta"],
  ["ἀπέλαβες", "recebeste-de-volta"],
  ["ἀπέλθωσιν", "partam"],
  ["ἀπέλθῃ", "parta"],
  ["ἀπέλιπόν", "deixei"],
  ["ἀπέλυεν", "soltava"],
  ["ἀπέλυσε", "soltou"],
  ["ἀπέπεσαν", "caíram"],
  ["ἀπέρχεσθαι", "partir"],
  ["ἀπέσπασεν", "arrancou"],
  ["ἀπέστησαν", "afastaram-se"],
  ["ἀπέστησεν", "afastou"],
  ["ἀπέχεσθε", "abstende-vos"],
  ["ἀπέχετε", "tendes-recebido"],
  ["ἀπέχουσαν", "distando"],
  ["ἀπέχω", "tenho-recebido"],
  ["ἀπέχῃς", "te-abstenhas"],

  // --- ἀπή- palavras ---
  ["ἀπήγγελλον", "anunciavam"],
  ["ἀπήγξατο", "enforcou-se"],
  ["ἀπήλασεν", "expulsou"],
  ["ἀπήνεγκαν", "levaram"],
  ["ἀπήντησαν", "encontraram"],

  // --- ἀπα- palavras ---
  ["ἀπαίτει", "exige-de-volta"],
  ["ἀπαγαγὼν", "tendo-conduzido"],
  ["ἀπαγγέλλει", "anuncia"],
  ["ἀπαγγέλλοντας", "anunciando"],
  ["ἀπαγγέλλοντες", "anunciando"],
  ["ἀπαγγέλλουσιν", "anunciam"],
  ["ἀπαγγέλλων", "anunciando"],
  ["ἀπαγγείλατέ", "anunciai"],
  ["ἀπαγγελεῖ", "anunciará"],
  ["ἀπαγγελῶ", "anunciarei"],
  ["ἀπαγγεῖλαι", "anunciar"],
  ["ἀπαγομένους", "sendo-conduzidos"],
  ["ἀπαγόμενοι", "sendo-conduzidos"],
  ["ἀπαιδεύτους", "sem-instrução"],
  ["ἀπαιτοῦσιν", "exigem-de-volta"],
  ["ἀπαλλάξῃ", "liberte"],
  ["ἀπαλλάσσεσθαι", "ser-libertado"],
  ["ἀπαντήσει", "encontrará"],
  ["ἀπαράβατον", "intransferível"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ac (freq 1, parte 29/44) ===`);
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

console.log(`\n=== Resultado Lote 11ac ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

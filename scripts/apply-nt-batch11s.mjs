#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11s
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 19/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11s-${Date.now()}.sql`);

const translations = [
  // === 248 palavras gregas freq 1 — parte 19/44 (πε-πρά) ===

  // --- πεσ- a πεφ- (particípios perfeitos e aoristos) ---
  ["πεσόντες", "tendo-caído"],
  ["πετρῶδες", "pedregoso"],
  ["πεφίμωσο", "sê-amordaçado"],
  ["πεφανερώμεθα", "temos-sido-manifestados"],
  ["πεφιλήκατε", "tendes-amado"],
  ["πεφορτισμένοι", "tendo-sido-carregados"],
  ["πεφυσιωμένοι", "tendo-sido-inchados"],
  ["πεφυσιωμένων", "tendo-sido-inchados"],
  ["πεφυτευμένην", "tendo-sido-plantada"],
  ["πεφωτισμένους", "tendo-sido-iluminados"],

  // --- πηγ- a πικ- ---
  ["πηγαὶ", "fontes"],
  ["πηγῇ", "fonte"],
  ["πηδαλίου", "leme"],
  ["πηδαλίων", "lemes"],
  ["πηλίκοις", "quão-grandes"],
  ["πηλίκος", "quão-grande"],
  ["πηλοῦ", "barro"],
  ["πηχῶν", "côvados"],
  ["πιθανολογίᾳ", "discurso-persuasivo"],
  ["πικρία", "amargura"],
  ["πικραίνεσθε", "amargurai-vos"],
  ["πικρόν", "amargo"],
  ["πικρὸν", "amargo"],

  // --- πιν- a πιπ- ---
  ["πινακίδιον", "tabuinha"],
  ["πιοῦσα", "tendo-bebido"],
  ["πιπρασκομένων", "sendo-vendidos"],

  // --- πιστ- (formas de πιστεύω e πιστός) ---
  ["πιστευθῆναι", "ser-crido"],
  ["πιστευσάντων", "tendo-crido"],
  ["πιστεύεται", "é-crido"],
  ["πιστεύοντα", "crendo"],
  ["πιστεύσαντας", "tendo-crido"],
  ["πιστεύσασα", "tendo-crido"],
  ["πιστεύσει", "crerá"],
  ["πιστεύσομεν", "creremos"],
  ["πιστεύσουσιν", "crerão"],
  ["πιστεύσωμέν", "creiamos"],
  ["πιστόν", "fiel"],
  ["πιστὰς", "fiéis"],
  ["πιστὴ", "fiel"],
  ["πιστὴν", "fiel"],
  ["πιστῆς", "fiel"],

  // --- πιο- a πιω- ---
  ["πιότητος", "gordura"],
  ["πιὼν", "tendo-bebido"],

  // --- πλά- ---
  ["πλάκες", "tábuas"],
  ["πλάνη", "engano"],
  ["πλάνοις", "enganadores"],
  ["πλάσαντι", "tendo-formado"],
  ["πλάσμα", "criatura-formada"],
  ["πλέγμασιν", "tranças"],
  ["πλέοντας", "navegando"],

  // --- πλη- (πλῆθος) ---
  ["πλήθει", "multidão"],
  ["πλήθη", "multidões"],
  ["πλήσας", "tendo-enchido"],

  // --- πλαν- (formas de πλανάω) ---
  ["πλανάτω", "engane"],
  ["πλανήσῃ", "engane"],
  ["πλανηθῆτε", "sejais-enganados"],
  ["πλανωμένοις", "sendo-enganados"],
  ["πλανώμενον", "sendo-enganado"],
  ["πλανώντων", "enganando"],
  ["πλανῆσαι", "enganar"],
  ["πλανῆται", "seja-enganado"],
  ["πλανῶμεν", "enganemos"],
  ["πλανῶνται", "sejam-enganados"],
  ["πλανῶντες", "enganando"],

  // --- πλασ- a πλατ- ---
  ["πλαστοῖς", "fabricadas"],
  ["πλατειῶν", "praças"],
  ["πλατεῖα", "praça"],
  ["πλατύνθητε", "alargai-vos"],
  ["πλατύνουσιν", "alargam"],

  // --- πλει- ---
  ["πλείονές", "mais-numerosos"],
  ["πλείονος", "maior"],
  ["πλείω", "mais"],
  ["πλεονάζει", "abunda"],
  ["πλεονάσαι", "abundar"],
  ["πλεονάσασα", "tendo-abundado"],

  // --- πλεον- (πλεονέκτης, πλεονεξία) ---
  ["πλεονέκται", "avarentos"],
  ["πλεονέκταις", "avarentos"],
  ["πλεονεκτεῖν", "tirar-vantagem"],
  ["πλεονεκτηθῶμεν", "sejamos-explorados"],
  ["πλεονεξία", "avareza"],
  ["πλεονεξίαι", "avarezes"],

  // --- πλευ- a πλει- ---
  ["πλευράν", "lado"],
  ["πλεόντων", "navegando"],
  ["πλεῖν", "navegar"],
  ["πλεῖσται", "muitíssimas"],
  ["πλεῖστον", "muitíssimo"],

  // --- πληγ- ---
  ["πληγὰς", "golpes"],
  ["πληγῶν", "golpes"],

  // --- πληθ- ---
  ["πληθυνεῖ", "multiplicará"],
  ["πληθυνθῆναι", "ser-multiplicados"],
  ["πληθυνόντων", "multiplicando-se"],
  ["πληθυνῶ", "multiplicarei"],
  ["πληθύνων", "multiplicando"],
  ["πλημμύρης", "enchente"],

  // --- πληρ- (formas de πληρόω e πληροφορέω) ---
  ["πληρουμένου", "sendo-cumprido"],
  ["πληροφορίαν", "plena-convicção"],
  ["πληροφορίας", "plena-convicção"],
  ["πληροφορείσθω", "esteja-plenamente-convicto"],
  ["πληροφορηθεὶς", "tendo-sido-plenamente-convicto"],
  ["πληροφορηθῇ", "seja-plenamente-convicto"],
  ["πληροφόρησον", "cumpre-plenamente"],
  ["πληρούμενον", "sendo-preenchido"],
  ["πληροῖς", "preenchesses"],
  ["πληροῦν", "preencher"],
  ["πληροῦσθε", "sede-preenchidos"],
  ["πληρωθέντων", "tendo-sido-cumpridos"],
  ["πληρωθήσεται", "será-cumprido"],
  ["πληρωθήσονται", "serão-cumpridos"],
  ["πληρωθείσης", "tendo-sido-cumprida"],
  ["πληρωθῶ", "seja-preenchido"],
  ["πληρώματι", "plenitude"],
  ["πληρώσαι", "cumprir"],
  ["πληρώσαντες", "tendo-cumprido"],
  ["πληρώσατέ", "enchei"],
  ["πληρώσατε", "enchei"],
  ["πληρώσει", "cumprirá"],
  ["πληρώσεις", "cumprirás"],

  // --- πλησ- ---
  ["πλησθήσεται", "será-enchido"],
  ["πλησθῆναι", "ser-enchido"],
  ["πλησθῇς", "sejas-enchido"],
  ["πλησμονὴν", "saciedade"],

  // --- πλοι- a πλου- ---
  ["πλοιαρίῳ", "barquinho"],
  ["πλουτήσητε", "enriqueçais"],
  ["πλουτίζοντες", "enriquecendo"],
  ["πλουτιζόμενοι", "sendo-enriquecidos"],
  ["πλουτοῦντας", "enriquecendo"],
  ["πλούσιοι", "ricos"],
  ["πλοὸς", "navegação"],

  // --- πνε- (πνέω, πνεῦμα) ---
  ["πνέοντα", "soprando"],
  ["πνέοντος", "soprando"],
  ["πνεούσῃ", "soprando"],
  ["πνευματικά", "espirituais"],
  ["πνευματικοὶ", "espirituais"],
  ["πνευματικὰς", "espirituais"],
  ["πνευματικῆς", "espiritual"],
  ["πνευματικῶν", "espirituais"],
  ["πνευματικῶς", "espiritualmente"],
  ["πνεύματός", "espírito"],
  ["πνεῖ", "sopra"],
  ["πνικτοῦ", "sufocado"],
  ["πνικτὸν", "sufocado"],
  ["πνικτῶν", "sufocados"],
  ["πνοὴν", "fôlego"],
  ["πνοῆς", "fôlego"],

  // --- ποί- a ποιη- ---
  ["ποίημα", "obra"],
  ["ποίησον", "faze"],
  ["ποίησόν", "faze"],
  ["ποίμνη", "rebanho"],
  ["ποίου", "qual"],
  ["ποδός", "pé"],
  ["ποιήμασιν", "obras"],
  ["ποιήσαιεν", "fizessem"],
  ["ποιήσασαν", "tendo-feito"],
  ["ποιήσασθαι", "fazer"],
  ["ποιήσητε", "façais"],
  ["ποιήσων", "havendo-de-fazer"],
  ["ποιήσῃς", "faças"],
  ["ποιεῖσθε", "fazei"],
  ["ποιεῖται", "faz"],
  ["ποιησάμενοι", "tendo-feito"],
  ["ποιησάτω", "faça"],
  ["ποιησόμεθα", "faremos"],
  ["ποιητής", "fazedor"],
  ["ποιητῶν", "fazedores"],

  // --- ποικ- a ποιμ- ---
  ["ποικίλης", "variada"],
  ["ποιμάνατε", "apascentai"],
  ["ποιμένας", "pastores"],
  ["ποιμένων", "pastores"],
  ["ποιμαίνει", "apascenta"],
  ["ποιμαίνειν", "apascentar"],
  ["ποιμαίνοντα", "apascentando"],
  ["ποιμαίνοντες", "apascentando"],
  ["ποιμνίῳ", "rebanho"],

  // --- ποιου- ---
  ["ποιούμενοι", "fazendo"],
  ["ποιοῦντα", "fazendo"],
  ["ποιοῦνται", "fazem"],
  ["ποιοῦντος", "fazendo"],

  // --- πολ- (πόλεμος, πολίτης) ---
  ["πολέμῳ", "guerra"],
  ["πολίτευμα", "cidadania"],
  ["πολίτην", "cidadão"],
  ["πολίτης", "cidadão"],
  ["πολεμεῖτε", "guerreais"],
  ["πολιτείαν", "cidadania"],
  ["πολιτείας", "cidadania"],
  ["πολιτεύεσθε", "vivei-como-cidadãos"],
  ["πολιτῶν", "cidadãos"],

  // --- πολλ- ---
  ["πολλάς", "muitas"],
  ["πολλή", "muita"],
  ["πολλοῦ", "muito"],
  ["πολλὴ", "muita"],

  // --- πολυ- ---
  ["πολυλογίᾳ", "muitas-palavras"],
  ["πολυποίκιλος", "multiforme"],
  ["πολυτίμου", "muito-precioso"],
  ["πολυτελές", "muito-custoso"],
  ["πολυτελεῖ", "muito-custoso"],
  ["πολυτελοῦς", "muito-custoso"],
  ["πολυτιμότερον", "muito-mais-precioso"],
  ["πολυτρόπως", "de-muitas-maneiras"],
  ["πολύν", "muito"],
  ["πολύσπλαγχνός", "muito-compassivo"],
  ["πολύτιμον", "muito-precioso"],
  ["πολῖται", "cidadãos"],

  // --- πονηρ- ---
  ["πονηρέ", "mau"],
  ["πονηρίαι", "maldades"],
  ["πονηρίαν", "maldade"],
  ["πονηρίᾳ", "maldade"],
  ["πονηριῶν", "maldades"],
  ["πονηροί", "maus"],
  ["πονηρὲ", "mau"],
  ["πονηρᾶς", "má"],

  // --- πορει- a πορευ- ---
  ["πορείαις", "jornadas"],
  ["πορείαν", "jornada"],
  ["πορευθέντι", "tendo-ido"],
  ["πορευθεῖσα", "tendo-ido"],
  ["πορευθεῖσαι", "tendo-ido"],
  ["πορευθῆτε", "ide"],
  ["πορευθῇ", "vá"],
  ["πορευθῶσιν", "vão"],
  ["πορευομένη", "indo"],
  ["πορευομένοις", "indo"],
  ["πορευομένῳ", "indo"],
  ["πορευσόμεθα", "iremos"],
  ["πορεύθητι", "vai"],
  ["πορεύσεται", "irá"],
  ["πορεύσονται", "irão"],
  ["πορεύσῃ", "vás"],

  // --- πορθ- a πορφ- ---
  ["πορθήσας", "tendo-devastado"],
  ["πορισμὸν", "ganho"],
  ["πορισμὸς", "ganho"],
  ["πορνεύωμεν", "forniquemos"],
  ["πορνεύων", "fornicando"],
  ["πορνῶν", "prostitutas"],
  ["πορρώτερον", "mais-adiante"],
  ["πορφυρόπωλις", "vendedora-de-púrpura"],

  // --- ποτ- ---
  ["ποτήριόν", "cálice"],
  ["ποτίζει", "dá-de-beber"],
  ["ποταμός", "rio"],
  ["ποταμὸς", "rio"],
  ["ποταπαὶ", "que-espécie-de"],
  ["ποταποὶ", "que-espécie-de"],
  ["ποταποὺς", "que-espécie-de"],
  ["ποταπὴ", "que-espécie-de"],
  ["ποταπὴν", "que-espécie-de"],
  ["ποταπὸς", "que-espécie-de"],
  ["ποτηρίων", "cálices"],

  // --- που- a πρα- ---
  ["πού", "onde"],
  ["πούς", "pé"],
  ["πράγματος", "assunto"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11s (freq 1, parte 19/44) ===`);
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

console.log(`\n=== Resultado Lote 11s ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11y
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 25/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11y-${Date.now()}.sql`);

const translations = [
  // === Lote 11y — freq 1, parte 25/44 (248 palavras) ===

  // --- τετρ- palavras ---
  ["τετραδίοις", "quaterniões"],
  ["τετρακισχιλίων", "quatro-mil"],
  ["τετρακοσίοις", "quatrocentos"],
  ["τετρακοσίων", "quatrocentos"],
  ["τετραπλοῦν", "quádruplo"],
  ["τετραπόδων", "quadrúpedes"],
  ["τετραυματισμένους", "tendo-sido-feridos"],
  ["τετραχηλισμένα", "tendo-sido-desnudados"],
  ["τετυφωμένοι", "tendo-sido-enfatuados"],
  ["τετύφωται", "tem-sido-enfatuado"],
  ["τεφρώσας", "tendo-reduzido-a-cinzas"],
  ["τεχθεὶς", "tendo-sido-gerado"],
  ["τεχνίταις", "artífices"],
  ["τεχνίτης", "artífice"],
  ["τεχνῖται", "artífices"],

  // --- τηλ- palavras ---
  ["τηλαυγῶς", "claramente"],
  ["τηλικαύτης", "tão-grande"],
  ["τηλικαῦτα", "tão-grandes"],
  ["τηλικούτου", "tão-grande"],

  // --- τηρ- palavras ---
  ["τηρήσαντας", "tendo-guardado"],
  ["τηρήσατε", "guardai"],
  ["τηρήσετε", "guardareis"],
  ["τηρήσουσιν", "guardarão"],
  ["τηρήσῃς", "guardes"],
  ["τηρεῖ", "guarda"],
  ["τηρεῖτε", "guardais"],
  ["τηρηθείη", "fosse-guardado"],
  ["τηρηθῆναι", "ser-guardado"],
  ["τηρουμένους", "sendo-guardados"],
  ["τηρούμενοι", "sendo-guardados"],
  ["τηροῦμεν", "guardamos"],
  ["τηρῆσαί", "guardar"],
  ["τηρῇ", "guarde"],
  ["τηρῶ", "guardo"],
  ["τηρῶν", "guardando"],

  // --- τιθ- palavras ---
  ["τιθέασιν", "põem"],
  ["τιθέντες", "pondo"],
  ["τιθέτω", "ponha"],
  ["τιθεὶς", "pondo"],

  // --- τιμ- palavras ---
  ["τιμήσατε", "honrai"],
  ["τιμίαν", "preciosa"],
  ["τιμίους", "preciosos"],
  ["τιμαῖς", "honras"],
  ["τιμωρίας", "castigo"],
  ["τιμωρηθῶσιν", "sejam-castigados"],
  ["τιμωρῶν", "castigando"],
  ["τιμᾶτε", "honrais"],
  ["τιμῶ", "honro"],
  ["τιμῶν", "honrando"],

  // --- τιν- / τισ- palavras ---
  ["τινά", "algum"],
  ["τισίν", "alguns"],
  ["τισιν", "alguns"],

  // --- τοι- palavras ---
  ["τοιαύτας", "tais"],
  ["τοιαῦται", "tais"],
  ["τοιγαροῦν", "portanto"],
  ["τοιούτου", "tal"],
  ["τοιοῦτο", "tal"],
  ["τοιᾶσδε", "tais"],

  // --- τολμ- palavras ---
  ["τολμήσας", "tendo-ousado"],
  ["τολμήσω", "ousarei"],
  ["τολμηροτέρως", "mais-ousadamente"],
  ["τολμηταὶ", "ousados"],
  ["τολμᾶν", "ousar"],
  ["τολμῆσαι", "ousar"],
  ["τολμῶ", "ouso"],
  ["τολμῶμεν", "ousamos"],

  // --- τομ- / τοπ- / τοσ- palavras ---
  ["τομώτερος", "mais-cortante"],
  ["τοπάζιον", "topázio"],
  ["τοσούτους", "tantos"],
  ["τοσούτων", "tantos"],
  ["τοσοῦτο", "tanto"],
  ["τοσοῦτοι", "tantos"],

  // --- τοῦ- / τοῖ- / τοὔ- palavras ---
  ["τοὔνομα", "o-nome"],
  ["τοῖχε", "parede"],
  ["τοῦτό", "isto"],

  // --- τρέ- palavras ---
  ["τρέμουσιν", "tremendo"],
  ["τρέφεσθαι", "ser-alimentado"],
  ["τρέχει", "corre"],
  ["τρέχετε", "correis"],
  ["τρέχοντες", "correndo"],
  ["τρέχοντος", "correndo"],
  ["τρέχουσιν", "correm"],
  ["τρέχωμεν", "corramos"],
  ["τρέχῃ", "corra"],

  // --- τρί- palavras ---
  ["τρίζει", "range"],
  ["τρίμηνον", "três-meses"],
  ["τρίτη", "terceira"],
  ["τρίτην", "terceira"],
  ["τρίχα", "cabelo"],

  // --- τραπ- / τραυ- / τραχ- palavras ---
  ["τραπέζαις", "mesas"],
  ["τραπεζείταις", "banqueiros"],
  ["τραυματίσαντες", "tendo-ferido"],
  ["τραχεῖαι", "ásperas"],
  ["τραχεῖς", "ásperos"],
  ["τραύματα", "feridas"],

  // --- τριβ- / τρισ- palavras ---
  ["τριβόλους", "abrolhos"],
  ["τριβόλων", "abrolhos"],
  ["τριετίαν", "três-anos"],
  ["τρισίν", "três"],
  ["τριστέγου", "terceiro-andar"],
  ["τρισχίλιαι", "três-mil"],

  // --- τροπ- / τροφ- / τροχ- palavras ---
  ["τροπῆς", "variação"],
  ["τροφή", "alimento"],
  ["τροφὰς", "alimentos"],
  ["τροφὴ", "alimento"],
  ["τροφὸς", "nutriz"],
  ["τροχιὰς", "veredas"],
  ["τροχὸν", "roda"],

  // --- τρυ- palavras ---
  ["τρυβλίῳ", "prato"],
  ["τρυγόνων", "rolas"],
  ["τρυγῶσιν", "vindimem"],
  ["τρυμαλιᾶς", "fundo-de-agulha"],
  ["τρυφήν", "luxúria"],
  ["τρυφῇ", "luxúria"],

  // --- τρό- / τρύ- / τρώ- palavras ---
  ["τρόμος", "tremor"],
  ["τρόμῳ", "tremor"],
  ["τρόπος", "modo"],
  ["τρύβλιον", "prato"],
  ["τρώγοντες", "mastigando"],

  // --- τυ- palavras ---
  ["τυγχάνοντες", "obtendo"],
  ["τυπικῶς", "tipicamente"],
  ["τυφλέ", "cego"],
  ["τυφλόν", "cego"],
  ["τυφλῷ", "cego"],
  ["τυφωθεὶς", "tendo-sido-enfatuado"],
  ["τυφωνικὸς", "tufônico"],
  ["τυφόμενον", "fumegando"],
  ["τυχούσας", "tendo-obtido"],
  ["τυχοῦσαν", "tendo-obtido"],
  ["τυχὸν", "por-acaso"],
  ["τυχὼν", "tendo-obtido"],

  // --- τύ- palavras ---
  ["τύπους", "modelos"],
  ["τύπτεσθαι", "ser-golpeado"],
  ["τύπτοντί", "golpeando"],

  // --- υἱ- palavras ---
  ["υἱοθεσία", "adoção-como-filhos"],
  ["υἱοθεσίας", "adoção-como-filhos"],
  ["υἱούς", "filhos"],
  ["υἱῷ", "filho"],

  // --- φά- palavras ---
  ["φάγεσαι", "comerás"],
  ["φάγετε", "comei"],
  ["φάγοι", "comesse"],
  ["φάγῃς", "comas"],
  ["φάντασμά", "fantasma"],
  ["φάραγξ", "vale"],
  ["φάσις", "denúncia"],
  ["φάτνης", "manjedoura"],

  // --- φέ- palavras ---
  ["φέρεσθαι", "ser-levado"],
  ["φέρουσαι", "levando"],
  ["φέρουσαν", "levando"],
  ["φέρῃ", "leve"],

  // --- φί- palavras ---
  ["φίλας", "amigas"],
  ["φίλαυτοι", "amantes-de-si-mesmos"],
  ["φίλημά", "beijo"],
  ["φίλοις", "amigos"],

  // --- φαί- / φαιν- palavras ---
  ["φαίνονται", "aparecem"],
  ["φαίνοντι", "aparecendo"],
  ["φαίνων", "brilhando"],
  ["φαινομένη", "aparecendo"],
  ["φαινομένου", "aparecendo"],
  ["φαινομένων", "aparecendo"],

  // --- φανέ- / φανή- / φανερ- palavras ---
  ["φανέρωσις", "manifestação"],
  ["φανέρωσον", "manifesta"],
  ["φανήσεται", "aparecerá"],
  ["φανερά", "manifesta"],
  ["φανερούμενοι", "sendo-manifestados"],
  ["φανερούμενον", "sendo-manifestado"],
  ["φανεροὶ", "manifestos"],
  ["φανεροὺς", "manifestos"],
  ["φανεροῦντι", "manifestando"],
  ["φανεροῦται", "é-manifestado"],
  ["φανερωθήσεσθε", "sereis-manifestados"],
  ["φανερωθεῖσαν", "tendo-sido-manifestada"],
  ["φανερωθῶσιν", "sejam-manifestados"],
  ["φανερώσαντες", "tendo-manifestado"],
  ["φανερώσω", "manifestarei"],

  // --- φανε- / φαντ- / φαν- palavras ---
  ["φανεῖται", "aparecerá"],
  ["φανταζόμενον", "sendo-apresentado"],
  ["φαντασίας", "pompa"],
  ["φανῇ", "apareça"],
  ["φανῇς", "apareças"],
  ["φανῶμεν", "apareçamos"],
  ["φανῶν", "lanternas"],

  // --- φαρμ- / φασ- palavras ---
  ["φαρμακεία", "feitiçaria"],
  ["φασίν", "dizem"],

  // --- φεί- / φειδ- / φελ- palavras ---
  ["φείσεται", "poupará"],
  ["φείσομαι", "pouparei"],
  ["φειδόμενοι", "poupando"],
  ["φειδόμενος", "poupando"],
  ["φελόνην", "capa"],

  // --- φερ- palavras ---
  ["φερομένην", "sendo-levada"],
  ["φερομένης", "sendo-levada"],
  ["φερόμενοι", "sendo-levados"],
  ["φερώμεθα", "sejamos-levados"],

  // --- φεύ- palavras ---
  ["φεύξεται", "fugirá"],
  ["φεύξονται", "fugirão"],

  // --- φθά- / φθέ- / φθαρ- palavras ---
  ["φθάσωμεν", "precedamos"],
  ["φθέγγεσθαι", "falar"],
  ["φθαρήσονται", "serão-corrompidos"],
  ["φθαρτοῖς", "corruptíveis"],
  ["φθαρτοῦ", "corruptível"],
  ["φθαρτῆς", "corruptível"],
  ["φθαρῇ", "seja-corrompido"],

  // --- φθεί- / φθεγ- / φθειρ- / φθερ- palavras ---
  ["φθείρει", "corrompe"],
  ["φθείρονται", "são-corrompidos"],
  ["φθείρουσιν", "corrompem"],
  ["φθεγγόμενοι", "falando"],
  ["φθεγξάμενον", "tendo-falado"],
  ["φθειρόμενον", "sendo-corrompido"],
  ["φθερεῖ", "corromperá"],

  // --- φθιν- / φθον- / φθορ- palavras ---
  ["φθινοπωρινὰ", "outonais"],
  ["φθονοῦντες", "invejando"],
  ["φθορὰ", "corrupção"],
  ["φθορὰν", "corrupção"],

  // --- φθόγ- / φθόν- palavras ---
  ["φθόγγοις", "sons"],
  ["φθόγγος", "som"],
  ["φθόνοι", "invejas"],
  ["φθόνος", "inveja"],
  ["φθόνου", "inveja"],
  ["φθόνους", "invejas"],
  ["φθόνῳ", "inveja"],

  // --- φιλά- / φιλή- / φιλί- palavras ---
  ["φιλάγαθον", "amante-do-bem"],
  ["φιλάδελφοι", "amantes-dos-irmãos"],
  ["φιλάνδρους", "amantes-dos-maridos"],
  ["φιλήδονοι", "amantes-do-prazer"],
  ["φιλία", "amizade"],

  // --- φιλαδ- / φιλαν- / φιλαργ- palavras ---
  ["φιλαδελφία", "amor-fraternal"],
  ["φιλαδελφίας", "amor-fraternal"],
  ["φιλανθρωπία", "filantropia"],
  ["φιλανθρωπίαν", "filantropia"],
  ["φιλανθρώπως", "filantropicamente"],
  ["φιλαργυρία", "amor-ao-dinheiro"],

  // --- φιλον- / φιλοξ- / φιλοπ- / φιλοσ- / φιλοτ- palavras ---
  ["φιλονεικία", "contenda"],
  ["φιλοξενίαν", "hospitalidade"],
  ["φιλοξενίας", "hospitalidade"],
  ["φιλοπρωτεύων", "amando-ser-o-primeiro"],
  ["φιλοσοφίας", "filosofia"],
  ["φιλοσόφων", "filósofos"],
  ["φιλοτέκνους", "amantes-dos-filhos"],
  ["φιλοτιμεῖσθαι", "ambicionar"],
  ["φιλοτιμούμεθα", "ambicionamos"],
  ["φιλοτιμούμενον", "ambicionando"],
  ["φιλοφρόνως", "cordialmente"],

  // --- φιλού- / φιλοῦ- / φιλό- palavras ---
  ["φιλούντων", "amando"],
  ["φιλοῦντας", "amando"],
  ["φιλόθεοι", "amantes-de-Theos"],
  ["φιλόνεικος", "contencioso"],
  ["φιλόξενοι", "hospitaleiros"],
  ["φιλόστοργοι", "afetuosos"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11y (freq 1, parte 25/44) ===`);
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

console.log(`\n=== Resultado Lote 11y ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

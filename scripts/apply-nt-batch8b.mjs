#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 8b
 * Aplica traduções literais para palavras gregas freq 4 no NT (parte 2/3)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch8b-${Date.now()}.sql`);

const translations = [
  ['λήμψονται', 'receberão'],
  ['λίθοι', 'pedras'],
  ['λαλήσει', 'falará'],
  ['λαλεῖς', 'falas'],
  ['λαλεῖτε', 'falais'],
  ['λαλούντων', 'falantes'],
  ['λαμβάνειν', 'receber'],
  ['λαμβάνετε', 'recebeis'],
  ['λατρεύω', 'sirvo'],
  ['λαός', 'povo'],
  ['λεγομένην', 'chamada'],
  ['λεγομένοις', 'chamados'],
  ['λεπροὶ', 'leprosos'],
  ['λιμὸς', 'fome'],
  ['λογίζομαι', 'considero'],
  ['λόγοι', 'palavras'],
  ['λύχνον', 'lâmpada'],
  ['λῃστῶν', 'ladrões'],
  ['μάθετε', 'aprendei'],
  ['μέλλοντι', 'vindouro'],
  ['μέλλουσαν', 'vindoura'],
  ['μένῃ', 'permaneça'],
  ['μέτρῳ', 'medida'],
  ['μακάριοί', 'bem-aventurados'],
  ['μακροθυμίαν', 'paciência'],
  ['μακροθυμίας', 'paciência'],
  ['μακροθυμίᾳ', 'paciência'],
  ['μαρτυροῦμεν', 'testemunhamos'],
  ['μαρτυρῶν', 'testemunhando'],
  ['μεριμνήσητε', 'preocupeis'],
  ['μεριμνᾷ', 'preocupa-se'],
  ['μεσίτης', 'mediador'],
  ['μιμηταὶ', 'imitadores'],
  ['μισθοῦ', 'salário'],
  ['μισούμενοι', 'odiados'],
  ['μνημείῳ', 'sepulcro'],
  ['μνημεῖα', 'sepulcros'],
  ['μοιχᾶται', 'adultera'],
  ['μυστήρια', 'mistérios'],
  ['μυστηρίου', 'mistério'],
  ['μόνοι', 'sós'],
  ['ναὶ', 'sim'],
  ['νεανίσκοι', 'jovens'],
  ['νεώτερος', 'mais-jovem'],
  ['νηστεύουσιν', 'jejuam'],
  ['νοὸς', 'mente'],
  ['νύκτας', 'noites'],
  ['νῖκος', 'vitória'],
  ['ξένοι', 'estrangeiros'],
  ['οἰκεῖ', 'habita'],
  ['οἰκοδεσπότῃ', 'senhor-da-casa'],
  ['οἰκοδομεῖ', 'edifica'],
  ['οἰκοδομεῖτε', 'edificai'],
  ['οἰκοδομοῦντες', 'edificantes'],
  ['οἴκους', 'casas'],
  ['οἴνῳ', 'vinho'],
  ['οἶνος', 'vinho'],
  ['οὐδέπω', 'ainda-não'],
  ['οὐρανοὶ', 'céus'],
  ['οὐρανόν', 'céu'],
  ['οὔσῃ', 'estando'],
  ['πέπεισμαι', 'estou-persuadido'],
  ['πίνακι', 'prato'],
  ['πίνειν', 'beber'],
  ['παθήμασιν', 'sofrimentos'],
  ['παθήματα', 'sofrimentos'],
  ['παιδίσκης', 'serva'],
  ['παιδίων', 'crianças'],
  ['πανουργίᾳ', 'astúcia'],
  ['παράγων', 'passando'],
  ['παρέδωκα', 'entreguei'],
  ['παρέλαβεν', 'recebeu'],
  ['παραγγείλας', 'ordenando'],
  ['παραδοὺς', 'entregando'],
  ['παραδοῖ', 'entregue'],
  ['παραιτοῦ', 'recusa'],
  ['παρακάλει', 'exortava'],
  ['παρακαλοῦμεν', 'exortamos'],
  ['παρακαλοῦντες', 'exortando'],
  ['παραπτώματι', 'transgressão'],
  ['παρεγένετο', 'apresentou-se'],
  ['παρεγένοντο', 'apresentaram-se'],
  ['παρεδόθη', 'foi-entregue'],
  ['παρεκάλεσα', 'exortei'],
  ['παρελθεῖν', 'passar'],
  ['παρεμβολήν', 'acampamento'],
  ['πειράζετε', 'tentais'],
  ['πειράζων', 'tentando'],
  ['πειραζόμενος', 'tentado'],
  ['πειρασμὸν', 'tentação'],
  ['πεντακισχίλιοι', 'cinco-mil'],
  ['πεπλήρωται', 'foi-cumprido'],
  ['πεποιθήσει', 'confiança'],
  ['πεποιθὼς', 'confiando'],
  ['περίχωρον', 'região-ao-redor'],
  ['περιποίησιν', 'aquisição'],
  ['περισσεύητε', 'abundeis'],
  ['περισσὸν', 'abundante'],
  ['περισσῶς', 'abundantemente'],
  ['περιστερὰν', 'pomba'],
  ['περιτομὴ', 'circuncisão'],
  ['πηγὴ', 'fonte'],
  ['πηλὸν', 'barro'],
  ['πιάσαι', 'prender'],
  ['πιστευόντων', 'crentes'],
  ['πιστεύετέ', 'credes'],
  ['πιστεύοντας', 'crentes'],
  ['πιστεύοντι', 'crente'],
  ['πιστεύσωσιν', 'creiam'],
  ['πιστοῖς', 'fiéis'],
  ['πιστὸν', 'fiel'],
  ['πιστῷ', 'fiel'],
  ['πλέον', 'mais'],
  ['πλήθους', 'multidão'],
  ['πλανώμενοι', 'errantes'],
  ['πλευρὰν', 'lado'],
  ['πλουσίως', 'ricamente'],
  ['πνευμάτων', 'espíritos'],
  ['πνευματικὸν', 'espiritual'],
  ['ποιήσομεν', 'faremos'],
  ['ποιήσωσιν', 'façam'],
  ['ποιμὴν', 'pastor'],
  ['ποιοῦμεν', 'fazemos'],
  ['ποιῶσιν', 'façam'],
  ['πολλαῖς', 'muitas'],
  ['πονηρά', 'má'],
  ['πονηροὶ', 'maus'],
  ['πορεύεσθε', 'ide'],
  ['ποτηρίου', 'cálice'],
  ['ποῖον', 'qual'],
  ['πράσσειν', 'praticar'],
  ['πράσσω', 'pratico'],
  ['πραγμάτων', 'coisas'],
  ['προείρηκα', 'predisse'],
  ['προθέσεως', 'propósito'],
  ['προσέχειν', 'atentar'],
  ['προσήνεγκεν', 'ofereceu'],
  ['προσδοκῶμεν', 'esperemos'],
  ['προσεκύνει', 'adorava'],
  ['προσεκύνησεν', 'adorou'],
  ['προσεφώνησεν', 'chamou'],
  ['προσκόμματος', 'tropeço'],
  ['προφητεύων', 'profetizando'],
  ['προώρισεν', 'predestinou'],
  ['πρόθεσιν', 'propósito'],
  ['πτωχοὶ', 'pobres'],
  ['πτῶμα', 'cadáver'],
  ['πυλῶνα', 'portão'],
  ['σαπρὸν', 'podre'],
  ['σεαυτοῦ', 'ti-mesmo'],
  ['σημείοις', 'sinais'],
  ['σκάνδαλα', 'escândalos'],
  ['σκανδαλίσῃ', 'escandalize'],
  ['σκότει', 'trevas'],
  ['σοφὸς', 'sábio'],
  ['σοφῶν', 'sábios'],
  ['σπήλαιον', 'caverna'],
  ['σπαρείς', 'semeado'],
  ['σπείρειν', 'semear'],
  ['σπλαγχνισθεὶς', 'compadecido'],
  ['σταθεὶς', 'pondo-se-de-pé'],
  ['σταυρῷ', 'cruz'],
  ['στηρίξαι', 'firmar'],
  ['στόματι', 'boca'],
  ['συκῆ', 'figueira'],
  ['συκῆς', 'figueira'],
  ['συνήχθη', 'reuniu-se'],
  ['συνίετε', 'entendeis'],
  ['συνζητεῖν', 'debater'],
  ['σώματα', 'corpos'],
  ['σώματός', 'corpo'],
  ['σῇ', 'tua'],
  ['ταπεινωθήσεται', 'será-humilhado'],
  ['ταπεινώσει', 'humilhará'],
  ['τεκνία', 'filhinhos'],
  ['τηρήσῃ', 'guarde'],
  ['τοιοῦτος', 'tal'],
  ['τράγων', 'bodes'],
  ['τυφλῶν', 'cegos'],
  ['υἱόν', 'filho'],
  ['φάγε', 'come'],
  ['φάγῃ', 'coma'],
  ['φέροντες', 'trazendo'],
  ['φίλοι', 'amigos'],
  ['φαίνεται', 'aparece'],
  ['φαῦλον', 'vil'],
  ['φημι', 'digo'],
  ['φησιν', 'diz'],
  ['φθόνον', 'inveja'],
  ['φοβεῖσθε', 'temeis'],
  ['φοβηθῆτε', 'temais'],
  ['φοβοῦμαι', 'temo'],
  ['φρονεῖτε', 'pensais'],
  ['φρονοῦντες', 'pensando'],
  ['φρόνημα', 'pensamento'],
  ['φύραμα', 'massa'],
  ['χαίρων', 'alegrando-se'],
  ['χεῖρά', 'mão'],
  ['χεῖρον', 'pior'],
  ['χιλιάρχῳ', 'tribuno'],
  ['χρήματα', 'posses'],
  ['χρόνου', 'tempo'],
  ['χρόνῳ', 'tempo'],
  ['χωλοὶ', 'coxos'],
  ['ψεύδομαι', 'minto'],
  ['ψωμίον', 'bocado'],
  ['ὀλίγῳ', 'pouco'],
  ['ὀλιγόπιστοι', 'pouca-fé'],
  ['ὀμόσῃ', 'jure'],
  ['ὁμοιώσω', 'compararei'],
  ['ὁμοῦ', 'juntamente'],
  ['ὁρκωμοσίας', 'juramento'],
  ['ὄνον', 'jumento'],
  ['ὄντι', 'estando'],
  ['ὄξους', 'vinagre'],
  ['ὅλος', 'todo'],
  ['ὅπλα', 'armas'],
  ['ὅρια', 'limites'],
  ['ὑγιῆ', 'são'],
  ['ὑπάρχουσιν', 'existem'],
  ['ὑποδήματα', 'sandálias'],
  ['ὑποστρέφειν', 'retornar'],
  ['ὑστέρημα', 'falta'],
  ['ὑψίστοις', 'alturas'],
  ['ὑψηλὸν', 'alto'],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 8b (freq 4, parte 2/3) ===`);
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

console.log(`\n=== Resultado Lote 8b ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

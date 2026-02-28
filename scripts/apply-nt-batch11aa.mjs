#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11aa
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 27/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11aa-${Date.now()}.sql`);

const translations = [
  // === Lote 11aa: freq 1, parte 27/44 (248 palavras) ===

  // --- χ- palavras ---
  ["χωροῦσαι", "cabendo"],
  ["χωροῦσιν", "cabem"],
  ["χωρῆσαι", "caber"],
  ["χόρτον", "erva"],
  ["χόρτῳ", "erva"],
  ["χώραις", "regiões"],
  ["χῶρον", "lugar"],

  // --- ψ- palavras ---
  ["ψάλλοντες", "salmodiando"],
  ["ψαλλέτω", "salmodie"],
  ["ψαλμὸν", "salmo"],
  ["ψαλμῶν", "salmos"],
  ["ψαλμῷ", "salmo"],
  ["ψευδαδέλφοις", "falsos-irmãos"],
  ["ψευδαδέλφους", "falsos-irmãos"],
  ["ψευδαπόστολοι", "falsos-apóstolos"],
  ["ψευδοδιδάσκαλοι", "falsos-mestres"],
  ["ψευδολόγων", "falsos-falantes"],
  ["ψευδομάρτυρες", "falsas-testemunhas"],
  ["ψευδομαρτυρήσεις", "testemunharás-falsamente"],
  ["ψευδομαρτυρίαι", "falsos-testemunhos"],
  ["ψευδομαρτυρίαν", "falso-testemunho"],
  ["ψευδομαρτύρων", "falsas-testemunhas"],
  ["ψευδοπροφήταις", "falsos-profetas"],
  ["ψευδοπροφήτην", "falso-profeta"],
  ["ψευδοπροφητῶν", "falsos-profetas"],
  ["ψευδωνύμου", "falsamente-nomeada"],
  ["ψευδόμεθα", "mentimos"],
  ["ψευδόμενοι", "mentindo"],
  ["ψεύσασθαί", "mentir"],
  ["ψεύσασθαι", "mentir"],
  ["ψεύσματι", "mentira"],
  ["ψεύσταις", "mentirosos"],
  ["ψεῦσται", "mentirosos"],
  ["ψηλαφήσατέ", "apalpai"],
  ["ψηλαφήσειαν", "apalpassem"],
  ["ψηλαφωμένῳ", "sendo-apalpado"],
  ["ψηφίζει", "calcula"],
  ["ψιθυρισμοί", "murmurações"],
  ["ψιθυριστάς", "murmuradores"],
  ["ψυγήσεται", "esfriará"],
  ["ψυχική", "natural"],
  ["ψυχικοί", "naturais"],
  ["ψυχικὸς", "natural"],
  ["ψυχροῦ", "frio"],
  ["ψυχὴ", "alma"],
  ["ψωμίσω", "alimentar"],
  ["ψύχει", "esfria"],
  ["ψώμιζε", "alimenta"],
  ["ψώχοντες", "esfregando"],

  // --- ἀ- palavras (alfa privativo e outras) ---
  ["ἀΐδιος", "eterno"],
  ["ἀέρα", "ar"],
  ["ἀέρος", "ar"],
  ["ἀβαρῆ", "sem-peso"],
  ["ἀγάγετέ", "conduzi"],
  ["ἀγάμοις", "não-casados"],
  ["ἀγάπαις", "festas-de-amor"],
  ["ἀγέλην", "rebanho"],
  ["ἀγαγόντα", "tendo-conduzido"],
  ["ἀγαγόντες", "tendo-conduzido"],
  ["ἀγαθάς", "boas"],
  ["ἀγαθή", "boa"],
  ["ἀγαθοεργεῖν", "fazer-o-bem"],
  ["ἀγαθοποιΐᾳ", "prática-do-bem"],
  ["ἀγαθοποιεῖτε", "fazei-o-bem"],
  ["ἀγαθοποιοῦντες", "fazendo-o-bem"],
  ["ἀγαθοποιοῦσαι", "fazendo-o-bem"],
  ["ἀγαθοποιῆσαι", "fazer-o-bem"],
  ["ἀγαθοποιῆτε", "façais-o-bem"],
  ["ἀγαθουργῶν", "fazendo-o-bem"],
  ["ἀγαθούς", "bons"],
  ["ἀγαθοὺς", "bons"],
  ["ἀγαθωσύνη", "bondade"],
  ["ἀγαθωσύνῃ", "bondade"],
  ["ἀγαθὰς", "boas"],
  ["ἀγαλλίασις", "exultação"],
  ["ἀγαλλιάσεως", "exultação"],
  ["ἀγαλλιαθῆναι", "exultar"],
  ["ἀγαλλιώμενοι", "exultando"],
  ["ἀγανάκτησιν", "indignação"],
  ["ἀγανακτεῖν", "indignar-se"],
  ["ἀγανακτοῦντες", "indignando-se"],
  ["ἀγανακτῶν", "indignando-se"],
  ["ἀγαπάτω", "ame"],
  ["ἀγαπήσαντος", "tendo-amado"],
  ["ἀγαπήσαντός", "tendo-amado"],
  ["ἀγαπήσατε", "amai"],
  ["ἀγαπήσεις", "amarás"],
  ["ἀγαπήσητε", "ameis"],
  ["ἀγαπήσω", "amarei"],
  ["ἀγαπηθήσεται", "será-amado"],
  ["ἀγαπητά", "amados"],
  ["ἀγαπητήν", "amada"],
  ["ἀγαπητοῦ", "amado"],
  ["ἀγαπητὰ", "amados"],
  ["ἀγαπητὸν", "amado"],
  ["ἀγαπώντων", "amando"],
  ["ἀγαπᾶτέ", "amai"],
  ["ἀγαπῶμαι", "sou-amado"],
  ["ἀγγέλλουσα", "anunciando"],
  ["ἀγγαρεύουσιν", "obrigam-a-servir"],
  ["ἀγγαρεύσει", "obrigará-a-servir"],
  ["ἀγγείοις", "vasilhas"],
  ["ἀγενεαλόγητος", "sem-genealogia"],
  ["ἀγενῆ", "ignóbil"],
  ["ἀγκάλας", "braços"],
  ["ἀγνοήσαντες", "tendo-ignorado"],
  ["ἀγνοίας", "ignorância"],
  ["ἀγνοίᾳ", "ignorância"],
  ["ἀγνοεῖ", "ignora"],
  ["ἀγνοεῖται", "é-ignorado"],
  ["ἀγνοημάτων", "ignorâncias"],
  ["ἀγνοούμενοι", "sendo-ignorados"],
  ["ἀγνοούμενος", "sendo-ignorado"],
  ["ἀγνοοῦμεν", "ignoramos"],
  ["ἀγοράζει", "compra"],
  ["ἀγοράζοντες", "comprando"],
  ["ἀγοράσαντα", "tendo-comprado"],
  ["ἀγοράσας", "tendo-comprado"],
  ["ἀγοράσατε", "comprai"],
  ["ἀγοραίων", "da-praça"],
  ["ἀγορασάτω", "compre"],
  ["ἀγοραῖοι", "dias-de-tribunal"],
  ["ἀγορὰν", "praça"],
  ["ἀγορᾶς", "praça"],
  ["ἀγράμματοί", "iletrados"],
  ["ἀγραυλοῦντες", "vivendo-no-campo"],
  ["ἀγρεύσωσιν", "apanhem"],
  ["ἀγριέλαιος", "oliveira-brava"],
  ["ἀγριελαίου", "oliveira-brava"],
  ["ἀγρυπνοῦντες", "vigiando"],
  ["ἀγρυπνοῦσιν", "vigiam"],
  ["ἀγρός", "campo"],
  ["ἀγρὸς", "campo"],
  ["ἀγρῶν", "campos"],
  ["ἀγωγῇ", "conduta"],
  ["ἀγωνίζου", "combate"],
  ["ἀγωνίᾳ", "agonia"],
  ["ἀγωνιζόμεθα", "combatemos"],
  ["ἀγόμενα", "sendo-conduzidos"],
  ["ἀγῶνι", "combate"],

  // --- ἀδ- palavras ---
  ["ἀδάπανον", "sem-custo"],
  ["ἀδήλως", "incertamente"],
  ["ἀδίκημά", "injustiça"],
  ["ἀδίκημα", "injustiça"],
  ["ἀδίκως", "injustamente"],
  ["ἀδίκῳ", "injusto"],
  ["ἀδελφάς", "irmãs"],
  ["ἀδελφή", "irmã"],
  ["ἀδελφαί", "irmãs"],
  ["ἀδελφότητα", "irmandade"],
  ["ἀδελφότητι", "irmandade"],
  ["ἀδελφῇ", "irmã"],
  ["ἀδηλότητι", "incerteza"],
  ["ἀδημονῶν", "angustiando-se"],
  ["ἀδιάκριτος", "imparcial"],
  ["ἀδιάλειπτον", "incessante"],
  ["ἀδιάλειπτος", "incessante"],
  ["ἀδικήσαντος", "tendo-sido-injusto"],
  ["ἀδικήσει", "será-injusto"],
  ["ἀδικίαις", "injustiças"],
  ["ἀδικεῖσθε", "sois-injustiçados"],
  ["ἀδικηθέντος", "tendo-sido-injustiçado"],
  ["ἀδικούμενοι", "sendo-injustiçados"],
  ["ἀδικούμενον", "sendo-injustiçado"],
  ["ἀδυνάτων", "impossíveis"],
  ["ἀδόκιμοί", "reprovados"],
  ["ἀδόκιμον", "reprovado"],
  ["ἀδύνατα", "impossíveis"],
  ["ἀδύνατος", "impossível"],
  ["ἀδύνατόν", "impossível"],

  // --- ἀε- palavras ---
  ["ἀετοί", "águias"],
  ["ἀετοὶ", "águias"],

  // --- ἀζ- palavras ---
  ["ἀζύμοις", "ázimos"],

  // --- ἀθ- palavras ---
  ["ἀθά", "vem"],
  ["ἀθέμιτόν", "ilícito"],
  ["ἀθέτησιν", "anulação"],
  ["ἀθέτησις", "anulação"],
  ["ἀθεμίτοις", "ilícitas"],
  ["ἀθετήσας", "tendo-anulado"],
  ["ἀθετήσω", "anularei"],
  ["ἀθετεῖτε", "anulais"],
  ["ἀθετοῦσιν", "anulam"],
  ["ἀθετῆσαι", "anular"],
  ["ἀθετῶ", "anulo"],
  ["ἀθλήσῃ", "compita"],
  ["ἀθλῇ", "compete"],
  ["ἀθυμῶσιν", "desanimem"],
  ["ἀθῷον", "inocente"],

  // --- ἀκ- palavras ---
  ["ἀκάθαρτά", "impuros"],
  ["ἀκάθαρτα", "impuros"],
  ["ἀκάθαρτος", "impuro"],
  ["ἀκάκων", "inocentes"],
  ["ἀκάρποις", "infrutíferos"],
  ["ἀκάρπους", "infrutíferos"],
  ["ἀκαίρως", "inoportunamente"],
  ["ἀκατάγνωστον", "irrepreensível"],
  ["ἀκατάκριτον", "incondenado"],
  ["ἀκατάστατον", "instável"],
  ["ἀκατάστατος", "instável"],
  ["ἀκατακάλυπτον", "descoberta"],
  ["ἀκατακαλύπτῳ", "descoberta"],
  ["ἀκατακρίτους", "incondenados"],
  ["ἀκαταλύτου", "indissolúvel"],
  ["ἀκαταπαύστους", "incessantes"],
  ["ἀκαταστασία", "desordem"],
  ["ἀκαταστασίαι", "desordens"],
  ["ἀκαταστασίαις", "desordens"],
  ["ἀκεραίους", "puros"],
  ["ἀκηκοότας", "tendo-ouvido"],
  ["ἀκηκόασιν", "têm-ouvido"],
  ["ἀκλινῆ", "inabalável"],
  ["ἀκοήν", "ouvido"],
  ["ἀκοαί", "ouvidos"],
  ["ἀκοαῖς", "ouvidos"],
  ["ἀκολουθήσαντές", "tendo-seguido"],
  ["ἀκολουθήσεις", "seguirás"],
  ["ἀκολουθήσουσιν", "seguirão"],
  ["ἀκολουθήσω", "seguirei"],
  ["ἀκολουθησάντων", "tendo-seguido"],
  ["ἀκολουθούσης", "seguindo"],
  ["ἀκολουθοῦντα", "seguindo"],
  ["ἀκολουθοῦντας", "seguindo"],
  ["ἀκολουθοῦντι", "seguindo"],
  ["ἀκολουθοῦσίν", "seguem"],
  ["ἀκουσάτωσαν", "ouçam"],
  ["ἀκουσθήσεται", "será-ouvido"],
  ["ἀκουσθεῖσιν", "tendo-sido-ouvidas"],
  ["ἀκουόντων", "ouvindo"],
  ["ἀκούεται", "é-ouvido"],
  ["ἀκούοντος", "ouvindo"],
  ["ἀκούσασιν", "tendo-ouvido"],
  ["ἀκούσει", "ouvirá"],
  ["ἀκούσεσθε", "ouvireis"],
  ["ἀκούσῃ", "ouça"],
  ["ἀκούωσιν", "ouçam"],
  ["ἀκρίβειαν", "exatidão"],
  ["ἀκρίδας", "gafanhotos"],
  ["ἀκρασίαν", "intemperança"],
  ["ἀκρασίας", "intemperança"],
  ["ἀκρατεῖς", "sem-domínio-próprio"],
  ["ἀκριβεστάτην", "mais-exata"],
  ["ἀκροατήριον", "auditório"],
  ["ἀκρογωνιαίου", "pedra-angular"],
  ["ἀκρογωνιαῖον", "pedra-angular"],
  ["ἀκροθινίων", "primícias"],
  ["ἀκυροῖ", "invalida"],
  ["ἀκυροῦντες", "invalidando"],
  ["ἀκωλύτως", "sem-impedimento"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11aa (freq 1, parte 27/44) ===`);
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

console.log(`\n=== Resultado Lote 11aa ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

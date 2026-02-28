#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11m
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 13/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11m-${Date.now()}.sql`);

const translations = [
  // === 248 palavras freq 1 — parte 13/44 ===

  // --- κραβ- palavras ---
  ["κραβάττου", "cama"],
  ["κραβάττων", "camas"],

  // --- κραι- palavras ---
  ["κραιπάλῃ", "embriaguez"],

  // --- κραν- palavras ---
  ["κρανίου", "crânio"],

  // --- κρατ- palavras ---
  ["κρατήσατε", "seguai"],
  ["κρατήσει", "segurará"],
  ["κρατήσωσιν", "segurem"],
  ["κρατίστῳ", "excelentíssimo"],
  ["κραταιοῦσθε", "fortalecei-vos"],
  ["κραταιωθῆναι", "ser-fortalecido"],
  ["κραταιὰν", "forte"],
  ["κρατεῖν", "segurar"],
  ["κρατεῖσθαι", "ser-segurado"],
  ["κρατοῦντες", "segurando"],
  ["κρατοῦσιν", "seguram"],
  ["κρατῆτε", "segureis"],
  ["κρατῶμεν", "seguraremos"],

  // --- κραυγ- palavras ---
  ["κραυγάζοντα", "clamando"],
  ["κραυγάσει", "clamará"],
  ["κραυγαζόντων", "clamando"],
  ["κραυγῆς", "clamor"],
  ["κραυγῇ", "clamor"],

  // --- κρε- palavras ---
  ["κρείττονός", "melhor"],
  ["κρείττων", "melhor"],
  ["κρεμάμενον", "pendurando"],
  ["κρεμάμενος", "pendurando"],
  ["κρεμασθέντων", "tendo-sido-pendurados"],
  ["κρεμασθῇ", "seja-pendurado"],
  ["κρεῖττόν", "melhor"],

  // --- κριθ- palavras ---
  ["κριθήσεσθε", "sereis-julgados"],
  ["κριθήσονται", "serão-julgados"],
  ["κριθίνους", "de-cevada"],
  ["κριθίνων", "de-cevada"],
  ["κριθῶσι", "sejam-julgados"],
  ["κριθῶσιν", "sejam-julgados"],

  // --- κριν- palavras ---
  ["κρινοῦμεν", "julgaremos"],
  ["κρινοῦσιν", "julgarão"],
  ["κρινόμενοι", "sendo-julgados"],
  ["κρινόμενος", "sendo-julgado"],
  ["κρινῶ", "julgarei"],

  // --- κριτ- palavras ---
  ["κριτήν", "juiz"],
  ["κριτηρίων", "tribunais"],
  ["κριτικὸς", "discernidor"],
  ["κριτὰς", "juízes"],
  ["κριτῇ", "juiz"],

  // --- κρου- palavras ---
  ["κρούειν", "bater"],
  ["κρούων", "batendo"],

  // --- κρυ- palavras ---
  ["κρυπτὸς", "oculto"],
  ["κρυφῇ", "em-oculto"],
  ["κρύπτην", "oculto"],

  // --- κρ- outras ---
  ["κρᾶζον", "clamando"],
  ["κρῖναι", "julgar"],

  // --- κτ- palavras ---
  ["κτήσεσθε", "adquirireis"],
  ["κτήσησθε", "adquirais"],
  ["κτήτορες", "possuidores"],
  ["κτίσαντι", "tendo-criado"],
  ["κτίσαντος", "tendo-criado"],
  ["κτίσας", "tendo-criado"],
  ["κτίσῃ", "crie"],
  ["κτηνῶν", "animais"],
  ["κτισθέντα", "tendo-sido-criados"],
  ["κτισθέντες", "tendo-sido-criados"],
  ["κτῆμα", "propriedade"],
  ["κτῆνος", "animal"],
  ["κτῶμαι", "adquiro"],

  // --- κυβ- palavras ---
  ["κυβίᾳ", "artimanha"],
  ["κυβερνήσεις", "governos"],
  ["κυβερνήτῃ", "piloto"],

  // --- κυκλ- palavras ---
  ["κυκλουμένην", "sendo-cercada"],
  ["κυκλωθέντα", "tendo-sido-cercado"],
  ["κυκλωσάντων", "tendo-cercado"],

  // --- κυλ- palavras ---
  ["κυλισμὸν", "chafurdo"],
  ["κυλλούς", "aleijados"],
  ["κυλλοὺς", "aleijados"],

  // --- κυρ- palavras ---
  ["κυρία", "senhora"],
  ["κυρίων", "senhores"],
  ["κυρίᾳ", "senhora"],
  ["κυριακὸν", "do-Senhor"],
  ["κυριευόντων", "dominando"],
  ["κυριεύομεν", "dominamos"],
  ["κυριεύουσιν", "dominam"],
  ["κυριεύσει", "dominará"],
  ["κυριεύσῃ", "domine"],
  ["κυριότητα", "senhorio"],
  ["κυριότητες", "senhorios"],
  ["κυρῶσαι", "confirmar"],

  // --- κυσ- palavras ---
  ["κυσίν", "cães"],

  // --- κωλ- palavras ---
  ["κωλυθέντες", "tendo-sido-impedidos"],
  ["κωλύειν", "impedir"],
  ["κωλύεσθαι", "ser-impedido"],
  ["κωλύοντα", "impedindo"],
  ["κωλύσῃς", "impeças"],
  ["κωλῦσαί", "impedir"],
  ["κωλῦσαι", "impedir"],

  // --- κωμ- palavras ---
  ["κωμοπόλεις", "vilas"],

  // --- κωφ- palavras ---
  ["κωφούς", "mudos"],
  ["κωφόν", "mudo"],

  // --- κό- palavras ---
  ["κόκκος", "grão"],
  ["κόλποις", "seios"],
  ["κόλπῳ", "seio"],
  ["κόμη", "cabelo"],
  ["κόπον", "trabalho"],
  ["κόπου", "trabalho"],
  ["κόπρια", "esterco"],
  ["κόρακας", "corvos"],
  ["κόρους", "coros"],
  ["κόσμιον", "decoroso"],
  ["κόφινοι", "cestos"],
  ["κόψαντες", "tendo-golpeado"],

  // --- κύ- palavras ---
  ["κύκλῳ", "ao-redor"],
  ["κύμβαλον", "címbalo"],
  ["κύμινον", "cominho"],
  ["κύνας", "cães"],
  ["κύνες", "cães"],

  // --- κώ- palavras ---
  ["κώνωπα", "mosquito"],

  // --- κἀ- palavras (crasis) ---
  ["κἀγώ", "e-eu"],
  ["κἀκείνους", "e-aqueles"],
  ["κἀκεῖνός", "e-aquele"],
  ["κἀμοί", "e-a-mim"],

  // --- κῆ- palavras ---
  ["κῆπον", "jardim"],
  ["κῆρυξ", "arauto"],

  // --- κῶ- palavras ---
  ["κῶλα", "membros"],
  ["κῶμοι", "orgias"],

  // --- λάβ- palavras ---
  ["λάβετε", "tomai"],
  ["λάβοι", "tomasse"],
  ["λάβω", "tome"],

  // --- λάμ- palavras ---
  ["λάμψει", "brilhará"],

  // --- λάρ- palavras ---
  ["λάρυγξ", "garganta"],

  // --- λάχ- palavras ---
  ["λάχανα", "hortaliças"],
  ["λάχανον", "hortaliça"],
  ["λάχωμεν", "obtenhamos-por-sorte"],

  // --- λέγ- palavras ---
  ["λέγητε", "digais"],
  ["λέγον", "dizendo"],
  ["λέγοντά", "dizendo"],
  ["λέγοντι", "dizendo"],
  ["λέγωμεν", "digamos"],

  // --- λέλ- palavras ---
  ["λέλυσαι", "tens-sido-desatado"],

  // --- λέν- palavras ---
  ["λέντιον", "toalha"],

  // --- λέπ- palavras ---
  ["λέπρας", "lepra"],

  // --- λή- palavras ---
  ["λήθην", "esquecimento"],
  ["λήμψεταί", "receberá"],
  ["λήμψεως", "recebimento"],

  // --- λίβ- palavras ---
  ["λίβα", "sudoeste"],

  // --- λίθ- palavras ---
  ["λίθιναι", "de-pedra"],
  ["λίθου", "pedra"],
  ["λίθῳ", "pedra"],

  // --- λίμ- palavras ---
  ["λίμμα", "resto"],
  ["λίμνης", "lago"],

  // --- λίτ- palavras ---
  ["λίτραν", "libra"],
  ["λίτρας", "libras"],

  // --- λαι- palavras ---
  ["λαίλαπος", "tempestade"],

  // --- λαβ- palavras ---
  ["λαβέτω", "tome"],
  ["λαβόντα", "tendo-tomado"],

  // --- λαθ- palavras ---
  ["λαθεῖν", "esconder-se"],

  // --- λακτ- palavras ---
  ["λακτίζειν", "coicear"],

  // --- λαλ- palavras ---
  ["λαλήσομεν", "falaremos"],
  ["λαλείτω", "fale"],
  ["λαλείτωσαν", "falem"],
  ["λαλεῖσθαι", "ser-falado"],
  ["λαληθέντος", "tendo-sido-falado"],
  ["λαληθέντων", "tendo-sido-falados"],
  ["λαληθήσεταί", "será-falado"],
  ["λαληθείσης", "tendo-sido-falada"],
  ["λαληθεὶς", "tendo-sido-falado"],
  ["λαληθησομένων", "havendo-de-ser-falados"],
  ["λαλιά", "fala"],
  ["λαλουμένη", "sendo-falada"],
  ["λαλοῦντα", "falando"],
  ["λαλοῦντας", "falando"],
  ["λαλοῦντός", "falando"],
  ["λαλοῦσαι", "falando"],
  ["λαλῆσαί", "falar"],
  ["λαλῇ", "fale"],
  ["λαλῶσιν", "falem"],

  // --- λαμβ- palavras ---
  ["λαμβάνεις", "recebes"],
  ["λαμβάνετέ", "recebeis"],
  ["λαμβάνῃ", "receba"],
  ["λαμβανόμενον", "sendo-recebido"],
  ["λαμβανόμενος", "sendo-recebido"],

  // --- λαμπ- palavras ---
  ["λαμπρότητα", "esplendor"],
  ["λαμπρῶς", "esplendidamente"],
  ["λαμψάτω", "brilhe"],

  // --- λαμ- palavras ---
  ["λαμὰ", "lama"],

  // --- λανθ- palavras ---
  ["λανθάνει", "está-oculto"],
  ["λανθάνειν", "estar-oculto"],
  ["λανθανέτω", "esteja-oculto"],

  // --- λαξ- palavras ---
  ["λαξευτῷ", "cavado-em-rocha"],

  // --- λαο- palavras ---
  ["λαοί", "povos"],
  ["λαοὶ", "povos"],
  ["λαοῖς", "povos"],

  // --- λατρ- palavras ---
  ["λατρεία", "serviço-sagrado"],
  ["λατρεύοντα", "servindo"],
  ["λατρεύοντας", "servindo"],
  ["λατρεύουσα", "servindo"],
  ["λατρεύσουσίν", "servirão"],
  ["λατρεύωμεν", "sirvamos"],
  ["λατρεῦον", "servindo"],

  // --- λαχ- palavras ---
  ["λαχοῦσιν", "tendo-obtido-por-sorte"],

  // --- λεί- palavras ---
  ["λείας", "lisa"],
  ["λείπει", "falta"],
  ["λείπεται", "é-deficiente"],
  ["λείποντα", "faltando"],
  ["λείπῃ", "falte"],

  // --- λεγ- palavras ---
  ["λεγέτω", "diga"],
  ["λεγιῶνα", "legião"],
  ["λεγιῶνας", "legiões"],
  ["λεγομένου", "sendo-chamado"],
  ["λεγόμενα", "sendo-ditas"],
  ["λεγόντων", "dizendo"],

  // --- λειτ- palavras ---
  ["λειτουργίᾳ", "serviço-litúrgico"],
  ["λειτουργικὰ", "ministrantes"],
  ["λειτουργοὶ", "ministros"],
  ["λειτουργοὺς", "ministros"],
  ["λειτουργὸς", "ministro"],
  ["λειτουργῆσαι", "ministrar"],
  ["λειτουργῶν", "ministrando"],

  // --- λελ- palavras ---
  ["λελάληταί", "tem-sido-falado"],
  ["λελαλημένοις", "tendo-sido-falados"],
  ["λελατομημένον", "tendo-sido-cavado-em-rocha"],
  ["λελουμένος", "tendo-sido-lavado"],
  ["λελουσμένοι", "tendo-sido-lavados"],
  ["λελυμένα", "tendo-sido-desatados"],
  ["λελυμένον", "tendo-sido-desatado"],

  // --- λεμ- palavras ---
  ["λεμὰ", "lema"],

  // --- λεν- palavras ---
  ["λεντίῳ", "toalha"],

  // --- λεπ- palavras ---
  ["λεπίδες", "escamas"],
  ["λεπροὺς", "leprosos"],
  ["λεπτὸν", "lepto"],

  // --- λευκ- palavras ---
  ["λευκήν", "branca"],
  ["λευκαί", "brancas"],
  ["λευκαῖς", "brancas"],
  ["λευκοῖς", "brancos"],
  ["λευκὰ", "brancos"],
  ["λευκὴν", "branca"],
  ["λευκὸν", "branco"],
  ["λευκὸς", "branco"],
  ["λευκᾶναι", "branquear"],

  // --- λεό- palavras ---
  ["λεόντων", "leões"],

  // --- ληψ- palavras ---
  ["λημψόμεθα", "receberemos"],

  // --- λιθ- palavras ---
  ["λιθάζετε", "apedrejais"],
  ["λιθάζομέν", "apedrejamos"],
  ["λιθάσαι", "apedrejar"],
  ["λιθάσαντες", "tendo-apedrejado"],
  ["λιθάσωσιν", "apedrejem"],
  ["λιθίναις", "de-pedra"],
  ["λιθασθῶσιν", "sejam-apedrejados"],
  ["λιθοβολεῖσθαι", "ser-apedrejado"],
  ["λιθοβοληθήσεται", "será-apedrejado"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11m (freq 1, parte 13/44) ===`);
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

console.log(`\n=== Resultado Lote 11m ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

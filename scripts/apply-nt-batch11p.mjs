#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11p
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 16/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11p-${Date.now()}.sql`);

const translations = [
  // === Lote 11p - freq 1, parte 16/44 (248 palavras) ===

  // --- ν- palavras ---
  ["νηπιάζετε", "sejais-crianças"],
  ["νησίον", "pequena-ilha"],
  ["νηστειῶν", "jejuns"],
  ["νηστευόντων", "jejuando"],
  ["νηστεύητε", "jejueis"],
  ["νηστεύομεν", "jejuamos"],
  ["νηστεύσαντες", "tendo-jejuado"],
  ["νηστεύσας", "tendo-jejuado"],
  ["νηστεύω", "jejuo"],
  ["νηστεῦσαι", "jejuar"],
  ["νηφάλιον", "sóbrio"],
  ["νικήσασα", "tendo-vencido"],
  ["νικήσεις", "vencerás"],
  ["νικῶ", "venço"],
  ["νιπτῆρα", "bacia"],
  ["νιψάμενος", "tendo-se-lavado"],
  ["νοήσωσιν", "compreendam"],
  ["νομίζει", "supõe"],
  ["νομίζειν", "supor"],
  ["νομίζοντες", "supondo"],
  ["νομίζων", "supondo"],
  ["νομίσαντες", "tendo-suposto"],
  ["νομιζόντων", "supondo"],
  ["νομικοὶ", "peritos-na-lei"],
  ["νομικοὺς", "peritos-na-lei"],
  ["νομικός", "perito-na-lei"],
  ["νομικὰς", "legais"],
  ["νομικὸν", "perito-na-lei"],
  ["νομικὸς", "perito-na-lei"],
  ["νομικῶν", "peritos-na-lei"],
  ["νομοδιδάσκαλος", "mestre-da-lei"],
  ["νομοθέτης", "legislador"],
  ["νομοθεσία", "legislação"],
  ["νοούμενα", "sendo-compreendidas"],
  ["νοοῦντες", "compreendendo"],
  ["νοσήματι", "doença"],
  ["νοσσία", "ninhada"],
  ["νοσσιὰν", "ninhada"],
  ["νοσσοὺς", "filhotes"],
  ["νοσφίσασθαι", "reter-para-si"],
  ["νοσφιζομένους", "retendo-para-si"],
  ["νοσῶν", "adoecendo"],
  ["νουθεσίᾳ", "admoestação"],
  ["νουθετεῖν", "admoestar"],
  ["νουθετοῦντας", "admoestando"],
  ["νουνεχῶς", "prudentemente"],
  ["νοῆσαι", "compreender"],
  ["νοῦν", "mente"],
  ["νυκτί", "noite"],
  ["νυκτός", "noite"],
  ["νυμφίου", "noivo"],
  ["νυμφὼν", "câmara-nupcial"],
  ["νυστάζει", "cochila"],
  ["νυχθήμερον", "noite-e-dia"],
  ["νόει", "compreende"],
  ["νόημα", "pensamento"],
  ["νόθοι", "ilegítimos"],
  ["νόμισμα", "moeda"],
  ["νότον", "sul"],
  ["νύμφη", "noiva"],
  ["νύξ", "noite"],
  ["νὴ", "por"],
  ["νὺξ", "noite"],
  ["νῆφε", "sê-sóbrio"],
  ["νῶτον", "costas"],

  // --- ξ- palavras ---
  ["ξέναις", "estranhas"],
  ["ξένοις", "estrangeiros"],
  ["ξένου", "estrangeiro"],
  ["ξένους", "estrangeiros"],
  ["ξενίζεσθε", "estranhais"],
  ["ξενίζοντα", "estranhando"],
  ["ξενίζονται", "estranham"],
  ["ξενίσαντες", "tendo-hospedado"],
  ["ξενισθῶμεν", "sejamos-hospedados"],
  ["ξεστῶν", "jarros"],
  ["ξηρά", "seca"],
  ["ξηραίνεται", "seca-se"],
  ["ξηρᾶς", "seca"],
  ["ξηρῶν", "secos"],
  ["ξηρῷ", "seco"],
  ["ξυρήσονται", "rasparão"],
  ["ξυρᾶσθαι", "raspar-se"],
  ["ξύλα", "madeiras"],
  ["ξύλῳ", "madeira"],

  // --- οἰ- palavras ---
  ["οἰέσθω", "suponha"],
  ["οἰκέται", "servos-domésticos"],
  ["οἰκέτην", "servo-doméstico"],
  ["οἰκέτης", "servo-doméstico"],
  ["οἰκήματι", "cela"],
  ["οἰκείους", "membros-da-casa"],
  ["οἰκείων", "membros-da-casa"],
  ["οἰκετείας", "serviçais"],
  ["οἰκετῶν", "servos-domésticos"],
  ["οἰκεῖοι", "membros-da-casa"],
  ["οἰκιακοὶ", "domésticos"],
  ["οἰκιακοὺς", "domésticos"],
  ["οἰκιῶν", "casas"],
  ["οἰκοδεσποτεῖν", "governar-a-casa"],
  ["οἰκοδεσπότην", "senhor-da-casa"],
  ["οἰκοδομάς", "edificações"],
  ["οἰκοδομή", "edificação"],
  ["οἰκοδομήθη", "foi-edificada"],
  ["οἰκοδομήν", "edificação"],
  ["οἰκοδομήσαντι", "tendo-edificado"],
  ["οἰκοδομήσετέ", "edificareis"],
  ["οἰκοδομαί", "edificações"],
  ["οἰκοδομεῖν", "edificar"],
  ["οἰκοδομεῖσθε", "sois-edificados"],
  ["οἰκοδομεῖται", "é-edificada"],
  ["οἰκοδομηθήσεται", "será-edificada"],
  ["οἰκοδομουμένη", "sendo-edificada"],
  ["οἰκοδομοῦντι", "edificando"],
  ["οἰκοδομὰς", "edificações"],
  ["οἰκοδομὴ", "edificação"],
  ["οἰκοδομῆσθαι", "ser-edificada"],
  ["οἰκοδόμησεν", "edificou"],
  ["οἰκοδόμων", "construtores"],
  ["οἰκονομία", "administração"],
  ["οἰκονομεῖν", "administrar"],
  ["οἰκονόμοι", "administradores"],
  ["οἰκονόμοις", "administradores"],
  ["οἰκουμένη", "terra-habitada"],
  ["οἰκουργούς", "trabalhadoras-do-lar"],
  ["οἰκοῦσα", "habitando"],
  ["οἰκτίρμονες", "compassivos"],
  ["οἰκτείρω", "tenho-compaixão"],
  ["οἰκτειρήσω", "terei-compaixão"],
  ["οἰκτιρμοί", "compaixões"],
  ["οἰκτιρμοῦ", "compaixão"],
  ["οἰκῶν", "habitando"],
  ["οἰνοφλυγίαις", "embriaguezes"],
  ["οἰόμενοι", "supondo"],
  ["οἴκοις", "casas"],
  ["οἴκων", "casas"],
  ["οἴσει", "levará"],
  ["οἶμαι", "suponho"],
  ["οἷά", "quais"],
  ["οἷα", "quais"],
  ["οἷοί", "quais"],
  ["οἷοι", "quais"],

  // --- οὐ- palavras ---
  ["οὐαί", "ai"],
  ["οὐδαμῶς", "de-modo-algum"],
  ["οὐθενός", "nenhum"],
  ["οὐρανίου", "celestial"],
  ["οὐρανίῳ", "celestial"],
  ["οὐσίαν", "propriedade"],
  ["οὐσίας", "propriedade"],
  ["οὐσῶν", "sendo"],
  ["οὒ", "não"],
  ["οὕτω", "assim"],
  ["οὖσαι", "sendo"],
  ["οὗτοί", "estes"],

  // --- π- palavras (πά-) ---
  ["πάγον", "colina"],
  ["πάθει", "sofrimento"],
  ["πάθη", "paixões"],
  ["πάθημα", "sofrimento"],
  ["πάθος", "paixão"],
  ["πάθῃ", "sofra"],
  ["πάλη", "luta"],
  ["πάντῃ", "de-todo-modo"],
  ["πάρει", "está-presente"],
  ["πάρεισιν", "estão-presentes"],
  ["πάρεσιν", "passagem"],
  ["πάρεσμεν", "estamos-presentes"],
  ["πάρεστε", "estais-presentes"],
  ["πάροικοι", "peregrinos"],
  ["πάροικον", "peregrino"],
  ["πάροικος", "peregrino"],
  ["πάσας", "todas"],
  ["πάσχει", "sofre"],
  ["πάσχετε", "sofreis"],
  ["πάσχοιτε", "sofrêsseis"],
  ["πάσχομεν", "sofremos"],
  ["πάσχω", "sofro"],

  // --- π- palavras (πέ-) ---
  ["πέδας", "grilhões"],
  ["πέλαγος", "profundeza"],
  ["πέμπει", "envia"],
  ["πέμπειν", "enviar"],
  ["πέμποντα", "enviando"],
  ["πέμπω", "envio"],
  ["πέμψαντί", "tendo-enviado"],
  ["πέμψαντα", "tendo-enviado"],
  ["πέμψαντες", "tendo-enviado"],
  ["πέμψασιν", "tendo-enviado"],
  ["πέμψει", "enviará"],
  ["πέμψον", "envia"],
  ["πέμψῃς", "envies"],
  ["πένησιν", "pobres"],
  ["πέπαυται", "tem-cessado"],
  ["πέποιθάς", "tens-confiado"],
  ["πέπονθεν", "tem-sofrido"],
  ["πέπρακεν", "tem-vendido"],
  ["πέπραχά", "tenho-praticado"],
  ["πέρας", "limite"],
  ["πέρατα", "confins"],
  ["πέριξ", "ao-redor"],
  ["πέσητε", "caiais"],
  ["πέσωσιν", "caiam"],
  ["πέσῃ", "caia"],
  ["πέτραι", "rochas"],
  ["πέτρας", "rocha"],

  // --- π- palavras (πή-, πί-) ---
  ["πήγανον", "arruda"],
  ["πήρας", "alforje"],
  ["πίε", "bebe"],
  ["πίεσαι", "beberás"],
  ["πίμπρασθαι", "inchar"],
  ["πίνακος", "bandeja"],
  ["πίνουσιν", "bebem"],
  ["πίπτοντες", "caindo"],
  ["πίστευε", "crê"],
  ["πίστευσον", "crê"],
  ["πίστεώς", "fé"],
  ["πίωσιν", "bebam"],

  // --- παι- palavras ---
  ["παίδων", "crianças"],
  ["παίζειν", "brincar"],
  ["παγίδος", "laço"],
  ["παγίς", "laço"],
  ["παγιδεύσωσιν", "enlacem"],
  ["παθητὸς", "sujeito-a-sofrimento"],
  ["παθοῦσα", "tendo-sofrido"],
  ["παθόντας", "tendo-sofrido"],
  ["παθόντος", "tendo-sofrido"],
  ["παθὼν", "tendo-sofrido"],
  ["παιδάριον", "rapazinho"],
  ["παιδίσκας", "servas"],
  ["παιδαγωγοὺς", "tutores"],
  ["παιδαγωγόν", "tutor"],
  ["παιδαγωγὸς", "tutor"],
  ["παιδεία", "disciplina"],
  ["παιδείᾳ", "disciplina"],
  ["παιδευθῶσιν", "sejam-disciplinados"],
  ["παιδευτὰς", "disciplinadores"],
  ["παιδευτὴν", "disciplinador"],
  ["παιδευόμεθα", "somos-disciplinados"],
  ["παιδευόμενοι", "sendo-disciplinados"],
  ["παιδεύοντα", "disciplinando"],
  ["παιδεύουσα", "disciplinando"],
  ["παιδισκῶν", "servas"],
  ["παιδιόθεν", "desde-a-infância"],
  ["παιδός", "criança"],
  ["παισὶν", "crianças"],

  // --- παλ- palavras ---
  ["παλαιούμενα", "sendo-envelhecidas"],
  ["παλαιούμενον", "sendo-envelhecido"],
  ["παλαιοῦ", "velho"],
  ["παλαιωθήσονται", "serão-envelhecidas"],
  ["παλαιότητι", "velhice"],
  ["παλαιᾶς", "velha"],
  ["παλαιᾷ", "velha"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11p (freq 1, parte 16/44) ===`);
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

console.log(`\n=== Resultado Lote 11p ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

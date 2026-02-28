#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11o
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 15/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11o-${Date.now()}.sql`);

const translations = [
  // === 248 palavras freq 1 — parte 15/44 ===

  // --- μεμ- palavras (perfeito) ---
  ["μεμονωμένη", "tendo-sido-isolada"],
  ["μεμφόμενος", "censurando"],
  ["μεμψίμοιροι", "murmuradores"],
  ["μεμύημαι", "tenho-sido-iniciado"],

  // --- μεν- palavras ---
  ["μενεῖ", "permanecerá"],
  ["μενῶ", "permanecerei"],

  // --- μερ- palavras ---
  ["μερίδος", "porção"],
  ["μερίμναις", "preocupações"],
  ["μερίσασθαι", "repartir"],
  ["μεριμνᾷς", "preocupas-te"],
  ["μεριμνῶσιν", "preocupem-se"],
  ["μερισμοῖς", "distribuições"],
  ["μερισμοῦ", "divisão"],
  ["μεριστὴν", "repartidor"],

  // --- μεσ- palavras ---
  ["μεσίτου", "mediador"],
  ["μεσίτῃ", "mediador"],
  ["μεσούσης", "estando-no-meio"],
  ["μεστοί", "cheios"],
  ["μεστοὶ", "cheios"],
  ["μεστόν", "cheio"],
  ["μεσότοιχον", "parede-do-meio"],

  // --- μετά- palavras ---
  ["μετάγεται", "é-dirigido"],
  ["μετάγομεν", "dirigimos"],
  ["μετάθεσιν", "mudança"],
  ["μετάθεσις", "mudança"],
  ["μετάλημψιν", "recebimento"],
  ["μετάνοιάν", "arrependimento"],

  // --- μετέ- palavras ---
  ["μετέβη", "passou"],
  ["μετέθηκεν", "transferiu"],
  ["μετέπειτα", "depois"],
  ["μετέσχεν", "participou"],
  ["μετέσχηκεν", "tem-participado"],
  ["μετέχομεν", "participamos"],
  ["μετέχουσιν", "participam"],
  ["μετέχω", "participo"],
  ["μετέχων", "participando"],

  // --- μεταβ- palavras ---
  ["μεταβέβηκεν", "tem-passado"],
  ["μεταβήσεται", "passará"],
  ["μεταβαίνετε", "passai"],
  ["μεταβαλόμενοι", "tendo-mudado"],
  ["μεταβεβήκαμεν", "temos-passado"],

  // --- μεταδ- palavras ---
  ["μεταδιδοὺς", "repartindo"],
  ["μεταδιδόναι", "repartir"],
  ["μεταδοῦναι", "repartir"],
  ["μεταδότω", "reparta"],
  ["μεταδῶ", "reparta"],

  // --- μεταθ- palavras ---
  ["μεταθέσεως", "mudança"],

  // --- μετακ- palavras ---
  ["μετακάλεσαι", "mandar-chamar"],
  ["μετακαλέσομαί", "mandarei-chamar"],
  ["μετακινούμενοι", "sendo-movidos"],

  // --- μεταλ- palavras ---
  ["μεταλαβὼν", "tendo-participado"],
  ["μεταλαμβάνει", "participa"],
  ["μεταλαμβάνειν", "participar"],

  // --- μεταμ- palavras ---
  ["μεταμέλομαι", "arrependo-me"],
  ["μεταμεληθήσεται", "arrepender-se-á"],
  ["μεταμορφούμεθα", "somos-transformados"],
  ["μεταμορφοῦσθε", "sede-transformados"],

  // --- μετανο- palavras ---
  ["μετανοήσατε", "arrependei-vos"],
  ["μετανοήσητε", "arrependais-vos"],
  ["μετανοήσουσιν", "arrepender-se-ão"],
  ["μετανοήσῃ", "arrependa-se"],
  ["μετανοεῖτε", "arrependei-vos"],
  ["μετανοησάντων", "tendo-se-arrependido"],
  ["μετανοῆτε", "arrependais-vos"],
  ["μετανοῶσιν", "arrependam-se"],

  // --- μεταπ- palavras ---
  ["μεταπέμψασθαί", "mandar-buscar"],
  ["μεταπέμψηται", "mande-buscar"],
  ["μεταπεμπόμενος", "mandando-buscar"],
  ["μεταπεμφθείς", "tendo-sido-mandado-buscar"],
  ["μεταπεμψάμενος", "tendo-mandado-buscar"],

  // --- μεταστ- palavras ---
  ["μεταστήσας", "tendo-removido"],
  ["μετασταθῶ", "seja-removido"],
  ["μεταστρέψαι", "converter"],
  ["μεταστραφήσεται", "será-convertida"],

  // --- μετασχ- palavras ---
  ["μετασχηματίζεται", "transfigura-se"],
  ["μετασχηματίζονται", "transfiguram-se"],
  ["μετασχηματίσει", "transformará"],
  ["μετασχηματιζόμενοι", "transfigurando-se"],

  // --- μετατ- palavras ---
  ["μετατίθεσθε", "transferis-vos"],
  ["μετατιθέντες", "transferindo"],
  ["μετατιθεμένης", "sendo-transferida"],
  ["μετατραπήτω", "seja-convertido"],

  // --- μετε- palavras ---
  ["μετελάμβανον", "participavam"],
  ["μετεμελήθητε", "arrependestes-vos"],
  ["μετεμελόμην", "arrependia-me"],
  ["μετενόησαν", "arrependeram-se"],
  ["μετεπέμψασθέ", "mandastes-buscar"],
  ["μετεπέμψατο", "mandou-buscar"],
  ["μετεσχημάτισα", "apliquei-figuradamente"],
  ["μετετέθη", "foi-transferido"],
  ["μετετέθησαν", "foram-transferidos"],
  ["μετεωρίζεσθε", "inquieteis-vos"],

  // --- μετοικ- palavras ---
  ["μετοικεσίαν", "deportação"],
  ["μετοικιῶ", "deportarei"],

  // --- μετοχ- palavras ---
  ["μετοχὴ", "participação"],

  // --- μετρ- palavras ---
  ["μετρίως", "moderadamente"],
  ["μετρητὰς", "metretas"],
  ["μετριοπαθεῖν", "ter-compaixão-moderada"],
  ["μετροῦντες", "medindo"],

  // --- μετό- palavras ---
  ["μετόχοις", "participantes"],

  // --- μετῴ- palavras ---
  ["μετῴκισεν", "deportou"],

  // --- μηδ- palavras ---
  ["μηδέν", "nada"],
  ["μηδέποτε", "nunca"],
  ["μηδέπω", "ainda-não"],
  ["μηδεὶς", "ninguém"],
  ["μηδ'", "nem"],

  // --- μηθ- palavras ---
  ["μηθὲν", "nada"],

  // --- μηκ- palavras ---
  ["μηκύνηται", "cresça"],

  // --- μηλ- palavras ---
  ["μηλωταῖς", "peles-de-ovelha"],

  // --- μην- palavras ---
  ["μηνυθείσης", "tendo-sido-informada"],
  ["μηνύσαντα", "tendo-informado"],
  ["μηνύσῃ", "informe"],
  ["μηνὶ", "mês"],

  // --- μητρ- palavras ---
  ["μητρολῴαις", "matricidas"],
  ["μητρός", "mãe"],

  // --- μια- palavras ---
  ["μιάσματα", "contaminações"],
  ["μιαίνουσιν", "contaminam"],
  ["μιασμοῦ", "contaminação"],

  // --- μικρ- palavras ---
  ["μικρόν", "pequeno"],
  ["μικρῷ", "pequeno"],

  // --- μιμ- palavras ---
  ["μιμεῖσθε", "imitai"],
  ["μιμνῄσκεσθε", "lembrais-vos"],
  ["μιμνῄσκῃ", "lembres-te"],
  ["μιμοῦ", "imita"],

  // --- μισ- palavras ---
  ["μισήσεις", "odiarás"],
  ["μισήσουσιν", "odiarão"],
  ["μισήσωσιν", "odeiem"],
  ["μισεῖν", "odiar"],
  ["μισθίων", "salários"],
  ["μισθαποδότης", "recompensador"],
  ["μισθωτός", "assalariado"],
  ["μισθωτὸς", "assalariado"],
  ["μισθωτῶν", "assalariados"],
  ["μισθόν", "salário"],
  ["μισθός", "salário"],
  ["μισθώματι", "aluguel"],
  ["μισθώσασθαι", "contratar"],
  ["μισούντων", "odiando"],
  ["μισοῦσιν", "odeiam"],
  ["μισῇ", "odeie"],

  // --- μνη- palavras ---
  ["μνήμην", "memória"],
  ["μνήσθητί", "lembra-te"],
  ["μνήσθητι", "lembra-te"],
  ["μνείᾳ", "lembrança"],
  ["μνημείοις", "sepulcros"],
  ["μνημονεύει", "lembra"],
  ["μνημονεύειν", "lembrar"],
  ["μνημονεύετέ", "lembrai"],
  ["μνημονεύητε", "lembreis"],
  ["μνημονεύωμεν", "lembremos"],
  ["μνησθήσομαι", "lembrarei"],
  ["μνησθῇς", "lembres-te"],
  ["μνησθῶ", "lembre-me"],
  ["μνηστευθείσης", "tendo-sido-desposada"],
  ["μνᾶν", "mina"],

  // --- μογ- palavras ---
  ["μογιλάλον", "gago"],

  // --- μοιχ- palavras ---
  ["μοιχαλίδα", "adúltera"],
  ["μοιχαλίδες", "adúlteras"],
  ["μοιχαλίδι", "adúltera"],
  ["μοιχαλίδος", "adúltera"],
  ["μοιχείᾳ", "adultério"],
  ["μοιχευθῆναι", "ser-adulterada"],
  ["μοιχευομένη", "sendo-adulterada"],
  ["μοιχεύειν", "adulterar"],
  ["μοιχοί", "adúlteros"],
  ["μοιχοὶ", "adúlteros"],
  ["μοιχοὺς", "adúlteros"],

  // --- μολ- palavras ---
  ["μολυσμοῦ", "contaminação"],
  ["μολύνεται", "é-contaminado"],

  // --- μομ- palavras ---
  ["μομφήν", "queixa"],

  // --- μον- palavras ---
  ["μοναὶ", "moradas"],
  ["μονογενής", "unigênito"],
  ["μονὴν", "morada"],

  // --- μορφ- palavras ---
  ["μορφωθῇ", "seja-formado"],
  ["μορφὴν", "forma"],

  // --- μυ- palavras ---
  ["μυελῶν", "medulas"],
  ["μυκτηρίζεται", "é-escarnecido"],
  ["μυλικὸς", "de-moinho"],

  // --- μυρ- palavras ---
  ["μυρίσαι", "ungir"],
  ["μυρίων", "dez-mil"],
  ["μυριάδας", "miríades"],
  ["μυριάδων", "miríades"],

  // --- μυστ- palavras ---
  ["μυστηρίων", "mistérios"],

  // --- μυωπ- palavras ---
  ["μυωπάζων", "sendo-míope"],

  // --- μωμ- palavras ---
  ["μωμήσηται", "seja-censurado"],
  ["μωμηθῇ", "seja-censurado"],

  // --- μωρ- palavras ---
  ["μωρίαν", "loucura"],
  ["μωρίας", "loucura"],
  ["μωρολογία", "conversa-tola"],
  ["μωρὰ", "tolas"],
  ["μωρὸν", "tolo"],
  ["μωρὸς", "tolo"],
  ["μωρῷ", "tolo"],

  // --- μό- palavras ---
  ["μόνα", "somente"],
  ["μόνην", "somente"],
  ["μόνοις", "somente"],
  ["μόχθον", "labuta"],

  // --- μύ- palavras ---
  ["μύλῳ", "moinho"],
  ["μύρα", "perfumes"],
  ["μύρον", "perfume"],

  // --- μώ- palavras ---
  ["μώλωπι", "ferida"],

  // --- μῆ- palavras ---
  ["μῆκος", "comprimento"],
  ["μῆνας", "meses"],

  // --- μῶ- palavras ---
  ["μῶμοι", "manchas"],

  // --- νέ- palavras ---
  ["νέφος", "nuvem"],

  // --- νή- palavras ---
  ["νήθει", "fia"],
  ["νήθουσιν", "fiam"],
  ["νήπιός", "infante"],
  ["νήσου", "ilha"],
  ["νήσῳ", "ilha"],
  ["νήφοντες", "sendo-sóbrios"],
  ["νήψατε", "sede-sóbrios"],

  // --- νί- palavras ---
  ["νίκα", "vence"],
  ["νίπτεις", "lavas"],
  ["νίπτονται", "lavam"],
  ["νίψασθαι", "lavar"],
  ["νίψω", "lavarei"],
  ["νίψωνται", "lavem"],
  ["νίψῃς", "laves"],

  // --- να- palavras ---
  ["ναοὺς", "templos"],
  ["ναοῖς", "templos"],
  ["ναυκλήρῳ", "piloto-do-navio"],
  ["ναυτῶν", "marinheiros"],
  ["ναῦν", "navio"],

  // --- νεαν- palavras ---
  ["νεανίαν", "jovem"],
  ["νεανίας", "jovem"],
  ["νεανίου", "jovem"],

  // --- νεκρ- palavras ---
  ["νεκράν", "morta"],
  ["νεκροί", "mortos"],
  ["νεκρούς", "mortos"],
  ["νεκροὺς", "mortos"],
  ["νεκρὸν", "morto"],

  // --- νεν- palavras ---
  ["νενίκηκα", "tenho-vencido"],
  ["νενεκρωμένον", "tendo-sido-mortificado"],
  ["νενεκρωμένου", "tendo-sido-mortificado"],

  // --- νεομ- palavras ---
  ["νεομηνίας", "lua-nova"],

  // --- νεφ- palavras ---
  ["νεφέλαι", "nuvens"],
  ["νεφέλη", "nuvem"],
  ["νεφέλην", "nuvem"],
  ["νεφέλης", "nuvem"],
  ["νεφελῶν", "nuvens"],

  // --- νεω- palavras ---
  ["νεωκόρον", "guardiã-do-templo"],
  ["νεωτερικὰς", "juvenis"],

  // --- νεό- palavras ---
  ["νεότητός", "juventude"],
  ["νεόφυτον", "neófito"],

  // --- νεύ- palavras ---
  ["νεύει", "acena"],
  ["νεύσαντος", "tendo-acenado"],

  // --- νηπ- palavras ---
  ["νηπίου", "infante"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11o (freq 1, parte 15/44) ===`);
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

console.log(`\n=== Resultado Lote 11o ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

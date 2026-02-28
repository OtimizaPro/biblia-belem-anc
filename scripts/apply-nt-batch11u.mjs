#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11u
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 21/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11u-${Date.now()}.sql`);

const translations = [
  // === Lote 11u — freq 1, parte 21/44 (248 palavras) ===

  // --- προσφέρω (oferecer) e derivados ---
  ["προσφέρων", "oferecendo"],
  ["προσφέρῃς", "ofereças"],
  ["προσφερόμεναι", "sendo-oferecidas"],
  ["προσφερόντων", "oferecendo"],
  ["προσφιλῆ", "amáveis"],
  ["προσφορά", "oferta"],
  ["προσφοράς", "ofertas"],
  ["προσφορὰς", "ofertas"],
  ["προσφορᾶς", "de-oferta"],
  ["προσφορᾷ", "em-oferta"],
  ["προσφωνοῦντα", "chamando"],
  ["προσφωνοῦσιν", "chamam"],
  ["προσψαύετε", "tocais"],
  ["προσωπολήμπτης", "aceitador-de-faces"],
  ["προσωπολημπτεῖτε", "aceitais-faces"],
  ["προσωπολημψίαις", "em-acepções-de-faces"],
  ["προσωρμίσθησαν", "ancoraram"],
  ["προσώπων", "de-faces"],
  ["προσώχθισα", "indignei-me"],
  ["προσώχθισεν", "indignou-se"],
  ["προσῆλθάν", "aproximaram-se"],
  ["προσῆλθαν", "aproximaram-se"],

  // --- πρότερος (anterior) ---
  ["προτέραν", "anterior"],

  // --- προτρέπω (exortar) ---
  ["προτρεψάμενοι", "tendo-exortado"],

  // --- προφήτης (profeta) e derivados ---
  ["προφήτῃ", "a-profeta"],
  ["προφητεία", "profecia"],
  ["προφητείᾳ", "em-profecia"],
  ["προφητεύομεν", "profetizamos"],
  ["προφητεύουσα", "profetizando"],
  ["προφητεύουσαι", "profetizando"],
  ["προφητεύσαντες", "tendo-profetizado"],
  ["προφητεύωσιν", "profetizem"],
  ["προφητεῖαι", "profecias"],
  ["προφητικὸν", "profético"],
  ["προφητικῶν", "proféticos"],
  ["προφῆτις", "profetisa"],

  // --- προχειρίζω (designar de antemão) ---
  ["προχειρίσασθαί", "designar-de-antemão"],

  // --- προοράω (prever) ---
  ["προϊδοῦσα", "tendo-previsto"],
  ["προϊδὼν", "tendo-previsto"],

  // --- προΐστημι (presidir) ---
  ["προϊστάμενοι", "presidindo"],
  ["προϊστάμενον", "presidindo"],
  ["προϊστάμενος", "presidindo"],
  ["προϊσταμένους", "presidindo"],

  // --- προϋπάρχω (existir anteriormente) ---
  ["προϋπῆρχεν", "existia-anteriormente"],
  ["προϋπῆρχον", "existiam-anteriormente"],

  // --- formas compostas com προ- ---
  ["προῃτιασάμεθα", "acusamos-anteriormente"],
  ["προῄρηται", "tem-escolhido-de-antemão"],
  ["προῆγεν", "conduzia-adiante"],

  // --- πρωΐ (manhã) ---
  ["πρωΐας", "de-manhã"],

  // --- πρωτεύω (ter a primazia) ---
  ["πρωτεύων", "tendo-a-primazia"],

  // --- πρῶτος (primeiro) e compostos ---
  ["πρωτοκαθεδρίαν", "primeiro-assento"],
  ["πρωτοστάτην", "líder-principal"],
  ["πρωτοτόκια", "primogenitura"],
  ["πρωτοτόκων", "de-primogênitos"],
  ["πρωτότοκα", "primogênitos"],

  // --- πρόβατον (ovelha) ---
  ["πρόβατόν", "ovelha"],

  // --- πρόγνωσις (presciência) ---
  ["πρόγνωσιν", "presciência"],

  // --- πρόδηλος (evidente) ---
  ["πρόδηλα", "evidentes"],
  ["πρόδηλοί", "evidentes"],
  ["πρόδηλον", "evidente"],

  // --- πρόδρομος (precursor) ---
  ["πρόδρομος", "precursor"],

  // --- πρόκειμαι (estar exposto / proposto) ---
  ["πρόκεινται", "estão-expostos"],
  ["πρόκειται", "está-exposto"],

  // --- πρόνοια (providência) ---
  ["πρόνοιαν", "providência"],

  // --- προπέμπω (enviar adiante) ---
  ["πρόπεμψον", "envia-adiante"],

  // --- προσεύχομαι (orar) ---
  ["πρόσευξαι", "ora"],

  // --- προσέχω (ter cuidado) ---
  ["πρόσεχε", "tem-cuidado"],

  // --- πρόσκαιρος (temporário) ---
  ["πρόσκαιρα", "temporárias"],
  ["πρόσκαιροί", "temporários"],
  ["πρόσκαιρον", "temporário"],
  ["πρόσκαιρός", "temporário"],

  // --- πρόσκλισις (inclinação / parcialidade) ---
  ["πρόσκλισιν", "parcialidade"],

  // --- πρόσλημψις (recepção) ---
  ["πρόσλημψις", "recepção"],

  // --- πρόσπεινος (faminto) ---
  ["πρόσπεινος", "faminto"],

  // --- πρόσφατος (recente) ---
  ["πρόσφατον", "recente"],

  // --- προσφέρω (oferecer) imperativo ---
  ["πρόσφερε", "oferece"],

  // --- πρόσχυσις (aspersão) ---
  ["πρόσχυσιν", "aspersão"],

  // --- πρόσωπον (face) ---
  ["πρόσωπα", "faces"],

  // --- πρόφασις (pretexto) ---
  ["πρόφασιν", "pretexto"],

  // --- πρόϊμος (temporão) ---
  ["πρόϊμον", "temporã"],

  // --- πρύμνα (popa) ---
  ["πρύμνα", "popa"],
  ["πρύμνης", "de-popa"],
  ["πρύμνῃ", "em-popa"],

  // --- πρώτως (primeiramente) ---
  ["πρώτως", "primeiramente"],

  // --- πράσσω (praticar) ---
  ["πρᾶξαι", "praticar"],

  // --- πρῷρα (proa) ---
  ["πρῴρης", "de-proa"],
  ["πρῷρα", "proa"],

  // --- πτέρνα (calcanhar) ---
  ["πτέρναν", "calcanhar"],

  // --- πτέρυξ (asa) ---
  ["πτέρυγας", "asas"],

  // --- πταίω (tropeçar) ---
  ["πταίει", "tropeça"],
  ["πταίομεν", "tropeçamos"],
  ["πταίσητέ", "tropeçais"],
  ["πταίσῃ", "tropece"],

  // --- πτηνόν (ave) ---
  ["πτηνῶν", "de-aves"],

  // --- πτοέω (aterrorizar) ---
  ["πτοηθέντες", "tendo-sido-aterrorizados"],
  ["πτοηθῆτε", "sejais-aterrorizados"],

  // --- πτύρω (assustar) ---
  ["πτυρόμενοι", "sendo-assustados"],

  // --- πτωχεία (pobreza) ---
  ["πτωχεία", "pobreza"],
  ["πτωχείᾳ", "em-pobreza"],

  // --- πτωχός (pobre) ---
  ["πτωχοί", "pobres"],
  ["πτωχούς", "pobres"],
  ["πτωχόν", "pobre"],
  ["πτωχὰ", "pobres"],
  ["πτωχὸν", "pobre"],
  ["πτωχὸς", "pobre"],
  ["πτωχῷ", "a-pobre"],

  // --- πτόησις (terror) ---
  ["πτόησιν", "terror"],

  // --- πτύσσω (enrolar) ---
  ["πτύξας", "tendo-enrolado"],

  // --- πτύσμα (cuspe) ---
  ["πτύσματος", "de-cuspe"],

  // --- πτῶσις (queda) ---
  ["πτῶσιν", "queda"],
  ["πτῶσις", "queda"],

  // --- πυγμή (punho) ---
  ["πυγμῇ", "com-punho"],

  // --- πυνθάνομαι (perguntar / informar-se) ---
  ["πυθόμενος", "tendo-perguntado"],
  ["πυνθάνεσθαι", "perguntar"],
  ["πυνθάνομαι", "pergunto"],

  // --- πυκνός (frequente) ---
  ["πυκνάς", "frequentes"],
  ["πυκνότερον", "mais-frequentemente"],
  ["πυκνὰ", "frequentemente"],

  // --- πυκτεύω (lutar com os punhos) ---
  ["πυκτεύω", "luto-com-os-punhos"],

  // --- πυλών (portão) ---
  ["πυλῶνας", "portões"],

  // --- πυρά (fogueira) ---
  ["πυράν", "fogueira"],
  ["πυρὰν", "fogueira"],

  // --- πυρέσσω (ter febre) ---
  ["πυρέσσουσα", "tendo-febre"],
  ["πυρέσσουσαν", "tendo-febre"],

  // --- πυρετός (febre) ---
  ["πυρετοῖς", "em-febres"],

  // --- πυρόω (queimar / inflamar) ---
  ["πυρούμενοι", "sendo-inflamados"],
  ["πυροῦμαι", "sou-inflamado"],
  ["πυροῦσθαι", "ser-inflamado"],
  ["πυρώσει", "em-queima"],

  // --- πωλέω (vender) ---
  ["πωλήσας", "tendo-vendido"],
  ["πωλεῖ", "vende"],
  ["πωλεῖται", "é-vendido"],
  ["πωλησάτω", "venda"],
  ["πωλούμενον", "sendo-vendido"],
  ["πωλοῦνται", "são-vendidos"],
  ["πωλοῦντες", "vendendo"],
  ["πωλοῦσιν", "vendem"],

  // --- πώρωσις (endurecimento) ---
  ["πωρώσει", "em-endurecimento"],
  ["πώρωσιν", "endurecimento"],
  ["πώρωσις", "endurecimento"],

  // --- πόλεμος (guerra) ---
  ["πόλεμοι", "guerras"],

  // --- πόμα (bebida) ---
  ["πόμα", "bebida"],
  ["πόμασιν", "em-bebidas"],

  // --- πόνος (dor) ---
  ["πόνον", "dor"],

  // --- πόρνη (prostituta) ---
  ["πόρνης", "de-prostituta"],
  ["πόρνῃ", "a-prostituta"],

  // --- πόρνος (fornicador) ---
  ["πόρνοι", "fornicadores"],
  ["πόρνους", "fornicadores"],

  // --- πόσος (quanto) ---
  ["πόσαι", "quantas"],
  ["πόσας", "quantas"],
  ["πόσει", "em-quantidade"],
  ["πόσην", "quanta"],
  ["πόσων", "de-quantos"],

  // --- πότερον (se / qual dos dois) ---
  ["πότερον", "qual-dos-dois"],

  // --- ποτίζω (dar de beber) ---
  ["πότιζε", "dá-de-beber"],

  // --- πότος (bebedeira) ---
  ["πότοις", "em-bebedeiras"],

  // --- πύλη (porta/portão) ---
  ["πύλαι", "portas"],
  ["πύλας", "portas"],
  ["πύλην", "porta"],
  ["πύλῃ", "em-porta"],

  // --- πύργος (torre) ---
  ["πύργος", "torre"],

  // --- πωλέω (vender) imperativo ---
  ["πώλησόν", "vende"],

  // === σ- palavras ===

  // --- σάββατον (sábado) ---
  ["σάββατα", "sábados"],

  // --- σάλος (agitação) ---
  ["σάλου", "de-agitação"],

  // --- σάλπιγξ (trombeta) ---
  ["σάλπιγγος", "de-trombeta"],
  ["σάλπιγξ", "trombeta"],

  // --- σάρκινος (carnal) ---
  ["σάρκινός", "carnal"],

  // --- σέβασμα (objeto-de-adoração) ---
  ["σέβασμα", "objeto-de-adoração"],

  // --- σέβομαι (adorar / reverenciar) ---
  ["σέβεσθαι", "adorar"],
  ["σέβεται", "adora"],

  // --- σήπω (apodrecer) ---
  ["σέσηπεν", "tem-apodrecido"],

  // --- σώζω (salvar) ---
  ["σέσωσται", "tem-sido-salvo"],

  // --- σίκερα (bebida-forte) ---
  ["σίκερα", "bebida-forte"],

  // --- σαίνω (abalar) ---
  ["σαίνεσθαι", "ser-abalado"],

  // --- σαββατισμός (repouso-sabático) ---
  ["σαββατισμὸς", "repouso-sabático"],

  // --- σαγήνη (rede-de-arrasto) ---
  ["σαγήνῃ", "em-rede-de-arrasto"],

  // --- σαλεύω (abalar / sacudir) ---
  ["σαλευθῶ", "seja-abalado"],
  ["σαλευομένων", "sendo-abalados"],
  ["σαλευόμενα", "sendo-abalados"],
  ["σαλεύοντες", "abalando"],
  ["σαλεῦσαι", "abalar"],

  // --- σαλπίζω (tocar trombeta) ---
  ["σαλπίσει", "tocará-trombeta"],
  ["σαλπίσῃς", "toques-trombeta"],

  // --- σανίς (tábua) ---
  ["σανίσιν", "em-tábuas"],

  // --- σανδάλιον (sandália) ---
  ["σανδάλιά", "sandálias"],
  ["σανδάλια", "sandálias"],

  // --- σαπρός (podre) ---
  ["σαπρὰ", "podre"],
  ["σαπρὸς", "podre"],

  // --- σαργάνη (cesto) ---
  ["σαργάνῃ", "em-cesto"],

  // --- σάρκινος / σαρκικός (carnal) ---
  ["σαρκίναις", "carnais"],
  ["σαρκίνης", "de-carnal"],
  ["σαρκίνοις", "carnais"],
  ["σαρκικοῖς", "carnais"],
  ["σαρκικῇ", "carnal"],
  ["σαρκικῶν", "carnais"],

  // --- σαρόω (varrer) ---
  ["σαροῖ", "varre"],

  // --- σβέννυμι (apagar / extinguir) ---
  ["σβέννυνται", "são-apagadas"],
  ["σβέννυται", "é-apagada"],
  ["σβέννυτε", "apagais"],
  ["σβέσαι", "apagar"],
  ["σβέσει", "apagará"],

  // --- σείω (sacudir) ---
  ["σείσω", "sacudirei"],

  // --- σέβασμα (objeto-de-adoração) plural ---
  ["σεβάσματα", "objetos-de-adoração"],

  // --- σέβομαι (adorar) particípios ---
  ["σεβομένας", "adorando"],
  ["σεβομένη", "adorando"],
  ["σεβομένοις", "adorando"],
  ["σεβομένου", "adorando"],

  // --- σειρά (corrente) ---
  ["σειροῖς", "em-correntes"],

  // --- σεισμός (terremoto) ---
  ["σεισμοί", "terremotos"],
  ["σεισμὸν", "terremoto"],

  // --- σελήνη (lua) ---
  ["σελήνης", "de-lua"],
  ["σελήνῃ", "em-lua"],

  // --- σεληνιάζομαι (ser-lunático) ---
  ["σεληνιάζεται", "é-lunático"],
  ["σεληνιαζομένους", "lunáticos"],

  // --- σεμνός (digno / venerável) ---
  ["σεμνά", "dignos"],
  ["σεμνάς", "dignas"],

  // --- σεμνότης (dignidade) ---
  ["σεμνότητα", "dignidade"],
  ["σεμνότητι", "em-dignidade"],
  ["σεμνότητος", "de-dignidade"],

  // --- σαλεύω perfeito (tendo-sido-sacudido) ---
  ["σεσαλευμένον", "tendo-sido-sacudido"],

  // --- σιγάω (calar / silenciar) ---
  ["σεσιγημένου", "tendo-sido-silenciado"],

  // --- σοφίζω (tornar-sábio) ---
  ["σεσοφισμένοις", "tendo-sido-tornados-sábios"],

  // --- σωρεύω (amontoar) ---
  ["σεσωρευμένα", "tendo-sido-amontoadas"],

  // --- σημεῖον (sinal) ---
  ["σημειοῦσθε", "notai"],
  ["σημεῖόν", "sinal"],

  // --- σημαίνω (sinalizar) ---
  ["σημᾶναι", "sinalizar"],

  // --- σητόβρωτος (comido-por-traças) ---
  ["σητόβρωτα", "comidos-por-traças"],

  // --- σθενόω (fortalecer) ---
  ["σθενώσει", "fortalecerá"],

  // --- σιγάω (calar) ---
  ["σιγάτωσαν", "calem-se"],
  ["σιγήσῃ", "cale-se"],
  ["σιγᾶν", "calar"],
  ["σιγῆς", "de-silêncio"],
  ["σιγῆσαι", "calar"],

  // --- σίδηρος (ferro) ---
  ["σιδηρᾶν", "de-ferro"],

  // --- σικάριος (sicário) ---
  ["σικαρίων", "de-sicários"],

  // --- σιμικίνθιον (avental) ---
  ["σιμικίνθια", "aventais"],

  // --- σινιάζω (peneirar) ---
  ["σινιάσαι", "peneirar"],

  // --- σιτίον (alimento / cereal) ---
  ["σιτία", "alimentos"],

  // --- σιτευτός (cevado) ---
  ["σιτευτὸν", "cevado"],

  // --- σιτιστός (engordado) ---
  ["σιτιστὰ", "engordados"],

  // --- σιτομέτριον (ração-de-cereal) ---
  ["σιτομέτριον", "ração-de-cereal"],

  // --- σιωπάω (calar-se) ---
  ["σιωπήσουσιν", "calarão"],
  ["σιωπήσωσιν", "calem-se"],
  ["σιωπήσῃ", "cale-se"],
  ["σιωπήσῃς", "cales-te"],
  ["σιωπῶν", "calando"],

  // --- σκάπτω (cavar) ---
  ["σκάπτειν", "cavar"],

  // --- σκάφη (bote) ---
  ["σκάφην", "bote"],
];

let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11u (freq 1, parte 21/44) ===`);
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

console.log(`\n=== Resultado Lote 11u ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

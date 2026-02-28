#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ag
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 33/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ag-${Date.now()}.sql`);
const translations = [
  // === Ἀ- palavras maiúsculas (início de frase / nomes próprios) ===
  ["Ἀκούσας", "Tendo-ouvido"],
  ["Ἀκούσατέ", "Ouvi"],
  ["Ἀκούσατε", "Ouvi"],
  ["Ἀλέξανδρον", "Alexandre"],
  ["Ἀλεξάνδρου", "Alexandre"],
  ["Ἀλεξανδρέων", "Alexandrinos"],
  ["Ἀλεξανδρεὺς", "Alexandrino"],
  ["Ἀλεξανδρινῷ", "Alexandrino"],
  ["Ἀλεξανδρῖνον", "Alexandrino"],
  ["Ἀλλήλων", "Uns-dos-outros"],
  ["Ἀμιναδάβ", "Aminadabe"],
  ["Ἀμπλιᾶτον", "Ampliato"],
  ["Ἀμφίπολιν", "Anfípolis"],
  ["Ἀμώς", "Amós"],
  ["Ἀνάβλεψον", "Olha-para-cima"],
  ["Ἀνάγκη", "Necessidade"],
  ["Ἀνάστα", "Levanta-te"],
  ["Ἀνένδεκτόν", "Impossível"],
  ["Ἀνέστη", "Levantou-se"],
  ["Ἀναβαίνω", "Subo"],
  ["Ἀναβλέψας", "Tendo-olhado-para-cima"],
  ["Ἀναβὰς", "Tendo-subido"],
  ["Ἀναθέματι", "Anátema"],
  ["Ἀναμιμνῄσκεσθε", "Lembrai-vos"],
  ["Ἀνανίαν", "Ananias"],
  ["Ἀνασείει", "Incita"],
  ["Ἀναστήσεται", "Levantar-se-á"],
  ["Ἀναστᾶσα", "Tendo-se-levantado"],
  ["Ἀναχωρεῖτε", "Retirai-vos"],
  ["Ἀναχωρησάντων", "Tendo-se-retirado"],
  ["Ἀνδρέᾳ", "André"],
  ["Ἀνδρόνικον", "Andrônico"],
  ["Ἀνεβάλετο", "Adiou"],
  ["Ἀνοίξας", "Tendo-aberto"],
  ["Ἀνοίξω", "Abrirei"],
  ["Ἀντιοχέα", "Antioqueno"],
  ["Ἀντιπατρίδα", "Antipátride"],
  ["Ἀντλήσατε", "Tirai"],
  ["Ἀπέσταλκαν", "Têm-enviado"],
  ["Ἀπαγγείλατε", "Anunciai"],
  ["Ἀπαγγελῶ", "Anunciarei"],
  ["Ἀπεκρίθησαν", "Responderam"],
  ["Ἀπεκρίνατο", "Respondeu"],
  ["Ἀπελθόντες", "Tendo-partido"],
  ["Ἀπελθόντων", "Tendo-partido"],
  ["Ἀπελλῆν", "Apeles"],
  ["Ἀποθέμενοι", "Tendo-despido"],
  ["Ἀποκαλύπτεται", "É-revelado"],
  ["Ἀπολελύσθαι", "Ter-sido-solto"],
  ["Ἀπολλωνίαν", "Apolônia"],
  ["Ἀπολυθέντες", "Tendo-sido-soltos"],
  ["Ἀπολῶ", "Destruirei"],
  ["Ἀποστήτω", "Afaste-se"],
  ["Ἀποστελῶ", "Enviarei"],
  ["Ἀππίου", "Ápio"],
  ["Ἀπφίᾳ", "Áfia"],
  ["Ἀπόδος", "Devolve"],
  ["Ἀπόδοτε", "Devolvei"],
  ["Ἀπόστειλον", "Envia"],
  ["Ἀπόστολον", "Apóstolo"],
  ["Ἀπόστρεψον", "Volta-atrás"],
  ["Ἀράμ", "Arão"],
  ["Ἀρέτα", "Aretas"],
  ["Ἀρίσταρχον", "Aristarco"],
  ["Ἀραβίαν", "Arábia"],
  ["Ἀραβίᾳ", "Arábia"],
  ["Ἀργύριον", "Prata"],
  ["Ἀρείου", "Areio"],
  ["Ἀρεοπαγείτης", "Areopagita"],
  ["Ἀριστάρχου", "Aristarco"],
  ["Ἀριστοβούλου", "Aristóbulo"],
  ["Ἀρκεῖ", "Basta"],
  ["Ἀρνεὶ", "Arni"],
  ["Ἀρτεμᾶν", "Artemas"],
  ["Ἀρφαξὰδ", "Arfaxade"],
  ["Ἀρχέλαος", "Arquelau"],
  ["Ἀρχιερέα", "Sumo-sacerdote"],
  ["Ἀρχιποίμενος", "Sumo-pastor"],
  ["Ἀρχόμεθα", "Começamos"],
  ["Ἀρὰμ", "Arão"],
  ["Ἀσάφ", "Asafe"],
  ["Ἀσήρ", "Aser"],
  ["Ἀσία", "Ásia"],
  ["Ἀσιανοὶ", "Asianos"],
  ["Ἀσιαρχῶν", "Asiarcas"],
  ["Ἀσπάζονταί", "Saúdam"],
  ["Ἀσύνκριτον", "Assíncrito"],
  ["Ἀσὰφ", "Asafe"],
  ["Ἀτταλίαν", "Atália"],
  ["Ἀφιλάργυρος", "Sem-amor-ao-dinheiro"],
  ["Ἀφορίσατε", "Separai"],
  ["Ἀφ'", "De"],
  ["Ἀχαϊκοῦ", "Acaico"],
  ["Ἀχείμ", "Aquim"],
  ["Ἀχεὶμ", "Aquim"],

  // === Ἁ- palavras com espírito áspero ===
  ["Ἁγιασθήτω", "Seja-santificado"],
  ["Ἁριμαθαίας", "Arimateia"],

  // === Ἄ- palavras com acento agudo ===
  ["Ἄγαβος", "Ágabo"],
  ["Ἄζωτον", "Azoto"],
  ["Ἄκουε", "Ouve"],
  ["Ἄνθρωποι", "Homens"],
  ["Ἄραβες", "Árabes"],
  ["Ἄραγε", "Porventura"],
  ["Ἄρειον", "Areio"],
  ["Ἄρτον", "Pão"],
  ["Ἄρτους", "Pães"],
  ["Ἄρχοντα", "Governante"],
  ["Ἄρχοντες", "Governantes"],
  ["Ἄσπασαι", "Saúda"],
  ["Ἄφρων", "Insensato"],

  // === Ἅ- palavras com espírito áspero e acento ===
  ["Ἅβελ", "Abel"],
  ["Ἅγαβος", "Ágabo"],
  ["Ἅιδῃ", "Hades"],
  ["Ἅνναν", "Anás"],

  // === Ἆ- palavras com circunflexo ===
  ["Ἆρά", "Porventura"],

  // === ἐά- verbos aoristo e formas ===
  ["ἐάσαντες", "tendo-permitido"],
  ["ἐάσει", "permitirá"],

  // === ἐβ- verbos aoristo ===
  ["ἐβάθυνεν", "aprofundou"],
  ["ἐβάσκανεν", "enfeitiçou"],
  ["ἐβάστασας", "carregaste"],
  ["ἐβάστασεν", "carregou"],
  ["ἐβέβλητο", "havia-sido-lançado"],
  ["ἐβαπτίσαντο", "batizaram-se"],
  ["ἐβαρήθημεν", "fomos-sobrecarregados"],
  ["ἐβασάνιζεν", "atormentava"],
  ["ἐβαστάζετο", "era-carregado"],
  ["ἐβλήθη", "foi-lançado"],
  ["ἐβλασφήμει", "blasfemava"],
  ["ἐβοήθησά", "socorri"],
  ["ἐβουλήθη", "quis"],
  ["ἐβουλήθην", "quis"],
  ["ἐβουλεύοντο", "deliberavam"],
  ["ἐβούλετο", "queria"],

  // === ἐγ- verbos aoristo ===
  ["ἐγάμησεν", "casou"],
  ["ἐγάμουν", "casavam"],
  ["ἐγέννησαν", "geraram"],
  ["ἐγέρθητι", "levanta-te"],
  ["ἐγίνωσκον", "conheciam"],
  ["ἐγαμίζοντο", "eram-dados-em-casamento"],
  ["ἐγγίζομεν", "aproximamo-nos"],
  ["ἐγγίζοντες", "aproximando-se"],
  ["ἐγγίζοντι", "aproximando-se"],
  ["ἐγγίζοντος", "aproximando-se"],
  ["ἐγγίζουσαν", "aproximando-se"],
  ["ἐγγίζουσιν", "aproximam-se"],
  ["ἐγγίσαι", "aproximar-se"],
  ["ἐγγίσαντος", "tendo-se-aproximado"],
  ["ἐγγίσατε", "aproximai-vos"],
  ["ἐγγίσει", "aproximar-se-á"],
  ["ἐγγιζόντων", "aproximando-se"],
  ["ἐγγύτερον", "mais-perto"],
  ["ἐγείρετε", "levantai"],
  ["ἐγείρηται", "tenha-sido-levantado"],
  ["ἐγείρομαι", "levanto-me"],
  ["ἐγείροντι", "levantando"],
  ["ἐγείρουσιν", "levantam"],
  ["ἐγεγόνει", "tinha-acontecido"],
  ["ἐγενήθην", "tornei-me"],
  ["ἐγενήθησάν", "tornaram-se"],
  ["ἐγεννήθης", "foste-gerado"],
  ["ἐγερεῖς", "levantarás"],
  ["ἐγερθείς", "tendo-sido-levantado"],
  ["ἐγερῶ", "levantarei"],
  ["ἐγεύσασθε", "provastes"],
  ["ἐγεύσατο", "provou"],

  // === ἐγκ- verbos compostos ===
  ["ἐγκακήσητε", "desanimeis"],
  ["ἐγκαλέσει", "acusará"],
  ["ἐγκαλείτωσαν", "acusem"],
  ["ἐγκαλεῖσθαι", "ser-acusado"],
  ["ἐγκαλούμενον", "sendo-acusado"],
  ["ἐγκατέλιπές", "abandonaste"],
  ["ἐγκατέλιπες", "abandonaste"],
  ["ἐγκατέλιπον", "abandonaram"],
  ["ἐγκαταλίπω", "abandone"],
  ["ἐγκαταλείποντες", "abandonando"],
  ["ἐγκαταλειπόμενοι", "sendo-abandonados"],
  ["ἐγκεντρισθῶ", "seja-enxertado"],
  ["ἐγκλήματος", "acusação"],
  ["ἐγκομβώσασθε", "revesti-vos-de-humildade"],
  ["ἐγκράτεια", "domínio-próprio"],
  ["ἐγκράτειαν", "domínio-próprio"],
  ["ἐγκρατείας", "domínio-próprio"],
  ["ἐγκρατείᾳ", "domínio-próprio"],
  ["ἐγκρατεύεται", "domina-se"],
  ["ἐγκρατεύονται", "dominam-se"],
  ["ἐγκρατῆ", "dominado"],
  ["ἐγκύῳ", "grávida"],

  // === ἐγν- verbos de γινώσκω ===
  ["ἐγνωκέναι", "ter-conhecido"],
  ["ἐγνωκότες", "tendo-conhecido"],
  ["ἐγνωρίσαμεν", "fizemos-conhecer"],
  ["ἐγνώκειτέ", "tínheis-conhecido"],
  ["ἐγνώκειτε", "tínheis-conhecido"],
  ["ἐγνώρισάς", "fizeste-conhecer"],
  ["ἐγνώρισαν", "fizeram-conhecer"],
  ["ἐγνώρισεν", "fez-conhecer"],

  // === ἐγρ- verbos de γράφω e γρηγορέω ===
  ["ἐγράψατε", "escrevestes"],
  ["ἐγρηγόρησεν", "vigiou"],

  // === ἐγο- verbo de γογγύζω ===
  ["ἐγόγγυσαν", "murmuraram"],

  // === ἐδ- verbos aoristo ===
  ["ἐδάκρυσεν", "chorou"],
  ["ἐδέξασθέ", "recebestes"],
  ["ἐδήλου", "indicava"],
  ["ἐδήλωσέν", "revelou"],
  ["ἐδίδαξέν", "ensinou"],
  ["ἐδίδαξα", "ensinei"],
  ["ἐδίδαξαν", "ensinaram"],
  ["ἐδίδαξας", "ensinaste"],
  ["ἐδίδοσαν", "davam"],
  ["ἐδίστασαν", "duvidaram"],
  ["ἐδίστασας", "duvidaste"],
  ["ἐδίωκεν", "perseguia"],
  ["ἐδαφιοῦσίν", "lançarão-ao-chão"],
  ["ἐδεήθη", "suplicou"],
  ["ἐδειγμάτισεν", "expôs-publicamente"],
  ["ἐδεξάμεθα", "recebemos"],
  ["ἐδεσμεύετο", "estava-preso"],
  ["ἐδεῖτο", "suplicava"],
  ["ἐδηλώθη", "foi-revelado"],
  ["ἐδημηγόρει", "discursava"],
  ["ἐδιδάχθην", "fui-ensinado"],
  ["ἐδιδάχθησαν", "foram-ensinados"],
  ["ἐδικαίωσαν", "justificaram"],
  ["ἐδικαιώθητε", "fostes-justificados"],
  ["ἐδοκίμασαν", "aprovaram"],
  ["ἐδοκιμάσαμεν", "fomos-aprovados"],
  ["ἐδολιοῦσαν", "enganavam"],
  ["ἐδουλεύσατε", "servistes"],
  ["ἐδουλώθητε", "fostes-escravizados"],
  ["ἐδούλευσεν", "serviu"],
  ["ἐδούλωσα", "escravizei"],
  ["ἐδυναμώθησαν", "foram-fortalecidos"],
  ["ἐδωρήσατο", "concedeu"],
  ["ἐδόθη", "foi-dado"],
  ["ἐδόκει", "parecia"],
  ["ἐδύνασθε", "podíeis"],
  ["ἐδώκαμεν", "demos"],

  // === ἐζ- verbos aoristo ===
  ["ἐζήτησέν", "buscou"],
  ["ἐζήτησαν", "buscaram"],
  ["ἐζημιώθην", "sofri-perda"],
  ["ἐζητήσαμεν", "buscamos"],
  ["ἐζητεῖτέ", "buscáveis"],
  ["ἐζητεῖτο", "era-buscado"],
  ["ἐζωγρημένοι", "tendo-sido-capturados-vivos"],
  ["ἐζώννυες", "te-cingias"],
  ["ἐζῆτε", "vivíeis"],

  // === ἐθ- verbos aoristo ===
  ["ἐθήλασας", "amamentaste"],
  ["ἐθαμβήθησαν", "ficaram-atônitos"],
  ["ἐθανατώθητε", "fostes-mortos"],
];
let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11ag (freq 1, parte 33/44) ===`);
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
console.log(`\n=== Resultado Lote 11ag ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

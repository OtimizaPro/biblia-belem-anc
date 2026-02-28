#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11a
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 1/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11a-${Date.now()}.sql`);

const translations = [
  // === Índices 0-247 de freq1-words.json (248 palavras) ===

  // --- ALL CAPS ---
  ["ΑΓΝΩΣΤΩ", "DESCONHECIDO"],
  ["ΑΝΑΘΕΜΑ", "ANÁTEMA"],
  ["ΒΑΒΥΛΩΝ", "BABILÔNIA"],
  ["ΕΣΤΙΝ", "É"],
  ["ΘΕΩ", "THEOS"],

  // --- Αι- palavras ---
  ["Αἰγυπτίων", "Egípcios"],
  ["Αἰγύπτιοι", "Egípcios"],
  ["Αἰγύπτιος", "Egípcio"],
  ["Αἰθίοψ", "Etíope"],
  ["Αἰθιόπων", "Etíopes"],
  ["Αἰνέα", "Eneias"],
  ["Αἰνέαν", "Eneias"],
  ["Αἰνεῖτε", "Louvai"],
  ["Αἰνὼν", "Enom"],
  ["Αἰτεῖτε", "Pedi"],
  ["Αἴτησόν", "Pede"],

  // --- Αυ- palavras ---
  ["Αὐγούστου", "Augusto"],
  ["Αὔριον", "Amanhã"],

  // --- Β- palavras (nomes próprios e verbos) ---
  ["Βάαλ", "Baal"],
  ["Βάλε", "Lança"],
  ["Βάλετε", "Lançai"],
  ["Βέροιαν", "Bereia"],
  ["Βαβυλῶνι", "Babilônia"],
  ["Βαπτίζοντος", "Batizando"],
  ["Βαπτίζων", "Batizando"],
  ["Βαπτιστής", "Batista"],
  ["Βαράκ", "Baraque"],
  ["Βαραχίου", "Baraquias"],
  ["Βαρβάροις", "Bárbaros"],
  ["Βαριησοῦς", "Bar-Iesous"],
  ["Βαριωνᾶ", "Bar-Jonas"],
  ["Βαρτιμαῖος", "Bartimeu"],
  ["Βασιλεύς", "Rei"],
  ["Βασιλεῖ", "Rei"],
  ["Βελιάρ", "Belial"],
  ["Βερνίκης", "Berenice"],
  ["Βεροίᾳ", "Bereia"],
  ["Βεροιαῖος", "Bereiano"],
  ["Βεώρ", "Beor"],
  ["Βηθανία", "Betânia"],
  ["Βηθζαθά", "Betzatá"],
  ["Βηθλεέμ", "Belém"],
  ["Βηθσαϊδὰ", "Betsaida"],
  ["Βιθυνίαν", "Bitínia"],
  ["Βιθυνίας", "Bitínia"],
  ["Βλάστον", "Blasto"],
  ["Βλέπε", "Olha"],
  ["Βλέπεις", "Vês"],
  ["Βλέπομεν", "Vemos"],
  ["Βλέψον", "Olha"],
  ["Βλασφημεῖς", "Blasfemas"],
  ["Βοανηργές", "Boanerges"],
  ["Βούλομαι", "Quero"],
  ["Βοὸς", "Boaz"],
  ["Βοῦν", "Boi"],

  // --- Γ- palavras ---
  ["Γάζαν", "Gaza"],
  ["Γέγονα", "Tenho-me-tornado"],
  ["Γαΐῳ", "Gaio"],
  ["Γαββαθα", "Gabatá"],
  ["Γαδαρηνῶν", "Gadarenos"],
  ["Γαλάται", "Gálatas"],
  ["Γαλατίαν", "Galácia"],
  ["Γαλιλαία", "Galileia"],
  ["Γαλιλαίου", "Galileu"],
  ["Γαλιλαίους", "Galileus"],
  ["Γαλιλαίων", "Galileus"],
  ["Γαλλίων", "Gálio"],
  ["Γαλλίωνι", "Gálio"],
  ["Γαλλίωνος", "Gálio"],
  ["Γεδεών", "Gedeão"],
  ["Γεμίσατε", "Enchei"],
  ["Γενεὰ", "Geração"],
  ["Γεννησαρὲτ", "Genesaré"],
  ["Γενομένων", "Tendo-acontecido"],
  ["Γινώσκειν", "Conhecer"],
  ["Γλεύκους", "Mosto"],
  ["Γνωρίζομεν", "Fazemos-conhecer"],
  ["Γνωρίζω", "Faço-conhecer"],
  ["Γνῶθι", "Conhece"],
  ["Γολγοθᾶν", "Gólgota"],
  ["Γομόρρας", "Gomorra"],
  ["Γομόρρων", "Gomorra"],
  ["Γυναῖκα", "Mulher"],

  // --- Δ- palavras ---
  ["Δάμαρις", "Dâmaris"],
  ["Δέομαί", "Rogo"],
  ["Δήσαντες", "Tendo-amarrado"],
  ["Δία", "Zeus"],
  ["Δίκη", "Justiça"],
  ["Δαλμανουθά", "Dalmanuta"],
  ["Δαλματίαν", "Dalmácia"],
  ["Δαμασκηνῶν", "Damascenos"],
  ["Δανιὴλ", "Daniel"],
  ["Δεήθητε", "Rogai"],
  ["Δείξατέ", "Mostrai"],
  ["Δείραντες", "Tendo-espancado"],
  ["Δεκαπόλει", "Decápolis"],
  ["Δερβαῖος", "De-Derbe"],
  ["Δεσπότην", "Soberano"],
  ["Δεῖξον", "Mostra"],
  ["Δημητρίῳ", "Demétrio"],
  ["Διαβὰς", "Tendo-atravessado"],
  ["Διαιρέσεις", "Distribuições"],
  ["Διακοσίων", "Duzentos"],
  ["Διακούσομαί", "Ouvirei-plenamente"],
  ["Διακόνους", "Servos"],
  ["Διαμαρτύρομαι", "Testifico-solenemente"],
  ["Διανοίχθητι", "Sê-aberto"],
  ["Διασάφησον", "Explica-claramente"],
  ["Διασπορὰν", "Dispersão"],
  ["Διασπορᾶς", "Dispersão"],
  ["Διασπορᾷ", "Dispersão"],
  ["Διατρίψας", "Tendo-permanecido"],
  ["Διδάσκαλον", "Mestre"],
  ["Διεμερίσαντο", "Dividiram-entre-si"],
  ["Διετίας", "Dois-anos"],
  ["Δικαίου", "Justo"],
  ["Δικαιωθέντες", "Tendo-sido-justificados"],
  ["Διοδεύσαντες", "Tendo-percorrido"],
  ["Διονύσιος", "Dionísio"],
  ["Διοσκούροις", "Dióscuros"],
  ["Διοτρεφὴς", "Diótrefes"],
  ["Διψῶ", "Tenho-sede"],
  ["Διόπερ", "Por-isso-mesmo"],
  ["Διώκετε", "Persegui"],
  ["Διὸς", "Zeus"],
  ["Διῆλθον", "Atravessaram"],
  ["Δι'", "Através-de"],
  ["Δοκεῖτε", "Pensais"],
  ["Δοῦλε", "Servo"],
  ["Δοῦλοι", "Servos"],
  ["Δρουσίλλῃ", "Drusila"],
  ["Δυνάμεις", "Poderes"],
  ["Δυνάστης", "Governante"],
  ["Δύνοντος", "Pondo-se"],
  ["Δώδεκα", "Doze"],

  // --- Ε- palavras ---
  ["Εἰπέ", "Dize"],
  ["Εἰσέλθατε", "Entrai"],
  ["Εἰσελθόντος", "Tendo-entrado"],
  ["Εἰσελθὼν", "Tendo-entrado"],
  ["Εἰσερχόμεθα", "Entramos"],
  ["Εἰσῆλθες", "Entraste"],
  ["Εἴδομεν", "Vimos"],
  ["Εἴρηται", "Tem-sido-dito"],
  ["Εἶπαν", "Disseram"],
  ["Εἶπον", "Disseram"],
  ["Εἶχε", "Tinha"],

  // --- Ευ- palavras ---
  ["Εὐδία", "Bom-tempo"],
  ["Εὐθέως", "Imediatamente"],
  ["Εὐθεῖαν", "Reta"],
  ["Εὐθύνατε", "Endireitai"],
  ["Εὐλογητοῦ", "Bendito"],
  ["Εὐνίκῃ", "Eunice"],
  ["Εὐξαίμην", "Eu-desejaria"],
  ["Εὐοδίαν", "Evódia"],
  ["Εὐρακύλων", "Euroaquilão"],
  ["Εὐφράνθητε", "Alegrai-vos"],
  ["Εὐφράνθητι", "Alegra-te"],
  ["Εὐχαριστεῖν", "Dar-graças"],
  ["Εὑρέθην", "Fui-encontrado"],
  ["Εὑρήκαμεν", "Encontramos"],
  ["Εὔα", "Eva"],
  ["Εὔβουλος", "Eubulo"],
  ["Εὔτυχος", "Êutico"],
  ["Εὕαν", "Eva"],
  ["Εὖγε", "Bem"],
  ["Εὗρον", "Encontraram"],

  // --- Ζ- palavras ---
  ["Ζακχαῖε", "Zaqueu"],
  ["Ζαρὰ", "Zará"],
  ["Ζαχαρία", "Zacarias"],
  ["Ζεβεδαῖον", "Zebedeu"],
  ["Ζεύγη", "Pares"],
  ["Ζηλωτὴν", "Zelote"],
  ["Ζηλωτὴς", "Zelote"],
  ["Ζηλώσαντες", "Tendo-sido-zelosos"],
  ["Ζηνᾶν", "Zenas"],
  ["Ζητήσετέ", "Buscareis"],
  ["Ζητούντων", "Buscando"],
  ["Ζοροβάβελ", "Zorobabel"],
  ["Ζοροβαβέλ", "Zorobabel"],
  ["Ζοροβαβὲλ", "Zorobabel"],
  ["Ζῶ", "Vivo"],
  ["Ζῶσαι", "Cinge-te"],

  // --- Θ- palavras ---
  ["Θάλασσαν", "Mar"],
  ["Θάμαρ", "Tamar"],
  ["Θάρα", "Terá"],
  ["Θέλετε", "Quereis"],
  ["Θέσθε", "Ponde"],
  ["Θαδδαῖον", "Tadeu"],
  ["Θαδδαῖος", "Tadeu"],
  ["Θαρροῦντες", "Tendo-coragem"],
  ["Θαυμάζω", "Admiro-me"],
  ["Θεοί", "Deuses"],
  ["Θεσσαλονίκης", "Tessalônica"],
  ["Θεσσαλονικέως", "Tessalonicense"],
  ["Θευδᾶς", "Teudas"],
  ["Θεωρεῖς", "Contemplas"],
  ["Θεωροῦντες", "Contemplando"],
  ["Θεότητος", "Divindade"],
  ["Θυατείρων", "Tiatira"],
  ["Θυγατέρες", "Filhas"],
  ["Θυσίαν", "Sacrifício"],
  ["Θυσίας", "Sacrifício"],
  ["Θωμᾷ", "Tomé"],

  // --- Κ- palavras (Κά-Κε) ---
  ["Κάλεσον", "Chama"],
  ["Κάρπῳ", "Carpo"],
  ["Κέδρων", "Cedrom"],
  ["Καί", "E"],
  ["Καίσαρά", "César"],
  ["Καίσαρί", "César"],
  ["Καθάπερ", "Assim-como"],
  ["Καθημένου", "Estando-sentado"],
  ["Καιρῷ", "Tempo"],
  ["Καισαρίᾳ", "Cesareia"],
  ["Κακοπαθεῖ", "Sofre-males"],
  ["Κακοὺς", "Maus"],
  ["Καλέσω", "Chamarei"],
  ["Καλοὺς", "Bons"],
  ["Καλύψατε", "Cobri"],
  ["Καναναῖον", "Cananeu"],
  ["Καναναῖος", "Cananeu"],
  ["Κανδάκης", "Candace"],
  ["Κανᾶ", "Caná"],
  ["Καππαδοκίαν", "Capadócia"],
  ["Καππαδοκίας", "Capadócia"],
  ["Κατέλιπον", "Deixei"],
  ["Κατήντησεν", "Chegou"],
  ["Καταβάντος", "Tendo-descido"],
  ["Κατακλίνατε", "Fazei-reclinar"],
  ["Κατακολουθήσασαι", "Tendo-seguido"],
  ["Κατεπόθη", "Foi-tragado"],
  ["Κατ'", "Segundo"],
  ["Καυχάσθω", "Glorie-se"],
  ["Καυχᾶσθαι", "Gloriar-se"],
  ["Καύσων", "Calor-abrasador"],
  ["Κείς", "E-para"],
  ["Κεφάλαιον", "Ponto-principal"],
  ["Κεφαλήν", "Cabeça"],
  ["Κηφᾶ", "Cefas"],
  ["Κηφᾶν", "Cefas"],
  ["Κλήμεντος", "Clemente"],
  ["Κλαυδία", "Cláudia"],
  ["Κλαυδίου", "Cláudio"],
  ["Κλαύδιον", "Cláudio"],
  ["Κλαύδιος", "Cláudio"],
  ["Κλαῦδα", "Clauda"],
  ["Κλεοπᾶς", "Cleopas"],
  ["Κλωπᾶ", "Clopas"],
  ["Κνίδον", "Cnido"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11a (freq 1, parte 1/44) ===`);
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

console.log(`\n=== Resultado Lote 11a ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

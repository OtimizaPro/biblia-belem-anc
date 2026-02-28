#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11c
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 3/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11c-${Date.now()}.sql`);

const translations = [
  // === Índices 496-743 de freq1-words.json (248 palavras) ===

  // --- Π- palavras (continuação) ---
  ["Προσηνέγκατέ", "Trouxestes"],
  ["Προσκυνήσεις", "Adorarás"],
  ["Πρωΐας", "Manhã"],
  ["Πρωῒ", "De-manhã"],
  ["Πρόσελθε", "Aproxima-te"],
  ["Πρόσθες", "Acrescenta"],
  ["Πρόχορον", "Prócoro"],
  ["Πτολεμαΐδα", "Ptolemaida"],
  ["Πωλήσατε", "Vendei"],
  ["Πόντιος", "Pôncio"],
  ["Πόντον", "Ponto"],
  ["Πόντου", "Ponto"],
  ["Πόρκιον", "Pórcio"],
  ["Πόσοι", "Quantos"],
  ["Πόσον", "Quanto"],
  ["Πόσος", "Quanto"],
  ["Πύθωνα", "Píton"],
  ["Πύλῃ", "Porta"],
  ["Πύρρου", "Pirro"],

  // --- Σά- palavras ---
  ["Σάββατόν", "Sábado"],
  ["Σάμον", "Samos"],
  ["Σάρεπτα", "Sarepta"],
  ["Σάρρα", "Sara"],
  ["Σάρρας", "Sara"],
  ["Σαδδουκαίους", "Saduceus"],
  ["Σαδώκ", "Sadoque"],
  ["Σαδὼκ", "Sadoque"],
  ["Σαλαθιήλ", "Salatiel"],
  ["Σαλαμῖνι", "Salamina"],
  ["Σαλείμ", "Salim"],
  ["Σαλμών", "Salmom"],
  ["Σαλμώνην", "Salmone"],
  ["Σαλμὼν", "Salmom"],

  // --- Σαμ- palavras ---
  ["Σαμάρια", "Samaria"],
  ["Σαμάριαν", "Samaria"],
  ["Σαμαρίᾳ", "Samaria"],
  ["Σαμαρείταις", "Samaritanos"],
  ["Σαμαρείτιδος", "Samaritana"],
  ["Σαμαρεῖται", "Samaritanos"],
  ["Σαμαρεῖτις", "Samaritana"],
  ["Σαμοθρᾴκην", "Samotrácia"],
  ["Σαμψών", "Sansão"],
  ["Σαπφείρῃ", "Safira"],
  ["Σαρῶνα", "Sarom"],
  ["Σατανᾶ", "Satanás"],
  ["Σαύλῳ", "Saulo"],

  // --- Σε- palavras ---
  ["Σεβαστοῦ", "Augusto"],
  ["Σεβαστὸν", "Augusto"],
  ["Σεβαστῆς", "Augusta"],
  ["Σεκοῦνδος", "Segundo"],
  ["Σελεύκιαν", "Selêucia"],
  ["Σεμεεὶν", "Semeí"],
  ["Σεργίῳ", "Sérgio"],
  ["Σεροὺχ", "Serugue"],

  // --- Σι- palavras ---
  ["Σιδωνίας", "Sidônia"],
  ["Σιδωνίοις", "Sidônios"],
  ["Σιλωάμ", "Siloé"],
  ["Σιώπα", "Cala-te"],

  // --- Σκ- palavras ---
  ["Σκευᾶ", "Ceva"],
  ["Σκιὰν", "Sombra"],
  ["Σκληροτράχηλοι", "Duros-de-cerviz"],
  ["Σκληρός", "Duro"],
  ["Σκύθης", "Cita"],

  // --- Σο- palavras ---
  ["Σολομῶν", "Salomão"],
  ["Σολομῶνα", "Salomão"],
  ["Σουσάννα", "Susana"],

  // --- Σπ- palavras ---
  ["Σπέρμα", "Semente"],
  ["Σπεῦσον", "Apressa-te"],
  ["Σπουδάσωμεν", "Esforcemo-nos"],

  // --- Στ- palavras ---
  ["Στάχυν", "Estáquis"],
  ["Σταύρου", "Cruz"],
  ["Στεφάνου", "Estêvão"],
  ["Στοϊκῶν", "Estoicos"],

  // --- Συ- palavras ---
  ["Συλλέξατε", "Recolhei"],
  ["Συλλαβόντες", "Tendo-prendido"],
  ["Συμεών", "Simeão"],
  ["Συνήγαγον", "Reuniram"],
  ["Συνήκατε", "Compreendestes"],
  ["Συνήχθησάν", "Foram-reunidos"],
  ["Συνίστημι", "Recomendo"],
  ["Συναγάγετε", "Reuni"],
  ["Συνεπορεύοντο", "Caminhavam-junto"],
  ["Συνεργοῦντες", "Cooperando"],
  ["Συνερχομένων", "Reunindo-se"],
  ["Συνηγμένων", "Tendo-sido-reunidos"],
  ["Συνιόντος", "Reunindo-se"],
  ["Συνκαλεσάμενος", "Tendo-convocado"],
  ["Συνμιμηταί", "Co-imitadores"],
  ["Συντύχην", "Síntique"],
  ["Συρακούσας", "Siracusa"],
  ["Συροφοινίκισσα", "Siro-fenícia"],
  ["Συστρεφομένων", "Reunindo-se"],
  ["Συχέμ", "Siquém"],
  ["Συχὰρ", "Sicar"],
  ["Συχὲμ", "Siquém"],

  // --- Σχ- / Σω- palavras ---
  ["Σχίσμα", "Divisão"],
  ["Σωσίπατρος", "Sosípatro"],
  ["Σωσθένην", "Sóstenes"],
  ["Σωσθένης", "Sóstenes"],
  ["Σωτήρ", "Salvador"],
  ["Σωτῆρί", "Salvador"],
  ["Σωτῆρι", "Salvador"],
  ["Σύρος", "Sírio"],
  ["Σύρτιν", "Sirte"],
  ["Σώθητε", "Sede-salvos"],
  ["Σώπατρος", "Sópatro"],
  ["Σὴθ", "Sete"],
  ["Σὴμ", "Sem"],

  // --- Τ- palavras (Τέ-Τί) ---
  ["Τέθεικά", "Tenho-posto"],
  ["Τέθνηκεν", "Tem-morrido"],
  ["Τέκνα", "Filhos"],
  ["Τέρτιος", "Tércio"],
  ["Τέρτυλλος", "Tértulo"],
  ["Τίμιος", "Precioso"],
  ["Τίμωνα", "Tímon"],
  ["Τίνες", "Quais"],
  ["Τίτῳ", "Tito"],

  // --- Τα- palavras ---
  ["Ταβερνῶν", "Tabernas"],
  ["Ταλιθὰ", "Talitá"],
  ["Ταξάμενοι", "Tendo-designado"],
  ["Ταπεινώθητε", "Sede-humilhados"],
  ["Ταρσέα", "De-Tarso"],
  ["Ταρσεὺς", "De-Tarso"],
  ["Ταρσόν", "Tarso"],
  ["Ταρσὸν", "Tarso"],
  ["Ταρσῷ", "Tarso"],
  ["Ταχὺ", "Rapidamente"],

  // --- Τε- palavras ---
  ["Τεθέαμαι", "Tenho-contemplado"],
  ["Τελευτήσαντος", "Tendo-morrido"],
  ["Τερτύλλου", "Tértulo"],
  ["Τεσσαρεσκαιδεκάτην", "Décima-quarta"],
  ["Τετέλεσται", "Tem-sido-consumado"],
  ["Τετύφλωκεν", "Tem-cegado"],

  // --- Τι- palavras ---
  ["Τιβερίου", "Tibério"],
  ["Τιμαίου", "Timeu"],
  ["Τινὲς", "Alguns"],
  ["Τινῶν", "Alguns"],
  ["Τιτίου", "Tício"],

  // --- Το- palavras ---
  ["Τοίνυν", "Portanto"],
  ["Τοιγαροῦν", "Por-conseguinte"],
  ["Τοιοῦτος", "Tal"],
  ["Τολμᾷ", "Ousa"],
  ["Τοσαῦτα", "Tantas-coisas"],
  ["Τοσοῦτον", "Tanto"],
  ["Τούτων", "Destas-coisas"],

  // --- Τρ- palavras ---
  ["Τραχωνίτιδος", "Traconites"],
  ["Τρυφῶσαν", "Trifosa"],
  ["Τρόφιμος", "Trófimo"],
  ["Τρύφαιναν", "Trifena"],
  ["Τρῳάδος", "Trôade"],

  // --- Τυ- palavras ---
  ["Τυράννου", "Tirano"],
  ["Τυρίοις", "Tírios"],
  ["Τυχικόν", "Tíquico"],
  ["Τυχικὸν", "Tíquico"],
  ["Τύπτειν", "Bater"],

  // --- Υ- palavras ---
  ["Υἱέ", "Filho"],
  ["Υἱόν", "Filho"],

  // --- Φ- palavras (Φά-Φέ) ---
  ["Φάλεκ", "Faleque"],
  ["Φάντασμά", "Fantasma"],
  ["Φέρε", "Traz"],
  ["Φέρετέ", "Trazei"],
  ["Φήλικα", "Félix"],
  ["Φήλικι", "Félix"],
  ["Φήλικος", "Félix"],
  ["Φήστου", "Festo"],
  ["Φήστῳ", "Festo"],
  ["Φίλιππε", "Filipe"],

  // --- Φα- palavras ---
  ["Φανουήλ", "Fanuel"],
  ["Φαραώ", "Faraó"],
  ["Φαρισαῖε", "Fariseu"],
  ["Φαρισαῖός", "Fariseu"],

  // --- Φι- palavras ---
  ["Φιλήμονι", "Filemom"],
  ["Φιλίππους", "Filipos"],
  ["Φιλίππων", "Filipos"],
  ["Φιλεῖς", "Amas"],
  ["Φιλητός", "Fileto"],
  ["Φιλιππήσιοι", "Filipenses"],
  ["Φιλόλογον", "Filólogo"],

  // --- Φλ-Φω palavras ---
  ["Φλέγοντα", "Flegonte"],
  ["Φοίβην", "Febe"],
  ["Φοίνικα", "Fenícia"],
  ["Φοινίκης", "Fenícia"],
  ["Φορτουνάτου", "Fortunato"],
  ["Φράσον", "Explica"],
  ["Φωνήσατε", "Chamai"],
  ["Φόρου", "Fóro"],
  ["Φύγελος", "Fígelo"],
  ["Φῆστε", "Festo"],

  // --- Χ- palavras ---
  ["ΧΡΙΣΤΟΣ", "Christos"],
  ["Χήρα", "Viúva"],
  ["Χήρας", "Viúvas"],
  ["Χίου", "Quios"],
  ["Χαλδαίων", "Caldeus"],
  ["Χαναναία", "Cananeia"],
  ["Χερουβεὶν", "Querubins"],
  ["Χεῖρας", "Mãos"],
  ["Χλόης", "Cloe"],
  ["Χουζᾶ", "Cuza"],
  ["Χριστέ", "Christos"],
  ["Χριστιανούς", "Cristãos"],
  ["Χριστιανός", "Cristão"],
  ["Χριστιανὸν", "Cristão"],
  ["Χωρήσατε", "Dai-lugar"],
  ["Χωρίον", "Campo"],

  // --- Ψ- palavras ---
  ["Ψαλμῶν", "Salmos"],
  ["Ψυχή", "Alma"],

  // --- αἰ- palavras (minúsculas) ---
  ["αἰγείοις", "de-cabras"],
  ["αἰδοῦς", "pudor"],
  ["αἰνέσεως", "louvor"],
  ["αἰνίγματι", "enigma"],
  ["αἰνεῖν", "louvar"],
  ["αἰνούντων", "louvando"],
  ["αἰνοῦντα", "louvando"],
  ["αἰνῶν", "louvando"],
  ["αἰρόμενον", "sendo-levantado"],
  ["αἰσθήσει", "discernimento"],
  ["αἰσθητήρια", "sentidos"],
  ["αἰσχροκερδεῖς", "gananciosos-por-lucro-torpe"],
  ["αἰσχροκερδῆ", "ganancioso-por-lucro-torpe"],
  ["αἰσχροκερδῶς", "por-ganância-de-lucro-torpe"],
  ["αἰσχρολογίαν", "linguagem-torpe"],
  ["αἰσχροῦ", "torpe"],
  ["αἰσχρόν", "vergonhoso"],
  ["αἰσχρότης", "torpeza"],
  ["αἰσχυνέσθω", "envergonhe-se"],
  ["αἰσχυνθῶμεν", "sejamos-envergonhados"],
  ["αἰσχύνας", "vergonhas"],
  ["αἰσχύνομαι", "envergonho-me"],
  ["αἰσχύνῃ", "vergonha"],

  // --- αἰτ- palavras (pedir/causa) ---
  ["αἰτήσασθε", "pedi-para-vós"],
  ["αἰτήσεσθε", "pedireis"],
  ["αἰτήσητέ", "peçais"],
  ["αἰτήσηται", "peça"],
  ["αἰτήσουσιν", "pedirão"],
  ["αἰτήσωμέν", "peçamos"],
  ["αἰτήσωμαι", "peça"],
  ["αἰτήσῃ", "peça"],
  ["αἰτήσῃς", "peças"],
  ["αἰτίου", "causa"],
  ["αἰτεῖν", "pedir"],
  ["αἰτεῖς", "pedes"],
  ["αἰτιώματα", "acusações"],
  ["αἰτούμεθα", "pedimos"],
  ["αἰτοῦμαι", "peço"],
  ["αἰτοῦντι", "pedindo"],
  ["αἰτοῦσά", "pedindo"],
  ["αἰτῆσαι", "pedir"],
  ["αἰτῶμεν", "peçamos"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11c (freq 1, parte 3/44) ===`);
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

console.log(`\n=== Resultado Lote 11c ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `retry12c-${Date.now()}.sql`);

const translations = [
  ["κολυμβᾶν", "nadar"],
  ["κομίσησθε", "recebereis"],
  ["κοπιῶντι", "ao-que-labuta"],
  ["κοσμίῳ", "decoroso"],
  ["κοσμεῖν", "adornar"],
  ["κούμ", "levanta-te"],
  ["κρίνῃ", "julgue"],
  ["κόπον", "labor"],
  ["μαίνεται", "enlouquece"],
  ["μηδ'", "nem"],
  ["νουθεσίᾳ", "admoestação"],
  ["παρέχειν", "oferecer"],
  ["παρεχέτω", "ofereça"],
  ["πεφωτισμένους", "tendo-sido-iluminados"],
  ["πηγαὶ", "fontes"],
  ["πηλίκοις", "quão-grandes"],
  ["πλάσαντι", "ao-que-formou"],
  ["πλήθει", "multidão"],
  ["πλανηθῆτε", "sejais-enganados"],
  ["πλανῆται", "seja-enganado"],
  ["πλανῶνται", "são-enganados"],
  ["πλατύνουσιν", "alargam"],
  ["πλεονάσασα", "tendo-abundado"],
  ["πλεονέκται", "avarentos"],
  ["πλεονεκτεῖν", "tirar-vantagem"],
  ["πληροφορείσθω", "esteja-plenamente-convicto"],
  ["πληρούμενον", "sendo-preenchido"],
  ["πληρωθέντων", "tendo-sido-cumpridos"],
  ["πληρώματι", "plenitude"],
  ["πληρώσεις", "preencherás"],
  ["πλησθῇς", "sejas-preenchido"],
  ["πλοὸς", "navegação"],
  ["πνευματικῶς", "espiritualmente"],
  ["πνικτῶν", "sufocados"],
  ["ποδός", "pé"],
  ["ποιήσων", "estando-para-fazer"],
  ["ποιεῖσθε", "fazei"],
  ["ποιησάμενοι", "tendo-feito"],
  ["ποιητής", "fazedor"],
  ["πολυλογίᾳ", "palavrório"],
  ["πολυτελοῦς", "de-grande-valor"],
  ["πολύσπλαγχνός", "muito-compassivo"],
  ["πονηρᾶς", "perversa"],
  ["πορευθέντι", "ao-que-partiu"],
  ["πορευομένοις", "aos-que-caminham"],
  ["πορνεύων", "fornicando"],
  ["πορνῶν", "fornicadores"],
  ["ποτίζει", "rega"],
  ["ποταμός", "rio"],
  ["ποταπὸς", "que-tipo-de"],
  ["προκείμενον", "posto-diante"],
  ["σιγάτωσαν", "calem-se"],
  ["συγγενὴς", "parente"],
  ["συμβεβηκότων", "tendo-acontecido"],
  ["συμφώνου", "acordo-mútuo"],
  ["συνάξει", "reunirá"],
  ["συνέπνιγον", "sufocavam-juntamente"],
  ["συνέρχεται", "reúne-se"],
  ["συνήδομαι", "deleito-me-juntamente"],
  ["συνήρπασαν", "arrebataram"],
  ["συνήσθιεν", "comia-junto"],
  ["συναίρει", "acerta-contas"],
  ["συναγωγῶν", "sinagogas"],
  ["συναγωνίσασθαί", "lutar-juntamente"],
  ["συναθροίσας", "tendo-reunido"],
  ["συναναβᾶσαι", "tendo-subido-junto"],
  ["συνανακείμενοι", "reclinados-à-mesa-junto"],
  ["συναναπαύσωμαι", "descanse-juntamente"],
  ["συναντήσοντά", "que-virá-ao-encontro"],
  ["συναντιλαμβάνεται", "ajuda-juntamente"],
  ["συνβασιλεύσωμεν", "reinemos-juntamente"],
  ["συνείληφεν", "concebeu"],
  ["συνειδήσεσιν", "consciências"],
  ["συνελθόντας", "tendo-se-reunido"],
  ["συνεργῶν", "cooperando"],
  ["συνεργῷ", "cooperador"],
  ["συνευδοκεῖτε", "consentis-juntamente"],
  ["συνζητούντων", "dos-que-disputam-juntamente"],
  ["συνηλικιώτας", "contemporâneos"],
  ["συνκληρονόμοι", "co-herdeiros"],
  ["συνκληρονόμων", "co-herdeiros"],
  ["συνλαμβάνου", "auxilia-juntamente"],
  ["συνλυπούμενος", "entristecendo-se-juntamente"],
  ["συνμαρτυρεῖ", "testifica-juntamente"],
  ["συνπαραλαβεῖν", "levar-consigo"],
  ["συνπνίγονται", "são-sufocados-juntamente"],
  ["τεχνίτης", "artífice"],
  ["τεχνῖται", "artífices"],
  ["τηλαυγῶς", "claramente"],
  ["τηλικούτου", "tão-grande"],
  ["τηρήσετε", "guardareis"],
  ["τηροῦμεν", "guardamos"],
  ["τηρῆσαί", "guardar"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

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
    if (jsonStart === -1) { success++; continue; }
    const jsonStr = result.substring(jsonStart);
    const parsed = JSON.parse(jsonStr);
    const changes = parsed[0]?.results?.[0]?.['Rows written'] || 0;
    totalUpdated += changes;
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    console.error(`  ✗ ${word} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== Retry 12c Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

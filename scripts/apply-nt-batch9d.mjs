#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 9d
 * Aplica traduções literais para palavras gregas freq 3 no NT (parte 4/5)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch9d-${Date.now()}.sql`);

const translations = [
  // === índices 741-987 do freq3-words.json (247 palavras) ===

  // φ- words
  ["φονεύσῃς", "assassines"],
  ["φρονεῖς", "pensas"],
  ["φυγεῖν", "fugir"],
  ["φυλακαῖς", "prisões"],
  ["φυλακὴν", "prisão"],
  ["φωνῆς", "voz"],
  ["φωτί", "luz"],
  ["φόνον", "assassinato"],
  ["φόρον", "tributo"],

  // χ- words
  ["χήραν", "viúva"],
  ["χαίρει", "alegra-se"],
  ["χαρά", "alegria"],
  ["χείρονα", "piores"],
  ["χειμῶνος", "inverno"],
  ["χερσίν", "mãos"],
  ["χιλίαρχον", "comandante-de-mil"],
  ["χιτῶνα", "túnica"],
  ["χρηστότης", "benignidade"],
  ["χρηστότητα", "benignidade"],
  ["χρηστότητι", "benignidade"],
  ["χρυσίῳ", "ouro"],
  ["χρόνους", "tempos"],
  ["χρῖσμα", "unção"],
  ["χόρτου", "erva"],
  ["χώρᾳ", "região"],
  ["χῆραι", "viúvas"],

  // ψ- words
  ["ψαλμοῖς", "salmos"],
  ["ψαλῶ", "salmodiarei"],
  ["ψυχή", "alma"],
  ["ψυχήν", "alma"],
  ["ψυχαῖς", "almas"],
  ["ψυχικόν", "natural"],

  // ἀ- words (alpha privativo e outros)
  ["ἀγαθήν", "boa"],
  ["ἀγαθοποιοῦντας", "fazendo-o-bem"],
  ["ἀγαθοῖς", "bons"],
  ["ἀγαθὲ", "bom"],
  ["ἀγαλλιάσει", "exultação"],
  ["ἀγαλλιᾶσθε", "exultai"],
  ["ἀγαπήσας", "tendo-amado"],
  ["ἀγαπῶντας", "amando"],
  ["ἀγκύρας", "âncoras"],
  ["ἀγοράσωμεν", "compremos"],
  ["ἀγοράσωσιν", "comprem"],
  ["ἀγορᾷ", "praça"],
  ["ἀγωνιζόμενος", "lutando"],
  ["ἀδίκων", "injustos"],
  ["ἀδελφαὶ", "irmãs"],
  ["ἀδελφῆς", "irmã"],
  ["ἀθανασίαν", "imortalidade"],
  ["ἀκαθαρσίας", "impureza"],
  ["ἀκαθαρσίᾳ", "impureza"],
  ["ἀκολουθεῖ", "segue"],
  ["ἀκουσάντων", "tendo-ouvido"],
  ["ἀκούεις", "ouves"],
  ["ἀκούομεν", "ouvimos"],
  ["ἀκούσουσιν", "ouvirão"],
  ["ἀκοὴ", "ouvido"],
  ["ἀκοῇ", "ouvido"],
  ["ἀκροβυστίαν", "prepúcio"],
  ["ἀληθινὸς", "verdadeiro"],
  ["ἀμήν", "amém"],
  ["ἀμίαντος", "incontaminado"],
  ["ἀμώμους", "irrepreensíveis"],
  ["ἀνάμνησιν", "memória"],
  ["ἀνέβην", "subi"],
  ["ἀνέλωσιν", "destruam"],
  ["ἀνέξομαι", "suportarei"],
  ["ἀνέπεμψεν", "enviou-de-volta"],
  ["ἀνέτειλεν", "nasceu"],
  ["ἀνήγαγον", "conduziram-para-cima"],
  ["ἀναβαίνειν", "subir"],
  ["ἀναβαίνομεν", "subimos"],
  ["ἀναβαίνων", "subindo"],
  ["ἀνακείμενος", "reclinado"],
  ["ἀνακρίνας", "tendo-examinado"],
  ["ἀνακρίνεται", "é-examinado"],
  ["ἀνακρίνοντες", "examinando"],
  ["ἀναλαβόντες", "tendo-tomado"],
  ["ἀναπεσεῖν", "reclinar-se"],
  ["ἀναστάσει", "ressurreição"],
  ["ἀναστήσας", "tendo-levantado"],
  ["ἀναστήσει", "levantará"],
  ["ἀναστροφὴν", "conduta"],
  ["ἀνδρὶ", "homem"],
  ["ἀνθρωποκτόνος", "homicida"],
  ["ἀνοίξαντες", "tendo-aberto"],
  ["ἀντίχριστος", "anticristo"],
  ["ἀντικείμενοι", "opondo-se"],
  ["ἀντιτάσσεται", "opõe-se"],
  ["ἀνόητοι", "insensatos"],
  ["ἀνόμοις", "sem-lei"],
  ["ἀξίους", "dignos"],
  ["ἀπάντησιν", "encontro"],
  ["ἀπέθανον", "morreram"],
  ["ἀπέσταλκέν", "tem-enviado"],
  ["ἀπέχει", "está-distante"],
  ["ἀπέχουσιν", "recebem-por-completo"],
  ["ἀπαγγείλατε", "anunciai"],
  ["ἀπαρθῇ", "seja-tirado"],
  ["ἀπειθείας", "desobediência"],
  ["ἀπεκαλύφθη", "foi-revelado"],
  ["ἀπεκατεστάθη", "foi-restaurado"],
  ["ἀπεκδεχόμεθα", "aguardamos-ansiosamente"],
  ["ἀπεστάλην", "fui-enviado"],
  ["ἀποδοκιμασθῆναι", "ser-rejeitado"],
  ["ἀποδοῦναι", "retribuir"],
  ["ἀποδώσουσιν", "retribuirão"],
  ["ἀποδώσω", "retribuirei"],
  ["ἀποδῷ", "retribua"],
  ["ἀποθέμενοι", "tendo-despojado"],
  ["ἀποθήκην", "celeiro"],
  ["ἀποθανεῖσθε", "morrereis"],
  ["ἀποθνήσκει", "morre"],
  ["ἀποκαλυφθήσεται", "será-revelado"],
  ["ἀποκαλύπτεται", "é-revelado"],
  ["ἀποκαλύψαι", "revelar"],
  ["ἀποκαλύψεως", "revelação"],
  ["ἀποκρίνεται", "responde"],
  ["ἀποκτανθῆναι", "ser-morto"],
  ["ἀπολέσας", "tendo-perdido"],
  ["ἀπολείπεται", "resta"],
  ["ἀπολλύμεθα", "perecemos"],
  ["ἀπολογίαν", "defesa"],
  ["ἀπόδοτε", "devolvei"],
  ["ἀπόλυσον", "liberta"],
  ["ἀπώλοντο", "pereceram"],
  ["ἀπώσατο", "rejeitou"],
  ["ἀρέσκειν", "agradar"],
  ["ἀργυρίου", "prata"],
  ["ἀριστερῶν", "esquerda"],
  ["ἀρνούμενος", "negando"],
  ["ἀρρώστους", "enfermos"],
  ["ἀρχιερεῖ", "sumo-sacerdote"],
  ["ἀρχισυναγώγου", "chefe-da-sinagoga"],
  ["ἀρώματα", "aromas"],
  ["ἀσεβείας", "impiedade"],
  ["ἀσεβεῖς", "ímpios"],
  ["ἀσεβῶν", "ímpios"],
  ["ἀσελγείᾳ", "devassidão"],
  ["ἀσθενής", "fraco"],
  ["ἀσθενούντων", "estando-fracos"],
  ["ἀσθενοῦντα", "estando-fraco"],
  ["ἀσθενὴς", "fraco"],
  ["ἀσθενῆ", "fracos"],
  ["ἀσπασάμενοι", "tendo-saudado"],
  ["ἀσπασάμενος", "tendo-saudado"],
  ["ἀστραπὴ", "relâmpago"],
  ["ἀσφαλῶς", "seguramente"],
  ["ἀτιμίαν", "desonra"],
  ["ἀφέωνται", "são-perdoados"],
  ["ἀφήκαμεν", "deixamos"],
  ["ἀφήσει", "deixará"],
  ["ἀφίετε", "perdoais"],
  ["ἀφεθῇ", "seja-perdoado"],
  ["ἀφεῖλεν", "tirou"],
  ["ἀφρόνων", "insensatos"],
  ["ἀφῇ", "perdoe"],

  // ἁ- words (com espírito áspero)
  ["ἁγίαις", "santas"],
  ["ἁγίους", "santos"],
  ["ἁγιασμόν", "santificação"],
  ["ἁλύσεσιν", "cadeias"],
  ["ἁμαρτάνετε", "pecais"],
  ["ἁμαρτωλοί", "pecadores"],
  ["ἁμαρτωλοὺς", "pecadores"],

  // ἄ- words (com acento agudo)
  ["ἄγαμος", "não-casado"],
  ["ἄδικος", "injusto"],
  ["ἄκανθαι", "espinhos"],
  ["ἄλλης", "outra"],
  ["ἄλλων", "outros"],
  ["ἄμπελος", "videira"],
  ["ἄνεμοι", "ventos"],
  ["ἄνευ", "sem"],
  ["ἄνομος", "sem-lei"],
  ["ἄπιστον", "incrédulo"],
  ["ἄρχοντας", "governantes"],
  ["ἄτοπον", "absurdo"],
  ["ἄφεσις", "remissão"],
  ["ἄφθαρτον", "incorruptível"],
  ["ἄφνω", "subitamente"],
  ["ἄφρων", "insensato"],

  // ἅ- words
  ["ἅρπαγες", "rapaces"],
  ["ἅτινά", "as-quais"],
  ["ἅψωνται", "toquem"],

  // Nomes próprios com Ἀ-
  ["Ἀαρών", "Aarão"],
  ["Ἀββᾶ", "Abba"],
  ["Ἀγαπητέ", "Amado"],
  ["Ἀκούσαντες", "Tendo-ouvido"],
  ["Ἀκύλαν", "Áquila"],
  ["Ἀκύλας", "Áquila"],
  ["Ἀλφαίου", "Alfeu"],
  ["Ἀνάστηθι", "Levanta-te"],
  ["Ἀντιοχείας", "Antioquia"],
  ["Ἀνὴρ", "Homem"],
  ["Ἀποκριθεὶς", "Tendo-respondido"],
  ["Ἀπόλυσον", "Liberta"],
  ["Ἀρίσταρχος", "Aristarco"],
  ["Ἀριμαθαίας", "Arimateia"],
  ["Ἀρτέμιδος", "Ártemis"],
  ["Ἀσπάζεταί", "Saúda"],
  ["Ἀσπάζεται", "Saúda"],
  ["Ἀσπάζονται", "Saúdam"],
  ["Ἀχαΐας", "Acaia"],
  ["Ἀχαΐᾳ", "Acaia"],
  ["Ἄβελ", "Abel"],
  ["Ἄγωμεν", "Vamos"],
  ["Ἄλλους", "Outros"],
  ["Ἄρατε", "Levantai"],
  ["Ἄρτι", "Agora"],
  ["Ἆρον", "Levanta"],

  // ἐ- words (aoristo e outros)
  ["ἐβαπτίσθημεν", "fomos-batizados"],
  ["ἐβόησεν", "clamou"],
  ["ἐγίνετο", "tornava-se"],
  ["ἐγείραντος", "tendo-levantado"],
  ["ἐγείρας", "tendo-levantado"],
  ["ἐγεννήθησαν", "foram-gerados"],
  ["ἐγερεῖ", "levantará"],
  ["ἐγερθῆναι", "ser-levantado"],
  ["ἐγνωρίσθη", "foi-dado-a-conhecer"],
  ["ἐδέξασθε", "recebestes"],
  ["ἐδέξατο", "recebeu"],
  ["ἐδίδασκεν", "ensinava"],
  ["ἐδίωκον", "perseguiam"],
  ["ἐδίωξαν", "perseguiram"],
  ["ἐδιδάχθητε", "fostes-ensinados"],
  ["ἐδόξασεν", "glorificou"],
  ["ἐδώκατέ", "destes"],
  ["ἐθεραπεύοντο", "eram-curados"],
  ["ἐκήρυσσεν", "proclamava"],
  ["ἐκβάλλουσιν", "expulsam"],
  ["ἐκβάλω", "expulse"],
  ["ἐκβάλωσιν", "expulsem"],
  ["ἐκβαλὼν", "tendo-expulsado"],
  ["ἐκείνῳ", "aquele"],
  ["ἐκκλησίαις", "assembleias"],
  ["ἐκκόπτεται", "é-cortado"],
  ["ἐκλεκτούς", "escolhidos"],
  ["ἐκλεκτὸν", "escolhido"],
  ["ἐκπορευομένου", "saindo"],
  ["ἐκστάσει", "espanto"],
  ["ἐκόπασεν", "cessou"],
  ["ἐλέησον", "tem-misericórdia"],
  ["ἐλαίῳ", "azeite"],
  ["ἐλαχίστῳ", "mínimo"],
  ["ἐλευθέρα", "livre"],
  ["ἐλθάτω", "venha"],
  ["ἐλπίζει", "espera"],
  ["ἐλυπήθητε", "fostes-entristecidos"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 9d (freq 3, parte 4/5) ===`);
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

console.log(`\n=== Resultado Lote 9d ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

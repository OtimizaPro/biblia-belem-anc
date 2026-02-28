#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ao
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 41/44)
 * Hapax legomena - slice ao (ἠ-/ἡ-/ἤ-/ἥ-/ἦ- e ἰ-/ἱ-/ἴ-/ἵ- e nomes próprios Ἠ-Ἱ)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ao-${Date.now()}.sql`);

const translations = [
  // === 248 palavras de freq1-slice-ao.json ===

  // --- ἠ- palavras (verbos no aoristo/perfeito indicativo, espírito rude/suave) ---
  ["ἠσθενήκαμεν", "Temos-enfraquecido"],
  ["ἠσπάζοντο", "Saudavam"],
  ["ἠσπάσατο", "Saudou"],
  ["ἠσφαλίσαντο", "Asseguraram"],
  ["ἠσφαλίσατο", "Assegurou"],
  ["ἠτίμασαν", "Desonraram"],
  ["ἠτακτήσαμεν", "Fomos-desordenados"],
  ["ἠτιμάσατε", "Desonrastes"],
  ["ἠχρεώθησαν", "Tornaram-se-inúteis"],
  ["ἠχῶν", "Soando"],

  // --- ἡ- palavras (com espírito rude) ---
  ["ἡγήσασθε", "Considerastes"],
  ["ἡγίασεν", "Santificou"],
  ["ἡγείσθωσαν", "Que-liderem"],
  ["ἡγεμονίας", "Governo"],
  ["ἡγεμόνων", "Governadores"],
  ["ἡγεῖσθαι", "Liderar"],
  ["ἡγιάσθη", "Foi-santificado"],
  ["ἡγιάσθητε", "Fostes-santificados"],
  ["ἡγιασμένη", "Tendo-sido-santificada"],
  ["ἡγιασμένον", "Tendo-sido-santificado"],
  ["ἡγνικότες", "Tendo-purificado"],
  ["ἡγνισμένον", "Tendo-sido-purificado"],
  ["ἡγουμένοις", "Líderes"],
  ["ἡγουμένων", "Líderes"],
  ["ἡγούμενον", "Líder"],
  ["ἡγοῦνται", "Consideram"],
  ["ἡδονὴν", "Prazer"],
  ["ἡλίκην", "Quão-grande"],
  ["ἡμέτεροι", "Nossos"],
  ["ἡμέτερον", "Nosso"],
  ["ἡμίσειά", "Metades"],
  ["ἡμίσους", "Metade"],
  ["ἡμαρτήκαμεν", "Temos-pecado"],
  ["ἡμετέρα", "Nossa"],
  ["ἡμετέραις", "Nossas"],
  ["ἡμετέραν", "Nossa"],
  ["ἡμετέρας", "Nossa"],
  ["ἡμετέροις", "Nossos"],
  ["ἡμετέρων", "Nossos"],
  ["ἡμιθανῆ", "Meio-morto"],
  ["ἡρμοσάμην", "Desposei"],
  ["ἡρπάγη", "Foi-arrebatado"],
  ["ἡσσώθητε", "Fostes-diminuídos"],
  ["ἡσυχάζειν", "Estar-quieto"],
  ["ἡσυχάσαμεν", "Aquietamo-nos"],
  ["ἡσυχίαν", "Quietude"],
  ["ἡσυχίας", "Quietude"],
  ["ἡσυχίου", "Quieto"],
  ["ἡσύχιον", "Tranquilo"],
  ["ἡτοίμακα", "Tenho-preparado"],
  ["ἡτοίμασεν", "Preparou"],
  ["ἡττῶνται", "São-vencidos"],

  // --- ἤ- palavras (aumento + verbos) ---
  ["ἤγγιζεν", "Aproximava-se"],
  ["ἤγειραν", "Levantaram"],
  ["ἤγεσθε", "Éreis-conduzidos"],
  ["ἤγετο", "Era-conduzido"],
  ["ἤθελες", "Querias"],
  ["ἤθη", "Costumes"],
  ["ἤκουσάς", "Ouviste"],
  ["ἤλειφεν", "Ungia"],
  ["ἤλειφον", "Ungiam"],
  ["ἤλειψας", "Ungiste"],
  ["ἤλθαμεν", "Viemos"],
  ["ἤλθατε", "Viestes"],
  ["ἤλλαξαν", "Trocaram"],
  ["ἤλπιζέν", "Esperava"],
  ["ἤλπικεν", "Tem-esperado"],
  ["ἤνεγκα", "Trouxe"],
  ["ἤνοιξε", "Abriu"],
  ["ἤπερ", "Do-que"],
  ["ἤπιοι", "Gentis"],
  ["ἤπιον", "Gentil"],
  ["ἤρεμον", "Tranquilo"],
  ["ἤρεσκον", "Agradavam"],
  ["ἤρνηται", "Tem-negado"],
  ["ἤρξαντό", "Começaram"],
  ["ἤρχου", "Vinhas"],
  ["ἤτοι", "Quer"],
  ["ἤχους", "Sons"],
  ["ἤχῳ", "Som"],

  // --- ἥ- palavras ---
  ["ἥδιστα", "Com-muito-prazer"],
  ["ἥλατο", "Saltou"],
  ["ἥμαρτες", "Pecaste"],
  ["ἥρπασεν", "Arrebatou"],
  ["ἥττηται", "Tem-sido-vencido"],

  // --- ἦ- palavras ---
  ["ἦγεν", "Conduzia"],
  ["ἦλθε", "Veio"],
  ["ἦρεν", "Levantou"],
  ["ἦρκεν", "Tem-bastado"],
  ["ἦς", "Eras"],

  // --- Ἠ- nomes próprios e maiúsculas ---
  ["Ἠγαπημένῳ", "Amado"],
  ["Ἠκούσθη", "Foi-ouvido"],
  ["Ἠλείας", "Elias"],
  ["Ἠρώτα", "Perguntava"],
  ["Ἡλεία", "Elias"],
  ["Ἡλείου", "Elias"],
  ["Ἡλικίαν", "Estatura"],
  ["Ἡρῳδίωνα", "Herodião"],
  ["Ἡρῳδιὰς", "Herodias"],
  ["Ἡσαΐᾳ", "Isaías"],
  ["Ἢρ", "Er"],
  ["Ἤγαγεν", "Conduziu"],
  ["Ἤγγιζεν", "Aproximava-se"],
  ["Ἤγοντο", "Eram-conduzidos"],
  ["Ἥδιστα", "Com-muito-prazer"],
  ["Ἥμαρτον", "Pequei"],
  ["Ἥψατό", "Tocou"],

  // --- ἰ- palavras (com espírito suave) ---
  ["ἰάθητε", "Fostes-curados"],
  ["ἰάσεις", "Curas"],
  ["ἰάσεως", "Cura"],
  ["ἰάσηται", "Cure"],
  ["ἰαθήσεται", "Será-curado"],
  ["ἰαθήτω", "Que-seja-curado"],
  ["ἰαθεὶς", "Tendo-sido-curado"],
  ["ἰαθῆναι", "Ser-curado"],
  ["ἰαθῆτε", "Sejais-curados"],
  ["ἰαθῇ", "Seja-curado"],
  ["ἰατρὸς", "Médico"],
  ["ἰατρῶν", "Médicos"],
  ["ἰδιώτου", "Leigo"],
  ["ἰκμάδα", "Umidade"],
  ["ἰουδαΐζειν", "Judaizar"],
  ["ἰοῦ", "Veneno"],
  ["ἰσάγγελοι", "Iguais-a-anjos"],
  ["ἰσχυρά", "Forte"],
  ["ἰσχυραί", "Fortes"],
  ["ἰσχυροὶ", "Fortes"],
  ["ἰσχυρόν", "Forte"],
  ["ἰσχυρότεροι", "Mais-fortes"],
  ["ἰσχυρότερον", "Mais-forte"],
  ["ἰσχυρότερος", "Mais-forte"],
  ["ἰσχυρὰ", "Forte"],
  ["ἰσχυρὰν", "Forte"],
  ["ἰσχυρᾶς", "Forte"],
  ["ἰσχύειν", "Ser-forte"],
  ["ἰσχύοντος", "Sendo-forte"],
  ["ἰσχύσατε", "Fostes-fortes"],
  ["ἰσχύσουσιν", "Serão-fortes"],
  ["ἰσότης", "Igualdade"],
  ["ἰσότητα", "Igualdade"],
  ["ἰσότητος", "Igualdade"],
  ["ἰσότιμον", "De-igual-valor"],
  ["ἰσόψυχον", "De-igual-ânimo"],
  ["ἰχθύες", "Peixes"],
  ["ἰχθύν", "Peixe"],
  ["ἰώμενος", "Curando"],
  ["ἰᾶταί", "Cura"],
  ["ἰῶτα", "Iota"],

  // --- ἱ- palavras (com espírito rude) ---
  ["ἱδρὼς", "Suor"],
  ["ἱερατείαν", "Sacerdócio"],
  ["ἱερατείας", "Sacerdócio"],
  ["ἱερατεύειν", "Servir-como-sacerdote"],
  ["ἱεροπρεπεῖς", "Dignos-de-sagrado"],
  ["ἱεροσυλεῖς", "Roubas-templos"],
  ["ἱεροσύλους", "Sacrílegos"],
  ["ἱερουργοῦντα", "Ministrando-sacerdotalmente"],
  ["ἱερωσύνην", "Sacerdócio"],
  ["ἱερόθυτόν", "Sacrificado-a-ídolo"],
  ["ἱκάνωσεν", "Capacitou"],
  ["ἱκαναί", "Suficientes"],
  ["ἱκαναὶ", "Suficientes"],
  ["ἱκαναῖς", "Suficientes"],
  ["ἱκανούς", "Suficientes"],
  ["ἱκανοὺς", "Suficientes"],
  ["ἱκανοῖς", "Suficientes"],
  ["ἱκανοῦ", "Suficiente"],
  ["ἱκανότης", "Suficiência"],
  ["ἱκανώσαντι", "Tendo-capacitado"],
  ["ἱκανὰ", "Suficientes"],
  ["ἱκετηρίας", "Súplica"],
  ["ἱλάσθητί", "Sê-propício"],
  ["ἱλάσκεσθαι", "Fazer-propiciação"],
  ["ἱλαρότητι", "Alegria"],
  ["ἱλαρὸν", "Alegre"],
  ["ἱλασμός", "Propiciação"],
  ["ἱλασμὸν", "Propiciação"],
  ["ἱμάτιά", "Vestes"],
  ["ἱμάτιόν", "Veste"],
  ["ἱματίῳ", "Veste"],
  ["ἱματισμοῦ", "Vestuário"],
  ["ἱματισμόν", "Vestuário"],
  ["ἱματισμὸς", "Vestuário"],
  ["ἱμᾶσιν", "Correias"],
  ["ἱστάνομεν", "Estabelecemos"],
  ["ἱστορῆσαι", "Visitar"],

  // --- ἴ- palavras (com espírito suave, acento agudo) ---
  ["ἴασιν", "Cura"],
  ["ἴαται", "Cura"],
  ["ἴδητέ", "Vejais"],
  ["ἴδιοι", "Próprios"],
  ["ἴδιος", "Próprio"],
  ["ἴδῃς", "Vejas"],
  ["ἴσαι", "Iguais"],
  ["ἴση", "Igual"],
  ["ἴσην", "Igual"],
  ["ἴσον", "Igual"],
  ["ἴσους", "Iguais"],
  ["ἴσχυσας", "Foste-forte"],
  ["ἴσως", "Talvez"],

  // --- ἵ- palavras (espírito rude, acento agudo) ---
  ["ἵλεως", "Propício"],

  // --- Ἰ- nomes próprios ---
  ["Ἰάννης", "Janes"],
  ["Ἰάρετ", "Jarede"],
  ["Ἰάσονα", "Jasão"],
  ["Ἰαμβρῆς", "Jambres"],
  ["Ἰανναὶ", "Janai"],
  ["Ἰατρέ", "Médico"],
  ["Ἰδουμαίας", "Idumeia"],
  ["Ἰδόντες", "Tendo-visto"],
  ["Ἰερειχώ", "Jericó"],
  ["Ἰερεμίου", "Jeremias"],
  ["Ἰερουσαλήμ", "Jerusalém"],
  ["Ἰεφθάε", "Jefté"],
  ["Ἰεχονίαν", "Jeconias"],
  ["Ἰεχονίας", "Jeconias"],
  ["Ἰκονίου", "Icônio"],
  ["Ἰλλυρικοῦ", "Ilírico"],
  ["Ἰουδαϊκοῖς", "Judaicos"],
  ["Ἰουδαϊκῶς", "Judaicamente"],
  ["Ἰουδαῖοί", "Judeus"],
  ["Ἰουλίαν", "Júlia"],
  ["Ἰουλίῳ", "Júlio"],
  ["Ἰουνίαν", "Júnias"],
  ["Ἰούδα", "Judá"],
  ["Ἰούδᾳ", "Judá"],
  ["Ἰούλιος", "Júlio"],
  ["Ἰούστου", "Justo"],
  ["Ἰσαάκ", "Isaque"],
  ["Ἰσκαριώθ", "Iscariotes"],
  ["Ἰσκαριώτην", "Iscariotes"],
  ["Ἰσραηλεῖταί", "Israelitas"],
  ["Ἰταλικῆς", "Itálica"],
  ["Ἰτουραίας", "Itureia"],
  ["Ἰωήλ", "Joel"],
  ["Ἰωαθάμ", "Joatão"],
  ["Ἰωαθὰμ", "Joatão"],
  ["Ἰωανὰν", "Joanã"],
  ["Ἰωδὰ", "Jodá"],
  ["Ἰωνὰμ", "Jonã"],
  ["Ἰωράμ", "Jorão"],
  ["Ἰωρεὶμ", "Joreim"],
  ["Ἰωρὰμ", "Jorão"],
  ["Ἰωσαφάτ", "Josafá"],
  ["Ἰωσαφὰτ", "Josafá"],
  ["Ἰωσείαν", "Josias"],
  ["Ἰωσείας", "Josias"],
  ["Ἰωσὴχ", "José"],
  ["Ἰὼβ", "Jó"],
  ["Ἱεραπόλει", "Hierápolis"],
  ["Ἱερεμίαν", "Jeremias"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11ao (freq 1, parte 41/44) ===`);
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

console.log(`\n=== Resultado Lote 11ao ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

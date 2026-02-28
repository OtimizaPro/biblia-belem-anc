#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11am
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 39/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11am-${Date.now()}.sql`);

const translations = [
  // === Palavras de freq1-slice-am.json (248 palavras) ===

  // --- ἐφ- verbos (imperfeito, aoristo) ---
  ["ἐφρουρούμεθα", "Éramos-guardados"],
  ["ἐφρούρει", "Guardava"],
  ["ἐφρόνουν", "Pensavam"],
  ["ἐφρύαξαν", "Bramaram"],
  ["ἐφυλάξατε", "Guardastes"],
  ["ἐφυλαξάμην", "Guardei-a-mim-mesmo"],
  ["ἐφυσιώθησάν", "Foram-inchados-de-orgulho"],
  ["ἐφύλαξεν", "Guardou"],
  ["ἐφύτευον", "Plantavam"],
  ["ἐφύτευσα", "Plantei"],
  ["ἐφώνει", "Chamava-em-voz-alta"],
  ["ἐφώνησαν", "Chamaram-em-voz-alta"],

  // --- ἐχ- verbos ---
  ["ἐχάρημεν", "Alegramo-nos"],
  ["ἐχάρην", "Alegrei-me"],
  ["ἐχάρητε", "Alegrastes-vos"],
  ["ἐχαλάσθην", "Fui-descido"],
  ["ἐχαρίσθη", "Foi-dado-por-graça"],
  ["ἐχαρίτωσεν", "Agraciou"],
  ["ἐχθροί", "Inimigos"],
  ["ἐχθροῦ", "Inimigo"],
  ["ἐχθρόν", "Inimigo"],
  ["ἐχθρός", "Inimigo"],
  ["ἐχθρὲ", "Inimigo"],
  ["ἐχθρὸν", "Inimigo"],
  ["ἐχλεύαζον", "Zombavam"],
  ["ἐχομένας", "Seguintes"],
  ["ἐχορτάσθητε", "Fostes-saciados"],
  ["ἐχούσῃ", "Tendo"],
  ["ἐχρηματίσθη", "Foi-divinamente-advertido"],
  ["ἐχρησάμεθα", "Usamos"],
  ["ἐχρησάμην", "Usei"],
  ["ἐχρῶντο", "Usavam"],
  ["ἐχωρίσθη", "Foi-separado"],
  ["ἐχόμενα", "Seguintes"],

  // --- ἐψ- verbos ---
  ["ἐψεύσω", "Mentiste"],
  ["ἐψηλάφησαν", "Apalparam"],

  // --- ἑαυτ- pronomes reflexivos ---
  ["ἑαυταῖς", "A-si-mesmas"],
  ["ἑαυτὰ", "A-si-mesmos"],
  ["ἑαυτὰς", "A-si-mesmas"],
  ["ἑαυτὴν", "A-si-mesma"],

  // --- ἑβδ- numerais ---
  ["ἑβδομηκοντάκις", "Setenta-vezes"],
  ["ἑβδόμης", "Sétima"],
  ["ἑβδόμῃ", "Sétimo"],

  // --- ἑδρ- palavras ---
  ["ἑδραίωμα", "Fundamento"],
  ["ἑδραῖος", "Firme"],

  // --- ἑκ- palavras ---
  ["ἑκάστη", "Cada-uma"],
  ["ἑκάστην", "Cada-uma"],
  ["ἑκάστοτε", "Cada-vez"],
  ["ἑκατοντάρχας", "Centuriões"],
  ["ἑκατονταετής", "De-cem-anos"],
  ["ἑκατόν", "Cem"],
  ["ἑκατόνταρχον", "Centurião"],
  ["ἑκουσίως", "Voluntariamente"],
  ["ἑκούσιον", "Voluntário"],
  ["ἑκοῦσα", "Voluntária"],
  ["ἑκὼν", "Voluntariamente"],

  // --- ἑλ- palavras ---
  ["ἑλίξεις", "Enrolarás"],
  ["ἑλκύσαι", "Arrastar"],
  ["ἑλκύσω", "Arrastarei"],
  ["ἑλκύσῃ", "Arraste"],
  ["ἑλπίδι", "Esperança"],
  ["ἑλόμενος", "Tendo-escolhido"],

  // --- ἑν- palavras ---
  ["ἑνί", "Um"],
  ["ἑνδέκατος", "Décimo-primeiro"],

  // --- ἑξ- palavras ---
  ["ἑξήκοντα", "Sessenta"],

  // --- ἑορτ- palavras ---
  ["ἑορτάζωμεν", "Celebremos-a-festa"],

  // --- ἑπτ- palavras ---
  ["ἑπτακισχιλίους", "Sete-mil"],

  // --- ἑρμ- palavras ---
  ["ἑρμηνεία", "Interpretação"],
  ["ἑρμηνείαν", "Interpretação"],
  ["ἑρμηνευόμενος", "Sendo-interpretado"],

  // --- ἑσπ- palavras ---
  ["ἑσπέρα", "Tarde"],
  ["ἑσπέραν", "Tarde"],
  ["ἑσπέρας", "Tarde"],

  // --- ἑστ- palavras (perfeito de ἵστημι) ---
  ["ἑστήκαμεν", "Temos-permanecido-de-pé"],
  ["ἑστηκότα", "Tendo-permanecido-de-pé"],
  ["ἑστηκότες", "Tendo-permanecido-de-pé"],
  ["ἑστώτων", "Estando-de-pé"],
  ["ἑστῶσα", "Estando-de-pé"],
  ["ἑστῶτες", "Estando-de-pé"],

  // --- ἑτ- palavras ---
  ["ἑτέρως", "De-outro-modo"],
  ["ἑτερογλώσσοις", "De-outras-línguas"],
  ["ἑτεροδιδασκαλεῖ", "Ensina-outra-doutrina"],
  ["ἑτεροδιδασκαλεῖν", "Ensinar-outra-doutrina"],
  ["ἑτεροζυγοῦντες", "Pondo-se-em-jugo-desigual"],
  ["ἑτοίμαζέ", "Prepara"],
  ["ἑτοίμους", "Preparados"],
  ["ἑτοίμῳ", "Preparado"],
  ["ἑτοιμάσαντες", "Tendo-preparado"],
  ["ἑτοιμάσας", "Tendo-preparado"],
  ["ἑτοιμάσω", "Prepararei"],
  ["ἑτοιμάσωμέν", "Preparemos"],
  ["ἑτοιμασίᾳ", "Preparação"],

  // --- ἑωρ- / ἑόρ- verbos (perfeito de ὁράω) ---
  ["ἑωράκασιν", "Têm-visto"],
  ["ἑωράκατέ", "Tendes-visto"],
  ["ἑωράκει", "Tinha-visto"],
  ["ἑωρακέναι", "Ter-visto"],
  ["ἑωρακότες", "Tendo-visto"],
  ["ἑόρακα", "Tenho-visto"],
  ["ἑόρακαν", "Viram"],
  ["ἑόρακεν", "Tem-visto"],
  ["ἑώρακάς", "Tens-visto"],
  ["ἑώρακέν", "Tem-visto"],
  ["ἑώρακαν", "Viram"],
  ["ἑώρων", "Viam"],

  // --- ἔβ- verbos (aoristo/imperfeito) ---
  ["ἔβαλαν", "Lançaram"],
  ["ἔβαλλον", "Lançavam"],
  ["ἔβλεπεν", "Via"],
  ["ἔβλεπον", "Viam"],
  ["ἔβρεξέν", "Choveu"],
  ["ἔβρυχον", "Rangiam"],

  // --- ἔγ- palavras ---
  ["ἔγγυος", "Fiador"],
  ["ἔγερσιν", "Ressurreição"],
  ["ἔγημα", "Casei"],
  ["ἔγκλημα", "Acusação"],
  ["ἔγνωκάς", "Tens-conhecido"],
  ["ἔγνωκα", "Tenho-conhecido"],
  ["ἔγνωκαν", "Conheceram"],
  ["ἔγνωσται", "Tem-sido-conhecido"],
  ["ἔγραψά", "Escrevi"],
  ["ἔγραψαν", "Escreveram"],

  // --- ἔδ- verbos ---
  ["ἔδαφος", "Solo"],
  ["ἔδειξα", "Mostrei"],
  ["ἔδησεν", "Amarrou"],
  ["ἔδοξα", "Pareceu-me"],
  ["ἔδυσεν", "Pôs-se"],
  ["ἔδωκέν", "Deu"],
  ["ἔδωκα", "Dei"],

  // --- ἔζ- verbos ---
  ["ἔζησα", "Vivi"],
  ["ἔζησεν", "Viveu"],
  ["ἔζων", "Viviam"],

  // --- ἔθ- palavras ---
  ["ἔθει", "Costume"],
  ["ἔθεσθε", "Pusestes"],
  ["ἔθεσι", "Costumes"],
  ["ἔθεσιν", "Costumes"],
  ["ἔθου", "Puseste"],
  ["ἔθρεψαν", "Alimentaram"],
  ["ἔθυον", "Sacrificavam"],
  ["ἔθυσας", "Sacrificaste"],
  ["ἔθυσεν", "Sacrificou"],

  // --- ἔκ- palavras ---
  ["ἔκαμψαν", "Dobraram"],
  ["ἔκγονα", "Descendentes"],
  ["ἔκδηλος", "Manifesto"],
  ["ἔκδοτον", "Entregue"],
  ["ἔκθαμβοι", "Grandemente-espantados"],
  ["ἔκθετα", "Expostos"],
  ["ἔκλασα", "Parti"],
  ["ἔκλεψαν", "Roubaram"],
  ["ἔκλιναν", "Inclinaram"],
  ["ἔκοπτον", "Cortavam"],
  ["ἔκραζον", "Clamavam"],
  ["ἔκρινά", "Julguei"],
  ["ἔκρυψα", "Escondi"],
  ["ἔκρυψας", "Escondeste"],
  ["ἔκτισται", "Tem-sido-criado"],
  ["ἔκφοβοι", "Muito-temerosos"],

  // --- ἔλ- palavras ---
  ["ἔλαβε", "Recebeu"],
  ["ἔλαθεν", "Ficou-oculto"],
  ["ἔλαθόν", "Ficou-oculto"],
  ["ἔλαχε", "Obteve-por-sorte"],
  ["ἔλαχεν", "Obteve-por-sorte"],
  ["ἔλεγξιν", "Repreensão"],
  ["ἔλεγχος", "Prova"],
  ["ἔλθητε", "Venhais"],
  ["ἔλθῃς", "Venhas"],
  ["ἔλουσεν", "Lavou"],
  ["ἔλυεν", "Desatava"],
  ["ἔλυσεν", "Desatou"],

  // --- ἔμ- palavras ---
  ["ἔμαθεν", "Aprendeu"],
  ["ἔμαθον", "Aprenderam"],
  ["ἔμενον", "Permaneciam"],
  ["ἔμιξεν", "Misturou"],
  ["ἔμφοβοι", "Amedrontados"],
  ["ἔμφυτον", "Implantado"],

  // --- ἔν- palavras ---
  ["ἔνατος", "Nono"],
  ["ἔνδειγμα", "Demonstração"],
  ["ἔνδειξις", "Demonstração"],
  ["ἔνδικον", "Justa"],
  ["ἔνδικόν", "Justa"],
  ["ἔνδοξοι", "Ilustres"],
  ["ἔνδοξον", "Glorioso"],
  ["ἔνιψα", "Lavei"],
  ["ἔννοιαν", "Intenção"],
  ["ἔννομος", "Sob-lei"],
  ["ἔννυχα", "De-madrugada"],
  ["ἔνοχοι", "Réus"],
  ["ἔνοχον", "Réu"],
  ["ἔνοχός", "Réu"],
  ["ἔντιμος", "Honrado"],
  ["ἔνυξεν", "Perfurou"],

  // --- ἔξ- palavras ---
  ["ἔξυπνος", "Desperto"],

  // --- ἔπ- palavras ---
  ["ἔπαθον", "Sofreram"],
  ["ἔπαυλις", "Propriedade"],
  ["ἔπειθέν", "Persuadia"],
  ["ἔπειθον", "Persuadiam"],
  ["ἔπεισαν", "Persuadiram"],
  ["ἔπεσά", "Caí"],
  ["ἔπεχε", "Presta-atenção"],
  ["ἔπηξεν", "Fincou"],
  ["ἔπιδε", "Olha"],
  ["ἔπιπτεν", "Caía"],
  ["ἔπλησαν", "Encheram"],
  ["ἔπλυνον", "Lavavam"],
  ["ἔπνιγεν", "Sufocava"],
  ["ἔπος", "Palavra"],
  ["ἔπραξα", "Pratiquei"],
  ["ἔπραξαν", "Praticaram"],
  ["ἔπρεπεν", "Convinha"],
  ["ἔπταισαν", "Tropeçaram"],
  ["ἔπτυσεν", "Cuspiu"],

  // --- ἔρ- palavras ---
  ["ἔρημον", "Deserto"],
  ["ἔριδες", "Contendas"],
  ["ἔριδι", "Contenda"],
  ["ἔριδος", "Contenda"],
  ["ἔριφον", "Cabrito"],
  ["ἔρρηξεν", "Rasgou"],
  ["ἔρριπται", "Tem-sido-lançado"],
  ["ἔρχῃ", "Vens"],

  // --- ἔσ- palavras ---
  ["ἔσβεσαν", "Apagaram"],
  ["ἔσθητε", "Comei"],
  ["ἔσθοντες", "Comendo"],
  ["ἔσθων", "Comendo"],
  ["ἔσκαψεν", "Cavou"],
  ["ἔσπειρεν", "Semeou"],
  ["ἔσπευδεν", "Apressava-se"],
  ["ἔστηκεν", "Tem-permanecido-de-pé"],
  ["ἔστησάν", "Puseram-de-pé"],
  ["ἔστωσαν", "Sejam"],
  ["ἔσχες", "Tiveste"],
  ["ἔσχηκα", "Tenho-tido"],
  ["ἔσχηκεν", "Tem-tido"],
  ["ἔσχομεν", "Tivemos"],

  // --- ἔτ- palavras ---
  ["ἔτει", "Ano"],
  ["ἔτιλλον", "Arrancavam"],
  ["ἔτρεχον", "Corriam"],
  ["ἔτυπτεν", "Batia"],

  // --- ἔφ- palavras ---
  ["ἔφασκεν", "Afirmava"],
  ["ἔφερεν", "Trazia"],
  ["ἔφραξαν", "Taparam"],
  ["ἔφυγεν", "Fugiu"],

  // --- ἔχ- palavras ---
  ["ἔχαιρεν", "Alegrava-se"],
  ["ἔχαιρον", "Alegravam-se"],
  ["ἔχθραι", "Inimizades"],
  ["ἔχθρᾳ", "Inimizade"],
  ["ἔχιδνα", "Víbora"],
  ["ἔχοιεν", "Tivessem"],
  ["ἔχον", "Tendo"],
  ["ἔχοντά", "Tendo"],
  ["ἔχουσι", "Têm"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11am (freq 1, parte 39/44) ===`);
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

console.log(`\n=== Resultado Lote 11am ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

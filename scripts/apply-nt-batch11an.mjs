#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11an
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 40/44)
 * Hapax legomena: slice-an (ἔ/ἕ/Ἐ/Ἑ/Ἔ/Ἕ/ἠ words)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11an-${Date.now()}.sql`);

const translations = [
  // === 248 palavras de freq1-slice-an.json ===

  // --- ἔ- palavras (verbos no aoristo indicativo ativo, etc.) ---
  ["ἔχρισας", "ungiste"],
  ["ἔχρισεν", "ungiu"],
  ["ἔχωσι", "tenham"],
  ["ἕλκη", "úlceras"],
  ["ἕλκουσιν", "arrastam"],
  ["ἕξιν", "prática"],
  ["ἕτεραι", "outras"],
  ["ἕτοιμά", "preparadas"],
  ["ἕτοιμοί", "preparados"],
  ["ἕτοιμον", "preparado"],
  ["ἕτοιμος", "preparado"],

  // --- Ἐ- palavras maiúsculas ---
  ["Ἐάν", "Se"],
  ["Ἐβάστασαν", "Carregaram"],
  ["Ἐβλασφήμησεν", "Blasfemou"],
  ["Ἐβουλόμην", "Eu-desejava"],
  ["Ἐγέρθητε", "Levantai-vos"],
  ["Ἐγίνετο", "Acontecia"],
  ["Ἐγείρεσθε", "Levantai-vos"],
  ["Ἐγερθήσεται", "Será-levantado"],
  ["Ἐγόγγυζον", "Murmuravam"],
  ["Ἐζεκίαν", "Ezequias"],
  ["Ἐζεκίας", "Ezequias"],
  ["Ἐθεώρουν", "Contemplavam"],
  ["Ἐκδίκησόν", "Vinga"],
  ["Ἐκεῖ", "Ali"],
  ["Ἐκεῖθεν", "Dali"],
  ["Ἐκεῖνός", "Aquele"],
  ["Ἐκριζώθητι", "Sê-desarraigada"],
  ["Ἐλέησον", "Tem-misericórdia"],
  ["Ἐλέησόν", "Tem-misericórdia"],
  ["Ἐλήλυθεν", "Tem-vindo"],
  ["Ἐλαιῶνος", "Oliveiras"],
  ["Ἐλαμεῖται", "Elamitas"],
  ["Ἐλεήσω", "Terei-misericórdia"],
  ["Ἐλεύθεροι", "Livres"],
  ["Ἐλεύσομαι", "Virei"],
  ["Ἐλεύσονται", "Virão"],
  ["Ἐλθόντων", "Tendo-vindo"],
  ["Ἐλιέζερ", "Eliezer"],
  ["Ἐλιακείμ", "Eliaquim"],
  ["Ἐλιούδ", "Eliúde"],
  ["Ἐλιοὺδ", "Eliúde"],
  ["Ἐλμαδὰμ", "Elmadã"],
  ["Ἐλογίσθη", "Foi-contado"],
  ["Ἐλπίζω", "Espero"],
  ["Ἐλύμας", "Elimas"],
  ["Ἐμάχοντο", "Contendiam"],
  ["Ἐμίσησάν", "Odiaram"],
  ["Ἐμαρτύρει", "Testemunhava"],
  ["Ἐμμανουήλ", "Emanuel"],
  ["Ἐμμαοῦς", "Emaús"],
  ["Ἐμμὼρ", "Hamor"],
  ["Ἐμὸν", "Meu"],
  ["Ἐνέγκατε", "Trazei"],
  ["Ἐνέμεινεν", "Permaneceu"],
  ["Ἐνδύσασθε", "Revesti-vos"],
  ["Ἐνευλογηθήσονται", "Serão-abençoadas-em"],
  ["Ἐνοικήσω", "Habitarei-em"],
  ["Ἐνορκίζω", "Adjuro"],
  ["Ἐνὼς", "Enos"],
  ["Ἐξήγαγεν", "Conduziu-para-fora"],
  ["Ἐξανέστησαν", "Levantaram-se"],
  ["Ἐξεκλάσθησαν", "Foram-quebrados"],
  ["Ἐξερχόμενοι", "Saindo"],
  ["Ἐξιόντων", "Saindo"],
  ["Ἐξορκίζω", "Conjuro"],
  ["Ἐξῆλθεν", "Saiu"],
  ["Ἐπέτρεψεν", "Permitiu"],
  ["Ἐπίσκοπον", "Supervisor"],
  ["Ἐπίστευσα", "Cri"],
  ["Ἐπίτρεψόν", "Permite"],
  ["Ἐπαίνετον", "Epeneto"],
  ["Ἐπαινῶ", "Louvo"],
  ["Ἐπανάγαγε", "Conduz-de-volta"],
  ["Ἐπαφροδίτου", "Epafrodito"],
  ["Ἐπαφρόδιτον", "Epafrodito"],
  ["Ἐπαφρᾶ", "Epafras"],
  ["Ἐπειδήπερ", "Visto-que"],
  ["Ἐπερωτήσω", "Perguntarei"],
  ["Ἐπερωτηθεὶς", "Tendo-sido-perguntado"],
  ["Ἐπερωτῶ", "Pergunto"],
  ["Ἐπεσκέψατο", "Visitou"],
  ["Ἐπεφάνη", "Manifestou-se"],
  ["Ἐπεχείρησαν", "Empreenderam"],
  ["Ἐπεὶ", "Visto-que"],
  ["Ἐπηρώτων", "Perguntavam"],
  ["Ἐπιθυμίᾳ", "Desejo"],
  ["Ἐπικουρίων", "Epicureus"],
  ["Ἐπιμελήθητι", "Cuida"],
  ["Ἐπιμενόντων", "Permanecendo"],
  ["Ἐπιστρέψαντες", "Tendo-retornado"],
  ["Ἐπιτιμήσαι", "Repreender"],
  ["Ἐπιτρέπεταί", "É-permitido"],
  ["Ἐπροφήτευσεν", "Profetizou"],
  ["Ἐπῆλθαν", "Sobrevieram"],
  ["Ἐπ'", "Sobre"],
  ["Ἐρεῖς", "Dirás"],
  ["Ἐρυθρὰν", "Vermelho"],
  ["Ἐρυθρᾷ", "Vermelho"],
  ["Ἐρχόμεθα", "Vimos"],
  ["Ἐρωτῶ", "Peço"],
  ["Ἐσίγησεν", "Calou-se"],
  ["Ἐσθιόντων", "Comendo"],
  ["Ἐσκόρπισεν", "Espalhou"],
  ["Ἐσλεὶ", "Esli"],
  ["Ἐσρώμ", "Esrom"],
  ["Ἐτρέχετε", "Corríeis"],
  ["Ἐφάγομεν", "Comemos"],
  ["Ἐφέσιοι", "Efésios"],
  ["Ἐφέσιον", "Efésio"],
  ["Ἐφανέρωσά", "Manifestei"],
  ["Ἐφραὶμ", "Efraim"],
  ["Ἐφφαθά", "Efatá"],
  ["Ἐφώνησαν", "Clamaram"],
  ["Ἐφ'", "Sobre"],
  ["Ἐχθρὸς", "Inimigo"],
  ["Ἐχθὲς", "Ontem"],
  ["Ἐᾶτε", "Deixai"],

  // --- Ἑ- palavras (espírito áspero) ---
  ["Ἑβραίους", "Hebreus"],
  ["Ἑβραίων", "Hebreus"],
  ["Ἑβραῖοί", "Hebreus"],
  ["Ἑβραῖος", "Hebreu"],
  ["Ἑκατοντάρχου", "Centurião"],
  ["Ἑκουσίως", "Voluntariamente"],
  ["Ἑλισαίου", "Eliseu"],
  ["Ἑλλάδα", "Grécia"],
  ["Ἑλληνίδων", "Gregas"],
  ["Ἑλληνίς", "Grega"],
  ["Ἑλληνιστάς", "Helenistas"],
  ["Ἑλληνιστί", "Em-grego"],
  ["Ἑλληνιστὶ", "Em-grego"],
  ["Ἑλληνιστῶν", "Helenistas"],
  ["Ἑνὶ", "Um"],
  ["Ἑνὼχ", "Enoque"],
  ["Ἑρμογένης", "Hermógenes"],
  ["Ἑρμᾶν", "Hermes"],
  ["Ἑστὼς", "Tendo-estado-de-pé"],
  ["Ἑτοίμασον", "Prepara"],
  ["Ἑωράκαμεν", "Temos-visto"],
  ["Ἑώρακα", "Tenho-visto"],

  // --- Ἓ- palavras ---
  ["Ἓξ", "Seis"],

  // --- Ἔ- palavras (com acento agudo) ---
  ["Ἔα", "Ah"],
  ["Ἔβερ", "Héber"],
  ["Ἔγνωκα", "Tenho-conhecido"],
  ["Ἔγραψά", "Escrevi"],
  ["Ἔγραψα", "Escrevi"],
  ["Ἔκβαλε", "Lança-fora"],
  ["Ἔκτεινόν", "Estende"],
  ["Ἔκφοβός", "Aterrorizado"],
  ["Ἔμεινεν", "Permaneceu"],
  ["Ἔνοχος", "Culpado"],
  ["Ἔπρεπεν", "Convinha"],
  ["Ἔραστον", "Erasto"],
  ["Ἔρρωσθε", "Passai-bem"],
  ["Ἔσεσθε", "Sereis"],
  ["Ἔστω", "Seja"],
  ["Ἔστωσαν", "Sejam"],
  ["Ἔφη", "Disse"],
  ["Ἔχετέ", "Tendes"],
  ["Ἔχετε", "Tendes"],
  ["Ἔχουσι", "Têm"],

  // --- Ἕ- palavras (espírito áspero + agudo) ---
  ["Ἕκαστος", "Cada-um"],
  ["Ἕλληνές", "Gregos"],
  ["Ἕλλησίν", "Gregos"],
  ["Ἕν", "Um"],
  ["Ἕνεκα", "Por-causa-de"],
  ["Ἕνεκεν", "Por-causa-de"],

  // --- ἠ- palavras (verbos no imperfeito/aoristo, augmento ἠ-) ---

  // ἠγ- (amar, exultar, indignar, comprar, lutar)
  ["ἠγάπησέν", "amou"],
  ["ἠγαλλίασεν", "exultou"],
  ["ἠγανάκτησεν", "indignou-se"],
  ["ἠγαπήκαμεν", "temos-amado"],
  ["ἠγαπηκόσι", "tendo-amado"],
  ["ἠγαπημένοις", "tendo-sido-amados"],
  ["ἠγαπᾶτέ", "amáveis"],
  ["ἠγαπᾶτε", "amáveis"],
  ["ἠγγάρευσαν", "requisitaram"],
  ["ἠγωνίζοντο", "lutavam"],
  ["ἠγόραζον", "compravam"],
  ["ἠγόρασεν", "comprou"],
  ["ἠγώνισμαι", "tenho-lutado"],

  // ἠδ- (injustiçar, poder)
  ["ἠδίκηκα", "cometi-injustiça"],
  ["ἠδίκησέν", "cometeu-injustiça"],
  ["ἠδίκησεν", "cometeu-injustiça"],
  ["ἠδικήσαμεν", "cometemos-injustiça"],
  ["ἠδικήσατε", "cometestes-injustiça"],
  ["ἠδυνάσθη", "foi-capaz"],
  ["ἠδυνήθην", "fui-capaz"],
  ["ἠδυνήθητε", "fostes-capazes"],

  // ἠθ- (querer, reunir)
  ["ἠθελήσαμεν", "quisemos"],
  ["ἠθροισμένους", "tendo-sido-reunidos"],

  // ἠκ- (faltar tempo, seguir, ouvir, anular)
  ["ἠκαιρεῖσθε", "tínheis-falta-de-oportunidade"],
  ["ἠκολουθήκαμέν", "temos-seguido"],
  ["ἠκολούθησεν", "seguiu"],
  ["ἠκούσατέ", "ouvistes"],
  ["ἠκυρώσατε", "anulastes"],

  // ἠλ- (diminuir, ter misericórdia, conduzir, esperar)
  ["ἠλάττωσας", "diminuíste"],
  ["ἠλέησέν", "teve-misericórdia"],
  ["ἠλέησα", "tive-misericórdia"],
  ["ἠλέησεν", "teve-misericórdia"],
  ["ἠλαττωμένον", "tendo-sido-diminuído"],
  ["ἠλαττόνησεν", "teve-falta"],
  ["ἠλαύνετο", "era-impelido"],
  ["ἠλεήθημεν", "fomos-alvos-de-misericórdia"],
  ["ἠλεήθητε", "fostes-alvos-de-misericórdia"],
  ["ἠλεημένοι", "tendo-sido-alvos-de-misericórdia"],
  ["ἠλεημένος", "tendo-sido-alvo-de-misericórdia"],
  ["ἠλευθέρωσέν", "libertou"],
  ["ἠλευθέρωσεν", "libertou"],
  ["ἠλπίζομεν", "esperávamos"],
  ["ἠλπίκατε", "tendes-esperado"],
  ["ἠλπίσαμεν", "esperamos"],
  ["ἠλπικέναι", "ter-esperado"],
  ["ἠλπικότες", "tendo-esperado"],

  // ἠμ- (negligenciar, defender)
  ["ἠμέλησα", "negligenciei"],
  ["ἠμύνατο", "defendeu"],

  // ἠν- (forçar, abrir, tirar)
  ["ἠνάγκαζον", "forçavam"],
  ["ἠναγκάσατε", "forçastes"],
  ["ἠναγκάσθη", "foi-forçado"],
  ["ἠναγκάσθην", "fui-forçado"],
  ["ἠνεῴχθησάν", "foram-abertas"],
  ["ἠνοίγησαν", "abriram"],
  ["ἠντληκότες", "tendo-tirado"],

  // ἠξ- (considerar digno)
  ["ἠξίου", "considerava-digno"],
  ["ἠξίωσα", "considerei-digno"],
  ["ἠξίωται", "tem-sido-considerado-digno"],

  // ἠπ- (descrer, enganar, desobedecer, ameaçar, estar-perplexo)
  ["ἠπίστησάν", "descreram"],
  ["ἠπίστησαν", "descreram"],
  ["ἠπατήθη", "foi-enganada"],
  ["ἠπείθησαν", "desobedeceram"],
  ["ἠπείθουν", "desobedeciam"],
  ["ἠπείλει", "ameaçava"],
  ["ἠπειθήσατε", "desobedecestes"],
  ["ἠπόρει", "estava-perplexo"],

  // ἠρ- (provocar, contar, almoçar, trabalhar, levantar, negar, temperar, perguntar)
  ["ἠρέθισεν", "provocou"],
  ["ἠρίθμηνται", "têm-sido-contados"],
  ["ἠρίστησαν", "almoçaram"],
  ["ἠργάζοντο", "trabalhavam"],
  ["ἠργάσαντο", "trabalharam"],
  ["ἠργασάμεθα", "trabalhamos"],
  ["ἠριθμημέναι", "tendo-sido-contadas"],
  ["ἠρμένον", "tendo-sido-levantado"],
  ["ἠρνήσαντο", "negaram"],
  ["ἠρνεῖτο", "negava"],
  ["ἠρνημένοι", "tendo-negado"],
  ["ἠρτυμένος", "tendo-sido-temperado"],
  ["ἠρώτουν", "perguntavam"],

  // ἠσ- (agir impiamente, adoecer)
  ["ἠσέβησαν", "agiram-impiamente"],
  ["ἠσθένησα", "adoeci"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11an (freq 1, parte 40/44) ===`);
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

console.log(`\n=== Resultado Lote 11an ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11ab
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 28/44)
 */
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11ab-${Date.now()}.sql`);
const translations = [
  // === ἀλ- palavras (alfa-lambda) ===
  ["ἀλάλους", "mudos"],
  ["ἀλήθειά", "verdade"],
  ["ἀλαζονία", "arrogância"],
  ["ἀλαζονίαις", "arrogâncias"],
  ["ἀλαζόνας", "arrogantes"],
  ["ἀλαζόνες", "arrogantes"],
  ["ἀλαλάζον", "ressoando"],
  ["ἀλαλάζοντας", "uivando"],
  ["ἀλαλήτοις", "inexprimíveis"],
  ["ἀλείψαντες", "tendo-ungido"],
  ["ἀλείψασα", "tendo-ungido"],
  ["ἀλείψωσιν", "unjam"],
  ["ἀλεκτοροφωνίας", "canto-do-galo"],
  ["ἀληθεύοντες", "falando-a-verdade"],
  ["ἀληθεύων", "falando-a-verdade"],
  ["ἀληθεῖς", "verdadeiros"],
  ["ἀληθινή", "verdadeira"],
  ["ἀληθινὴ", "verdadeira"],
  ["ἀληθινῶν", "verdadeiros"],
  ["ἀληθοῦς", "verdadeiro"],
  ["ἀλισγημάτων", "contaminações"],
  ["ἀλλά", "mas"],
  ["ἀλλάξαι", "mudar"],
  ["ἀλλάξει", "mudará"],
  ["ἀλλαγήσονται", "serão-mudados"],
  ["ἀλλαχοῦ", "em-outro-lugar"],
  ["ἀλλαχόθεν", "por-outro-lugar"],
  ["ἀλληγορούμενα", "sendo-alegorizados"],
  ["ἀλλογενὴς", "de-outra-raça"],
  ["ἀλλοτρίαις", "alheias"],
  ["ἀλλοτρίαν", "alheia"],
  ["ἀλλοτρίοις", "alheios"],
  ["ἀλλοτρίᾳ", "alheia"],
  ["ἀλλοτριεπίσκοπος", "intrometido-em-assuntos-alheios"],
  ["ἀλλοφύλῳ", "estrangeiro"],
  ["ἀλοῶν", "debulhando"],
  ["ἀλυπότερος", "menos-triste"],
  ["ἀλυσιτελὲς", "sem-proveito"],
  ["ἀλόης", "aloés"],
  ["ἀλώπεκι", "raposa"],

  // === ἀμ- palavras (alfa-mu) ===
  ["ἀμάραντον", "imarcescível"],
  ["ἀμάρτυρον", "sem-testemunho"],
  ["ἀμάχους", "não-contenciosos"],
  ["ἀμέλει", "não-se-importando"],
  ["ἀμέμπτους", "irrepreensíveis"],
  ["ἀμήτωρ", "sem-mãe"],
  ["ἀμίαντον", "imaculado"],
  ["ἀμαθεῖς", "ignorantes"],
  ["ἀμαράντινον", "imarcescível"],
  ["ἀμετάθετον", "imutável"],
  ["ἀμεταθέτων", "imutáveis"],
  ["ἀμετακίνητοι", "inamovíveis"],
  ["ἀμεταμέλητα", "irrevogáveis"],
  ["ἀμεταμέλητον", "irrevogável"],
  ["ἀμετανόητον", "impenitente"],
  ["ἀμησάντων", "dos-que-não-ceifaram"],
  ["ἀμνοῦ", "cordeiro"],
  ["ἀμνὸς", "cordeiro"],
  ["ἀμοιβὰς", "retribuições"],
  ["ἀμπέλῳ", "videira"],
  ["ἀμπελουργόν", "vinhateiro"],
  ["ἀμφίβληστρον", "rede-de-pesca"],
  ["ἀμφιέζει", "veste"],
  ["ἀμφιέννυσιν", "veste"],
  ["ἀμφιβάλλοντας", "lançando-rede"],
  ["ἀμφοτέροις", "ambos"],
  ["ἀμφοτέρους", "ambos"],
  ["ἀμφοτέρων", "ambos"],
  ["ἀμφόδου", "encruzilhada"],
  ["ἀμώμητοι", "irrepreensíveis"],
  ["ἀμώμου", "sem-mancha"],

  // === ἀνά- palavras (prefixo ana-) — subida/retorno/repetição ===
  ["ἀνάβητε", "subi"],
  ["ἀνάβλεψιν", "recuperação-da-visão"],
  ["ἀνάβλεψον", "olha-para-cima"],
  ["ἀνάγκασον", "compele"],
  ["ἀνάγκῃ", "necessidade"],
  ["ἀνάγνωσιν", "leitura"],
  ["ἀνάδειξον", "mostra-publicamente"],
  ["ἀνάκυψας", "tendo-se-erguido"],
  ["ἀνάμνησις", "lembrança"],
  ["ἀνάξιοί", "indignos"],
  ["ἀνάπαυσιν", "descanso"],
  ["ἀνάπαυσόν", "dá-descanso"],
  ["ἀνάπτει", "acende"],
  ["ἀνάστα", "levanta-te"],
  ["ἀνάχυσιν", "excesso"],

  // === ἀνέ- verbos aoristo/imperfeito (prefixo ana- + aumento) ===
  ["ἀνέβαινον", "subiam"],
  ["ἀνέβλεψέν", "recuperou-a-visão"],
  ["ἀνέβλεψαν", "recuperaram-a-visão"],
  ["ἀνέγκλητοι", "irrepreensíveis"],
  ["ἀνέγκλητον", "irrepreensível"],
  ["ἀνέγκλητος", "irrepreensível"],
  ["ἀνέγνωσαν", "leram"],
  ["ἀνέδειξεν", "mostrou-publicamente"],
  ["ἀνέθετο", "expôs"],
  ["ἀνέθη", "subiu"],
  ["ἀνέκειτο", "estava-reclinado"],
  ["ἀνέκλειπτον", "inesgotável"],
  ["ἀνέκλινεν", "reclinou"],
  ["ἀνέκραγον", "clamaram"],
  ["ἀνέκραξαν", "clamaram"],
  ["ἀνέλεος", "sem-misericórdia"],
  ["ἀνέντες", "tendo-afrouxado"],
  ["ἀνέξονται", "suportarão"],
  ["ἀνέπαυσαν", "deram-descanso"],
  ["ἀνέπεμψά", "enviei-de-volta"],
  ["ἀνέσεισαν", "agitaram"],
  ["ἀνέτρεψεν", "transtornou"],
  ["ἀνέχεσθέ", "suportais"],
  ["ἀνέψυξεν", "refrigerou"],
  ["ἀνέῳξεν", "abriu"],

  // === ἀνή- verbos e adjetivos ===
  ["ἀνήγγειλάν", "anunciaram"],
  ["ἀνήγγελλον", "anunciavam"],
  ["ἀνήμεροι", "selvagens"],
  ["ἀνήνεγκεν", "ofereceu"],
  ["ἀνήφθη", "foi-aceso"],
  ["ἀνήχθησαν", "foram-levados-ao-mar"],

  // === ἀνί- verbos ===
  ["ἀνίστασθαι", "levantar-se"],
  ["ἀνίσταται", "levanta-se"],

  // === ἀναί- / ἀναβ- palavras ===
  ["ἀναίτιοί", "inocentes"],
  ["ἀναβάντες", "tendo-subido"],
  ["ἀναβάντων", "dos-que-subiram"],
  ["ἀναβέβηκα", "tenho-subido"],
  ["ἀναβέβηκεν", "tem-subido"],
  ["ἀναβήσεται", "subirá"],
  ["ἀναβαίνοντας", "subindo"],
  ["ἀναβαίνοντες", "subindo"],
  ["ἀναβαίνουσιν", "sobem"],
  ["ἀναβαίνω", "subo"],
  ["ἀναβαθμούς", "degraus"],
  ["ἀναβαθμῶν", "degraus"],
  ["ἀναβιβάσαντες", "tendo-puxado-para-cima"],
  ["ἀναβλέψαντος", "tendo-recuperado-a-visão"],
  ["ἀναβλέψασαι", "tendo-olhado-para-cima"],
  ["ἀναβλέψῃ", "recupere-a-visão"],
  ["ἀναβλέψῃς", "recuperes-a-visão"],
  ["ἀναβολὴν", "adiamento"],

  // === ἀναγ- palavras ===
  ["ἀναγαγών", "tendo-levado-para-cima"],
  ["ἀναγγέλλομεν", "anunciamos"],
  ["ἀναγγέλλοντες", "anunciando"],
  ["ἀναγγέλλων", "anunciando"],
  ["ἀναγεγεννημένοι", "tendo-sido-regenerados"],
  ["ἀναγεννήσας", "tendo-regenerado"],
  ["ἀναγινωσκομένας", "sendo-lidas"],
  ["ἀναγινωσκομένη", "sendo-lida"],
  ["ἀναγινωσκόμενος", "sendo-lido"],
  ["ἀναγινώσκετε", "ledes"],
  ["ἀναγινώσκηται", "seja-lido"],
  ["ἀναγινώσκοντες", "lendo"],
  ["ἀναγινώσκοντος", "lendo"],
  ["ἀναγινώσκων", "lendo"],
  ["ἀναγκάζεις", "compeles"],
  ["ἀναγκάζουσιν", "compelem"],
  ["ἀναγκαίας", "necessárias"],
  ["ἀναγκαίους", "necessários"],
  ["ἀναγκαιότερον", "mais-necessário"],
  ["ἀναγκαστῶς", "por-compulsão"],
  ["ἀναγκαῖά", "necessárias"],
  ["ἀναγνοὺς", "tendo-lido"],
  ["ἀναγνωσθῆναι", "ser-lida"],
  ["ἀναγνόντες", "tendo-lido"],
  ["ἀναγνῶναι", "ler"],
  ["ἀναγνῶτε", "leiais"],
  ["ἀναγομένοις", "aos-que-estão-navegando"],

  // === ἀναδ- / ἀναζ- / ἀναθ- palavras ===
  ["ἀναδείξεως", "manifestação"],
  ["ἀναδόντες", "tendo-entregado"],
  ["ἀναζητοῦντες", "buscando"],
  ["ἀναζητῆσαι", "buscar"],
  ["ἀναζωπυρεῖν", "reavivar"],
  ["ἀναζωσάμενοι", "tendo-cingido"],
  ["ἀναθήμασιν", "ofertas-votivas"],
  ["ἀναθεματίζειν", "amaldiçoar"],
  ["ἀναθεωροῦντες", "observando-atentamente"],
  ["ἀναθεωρῶν", "observando-atentamente"],

  // === ἀναι- / ἀνακ- palavras ===
  ["ἀναιδίαν", "impudência"],
  ["ἀναιρέσει", "morte"],
  ["ἀναιρεῖ", "mata"],
  ["ἀναιρεῖν", "matar"],
  ["ἀναιρεῖσθαι", "ser-morto"],
  ["ἀναιρουμένων", "sendo-mortos"],
  ["ἀναιρούντων", "dos-que-matam"],
  ["ἀναιτίους", "inocentes"],
  ["ἀνακάμψει", "retornará"],
  ["ἀνακάμψω", "retornarei"],
  ["ἀνακαινίζειν", "renovar"],
  ["ἀνακαινούμενον", "sendo-renovado"],
  ["ἀνακαινοῦται", "é-renovado"],
  ["ἀνακαινώσει", "renovação"],
  ["ἀνακαινώσεως", "renovação"],
  ["ἀνακαλυπτόμενον", "sendo-desvelado"],
  ["ἀνακεκαλυμμένῳ", "tendo-sido-desvelado"],
  ["ἀνακεκύλισται", "tem-sido-rolado"],
  ["ἀνακεφαλαιοῦται", "é-recapitulado"],
  ["ἀνακεφαλαιώσασθαι", "recapitular"],
  ["ἀνακλινεῖ", "reclinará"],
  ["ἀνακράξας", "tendo-clamado"],
  ["ἀνακρίναντές", "tendo-examinado"],
  ["ἀνακρίνει", "examina"],
  ["ἀνακρίνουσίν", "examinam"],
  ["ἀνακρίνω", "examino"],
  ["ἀνακρίνων", "examinando"],
  ["ἀνακρίσεως", "exame"],
  ["ἀνακριθῶ", "seja-examinado"],
  ["ἀνακρινόμεθα", "somos-examinados"],
  ["ἀνακύψαι", "erguer-se"],
  ["ἀνακύψας", "tendo-se-erguido"],
  ["ἀνακύψατε", "erguei-vos"],

  // === ἀναλ- palavras ===
  ["ἀναλάβετε", "tomai"],
  ["ἀναλήμψεως", "ascensão"],
  ["ἀναλαβὼν", "tendo-tomado"],
  ["ἀναλαμβάνειν", "tomar"],
  ["ἀναλημφθεὶς", "tendo-sido-levado-para-cima"],
  ["ἀναλογίαν", "proporção"],
  ["ἀναλογίσασθε", "considerai"],
  ["ἀναλωθῆτε", "sejais-consumidos"],
  ["ἀναλύσεώς", "partida"],
  ["ἀναλύσῃ", "retorne"],
  ["ἀναλῦσαι", "partir"],
  ["ἀναλῶσαι", "consumir"],

  // === ἀναμ- / ἀναν- / ἀναξ- / ἀναπ- palavras ===
  ["ἀναμάρτητος", "sem-pecado"],
  ["ἀναμένειν", "aguardar"],
  ["ἀναμιμνῃσκομένου", "lembrando-se"],
  ["ἀναμιμνῄσκω", "faço-lembrar"],
  ["ἀναμνήσει", "lembrança"],
  ["ἀναμνησθεὶς", "tendo-se-lembrado"],
  ["ἀνανήψωσιν", "voltem-à-sobriedade"],
  ["ἀνανεοῦσθαι", "ser-renovado"],
  ["ἀναντιρρήτων", "incontestáveis"],
  ["ἀναντιρρήτως", "incontestavelmente"],
  ["ἀναξίως", "indignamente"],
  ["ἀναπέμψω", "enviarei-de-volta"],
  ["ἀναπαύεται", "descansa"],
  ["ἀναπαύου", "descansa"],
  ["ἀναπαύσασθε", "descansai"],
  ["ἀναπαύσω", "darei-descanso"],
  ["ἀναπείθει", "persuade"],
  ["ἀναπεσὼν", "tendo-reclinado"],
  ["ἀναπηδήσας", "tendo-saltado"],
  ["ἀναπληροῦται", "é-preenchido"],
  ["ἀναπληρώσετε", "preenchereis"],
  ["ἀναπληρώσῃ", "preencha"],
  ["ἀναπληρῶν", "preenchendo"],
  ["ἀναπληρῶσαι", "preencher"],
  ["ἀναπολογήτους", "indesculpáveis"],
  ["ἀναπολόγητος", "indesculpável"],
  ["ἀναρίθμητος", "inumerável"],
  ["ἀνασκευάζοντες", "perturbando"],
  ["ἀνασπάσει", "puxará-para-cima"],
];
let success = 0, errors = 0, totalUpdated = 0;
console.log(`\n=== Tradução NT - Lote 11ab (freq 1, parte 28/44) ===`);
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
console.log(`\n=== Resultado Lote 11ab ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

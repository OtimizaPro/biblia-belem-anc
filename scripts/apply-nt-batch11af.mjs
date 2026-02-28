#!/usr/bin/env node
/**
 * Batch NT Translation - Lote 11af
 * Aplica traduções literais para palavras gregas freq 1 no NT (parte 32/44)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `batch11af-${Date.now()}.sql`);

const translations = [
  // === Lote 11af: freq 1, parte 32/44 (248 palavras) ===

  // --- ἀφ- (espumando, insensatez, etc.) ---
  ["ἀφρίζων", "espumando"],
  ["ἀφροσύνη", "insensatez"],
  ["ἀφροσύνης", "insensatez"],
  ["ἀφροῦ", "espuma"],
  ["ἀφυστερημένος", "tendo-ficado-privado"],
  ["ἀφωμοιωμένος", "tendo-sido-assemelhado"],
  ["ἀφωρισμένος", "tendo-sido-separado"],
  ["ἀφύπνωσεν", "adormeceu"],
  ["ἀφώριζεν", "separava"],
  ["ἀφώρισεν", "separou"],
  ["ἀφῆκά", "deixei"],
  ["ἀφῆκέν", "deixou"],
  ["ἀφῶμεν", "deixemos"],

  // --- ἀχ- (ingratos, sem mãos, etc.) ---
  ["ἀχάριστοι", "ingratos"],
  ["ἀχαρίστους", "ingratos"],
  ["ἀχειροποιήτῳ", "não-feito-por-mãos"],
  ["ἀχθήσεσθε", "sereis-levados"],
  ["ἀχλὺς", "névoa"],
  ["ἀχρεῖοί", "inúteis"],
  ["ἀχρεῖον", "inútil"],

  // --- ἀψ- (sem mentira, eternos, invisível) ---
  ["ἀψευδὴς", "sem-mentira"],
  ["ἀϊδίοις", "eternos"],
  ["ἀόρατον", "invisível"],

  // --- ἁγ- (santifica, santificação, santidade, pureza) ---
  ["ἁγίασον", "santifica"],
  ["ἁγιάζει", "santifica"],
  ["ἁγιάζεται", "é-santificado"],
  ["ἁγιάζον", "santificando"],
  ["ἁγιάζω", "santifico"],
  ["ἁγιάζων", "santificando"],
  ["ἁγιάσαι", "santificar"],
  ["ἁγιάσας", "tendo-santificado"],
  ["ἁγιάσατε", "santificai"],
  ["ἁγιαζομένους", "sendo-santificados"],
  ["ἁγιαζόμενοι", "sendo-santificados"],
  ["ἁγιασθήτω", "seja-santificado"],
  ["ἁγιωσύνην", "santidade"],
  ["ἁγιωσύνης", "santidade"],
  ["ἁγιωσύνῃ", "santidade"],
  ["ἁγιωτάτῃ", "santíssima"],
  ["ἁγιότητι", "santidade"],
  ["ἁγιότητος", "santidade"],

  // --- ἁγν- (puro, purifica, purificação) ---
  ["ἁγνά", "puras"],
  ["ἁγνάς", "puras"],
  ["ἁγνή", "pura"],
  ["ἁγνίζει", "purifica"],
  ["ἁγνίσατε", "purificai"],
  ["ἁγνίσθητι", "purifica-te"],
  ["ἁγνίσωσιν", "purifiquem"],
  ["ἁγνισθεὶς", "tendo-se-purificado"],
  ["ἁγνισμοῦ", "purificação"],
  ["ἁγνοὺς", "puros"],
  ["ἁγνός", "puro"],
  ["ἁγνότητι", "pureza"],
  ["ἁγνότητος", "pureza"],
  ["ἁγνὸν", "puro"],
  ["ἁγνῶς", "puramente"],

  // --- ἁδρ- / ἁλ- (abundância, pescar, saltando, salgado, correntes) ---
  ["ἁδρότητι", "abundância"],
  ["ἁλιεύειν", "pescar"],
  ["ἁλλομένου", "saltando"],
  ["ἁλλόμενος", "saltando"],
  ["ἁλυκὸν", "salgado"],
  ["ἁλύσεσι", "correntes"],

  // --- ἁμαρτ- (pecado, pecar, pecadores) ---
  ["ἁμάρτημα", "pecado"],
  ["ἁμάρτητε", "pequeis"],
  ["ἁμαρτάνειν", "pecar"],
  ["ἁμαρτάνοντα", "pecando"],
  ["ἁμαρτάνοντας", "pecando"],
  ["ἁμαρτάνουσιν", "pecam"],
  ["ἁμαρτάνων", "pecando"],
  ["ἁμαρτήματα", "pecados"],
  ["ἁμαρτήματος", "pecado"],
  ["ἁμαρτήσαντας", "tendo-pecado"],
  ["ἁμαρτήσαντος", "tendo-pecado"],
  ["ἁμαρτήσασιν", "tendo-pecado"],
  ["ἁμαρτήσει", "pecará"],
  ["ἁμαρτήσωμεν", "pequemos"],
  ["ἁμαρτανόντων", "pecando"],
  ["ἁμαρτημάτων", "pecados"],
  ["ἁμαρτησάντων", "tendo-pecado"],
  ["ἁμαρτωλὸν", "pecador"],

  // --- ἁπ- / ἁρ- (todos, simplicidade, juntas, arrebatar) ---
  ["ἁπάντων", "todos"],
  ["ἁπλότητα", "simplicidade"],
  ["ἁπλῶς", "simplesmente"],
  ["ἁρμῶν", "juntas"],
  ["ἁρπάζοντες", "arrebatando"],
  ["ἁρπάζουσιν", "arrebatam"],
  ["ἁρπάσει", "arrebatará"],
  ["ἁρπαγέντα", "tendo-sido-arrebatado"],
  ["ἁρπαγησόμεθα", "seremos-arrebatados"],
  ["ἁρπαγμὸν", "roubo"],
  ["ἁρπαγὴν", "rapina"],

  // --- ἁφ- (toque, tocando) ---
  ["ἁφῆς", "toque"],
  ["ἁφῶν", "toques"],
  ["ἁψάμενός", "tendo-tocado"],

  // --- ἄγ- (vasos, conduzir, anzol, âncora, etc.) ---
  ["ἄγγη", "vasos"],
  ["ἄγε", "vem"],
  ["ἄγειν", "conduzir"],
  ["ἄγεσθαι", "ser-conduzido"],
  ["ἄγεσθε", "sois-conduzidos"],
  ["ἄγκιστρον", "anzol"],
  ["ἄγκυραν", "âncora"],
  ["ἄγοντες", "conduzindo"],
  ["ἄγουσι", "conduzem"],
  ["ἄγραν", "presa"],
  ["ἄγρια", "selvagens"],
  ["ἄγρᾳ", "pesca"],
  ["ἄγω", "conduzo"],
  ["ἄγωσιν", "conduzam"],

  // --- ἄδ- (obscuras, obscuro, injusto, sem-engano) ---
  ["ἄδηλα", "obscuras"],
  ["ἄδηλον", "obscuro"],
  ["ἄδικός", "injusto"],
  ["ἄδολον", "sem-engano"],

  // --- ἄζ- / ἄθ- / ἄκ- (ázimos, sem-Deus, luta, inocente, infrutífero) ---
  ["ἄζυμα", "ázimos"],
  ["ἄζυμοι", "ázimos"],
  ["ἄθεοι", "sem-Theos"],
  ["ἄθλησιν", "luta"],
  ["ἄκακος", "inocente"],
  ["ἄκαρπα", "infrutíferas"],
  ["ἄκαρποι", "infrutíferos"],
  ["ἄκαρπός", "infrutífero"],
  ["ἄκων", "involuntariamente"],

  // --- ἄλ- (unge, outras, outro, de-outro-modo, irracional) ---
  ["ἄλειψαί", "unge"],
  ["ἄλλαι", "outras"],
  ["ἄλλας", "outras"],
  ["ἄλλην", "outra"],
  ["ἄλλου", "outro"],
  ["ἄλλως", "de-outro-modo"],
  ["ἄλογον", "irracional"],

  // --- ἄμ- (pacífico, areia, sem-mácula, sem-sal) ---
  ["ἄμαχον", "pacífico"],
  ["ἄμμον", "areia"],
  ["ἄμμος", "areia"],
  ["ἄμωμα", "sem-mácula"],
  ["ἄμωμος", "sem-mácula"],
  ["ἄναλον", "sem-sal"],

  // --- ἄν- (vento, homem, alívio, endro, carvões, homens, insensatez) ---
  ["ἄνεμον", "vento"],
  ["ἄνεμος", "vento"],
  ["ἄνερ", "homem"],
  ["ἄνεσις", "alívio"],
  ["ἄνηθον", "endro"],
  ["ἄνθρακας", "carvões"],
  ["ἄνθρωποί", "homens"],
  ["ἄνθρωπόν", "homem"],
  ["ἄνοια", "insensatez"],
  ["ἄντικρυς", "defronte"],
  ["ἄντλημα", "balde"],
  ["ἄνω", "acima"],
  ["ἄνωθέν", "de-cima"],

  // --- ἄξ- (conduzirá, digno, eixo) ---
  ["ἄξει", "conduzirá"],
  ["ἄξιόν", "digno"],
  ["ἄξων", "eixo"],

  // --- ἄπ- (vai-embora, estou-ausente, inexperiente, incrédulos) ---
  ["ἄπαγε", "vai-embora"],
  ["ἄπειμι", "estou-ausente"],
  ["ἄπειρος", "inexperiente"],
  ["ἄπιστοι", "incrédulos"],

  // --- ἄρ- (porventura, sem-costura, prata, almoço, cordeiros, começar, arado, indizíveis, doentes, machos, completo, pães, governante) ---
  ["ἄραγε", "porventura"],
  ["ἄραφος", "sem-costura"],
  ["ἄργυρον", "prata"],
  ["ἄργυρος", "prata"],
  ["ἄριστον", "almoço"],
  ["ἄριστόν", "almoço"],
  ["ἄρνας", "cordeiros"],
  ["ἄρξασθαί", "começar"],
  ["ἄρξασθαι", "começar"],
  ["ἄρξεσθε", "começareis"],
  ["ἄρξονται", "começarão"],
  ["ἄρξωνται", "comecem"],
  ["ἄρξῃ", "comece"],
  ["ἄροτρον", "arado"],
  ["ἄρρητα", "indizíveis"],
  ["ἄρρωστοι", "doentes"],
  ["ἄρσεσιν", "machos"],
  ["ἄρτιος", "completo"],
  ["ἄρτοις", "pães"],
  ["ἄρχοντος", "governante"],
  ["ἄρχουσιν", "governam"],
  ["ἄρῃς", "levantes"],

  // --- ἄσ- (inextinguível, sem-alimento, insensatos, saúda, imaculados, implacáveis, sem-afeição-natural) ---
  ["ἄσβεστον", "inextinguível"],
  ["ἄσιτοι", "sem-alimento"],
  ["ἄσοφοι", "insensatos"],
  ["ἄσπασαι", "saúda"],
  ["ἄσπιλοι", "imaculados"],
  ["ἄσπονδοι", "implacáveis"],
  ["ἄστοργοι", "sem-afeição-natural"],

  // --- ἄστρ- (estrelas, estrela) ---
  ["ἄστρα", "estrelas"],
  ["ἄστροις", "estrelas"],
  ["ἄστρον", "estrela"],
  ["ἄστρων", "estrelas"],

  // --- ἄτ- / ἄφ- / ἄχ- / ἄψ- (desonrados, invisível, incorruptíveis, partida, mudas, mudo, inútil, sem-vida) ---
  ["ἄτιμοι", "desonrados"],
  ["ἄφαντος", "invisível"],
  ["ἄφθαρτοι", "incorruptíveis"],
  ["ἄφιξίν", "partida"],
  ["ἄφωνα", "mudas"],
  ["ἄφωνος", "mudo"],
  ["ἄχρηστον", "inútil"],
  ["ἄψυχα", "sem-vida"],

  // --- ἅγ- (santas, santo, santos) ---
  ["ἅγιά", "santas"],
  ["ἅγιαι", "santas"],
  ["ἅγιε", "santo"],
  ["ἅγιοι", "santos"],
  ["ἅγιός", "santo"],

  // --- ἅλ- (sal, corrente, captura) ---
  ["ἅλα", "sal"],
  ["ἅλατι", "sal"],
  ["ἅλυσίν", "corrente"],
  ["ἅλωσιν", "captura"],

  // --- ἅπτ- (toca, toqueis, toque, não-toques) ---
  ["ἅπτει", "acende"],
  ["ἅπτεσθε", "toqueis"],
  ["ἅπτηται", "toque"],
  ["ἅπτου", "não-toques"],

  // --- ἅρμ- (carro, carruagem, rapaz, rapazes) ---
  ["ἅρμα", "carro"],
  ["ἅρματι", "carro"],
  ["ἅρματος", "carro"],
  ["ἅρπαξ", "rapace"],
  ["ἅρπαξιν", "rapaces"],

  // --- ἅψ- (tendo-acendido, acendas) ---
  ["ἅψαντες", "tendo-acendido"],
  ["ἅψῃ", "acendas"],

  // --- ἆρ- / ἆσ- (levanta, mais-perto) ---
  ["ἆρόν", "levanta"],
  ["ἆσσον", "mais-perto"],

  // --- Nomes próprios com Ἀ ---
  ["Ἀβιαθὰρ", "Abiatar"],
  ["Ἀβιληνῆς", "Abilene"],
  ["Ἀβιούδ", "Abiúde"],
  ["Ἀβιοὺδ", "Abiúde"],
  ["Ἀβιὰ", "Abias"],
  ["Ἀγαθός", "Bom"],
  ["Ἀγαπᾶτε", "Amai"],
  ["Ἀγαπῶ", "Amo"],
  ["Ἀγρὸν", "Campo"],
  ["Ἀγρὸς", "Campo"],
  ["Ἀγωνίζεσθε", "Lutai"],
  ["Ἀγόρασον", "Compra"],
  ["Ἀδάμ", "Adão"],
  ["Ἀδδεὶ", "Adi"],
  ["Ἀδελφέ", "Irmão"],
  ["Ἀδμεὶν", "Admim"],
  ["Ἀδρίᾳ", "Ádria"],
  ["Ἀδραμυττηνῷ", "Adramiteno"],
  ["Ἀδύνατον", "Impossível"],
  ["Ἀεὶ", "Sempre"],
  ["Ἀζώρ", "Azor"],
  ["Ἀζὼρ", "Azor"],
  ["Ἀθῷός", "Inocente"],
  ["Ἀκελδαμάχ", "Akeldamá"],
  ["Ἀκηκόαμεν", "Temos-ouvido"],
  ["Ἀκμὴν", "Ainda"],
  ["Ἀκουσόμεθά", "Ouviremos"],
  ["Ἀκουόντων", "Ouvindo"],
  ["Ἀκούεις", "Ouves"],
  ["Ἀκούοντες", "Ouvindo"],
  ["Ἀκούοντος", "Ouvindo"],
];

let success = 0, errors = 0, totalUpdated = 0;

console.log(`\n=== Tradução NT - Lote 11af (freq 1, parte 32/44) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

for (const [word, translation] of translations) {
  try {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTranslation = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTranslation}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]';`;
    writeFileSync(tmpFile, sql, 'utf-8');
    const result = execSync(`npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
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

console.log(`\n=== Resultado Lote 11af ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

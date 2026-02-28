#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch G (palavras 601-700)
 * Aplica traducoes literais para palavras hebraicas freq 5-9 no AT (parte G)
 * Palavras 601-700 da lista de frequencia 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5g-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, indices 601-700 (100 palavras) ===

  // --- וּבַ / וּבְ (e-no/e-em prefixed) ---
  ["וּבַיּ֧וֹם", "e-no-dia"],
  ["וּבֵ֥ין", "e-entre"],
  ["וּבְעַ֖ד", "e-por"],
  ["וּבְנֵי־", "e-filhos-de"],

  // --- וַתּ (vav consecutivo feminino) ---
  ["וַתָּבֹ֥א", "e-veio"],

  // --- וַיּ (vav consecutivo masculino) ---
  ["וַיָּשִׂ֥ימוּ", "e-puseram"],
  ["וַיָּבֹ֣אוּ", "e-vieram"],
  ["וַיָּ֥שֶׂם", "e-pos"],
  ["וַיָּ֣מָד", "e-mediu"],
  ["וַיָּ֙שָׁב֙", "e-voltou"],
  ["וַיַּעֲבֹ֤ר", "e-passou"],
  ["וַיַּעֲבֹ֣ר", "e-passou"],
  ["וַיַּגֵּ֣ד", "e-declarou"],
  ["וַיִּשָּׂ֨א", "e-levantou"],
  ["וַיִּלָּ֖חֶם", "e-lutou"],
  ["וַיִּכְתֹּ֣ב", "e-escreveu"],
  ["וַיְדַבֵּ֨ר", "e-falou"],
  ["וַיְדַבֵּ֤ר", "e-falou"],

  // --- וַח / וַא (vav consecutivo outros) ---
  ["וַחֲמִשִּׁ֣ים", "e-cinquenta"],
  ["וַאֲשֶׁ֣ר", "e-que"],
  ["וַאֲמַרְתֶּ֖ם", "e-dissestes"],

  // --- וְשׁ / וְר / וְק / וְע / וְנ / וְל / וְכ / וְי / וְח / וְז / וְה / וְא (vav conjuntivo) ---
  ["וְשַׂמְתִּ֤י", "e-porei"],
  ["וְשֵׁ֣שׁ", "e-linho"],
  ["וְרָאָ֨ה", "e-vera"],
  ["וְק֥וֹל", "e-voz"],
  ["וְעָשִׂ֣יתָ", "e-faras"],
  ["וְעָ֣שָׂה", "e-fez"],
  ["וְעֵ֣ת", "e-tempo"],
  ["וְנָתַתָּ֣ה", "e-daras"],
  ["וְנָתַן֙", "e-deu"],
  ["וְנָֽתַתִּי֙", "e-darei"],
  ["וְלָקַחְתָּ֣", "e-tomaras"],
  ["וְלַכְּבָשִׂ֛ים", "e-para-os-cordeiros"],
  ["וְלִפְנֵ֖י", "e-diante-de"],
  ["וְכִי־", "e-quando"],
  ["וְיָֽדְעוּ֙", "e-saberao"],
  ["וְיֶ֨תֶר", "e-resto"],
  ["וְחֶ֖רֶב", "e-espada"],
  ["וְזָהָ֖ב", "e-ouro"],
  ["וְהֵ֣מָּה", "e-eles"],
  ["וְהֵ֙מָּה֙", "e-eles"],
  ["וְהִנֵּ֛ה", "e-eis"],
  ["וְהִנֵּ֗ה", "e-eis"],
  ["וְה֖וּא", "e-ele"],
  ["וְאָנֹכִ֛י", "e-eu"],
  ["וְאָמַרְתָּ֨", "e-diras"],
  ["וְאָמַרְתָּ֖", "e-diras"],
  ["וְאָמַ֔ר", "e-disse"],
  ["וְאַתָּ֥ה", "e-tu"],
  ["וְאַתֶּ֣ם", "e-vos"],
  ["וְאַדְנֵיהֶ֖ם", "e-suas-bases"],
  ["וְאִֽם־", "e-se"],
  ["וְ֝נִפְלְאוֹתָ֗יו", "e-suas-maravilhas"],

  // --- ה (He - artigo definido e verbos) ---
  ["הוֹצֵ֥אתִי", "tirei"],
  ["הָרָעָ֖ה", "a-ma"],
  ["הָעֹלָ֖ה", "o-holocausto"],
  ["הָעָ֥ם", "o-povo"],
  ["הָע֔וֹר", "a-pele"],
  ["הָמָ֔ן", "Haman"],
  ["הָלְכ֣וּ", "foram"],
  ["הָאֹ֑הֶל", "a-tenda"],
  ["הָאֲנָשִׁ֗ים", "os-homens"],
  ["הָֽרָעָה֙", "a-ma"],
  ["הָֽרִאשׁ֔וֹן", "o-primeiro"],
  ["הָֽעַמִּ֔ים", "os-povos"],
  ["הָ֣עֵדָ֔ה", "a-congregacao"],
  ["הָ֣אֲרָצ֔וֹת", "as-terras"],

  // --- הַ (Ha - artigo definido) ---
  ["הַשַּׁ֙עַר֙", "o-portao"],
  ["הַשֶּׁ֙מֶשׁ֙", "o-sol"],
  ["הַנֶּ֥פֶשׁ", "a-alma"],
  ["הַנֶּ֖גַע", "a-praga"],
  ["הַנֶּ֔גֶב", "o-Neguev"],
  ["הַמִּשְׁחָ֔ה", "a-uncao"],
  ["הַמִּזְבֵּ֙חַ֙", "o-altar"],
  ["הַכֹּהֲנִים֙", "os-sacerdotes"],
  ["הַכֹּ֣ל", "o-tudo"],
  ["הַכֶּ֙סֶף֙", "a-prata"],
  ["הַכֶּ֔סֶף", "a-prata"],
  ["הַיֹּצְאִ֖ים", "os-que-saem"],
  ["הַיָּם֙", "o-mar"],
  ["הַיְרִיעָ֔ה", "a-cortina"],
  ["הַיְמָנִ֔ית", "a-direita"],
  ["הַהִיא֙", "aquela"],
  ["הַה֡וּא", "aquele"],
  ["הַדָּבָ֥ר", "a-palavra"],
  ["הַדָּבָ֔ר", "a-palavra"],
  ["הַגָּד֔וֹל", "o-grande"],
  ["הַגָּ֣ר", "o-estrangeiro"],
  ["הַגְּדוֹלָה֙", "a-grande"],
  ["הַבְּרִ֣ית", "a-alianca"],
  ["הַֽמַּ֫עֲל֥וֹת", "os-degraus"],
  ["הַ֣ר", "monte"],

  // --- הֶ / הֵ / הִ (He com outras vogais) ---
  ["הֶעָרִ֣ים", "as-cidades"],
  ["הֶעָנָ֖ן", "a-nuvem"],
  ["הֵכִ֣ין", "preparou"],
  ["הֵיכַ֣ל", "templo"],
  ["הֵ֛מָּה", "eles"],
  ["הֵ֑מָּה", "eles"],
  ["הִנָּבֵ֖א", "profetiza"],
  ["הִנֵּה֙", "eis"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Traducao AT - Freq5-9 Batch G (palavras 601-700) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Inicio: ${new Date().toLocaleString('pt-BR')}\n`);

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
      process.stdout.write(`\u2713 ${word} \u2192 ${translation} (${changes})\n`);
    } else {
      process.stdout.write(`\u00b7 ${word} \u2192 ${translation} (0)\n`);
    }
    success++;
  } catch (err) {
    process.stdout.write(`\u2717 ${word} \u2192 ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== AT Freq5-9 Batch G Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

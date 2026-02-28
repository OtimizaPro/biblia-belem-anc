#!/usr/bin/env node
/**
 * Freq5-9 Batch D (palavras 301-400)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte D)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5d-${Date.now()}.sql`);

const translations = [
  // === at-freq5-slice-d.json — 100 palavras (301-400) ===

  // --- Prefixo וְ (e-) ---
  ["וְיָצָא֙", "e-saiu"],
  ["וְיָצָ֥א", "e-saiu"],
  ["וְיִשְׂרָאֵ֖ל", "e-Israel"],
  ["וְטָמֵ֥א", "e-impuro"],
  ["וְהָיְתָ֣ה", "e-foi"],
  ["וְהֵם֙", "e-eles"],
  ["וְה֥וּא", "e-ele"],
  ["וְדֶ֖רֶךְ", "e-caminho"],
  ["וְגַ֨ם", "e-tambem"],
  ["וְאָ֣מַרְתָּ֔", "e-diras"],
  ["וְאַתָּ֖ה", "e-tu"],
  ["וְאַחַ֤ת", "e-uma"],
  ["וְאֵֽין־", "e-nao-ha"],
  ["וְאֵ֙לֶּה֙", "e-estes"],
  ["וְאֵ֖ין", "e-nao-ha"],
  ["וְאִ֕ישׁ", "e-homem"],
  ["וְֽ֠הָיָה", "e-foi"],

  // --- Prefixo הָ / הַ (o-/a-) ---
  ["הָרִאשׁ֗וֹן", "o-primeiro"],
  ["הָרִ֖ים", "as-montanhas"],
  ["הָעָ֨ם", "o-povo"],
  ["הָעִ֥יר", "a-cidade"],
  ["הָעִ֤יר", "a-cidade"],
  ["הָב֥וּ", "dai"],
  ["הָאִ֣ישׁ", "o-homem"],
  ["הָאִ֑ישׁ", "o-homem"],
  ["הָ֣רָעָ֔ה", "a-maldade"],
  ["הַשְּׁבִיעִ֖י", "o-setimo"],
  ["הַקֶּ֥רֶשׁ", "a-tabua"],
  ["הַפְּלִשְׁתִּ֖י", "o-filisteu"],
  ["הַסֹּפֵ֔ר", "o-escriba"],
  ["הַנֹּגֵ֥עַ", "o-que-toca"],
  ["הַנָּבִ֑יא", "o-profeta"],
  ["הַנְּבִיאִ֔ים", "os-profetas"],
  ["הַמֶּ֨לֶךְ", "o-rei"],
  ["הַמֶּ֡לֶךְ", "o-rei"],
  ["הַמִּשְׁכָּ֑ן", "o-tabernaculo"],
  ["הַכֹּהֲנִ֖ים", "os-sacerdotes"],
  ["הַיָּ֑ם", "o-mar"],
  ["הַיְלָדִים֙", "as-criancas"],
  ["הַזֹּ֛את", "esta"],
  ["הַזֹּ֗את", "esta"],
  ["הַזֶּֽה׃", "este"],
  ["הַזֶּ֜ה", "este"],
  ["הַדָּבָ֛ר", "a-palavra"],
  ["הַגּוֹיִ֗ם", "as-nacoes"],
  ["הַגְּב֜וּל", "a-fronteira"],
  ["הַבָּמ֖וֹת", "os-lugares-altos"],
  ["הַבַּ֖יִת", "a-casa"],
  ["הַ֭יּוֹם", "o-dia"],

  // --- הֵ / הִ / הֲ (outras formas) ---
  ["הֶחֱטִ֖יא", "fez-pecar"],
  ["הֶֽחָצֵר֙", "o-pateo"],
  ["הֵ֤מָּה", "eles"],
  ["הֵ֔ם", "eles"],
  ["הִשָּׁ֣מֶר", "guarda-te"],
  ["הֲל֛וֹא", "acaso-nao"],
  ["ה֭וּא", "ele"],
  ["ה֥וֹי", "ai"],

  // --- ד (dalet) ---
  ["דָּ֑עַת", "conhecimento"],
  ["דָּ֑ם", "sangue"],

  // --- ג (gimel) ---
  ["גּוֹיִם֙", "nacoes"],
  ["גִּלְעָ֑ד", "Gilead"],
  ["גָ֖ד", "Gad"],

  // --- בּ / בְּ (em-/no-/na-) ---
  ["בָּר֣וּךְ", "bendito"],
  ["בָּעֵ֣ת", "no-tempo"],
  ["בָּעִ֣יר", "na-cidade"],
  ["בָּמ֣וֹת", "lugares-altos"],
  ["בָּהֶ֖ם", "neles"],
  ["בָּאִים֙", "vindo"],
  ["בַּמִּלְחָמָ֔ה", "na-guerra"],
  ["בַּיהוָ֑ה", "em-yhwh"],
  ["בֵּינִ֣י", "entre-mim"],
  ["בִּירוּשָׁלָֽ͏ִם׃", "em-Jerusalem"],
  ["בִּ֖י", "em-mim"],
  ["בְּשַׂ֣ר", "na-carne"],
  ["בְּקוֹל֙", "na-voz"],
  ["בְּק֖וֹל", "na-voz"],
  ["בְּצֵ֥ל", "na-sombra"],
  ["בְּפִ֣י", "na-boca-de"],
  ["בְּעֵ֣ת", "no-tempo"],
  ["בְּלֹ֣א", "sem"],
  ["בְּךָ֖", "em-ti"],
  ["בְּי֥וֹם", "no-dia"],
  ["בְּטֶ֥רֶם", "antes-de"],
  ["בְּדֶ֥רֶךְ", "no-caminho"],
  ["בְּאֹ֣הֶל", "na-tenda"],
  ["בּ֖וֹ", "nele"],
  ["בָ֔ךְ", "em-ti"],
  ["בְנ֖וֹ", "seu-filho"],
  ["ב֑וֹ", "nele"],

  // --- א (alef) ---
  ["אוֹתָ֛ם", "eles"],
  ["אֹתָם֙", "eles"],
  ["אֹת֛וֹ", "ele"],
  ["אָנֹכִ֜י", "eu"],
  ["אָנֹכִ֖י", "eu"],
  ["אָחָ֜ז", "Acaz"],
  ["אָבוֹת֙", "pais"],
  ["אָבִ֔יו", "pai-dele"],
  ["אַתָּ֗ה", "tu"],
  ["אַתֶּ֔ם", "vos"],
  ["אַרְבָּעִ֥ים", "quarenta"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch D (palavras 301-400) ===`);
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

console.log(`\n=== Resultado Freq5-9 Batch D ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

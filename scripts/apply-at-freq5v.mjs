#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch V (palavras 2101-2200)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte V)
 * Palavras 2101-2200 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5v-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 2101-2200 (100 palavras) ===

  // --- בָּ (Bet com artigo / preposição "em") ---
  ["בָּהֶ֛ם", "neles"],
  ["בָּאָ֙רֶץ֙", "na-terra"],
  ["בָּאָ֑רֶץ", "na-terra"],
  ["בָּאֵ֣י", "nas-ilhas-de"],
  ["בָּאֵ֔שׁ", "no-fogo"],
  ["בָּאֵ֑שׁ", "no-fogo"],
  ["בָּ֣אתִי", "vim"],
  ["בָּ֗הּ", "nela"],
  ["בָּ֔ךְ", "em-ti"],
  ["בָּ֑ךְ", "em-ti"],

  // --- בַּ (Bet com artigo definido) ---
  ["בַּשָּׁנָה֙", "no-ano"],
  ["בַּשָּׁנָ֣ה", "no-ano"],
  ["בַּרְזֶל֙", "ferro"],
  ["בַּרְזֶ֑ל", "ferro"],
  ["בַּעֲוֺנ֣וֹ", "em-sua-iniquidade"],
  ["בַּעְשָׁ֔א", "Baasa"],
  ["בַּמָּקוֹם֙", "no-lugar"],
  ["בַּמִּדְבָּ֖ר", "no-deserto"],
  ["בַּמִּדְבָּ֔ר", "no-deserto"],
  ["בַּחֹ֥דֶשׁ", "no-mes"],
  ["בַּחֶ֥רֶב", "pela-espada"],
  ["בַּחֲמִשָּׁ֥ה", "no-quinto"],
  ["בַּגּוֹיִ֣ם", "entre-as-nacoes"],
  ["בַּבָּ֑יִת", "na-casa"],
  ["בַּֽת־", "filha-de"],
  ["בַּֽצָּהֳרָ֑יִם", "ao-meio-dia"],

  // --- בֵּ (Bet com tsere) ---
  ["בֵּיתֶ֑ךָ", "tua-casa"],
  ["בֵּאדַ֜יִן", "entao"],
  ["בֵּאדַ֙יִן֙", "entao"],
  ["בֵּֽין־", "entre"],

  // --- בִּ (Bet com hiriq) ---
  ["בִּשְׁנַת־", "no-ano-de"],
  ["בִּלְעָ֑ם", "Balaao"],
  ["בִּלְבָבֶ֑ךָ", "em-teu-coracao"],
  ["בִּגְדֵ֤י", "vestes-de"],

  // --- בְּ (Bet com shva) ---
  ["בְּתוּלַ֖ת", "virgem-de"],
  ["בְּתוֹרַ֥ת", "na-lei-de"],
  ["בְּתוֹכָ֔הּ", "em-seu-meio"],
  ["בְּת֣וֹךְ", "no-meio-de"],
  ["בְּשַׂ֥ר", "carne"],
  ["בְּשָׁל֑וֹם", "em-paz"],
  ["בְּרִית֙", "alianca"],
  ["בְּרִ֣ית", "alianca"],
  ["בְּעֵינָ֖יו", "em-seus-olhos"],
  ["בְּעֵינֶ֖יךָ", "em-teus-olhos"],
  ["בְּעֵ֥מֶק", "no-vale-de"],
  ["בְּנוֹ֙", "seu-filho"],
  ["בְּנ֑וֹ", "seu-filho"],
  ["בְּמוֹ־", "em"],
  ["בְּמַלְכ֣וּת", "no-reino-de"],
  ["בְּלֵ֥ב", "no-coracao-de"],
  ["בְּלֵ֣ב", "no-coracao-de"],
  ["בְּךָ֗", "em-ti"],
  ["בְּיָדֶ֔ךָ", "em-tua-mao"],
  ["בְּיָדִ֑י", "em-minha-mao"],
  ["בְּיִשְׂרָאֵ֖ל", "em-Israel"],
  ["בְּי֤וֹם", "no-dia"],
  ["בְּגָדָ֑יו", "suas-vestes"],
  ["בְּגֵ֣יא", "no-vale-de"],
  ["בְּבֵ֥ית", "na-casa-de"],
  ["בְּאַרְבָּעָ֥ה", "em-quatro"],
  ["בְּאֶ֥רֶץ", "na-terra-de"],
  ["בְּ֭לִבּוֹ", "em-seu-coracao"],

  // --- בּ (Bet sem prefixo) ---
  ["בּ֭וֹ", "nele"],
  ["בּ֛וֹ", "nele"],

  // --- בָ (Bet qamets, sem artigo) ---
  ["בָעִ֔יר", "na-cidade"],
  ["בָנָיו֙", "seus-filhos"],
  ["בָנָ֣יו", "seus-filhos"],
  ["בָכֶם֙", "em-vos"],
  ["בָבֶל֙", "Babel"],
  ["בָ֛הּ", "nela"],
  ["בָ֗הּ", "nela"],
  ["בָ֔הּ", "nela"],

  // --- בַ / בִ / בְ sem dagesh ---
  ["בַשֶּׁ֖מֶן", "no-oleo"],
  ["בִירוּשְׁלֶ֑ם", "em-Jerusalem"],
  ["בִ֣י", "em-mim"],
  ["בְמָלְכ֑וֹ", "em-seu-reinado"],
  ["בְלֶב־", "no-coracao-de"],

  // --- א (Alef) - com vav inicial (אוֹ/אוּ) ---
  ["אוּרִיָּ֣ה", "Urias"],
  ["אוּלַ֤י", "talvez"],
  ["אוֹתָ֗ם", "a-eles"],
  ["אוֹתָ֔ם", "a-eles"],
  ["אוֹתָ֑ם", "a-eles"],
  ["אוֹתִ֔י", "a-mim"],
  ["אוֹתְךָ֖", "a-ti"],
  ["אוֹיֵ֑ב", "inimigo"],
  ["אוֹדֶ֣ה", "louvarei"],
  ["אֽוֹי־", "ai-de"],

  // --- א (Alef) - com sinal de objeto direto ---
  ["אֹתָ֛הּ", "a-ela"],
  ["אֹתָ֗הּ", "a-ela"],
  ["אֹתָ֖הּ", "a-ela"],
  ["אֹתִ֛י", "a-mim"],

  // --- א (Alef) - verbos e formas diversas ---
  ["אֹמְרִ֗ים", "dizendo"],
  ["אֹמְרִ֔ים", "dizendo"],
  ["אֹיְבַ֣י", "meus-inimigos"],
  ["אֹיְבֵיכֶ֑ם", "vossos-inimigos"],

  // --- א (Alef) - nomes e outras formas ---
  ["אָסָא֙", "Asa"],
  ["אָנֹכִ֤י", "eu"],
  ["אָנֹכִ֛י", "eu"],
  ["אָמַ֙רְתִּי֙", "eu-disse"],
  ["אָמ֖וֹן", "Amom"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch V (palavras 2101-2200) ===`);
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

console.log(`\n=== AT Freq5-9 Batch V Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

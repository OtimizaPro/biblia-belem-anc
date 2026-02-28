#!/usr/bin/env node
/**
 * Freq5-9 Batch N (palavras 1301-1400)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (lote N)
 * 100 palavras do arquivo at-freq5-slice-n.json
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5n-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq 5-9, índices 1301-1400 (100 palavras) ===

  // --- ב (Bet) ---
  ["בּ֥וֹא", "vir"],
  ["בָנִ֔ים", "filhos"],
  ["בָא־", "veio"],
  ["בָ֖ם", "neles"],
  ["בָ֑ךְ", "em-ti"],
  ["בַשָּׁ֑מֶן", "no-oleo"],
  ["בַבֹּ֔קֶר", "na-manha"],
  ["בְךָ֔", "em-ti"],
  ["בְאֶֽרֶץ־", "em-terra-de"],

  // --- א (Aleph) - pronomes/partículas ---
  ["אוֹתָ֔ךְ", "a-ti"],
  ["אוֹיֵֽב׃", "inimigo"],
  ["אֹתִ֖י", "a-mim"],
  ["אֹת֜וֹ", "a-ele"],
  ["אֹת֗וֹ", "a-ele"],
  ["אֹת֑וֹ", "a-ele"],
  ["אֹ֗רֶךְ", "comprimento"],

  // --- א (Aleph) - verbos e nomes ---
  ["אָשִׁ֥יב", "farei-retornar"],
  ["אָסָ֜א", "Asa"],
  ["אָסָ֗א", "Asa"],
  ["אָמַ֗רְתִּי", "eu-disse"],
  ["אָכֵן֙", "certamente"],
  ["אָבִ֣יא", "trarei"],
  ["אָבִ֜יךָ", "teu-pai"],
  ["אָבִ֖יו", "seu-pai"],
  ["אָבִ֑יךָ", "teu-pai"],
  ["אָ֥ז", "entao"],
  ["אָ֔וֶן", "iniquidade"],
  ["אַתָּה־", "tu"],
  ["אַשּׁ֛וּר", "Assur"],
  ["אַפּ֔וֹ", "sua-ira"],
  ["אַחַ֤ת", "uma"],
  ["אַחֲרָ֔יו", "apos-ele"],
  ["אַהֲרֹ֧ן", "Aarao"],
  ["אֶתְהֶ֖ן", "a-elas"],
  ["אֶלְעָזָ֥ר", "Eleazar"],
  ["אֶ֣בֶן", "pedra"],
  ["אֵלָ֜יו", "a-ele"],
  ["אֵלַ֥י", "a-mim"],
  ["אֵלֵ֔ינוּ", "a-nos"],
  ["אֵ֔שׁ", "fogo"],
  ["אִתִּי֙", "comigo"],
  ["אִ֭יּוֹב", "Iyyov"],

  // --- א (Aleph) - formas com shva ---
  ["אֲ‍ֽנִי־", "eu"],
  ["אֲרָם֙", "Aram"],
  ["אֲנָשִׁ֣ים", "homens"],
  ["אֲמַצְיָ֙הוּ֙", "Amatsyahu"],
  ["אֲלֵיהֶ֖ם", "a-eles"],
  ["אֲלֵהֶ֜ם", "a-eles"],
  ["אֲבֹתָ֗יו", "seus-pais"],
  ["אֲבֹתֵ֔ינוּ", "nossos-pais"],
  ["אֲבָנִ֔ים", "pedras"],
  ["אֲבִימֶ֖לֶךְ", "Avimelekh"],
  ["אֲבִימֶ֑לֶךְ", "Avimelekh"],
  ["אֲבִיהֶ֑ם", "pai-deles"],
  ["אֲבִֽי־", "pai-de"],

  // --- א (Aleph) - Elohim ---
  ["אֱלֹהַ֔י", "meu-Elohim"],
  ["אֱלֹהֵיכֶ֔ם", "vosso-Elohim"],
  ["אֱלֹֽהֵיכֶ֗ם", "vosso-Elohim"],

  // --- א (Aleph) - aramaico ---
  ["אֱלָהָ֥א", "Elah"],
  ["אֱוִ֣יל", "Evil"],
  ["אֱדַ֙יִן֙", "entao"],
  ["אֱ֠דַיִן", "entao"],

  // --- ת (Tav) ---
  ["תוּכַ֖ל", "poderas"],
  ["תּוֹכַ֣חַת", "repreensao"],
  ["תֹּאמַר֙", "diras"],
  ["תֹּאכֵ֑ל", "comeras"],
  ["תָּשׁ֥וּב", "retornaras"],
  ["תַּחְתָּֽיו׃", "em-seu-lugar"],
  ["תַּאֲוַ֣ת", "desejo-de"],
  ["תַּ֖חַת", "debaixo-de"],
  ["תֵּבֵ֥ל", "mundo"],
  ["תֵּֽדְע֔וּ", "sabereis"],
  ["תִּשְׁמְעוּ֙", "ouvireis"],
  ["תִּקְוָ֑ה", "esperanca"],
  ["תִּירָא֙", "temeras"],
  ["תִּירָ֑אוּ", "temereis"],
  ["תִּֽהְיֶה֙", "seras"],
  ["תְּנוּפָ֖ה", "oferta-de-agitacao"],
  ["תָח֥וֹס", "pouparas"],
  ["תָב֥וֹא", "viras"],
  ["תַעֲשׂ֖וּ", "fareis"],
  ["תַֽחַת־", "debaixo-de"],
  ["תִנָּתֵן֙", "sera-dada"],
  ["תִהְיֶ֣ה", "sera"],
  ["תִֽהְיֶ֔ה", "sera"],

  // --- שׂ (Sin) ---
  ["שִׂיחִ֑י", "minha-meditacao"],
  ["שְׂפַ֣ת", "labio-de"],

  // --- שׁ (Shin) ---
  ["שֹׁמְעִ֖ים", "ouvintes"],
  ["שָׁנָ֗ה", "ano"],
  ["שָׁמֵ֑עוּ", "ouviram"],
  ["שָׁמְע֤וּ", "ouviram"],
  ["שָׁלוֹם֙", "paz"],
  ["שָׁלֵ֔ם", "Shalem"],
  ["שָׁא֛וּל", "Saul"],
  ["שָׁ֔מָּה", "para-la"],
  ["שָׁ֔וְא", "falsidade"],
  ["שַׁעֲרֵ֣י", "portoes-de"],
  ["שַׁדְרַ֥ךְ", "Shadrakh"],
  ["שַׁבְּתוֹתַ֖י", "meus-shabatot"],
  ["שַׁ֣עַר", "portao"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch N (palavras 1301-1400) ===`);
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
    if (jsonStart === -1) { success++; continue; }
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

console.log(`\n=== Resultado Freq5-9 Batch N ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

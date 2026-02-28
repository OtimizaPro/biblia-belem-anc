#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch W (palavras 2201-2296)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte W)
 * 96 palavras da lista at-freq5-slice-w.json
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5w-${Date.now()}.sql`);

const translations = [
  // === 96 palavras hebraicas freq 5-9 (slice W, índices 2201-2296) ===

  // --- אָ (Alef qamets) ---
  ["אָבֵ֣ל", "Abel"],
  ["אָבִיו֙", "seu-pai"],
  ["אָבִ֖י", "meu-pai"],
  ["אָבִ֔י", "meu-pai"],
  ["אָֽמַר־", "disse"],
  ["אָֽמְרוּ֙", "disseram"],
  ["אָֽמְר֔וּ", "disseram"],
  ["אָ֭נִי", "eu"],
  ["אָ֥וֶן", "iniquidade"],
  ["אָ֔נִי", "eu"],
  ["אָ֑ף", "tambem"],

  // --- אַ (Alef patach) ---
  ["אַתָּ֔ה", "tu"],
  ["אַתֶּ֨ם", "vos"],
  ["אַתֶּ֖ם", "vos"],
  ["אַתְּ־", "tu"],
  ["אַרְצוֹ֙", "sua-terra"],
  ["אַרְצָם֙", "terra-deles"],
  ["אַרְצָ֔ם", "terra-deles"],
  ["אַרְמְנ֥וֹת", "palacios"],
  ["אַרְבָּעִ֣ים", "quarenta"],
  ["אַרְבַּ֥עַת", "quatro-de"],
  ["אַפִּ֔י", "minha-ira"],
  ["אַפּ֖וֹ", "sua-ira"],
  ["אַמָּ֣ה", "covado"],
  ["אַלּ֥וּף", "chefe"],
  ["אַחַ֖ר", "apos"],
  ["אַחַ֔ת", "uma"],
  ["אַחֶ֙יךָ֙", "teus-irmaos"],
  ["אַחֲרֵיהֶ֑ם", "apos-eles"],
  ["אַחְאָ֣ב", "Acabe"],
  ["אַחְאָ֜ב", "Acabe"],
  ["אַהֲרֹ֨ן", "Aarao"],
  ["אַהֲרֹ֑ן", "Aarao"],
  ["אַגִּ֣יד", "declararei"],
  ["אַ֭שְׁרֵי", "bem-aventurancas-de"],
  ["אַ֣ף", "tambem"],
  ["אַ֗ךְ", "somente"],
  ["אַ֖תְּ", "tu"],

  // --- אֶ (Alef segol) ---
  ["אֶתֵּן֙", "darei"],
  ["אֶתְכֶ֤ם", "a-vos"],
  ["אֶרְאֶ֣ה", "verei"],
  ["אֶפְרַ֙יִם֙", "Efraim"],
  ["אֶפְרַ֗יִם", "Efraim"],
  ["אֶעֱשֶׂ֣ה", "farei"],
  ["אֶסְתֵּ֣ר", "Ester"],
  ["אֶלְעָזָ֔ר", "Eleazar"],
  ["אֶלְיָקִ֣ים", "Eliaquim"],
  ["אֶבְי֑וֹן", "pobre"],
  ["אֶֽרֶץ־", "terra-de"],

  // --- אֵ (Alef tsere) ---
  ["אֵלָ֣יו", "a-ele"],
  ["אֵלָ֛יו", "a-ele"],
  ["אֵלָ֖יו", "a-ele"],
  ["אֵלֶ֜יהָ", "a-ela"],
  ["אֵלֶ֗יהָ", "a-ela"],
  ["אֵלֶ֖יךָ", "a-ti"],
  ["אֵלִיָּ֙הוּ֙", "Elias"],
  ["אֵ֨ין", "nao-ha"],
  ["אֵ֥שׁ", "fogo"],
  ["אֵ֤שֶׁת", "mulher-de"],
  ["אֵ֣לִיָּ֔הוּ", "Elias"],
  ["אֵ֜שׁ", "fogo"],
  ["אֵ֖שׁ", "fogo"],

  // --- אִ (Alef hiriq) ---
  ["אִתָּ֑נוּ", "conosco"],
  ["אִירָ֑א", "temerei"],
  ["אִיּ֣וֹב", "Iyov"],
  ["אִוֶּֽלֶת׃", "insensatez"],

  // --- אֲ (Alef hataf patach) ---
  ["אֲרָי֔וֹת", "leoes"],
  ["אֲרָ֗ם", "Aram"],
  ["אֲנָשִׁ֗ים", "homens"],
  ["אֲנָשִׁ֔ים", "homens"],
  ["אֲנַ֙חְנוּ֙", "nos"],
  ["אֲנַ֖חְנוּ", "nos"],
  ["אֲלָפִים֙", "milhares"],
  ["אֲלָפִ֑ים", "milhares"],
  ["אֲלֵהֶ֖ם", "a-eles"],
  ["אֲחֵיהֶ֖ם", "irmaos-deles"],
  ["אֲחִיקָ֣ם", "Aquicam"],
  ["אֲדַבֵּ֥ר", "falarei"],
  ["אֲבוֹתֵיהֶ֑ם", "pais-deles"],
  ["אֲבֹתָ֑יו", "seus-pais"],
  ["אֲבֹתֵ֑ינוּ", "nossos-pais"],
  ["אֲבָנִ֣ים", "pedras"],
  ["אֲבִימֶ֔לֶךְ", "Abimeleque"],
  ["אֲבִיהֶ֖ם", "pai-deles"],

  // --- אֱ (Alef hataf segol) - Elohim e formas divinas ---
  ["אֱ‍ֽלֹהַ֗י", "meu-Eloah"],
  ["אֱלֹהָ֔יו", "Elohim-dele"],
  ["אֱלֹהָ֔י", "meu-Elohim"],
  ["אֱלֹהֵ֖ינוּ", "nosso-Elohim"],
  ["אֱלֹהֵ֖י", "Elohim-de"],
  ["אֱלֹֽהֵיכֶ֔ם", "Elohim-de-vos"],
  ["אֱלֹ֘הֵ֤י", "Elohim-de"],
  ["אֱד֗וֹם", "Edom"],
  ["אֱ֭מֶת", "verdade"],
  ["אֱ֭לוֹהַּ", "Eloah"],
  ["אֱ֝לֹהַ֗י", "meu-Eloah"],

  // --- א (Alef sem vogal plena) ---
  ["א֧וֹ", "ou"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch W (palavras 2201-2296) ===`);
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

console.log(`\n=== AT Freq5-9 Batch W Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

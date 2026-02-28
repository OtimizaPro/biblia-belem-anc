#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch H (palavras 701-800)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte H)
 * Palavras 701-800 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5h-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 701-800 (100 palavras) ===

  // --- ה (He) ---
  ["הִנֵּ֤ה", "eis"],
  ["הִנְנִי֙", "eis-me"],
  ["הִנְנִ֧י", "eis-me"],
  ["הִכָּ֤ה", "feriu"],
  ["הִ֗יא", "ela"],
  ["הֲמ֥וֹן", "multidao"],
  ["הֲלֽוֹא־", "acaso-nao"],
  ["הֲלֹֽא־", "acaso-nao"],

  // --- ד (Dalet) ---
  ["דַּמֶּ֔שֶׂק", "Damasco"],
  ["דִּבְרֵי־", "palavras-de"],
  ["דִּבְרֵ֧י", "palavras-de"],

  // --- ג (Gimel) ---
  ["גוֹיִ֔ם", "nacoes"],

  // --- ב (Bet) ---
  ["בֹּ֤הֶן", "polegar"],
  ["בָּשָׂ֑ר", "carne"],
  ["בָּר֔וּךְ", "bendito"],
  ["בָּנִ֔ים", "filhos"],
  ["בָּנִ֑ים", "filhos"],
  ["בָּלָק֙", "Balaque"],
  ["בָּכֶ֔ם", "em-vos"],
  ["בָּבֶ֜ל", "Bavel"],
  ["בָּבֶ֗ל", "Bavel"],
  ["בָּאָ֣ה", "veio"],
  ["בָּאִ֖ים", "vindo"],
  ["בָּ֖אוּ", "vieram"],
  ["בָּ֑נוּ", "em-nos"],
  ["בַּשָּׁנָ֑ה", "no-ano"],
  ["בַּמָּק֣וֹם", "no-lugar"],
  ["בַּמִּלְחָמָ֑ה", "na-guerra"],
  ["בַּמִּדְבָּר֙", "no-deserto"],
  ["בַּיהוָ֣ה", "em-yhwh"],
  ["בַּבֹּ֑קֶר", "na-manha"],
  ["בַּֽיהוָ֔ה", "em-yhwh"],
  ["בֵּאדַ֣יִן", "entao"],
  ["בִּירֽוּשָׁלָ֑͏ִם", "em-Jerusalem"],
  ["בִּימֵ֨י", "nos-dias-de"],
  ["בִּימֵ֥י", "nos-dias-de"],
  ["בִּבְנֵ֣י", "entre-os-filhos-de"],
  ["בִּֽיהוּדָ֔ה", "em-Yehuda"],
  ["בְּשָׂר֖וֹ", "sua-carne"],
  ["בְּרִ֖ית", "alianca"],
  ["בְּעֵינֶ֔יךָ", "em-teus-olhos"],
  ["בְּעֵ֥ת", "no-tempo"],
  ["בְּמִסְפָּרָ֖ם", "em-seu-numero"],
  ["בְּיַד֙", "na-mao-de"],
  ["בְּטֶ֣רֶם", "antes-de"],
  ["בְּאַחַ֣ד", "no-primeiro"],
  ["בְּאַחֲרִ֣ית", "no-fim-de"],
  ["בְּאֶ֤רֶץ", "na-terra-de"],
  ["בְּאֵ֣ין", "em-nao-haver"],
  ["בּ֣וֹ", "nele"],
  ["בְתוֹךְ־", "no-meio-de"],

  // --- א (Alef) ---
  ["אֹתָ֑הּ", "a-ela"],
  ["אֹת֤וֹ", "a-ele"],
  ["אָסָ֖א", "Asa"],
  ["אָחִיו֙", "seu-irmao"],
  ["אָבִ֖יךָ", "teu-pai"],
  ["אָֽנֹכִי֙", "eu"],
  ["אָ֑בֶן", "pedra"],
  ["אַתָּ֨ה", "tu"],
  ["אַרְצְךָ֔", "tua-terra"],
  ["אַנְשֵׁ֥י", "homens-de"],
  ["אַמָּ֑ה", "covado"],
  ["אַהֲרֹ֖ן", "Aarao"],
  ["אַדְמַ֥ת", "solo-de"],
  ["אַדְמַ֣ת", "solo-de"],
  ["אַבְשָׁל֖וֹם", "Avshalom"],
  ["אַ֤ךְ", "somente"],
  ["אֶתְכֶ֗ם", "a-vos"],
  ["אֵלָיו֙", "a-ele"],
  ["אֵלָ֗יו", "a-ele"],
  ["אֵילִ֣ם", "carneiros"],
  ["אִתִּ֑י", "comigo"],
  ["אִתּ֗וֹ", "com-ele"],
  ["אֳנִיּ֣וֹת", "navios"],
  ["אֲנִ֞י", "eu"],
  ["אֲלֵהֶ֔ם", "a-eles"],
  ["אֲבֽוֹתֵיכֶם֙", "vossos-pais"],
  ["אֲ֝נִ֗י", "eu"],
  ["אֱלֹהֵ֨י", "Elohim-de"],
  ["אֱלָהָ֣א", "Elaha"],
  ["אֱלָהָ֖א", "Elaha"],
  ["אֱלָ֣הּ", "Elah"],
  ["א֚וֹ", "ou"],

  // --- ת (Tav) ---
  ["תָּמִ֣ים", "integro"],
  ["תָּמִ֖יד", "continuamente"],
  ["תַּעֲשׂ֑וּ", "fareis"],
  ["תַּחְתָּ֔יו", "debaixo-dele"],
  ["תַּֽחַת־", "debaixo-de"],
  ["תֵּצֵ֣א", "saira"],
  ["תִּתֵּ֤ן", "daras"],
  ["תִּֽהְיֶ֣ה", "sera"],
  ["תַעֲשׂ֑וּ", "fareis"],

  // --- שׂ (Sin) ---
  ["שַֽׂר־", "principe-de"],
  ["שִׂפְתֵ֣י", "labios-de"],
  ["שְׂ֝פָתָ֗יו", "seus-labios"],

  // --- שׁ (Shin) ---
  ["שׁוֹמֵ֣ר", "guardiao"],
  ["שָׁקֵ֗ה", "Rabsaque"],
  ["שָׁל֥וֹם", "paz"],
  ["שָׁ֑מֶשׁ", "sol"],
  ["שַֽׁעַר־", "portao-de"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch H (palavras 701-800) ===`);
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

console.log(`\n=== AT Freq5-9 Batch H Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

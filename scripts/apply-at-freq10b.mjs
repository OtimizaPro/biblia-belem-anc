#!/usr/bin/env node
/**
 * Batch AT Translation - Freq10+ Batch B
 * Aplica traduções literais para palavras hebraicas freq 10 no AT (parte B)
 * Palavras 79-155 da lista de frequência 10
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq10b-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=10, índices 79-155 (77 palavras) ===

  // --- ע (Ayin) ---
  ["עָנֵ֤ה", "respondeu"],
  ["עָלֵ֙ינוּ֙", "sobre-nos"],
  ["עַמִּ֑ים", "povos"],
  ["עֵינַי֙", "meus-olhos"],
  ["עֲבָדֶ֣יךָ", "teus-servos"],

  // --- מ (Mem) ---
  ["מָאתַ֥יִם", "duzentos"],
  ["מַחֲלֻקְתּ֔וֹ", "sua-divisao"],
  ["מִרְמָֽה׃", "engano"],
  ["מִזְמ֗וֹר", "salmo"],

  // --- ל (Lamed) ---
  ["לָהֶ֥ם", "a-eles"],
  ["לָבָ֖ן", "Labao"],
  ["לֵאָ֔ה", "Lia"],
  ["לְפָנֶ֙יךָ֙", "diante-de-ti"],
  ["לְמִנְחָֽה׃", "para-oferta"],
  ["לְךָ֙", "a-ti"],

  // --- כ (Kaf) ---
  ["כֻּלָּ֣ם", "todos-eles"],
  ["כֻּלָּ֖ם", "todos-eles"],
  ["כֶּ֔סֶף", "prata"],
  ["כֵּ֞ן", "assim"],
  ["כֹ֨ה", "assim"],

  // --- י (Yod) ---
  ["יָמִ֤ים", "dias"],
  ["יָדֶ֑ךָ", "tua-mao"],
  ["יָדְךָ֖", "tua-mao"],
  ["יָב֣וֹא", "vira"],
  ["יָב֔וֹא", "vira"],
  ["יִרְמְיָ֗הוּ", "Jeremias"],
  ["יִהְיֶ֤ה", "sera"],
  ["יִהְי֥וּ", "serao"],

  // --- ח (Chet) ---
  ["חַסְדֶּ֑ךָ", "tua-benignidade"],

  // --- ז (Zayin) ---
  ["זֹ֖את", "esta"],

  // --- ו (Vav) - conjunctive forms ---
  ["וּצְדָקָ֖ה", "e-justica"],
  ["וַיָּבֹ֤אוּ", "e-vieram"],
  ["וַיִּקְחוּ֙", "e-tomaram"],
  ["וַיִּפְּל֥וּ", "e-cairam"],
  ["וַיִּֽחַר־", "e-acendeu-se"],
  ["וְשֵׁ֥שׁ", "e-linho"],
  ["וְעָשָׂ֤ה", "e-fez"],
  ["וְנָתַתָּ֤ה", "e-daras"],
  ["וְנָתַתִּ֨י", "e-darei"],
  ["וְאָמַרְתָּ֗", "e-diras"],

  // --- ה (He) ---
  ["הָרִים֙", "montes"],
  ["הָאֶחָ֑ת", "a-uma"],
  ["הַשַּׁבָּ֔ת", "o-shabat"],
  ["הַשְּׁלִישִׁ֑י", "o-terceiro"],
  ["הַצֹּ֖אן", "o-rebanho"],
  ["הַגּוֹיִ֥ם", "as-nacoes"],
  ["הַגְּבוּל֙", "a-fronteira"],
  ["הֵ֑נָּה", "para-ca"],
  ["ה֣וֹי", "ai"],

  // --- ד (Dalet) ---
  ["דִּבְרֵ֤י", "palavras-de"],

  // --- ג (Gimel) ---
  ["גּוֹיִ֖ם", "nacoes"],

  // --- ב (Bet) ---
  ["בָּנָ֖יו", "seus-filhos"],
  ["בָּהֶם֙", "neles"],
  ["בַּחֹ֣דֶשׁ", "no-mes"],
  ["בַּדֶּ֔רֶךְ", "no-caminho"],
  ["בַּגּוֹיִ֑ם", "entre-as-nacoes"],
  ["בְּלוּלָ֣ה", "misturada"],
  ["בְּגָדָ֛יו", "suas-vestes"],

  // --- א (Alef) ---
  ["אוֹתִי֙", "a-mim"],
  ["אֹתִ֔י", "a-mim"],
  ["אֹת֔וֹ", "a-ele"],
  ["אֹ֣רֶךְ", "comprimento"],
  ["אָבִ֑יו", "seu-pai"],
  ["אַשּׁוּר֙", "Assur"],
  ["אַפּ֑וֹ", "sua-ira"],
  ["אַחֲרֵ֨י", "apos"],
  ["אַחְאָב֙", "Acabe"],
  ["אַהֲרֹ֛ן", "Aarao"],
  ["אַ֭תָּה", "tu"],
  ["אֵ֤ת", "[OBJ]"],
  ["אֵ֣ת ׀", "[OBJ]"],
  ["אֲלָפִ֖ים", "milhares"],
  ["אֲלֵיהֶ֑ם", "a-eles"],
  ["אֲ֭נִי", "eu"],
  ["אֱמֶת֙", "verdade"],
  ["אֱלֹהָ֑יו", "Elohim-dele"],
  ["אֱלֹהֵיהֶ֑ם", "Elohim-deles"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq10+ Batch B (palavras 79-155) ===`);
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

console.log(`\n=== AT Freq10+ Batch B Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

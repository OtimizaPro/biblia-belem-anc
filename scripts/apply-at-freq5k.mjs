#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch K (palavras 1001-1100)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte K)
 * Palavras 1001-1100 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5k-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 1001-1100 (100 palavras) ===

  // --- ל (Lamed) ---
  ["לְמֶ֔לֶךְ", "para-rei"],
  ["לְמִשְׁפְּחֹתָ֔ם", "para-suas-familias"],
  ["לְכַפֵּ֖ר", "para-expiar"],
  ["לְךָ֛", "para-ti"],
  ["לְךָ֗", "para-ti"],
  ["לְיִשְׂרָאֵל֙", "para-Yisrael"],
  ["לְהַצִּ֥יל", "para-salvar"],
  ["לְדֹרֹ֣תֵיכֶ֔ם", "para-vossas-geracoes"],
  ["לְדָוִ֖ד", "para-David"],
  ["לְדָוִ֔יד", "para-David"],
  ["לְבָבִ֑י", "meu-coracao"],
  ["לְבָבְךָ֖", "teu-coracao"],
  ["לְבָב֑וֹ", "seu-coracao"],
  ["לְבַבְכֶ֔ם", "vosso-coracao"],
  ["לְבֵֽית־", "para-casa-de"],
  ["לְבִלְתִּ֖י", "para-nao"],
  ["לְאָסָ֖א", "para-Asa"],
  ["לְאָ֫סָ֥ף", "para-Asaf"],
  ["לְאַהֲרֹ֣ן", "para-Aarao"],
  ["ל֛וֹ", "a-ele"],

  // --- כ (Kaf) ---
  ["כֻּלָּֽם׃", "todos-eles"],
  ["כֹּ֣ה", "assim"],
  ["כֹּ֔חַ", "forca"],
  ["כָּֽסֶף׃", "prata"],
  ["כַּשְׂדִּ֑ים", "Kasdim"],
  ["כַּמִּשְׁפָּֽט׃", "como-o-juizo"],
  ["כַּיּ֥וֹם", "como-o-dia"],
  ["כַּאֲשֶׁר֙", "como-que"],
  ["כֶּ֤סֶף", "prata"],
  ["כֵּלָ֔יו", "seus-utensilios"],
  ["כֵּ֤ן ׀", "assim"],
  ["כֵּ֝֗ן", "assim"],
  ["כֵּ֚ן", "assim"],
  ["כִּשְׁמֹ֣עַ", "ao-ouvir"],
  ["כִּימֵ֥י", "como-dias-de"],
  ["כְּלִי־", "utensilio-de"],
  ["כְּכֹ֖ל", "como-tudo"],
  ["כְּאִ֣ישׁ", "como-homem"],
  ["כֵ֔ן", "assim"],
  ["כִשְׁמֹ֨עַ", "ao-ouvir"],

  // --- י (Yod) ---
  ["יוּכַ֥ל", "podera"],
  ["יוֹשֵׁב֙", "habitante"],
  ["יוֹשֵׁ֖ב", "habitante"],
  ["יוֹסֵ֤ף", "Yosef"],
  ["יוֹדֵ֣עַ", "conhecedor"],
  ["יוֹד֣וּ", "louvarao"],
  ["יוֹאָשׁ֙", "Yoash"],
  ["יֹאשִׁיָּ֣הוּ", "Yoshiyyahu"],
  ["יֹאשִׁיָּ֖הוּ", "Yoshiyyahu"],
  ["יֹאמַ֖ר", "dira"],
  ["יֹ֣שְׁבֵי", "habitantes-de"],
  ["יָשִׂ֥ים", "pora"],
  ["יָשְׁב֥וּ", "habitaram"],
  ["יָשׁ֖וּב", "retornara"],
  ["יָרָבְעָ֑ם", "Yarav'am"],
  ["יָרְד֥וּ", "desceram"],
  ["יָק֣וּם", "levantara"],
  ["יָצָ֣א", "saiu"],
  ["יָמִים֙", "dias"],
  ["יָמִ֗ים", "dias"],
  ["יָמ֑וּת", "morrera"],
  ["יָדוֹ֙", "sua-mao"],
  ["יָדַ֗עְתִּי", "eu-soube"],
  ["יָד֑וֹ", "sua-mao"],
  ["יָ֨הּ ׀", "Yah"],
  ["יֵצֵ֣א", "saira"],
  ["יֵצֵ֔א", "saira"],
  ["יֵעָשֶׂ֣ה", "sera-feito"],
  ["יִשַׁ֔י", "Yishai"],
  ["יִהְיֶה־", "sera"],
  ["יְמִ֥ין", "direita"],
  ["יְכַבֵּ֧ס", "lavara"],
  ["יְהוֹנָתָ֣ן", "Yehonatan"],
  ["יְהוֹיָקִ֣ים", "Yehoyaqim"],
  ["יְהוֹיָדָ֣ע", "Yehoyada"],
  ["יְדַבֵּ֣ר", "falara"],

  // --- ט (Tet) ---
  ["טוֹב־", "bom"],

  // --- ח (Het) ---
  ["חָֽטְאוּ־", "pecaram"],
  ["חָ֑רֶב", "espada"],
  ["חִזְקִיָּ֙הוּ֙", "Hizqiyyahu"],
  ["חֲסַר־", "falto-de"],
  ["חֲמ֖וֹר", "jumento"],

  // --- ז (Zayin) ---
  ["זֹ֛את", "esta"],
  ["זַרְעֶ֑ךָ", "tua-semente"],
  ["זֶ֤ה", "este"],
  ["זֶ֗ה", "este"],
  ["זִקְנֵ֤י", "anciaos-de"],
  ["ז֥וּ", "esta"],

  // --- ו (Vav) ---
  ["וּשְׂעִ֥יר", "e-Seir"],
  ["וּרְאֵה֙", "e-ve"],
  ["וּמִנְחָתָ֣ם", "e-sua-oferta"],
  ["וּמִבְּנֵ֖י", "e-dos-filhos-de"],
  ["וּמִֽי־", "e-quem"],
  ["וּלְמַטֵּ֥ה", "e-para-tribo-de"],
  ["וּלְכֹ֖ל", "e-para-todo"],
  ["וּלְכָל־", "e-para-todo"],
  ["וּדְבַר־", "e-palavra-de"],
  ["וּבָקָ֖ר", "e-gado"],
  ["וּבַל־", "e-nao"],
  ["וּבֵ֣ין", "e-entre"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch K (palavras 1001-1100) ===`);
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

console.log(`\n=== AT Freq5-9 Batch K Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

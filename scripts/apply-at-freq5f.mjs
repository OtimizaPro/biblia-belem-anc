#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch F (palavras 501-600)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte F)
 * Palavras 501-600 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5f-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 501-600 (100 palavras) ===

  // --- מ (Mem) ---
  ["מֵאֵ֛ת", "de-junto-de"],
  ["מִתּ֣וֹךְ", "do-meio-de"],
  ["מִשָּׁ֥ם", "de-la"],
  ["מִשָּׁ֑ם", "de-la"],
  ["מִשְׁפָּ֥ט", "juizo"],
  ["מִשְׁמֶ֣רֶת", "guarda"],
  ["מִמֶּ֔נָּה", "dela"],
  ["מִמֶּ֑נָּה", "dela"],
  ["מִמֶּ֑נִּי", "de-mim"],
  ["מִמִּצְרַ֙יִם֙", "do-Egito"],
  ["מִיַּ֥ד", "da-mao-de"],
  ["מִזֶּ֣רַע", "da-semente-de"],
  ["מִבֶּ֛ן", "de-filho-de"],
  ["מִבֵּ֣ית", "da-casa-de"],
  ["מִ֖י", "quem"],
  ["מְתֵ֣י", "homens-de"],
  ["מְשָׁל֖וֹ", "seu-proverbio"],
  ["מְק֣וֹר", "fonte"],
  ["מְנַשֶּׁה֙", "Manasses"],

  // --- ל (Lamed) ---
  ["לּוֹ֙", "a-ele"],
  ["לָּ֑נוּ", "a-nos"],
  ["לָּ֑ךְ", "a-ti"],
  ["לָלֶ֖כֶת", "para-andar"],
  ["לָהֶ֗ם", "a-eles"],
  ["לָ֥הּ", "a-ela"],
  ["לָ֣נוּ", "a-nos"],
  ["לָ֖נוּ", "a-nos"],
  ["לָ֖הּ", "a-ela"],
  ["לַצָּבָ֔א", "para-o-exercito"],
  ["לַיהוָ֗ה", "a-yhwh"],
  ["לַֽיהוָ֗ה", "a-yhwh"],
  ["לִקְרַ֣את", "ao-encontro-de"],
  ["לִבְנֵ֨י", "para-os-filhos-de"],
  ["לִבְנ֣וֹת", "para-edificar"],
  ["לִ֭בִּי", "meu-coracao"],
  ["לִ֤י", "a-mim"],
  ["לְשָׁא֔וּל", "a-Saul"],
  ["לְעוֹלָ֔ם", "para-sempre"],
  ["לְעֻמַּ֖ת", "defronte-de"],
  ["לְמַטֵּ֥ה", "para-a-tribo-de"],
  ["לְמִן־", "desde"],
  ["לְיַעֲקֹ֔ב", "a-Jacó"],
  ["לְדֹ֣ר", "para-a-geracao"],
  ["לְדָוִ֨ד ׀", "a-Davi"],
  ["לְבֵית־", "para-a-casa-de"],
  ["לְאֵ֣ל", "a-El"],
  ["לְ֝מַ֗עַן", "por-causa-de"],
  ["ל֜וֹ", "a-ele"],

  // --- כ (Kaf) ---
  ["כֹּ֖ה", "assim"],
  ["כֶּ֤תֶף", "ombro"],
  ["כִּכַּר־", "talento-de"],
  ["כְּתוּבִ֔ים", "escritos"],
  ["כְּלֵ֖י", "utensilios-de"],
  ["כְּכָל־", "conforme-tudo-de"],
  ["כֹ֥ה", "assim"],
  ["כֹ֣ה ׀", "assim"],
  ["כֹ֣ה", "assim"],

  // --- י (Yod) ---
  ["יוּכַ֣ל", "podera"],
  ["יוֹסֵ֗ף", "José"],
  ["יוֹאָ֖שׁ", "Joás"],
  ["יֹשְׁבֵ֖י", "habitantes-de"],
  ["יָשִׁ֣יב", "fara-voltar"],
  ["יָמוּת֙", "morrera"],
  ["יָמִ֣ים", "dias"],
  ["יָדָיו֙", "suas-maos"],
  ["יָדֶ֣יךָ", "tuas-maos"],
  ["יָ֔מָּה", "para-o-mar"],
  ["יָ֑חַד", "juntamente"],
  ["יַ֛עַן", "porque"],
  ["יֵה֛וּא", "Jeú"],
  ["יִרְמְיָ֥הוּ", "Jeremias"],
  ["יִרְמְיָ֣הוּ", "Jeremias"],
  ["יִרְמְיָ֑הוּ", "Jeremias"],
  ["יִהְי֤וּ", "serao"],
  ["יִֽהְיוּ־", "serao"],
  ["יְדֵיהֶ֖ם", "maos-deles"],

  // --- ט (Tet) ---
  ["טוֹבָ֑ה", "boa"],
  ["טוֹבִ֑ים", "bons"],
  ["טָה֖וֹר", "puro"],
  ["טְעֵ֔ם", "decreto"],

  // --- ח (Chet) ---
  ["חָכָ֣ם", "sabio"],
  ["חָכָ֑ם", "sabio"],
  ["חַטָּ֖את", "pecado"],
  ["חַטָּ֑את", "pecado"],
  ["חֶ֙רֶב֙", "espada"],
  ["חֵיל֔וֹ", "seu-exercito"],
  ["חִזְקִיָּ֑הוּ", "Ezequias"],
  ["חֲמָתִי֙", "minha-furia"],
  ["חֲמַת־", "Hamate"],

  // --- ז (Zayin) ---
  ["זֹאת֙", "esta"],
  ["זָהָ֗ב", "ouro"],
  ["זִקְנֵ֣י", "anciaos-de"],
  ["זִבְחֵ֣י", "sacrificios-de"],

  // --- ו (Vav) - formas conjuntivas ---
  ["וּשְׁנַ֥יִם", "e-dois"],
  ["וּרְא֔וּ", "e-vede"],
  ["וּפִ֥י", "e-boca-de"],
  ["וּפְנֵ֥י", "e-face-de"],
  ["וּמִמַּטֵּ֣ה", "e-da-tribo-de"],
  ["וּבָ֤א", "e-vira"],
  ["וּבָ֣אוּ", "e-virao"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch F (palavras 501-600) ===`);
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

console.log(`\n=== AT Freq5-9 Batch F Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

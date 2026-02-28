#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch R (palavras 1701-1800)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte R)
 * 100 palavras da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5r-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 1701-1800 (100 palavras) ===

  // --- ל (Lamed) ---
  ["ל֞וֹ", "a-ele"],

  // --- כ (Kaf) ---
  ["כֻּלֹּ֖ה", "toda-ela"],
  ["כֹּהֲנֵ֣י", "sacerdotes-de"],
  ["כָּ֔כָה", "assim"],
  ["כַּאֲשֶׁר֩", "como-que"],
  ["כַּֽאֲשֶׁר֙", "como-que"],
  ["כֶּ֖סֶף", "prata"],
  ["כֵּלָ֑יו", "seus-utensilios"],
  ["כִּסֵּ֣א", "trono"],
  ["כִּ֣י ׀", "porque"],
  ["כְּצֹ֣אן", "como-rebanho"],
  ["כְּפִ֣י", "conforme-boca-de"],
  ["כְּלִ֣י", "utensilio-de"],
  ["כְּכֹ֛ל", "conforme-tudo"],
  ["כְּכַלּ֣וֹת", "ao-terminar"],
  ["כְּבוֹד־", "gloria-de"],
  ["כְּאֵ֣שׁ", "como-fogo"],
  ["כֵ֖ן", "assim"],
  ["כְרָמִ֔ים", "vinhas"],

  // --- י (Yod) - nomes próprios ---
  ["יוֹנָ֔ה", "Jonas"],
  ["יוֹמָ֖ם", "de-dia"],
  ["יוֹמָ֑ם", "de-dia"],
  ["יוֹאָ֣שׁ", "Joas"],

  // --- י (Yod) - verbos e substantivos ---
  ["יֹשְׁבִ֣ים", "habitantes"],
  ["יֹאמְר֥וּ", "dirao"],
  ["יֹאכַ֥ל", "comera"],
  ["יֹאכֵ֑ל", "comera"],
  ["יֹאבֵ֑דוּ", "perecerao"],
  ["יָשׁוּב֙", "retornara"],
  ["יָרָבְעָ֤ם", "Jeroboao"],
  ["יָרַ֖ד", "desceu"],
  ["יָצְא֤וּ", "sairam"],
  ["יָלָ֑דָה", "deu-a-luz"],
  ["יָדָ֔עוּ", "conheceram"],
  ["יָדָ֑יו", "suas-maos"],
  ["יָדְע֖וּ", "conheceram"],
  ["יָבֹ֣אוּ", "virao"],
  ["יָבֹ֣א", "vira"],
  ["יָבֹ֖א", "vira"],
  ["יָב֨וֹא", "vira"],
  ["יָֽלְדָה־", "deu-a-luz"],
  ["יָ֝דַ֗עְתִּי", "conheci"],
  ["יָ֑הּ", "Yah"],
  ["יַעֲשֶׂ֖ה", "fara"],
  ["יַעֲלֶ֖ה", "subira"],
  ["יַחְדָּֽו׃", "juntamente"],
  ["יַ֤עַן", "por-causa-de"],
  ["יַ֖עַר", "floresta"],
  ["יַ֖יִן", "vinho"],
  ["יֶהְגֶּ֣ה", "meditara"],
  ["יֶ֣תֶר", "resto"],
  ["יֵשׁ־", "ha"],
  ["יֵצֵֽא׃", "saira"],
  ["יֵלֵ֖ךְ", "ira"],
  ["יֵלְכ֖וּ", "irao"],
  ["יֵה֣וּא", "Jeu"],
  ["יֵבֹ֣שׁוּ", "envergonhar-se-ao"],
  ["יֵ֤שׁ", "ha"],
  ["יִתֵּ֧ן", "dara"],
  ["יִשָּׂ֣א", "levantara"],
  ["יִשְׂרָאֵ֣ל ׀", "Israel"],
  ["יִשַׁי֙", "Ishai"],
  ["יִשְׁמָעֵ֣אל", "Ishmael"],
  ["יִקַּ֣ח", "tomara"],
  ["יִפְתַּח־", "Jefta"],
  ["יִפְקֹ֣ד", "visitara"],
  ["יִמְצָ֑א", "achara"],
  ["יִטְמָ֑א", "sera-impuro"],
  ["יִהְיֶ֣ה", "sera"],
  ["יִֽהְיֶ֔ה", "sera"],
  ["יִֽהְי֑וּ", "serao"],
  ["יְשַׁלֵּ֔ם", "pagara"],
  ["יְרוּשָׁלִַ֙ם֙", "Jerusalem"],
  ["יְרוּשָׁלַ֛͏ִם", "Jerusalem"],
  ["יְמֵ֥י", "dias-de"],
  ["יְמֵ֣י", "dias-de"],
  ["יְחִזְקִיָּ֣הוּ", "Ezequias"],
  ["יְחִזְקִיָּ֙הוּ֙", "Ezequias"],
  ["יְהוֹשָׁפָ֣ט", "Josafa"],
  ["יְהוֹיָדָ֨ע", "Joiada"],
  ["יְהוָֽה־", "yhwh"],
  ["יְהוָ֨ה ׀", "yhwh"],
  ["יְהֽוֹשָׁפָט֙", "Josafa"],
  ["יְהִי־", "seja"],
  ["יְה֣וֹנָתָ֔ן", "Jonatas"],
  ["יְדַעְתֶּ֔ם", "conhecestes"],
  ["יְדַבֶּר־", "falara"],
  ["יְדַבֵּ֥ר", "falara"],
  ["יְדַבֵּ֔רוּ", "falarao"],
  ["יְדַבֵּ֑רוּ", "falarao"],
  ["יְדֵ֣י", "maos-de"],
  ["יְ֠הוּדָה", "Yehudah"],

  // --- ח (Chet) ---
  ["חֻקֹּתַי֙", "meus-estatutos"],
  ["חֹתֵ֣ן", "sogro-de"],
  ["חָרָ֣ה", "acendeu-se"],
  ["חָפֵ֣ץ", "agrada-se"],
  ["חָלָב֙", "leite"],
  ["חָלָ֖ל", "traspassado"],
  ["חָכְמַ֣ת", "sabedoria-de"],
  ["חָ֭כָם", "sabio"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch R (palavras 1701-1800) ===`);
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

console.log(`\n=== AT Freq5-9 Batch R Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

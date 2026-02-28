#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch U (palavras 2001-2100)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte U)
 * Palavras 2001-2100 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5u-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 2001-2100 (100 palavras) ===

  // --- ה com artigo הַ (He com artigo definido) ---
  ["הַשְּׁבִיעִ֜י", "o-setimo"],
  ["הַקֹּ֔דֶשׁ", "o-santo"],
  ["הַקָּדִ֑ים", "o-vento-oriental"],
  ["הַקִּ֔יר", "a-parede"],
  ["הַצֹּפֶה֙", "o-vigia"],
  ["הַצֹּ֤אן", "o-rebanho"],
  ["הַצָּפ֑וֹן", "o-norte"],
  ["הַצִּפֹּ֣ר", "o-passaro"],
  ["הַפֶּ֖סַח", "a-pessach"],
  ["הַפְּלִשְׁתִּ֔י", "o-filisteu"],
  ["הַסֵּ֔פֶר", "o-livro"],
  ["הַנָּבִיא֙", "o-profeta"],
  ["הַנָּ֑גַע", "a-praga"],
  ["הַנֶּ֔גַע", "a-praga"],
  ["הַנִּמְצָ֣א", "o-encontrado"],
  ["הַמָּק֤וֹם", "o-lugar"],
  ["הַמָּק֗וֹם", "o-lugar"],
  ["הַמַּלְאָ֖ךְ", "o-mensageiro"],
  ["הַלְוִיִּ֣ם", "os-levitas"],
  ["הַכֹּהֲנִ֤ים", "os-sacerdotes"],
  ["הַכֹּ֖ל", "o-todo"],
  ["הַיָּמִ֗ים", "os-dias"],
  ["הַיָּ֣ם", "o-mar"],
  ["הַיָּ֗ם", "o-mar"],
  ["הַיַּרְדֵּ֖ן", "o-Yarden"],
  ["הַיְּהוּדִ֗ים", "os-yehudim"],
  ["הַיּ֔וֹם", "o-dia"],
  ["הַיְרִיעָ֣ה", "a-cortina"],
  ["הַזֹּ֜את", "a-esta"],
  ["הַזָּהָ֖ב", "o-ouro"],
  ["הַהִ֖וא", "a-aquela"],
  ["הַדֹּבֵ֥ר", "o-que-fala"],
  ["הַדָּ֖ם", "o-sangue"],
  ["הַדֶּ֔רֶךְ", "o-caminho"],
  ["הַדְּבָרִ֤ים", "as-palavras"],
  ["הַגּוֹרָ֖ל", "a-sorte"],
  ["הַגִּ֣ידוּ", "declarai"],
  ["הַגְּב֔וּל", "o-limite"],
  ["הַבַּדִּים֙", "as-varas"],
  ["הַבַּדִּ֖ים", "as-varas"],
  ["הַבַּ֧יִת", "a-casa"],
  ["הַבַּ֗יִת", "a-casa"],
  ["הַבְּכ֖וֹר", "o-primogenito"],
  ["הַבְּהֵמָ֑ה", "o-animal"],
  ["הַאֲזִ֥ינָה", "da-ouvidos"],

  // --- ה sem artigo (formas diversas) ---
  ["הֶהָרִ֗ים", "os-montes"],
  ["הֶהָרִ֔ים", "os-montes"],
  ["הֶֽעָרִים֙", "as-cidades"],
  ["הֶ֣עָרִ֔ים", "as-cidades"],
  ["הֵ֭מָּה", "eles"],
  ["הִנֹּ֔ם", "Hinom"],
  ["הִנְנִי־", "eis-me"],
  ["הִנְנִי֩", "eis-me"],
  ["הִ֛יא", "ela"],
  ["הֲקֵ֖ים", "levantou"],
  ["הֲמ֣וֹן", "multidao"],
  ["הֲלוֹא֙", "acaso-nao"],
  ["ה֝֗וּא", "ele"],
  ["ה֜וּא", "ele"],
  ["ה֛וֹי", "ai"],
  ["ה֚וֹי", "ai"],

  // --- ד (Dalet) ---
  ["דוֹדִי֙", "meu-amado"],
  ["דָּנִיֵּ֣אל", "Daniel"],
  ["דָּוִ֗יד", "David"],
  ["דָּוִ֔יד", "David"],
  ["דָּוִ֑יד", "David"],
  ["דָּ֣ם", "sangue"],
  ["דָּ֔ן", "Dan"],
  ["דָּ֑ל", "pobre"],
  ["דַּלִּ֔ים", "pobres"],
  ["דַּלִּ֑ים", "pobres"],
  ["דִּבְּר֥וּ", "falaram"],
  ["דִּבְרֵ֖י", "palavras-de"],
  ["דִּ֣ין", "juizo"],
  ["דְּבָרִ֣ים", "palavras"],
  ["דָ֑עַת", "conhecimento"],
  ["דִבַּ֔רְתִּי", "falei"],

  // --- ג (Gimel) ---
  ["גוֹיִ֖ם", "nacoes"],
  ["גָּדְל֣וּ", "cresceram"],
  ["גָּ֔ד", "Gad"],
  ["גִּלְעָ֛ד", "Gilad"],
  ["גִּבְעָ֣ה", "Giva"],
  ["גְּדַלְיָ֙הוּ֙", "Gedalyahu"],
  ["גְּב֖וּל", "limite"],
  ["ג֭וֹיִם", "nacoes"],

  // --- ב (Bet) ---
  ["בוֹ֙", "nele"],
  ["בָּשָׂ֔ר", "carne"],
  ["בָּרֲכ֣וּ", "bendizei"],
  ["בָּר֖וּךְ", "bendito"],
  ["בָּעִ֑יר", "na-cidade"],
  ["בָּע֔וֹר", "Beor"],
  ["בָּנָ֛יו", "seus-filhos"],
  ["בָּנָ֔יו", "seus-filhos"],
  ["בָּלָ֑ק", "Balaque"],
  ["בָּכֶ֗ם", "em-vos"],
  ["בָּכֶ֖ם", "em-vos"],
  ["בָּחוּר֙", "jovem"],
  ["בָּהָ֣ר", "no-monte"],
  ["בָּהָ֖ר", "no-monte"],
  ["בָּהֶֽם׃", "neles"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch U (palavras 2001-2100) ===`);
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

console.log(`\n=== AT Freq5-9 Batch U Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

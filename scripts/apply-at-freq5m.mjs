#!/usr/bin/env node
/**
 * Freq5-9 Batch M (palavras 1201-1300)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte M)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5m-${Date.now()}.sql`);

const translations = [
  // === Palavras 1201-1300 de at-freq5-slice-m.json (100 palavras) ===
  ["הַרְבֵּ֖ה", "muito"],
  ["הַפָּ֔ר", "o-novilho"],
  ["הַפָּ֑סַח", "a-Pascoa"],
  ["הַנֶּ֙גַע֙", "a-praga"],
  ["הַמַּמְלָכָה֙", "o-reino"],
  ["הַמֶּלֶךְ֮", "o-rei"],
  ["הַמִּלְחָמָ֖ה", "a-guerra"],
  ["הַמִּזְבֵּ֖חַ", "o-altar"],
  ["הַמִּזְבֵּ֔חַ", "o-altar"],
  ["הַמְּלָאכָה֙", "a-obra"],
  ["הַלָּ֑יְלָה", "a-noite"],
  ["הַלֶּ֖חֶם", "o-pao"],
  ["הַלְוִיִּ֜ם", "os-levitas"],
  ["הַכֹּהֲנִ֛ים", "os-sacerdotes"],
  ["הַכֹּ֔ל", "o-tudo"],
  ["הַכֶּ֗סֶף", "a-prata"],
  ["הַיְּהוּדִים֙", "os-judeus"],
  ["הַטּ֔וֹב", "o-bom"],
  ["הַחִוִּ֖י", "o-heveu"],
  ["הַחֲמ֔וֹר", "o-jumento"],
  ["הַה֛וּא", "aquele"],
  ["הַדֹּבֵ֣ר", "o-que-fala"],
  ["הַדָּם֙", "o-sangue"],
  ["הַדָּבָר֙", "a-palavra"],
  ["הַדָּבָ֞ר", "a-palavra"],
  ["הַדָּבָ֖ר", "a-palavra"],
  ["הַדְּבָרִים֙", "as-palavras"],
  ["הַדְּבָרִ֔ים", "as-palavras"],
  ["הַגִּֽידָה־", "declara"],
  ["הַבַּ֥יִת", "a-casa"],
  ["הַבַּ֔יִת", "a-casa"],
  ["הַ֥לְלוּ", "louvai"],
  ["הַ֠מֶּלֶךְ", "o-rei"],
  ["הַ֝יּ֗וֹם", "o-dia"],
  ["הֶֽעָנָן֙", "a-nuvem"],
  ["הֶֽהָרִים֙", "os-montes"],
  ["הֵ֣ן", "eis"],
  ["הֵ֣מָּה", "eles"],
  ["הִנָּבֵ֣א", "profetiza"],
  ["הִכָּ֣ה", "feriu"],
  ["הִיא֙", "ela"],
  ["הֲל֖וֹא", "acaso-nao"],
  ["הֱיִיתֶ֖ם", "fostes"],
  ["ה֤וּא", "ele"],
  ["דִּבַּ֖רְתִּי", "falei"],
  ["דִּבְרֵ֨י", "palavras-de"],
  ["דִּ֛י", "que"],
  ["דְּרָכָ֔יו", "seus-caminhos"],
  ["גּוֹיִ֥ם", "nacoes"],
  ["גֻּבְרַיָּ֣א", "homens"],
  ["גֹּאֵ֣ל", "resgatador"],
  ["גְּדַלְיָ֖הוּ", "Gedalias"],
  ["גְדוֹלָ֖ה", "grande"],
  ["בּוֹ֙", "nele"],
  ["בָּתֵּ֣י", "casas-de"],
  ["בָּתִּ֖ים", "casas"],
  ["בָּעִ֗יר", "na-cidade"],
  ["בָּע֑וֹר", "Beor"],
  ["בָּנָיו֙", "seus-filhos"],
  ["בָּלָ֖ק", "Balaque"],
  ["בָּלָ֔ק", "Balaque"],
  ["בָּכֶ֑ם", "em-vos"],
  ["בָּח֖וּר", "jovem"],
  ["בָּאָ֗רֶץ", "na-terra"],
  ["בָּאֵ֖שׁ", "no-fogo"],
  ["בָּֽהּ׃", "nela"],
  ["בָּֽאַמָּ֔ה", "no-covado"],
  ["בָּ֥אוּ", "vieram"],
  ["בָּ֑הּ", "nela"],
  ["בַּשָּׂדֶ֔ה", "no-campo"],
  ["בַּמָּק֖וֹם", "no-lugar"],
  ["בַּחֲצַ֣ר", "no-atrio-de"],
  ["בַּדָּ֑רֶךְ", "no-caminho"],
  ["בַּבֹּ֗קֶר", "na-manha"],
  ["בֶּעָשׂ֣וֹר", "no-decimo"],
  ["בֶּחָ֑רֶב", "pela-espada"],
  ["בִּשְׁנַ֨ת", "no-ano-de"],
  ["בִּנְיָמִ֗ן", "Benjamim"],
  ["בִּלְעָ֗ם", "Balaao"],
  ["בִּלְעָ֖ם", "Balaao"],
  ["בִּינָֽה׃", "entendimento"],
  ["בִּגְדֵ֣י", "vestes-de"],
  ["בְּתוֹכָ֑ם", "no-meio-deles"],
  ["בְּשֹׁמְר֑וֹן", "em-Samaria"],
  ["בְּרֹ֥אשׁ", "no-topo"],
  ["בְּפִ֖י", "na-minha-boca"],
  ["בְּעַד־", "por"],
  ["בְּעַֽרְבֹ֣ת", "nas-planicies-de"],
  ["בְּעֵינַ֔י", "nos-meus-olhos"],
  ["בְּעֵינֵ֥י", "nos-olhos-de"],
  ["בְּנַ֣חַל", "no-ribeiro-de"],
  ["בְּנֵיהֶם֙", "seus-filhos"],
  ["בְּמָק֣וֹם", "no-lugar-de"],
  ["בְּלוּלָ֥ה", "misturada"],
  ["בְּיָד֗וֹ", "em-sua-mao"],
  ["בְּיָ֣ד", "na-mao-de"],
  ["בְּיַ֛ד", "na-mao-de"],
  ["בְּיִשְׂרָאֵ֔ל", "em-Israel"],
  ["בְּגָדָ֖יו", "suas-vestes"],
  ["בְּאָזְנֵ֣י", "nos-ouvidos-de"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch M (palavras 1201-1300) ===`);
console.log(`Total de traduções: ${translations.length}\n`);

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
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    console.error(`  ✗ ${word} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== Freq5-9 Batch M Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

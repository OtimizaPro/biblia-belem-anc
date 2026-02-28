#!/usr/bin/env node
/**
 * Freq5-9 Batch J (palavras 901-1000)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte J)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5j-${Date.now()}.sql`);

const translations = [
  // === Palavras 901-1000 de at-freq5-slice-j.json (100 palavras) ===
  ["נְבוּכַדְנֶצַּ֣ר", "Nabucodonosor"],
  ["מוֹעֵ֗ד", "tempo-determinado"],
  ["מוֹאָ֗ב", "Moabe"],
  ["מָרְדֳּכַ֔י", "Mordecai"],
  ["מָד֑וֹן", "contenda"],
  ["מָֽוֶת׃", "morte"],
  ["מָ֚ה", "que"],
  ["מַשְׂכִּ֥יל", "maskil"],
  ["מַעֲכָ֖ה", "Maaca"],
  ["מַלְכָּ֣א", "rei"],
  ["מַדּ֗וּעַ", "por-que"],
  ["מֶ֥ה", "que"],
  ["מֵבִ֤יא", "trazendo"],
  ["מֵאוֹת֙", "centenas"],
  ["מֵאֵ֨ת", "de-junto-de"],
  ["מֵאֵ֣ין", "de-sem"],
  ["מִתּ֥וֹךְ", "de-meio-de"],
  ["מִשָּׁ֔ם", "de-la"],
  ["מִצָּפ֖וֹן", "de-norte"],
  ["מִפּ֔וֹ", "daqui"],
  ["מִסְפָּ֑ר", "numero"],
  ["מִמָּ֑עַל", "de-cima"],
  ["מִמִּצְרָ֑יִם", "de-Egito"],
  ["מִמִּזְרַח־", "de-oriente-de"],
  ["מִיכָ֔יְהוּ", "Micaias"],
  ["מִיכָ֔ה", "Mica"],
  ["מִיַּד־", "de-mao-de"],
  ["מִח֖וּץ", "de-fora"],
  ["מִזְבֵּ֙חַ֙", "altar"],
  ["מִדַּרְכּ֣וֹ", "de-seu-caminho"],
  ["מִגְרָשֶׁ֑הָ", "seus-campos-de-pastagem"],
  ["מִבֵּ֣ין", "de-entre"],
  ["מִבְּלִי־", "de-sem-"],
  ["מִבְּלִ֣י", "de-sem"],
  ["מִֽקְרָא־", "convocacao-de"],
  ["מְצַוְּךָ֖", "ordenando-te"],
  ["מְנַשֶּׁ֔ה", "Manasses"],
  ["מְלָכִ֣ים", "reis"],
  ["מְלָכִ֖ים", "reis"],
  ["מ֥וֹת", "morrer"],
  ["לְּךָ֖", "a-ti"],
  ["לּ֖וֹ", "a-ele"],
  ["לָתֵת֙", "para-dar"],
  ["לָתֵ֥ת", "para-dar"],
  ["לָשֵׂ֖את", "para-carregar"],
  ["לָשׂ֥וּם", "para-colocar"],
  ["לָמ֑וּת", "para-morrer"],
  ["לָלֶ֣כֶת", "para-andar"],
  ["לָכֵן֙", "portanto"],
  ["לָכֵ֖ן", "portanto"],
  ["לָג֣וּר", "para-peregrinar"],
  ["לָבָן֙", "Laba"],
  ["לָבָ֑ן", "Laba"],
  ["לָבֶ֖טַח", "em-seguranca"],
  ["לָבֶ֑טַח", "em-seguranca"],
  ["לָאָ֥רֶץ", "para-a-terra"],
  ["לָאָ֔רֶץ", "para-a-terra"],
  ["לָאֵילִ֧ם", "para-os-carneiros"],
  ["לָ֣מָּה", "por-que"],
  ["לָ֜נוּ", "a-nos"],
  ["לָ֛נוּ", "a-nos"],
  ["לָ֛מָּה", "por-que"],
  ["לָ֔נוּ", "a-nos"],
  ["לָ֔הּ", "a-ela"],
  ["לַעֲשׂ֤וֹת", "para-fazer"],
  ["לַעֲשׂ֗וֹת", "para-fazer"],
  ["לַעֲשׂ֖וֹת", "para-fazer"],
  ["לַעֲשׂ֕וֹת", "para-fazer"],
  ["לַמִּלְחָמָ֔ה", "para-a-guerra"],
  ["לַמִּלְחָמָ֑ה", "para-a-guerra"],
  ["לַמְנַצֵּ֬חַ ׀", "para-o-regente"],
  ["לַלְוִיִּ֑ם", "para-os-levitas"],
  ["לַחֹ֑דֶשׁ", "para-o-mes"],
  ["לַבַּ֖יִת", "para-a-casa"],
  ["לַאֲשֶׁ֥ר", "para-que"],
  ["לַֽיהוָ֑ה", "a-yhwh"],
  ["לַ֭מְנַצֵּחַ", "para-o-regente"],
  ["לַ֠פָּרִים", "para-os-novilhos"],
  ["לַ֝יהוָ֗ה", "a-yhwh"],
  ["לֶ֤חֶם", "pao"],
  ["לֵאמֹר֒", "para-dizer"],
  ["לֵאלֹהִ֣ים", "a-Elohim"],
  ["לֵאלֹהִ֑ים", "a-Elohim"],
  ["לִשְׁמֹ֙עַ֙", "para-ouvir"],
  ["לִפְנֵי֩", "diante-de"],
  ["לִהְי֣וֹת", "para-ser"],
  ["לִבָּ֖ם", "seu-coracao"],
  ["לִבָּ֔ם", "seu-coracao"],
  ["לִבּ֑וֹ", "seu-coracao"],
  ["לִבְנֵ֖י", "para-filhos-de"],
  ["לְשָׁרֵ֣ת", "para-servir"],
  ["לְשַׁמָּ֣ה", "para-desolacao"],
  ["לְפָנָ֑יו", "diante-dele"],
  ["לְפָנֶ֣יךָ", "diante-de-ti"],
  ["לְפָנֶ֗יךָ", "diante-de-ti"],
  ["לְפָנֶ֑יךָ", "diante-de-ti"],
  ["לְפִ֣י", "conforme"],
  ["לְעָ֔ם", "para-povo"],
  ["לְע֥וֹף", "para-ave-de"],
  ["לְמַ֤עַן", "a-fim-de"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch J (palavras 901-1000) ===`);
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
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    console.error(`  ✗ ${word} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Freq5-9 Batch J Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

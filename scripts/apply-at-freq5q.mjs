#!/usr/bin/env node
/**
 * Freq5-9 Batch Q (palavras 1601-1700)
 * Aplica traducoes literais para palavras hebraicas freq 5-9 no AT (parte Q)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5q-${Date.now()}.sql`);

const translations = [
  // === Palavras 1601-1700 de at-freq5-slice-q.json (100 palavras) ===
  ["מִסְפָּ֔ר", "numero"],
  ["מִנִּ֣י", "de-mim"],
  ["מִנְחָה֙", "oferta-de-cereais"],
  ["מִמֶּ֔נּוּ", "de-nos"],
  ["מִמֶּ֑ךָּ", "de-ti"],
  ["מִמִּצְרַ֖יִם", "de-Egito"],
  ["מִלְחָמָ֛ה", "guerra"],
  ["מִלְחָמָ֑ה", "guerra"],
  ["מִכֶּ֖ם", "de-vos"],
  ["מִיכָ֑ה", "Mica"],
  ["מִיָּדִ֖י", "de-minha-mao"],
  ["מִיָּדִ֑י", "de-minha-mao"],
  ["מִיָּדְךָ֥", "de-tua-mao"],
  ["מִי֙", "quem"],
  ["מִזִּקְנֵ֣י", "dos-ancioes-de"],
  ["מִזְמֽוֹר׃", "salmo"],
  ["מִזְבַּ֥ח", "altar"],
  ["מִדְיָ֔ן", "Midian"],
  ["מִדְבַּר־", "deserto-de"],
  ["מִבֶּ֣טֶן", "de-ventre"],
  ["מִבֵּ֖ית", "de-casa-de"],
  ["מִבְּנֵ֨י", "dos-filhos-de"],
  ["מִ֣י", "quem"],
  ["מִ֝מֶּ֗נִּי", "de-mim"],
  ["מְרָרִ֑י", "Merari"],
  ["מְר֣וֹם", "altura"],
  ["מְנַחֵ֖ם", "Menahem"],
  ["מְזַבְּחִ֥ים", "sacrificando"],
  ["מְדַבֵּ֣ר", "falando"],
  ["מְא֑וּמָה", "coisa-alguma"],
  ["לוּלֵ֣י", "se-nao-fosse"],
  ["לוֹ֮", "a-ele"],
  ["לוֹ֩", "a-ele"],
  ["לָּךְ֙", "a-ti"],
  ["לִּ֑י", "a-mim"],
  ["לְּךָ֥", "a-ti"],
  ["לָתֵ֤ת", "para-dar"],
  ["לָשׂ֤וּם", "para-colocar"],
  ["לָכֶ֤ם", "a-vos"],
  ["לָכֵ֕ן", "portanto"],
  ["לָבָ֜ן", "Labao"],
  ["לָב֥וֹא", "para-vir"],
  ["לָאַ֖יִל", "para-o-carneiro"],
  ["לָאִישׁ֙", "para-o-homem"],
  ["לָֽמָּה־", "por-que-"],
  ["לָ֥תֶת", "para-dar"],
  ["לָ֣ךְ", "a-ti"],
  ["לָ֑הּ", "a-ela"],
  ["לַצַּדִּ֑יק", "para-o-justo"],
  ["לַעֲשׂ֛וֹת", "para-fazer"],
  ["לַעֲל֖וֹת", "para-subir"],
  ["לַמֶּ֣לֶךְ", "para-o-rei"],
  ["לַמִּלְחָמָֽה׃", "para-a-guerra"],
  ["לַמִּלְחָמָ֖ה", "para-a-guerra"],
  ["לַמְנַצֵּ֣חַ", "para-o-regente"],
  ["לַיהוָ֔ה", "a-yhwh"],
  ["לַחֹ֥דֶשׁ", "para-o-mes"],
  ["לַֽמַּחֲנֶ֔ה", "para-o-acampamento"],
  ["לַֽמַּחֲנֶ֑ה", "para-o-acampamento"],
  ["לֶךְ־", "vai-"],
  ["לֶ֜חֶם", "pao"],
  ["לֵאמֹ֖ר", "para-dizer"],
  ["לֵ֛ךְ", "vai"],
  ["לִקְרָאת֑וֹ", "ao-encontro-dele"],
  ["לִפְקֻדֵיהֶ֑ם", "conforme-seus-registros"],
  ["לִפְנֵיהֶ֑ם", "diante-deles"],
  ["לִפְנֵֽי־", "diante-de-"],
  ["לִפְנֵ֧י", "diante-de"],
  ["לִכְסִ֣יל", "para-o-insensato"],
  ["לִירוּשָׁלִַ֙ם֙", "para-Jerusalem"],
  ["לִהְי֥וֹת", "para-ser"],
  ["לִבִּ֗י", "meu-coracao"],
  ["לִבִּ֖י", "meu-coracao"],
  ["לִֽהְי֥וֹת", "para-ser"],
  ["לִ֛י", "a-mim"],
  ["לְפָנָ֗יו", "diante-dele"],
  ["לְפָנַ֔י", "diante-de-mim"],
  ["לְפֶ֣תַח", "para-a-entrada-de"],
  ["לְנָשִׁ֑ים", "para-mulheres"],
  ["לְמַלְכ֖וּת", "para-reinado"],
  ["לְכַפֵּ֣ר", "para-expiar"],
  ["לְיַעֲקֹ֖ב", "para-Jacobe"],
  ["לְהַגִּ֣יד", "para-declarar"],
  ["לְהִלָּחֵ֣ם", "para-guerrear"],
  ["לְדַבֵּ֖ר", "para-falar"],
  ["לְד֥וֹר", "para-geracao"],
  ["לְבָבֶ֔ךָ", "teu-coracao"],
  ["לְבָ֔ד", "sozinho"],
  ["לְבָ֑ד", "sozinho"],
  ["לְבַדִּ֔י", "somente-eu"],
  ["לְבַבְכֶם֙", "vosso-coracao"],
  ["לְאַהֲבָ֞ה", "para-amar"],
  ["לְאַבְרָהָ֥ם", "para-Abraao"],
  ["לְאֶפְרַ֔יִם", "para-Efraim"],
  ["לְאֶסְתֵּ֣ר", "para-Ester"],
  ["לְאֵ֣ין", "para-nao-haver"],
  ["לְאִ֣ישׁ", "para-homem"],
  ["לְא֣וֹר", "para-luz"],
  ["לְ֭מַעַן", "a-fim-de"],
  ["ל֭וֹ", "a-ele"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch Q (palavras 1601-1700) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`In\u00EDcio: ${new Date().toLocaleString('pt-BR')}\n`);

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
    console.error(`  \u2717 ${word} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== Freq5-9 Batch Q Completo ===`);
console.log(`\u2713 ${success} | \u2717 ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

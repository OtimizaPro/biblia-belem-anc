#!/usr/bin/env node
/**
 * Freq5-9 Batch S (palavras 1801-1900)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte S)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5s-${Date.now()}.sql`);

const translations = [
  // === Palavras 1801-1900 de at-freq5-slice-s.json (100 palavras) ===

  // --- ח palavras ---
  ["חַרְבִּ֖י", "minha-espada"],
  ["חַסְדּ֑וֹ", "sua-benignidade"],
  ["חַיֵּֽנִי׃", "vivifica-me"],
  ["חַיֵּ֣י", "vida-de"],
  ["חַיִּ֖ים", "vida"],
  ["חַטָּ֔את", "pecado"],
  ["חַ֭סְדְּךָ", "tua-benignidade"],
  ["חֶרְפַּ֣ת", "oprobrio-de"],
  ["חֶ֥רֶב", "espada"],
  ["חֶ֔רֶשׂ", "silencio"],
  ["חֵ֭מָה", "ira"],
  ["חֵ֣ן", "graca"],
  ["חֲלָלִ֖ים", "traspassados"],
  ["חֲל֣וֹם", "sonho"],
  ["חֲכַם־", "sabio"],

  // --- ז palavras ---
  ["זָהָב֙", "ouro"],
  ["זָבַ֤ת", "que-mana"],
  ["זֶֽה־", "este"],
  ["זֶ֤ה ׀", "este"],
  ["זֶ֛ה", "este"],
  ["זִמָּ֑ה", "plano-perverso"],

  // --- וׁשׂ/וׁשׁ palavras ---
  ["וּשְׂעִיר־", "e-bode-de"],
  ["וּשְׁנַ֙יִם֙", "e-dois"],
  ["וּשְׁלֹשָׁ֣ה", "e-tres"],

  // --- וׁר/וׁפ/וׁנ palavras ---
  ["וּרְאוּ֙", "e-vede"],
  ["וּפְאַת־", "e-lado-de"],
  ["וּנְתַתָּ֖ם", "e-da-los-as"],
  ["וּנְשֵׁיהֶ֖ם", "e-suas-mulheres"],

  // --- וׁמ palavras ---
  ["וּמָלְא֥וּ", "e-encheram"],
  ["וּמֶ֣לֶךְ", "e-rei"],
  ["וּמִשְׁפָּ֑ט", "e-juizo"],
  ["וּמִנְחָתָ֖הּ", "e-sua-oferta-de-cereais"],

  // --- וׁב palavras ---
  ["וּבָעֵ֣ת", "e-no-tempo-de"],
  ["וּבָנָ֑יו", "e-seus-filhos"],
  ["וּבַיּוֹם֙", "e-no-dia"],
  ["וּבַדָּ֑בֶר", "e-na-pestilencia"],
  ["וּבְנֵיהֶ֖ם", "e-seus-filhos"],
  ["וּבְיַ֛ד", "e-na-mao-de"],
  ["וּבְי֣וֹם", "e-no-dia-de"],

  // --- וָ palavras ---
  ["וָעֶֽד׃", "e-perpetuidade"],
  ["וָחֵ֙צִי֙", "e-metade"],
  ["וָוֵ֧י", "e-ganchos-de"],
  ["וָאֹמְרָ֣ה", "e-eu-disse"],
  ["וָאֵ֖רֶא", "e-eu-vi"],

  // --- וַתּ palavras ---
  ["וַתֵּ֖לֶךְ", "e-ela-foi"],
  ["וַתְּהִ֖י", "e-ela-foi"],

  // --- וַעֲ palavras ---
  ["וַעֲשֶׂ֥רֶת", "e-dez-de"],

  // --- וַיֹּ palavras ---
  ["וַיֹּאמְר֗וּ", "e-disseram"],
  ["וַיֹּ֣אמְרוּ", "e-disseram"],

  // --- וַיָּ palavras ---
  ["וַיָּשָׁב֩", "e-retornou"],
  ["וַיָּבֹ֧אוּ", "e-vieram"],
  ["וַיָּבֹ֛אוּ", "e-vieram"],
  ["וַיָּ֨שֶׂם", "e-colocou"],
  ["וַיָּ֨שָׁב", "e-retornou"],
  ["וַיָּ֤שֶׂם", "e-colocou"],

  // --- וַיַּ palavras ---
  ["וַיַּעֲמֹ֥ד", "e-ficou-de-pe"],
  ["וַיַּעֲל֣וּ", "e-subiram"],
  ["וַיַּכּוּ֙", "e-feriram"],
  ["וַיַּחֲנ֣וּ", "e-acamparam"],
  ["וַיַּגִּ֣דוּ", "e-anunciaram"],
  ["וַיַּ֥עַל", "e-subiu"],
  ["וַיַּ֜עַן", "e-respondeu"],
  ["וַיַּ֙עַל֙", "e-subiu"],
  ["וַיַּ֖עַל", "e-subiu"],

  // --- וַיֵּ palavras ---
  ["וַיֵּצֵא֙", "e-saiu"],
  ["וַיֵּ֥שֶׁב", "e-habitou"],
  ["וַיֵּ֥בְךְּ", "e-chorou"],

  // --- וַיִּ palavras ---
  ["וַיִּתֶּן־", "e-deu"],
  ["וַיִּשְׁפֹּ֥ט", "e-julgou"],
  ["וַיִּשְׁלַח֙", "e-enviou"],
  ["וַיִּשְׁלַ֥ח", "e-enviou"],
  ["וַיִּשְׁכַּ֨ב", "e-deitou-se"],
  ["וַיִּשְׁאַ֤ל", "e-perguntou"],
  ["וַיִּרְא֣וּ", "e-viram"],
  ["וַיִּקָּבְצ֣וּ", "e-reuniram-se"],
  ["וַיִּקְח֣וּ", "e-tomaram"],
  ["וַיִּקְח֞וּ", "e-tomaram"],
  ["וַיִּקְבֹּ֤ץ", "e-reuniu"],
  ["וַיִּפֹּ֤ל", "e-caiu"],
  ["וַיִּמְלֹ֣ךְ", "e-reinou"],
  ["וַיִּהְי֥וּ", "e-foram"],
  ["וַיִּהְי֣וּ", "e-foram"],

  // --- וַיְ palavras ---
  ["וַיְמִיתֵ֑הוּ", "e-matou-o"],
  ["וַיְהִ֣י ׀", "e-foi"],
  ["וַיְדַבֵּ֧ר", "e-falou"],

  // --- וַח/וַא palavras ---
  ["וַחֲצַ֥ר", "e-atrio-de"],
  ["וַחֲמֵ֣שׁ", "e-cinco"],
  ["וַאֲנִ֗י", "e-eu"],
  ["וַאֲנִ֕י", "e-eu"],
  ["וַ֝אֲנִ֗י", "e-eu"],

  // --- וִ palavras ---
  ["וִירוּשָׁלַ֖͏ִם", "e-Jerusalem"],
  ["וִֽיהוּדָ֔ה", "e-Yehuda"],

  // --- וְ palavras ---
  ["וְתַ֖חַת", "e-debaixo-de"],
  ["וְשַׂמְתִּ֣י", "e-colocarei"],
  ["וְשָׁב֙", "e-retornou"],
  ["וְשָׁא֗וּל", "e-Saul"],
  ["וְשֵׁ֥ם", "e-nome-de"],
  ["וְשֵׁ֤ם", "e-nome-de"],
  ["וְשֵׁ֣ם", "e-nome-de"],
  ["וְשִׁלַּחְתִּי־", "e-enviarei"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch S (palavras 1801-1900) ===`);
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

console.log(`\n=== Freq5-9 Batch S Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

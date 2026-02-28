#!/usr/bin/env node
/**
 * Freq5-9 Batch I (palavras 801-900)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte I)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5i-${Date.now()}.sql`);

const translations = [
  // === Palavras 801-900 de at-freq5-slice-i.json (100 palavras) ===

  // --- שׁ- palavras ---
  ["שֶׁ֣קֶר", "mentira"],
  ["שֵׁ֖בֶט", "vara"],
  ["שִׁשָּׁ֣ה", "seis"],
  ["שִׁטִּ֔ים", "acácias"],
  ["שִׁבְעַ֤ת", "sete-de"],
  ["שִׁבְעִ֥ים", "setenta"],
  ["שְׁנַת־", "ano-de"],
  ["שְׁמָמָ֖ה", "desolação"],
  ["שְׁב֣וּת", "cativeiro"],
  ["שׁ֣וּבוּ", "retornai"],

  // --- ר- palavras ---
  ["רָחֵ֔ל", "Raquel"],
  ["רָאִ֥יתִי", "vi"],
  ["רָאִ֤יתִי", "vi"],
  ["רַגְלָ֑י", "meus-pés"],
  ["רֶ֣גֶל", "pé"],
  ["רֵעֶ֑ךָ", "teu-próximo"],

  // --- ק- palavras ---
  ["קֹ֖דֶשׁ", "santidade"],
  ["קַ֚ח", "toma"],
  ["קֳבֵ֣ל", "porque"],
  ["קְנֵ֣ה", "adquire"],
  ["קְטֹ֣רֶת", "incenso"],
  ["ק֥וּמִי", "levanta-te"],

  // --- צ- palavras ---
  ["צֶ֖דֶק", "justiça"],
  ["צִוָּ֤ה", "ordenou"],
  ["צְדָקָ֣ה", "justiça"],
  ["צְא֣וּ", "saí"],
  ["צ֥וּר", "rocha"],

  // --- פ- palavras ---
  ["פָּנֶ֖יךָ", "tua-face"],
  ["פַּרְעֹ֤ה", "Faraó"],
  ["פַּרְעֹ֖ה", "Faraó"],
  ["פְּנֵיהֶ֑ם", "face-deles"],
  ["פִי־", "boca-de"],

  // --- ע- palavras (ayin) ---
  ["עוֹלָ֖ם", "eternidade"],
  ["עֹלָה֙", "holocausto"],
  ["עָשִׂ֣יתִי", "fiz"],
  ["עָשִׂ֔יתִי", "fiz"],
  ["עָשִׂ֑יתִי", "fiz"],
  ["עָשׂ֥וּ", "fizeram"],
  ["עָרֵ֧י", "cidades-de"],
  ["עָצֵ֣ל", "preguiçoso"],
  ["עָנִ֥י", "pobre"],
  ["עָנִ֖י", "pobre"],
  ["עָלָ֑יִךְ", "sobre-ti"],
  ["עָלֶ֜יךָ", "sobre-ti"],
  ["עָלֶ֛יהָ", "sobre-ela"],
  ["עָ֭לַי", "sobre-mim"],
  ["עָ֣שׂוּ", "fizeram"],
  ["עַתָּ֤ה", "agora"],
  ["עַתָּ֗ה", "agora"],
  ["עַתָּ֕ה", "agora"],
  ["עַשְׁתֵּ֣י", "onze"],
  ["עַצְמ֣וֹת", "ossos"],
  ["עַמֶּ֑ךָ", "teu-povo"],
  ["עַמִּ֖ים", "povos"],
  ["עַמּ֗וֹן", "Amon"],
  ["עַמּ֖וֹ", "seu-povo"],
  ["עַוְלָ֑ה", "injustiça"],
  ["עַבְדִּ֔י", "meu-servo"],
  ["עַבְדִּ֑י", "meu-servo"],
  ["עַ֭תָּה", "agora"],
  ["עֶשְׂרֵ֥ה", "dez"],
  ["עֶשְׂרִ֧ים", "vinte"],
  ["עֵשָׂ֛ו", "Esaú"],
  ["עֵינַ֖יִם", "olhos"],
  ["עֵ֭ינַי", "meus-olhos"],
  ["עִמּוֹ֙", "com-ele"],
  ["עִמִּ֖י", "comigo"],
  ["עִיר־", "cidade-de"],
  ["עֲצַ֥ת", "conselho-de"],
  ["עֲמָלֵ֑ק", "Amaleque"],
  ["עֲלֵיהֶ֜ם", "sobre-eles"],
  ["עֲלֵיהֶ֔ם", "sobre-eles"],
  ["עֲוֺנָ֑ם", "iniquidade-deles"],
  ["עֲבָדֶ֔יךָ", "teus-servos"],
  ["עֲבָדִ֣ים", "servos"],
  ["עֲבָדִ֖ים", "servos"],
  ["ע֣וֹד", "ainda"],

  // --- ס- palavras ---
  ["סָבִ֣יב", "ao-redor"],
  ["סָ֑רוּ", "desviaram-se"],
  ["סֵ֤פֶר", "livro"],
  ["סֵ֖פֶר", "livro"],
  ["סְבִיב֖וֹת", "arredores"],

  // --- נ- palavras ---
  ["נֹ֣כַח", "diante-de"],
  ["נֹ֖כַח", "diante-de"],
  ["נָשָׂ֣א", "levantou"],
  ["נָשִׁ֣ים", "mulheres"],
  ["נָקִ֔י", "inocente"],
  ["נָא֩", "por-favor"],
  ["נַפְשֽׁוֹ׃", "sua-alma"],
  ["נַפְשֶׁ֔ךָ", "tua-alma"],
  ["נַ֭פְשׁוֹ", "sua-alma"],
  ["נַ֫פְשִׁ֥י", "minha-alma"],
  ["נַ֝פְשִׁ֗י", "minha-alma"],
  ["נֶ֥גַע", "praga"],
  ["נֶ֣גַע", "praga"],
  ["נִתַּן־", "foi-dado"],
  ["נִיחֹ֙חַ֙", "agradável"],
  ["נְחֹֽשֶׁת׃", "bronze"],
  ["נְחֹ֔שֶׁת", "bronze"],
  ["נְבוּכַדְרֶאצַּ֥ר", "Nabucodonosor"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Freq5-9 Batch I (palavras 801-900) ===`);
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

console.log(`\n=== Resultado Freq5-9 Batch I ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

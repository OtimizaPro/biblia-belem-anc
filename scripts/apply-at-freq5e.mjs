#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch E (palavras 401-500)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte E)
 * 100 palavras do slice E da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5e-${Date.now()}.sql`);

const translations = [
  // --- א (Alef) ---
  ["אַמָּֽה׃", "covado"],
  ["אַמּ֔וֹת", "covados"],
  ["אַמּ֑וֹת", "covados"],
  ["אַחֵ֑ר", "outro"],
  ["אַבְשָׁל֑וֹם", "Absalao"],
  ["אַבְנֵ֣י", "pedras-de"],
  ["אֵלַ֣י", "a-mim"],
  ["אֵלֶ֥יךָ", "a-ti"],
  ["אֵלֶ֛יךָ", "a-ti"],
  ["אֵ֧ת", "[OBJ]"],
  ["אֵ֚לֶּה", "estes"],
  ["אֵ֖לֶּה", "estes"],
  ["אִתִּ֖י", "comigo"],
  ["אֲשִׁיבֶ֑נּוּ", "devolverei-o"],
  ["אֲנָשִׁ֖ים", "homens"],
  ["אֲנִ֜י", "eu"],
  ["אֲנִ֛י", "eu"],
  ["אֲדַבֵּ֑ר", "falarei"],
  ["אֱמֶ֑ת", "verdade"],
  ["אֱלֹהֶ֙יךָ֙", "teu-Elohim"],
  ["אֱלֹהֵיהֶ֖ם", "Elohim-deles"],

  // --- ת (Tav) ---
  ["תִּתֵּ֥ן", "daras"],
  ["תִּשְׁמַ֣ע", "ouviras"],
  ["תַעֲשׂ֔וּ", "fareis"],

  // --- שׂ (Sin) ---
  ["שִׂ֥ימוּ", "colocai"],
  ["שְׂפָתַ֣י", "meus-labios"],
  ["שְׂדֵ֣ה", "campo"],

  // --- שׁ (Shin) ---
  ["שֹׁמְר֔וֹן", "Samaria"],
  ["שָׁמַ֗עְתִּי", "ouvi"],
  ["שָׁ֖מָּה", "para-la"],
  ["שֵׁשׁ־", "linho-de"],
  ["שְׁתֵּי֙", "duas"],
  ["שְׁכֶ֑ם", "Siquem"],

  // --- ר (Resh) ---
  ["רָמֹ֥ת", "Ramote"],
  ["רַבִּ֣ים", "muitos"],
  ["רֵעֵ֙הוּ֙", "seu-proximo"],
  ["רְחַבְעָ֗ם", "Roboao"],
  ["רְחַבְעָ֖ם", "Roboao"],

  // --- ק (Qof) ---
  ["קָרוֹב֙", "proximo"],
  ["קָרֵ֔חַ", "Core"],
  ["קָדְשִׁ֑י", "minha-santidade"],
  ["קָדְשׁ֑וֹ", "sua-santidade"],
  ["קַח־", "toma"],
  ["קִרְיָ֖ה", "cidade"],

  // --- צ (Tsade) ---
  ["צָפ֑וֹנָה", "para-o-norte"],
  ["צִיּוֹן֙", "Siao"],
  ["צְבָ֔א", "exercito"],

  // --- פ (Pe) ---
  ["פָּנָ֑יו", "sua-face"],
  ["פִּשְׁעֵ֣י", "transgressoes-de"],
  ["פִּ֥י", "minha-boca"],
  ["פְלִשְׁתִּ֗ים", "filisteus"],

  // --- ע (Ayin) ---
  ["עוֹלָ֔ם", "eternidade"],
  ["עָנֵ֨ה", "respondeu"],
  ["עָלַ֨י ׀", "sobre-mim"],
  ["עָלֶ֙יהָ֙", "sobre-ela"],
  ["עַתָּ֛ה", "agora"],
  ["עַמִּ֗י", "meu-povo"],
  ["עַמִּ֖י", "meu-povo"],
  ["עַמִּ֔ים", "povos"],
  ["עַמִּ֔י", "meu-povo"],
  ["עַמְּךָ֔", "teu-povo"],
  ["עַמּ֜וֹן", "Amon"],
  ["עַבְדִּ֣י", "meu-servo"],
  ["עַבְדְּךָ֛", "teu-servo"],
  ["עֶשְׂרֵ֖ה", "dez"],
  ["עֵשָׂו֙", "Esau"],
  ["עֵ֤ת", "tempo"],
  ["עֵ֣קֶב", "porque"],
  ["עִמָּדִ֑י", "comigo"],
  ["עִמָּ֑נוּ", "conosco"],
  ["עֲטֶ֣רֶת", "coroa"],
  ["עֲבֹדָ֖ה", "servico"],
  ["עֲבָדַ֣י", "meus-servos"],
  ["ע֤וֹד", "ainda"],
  ["ע֚וֹד", "ainda"],
  ["ע֗וֹד", "ainda"],

  // --- ס (Samekh) ---
  ["סוּסִ֖ים", "cavalos"],
  ["ס֣וּר", "afasta-te"],

  // --- נ (Nun) ---
  ["נָשִׂ֑יא", "principe"],
  ["נַפְשִׁי֮", "minha-alma"],
  ["נַפְשִׁ֣י", "minha-alma"],
  ["נַפְשִׁ֔י", "minha-alma"],
  ["נַפְשׁ֔וֹ", "sua-alma"],
  ["נַחֲלָ֑ה", "heranca"],
  ["נַחֲלַ֣ת", "heranca-de"],
  ["נַ֣חַל", "ribeiro"],
  ["נֶ֥גֶד", "diante-de"],
  ["נִצָּ֥ב", "postado"],
  ["נְג֑וֹ", "Nego"],

  // --- מ (Mem) ---
  ["מוֹאָ֛ב", "Moabe"],
  ["מָתַ֥י", "quando"],
  ["מָשְׁזָ֑ר", "torcido"],
  ["מָצָ֤אתִי", "encontrei"],
  ["מָ֥ה", "que"],
  ["מָ֣ה", "que"],
  ["מֵעַ֤ל", "de-sobre"],
  ["מֵעֵ֥בֶר", "do-outro-lado"],
  ["מֵישַׁ֖ךְ", "Mesaque"],
  ["מֵהֶ֖ם", "deles"],
  ["מֵאַ֣יִן", "de-onde"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradu\u00e7\u00e3o AT - Freq5-9 Batch E (palavras 401-500) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`In\u00edcio: ${new Date().toLocaleString('pt-BR')}\n`);

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
      process.stdout.write(`\u2713 ${word} \u2192 ${translation} (${changes})\n`);
    } else {
      process.stdout.write(`\u00b7 ${word} \u2192 ${translation} (0)\n`);
    }
    success++;
  } catch (err) {
    process.stdout.write(`\u2717 ${word} \u2192 ${translation} (ERRO)\n`);
    errors++;
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== AT Freq5-9 Batch E Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch A
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte A)
 * Palavras 1-100 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5a-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 1-100 ===

  // --- ת (Tav) ---
  ["תָּב֣וֹא", "vira"],
  ["תַּעֲשֶׂ֖ה", "faras"],
  ["תְּנָה־", "da"],
  ["תְגַלֵּ֑ה", "descobriras"],

  // --- שׂ/שׁ (Shin/Sin) ---
  ["שַׂר־", "principe-de"],
  ["שָׁל֣וֹם", "paz"],
  ["שָׁל֑וֹם", "paz"],
  ["שָׁ֙מָּה֙", "para-la"],
  ["שָׁ֑וְא", "vaidade"],
  ["שֵׁ֥בֶט", "tribo"],
  ["שִׁמְשׁ֔וֹן", "Sansao"],
  ["שְׁתֵּ֥ים", "duas"],
  ["שְׁלֹשִׁ֥ים", "trinta"],

  // --- ר (Resh) ---
  ["רָשָׁ֔ע", "impio"],
  ["רָא֣וּ", "viram"],
  ["רַבִּ֗ים", "muitos"],
  ["רֵעֵ֖הוּ", "seu-proximo"],

  // --- ק (Qof) ---
  ["קַֽעֲרַת־", "prato-de"],
  ["קֳדָ֣ם", "diante-de"],

  // --- צ (Tsade) ---
  ["צַ֭דִּיקִים", "justos"],
  ["צֶ֣דֶק", "justica"],
  ["צִדְקִיָּ֣הוּ", "Zedequias"],
  ["צְבָ֣א", "exercito"],

  // --- פ (Pe) ---
  ["פֶּ֥תַח", "entrada"],

  // --- ע (Ayin) ---
  ["עַתָּ֥ה", "agora"],
  ["עַבְדֵ֤י", "servos-de"],
  ["עֶשְׂרֵ֣ה", "dez"],
  ["עֲלֵיהֶ֣ם", "sobre-eles"],
  ["עֲדֵי־", "ate"],
  ["ע֔וֹד", "ainda"],

  // --- ס (Samekh) ---
  ["סֹ֖לֶת", "farinha-fina"],

  // --- נ (Nun) ---
  ["נָֽתַן־", "deu"],
  ["נָ֭א", "por-favor"],
  ["נָ֞א", "por-favor"],
  ["נָ֔א", "por-favor"],
  ["נַפְשִׁ֗י", "minha-alma"],
  ["נְא֣וֹת", "pastagens"],

  // --- מ (Mem) ---
  ["מוֹעֵ֖ד", "encontro"],
  ["מוֹעֵ֔ד", "encontro"],
  ["מַלְכָּ֜א", "rei"],
  ["מֵאֽוֹת׃", "centenas"],
  ["מֵֽעָלַ֔י", "de-sobre-mim"],
  ["מִפְּנֵי֙", "de-diante-de"],
  ["מִֽמָּחֳרָ֔ת", "do-dia-seguinte"],
  ["מְנַשֶּׁ֣ה", "Manasses"],
  ["מְלָאכָ֖ה", "obra"],
  ["מְלֶ֣אכֶת", "obra-de"],
  ["מְבַקְשֵׁ֣י", "os-que-buscam"],

  // --- ל (Lamed) ---
  ["לָעָ֣ם", "ao-povo"],
  ["לָכֵן֩", "portanto"],
  ["לָבָ֔ן", "Labao"],
  ["לָאָ֣רֶץ", "a-terra"],
  ["לַכֶּ֖בֶשׂ", "para-o-cordeiro"],
  ["לַ֭יהוָה", "a-yhwh"],
  ["לֶאֱכֹ֣ל", "para-comer"],
  ["לֶ֖חֶם", "pao"],
  ["לִבִּ֣י", "meu-coracao"],
  ["לְרֹ֣אשׁ", "para-cabeca"],
  ["לְעוֹלָ֥ם", "para-sempre"],
  ["לְמִשְׁפְּחֹתָם֒", "para-suas-familias"],
  ["לְךָ֔", "a-ti"],
  ["לְהָשִׁ֣יב", "para-fazer-voltar"],
  ["לְדָוִ֣ד", "a-Davi"],

  // --- כ (Kaf) ---
  ["כֻּלָּ֑ם", "todos-eles"],
  ["כַּדָּבָ֥ר", "conforme-a-palavra"],

  // --- י (Yod) ---
  ["יוֹאָ֔ב", "Joabe"],
  ["יֹאמַ֣ר", "dira"],
  ["יָשׁ֣וּב", "voltara"],
  ["יָרָבְעָ֔ם", "Jeroboao"],
  ["יָמִ֥ים", "dias"],
  ["יָמ֔וּת", "morrera"],
  ["יָ֔ם", "mar"],
  ["יָ֑ם", "mar"],
  ["יֵלֵ֔כוּ", "irao"],
  ["יִרְא֣וּ", "temerao"],

  // --- ח (Chet) ---
  ["חָכְמָ֖ה", "sabedoria"],
  ["חֵ֥לֶק", "porcao"],
  ["חִנָּ֑ם", "em-vao"],
  ["חִזְקִיָּ֔הוּ", "Ezequias"],
  ["חֲמָ֑ת", "Hamate"],
  ["חֲכָמִ֣ים", "sabios"],

  // --- ז (Zayin) ---
  ["זֹ֗את", "esta"],

  // --- ו (Vav) - formas conjuntivas ---
  ["וַיָּבֹ֖אוּ", "e-vieram"],
  ["וַיִּשְׁכַּ֤ב", "e-deitou-se"],
  ["וַֽיַּעֲמֹד֙", "e-pos-se-de-pe"],
  ["וְשֶׁ֖מֶן", "e-oleo"],
  ["וְרַב־", "e-grande"],
  ["וְעָשָׂ֥ה", "e-fez"],
  ["וְיֶ֛תֶר", "e-o-restante"],
  ["וְיֶ֙תֶר֙", "e-o-restante"],
  ["וְהֽוּא־", "e-ele"],
  ["וְהִנֵּ֣ה ׀", "e-eis"],
  ["וְהִכְרַתִּ֥י", "e-extirparei"],
  ["וְאָמַ֣ר", "e-disse"],
  ["וְאִם֙", "e-se"],
  ["וְאִישׁ֙", "e-homem"],
  ["וְאִ֤ישׁ", "e-homem"],
  ["וְ֠גַם", "e-tambem"],

  // --- ה (He) ---
  ["הוּא֙", "ele"],
  ["הָרֹ֔אשׁ", "o-primeiro"],
];

console.log(`\n=== Tradução AT - Freq5-9 Batch A (palavras 1-100) ===`);
console.log(`Palavras a traduzir: ${translations.length}`);
console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

let success = 0;
let errors = 0;
let totalUpdated = 0;

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
    if (jsonStart !== -1) {
      const jsonStr = result.substring(jsonStart);
      const parsed = JSON.parse(jsonStr);
      const changes = parsed[0]?.meta?.changes || 0;
      totalUpdated += changes;

      if (changes > 0) {
        process.stdout.write(`✓ ${word} → ${translation} (${changes})\n`);
      } else {
        process.stdout.write(`· ${word} → ${translation} (0)\n`);
      }
    }
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    process.stdout.write(`✗ ${word} → ${translation} (ERRO)\n`);
  }
}

try { unlinkSync(tmpFile); } catch {}

console.log(`\n=== AT Freq5 Batch A Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

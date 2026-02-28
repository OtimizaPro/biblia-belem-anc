#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch P (palavras 1501-1600)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte P)
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5p-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq 5-9, índices 1501-1600 (100 palavras) ===

  // --- ע (Ayin) ---
  ["עַמִּים֙", "povos"],
  ["עַמּ֔וֹ", "seu-povo"],
  ["עַבְדְּךָ֣", "teu-servo"],
  ["עַבְדֵֽי־", "servos-de"],
  ["עַבְדֵ֣י", "servos-de"],
  ["עַ֭מִּי", "meu-povo"],
  ["עֶשְׂרֵ֤ה", "dez"],
  ["עֶ֝לְי֗וֹן", "Altissimo"],
  ["עֵינָ֑י", "meus-olhos"],
  ["עֵינֶ֑יךָ", "teus-olhos"],
  ["עֵ֣ץ", "arvore"],
  ["עֵ֑ת", "tempo"],
  ["עִמָּ֑ם", "com-eles"],
  ["עִזִּ֔ים", "cabras"],
  ["עֲשָׂרָ֑ה", "dez"],
  ["עֲשׂ֣וֹת", "fazer"],
  ["עֲצַת־", "conselho-de"],
  ["עֲנָוִ֣ים", "mansos"],
  ["עֲלֵיכֶ֜ם", "sobre-vos"],
  ["עֲלֵיכֶ֖ם", "sobre-vos"],
  ["עֲלֵיהֶ֗ם", "sobre-eles"],
  ["עֲבָדָ֥יו", "seus-servos"],
  ["עֲבָדֶ֙יךָ֙", "teus-servos"],
  ["ע֧וֹד", "ainda"],
  ["ע֜וֹד", "ainda"],

  // --- ס (Samekh) ---
  ["סוּסִ֔ים", "cavalos"],
  ["סָבִיב֙", "ao-redor"],
  ["סָבִ֥יב ׀", "ao-redor"],
  ["סָ֗ר", "afastou-se"],
  ["סֵ֥פֶר", "livro"],
  ["סִינָ֑י", "Sinai"],
  ["סִינַ֔י", "Sinai"],
  ["סִיחוֹן֙", "Sicon"],

  // --- נ (Nun) ---
  ["נָּ֥א", "por-favor"],
  ["נָתַ֤תִּי", "dei"],
  ["נָשִׁ֤ים", "mulheres"],
  ["נָשִׁ֖ים", "mulheres"],
  ["נָקָ֖ם", "vinganca"],
  ["נָדִ֑יב", "nobre"],
  ["נָב֖וֹת", "Nabote"],
  ["נָ֗א", "por-favor"],
  ["נַפְשָׁ֔ם", "sua-alma"],
  ["נַפְשִׁ֥י", "minha-alma"],
  ["נַפְשְׁכֶ֑ם", "vossa-alma"],
  ["נַפְשְׁךָ֙", "tua-alma"],
  ["נַחֲלָ֖ה", "heranca"],
  ["נֶֽפֶשׁ־", "alma-de"],
  ["נֶ֣גֶב", "Neguebe"],
  ["נִתְּנָ֖ה", "foi-dada"],
  ["נִשְׁבַּ֧ע", "jurou"],
  ["נִשְׁבַּ֖ע", "jurou"],
  ["נִקְרָ֥א", "foi-chamado"],
  ["נִיחֹ֖חַ", "agradavel"],
  ["נִיחֹ֔חַ", "agradavel"],
  ["נְתַתִּ֖יךָ", "te-dei"],
  ["נ֗וּן", "Nun"],

  // --- מ (Mem) ---
  ["מוֹשֵׁ֖ל", "governante"],
  ["מָרְדֳּכָ֑י", "Mordecai"],
  ["מָצָ֥אתִי", "encontrei"],
  ["מָלְאָ֣ה", "encheu-se"],
  ["מָ֙וֶת֙", "morte"],
  ["מַשְׂכִּ֑יל", "maskil"],
  ["מַצִּֽיל׃", "libertador"],
  ["מַעֲשֶׂ֑יךָ", "tuas-obras"],
  ["מַעֲשֵׂ֣י", "obras-de"],
  ["מַעְשַׂ֤ר", "dizimo"],
  ["מַמְלְכ֥וֹת", "reinos"],
  ["מַלְכֵי־", "reis-de"],
  ["מַלְכ֣וּת", "reino"],
  ["מַכָּ֣ה", "golpe"],
  ["מַטֵּה־", "tribo-de"],
  ["מַטֵּ֣ה", "tribo-de"],
  ["מֶ֣ה", "que"],
  ["מֵשִׁ֣יב", "que-restaura"],
  ["מֵעָלַ֣י", "de-sobre-mim"],
  ["מֵעֵ֖בֶר", "do-outro-lado"],
  ["מֵהַ֥ר", "do-monte"],
  ["מֵאֶ֧רֶץ", "da-terra-de"],
  ["מֵאֵ֥ת", "de-com"],
  ["מֵאֲנ֖וּ", "recusaram"],
  ["מֵא֛וֹת", "centenas"],
  ["מֵא֔וֹת", "centenas"],
  ["מִשָּׁ֖ם", "de-la"],
  ["מִשְׁפָּט֙", "juizo"],
  ["מִשְׁפָּֽט׃", "juizo"],
  ["מִשְׁפַּט־", "juizo-de"],
  ["מִשְׁפַּ֥ט", "juizo"],
  ["מִשְׁפַּ֖ט", "juizo"],
  ["מִשְׁפְּח֣וֹת", "familias-de"],
  ["מִשְׁכַּ֣ן", "tabernaculo-de"],
  ["מִקִּרְבֶּ֑ךָ", "de-teu-meio"],
  ["מִקְצֵ֣ה", "da-extremidade-de"],
  ["מִצָּפוֹן֙", "do-norte"],
  ["מִצְרַיִם֮", "Egito"],
  ["מִצְוֺתַ֣י", "meus-mandamentos"],
  ["מִצְוֺת֙", "mandamentos-de"],
  ["מִצְוַ֥ת", "mandamento-de"],
  ["מִפָּנֶ֖יךָ", "de-diante-de-ti"],
  ["מִפִּ֣י", "da-boca-de"],
  ["מִפְּנֵ֤י", "de-diante-de"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch P (palavras 1501-1600) ===`);
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

console.log(`\n=== AT Freq5-9 Batch P Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

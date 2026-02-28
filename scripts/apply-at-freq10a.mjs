#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq10a-${Date.now()}.sql`);

const translations = [
  ["כֹּ֣ה ׀", "assim"],
  ["לְדָוִֽד׃", "de-Davi"],
  ["דִֽי־", "que"],
  ["אָמַ֣ר ׀", "disse"],
  ["אֱלֹהֵֽי־", "Elohim-de"],
  ["סָבִ֣יב ׀", "ao-redor"],
  ["אֵלָ֑י", "a-mim"],
  ["יְרֽוּשָׁלָ֑͏ִם", "Jerusalem"],
  ["וַיֹּֽאמְרוּ֙", "e-disseram"],
  ["דֶּֽרֶךְ־", "caminho-de"],
  ["בִּירוּשָׁלַ֖͏ִם", "em-Jerusalem"],
  ["אֽוֹ־", "ou"],
  ["שְׁנֵיהֶ֣ם ׀", "ambos-deles"],
  ["נַפְשִֽׁי׃", "minha-alma"],
  ["כֶּֽבֶשׂ־", "cordeiro"],
  ["יִֽהְיֶה־", "sera"],
  ["הַֽלְלוּ־", "louvai"],
  ["הֶן־", "eis"],
  ["הִנֵּֽה־", "eis"],
  ["אֱ‍ֽלֹהִ֗ים", "Elohim"],
  ["תְּכֵ֧לֶת", "azul"],
  ["שְׁמָמָ֔ה", "desolacao"],
  ["שְׁמַיָּ֔א", "ceus"],
  ["שְׁא֣וֹל", "Sheol"],
  ["רֵאשִׁ֣ית", "primicia"],
  ["צֶ֑דֶק", "justica"],
  ["צִדְקִיָּ֖הוּ", "Zedequias"],
  ["עַתֻּדִ֣ים", "bodes"],
  ["עַבְדּ֑וֹ", "seu-servo"],
  ["נָכ֣וֹן", "firme"],
  ["מוּסָ֑ר", "disciplina"],
  ["מֵא֥וֹת", "centenas"],
  ["מִשְׁקָלָהּ֒", "seu-peso"],
  ["מִלְּבַד֙", "alem-de"],
  ["מְעַ֣ט", "pouco"],
  ["לְךָ֣", "a-ti"],
  ["כְּכֹ֥ל", "conforme-tudo"],
  ["כֹ֤ה", "assim"],
  ["יוֹם־", "dia-de"],
  ["יָ֖מָּה", "para-o-mar"],
  ["יִתֵּ֖ן", "dara"],
  ["יְשָׁרִ֣ים", "retos"],
  ["יְהוֹנָתָ֖ן", "Jonatas"],
  ["חַלְלֵי־", "traspassados-de"],
  ["וּמִבְּנֵ֣י", "e-dos-filhos-de"],
  ["וַעֲבֵ֣ד", "e-Abede"],
  ["וַאֲנִ֤י ׀", "e-eu"],
  ["וְעַ֣ל ׀", "e-sobre"],
  ["וְהַלְוִיִּ֔ם", "e-os-levitas"],
  ["וְאָכְלָ֖ה", "e-consumiu"],
  ["וְאֵ֣ת ׀", "e-[OBJ]"],
  ["הַכֹּ֥ל", "o-tudo"],
  ["הַכַּשְׂדִּ֔ים", "os-caldeus"],
  ["הַכֶּ֖סֶף", "a-prata"],
  ["דַּרְכּ֑וֹ", "seu-caminho"],
  ["דּ֣וֹר", "geracao"],
  ["בָּ֣אוּ", "vieram"],
  ["בִּלְעָ֔ם", "Balaao"],
  ["בְּשַׁ֣עַר", "no-portao-de"],
  ["בְּמָלְכ֔וֹ", "em-seu-reinado"],
  ["בַיּ֨וֹם", "no-dia"],
  ["בִ֑י", "em-mim"],
  ["אַבְנֵי־", "pedras-de"],
  ["אַ֥ךְ", "somente"],
  ["אֶקְרָ֑א", "clamarei"],
  ["אִמְרֵי־", "palavras-de"],
  ["אִֽישׁ־", "homem-de"],
  ["שָׂרֵ֨י", "principes-de"],
  ["שָׁא֑וּל", "Saul"],
  ["שִׁשָּׁ֥ה", "seis"],
  ["שִׁ֗יר", "cantico"],
  ["קָרְבָּנ֞וֹ", "sua-oferta"],
  ["קֶ֣שֶׁת", "arco"],
  ["קְטֹֽרֶת׃", "incenso"],
  ["קְהַ֣ל", "assembleia"],
  ["ק֤וֹל", "voz"],
  ["פַּרְעֹ֣ה", "Farao"],
  ["עֹלַ֣ת", "holocausto-de"],
];

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
console.log(`\n=== AT Freq10+ Batch A Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

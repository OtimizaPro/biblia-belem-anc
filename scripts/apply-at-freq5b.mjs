#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5b-${Date.now()}.sql`);

const translations = [
  // [hebrew_word_exactly_as_in_json, "portuguese-translation"]
  ["הָרַ֛ע", "o-mal"],
  ["הָרִאשֹׁנִ֖ים", "os-primeiros"],
  ["הָרִ֣ים", "os-montes"],
  ["הָיִ֣יתִי", "eu-fui"],
  ["הָהֵ֔ם", "aqueles"],
  ["הָאֱלֹהִ֗ים", "o-Elohim"],
  ["הַשַּׁבָּ֑ת", "o-shabat"],
  ["הַצֹּ֑אן", "o-rebanho"],
  ["הַצָּפ֔וֹן", "o-norte"],
  ["הַנָּבִ֖יא", "o-profeta"],
  ["הַמִּזְבֵּ֑חַ", "o-altar"],
  ["הַכֹּֽהֲנִים֙", "os-sacerdotes"],
  ["הַיָּמִ֖ים", "os-dias"],
  ["הַטּ֖וֹב", "o-bom"],
  ["הִנְנִ֥י", "eis-me"],
  ["הֲלֹ֤א", "acaso-nao"],
  ["ה֗וֹי", "ai"],
  ["דָּוִ֜יד", "Davi"],
  ["גוֹיִם֙", "nacoes"],
  ["גּוֹיִ֑ם", "nacoes"],
  ["גִּבּ֥וֹר", "valente"],
  ["בַּעֲלֵ֣י", "senhores-de"],
  ["בַּמַּ֖יִם", "nas-aguas"],
  ["בַּיָּמִ֣ים", "nos-dias"],
  ["בַּבֹּ֣קֶר", "na-manha"],
  ["בִּלְעָם֙", "Balaao"],
  ["בִּגְדֵ֥י", "vestes-de"],
  ["בְּעָרֵ֣י", "nas-cidades-de"],
  ["בְּנ֖וֹ", "seu-filho"],
  ["בְּגָדָ֔יו", "suas-vestes"],
  ["בּ֥וֹ", "nele"],
  ["בָ֔ם", "neles"],
  ["בַת־", "filha-de"],
  ["בַיּוֹם־", "no-dia-de"],
  ["בִנְיָמִ֖ן", "Benjamim"],
  ["בְיַד־", "na-mao-de"],
  ["אוֹתָ֖הּ", "a-ela"],
  ["אֹ֔רֶךְ", "comprimento"],
  ["אָ֭מַרְתִּי", "eu-disse"],
  ["אָ֣ז", "entao"],
  ["אָ֖ז", "entao"],
  ["אַשְׁרֵ֣י", "bem-aventurancas-de"],
  ["אַרְבָּעָ֥ה", "quatro"],
  ["אַנְשֵׁי־", "homens-de"],
  ["אַ֣ךְ", "somente"],
  ["אֶתֵּ֥ן", "darei"],
  ["אֶחָ֑יו", "seus-irmaos"],
  ["אֵלָ֔יו", "a-ele"],
  ["אֵ֣שֶׁת", "mulher-de"],
  ["אֵ֔לֶּה", "estes"],
  ["אֵ֑שׁ", "fogo"],
  ["אִתָּ֑ם", "com-eles"],
  ["אִתּ֖וֹ", "com-ele"],
  ["אֲשֶׁ֣ר ׀", "que"],
  ["אֲנִ֧י", "eu"],
  ["אֲחֵרִ֔ים", "outros"],
  ["אֱנ֣וֹשׁ", "mortal"],
  ["אֱלֹהָ֑י", "meu-Elohim"],
  ["תָּמִ֑יד", "continuamente"],
  ["תַּעֲשֶׂ֔ה", "faras"],
  ["תִּתֵּ֣ן", "daras"],
  ["תִּֽהְיֶ֔ה", "sera"],
  ["תְּנוּ־", "dai-"],
  ["שָׁא֣וּל", "Saul"],
  ["שָׁ֣מָּה", "para-la"],
  ["שִׁבְעָ֣ה", "sete"],
  ["שִׁ֣יר", "cantico"],
  ["שְׁנֵֽי־", "dois-de"],
  ["שְׁמוּאֵ֗ל", "Samuel"],
  ["שְׁמֶ֑ךָ", "teu-nome"],
  ["שְׁלֹשָׁ֤ה", "tres"],
  ["שְׁלֹשִׁ֣ים", "trinta"],
  ["שְֽׁמַֽע־", "ouve-"],
  ["שׁ֣וֹר", "boi"],
  ["רָשָׁע֙", "impio"],
  ["רָעָה֙", "mal"],
  ["רַבִּים֙", "muitos"],
  ["רֶ֑שַׁע", "impiedade"],
  ["קֹ֔דֶשׁ", "santidade"],
  ["צָפ֔וֹן", "norte"],
  ["צָפ֑וֹן", "norte"],
  ["צַדִּ֖יק", "justo"],
  ["צִיּ֗וֹן", "Siao"],
  ["צְבָא֛וֹת", "exercitos"],
  ["פֹּ֣עֲלֵי", "praticantes-de"],
  ["פֶּ֣תַח", "entrada"],
  ["עֹשֵׂ֣י", "fazedores-de"],
  ["עֹבֵ֣ר", "passando"],
  ["עָשׂ֑וּ", "fizeram"],
  ["עָלָ֛יו", "sobre-ele"],
  ["עָלָ֑י", "sobre-mim"],
  ["עָלַ֥י", "sobre-mim"],
  ["עָלַ֗י", "sobre-mim"],
  ["עַבְדֶּ֑ךָ", "teu-servo"],
  ["עַבְדְּךָ֥", "teu-servo"],
  ["עֶֽבֶד־", "servo-de"],
  ["עֲשָׂרָ֣ה", "dez"],
  ["עֲצֵ֥י", "madeiras-de"],
  ["עֲלֵיהֶ֛ם", "sobre-eles"],
  ["סָבִ֑יב", "ao-redor"],
];

console.log(`\n=== Tradução AT - Freq5-9 Batch B (palavras 101-200) ===`);
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
      const parsed = JSON.parse(result.substring(jsonStart));
      const changes = parsed[0]?.meta?.changes || 0;
      totalUpdated += changes;
    }
    success++;
    if (success % 10 === 0) console.log(`  ... ${success}/${translations.length}`);
  } catch (err) {
    errors++;
    console.log(`✗ ${word} → ${translation} (ERRO)`);
  }
}

try { unlinkSync(tmpFile); } catch {}
console.log(`\n=== AT Freq5 Batch B Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}`);

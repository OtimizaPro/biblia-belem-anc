#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5l-${Date.now()}.sql`);

// Freq5-9 Batch L (palavras 1101-1200)
const translations = [
  ["וּבִֽעַרְתָּ֥", "e-extirparas"],
  ["וּבְעָרֵ֣י", "e-nas-cidades-de"],
  ["וּבְנֹתֶ֔יהָ", "e-suas-filhas"],
  ["וּבְנֵֽי־", "e-filhos-de"],
  ["וּבְיַ֖ד", "e-na-mao-de"],
  ["וּֽמְקַטְּרִ֖ים", "e-queimando-incenso"],
  ["וָתֵ֙שַׁע֙", "e-nove"],
  ["וָמָ֑עְלָה", "e-acima"],
  ["וָחֵ֖צִי", "e-metade"],
  ["וַיהוָ֣ה", "e-yhwh"],
  ["וַיֹּאמְר֤וּ", "e-disseram"],
  ["וַיָּשֻׁ֙בוּ֙", "e-retornaram"],
  ["וַיָּבֹ֥אוּ", "e-vieram"],
  ["וַיָּ֖שָׁב", "e-retornou"],
  ["וַיַּשְׁכֵּ֨ם", "e-madrugou"],
  ["וַיַּכֵּ֥ם", "e-feriu-os"],
  ["וַיַּגִּ֣ידוּ", "e-anunciaram"],
  ["וַיַּ֨עַן", "e-respondeu"],
  ["וַיַּ֣עַן", "e-respondeu"],
  ["וַיַּ֣עַל", "e-subiu"],
  ["וַיֶּאֱסֹ֥ף", "e-reuniu"],
  ["וַיֵּצֵ֥א", "e-saiu"],
  ["וַיֵּצְא֖וּ", "e-sairam"],
  ["וַיֵּ֤רֶד", "e-desceu"],
  ["וַיֵּ֣לְכ֔וּ", "e-foram"],
  ["וַיִּשְׁלַ֤ח", "e-enviou"],
  ["וַחֲשֻׁקֵיהֶ֖ם", "e-suas-faixas"],
  ["וַחֲמֵ֥שׁ", "e-cinco"],
  ["וַחֲמִשָּׁ֖ה", "e-cinco"],
  ["וַאֲנִ֥י", "e-eu"],
  ["וַֽיַּעֲשׂוּ֙", "e-fizeram"],
  ["וַֽאֲנִי֙", "e-eu"],
  ["וַ֭אֲנִי", "e-eu"],
  ["וַ֠יִּשְׁלַח", "e-enviou"],
  ["וִיהוֹשֻׁ֣עַ", "e-Yehoshua"],
  ["וִֽידַעְתֶּם֙", "e-sabereis"],
  ["וְתַ֥חַת", "e-debaixo-de"],
  ["וְשַׂמְתָּ֣", "e-colocaras"],
  ["וְשַׂמְתִּ֨י", "e-colocarei"],
  ["וְשָׁ֣ם", "e-la"],
  ["וְר֥וּחַ", "e-espirito-de"],
  ["וְעָשִׂ֜יתָ", "e-faras"],
  ["וְעָשִׂ֙יתָ֙", "e-faras"],
  ["וְעַתָּה֙", "e-agora"],
  ["וְעַתָּ֣ה", "e-agora"],
  ["וְעַד֙", "e-ate"],
  ["וְעֵ֥ת", "e-tempo-de"],
  ["וְעֵ֣ץ", "e-arvore-de"],
  ["וְעִמּ֖וֹ", "e-com-ele"],
  ["וְנַעֲלֶ֣ה", "e-subiremos"],
  ["וְלַאֲשֶׁ֥ר", "e-para-o-que"],
  ["וְכֹ֣ה", "e-assim"],
  ["וְיֹשְׁבֵ֣י", "e-habitantes-de"],
  ["וְחָמֵשׁ֙", "e-cinco"],
  ["וְחָמֵ֤שׁ", "e-cinco"],
  ["וְזָהָ֔ב", "e-ouro"],
  ["וְזֶ֖ה", "e-este"],
  ["וְהָעִ֣יר", "e-a-cidade"],
  ["וְהָיָ֧ה", "e-sera"],
  ["וְהָיָ֞ה", "e-sera"],
  ["וְהָיְתָ֥ה", "e-sera"],
  ["וְהֵבֵאתִ֥י", "e-trarei"],
  ["וְהִקְרַבְתֶּ֨ם", "e-oferecereis"],
  ["וְהִכְרַתִּ֤י", "e-cortarei"],
  ["וְדַ֖עַת", "e-conhecimento"],
  ["וְגַ֧ם", "e-tambem"],
  ["וְאָמַרְתָּ֞", "e-diras"],
  ["וְאָמְר֗וּ", "e-disseram"],
  ["וְאַרְבַּ֣עַת", "e-quatro-de"],
  ["וְאַמָּ֥ה", "e-covado"],
  ["וְאֵ֨לֶּה", "e-estes"],
  ["וְאֵ֤ין", "e-nao-ha"],
  ["וְאִ֥ישׁ", "e-homem"],
  ["וְ֠אַתָּה", "e-tu"],
  ["הוֹד֣וּ", "dai-gracas"],
  ["הֽוּא־", "ele"],
  ["הֽ͏ָאֱלֹהִ֔ים", "o-Elohim"],
  ["הָרֹצֵ֔חַ", "o-assassino"],
  ["הָרָעָ֖ב", "a-fome"],
  ["הָרִאשׁ֔וֹן", "o-primeiro"],
  ["הָר֔וּחַ", "o-espirito"],
  ["הָעָם֒", "o-povo"],
  ["הָעֵדָ֖ה", "a-congregacao"],
  ["הָמָ֖ן", "Haman"],
  ["הָלְכ֥וּ", "foram"],
  ["הָאֶחָ֖ד", "o-um"],
  ["הָאֶחָ֔ד", "o-um"],
  ["הָאֶ֙בֶן֙", "a-pedra"],
  ["הָאֵ֗לֶּה", "estes"],
  ["הָאִישׁ֙", "o-homem"],
  ["הָאֲדָמָ֑ה", "a-terra"],
  ["הָֽעֵדָ֔ה", "a-congregacao"],
  ["הָֽאֶחָ֔ת", "a-uma"],
  ["הָֽאִשָּׁה֙", "a-mulher"],
  ["הָֽאֱלֹהִים֙", "o-Elohim"],
  ["הָֽאֱלֹהִ֔ים", "o-Elohim"],
  ["הַשַּׁ֣עַר", "o-portao"],
  ["הַשַּׁ֖עַר", "o-portao"],
  ["הַשֶּׁ֖מֶן", "o-azeite"],
  ["הַשְּׁמִינִ֔י", "o-oitavo"],
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
console.log(`\n=== AT Freq5-9 Batch L Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

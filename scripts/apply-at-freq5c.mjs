#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5c-${Date.now()}.sql`);

const translations = [
  ["נֹשֵׂ֣א", "carregando"],
  ["נַפְשׁוֹ֙", "sua-alma"],
  ["נַפְשָׁ֑ם", "alma-deles"],
  ["נַפְשִׁי֙", "minha-alma"],
  ["נַחֲלַ֥ת", "heranca-de"],
  ["נַחֲלַ֛ת", "heranca-de"],
  ["נְבָ֔ט", "Nebate"],
  ["מוּסַ֣ר", "disciplina"],
  ["מוֹאָב֙", "Moabe"],
  ["מוֹאָ֑ב", "Moabe"],
  ["מָֽה־", "que-"],
  ["מָ֑וֶת", "morte"],
  ["מַעֲשֵׂ֥ה", "obra"],
  ["מַעֲשֵׂ֖ה", "obra"],
  ["מַחְשְׁב֣וֹת", "pensamentos"],
  ["מֵבִ֥יא", "trazendo"],
  ["מִתּ֖וֹךְ", "do-meio-de"],
  ["מִשְׁפָּ֔ט", "juizo"],
  ["מִקְרָא־", "convocacao-"],
  ["מִצְרַ֛יִם", "Mitsraim"],
  ["מִפְּנֵי־", "de-diante-de-"],
  ["מִסָּבִ֑יב", "de-ao-redor"],
  ["מִלִּפְנֵ֣י", "de-diante-de"],
  ["מִי־", "quem-"],
  ["מִזְבַּ֣ח", "altar"],
  ["מִדְבָּ֑ר", "deserto"],
  ["מְנַשֶּׁ֖ה", "Manasses"],
  ["מְא֔וּמָה", "coisa-alguma"],
  ["לִּי֙", "a-mim"],
  ["לָלֶ֙כֶת֙", "para-andar"],
  ["לָ֑נוּ", "a-nos"],
  ["לַעֲשׂ֣וֹת", "para-fazer"],
  ["לַלְוִיִּ֔ם", "aos-levitas"],
  ["לַֽ֭יהוָה", "a-yhwh"],
  ["לֵאלֹהִֽים׃", "a-Elohim"],
  ["לִשְׁמֹ֥ר", "para-guardar"],
  ["לִפְנֵיהֶ֔ם", "diante-deles"],
  ["לִפְנֵי֙", "diante-de"],
  ["לִבָּ֑ם", "coracao-deles"],
  ["לְשַׁמָּ֔ה", "para-desolacao"],
  ["לְךָ֜", "a-ti"],
  ["לְיִשְׂרָאֵ֑ל", "a-Israel"],
  ["לְדָוִ֥ד", "a-Davi"],
  ["לְדָוִ֗ד", "a-Davi"],
  ["לְבֵית֑וֹ", "para-sua-casa"],
  ["כֻּלָּם֙", "todos-eles"],
  ["כֻּלָּ֔ם", "todos-eles"],
  ["כֵּן־", "assim-"],
  ["כֵּ֭ן", "assim"],
  ["כֵּ֡ן", "assim"],
  ["כְּמ֣וֹ", "como"],
  ["כְמוֹ־", "como-"],
  ["יוֹסֵ֖ף", "Jose"],
  ["יוֹמָ֔ם", "de-dia"],
  ["יוֹאָ֛ב", "Joabe"],
  ["יָמִ֑ים", "dias"],
  ["יָדִ֖י", "minha-mao"],
  ["יָדִ֔י", "minha-mao"],
  ["יָ֭דַעְתִּי", "eu-conheci"],
  ["יַחְדָּו֙", "juntamente"],
  ["יֶשׁ־", "ha-"],
  ["יֵהוּא֙", "Jeu"],
  ["יִתֵּ֨ן", "dara"],
  ["יִרְאַ֣ת", "temor-de"],
  ["יִרְאֶ֣ה", "vera"],
  ["יִפְתָּח֙", "Jifte"],
  ["יְרוּשָׁלִַ֔ם", "Jerusalem"],
  ["יְמֵי֙", "dias-de"],
  ["יְהֽוֹנָתָן֙", "Jonatas"],
  ["טַבְּעֹ֣ת", "argolas"],
  ["חָזֵ֣ה", "peito"],
  ["חָ֭כְמָה", "sabedoria"],
  ["חַ֙יִל֙", "forca"],
  ["חֶ֣רֶב", "espada"],
  ["חֲר֥וֹן", "ardor"],
  ["חֲמֵשׁ־", "cinco-"],
  ["חֲמִשָּׁ֣ה", "cinco"],
  ["זֹ֣את", "esta"],
  ["זֹ֔את", "esta"],
  ["זָ֑ר", "estranho"],
  ["זֶ֥רַע", "semente"],
  ["וּשְׁנֵ֣י", "e-dois-de"],
  ["וּמָ֣ה", "e-que"],
  ["וּבָ֥א", "e-veio"],
  ["וּבָ֣א", "e-veio"],
  ["וּבְכֹ֖ל", "e-em-tudo"],
  ["וָמֵ֑ת", "e-morreu"],
  ["וַתְּהִי־", "e-foi-"],
  ["וַיהוָ֖ה", "e-yhwh"],
  ["וַיָּ֧שֶׂם", "e-pos"],
  ["וַיָּ֣שָׁב", "e-retornou"],
  ["וַיִּתְּנוּ־", "e-deram-"],
  ["וַיִּתְּנ֨וּ", "e-deram"],
  ["וַחֲצִ֣י", "e-metade-de"],
  ["וַ֭יַּעַן", "e-respondeu"],
  ["וִֽידַעְתֶּ֖ם", "e-conhecereis"],
  ["וְרָאָ֣ה", "e-viu"],
  ["וְעֶשְׂרִ֤ים", "e-vinte"],
  ["וְעִמּ֕וֹ", "e-com-ele"],
  ["וְלִפְנֵ֣י", "e-diante-de"],
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
console.log(`\n=== Freq5-9 Batch C (palavras 201-300) Completo ===`);
console.log(`✓ ${success} | ✗ ${errors} | Total: ${translations.length}`);
console.log(`Tokens atualizados: ${totalUpdated}`);

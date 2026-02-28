#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch T (palavras 1901-2000)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte T)
 * 100 palavras da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5t-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq 5-9, lote T (palavras 1901-2000) ===

  // --- וְשׁ (Vav + Shin) ---
  ["וְשִׁלַּ֥חְתִּי", "e-enviarei"],
  ["וְשִׁבְעִ֥ים", "e-setenta"],
  ["וְשִׁבְעִ֖ים", "e-setenta"],

  // --- וְר (Vav + Resh) ---
  ["וְרֹ֥אשׁ", "e-cabeca"],
  ["וְרֹ֙חַב֙", "e-largura"],

  // --- וְע (Vav + Ayin) ---
  ["וְעָשִׂ֕יתָ", "e-faras"],
  ["וְעָשׂ֣וּ", "e-farao"],
  ["וְעַתָּ֗ה", "e-agora"],
  ["וְעֶשְׂרִ֥ים", "e-vinte"],
  ["וְעֵינֵ֥י", "e-olhos-de"],
  ["וְעִמּ֛וֹ", "e-com-ele"],
  ["וְע֥וֹד", "e-ainda"],

  // --- וְנ (Vav + Nun) ---
  ["וְנֹשֵׂ֥א", "e-portador"],
  ["וְנָטִ֤יתִי", "e-estenderei"],
  ["וְנֶ֖פֶשׁ", "e-alma"],
  ["וְנִסְכֵּיהֶ֡ם", "e-suas-libacoes"],

  // --- וְל (Vav + Lamed) ---
  ["וְלָקַחְתָּ֥", "e-tomaras"],
  ["וְלָקַחְתָּ֤", "e-tomaras"],
  ["וְלַגֵּ֖ר", "e-ao-estrangeiro"],
  ["וְלֶ֥חֶם", "e-pao"],
  ["וְלֵ֥ב", "e-coracao"],
  ["וְלִפְנֵ֥י", "e-diante-de"],
  ["וְלִבְנֵ֥י", "e-aos-filhos-de"],
  ["וְלִבְנֵ֣י", "e-aos-filhos-de"],

  // --- וְכ (Vav + Kaf) ---
  ["וְכֵן֙", "e-assim"],
  ["וְכֵ֖ן", "e-assim"],

  // --- וְי (Vav + Yod) ---
  ["וְיָשַׁ֥ב", "e-habitou"],
  ["וְיַד־", "e-mao-de"],
  ["וְיֶ֣תֶר", "e-o-restante-de"],
  ["וְיֵֽדְעוּ֙", "e-saberao"],
  ["וְיֵ֣שׁ", "e-ha"],
  ["וְיִשְׁמָעֵ֣אל", "e-Ismael"],

  // --- וְח (Vav + Chet) ---
  ["וְחֶזְוֵ֥י", "e-visoes-de"],

  // --- וְז (Vav + Zayin) ---
  ["וְזָהָ֑ב", "e-ouro"],
  ["וְזֶה־", "e-este"],

  // --- וְה (Vav + He) ---
  ["וְהָיוּ־", "e-foram"],
  ["וְהָיוּ֙", "e-foram"],
  ["וְהָיִ֥יתָ", "e-seras"],
  ["וְהָיְתָ֨ה", "e-sera"],
  ["וְהָאָ֙רֶץ֙", "e-a-terra"],
  ["וְהַכֹּהֲנִים֙", "e-os-sacerdotes"],
  ["וְהִנֵּֽה־", "e-eis"],
  ["וְהִ֨נֵּה־", "e-eis"],
  ["וְה֗וּא", "e-ele"],
  ["וְה֕וּא", "e-ele"],

  // --- וְד (Vav + Dalet) ---
  ["וְדָוִ֖ד", "e-Davi"],

  // --- וְא (Vav + Alef) ---
  ["וְאָֽמְרוּ֙", "e-disseram"],
  ["וְאַתֶּ֥ם", "e-vos"],
  ["וְאַנְשֵׁי־", "e-homens-de"],
  ["וְאַחַ֣ר", "e-apos"],
  ["וְאַדְנֵיהֶ֥ם", "e-suas-bases"],
  ["וְאֵין־", "e-nao-ha"],
  ["וְאֵ֨ין", "e-nao-ha"],
  ["וְאֵ֥ת ׀", "e-[OBJ]"],
  ["וְאֵ֖לֶּה", "e-estes"],
  ["וְאִ֨ם־", "e-se"],
  ["וְאִ֣ם ׀", "e-se"],
  ["וְאִ֛ישׁ", "e-homem"],

  // --- וְֽ (Vav + shva, variantes) ---
  ["וְֽיָדְע֞וּ", "e-saberao"],
  ["וְֽאוּלָ֗ם", "e-porem"],
  ["וְֽאִם־", "e-se"],
  ["וְ֠הוּא", "e-ele"],
  ["וְ֠הָיָה", "e-sera"],
  ["וְ֠הָיְתָה", "e-sera"],
  ["וְ֝ה֗וּא", "e-ele"],

  // --- ה (He) - formas com artigo definido הוֹ/הָ/הַ ---
  ["הוֹלֵ֥ךְ", "caminhante"],
  ["הָרָעָ֥ה", "a-maldade"],
  ["הָרָעָ֑ה", "a-maldade"],
  ["הָרִאשׁ֖וֹן", "o-primeiro"],
  ["הָרִ֣אשֹׁנִ֔ים", "os-primeiros"],
  ["הָעַמִּ֖ים", "os-povos"],
  ["הָעֵדֻ֑ת", "o-testemunho"],
  ["הָעֵדָ֗ה", "a-congregacao"],
  ["הָעֵ֔ץ", "a-arvore"],
  ["הָעֲשִׂירִ֔י", "o-decimo"],
  ["הָמָן֙", "Haman"],
  ["הָיְתָ֥ה", "foi"],
  ["הָיְתָ֤ה", "foi"],
  ["הָיְתָ֖ה", "foi"],
  ["הָי֨וּ", "foram"],
  ["הָי֑וּ", "foram"],
  ["הָהָר֙", "o-monte"],
  ["הָהָ֗ר", "o-monte"],
  ["הָאֵ֜לֶּה", "estes"],
  ["הָאֵ֛לֶּה", "estes"],
  ["הָאֵ֖שׁ", "o-fogo"],
  ["הָאֲנָשִׁ֥ים", "os-homens"],
  ["הָאֱלֹהִ֜ים", "o-Elohim"],
  ["הָֽרָעָ֔ה", "a-maldade"],
  ["הָֽעַמִּ֑ים", "os-povos"],
  ["הָֽיוּ־", "foram"],
  ["הָ֣יוּ", "foram"],

  // --- הַ (He com artigo patach) ---
  ["הַתּוֹרָ֔ה", "a-Torah"],
  ["הַתִּיר֣וֹשׁ", "o-mosto"],
  ["הַשָּׂדֶ֖ה", "o-campo"],
  ["הַשָּׂ֔ר", "o-principe"],
  ["הַשֻּׁלְחָן֙", "a-mesa"],
  ["הַשָּׁנָ֣ה", "o-ano"],
  ["הַשֶּׁ֖מֶשׁ", "o-sol"],
  ["הַשֵּׁנִ֑י", "o-segundo"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch T (palavras 1901-2000) ===`);
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

console.log(`\n=== AT Freq5-9 Batch T Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

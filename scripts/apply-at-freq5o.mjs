#!/usr/bin/env node
/**
 * Batch AT Translation - Freq5-9 Batch O (palavras 1401-1500)
 * Aplica traduções literais para palavras hebraicas freq 5-9 no AT (parte O)
 * Palavras 1401-1500 da lista de frequência 5-9
 * Usa abordagem baseada em arquivo SQL para evitar problemas de encoding no shell
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const tmpFile = join(tmpdir(), `at-freq5o-${Date.now()}.sql`);

const translations = [
  // === Palavras hebraicas freq=5-9, índices 1401-1500 (100 palavras) ===

  ["שֶׁ֥קֶר", "mentira"],
  ["שֶׁ֖קֶר", "mentira"],
  ["שִׁמְשׁוֹן֙", "Shimshon"],
  ["שִׁמְשׁ֑וֹן", "Shimshon"],
  ["שִׁמְךָ֖", "teu-nome"],
  ["שִׁכְבַת־", "emissao-de"],
  ["שִׁ֤ירוּ", "cantai"],
  ["שְׁתֵּ֣ים", "duas"],
  ["שְׁפָךְ־", "derramamento-de"],
  ["שְׁנַ֥ת", "sono-de"],
  ["שְׁנֵים־", "dois"],
  ["שְׁמוֹנָ֥ה", "oito"],
  ["שְׁמִ֣י", "meu-nome"],
  ["שְׁמִ֔י", "meu-nome"],
  ["שְׁמִ֑י", "meu-nome"],
  ["שְׁמ֣וֹת", "nomes"],
  ["שְׁלֹשָׁ֨ה", "tres"],
  ["שְׁלֹשָׁ֑ה", "tres"],
  ["שְׁלֹמֹ֣ה", "Shelomoh"],
  ["שְׁלֹמֹ֖ה", "Shelomoh"],
  ["שְׁלֹ֥שֶׁת", "tres-de"],
  ["שְׁל֣וֹם", "paz"],
  ["שְׁכֶ֖ם", "Shekhem"],
  ["שְׁכֶ֔ם", "Shekhem"],
  ["שְׁאַל־", "pergunta"],
  ["שׁ֥וּב", "retorna"],
  ["רוּחִי֙", "meu-espirito"],
  ["רוּחִ֑י", "meu-espirito"],
  ["רָשָׁ֗ע", "impio"],
  ["רָעִ֑ים", "maus"],
  ["רָע֣וֹת", "males"],
  ["רָחֵ֖ל", "Rahel"],
  ["רָאשֵׁי֙", "chefes-de"],
  ["רָאשֵׁ֣י", "chefes-de"],
  ["רָאשִׁ֑ים", "chefes"],
  ["רָא֖וּ", "viram"],
  ["רָ֭עָה", "mal"],
  ["רַגְלָ֑יו", "seus-pes"],
  ["רַגְלִ֑י", "meus-pes"],
  ["רַבִּ֑ים", "muitos"],
  ["רַבּ֖וֹת", "muitas"],
  ["רְשָׁעִ֥ים", "impios"],
  ["רְשָׁעִ֑ים", "impios"],
  ["רְחַבְעָם֙", "Rehavam"],
  ["קֹ֣דֶשׁ", "santidade"],
  ["קֹ֛דֶשׁ", "santidade"],
  ["קֹ֙דֶשׁ֙", "santidade"],
  ["קֹ֑רַח", "Qorah"],
  ["קָדִ֛ימָה", "para-o-oriente"],
  ["קָדִ֑ים", "oriental"],
  ["קָדְשֽׁוֹ׃", "sua-santidade"],
  ["קָדְשֶׁ֑ךָ", "tua-santidade"],
  ["קַ֥ח", "toma"],
  ["קֶ֣רֶן", "chifre"],
  ["קֳבֵ֗ל", "diante-de"],
  ["צָרָ֑ה", "angustia"],
  ["צָפ֔וֹנָה", "para-o-norte"],
  ["צַדִּיקִ֥ים", "justos"],
  ["צַדִּיקִ֑ים", "justos"],
  ["צַדִּיק֙", "justo"],
  ["צַדִּ֔יק", "justo"],
  ["צֶ֔דֶק", "justica"],
  ["צִנָּ֖ה", "escudo-grande"],
  ["צִוָּ֧ה", "ordenou"],
  ["צְבָאוֹת֒", "exercitos"],
  ["פָּרִ֧ים", "novilhos"],
  ["פָּרִ֥ים", "novilhos"],
  ["פָּנָיו֙", "sua-face"],
  ["פָּנֶ֔יךָ", "tua-face"],
  ["פַּרְעֹ֔ה", "Paroh"],
  ["פַּלְגֵי־", "ribeiros-de"],
  ["פַּ֣ר", "novilho"],
  ["פַּ֣חַד", "temor"],
  ["פֶּ֚תַח", "entrada"],
  ["פִּתְאֹ֑ם", "subitamente"],
  ["פִּ֤י", "minha-boca"],
  ["פְּרִ֣י", "fruto"],
  ["פְּע֑וֹר", "Peor"],
  ["פְּלִשְׁתִּ֔ים", "filisteus"],
  ["פְנֵי־", "face-de"],
  ["עוֹלָם֙", "eternidade"],
  ["עוֹלָ֗ם", "eternidade"],
  ["עוֹלָ֑ם", "eternidade"],
  ["עֹל֣וֹת", "holocaustos"],
  ["עָשִׂ֙יתִי֙", "fiz"],
  ["עָשִׂ֖יתָ", "fizeste"],
  ["עָשׂ֤וּ", "fizeram"],
  ["עָמָ֣ל", "labuta"],
  ["עָמ֔וֹס", "Amos"],
  ["עָלַ֜יִךְ", "sobre-ti"],
  ["עָלֶ֤יהָ", "sobre-ela"],
  ["עָלֶ֣יךָ", "sobre-ti"],
  ["עָלֶ֛יךָ", "sobre-ti"],
  ["עָבְר֣וּ", "passaram"],
  ["עָֽשׂוּ־", "fizeram"],
  ["עָ֑ז", "forte"],
  ["עָ֑וֶל", "iniquidade"],
  ["עַתָּ֞ה", "agora"],
  ["עַתָּ֖ה", "agora"],
  ["עַמּוּדֵ֣י", "colunas-de"],
];

let success = 0;
let errors = 0;
let totalUpdated = 0;

console.log(`\n=== Tradução AT - Freq5-9 Batch O (palavras 1401-1500) ===`);
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

console.log(`\n=== AT Freq5-9 Batch O Completo ===`);
console.log(`Sucesso: ${success}/${translations.length}`);
console.log(`Erros: ${errors}`);
console.log(`Tokens atualizados: ${totalUpdated}`);
console.log(`Fim: ${new Date().toLocaleString('pt-BR')}\n`);

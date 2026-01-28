#!/usr/bin/env node
/**
 * Script para traduzir palavras frequentes diretamente do banco de dados
 * Evita problemas de normalização Unicode
 */

import { execSync } from 'child_process';

// Mapa de traduções (a chave é o hex da palavra, valor é a tradução)
const translations = {
  // Hebraico frequente
  "assim": ["כֹּֽה־", "כֹּ֥ה", "כֹּ֚ה", "כֹּה־", "כֹּ֣ה ׀", "כֵּ֤ן"],
  "o-rei": ["הַמֶּ֔לֶךְ", "הַמֶּ֙לֶךְ֙", "הַמֶּ֑לֶךְ", "הַמֶּ֣לֶךְ", "הַמֶּ֖לֶךְ"],
  "filhos-de": ["בְּנֵֽי־", "בְּנֵי־"],
  "este": ["הַזֶּ֔ה", "הַזֶּ֑ה", "הַזֶּה֙", "הַזֶּ֖ה"],
  "família-de": ["מִשְׁפַּ֖חַת"],
  "Saul": ["שָׁאוּל֙", "שָׁא֔וּל"],
  "não": ["בַּל־"],
  "e-acamparam": ["וַֽיַּחֲנ֖וּ"],
  "Jerusalém": ["יְרוּשָׁלָ֑͏ִם", "יְרוּשָׁלַ֖͏ִם"],
  "e-partiram": ["וַיִּסְע֖וּ"],
  "na-terra": ["בְּאֶ֣רֶץ"],
  "e-falou": ["וַיְדַבֵּ֥ר"],
  "em-Jerusalém": ["בִּירוּשָׁלָ֑͏ִם"],
  "e-reinou": ["וַיִּמְלֹ֛ךְ"],
  "palavra-de": ["דְּבַר־"],
  "filha-de": ["בַּת־"],
  "ano": ["שָׁנָ֔ה", "שָׁנָ֖ה"],
  "ímpios": ["רְשָׁעִ֣ים"],
  "Babilônia": ["בָּבֶ֔ל"],
  "escritos": ["כְּתוּבִ֗ים"],
  "esta": ["הַזֹּ֔את", "הַזֹּ֑את"],
  "palavras-de": ["דִּבְרֵ֥י"],
  "aos-olhos-de": ["בְּעֵינֵ֣י"],
  "como": ["כַּאֲשֶׁ֥ר", "כַּאֲשֶׁ֛ר"],
  "a-santidade": ["הַקֹּ֑דֶשׁ"],
  "minha-alma": ["נַפְשִׁ֑י"],
  "Davi": ["דָּוִיד֙"],
  "boca-de": ["פִּ֣י"],
  "e-que": ["וַאֲשֶׁ֥ר"],
  "estes": ["הָאֵ֑לֶּה"],
  "no-dia": ["בַּיּ֣וֹם"],
  "pela-mão-de": ["בְּיַד־"],
  // Grego frequente
  "nesta": ["ταύτῃ"],
  "comer": ["φαγεῖν"],
  "semente": ["σπέρμα"],
  "pais": ["πατέρες"],
  "eternidade": ["αἰῶνος"],
  "caminho": ["ὁδῷ"],
  "sete": ["ἑπτὰ"],
  "promessa": ["ἐπαγγελίας"],
  "ouvi": ["שִׁמְעוּ־"],
  "ordenou": ["צִוָּ֥ה"],
  "e-disseram": ["וַיֹּ֣אמְר֔וּ"],
  "as-nações": ["הַגּוֹיִ֑ם"],
  "seus-filhos": ["בָּנָ֥יו"],
  "no-deserto": ["בַּמִּדְבָּ֑ר"],
  "Arã": ["אֲרָ֔ם"],
  "corpo": ["σώματι"],
  "rosto": ["πρόσωπον"],
  "profetas": ["προφητῶν"],
  "além": ["πέραν"],
  "uma": ["μίαν"],
  "tempo": ["καιρῷ"],
  "evangelho": ["εὐαγγελίου"],
  "vi": ["εἶδον"],
  "entrar": ["εἰσελθεῖν"],
  "glória": ["δόξῃ"],
  "prata": ["כֶּ֣סֶף"],
  "Canaã": ["כְּנָ֑עַן"],
  "o-sacerdote": ["הַכֹּהֵ֔ן"],
  "tu": ["אַתָּ֣ה"]
};

function runD1(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}" --json`;
  try {
    execSync(cmd, {
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return true;
  } catch (e) {
    return false;
  }
}

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║      BATCH TRANSLATE DB - BÍBLIA BELÉM An.C 2025                 ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log();

let updated = 0;
let errors = 0;

for (const [translation, words] of Object.entries(translations)) {
  for (const word of words) {
    const escapedWord = word.replace(/'/g, "''");
    const escapedTrans = translation.replace(/'/g, "''");
    const sql = `UPDATE tokens SET pt_literal = '${escapedTrans}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE '[%]'`;

    if (runD1(sql)) {
      updated++;
      process.stdout.write('.');
    } else {
      errors++;
      process.stdout.write('!');
    }
  }
}

console.log();
console.log();
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`✅ Palavras atualizadas: ${updated}`);
console.log(`❌ Erros: ${errors}`);
console.log('═══════════════════════════════════════════════════════════════════');

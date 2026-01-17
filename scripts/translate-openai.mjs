#!/usr/bin/env node
/**
 * Aplicador de Glossário - Bíblia Belém An.C 2025
 * Aplica o glossário expandido aos tokens não traduzidos
 *
 * Uso: node scripts/translate-openai.mjs [BOOK_CODE]
 * Exemplo: node scripts/translate-openai.mjs REV
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuração
const BOOK_CODE = process.argv[2];
const BATCH_SIZE = 50; // Tokens por batch para OpenAI
const DELAY_MS = 1000; // Delay entre chamadas API

if (!BOOK_CODE) {
  console.error('❌ Uso: node scripts/translate-openai.mjs BOOK_CODE');
  console.error('   Exemplo: node scripts/translate-openai.mjs REV');
  process.exit(1);
}

// Carregar glossários
const greekGlossaryPath = join(projectRoot, 'glossary', 'greek.json');
const hebrewGlossaryPath = join(projectRoot, 'glossary', 'hebrew.json');
const keepOriginalPath = join(projectRoot, 'glossary', 'keep_original.json');

let greekGlossary = existsSync(greekGlossaryPath)
  ? JSON.parse(readFileSync(greekGlossaryPath, 'utf-8'))
  : {};

let hebrewGlossary = existsSync(hebrewGlossaryPath)
  ? JSON.parse(readFileSync(hebrewGlossaryPath, 'utf-8'))
  : {};

const keepOriginal = existsSync(keepOriginalPath)
  ? new Set(JSON.parse(readFileSync(keepOriginalPath, 'utf-8')).all_words || [])
  : new Set([
    'Θεός', 'Θεοῦ', 'Θεόν', 'Θεῷ', 'θεός', 'θεοῦ', 'θεόν', 'θεῷ',
    'Ἰησοῦς', 'Ἰησοῦ', 'Ἰησοῦν',
    'Χριστός', 'Χριστοῦ', 'Χριστόν', 'Χριστῷ',
    'יהוה', 'אֱלֹהִים', 'אֵל'
  ]);

// API Key OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY não definida no .env');
  process.exit(1);
}

// Estatísticas
const stats = {
  total: 0,
  fromGlossary: 0,
  fromOpenAI: 0,
  keptOriginal: 0,
  failed: 0
};

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║       TRADUTOR OpenAI GPT-4 - BÍBLIA BELÉM An.C 2025             ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log();
console.log(`📚 Glossário Grego: ${Object.keys(greekGlossary).length} entradas`);
console.log(`📚 Glossário Hebraico: ${Object.keys(hebrewGlossary).length} entradas`);
console.log(`🔒 Manter original: ${keepOriginal.size} palavras`);
console.log(`🤖 OpenAI API: Configurada`);
console.log();

/**
 * Executar query no D1
 */
function executeD1(query) {
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  const result = execSync(
    `npx wrangler d1 execute biblia-belem --remote --command "${cleanQuery.replace(/"/g, '\\"')}" --json`,
    { cwd: projectRoot, encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
  );
  return JSON.parse(result)[0].results;
}

/**
 * Traduzir palavra usando glossário
 */
function translateFromGlossary(word, script) {
  const cleanWord = word.replace(/[.,;:·()]/g, '').trim();

  if (keepOriginal.has(cleanWord)) {
    return { translation: cleanWord, source: 'keep_original' };
  }

  const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;

  if (glossary[cleanWord]) {
    return {
      translation: glossary[cleanWord].translation || glossary[cleanWord],
      source: 'glossary'
    };
  }

  const variations = [
    cleanWord.toLowerCase(),
    cleanWord.toUpperCase(),
    cleanWord.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  ];

  for (const variant of variations) {
    if (glossary[variant]) {
      return {
        translation: glossary[variant].translation || glossary[variant],
        source: 'glossary'
      };
    }
  }

  return null;
}

/**
 * Traduzir batch de palavras usando OpenAI
 */
async function translateWithOpenAI(words, script) {
  const language = script === 'GRC' ? 'grego koiné' : 'hebraico bíblico';

  const systemPrompt = `Você é um tradutor especialista em ${language} bíblico para português brasileiro.

REGRAS ESTRITAS:
1. Tradução LITERAL e RÍGIDA - mantenha a estrutura gramatical original
2. Use hífens para palavras compostas (ex: "em-o" não "no", "de-a" não "da")
3. Mantenha artigos separados (o, a, os, as)
4. NÃO traduza nomes próprios de Deus (Θεός, יהוה, אֱלֹהִים) - mantenha no original
5. Mantenha a ordem das palavras do original quando possível
6. Responda APENAS com JSON válido, sem markdown, sem explicações`;

  const userPrompt = `Traduza cada palavra ${language} para português literal.

Palavras para traduzir:
${JSON.stringify(words, null, 2)}

Responda em JSON com formato:
{
  "palavra_original": "tradução_literal",
  ...
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro OpenAI:', response.status, JSON.stringify(error));
      return {};
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON da resposta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};
  } catch (error) {
    console.error('Erro na chamada OpenAI:', error.message);
    return {};
  }
}

/**
 * Executar update com retry
 */
function executeD1Update(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      executeD1(query);
      return true;
    } catch (e) {
      if (i === retries - 1) {
        console.error(`\n⚠️  Falha no update após ${retries} tentativas`);
        return false;
      }
      // Aguardar antes de retry
      execSync('timeout /t 1 /nobreak > nul 2>&1 || sleep 1', { encoding: 'utf-8' });
    }
  }
  return false;
}

/**
 * Processar um livro
 */
async function processBook(bookCode) {
  console.log(`\n📖 Processando ${bookCode}...`);

  // Buscar tokens não traduzidos (que têm [palavra] no pt_literal)
  const tokens = executeD1(`
    SELECT t.id, t.text_utf8, t.script, t.pt_literal
    FROM tokens t
    JOIN verses v ON t.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE b.code = '${bookCode}'
    AND t.pt_literal LIKE '[%]'
    ORDER BY t.id
    LIMIT 1000
  `);

  if (!tokens.length) {
    console.log('  ✅ Nenhum token para traduzir');
    return;
  }

  console.log(`  📝 ${tokens.length} tokens para traduzir`);

  // Agrupar por script
  const byScript = {};
  for (const token of tokens) {
    if (!byScript[token.script]) byScript[token.script] = [];
    byScript[token.script].push(token);
  }

  for (const [script, scriptTokens] of Object.entries(byScript)) {
    console.log(`  🔤 ${script}: ${scriptTokens.length} tokens`);

    // Primeiro: tentar glossário
    const needsAI = [];
    const glossaryUpdates = [];

    for (const token of scriptTokens) {
      const word = token.text_utf8;
      const glossaryResult = translateFromGlossary(word, script);

      if (glossaryResult) {
        const translation = glossaryResult.translation.replace(/'/g, "''");
        glossaryUpdates.push({ id: token.id, translation, source: glossaryResult.source });
      } else {
        needsAI.push(token);
      }
    }

    // Aplicar updates do glossário em batches
    console.log(`  📚 ${glossaryUpdates.length} do glossário, ${needsAI.length} precisam de IA`);

    for (let i = 0; i < glossaryUpdates.length; i++) {
      const upd = glossaryUpdates[i];
      if (executeD1Update(`UPDATE tokens SET pt_literal = '${upd.translation}' WHERE id = ${upd.id}`)) {
        if (upd.source === 'keep_original') {
          stats.keptOriginal++;
        } else {
          stats.fromGlossary++;
        }
        stats.total++;
        process.stdout.write('.');
      } else {
        needsAI.push(token);
      }
    }

    // Segundo: chamar OpenAI para os que faltam
    if (needsAI.length > 0) {
      console.log(`\n  🤖 Chamando OpenAI para ${needsAI.length} palavras...`);

      // Processar em batches
      for (let i = 0; i < needsAI.length; i += BATCH_SIZE) {
        const batch = needsAI.slice(i, i + BATCH_SIZE);
        const words = [...new Set(batch.map(t => t.text_utf8))];

        console.log(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${words.length} palavras únicas`);

        const translations = await translateWithOpenAI(words, script);

        // Aplicar traduções
        for (const token of batch) {
          const word = token.text_utf8;
          const translation = translations[word];

          if (translation) {
            const safeTrans = translation.replace(/'/g, "''");
            executeD1(`UPDATE tokens SET pt_literal = '${safeTrans}' WHERE id = ${token.id}`);
            stats.fromOpenAI++;
            process.stdout.write('+');

            // Adicionar ao glossário local
            const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;
            if (!glossary[word]) {
              glossary[word] = { translation, source: 'openai' };
            }
          } else {
            stats.failed++;
            process.stdout.write('?');
          }
          stats.total++;
        }

        // Delay entre batches
        await new Promise(r => setTimeout(r, DELAY_MS));
      }

      // Salvar glossário atualizado
      const glossaryPath = script === 'GRC' ? greekGlossaryPath : hebrewGlossaryPath;
      const glossary = script === 'GRC' ? greekGlossary : hebrewGlossary;
      writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2), 'utf-8');
      console.log(`\n  💾 Glossário atualizado: ${glossaryPath}`);
    }
  }
}

// Main
async function main() {
  try {
    await processBook(BOOK_CODE);

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('RESULTADO FINAL');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`  Total processado:  ${stats.total}`);
    console.log(`  Do glossário:      ${stats.fromGlossary}`);
    console.log(`  Do OpenAI:         ${stats.fromOpenAI}`);
    console.log(`  Mantido original:  ${stats.keptOriginal}`);
    console.log(`  Falhas:            ${stats.failed}`);
    console.log('═══════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

main();

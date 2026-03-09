#!/usr/bin/env node
/**
 * fix-untranslated-tokens.mjs
 * Bíblia Belém An.C 2025
 *
 * Corrige 24.496 tokens cujo pt_literal é "[texto_hebraico]" (hebraico entre colchetes)
 * em vez de uma tradução portuguesa real.
 *
 * Fases:
 *   1. Self-heal: copia tradução de tokens iguais já traduzidos no próprio banco
 *   2. Glossário: tenta casar com glossary/hebrew.json e glossary/greek.json
 *   3. Claude API: traduz os restantes em batches via Claude
 *   4. Rebuild: regenera verse_translations.literal_pt a partir dos tokens atualizados
 *
 * Uso:
 *   node scripts/fix-untranslated-tokens.mjs                # Executa todas as fases
 *   node scripts/fix-untranslated-tokens.mjs --phase 1      # Só self-heal
 *   node scripts/fix-untranslated-tokens.mjs --phase 2      # Só glossário
 *   node scripts/fix-untranslated-tokens.mjs --phase 3      # Só Claude API
 *   node scripts/fix-untranslated-tokens.mjs --phase 4      # Só rebuild verse_translations
 *   node scripts/fix-untranslated-tokens.mjs --dry-run      # Simula sem alterar o banco
 *   node scripts/fix-untranslated-tokens.mjs --book PSA     # Filtra por livro
 */

import { execSync, execFileSync } from 'child_process';
import { readFileSync, writeFileSync as writeTmpFile } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ─── CLI args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const phaseIdx = args.indexOf('--phase');
const PHASE = phaseIdx >= 0 ? parseInt(args[phaseIdx + 1]) : 0; // 0 = all
const bookIdx = args.indexOf('--book');
const BOOK_FILTER = bookIdx >= 0 ? args[bookIdx + 1].toUpperCase() : null;

// ─── D1 helpers ─────────────────────────────────────────────────────────────
// Windows: --command com double-quotes para SELECTs, --file para UPDATEs
const TMP_SQL = join(tmpdir(), 'biblia-d1-query.sql');

/**
 * Executa wrangler via node diretamente (evita problemas de quoting do shell Windows)
 */
const WRANGLER_JS = join(PROJECT_ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

function wranglerExec(args) {
  return execFileSync(process.execPath, [WRANGLER_JS, ...args], {
    encoding: 'utf-8',
    maxBuffer: 100 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: PROJECT_ROOT,
  });
}

/**
 * Executa SELECT e retorna results[]
 */
function runD1(sql) {
  const query = sql.replace(/\s+/g, ' ').trim();
  try {
    const out = wranglerExec(['d1', 'execute', 'biblia-belem', '--remote', '--command', query, '--json']);
    const parsed = JSON.parse(out);
    return parsed[0]?.results || [];
  } catch (e) {
    console.error('D1 query error:', e.stderr?.slice(0, 500) || e.message);
    return null;
  }
}

/**
 * Executa UPDATE/INSERT (usa --file para evitar quoting de valores Hebrew)
 */
function runD1Exec(sql) {
  writeTmpFile(TMP_SQL, sql, 'utf-8');
  try {
    wranglerExec(['d1', 'execute', 'biblia-belem', '--remote', '--file', TMP_SQL]);
    return true;
  } catch (e) {
    console.error('D1 exec error:', e.stderr?.slice(0, 300) || e.message);
    return false;
  }
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

/** Verifica se uma "tradução" é realmente portuguesa (não hebraico/grego disfarçado) */
function isValidTranslation(text) {
  if (!text) return false;
  // Reject if it's mainly Hebrew (U+0590-U+05FF) or Greek (U+0370-U+03FF)
  const hebrewGreek = text.match(/[\u0370-\u03FF\u0590-\u05FF]/g);
  const latin = text.match(/[a-zA-ZÀ-ÿ]/g);
  if (!latin || latin.length === 0) return false;
  if (hebrewGreek && hebrewGreek.length > latin.length) return false;
  return true;
}

// ─── Stats ──────────────────────────────────────────────────────────────────
function printStats() {
  const total = runD1('SELECT COUNT(*) as n FROM tokens WHERE pt_literal LIKE "[%]"');
  const unique = runD1('SELECT COUNT(DISTINCT text_utf8) as n FROM tokens WHERE pt_literal LIKE "[%]"');
  console.log(`\n📊 Tokens não traduzidos: ${total?.[0]?.n || '?'} (${unique?.[0]?.n || '?'} palavras únicas)\n`);
}

// ─── Phase 1: Self-heal from DB ─────────────────────────────────────────────
async function phase1() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FASE 1: Self-heal — copiar traduções do próprio banco');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // UPDATE por livro (batched) — evita exceder CPU limit do D1
  const bookFilter = BOOK_FILTER ? [BOOK_FILTER] : null;

  // Listar livros com tokens não traduzidos
  const books = BOOK_FILTER
    ? [{ code: BOOK_FILTER }]
    : runD1(`SELECT DISTINCT b.code FROM books b JOIN verses v ON v.book_id = b.id JOIN tokens t ON t.verse_id = v.id WHERE t.pt_literal LIKE '[%]' ORDER BY b.canon_order`);

  if (!books || books.length === 0) {
    console.log('Nenhum livro com tokens não traduzidos.\n');
    return 0;
  }

  console.log(`Livros afetados: ${books.length}\n`);

  let totalUpdated = 0;

  for (const book of books) {
    const sql = `UPDATE tokens
SET pt_literal = (
  SELECT t2.pt_literal FROM tokens t2
  WHERE t2.text_utf8 = tokens.text_utf8
    AND t2.pt_literal NOT LIKE '[%]'
    AND t2.pt_literal IS NOT NULL
    AND t2.pt_literal != ''
  ORDER BY t2.id LIMIT 1
)
WHERE pt_literal LIKE '[%]'
  AND verse_id IN (SELECT id FROM verses WHERE book_id = (SELECT id FROM books WHERE code = '${book.code}'))
  AND text_utf8 IN (
    SELECT DISTINCT t3.text_utf8 FROM tokens t3
    WHERE t3.pt_literal NOT LIKE '[%]' AND t3.pt_literal IS NOT NULL AND t3.pt_literal != ''
  )`;

    if (DRY_RUN) {
      console.log(`  [DRY] ${book.code}: UPDATE via self-heal`);
      totalUpdated++;
      continue;
    }

    process.stdout.write(`  ${book.code}... `);

    if (runD1Exec(sql)) {
      const remaining = runD1(`SELECT COUNT(*) as n FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE t.pt_literal LIKE '[%]' AND b.code = '${book.code}'`);
      const left = remaining?.[0]?.n || '?';
      console.log(`✓ (${left} restantes)`);
      totalUpdated++;
    } else {
      console.log('✗ erro');
    }

    // Pausa entre livros para não sobrecarregar D1
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Resultado final
  const finalCount = runD1(`SELECT COUNT(*) as n FROM tokens WHERE pt_literal LIKE '[%]'`);
  const after = finalCount?.[0]?.n || '?';
  console.log(`\n✅ Fase 1: ${books.length} livros processados (${after} tokens não traduzidos restantes)\n`);
  return totalUpdated;
}

// ─── Phase 2: Glossary matching ─────────────────────────────────────────────
async function phase2() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FASE 2: Glossário — casar com hebrew.json / greek.json');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Load glossaries
  let hebrewGloss = {};
  let greekGloss = {};

  try {
    const hebRaw = readFileSync(join(PROJECT_ROOT, 'glossary', 'hebrew.json'), 'utf-8');
    hebrewGloss = JSON.parse(hebRaw);
    console.log(`📖 Glossário hebraico: ${Object.keys(hebrewGloss).length} entradas`);
  } catch {
    console.log('⚠️  glossary/hebrew.json não encontrado, pulando hebraico.');
  }

  try {
    const grkRaw = readFileSync(join(PROJECT_ROOT, 'glossary', 'greek.json'), 'utf-8');
    greekGloss = JSON.parse(grkRaw);
    console.log(`📖 Glossário grego: ${Object.keys(greekGloss).length} entradas`);
  } catch {
    console.log('⚠️  glossary/greek.json não encontrado, pulando grego.');
  }

  // Build lookup: normalized form → translation
  const lookup = new Map();

  for (const [word, entry] of Object.entries(hebrewGloss)) {
    const translation = entry?.translation || entry?.pt || entry;
    if (typeof translation === 'string' && translation) {
      lookup.set(word, translation);
      // Also strip niqqud for fuzzy matching
      const stripped = word.replace(/[\u0591-\u05C7]/g, '');
      if (!lookup.has(stripped)) lookup.set(stripped, translation);
    }
  }

  for (const [word, entry] of Object.entries(greekGloss)) {
    const translation = entry?.translation || entry?.pt || entry;
    if (typeof translation === 'string' && translation) {
      lookup.set(word, translation);
    }
  }

  console.log(`🔍 Lookup combinado: ${lookup.size} entradas\n`);

  // Get remaining untranslated tokens
  const bookFilter = BOOK_FILTER
    ? ` AND verse_id IN (SELECT id FROM verses WHERE book_id = (SELECT id FROM books WHERE code = '${BOOK_FILTER}'))`
    : '';

  const remaining = runD1(`
    SELECT DISTINCT text_utf8 FROM tokens
    WHERE pt_literal LIKE '[%]'${bookFilter}
  `);

  if (!remaining || remaining.length === 0) {
    console.log('Nenhum token restante para glossário.\n');
    return 0;
  }

  console.log(`Tokens únicos restantes: ${remaining.length}\n`);

  let updated = 0;
  let errors = 0;

  for (const row of remaining) {
    const word = row.text_utf8;
    // Try exact match
    let trans = lookup.get(word);
    // Try without niqqud/cantillation
    if (!trans) {
      const stripped = word.replace(/[\u0591-\u05C7]/g, '');
      trans = lookup.get(stripped);
    }
    // Try without final maqaf/sof-pasuq
    if (!trans) {
      const cleaned = word.replace(/[׃־]/g, '').replace(/[\u0591-\u05C7]/g, '');
      trans = lookup.get(cleaned);
    }

    if (!trans) continue;

    const escapedWord = escapeSql(word);
    const escapedTrans = escapeSql(trans);
    const sql = `UPDATE tokens SET pt_literal = '${escapedTrans}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE "[%]"${bookFilter}`;

    if (DRY_RUN) {
      console.log(`  [DRY] ${word} → ${trans}`);
      updated++;
    } else {
      if (runD1Exec(sql)) {
        updated++;
        process.stdout.write('.');
        if (updated % 50 === 0) process.stdout.write(` ${updated}\n`);
      } else {
        errors++;
        process.stdout.write('!');
      }
    }
  }

  console.log(`\n\n✅ Fase 2: ${updated} palavras atualizadas via glossário, ${errors} erros\n`);
  return updated;
}

// ─── Phase 3: Claude API translation ────────────────────────────────────────
async function phase3() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FASE 3: Claude API — traduzir tokens restantes');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('⚠️  ANTHROPIC_API_KEY não definida. Pulando fase 3.');
    console.log('   Defina: export ANTHROPIC_API_KEY=sk-ant-...');
    console.log('   Ou use: op read "op://A Culpa e das Ovelhas/Anthropic API/credential" | xargs -I {} env ANTHROPIC_API_KEY={} node scripts/fix-untranslated-tokens.mjs --phase 3\n');
    return 0;
  }

  const bookFilter = BOOK_FILTER
    ? ` AND verse_id IN (SELECT id FROM verses WHERE book_id = (SELECT id FROM books WHERE code = '${BOOK_FILTER}'))`
    : '';

  // Get remaining untranslated words with context
  const remaining = runD1(`
    SELECT text_utf8, COUNT(*) as cnt, script
    FROM tokens
    WHERE pt_literal LIKE '[%]'${bookFilter}
    GROUP BY text_utf8
    ORDER BY cnt DESC
  `);

  if (!remaining || remaining.length === 0) {
    console.log('Nenhum token restante para traduzir.\n');
    return 0;
  }

  console.log(`Palavras únicas restantes: ${remaining.length}\n`);

  // Batch in groups of 40
  const BATCH_SIZE = 40;
  let updated = 0;
  let errors = 0;
  let apiCalls = 0;

  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    const batch = remaining.slice(i, i + BATCH_SIZE);
    const words = batch.map((r) => r.text_utf8);
    const scripts = batch.map((r) => r.script || 'HE');
    const isHebrew = scripts[0] === 'HE' || scripts[0] === 'ARM';

    const wordList = words.map((w, j) => `${j + 1}. ${w} (${scripts[j]})`).join('\n');

    const prompt = `Traduza estas palavras ${isHebrew ? 'hebraicas/aramaicas' : 'gregas'} para português literal, seguindo o padrão da Bíblia Belém An.C 2025 (tradução literal rígida).

REGRAS:
- Tradução literal, palavra por palavra
- Use hífens para palavras compostas (ex: "em-terra-de", "filhos-de")
- Palavras keep_original: yhwh, Elohim, Eloah, El, Theos, Iesous, Christos, Adonai
- Se for forma construta (smixut), adicione "-de" no final
- Se for prefixo preposicional (ב=em, ל=para, מ=de, כ=como), inclua como prefixo com hífen
- Se for prefixo conjuntivo (ו=e), inclua como prefixo com hífen
- Se for artigo definido (ה), inclua como "o/a/os/as-" conforme o gênero

Responda APENAS no formato JSON: {"1": "tradução", "2": "tradução", ...}

Palavras:
${wordList}`;

    if (DRY_RUN) {
      console.log(`  [DRY] Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${words.length} palavras`);
      updated += words.length;
      continue;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      apiCalls++;
      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`\n  Batch ${Math.floor(i / BATCH_SIZE) + 1}: resposta sem JSON`);
        errors += words.length;
        continue;
      }

      const translations = JSON.parse(jsonMatch[0]);

      for (let j = 0; j < words.length; j++) {
        const trans = translations[String(j + 1)];
        if (!trans) {
          errors++;
          continue;
        }

        const escapedWord = escapeSql(words[j]);
        const escapedTrans = escapeSql(trans);
        const sql = `UPDATE tokens SET pt_literal = '${escapedTrans}' WHERE text_utf8 = '${escapedWord}' AND pt_literal LIKE "[%]"`;

        if (runD1Exec(sql)) {
          updated++;
        } else {
          errors++;
        }
      }

      process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(remaining.length / BATCH_SIZE)} ✓ (${updated} ok, ${errors} err)\n`);

      // Rate limit: wait 500ms between batches
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      console.error(`\n  Batch ${Math.floor(i / BATCH_SIZE) + 1}: erro API — ${e.message}`);
      errors += words.length;
    }
  }

  console.log(`\n✅ Fase 3: ${updated} tokens traduzidos, ${errors} erros, ${apiCalls} chamadas API\n`);
  return updated;
}

// ─── Phase 4: Rebuild verse_translations ────────────────────────────────────
async function phase4() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  FASE 4: Rebuild verse_translations.literal_pt');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Per-book batching to avoid D1 CPU limits
  const books = BOOK_FILTER
    ? [{ code: BOOK_FILTER }]
    : runD1('SELECT code FROM books ORDER BY canon_order');

  if (!books || books.length === 0) {
    console.log('Nenhum livro encontrado.\n');
    return 0;
  }

  if (DRY_RUN) {
    console.log(`  [DRY] Rebuild verse_translations.literal_pt para ${books.length} livros`);
    return 0;
  }

  console.log(`Atualizando verse_translations.literal_pt (${books.length} livros)...\n`);

  let success = 0;
  let errors = 0;

  for (const book of books) {
    const sql = `UPDATE verse_translations
SET literal_pt = (
  SELECT GROUP_CONCAT(t.pt_literal, ' ')
  FROM tokens t
  WHERE t.verse_id = verse_translations.verse_id
  ORDER BY t.position
),
updated_at = datetime('now')
WHERE verse_id IN (
  SELECT v.id FROM verses v
  WHERE v.book_id = (SELECT id FROM books WHERE code = '${book.code}')
)`;

    process.stdout.write(`  ${book.code}... `);

    if (runD1Exec(sql)) {
      console.log('✓');
      success++;
    } else {
      console.log('✗ erro');
      errors++;
    }

    // Pausa entre livros para não sobrecarregar D1
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\n✅ Fase 4: ${success} livros atualizados, ${errors} erros.\n`);
  return success;
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   FIX UNTRANSLATED TOKENS — Bíblia Belém An.C 2025          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  if (DRY_RUN) console.log('\n🔍 MODO DRY-RUN — nenhuma alteração será feita\n');
  if (BOOK_FILTER) console.log(`📖 Filtro: apenas livro ${BOOK_FILTER}\n`);

  printStats();

  if (PHASE === 0 || PHASE === 1) await phase1();
  if (PHASE === 0 || PHASE === 2) await phase2();
  if (PHASE === 0 || PHASE === 3) await phase3();
  if (PHASE === 0 || PHASE === 4) await phase4();

  printStats();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Concluído!');
  console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(console.error);

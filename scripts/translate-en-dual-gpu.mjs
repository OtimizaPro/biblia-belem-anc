#!/usr/bin/env node
/**
 * English Translation — Dual GPU Pipeline
 * Bíblia Belém An.C 2025
 *
 * Translates directly from original codices (Greek/Hebrew) to English.
 * NOT from Portuguese — direct codex → English literal rigid translation.
 *
 * Usage:
 *   node scripts/translate-en-dual-gpu.mjs --book=REV    # Revelation only
 *   node scripts/translate-en-dual-gpu.mjs --book=DES    # Same (alias)
 *   node scripts/translate-en-dual-gpu.mjs               # All books
 *   node scripts/translate-en-dual-gpu.mjs --testament=NT
 *
 * Pre-req: Dual Ollama running (ports 11434 + 11435)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

// Single-GPU mode: both point to 11434 (default Ollama)
// For dual-GPU: start second instance on 11435 via start-dual-ollama.ps1
const GPU = [
  { id: 0, url: 'http://localhost:11434', label: 'GPU-0 (RTX 5060 Ti)' },
  { id: 1, url: 'http://localhost:11434', label: 'GPU-0 (fallback same)' },
];

const MODEL = 'qwen3:14b';
const BATCH_SIZE = 10;
const TEMPERATURE = 0.1;
const NUM_CTX = 2048;
const TIMEOUT_MS = 600000;
const RETRY_MAX = 5;
const RETRY_DELAY = 3000;
const BATCH_DELAY = 300;
const D1_BATCH = 50;

// Words that must NOT be translated — preserved in original form
const KEEP_ORIGINAL = {
  'yhwh': 'yhwh', 'Yhwh': 'yhwh',
  'Θεός': 'Theos', 'Θεοῦ': 'Theou', 'Θεόν': 'Theon', 'Θεῷ': 'Theo',
  'Θεέ': 'Thee', 'θεός': 'Theos', 'θεοῦ': 'Theou', 'θεόν': 'Theon', 'θεῷ': 'Theo',
  'Ἰησοῦς': 'Iesous', 'Ἰησοῦ': 'Iesou', 'Ἰησοῦν': 'Iesoun',
  'Χριστός': 'Christos', 'Χριστοῦ': 'Christou', 'Χριστόν': 'Christon', 'Χριστῷ': 'Christo',
};

// Greek → English glossary for common words
const GLOSSARY = {
  'καί': 'and', 'ὁ': 'the', 'ἡ': 'the', 'τό': 'the', 'τοῦ': 'of-the',
  'τῷ': 'to-the', 'τήν': 'the', 'τόν': 'the', 'τῶν': 'of-the',
  'ἐν': 'in', 'εἰς': 'into', 'ἐκ': 'out-of', 'ἀπό': 'from',
  'ἐπί': 'upon', 'πρός': 'toward', 'διά': 'through', 'μετά': 'with',
  'ὑπό': 'under', 'περί': 'concerning', 'κατά': 'according-to',
  'αὐτός': 'he', 'αὐτοῦ': 'of-him', 'αὐτῷ': 'to-him', 'αὐτόν': 'him',
  'αὐτῆς': 'of-her', 'αὐτῇ': 'to-her', 'αὐτήν': 'her',
  'αὐτῶν': 'of-them', 'αὐτοῖς': 'to-them', 'αὐτούς': 'them',
  'ἐγώ': 'I', 'σύ': 'you', 'ἡμεῖς': 'we', 'ὑμεῖς': 'you(pl)',
  'μου': 'my', 'σου': 'your', 'ἡμῶν': 'our', 'ὑμῶν': 'your(pl)',
  'οὐ': 'not', 'οὐκ': 'not', 'μή': 'not', 'οὐδέ': 'neither',
  'ἐστι': 'is', 'ἐστιν': 'is', 'εἰμι': 'am', 'ἦν': 'was',
  'ἔχω': 'have', 'ἔχει': 'has', 'ἔχων': 'having',
  'λέγω': 'say', 'λέγει': 'says', 'εἶπεν': 'said', 'λέγων': 'saying',
  'γάρ': 'for', 'δέ': 'but', 'ἀλλά': 'but', 'ἤ': 'or',
  'ὅτι': 'that', 'ἵνα': 'so-that', 'ὡς': 'as', 'ὅς': 'who',
  'πᾶς': 'all', 'πᾶσα': 'all', 'πᾶν': 'all',
  'οὗτος': 'this', 'ἐκεῖνος': 'that', 'τίς': 'who?',
  'ἄγγελος': 'angelos', 'ἀγγέλῳ': 'to-angelos',
  'πνεῦμα': 'spirit', 'πνεύματος': 'of-spirit',
  'λόγος': 'logos', 'λόγον': 'logos', 'λόγου': 'of-logos',
  'ἀμήν': 'amen', 'ἁλληλουϊά': 'halleluyah',
  'ἀποκάλυψις': 'unveiling', 'Ἀποκάλυψις': 'Unveiling',
  'ἐκκλησία': 'assembly', 'ἐκκλησίᾳ': 'to-assembly',
  'βασιλεία': 'kingdom', 'βασιλείαν': 'kingdom',
  'δοῦλος': 'servant', 'δούλοις': 'to-servants',
  'ἅγιος': 'holy', 'ἁγίων': 'of-holy-ones',
  'ὕδωρ': 'water', 'αἷμα': 'blood', 'θάνατος': 'death',
  'ζωή': 'life', 'ζωῆς': 'of-life',
  'ἀγάπη': 'agape', 'πίστις': 'faith', 'ἐλπίς': 'hope',
  'ἁμαρτία': 'sin', 'ἁμαρτίαν': 'sin',
  'κόσμος': 'world', 'κόσμου': 'of-world',
  'ὄνομα': 'name', 'ὀνόματα': 'names',
  'βιβλίον': 'scroll', 'βιβλίου': 'of-scroll',
  'θρόνος': 'throne', 'θρόνου': 'of-throne', 'θρόνῳ': 'to-throne',
  'ἀρνίον': 'lamb', 'ἀρνίου': 'of-lamb',
  'σφραγῖδα': 'seal', 'σφραγῖδας': 'seals',
  'σάλπιγξ': 'trumpet',
  'δράκων': 'dragon', 'δράκοντος': 'of-dragon',
  'θηρίον': 'beast', 'θηρίου': 'of-beast',
  'πόλις': 'city', 'πόλεως': 'of-city',
  'ναός': 'temple', 'ναοῦ': 'of-temple',
  'οὐρανός': 'heaven', 'οὐρανοῦ': 'of-heaven', 'οὐρανῷ': 'in-heaven',
  'γῆ': 'earth', 'γῆς': 'of-earth',
  'θάλασσα': 'sea', 'θαλάσσης': 'of-sea',
};

// ═══════════════════════════════════════════════════════════════════
// ARGS
// ═══════════════════════════════════════════════════════════════════

let FILTER_BOOK = null;
let FILTER_TESTAMENT = null;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--book=')) {
    FILTER_BOOK = arg.split('=')[1].toUpperCase();
    if (FILTER_BOOK === 'DES') FILTER_BOOK = 'REV'; // alias
  }
  if (arg.startsWith('--testament=')) FILTER_TESTAMENT = arg.split('=')[1].toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// D1 HELPERS
// ═══════════════════════════════════════════════════════════════════

function d1Execute(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}"`;
  const result = execSync(cmd, { cwd: projectRoot, encoding: 'utf-8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  // Parse JSON array from wrangler output (may contain ANSI codes and warnings)
  const clean = result.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, ''); // strip ANSI
  const start = clean.indexOf('[');
  if (start === -1) return [];
  const end = clean.lastIndexOf(']');
  if (end === -1) return [];
  try {
    const parsed = JSON.parse(clean.substring(start, end + 1));
    return parsed[0]?.results || [];
  } catch { return []; }
}

function d1ExecuteFile(filePath) {
  execSync(`npx wrangler d1 execute biblia-belem --remote --file="${filePath}"`,
    { cwd: projectRoot, encoding: 'utf-8', timeout: 60000 });
}

// ═══════════════════════════════════════════════════════════════════
// OLLAMA CLIENT
// ═══════════════════════════════════════════════════════════════════

async function ollamaTranslate(gpu, words, script) {
  const lang = script === 'GRC' ? 'Koine Greek' : script === 'HE' ? 'Biblical Hebrew' : 'Biblical Aramaic';
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n');

  const examples = lang === 'Koine Greek'
    ? `EXAMPLES:
- ἀποκριθεὶς → having-answered
- ἐγέννησεν → begat
- βασιλεύς → king
- τὴν → the
- ἐκάλεσεν → called
- δικαιοσύνη → righteousness
- ὑπάγω → go-away
- σταυρωθῇ → be-crucified`
    : `EXAMPLES:
- וַיֹּאמֶר → and-he-said
- בְּרֵאשִׁית → in-beginning
- הַשָּׁמַיִם → the-heavens
- וְהָאָרֶץ → and-the-earth
- מֶלֶךְ → king
- בֶּן → son
- דָּבָר → word/matter`;

  const prompt = `Translate these ${lang} words to English. STRICT LITERAL — word by word, no smoothing.

RULES:
- Translate each word independently to its English equivalent
- Use hyphens for compound concepts: "in-the-beginning", "out-of"
- For verbs: include tense/voice marker when relevant: "having-said", "will-come"
- For nouns with case: show case: "of-son" (genitive), "to-house" (dative)
- NEVER return the original ${lang} word — always translate to English
- NEVER transliterate (no "auton", "legontos", "kai") — translate meaning
- These names stay as-is: yhwh, Elohim, Eloah, El, Adonai, Theos, Iesous, Christos
- "God/Lord" NEVER appear — use Theos/Elohim or yhwh/Adonai/Kyrios
- Proper names: transliterate to Latin alphabet (Abraam, Dauid, Petros)

${examples}

Translate:
${wordList}

Return ONLY a JSON object: {"1": "english", "2": "english", ...} /no_think`;

  try {
    // Use streaming to avoid undici headersTimeout (UND_ERR_HEADERS_TIMEOUT)
    const resp = await fetch(`${gpu.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: true,
        options: { temperature: TEMPERATURE, top_p: 0.9, num_ctx: NUM_CTX },
      }),
    });

    // Buffer streamed NDJSON chunks
    let text = '';
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    const deadline = Date.now() + TIMEOUT_MS;
    while (true) {
      if (Date.now() > deadline) throw new Error('Stream timeout');
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.response) text += obj.response;
        } catch {}
      }
    }

    // Strip <think>...</think> blocks (qwen3 thinking mode)
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // JSON parse failed, try arrow format fallback below
      }
    }

    // Fallback: parse "N. word → translation" or "N. translation" format
    const arrowResult = {};
    const lines = text.split('\n');
    for (const line of lines) {
      // Match: "1. word → translation" or "1. translation"
      const arrowMatch = line.match(/^\s*(\d+)\.\s*(.+?)\s*$/);
      if (arrowMatch) {
        const key = arrowMatch[1];
        let val = arrowMatch[2].trim();
        // Split on any arrow-like separator: →, ->, =>, :, —
        const arrowSplit = val.split(/\s*(?:\u2192|\u2794|\u27A1|->|=>|\u2014|:\s)\s*/);
        if (arrowSplit.length >= 2) {
          val = arrowSplit[arrowSplit.length - 1].trim();
        }
        // Remove any remaining Greek/Hebrew from parsed value (take last non-Greek word)
        if (/[\u0370-\u03FF\u1F00-\u1FFF\u0590-\u05FF]/.test(val)) {
          // Value still has original script chars — skip
          continue;
        }
        if (val) arrowResult[key] = val;
      }
    }
    if (Object.keys(arrowResult).length > 0) {
      console.log(`    📝 Parsed ${Object.keys(arrowResult).length} entries from text format`);
      // Debug first 3 entries
      const keys = Object.keys(arrowResult).slice(0, 3);
      keys.forEach(k => console.log(`      ${k}: "${arrowResult[k]}"`));
      return arrowResult;
    }

    console.log(`    [DEBUG] No parseable response (${text.length} chars): ${text.substring(0, 200)}`);
    return null;
  } catch (err) {
    console.log(`    [DEBUG] Fetch error: ${err.code || err.message}`);
    if (err.cause) console.log(`    [DEBUG] Cause: ${err.cause.code || err.cause.message || err.cause}`);
    clearTimeout(timer);
    return null;
  }
}

async function translateWithRetry(gpu, words, script) {
  for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
    const result = await ollamaTranslate(gpu, words, script);
    if (result) return result;
    console.log(`    Retry ${attempt}/${RETRY_MAX} on ${gpu.label}...`);
    await new Promise(r => setTimeout(r, RETRY_DELAY));
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// TRANSLATION PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function translateBook(bookCode, gpu) {
  console.log(`\n📖 ${bookCode} on ${gpu.label}`);

  // Get untranslated tokens for this book (single-line SQL for wrangler compat)
  let tokens = d1Execute(
    `SELECT t.id, t.text_utf8, t.normalized, t.script, t.position, v.chapter, v.verse FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.code = '${bookCode}' AND (t.en_literal IS NULL OR t.en_literal = '') ORDER BY v.chapter, v.verse, t.position LIMIT 25000`
  );

  if (tokens.length === 0 && bookCode === 'REV') {
    tokens = d1Execute(
      `SELECT t.id, t.text_utf8, t.normalized, t.script, t.position, v.chapter, v.verse FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.code = 'DES' AND (t.en_literal IS NULL OR t.en_literal = '') ORDER BY v.chapter, v.verse, t.position LIMIT 25000`
    );
  }

  console.log(`  Tokens to translate: ${tokens.length}`);
  if (tokens.length === 0) { console.log('  ✅ Already done'); return 0; }

  let translated = 0;
  let sqlBatch = [];

  // Process in batches
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const words = [];
    const batchTranslations = {};

    // First pass: apply glossary and keep_original
    for (const token of batch) {
      const utf8 = token.text_utf8;
      const norm = token.normalized;

      // Check keep_original
      if (KEEP_ORIGINAL[utf8]) {
        batchTranslations[token.id] = KEEP_ORIGINAL[utf8];
        continue;
      }

      // Check glossary
      if (GLOSSARY[utf8]) {
        batchTranslations[token.id] = GLOSSARY[utf8];
        continue;
      }
      if (GLOSSARY[norm]) {
        batchTranslations[token.id] = GLOSSARY[norm];
        continue;
      }

      // Need Ollama translation
      words.push({ id: token.id, word: utf8, script: token.script });
    }

    // Ollama batch for unknown words
    if (words.length > 0) {
      const wordTexts = words.map(w => w.word);
      const script = words[0].script;
      const result = await translateWithRetry(gpu, wordTexts, script);

      if (result) {
        let accepted = 0, rejected = 0;
        for (let j = 0; j < words.length; j++) {
          const key = String(j + 1);
          if (result[key]) {
            let trans = result[key].trim();
            // Validate: reject if still contains Greek or Hebrew chars
            if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(trans) || /[\u0590-\u05FF]/.test(trans)) {
              rejected++;
              continue;
            }
            // Validate: reject if equals original word
            if (trans === words[j].word) {
              rejected++;
              continue;
            }
            // Block forbidden words
            trans = trans.replace(/\bGod\b/gi, 'Theos');
            trans = trans.replace(/\bLord\b/gi, 'Kyrios');
            trans = trans.replace(/\bJesus\b/gi, 'Iesous');
            trans = trans.replace(/\bChrist\b/gi, 'Christos');
            batchTranslations[words[j].id] = trans;
            accepted++;
          }
        }
        if (rejected > 0) console.log(`    🔍 Validated: ${accepted}/${accepted + rejected} (${rejected} rejected)`);
      }
    }

    // Generate SQL updates
    for (const [id, translation] of Object.entries(batchTranslations)) {
      const safe = translation.replace(/'/g, "''");
      sqlBatch.push(`UPDATE tokens SET en_literal = '${safe}' WHERE id = ${id};`);
      translated++;
    }

    // Flush SQL batch
    if (sqlBatch.length >= D1_BATCH) {
      const sqlFile = join(projectRoot, `_en_batch_${gpu.id}.sql`);
      writeFileSync(sqlFile, sqlBatch.join('\n'), 'utf-8');
      try {
        d1ExecuteFile(sqlFile);
        console.log(`  ✏️  Flushed ${sqlBatch.length} updates (${translated}/${tokens.length})`);
      } catch (e) {
        console.log(`  ⚠️  Flush error, retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        try { d1ExecuteFile(sqlFile); } catch (e2) { console.log(`  ❌ Lost ${sqlBatch.length} updates`); }
      }
      sqlBatch = [];
    }

    // Show progress
    if ((i + BATCH_SIZE) % 100 === 0) {
      const ch = batch[0]?.chapter || '?';
      const vs = batch[0]?.verse || '?';
      console.log(`  📍 ${bookCode} ${ch}:${vs} — ${translated}/${tokens.length} (${(translated / tokens.length * 100).toFixed(1)}%)`);
    }

    await new Promise(r => setTimeout(r, BATCH_DELAY));
  }

  // Final flush
  if (sqlBatch.length > 0) {
    const sqlFile = join(projectRoot, `_en_batch_${gpu.id}.sql`);
    writeFileSync(sqlFile, sqlBatch.join('\n'), 'utf-8');
    try { d1ExecuteFile(sqlFile); } catch (e) { console.log(`  ⚠️  Final flush error`); }
  }

  console.log(`  ✅ ${bookCode}: ${translated} tokens translated to English`);
  return translated;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ENGLISH TRANSLATION — Dual GPU Pipeline');
  console.log('  Bíblia Belém An.C 2025');
  console.log('  Direct from original codices (Greek/Hebrew) → English');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check GPU health — use /api/tags (fast) then warm up model
  const availableGPUs = [];
  for (const gpu of GPU) {
    try {
      const resp = await fetch(`${gpu.url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      const data = await resp.json();
      if (data.models && data.models.length > 0) {
        console.log(`✅ ${gpu.label}: ${data.models.length} models`);
        availableGPUs.push(gpu);
      }
    } catch {
      console.log(`⚠️  ${gpu.label}: NOT RESPONDING (skipping)`);
    }
  }
  if (availableGPUs.length === 0) {
    console.log('❌ No GPUs available! Run: ollama serve');
    process.exit(1);
  }
  // Check if model is already loaded (skip warm-up to avoid blocking Ollama)
  console.log(`\n🔥 Using ${availableGPUs.length} GPU(s) — checking ${MODEL}...`);
  try {
    const psResp = await fetch(`${availableGPUs[0].url}/api/ps`, { signal: AbortSignal.timeout(5000) });
    const psData = await psResp.json();
    const loaded = psData.models?.some(m => m.name.startsWith(MODEL.split(':')[0]));
    if (loaded) {
      console.log('✅ Model already loaded');
    } else {
      console.log(`⏳ Model not loaded — pre-warm with: curl -s ${availableGPUs[0].url}/api/generate -X POST -d '{"model":"${MODEL}","prompt":"hi","stream":false,"options":{"num_predict":1}}'`);
      console.log('   Continuing anyway (first batch will be slower)...');
    }
  } catch { console.log('⚠️  Could not check model status'); }
  const defaultGpu = availableGPUs[0];

  // Determine which books to translate
  let books;
  if (FILTER_BOOK) {
    const code = FILTER_BOOK === 'DES' ? 'REV' : FILTER_BOOK;
    books = d1Execute(`SELECT code, testament FROM books WHERE code = '${code}' OR code = 'DES'`);
    if (books.length === 0) books = d1Execute(`SELECT code, testament FROM books WHERE code = '${FILTER_BOOK}'`);
  } else if (FILTER_TESTAMENT) {
    books = d1Execute(`SELECT code, testament FROM books WHERE testament = '${FILTER_TESTAMENT}' ORDER BY canon_order`);
  } else {
    books = d1Execute(`SELECT code, testament FROM books ORDER BY canon_order`);
  }

  console.log(`\n📚 Books to translate: ${books.length}`);

  const startTime = Date.now();
  let totalTranslated = 0;

  // Assign GPU: NT->GPU-1 if available, AT->GPU-0. Fallback to whatever is up
  for (const book of books) {
    let gpu;
    if (availableGPUs.length >= 2) {
      gpu = book.testament === 'NT' ? availableGPUs[1] : availableGPUs[0];
    } else {
      gpu = defaultGpu;
    }
    const count = await translateBook(book.code, gpu);
    totalTranslated += count;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  DONE: ${totalTranslated} tokens translated to English`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`═══════════════════════════════════════════════════════════`);

  // Cleanup temp files
  for (const gpu of GPU) {
    const f = join(projectRoot, `_en_batch_${gpu.id}.sql`);
    if (existsSync(f)) { try { execSync(`rm "${f}"`); } catch {} }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

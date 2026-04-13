#!/usr/bin/env node
/**
 * English Translation — Claude API Pipeline
 * Bíblia Belém An.C 2025
 *
 * Translates directly from original codices (Greek/Hebrew) to English
 * using Claude API (Haiku 4.5) with post-validation.
 *
 * Usage:
 *   node scripts/translate-en-claude.mjs --book=MAT      # Matthew only
 *   node scripts/translate-en-claude.mjs --testament=NT   # All NT
 *   node scripts/translate-en-claude.mjs                  # All books
 *   node scripts/translate-en-claude.mjs --dry-run        # Preview without writing
 *
 * Env: ANTHROPIC_API_KEY (from .env or environment)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load .env
const envPath = join(projectRoot, '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════

const MODEL = 'claude-haiku-4-5-20251001';
const BATCH_SIZE = 50;         // words per API call (Haiku handles 50 easily)
const D1_FLUSH = 100;          // SQL updates before flushing to D1
const RETRY_MAX = 3;
const RETRY_DELAY = 2000;
const RATE_LIMIT_DELAY = 500;  // ms between API calls
const TOKEN_LIMIT = 25000;     // max tokens to fetch per book from D1
const DRY_RUN = process.argv.includes('--dry-run');

// Words that must NOT be translated — preserved in original form
const KEEP_ORIGINAL = {
  'yhwh': 'yhwh', 'Yhwh': 'yhwh', 'יהוה': 'yhwh',
  'Θεός': 'Theos', 'Θεοῦ': 'Theou', 'Θεόν': 'Theon', 'Θεῷ': 'Theo',
  'Θεέ': 'Thee', 'θεός': 'Theos', 'θεοῦ': 'Theou', 'θεόν': 'Theon', 'θεῷ': 'Theo',
  'Ἰησοῦς': 'Iesous', 'Ἰησοῦ': 'Iesou', 'Ἰησοῦν': 'Iesoun',
  'Χριστός': 'Christos', 'Χριστοῦ': 'Christou', 'Χριστόν': 'Christon', 'Χριστῷ': 'Christo',
  'אֱלֹהִים': 'Elohim', 'אֱלוֹהַּ': 'Eloah', 'אֵל': 'El', 'אדני': 'Adonai',
};

// Greek/Hebrew common words — glossary (high confidence, no API needed)
const GLOSSARY = {
  // Greek articles & prepositions
  'καί': 'and', 'ὁ': 'the', 'ἡ': 'the', 'τό': 'the', 'τοῦ': 'of-the',
  'τῷ': 'to-the', 'τήν': 'the', 'τόν': 'the', 'τῶν': 'of-the',
  'τῆς': 'of-the', 'τοῖς': 'to-the', 'τούς': 'the', 'τάς': 'the',
  'τά': 'the', 'τοῖν': 'the-two', 'τό': 'the', 'τήν': 'the',
  'τὴν': 'the', 'τὸν': 'the', 'τὸ': 'the', 'τοὺς': 'the',
  'ἐν': 'in', 'εἰς': 'into', 'ἐκ': 'out-of', 'ἀπό': 'from', 'ἀπ\'': 'from',
  'ἐπί': 'upon', 'ἐπ\'': 'upon', 'ἐφ\'': 'upon',
  'πρός': 'toward', 'πρὸς': 'toward', 'διά': 'through', 'δι\'': 'through',
  'μετά': 'with', 'μετ\'': 'with', 'μεθ\'': 'with',
  'ὑπό': 'under', 'ὑπ\'': 'under', 'περί': 'concerning',
  'κατά': 'according-to', 'κατ\'': 'according-to', 'καθ\'': 'according-to',
  'παρά': 'beside', 'παρ\'': 'beside',
  'σύν': 'with', 'σὺν': 'with', 'ἀντί': 'instead-of',
  // Pronouns
  'αὐτός': 'he', 'αὐτοῦ': 'of-him', 'αὐτῷ': 'to-him', 'αὐτόν': 'him', 'αὐτὸν': 'him',
  'αὐτῆς': 'of-her', 'αὐτῇ': 'to-her', 'αὐτήν': 'her', 'αὐτὴν': 'her',
  'αὐτῶν': 'of-them', 'αὐτοῖς': 'to-them', 'αὐτούς': 'them',
  'αὐτοὶ': 'they-themselves', 'αὐτὸ': 'it',
  'ἐγώ': 'I', 'ἐμοῦ': 'of-me', 'ἐμοὶ': 'to-me', 'ἐμέ': 'me', 'ἐμὲ': 'me',
  'σύ': 'you', 'σοῦ': 'of-you', 'σοί': 'to-you', 'σέ': 'you',
  'ἡμεῖς': 'we', 'ἡμῶν': 'our', 'ἡμῖν': 'to-us', 'ἡμᾶς': 'us',
  'ὑμεῖς': 'you(pl)', 'ὑμῶν': 'your(pl)', 'ὑμῖν': 'to-you(pl)', 'ὑμᾶς': 'you(pl)',
  'μου': 'my', 'σου': 'your',
  'ἑαυτοῦ': 'of-himself', 'ἑαυτὸν': 'himself', 'ἑαυτοῖς': 'themselves',
  // Negation & particles
  'οὐ': 'not', 'οὐκ': 'not', 'οὐχ': 'not', 'μή': 'not', 'μὴ': 'not',
  'οὐδέ': 'neither', 'οὐδὲ': 'neither', 'οὔτε': 'neither',
  'γάρ': 'for', 'γὰρ': 'for', 'δέ': 'but', 'δὲ': 'but',
  'ἀλλά': 'but', 'ἀλλ\'': 'but', 'ἤ': 'or',
  'τε': 'and', 'καὶ': 'and',
  'ὅτι': 'that/because', 'ἵνα': 'so-that', 'ὡς': 'as', 'ὅς': 'who',
  'ἐάν': 'if', 'εἰ': 'if', 'Εἰ': 'If', 'ἂν': 'would',
  'μέν': 'indeed', 'μὲν': 'indeed', 'οὖν': 'therefore',
  // Common verbs
  'ἐστι': 'is', 'ἐστιν': 'is', 'ἐστίν': 'is', 'εἰμι': 'am', 'εἰμί': 'am',
  'ἦν': 'was', 'ἦσαν': 'were', 'ἔσται': 'will-be',
  'ἔχω': 'have', 'ἔχει': 'has', 'ἔχων': 'having', 'ἔχοντες': 'having',
  'λέγω': 'say', 'λέγει': 'says', 'εἶπεν': 'said', 'λέγων': 'saying',
  'λέγουσιν': 'say', 'ἔλεγεν': 'was-saying', 'ἔλεγον': 'were-saying',
  'ποιέω': 'do/make', 'ποιεῖ': 'does/makes',
  'γίνομαι': 'become', 'ἐγένετο': 'it-came-to-be',
  'ἔρχομαι': 'come', 'ἦλθεν': 'came', 'ἦλθον': 'came',
  'ἐξῆλθεν': 'went-out', 'εἰσῆλθεν': 'entered',
  // Common nouns
  'ἄνθρωπος': 'human', 'ἀνθρώπου': 'of-human', 'ἀνθρώπων': 'of-humans',
  'ἀγάπη': 'agape', 'πίστις': 'faith', 'ἐλπίς': 'hope',
  'ἁμαρτία': 'sin', 'ἁμαρτίαν': 'sin',
  'κόσμος': 'world', 'κόσμου': 'of-world',
  'ὄνομα': 'name', 'ὀνόματα': 'names', 'ὀνόματι': 'in-name',
  'βιβλίον': 'scroll', 'βιβλίου': 'of-scroll',
  'θρόνος': 'throne', 'θρόνου': 'of-throne', 'θρόνῳ': 'to-throne',
  'ἀρνίον': 'lamb', 'ἀρνίου': 'of-lamb',
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
  'δράκων': 'dragon', 'δράκοντος': 'of-dragon',
  'θηρίον': 'beast', 'θηρίου': 'of-beast',
  'πόλις': 'city', 'πόλεως': 'of-city',
  'ναός': 'temple', 'ναοῦ': 'of-temple',
  'οὐρανός': 'heaven', 'οὐρανοῦ': 'of-heaven', 'οὐρανῷ': 'in-heaven', 'οὐρανῶν': 'of-heavens',
  'γῆ': 'earth', 'γῆς': 'of-earth', 'γῆν': 'earth',
  'θάλασσα': 'sea', 'θαλάσσης': 'of-sea',
  'ἄγγελος': 'angelos', 'ἀγγέλῳ': 'to-angelos',
  // Demonstratives & misc
  'οὗτος': 'this', 'ταῦτα': 'these-things', 'τοῦτο': 'this',
  'τούτου': 'of-this', 'τούτῳ': 'to-this', 'τοῦτον': 'this',
  'ἐκεῖνος': 'that', 'τίς': 'who?',
  'πᾶς': 'all', 'πᾶσα': 'all', 'πᾶν': 'all', 'πάντα': 'all-things',
  'πάντων': 'of-all', 'πᾶσιν': 'to-all', 'πάντας': 'all', 'πᾶσαν': 'all',
  'οὕτως': 'thus', 'ὅπως': 'so-that', 'ὥστε': 'so-as-to',
  'ὅτε': 'when', 'ὅπου': 'where', 'πόθεν': 'from-where',
  'νῦν': 'now', 'τότε': 'then', 'πάλιν': 'again',
  'ἤδη': 'already', 'ἔτι': 'still', 'ἄρτι': 'now/just',
  'ἐκεῖ': 'there', 'ὧδε': 'here',
  'πολύς': 'much', 'πολλοί': 'many', 'πολλοὶ': 'many',
  'μέγας': 'great', 'μεγάλη': 'great',
  'ἴδιος': 'own', 'ἕκαστος': 'each', 'ἄλλος': 'other',
  'ἀληθής': 'true', 'ἀγαθός': 'good', 'κακός': 'bad/evil',
  'δύο': 'two', 'τρεῖς': 'three', 'εἷς': 'one', 'μία': 'one',
  'ἰδού': 'behold', 'Ἰδού': 'Behold', 'ἰδοὺ': 'behold', 'Ἰδοὺ': 'Behold',
};

// ═══════════════════════════════════════════════════════════════════
// ARGS
// ═══════════════════════════════════════════════════════════════════

let FILTER_BOOK = null;
let FILTER_TESTAMENT = null;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--book=')) {
    FILTER_BOOK = arg.split('=')[1].toUpperCase();
    if (FILTER_BOOK === 'DES') FILTER_BOOK = 'REV';
  }
  if (arg.startsWith('--testament=')) FILTER_TESTAMENT = arg.split('=')[1].toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// D1 HELPERS
// ═══════════════════════════════════════════════════════════════════

function d1Execute(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}"`;
  const result = execSync(cmd, {
    cwd: projectRoot, encoding: 'utf-8', timeout: 120000,
    stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024,
  });
  const clean = result.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
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
  execSync(`npx wrangler d1 execute biblia-belem --remote --file="${filePath}"`, {
    cwd: projectRoot, encoding: 'utf-8', timeout: 120000,
    stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024,
  });
}

// ═══════════════════════════════════════════════════════════════════
// CLAUDE API CLIENT
// ═══════════════════════════════════════════════════════════════════

const client = new Anthropic();

async function claudeTranslate(words, script) {
  const lang = script === 'GRC' ? 'Koine Greek' : script === 'HE' ? 'Biblical Hebrew' : 'Biblical Aramaic';
  const wordList = words.map((w, i) => `${i + 1}. ${w}`).join('\n');

  const prompt = `Translate these ${lang} words to English. STRICT LITERAL — word by word, no smoothing.

RULES:
- Translate each word independently to its English equivalent
- Use hyphens for compound concepts: "in-the-beginning", "out-of"
- For verbs: include tense/voice marker when relevant: "having-said", "will-come", "was-going"
- For nouns with case: show case: "of-son" (genitive), "to-house" (dative)
- NEVER return the original ${lang} word — always translate to English
- NEVER transliterate (no "auton", "legontos", "kai") — translate meaning
- These names stay as-is: yhwh, Elohim, Eloah, El, Adonai, Theos, Iesous, Christos
- "God/Lord" NEVER appear — use Theos/Elohim or yhwh/Adonai/Kyrios
- Proper names: transliterate to Latin alphabet (Abraam, Dauid, Iakob, Petros)

EXAMPLES (${lang === 'Koine Greek' ? 'Greek' : 'Hebrew'}):
${lang === 'Koine Greek' ? `- ἀποκριθεὶς → having-answered
- ἐγέννησεν → begat
- βασιλεύς → king
- τὴν → the
- ἐκάλεσεν → called
- ὑπάγω → go-away
- δικαιοσύνη → righteousness
- σταυρωθῇ → be-crucified` : `- וַיֹּאמֶר → and-he-said
- בְּרֵאשִׁית → in-beginning
- הַשָּׁמַיִם → the-heavens
- וְהָאָרֶץ → and-the-earth
- מֶלֶךְ → king
- בֶּן → son
- דָּבָר → word/matter`}

Translate:
${wordList}

Return ONLY a JSON object: {"1": "english", "2": "english", ...}`;

  for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = response.content[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`    ⚠️  No JSON in response (attempt ${attempt}/${RETRY_MAX})`);
        if (attempt < RETRY_MAX) await sleep(RETRY_DELAY);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate: reject entries that are still in original script
      const validated = {};
      let rejected = 0;
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== 'string' || !value.trim()) continue;
        const v = value.trim();
        // Reject if contains Greek or Hebrew characters (transliteration failure)
        if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(v) || /[\u0590-\u05FF]/.test(v)) {
          rejected++;
          continue;
        }
        // Reject if equals original word
        const idx = parseInt(key) - 1;
        if (idx >= 0 && idx < words.length && v === words[idx]) {
          rejected++;
          continue;
        }
        validated[key] = v;
      }

      if (rejected > 0) {
        console.log(`    🔍 Validated: ${Object.keys(validated).length}/${Object.keys(parsed).length} (${rejected} rejected)`);
      }

      return validated;
    } catch (err) {
      if (err.status === 429) {
        const wait = Math.min(30000, RETRY_DELAY * attempt * 2);
        console.log(`    ⏳ Rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (err.status === 529) {
        console.log(`    ⏳ API overloaded, waiting 60s...`);
        await sleep(60000);
        continue;
      }
      console.log(`    ❌ API error (attempt ${attempt}/${RETRY_MAX}): ${err.message}`);
      if (attempt < RETRY_MAX) await sleep(RETRY_DELAY);
    }
  }
  return null;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════════════════════
// TRANSLATION PIPELINE
// ═══════════════════════════════════════════════════════════════════

async function translateBook(bookCode) {
  console.log(`\n📖 ${bookCode}`);

  let tokens = d1Execute(
    `SELECT t.id, t.text_utf8, t.normalized, t.script, t.position, v.chapter, v.verse FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.code = '${bookCode}' AND (t.en_literal IS NULL OR t.en_literal = '') ORDER BY v.chapter, v.verse, t.position LIMIT ${TOKEN_LIMIT}`
  );

  if (tokens.length === 0 && bookCode === 'REV') {
    tokens = d1Execute(
      `SELECT t.id, t.text_utf8, t.normalized, t.script, t.position, v.chapter, v.verse FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.code = 'DES' AND (t.en_literal IS NULL OR t.en_literal = '') ORDER BY v.chapter, v.verse, t.position LIMIT ${TOKEN_LIMIT}`
    );
  }

  console.log(`  Tokens to translate: ${tokens.length}`);
  if (tokens.length === 0) { console.log('  ✅ Already done'); return { translated: 0, glossary: 0, api: 0, failed: 0 }; }

  let translated = 0, glossaryHits = 0, apiHits = 0, failedCount = 0;
  let sqlBatch = [];

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const needsApi = [];
    const batchTranslations = {};

    // First pass: glossary + keep_original
    for (const token of batch) {
      const utf8 = token.text_utf8;
      const norm = token.normalized;

      if (KEEP_ORIGINAL[utf8]) {
        batchTranslations[token.id] = KEEP_ORIGINAL[utf8];
        glossaryHits++;
        continue;
      }
      if (GLOSSARY[utf8]) {
        batchTranslations[token.id] = GLOSSARY[utf8];
        glossaryHits++;
        continue;
      }
      if (GLOSSARY[norm]) {
        batchTranslations[token.id] = GLOSSARY[norm];
        glossaryHits++;
        continue;
      }

      needsApi.push({ id: token.id, word: utf8, script: token.script });
    }

    // Claude API for unknown words
    if (needsApi.length > 0) {
      const wordTexts = needsApi.map(w => w.word);
      const script = needsApi[0].script;
      const result = await claudeTranslate(wordTexts, script);

      if (result) {
        for (let j = 0; j < needsApi.length; j++) {
          const key = String(j + 1);
          if (result[key]) {
            let trans = result[key].trim();
            // Block forbidden English words
            trans = trans.replace(/\bGod\b/gi, 'Theos');
            trans = trans.replace(/\bLord\b/gi, 'Kyrios');
            trans = trans.replace(/\bJesus\b/gi, 'Iesous');
            trans = trans.replace(/\bChrist\b/gi, 'Christos');
            batchTranslations[needsApi[j].id] = trans;
            apiHits++;
          } else {
            failedCount++;
          }
        }
      } else {
        failedCount += needsApi.length;
        console.log(`    ❌ Batch failed: ${needsApi.length} tokens lost at ${batch[0]?.chapter}:${batch[0]?.verse}`);
      }

      await sleep(RATE_LIMIT_DELAY);
    }

    // Generate SQL updates
    for (const [id, translation] of Object.entries(batchTranslations)) {
      const safe = translation.replace(/'/g, "''");
      sqlBatch.push(`UPDATE tokens SET en_literal = '${safe}' WHERE id = ${id};`);
      translated++;
    }

    // Flush SQL batch
    if (sqlBatch.length >= D1_FLUSH && !DRY_RUN) {
      const sqlFile = join(projectRoot, `_en_claude_batch.sql`);
      writeFileSync(sqlFile, sqlBatch.join('\n'), 'utf-8');
      try {
        d1ExecuteFile(sqlFile);
        console.log(`  ✏️  Flushed ${sqlBatch.length} updates (${translated}/${tokens.length})`);
      } catch (e) {
        console.log(`  ⚠️  Flush error, retrying...`);
        await sleep(2000);
        try { d1ExecuteFile(sqlFile); } catch { console.log(`  ❌ Lost ${sqlBatch.length} updates`); }
      }
      sqlBatch = [];
    }

    // Progress
    if ((i + BATCH_SIZE) % 200 === 0 || i + BATCH_SIZE >= tokens.length) {
      const ch = batch[0]?.chapter || '?';
      const vs = batch[0]?.verse || '?';
      const pct = (translated / tokens.length * 100).toFixed(1);
      console.log(`  📍 ${bookCode} ${ch}:${vs} — ${translated}/${tokens.length} (${pct}%) [glossary:${glossaryHits} api:${apiHits} failed:${failedCount}]`);
    }
  }

  // Final flush
  if (sqlBatch.length > 0 && !DRY_RUN) {
    const sqlFile = join(projectRoot, `_en_claude_batch.sql`);
    writeFileSync(sqlFile, sqlBatch.join('\n'), 'utf-8');
    try { d1ExecuteFile(sqlFile); } catch { console.log(`  ⚠️  Final flush error`); }
  }

  const stats = { translated, glossary: glossaryHits, api: apiHits, failed: failedCount };
  console.log(`  ✅ ${bookCode}: ${translated} translated (glossary:${glossaryHits} api:${apiHits} failed:${failedCount})`);
  return stats;
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ENGLISH TRANSLATION — Claude API Pipeline');
  console.log('  Bíblia Belém An.C 2025');
  console.log('  Direct from codices → English (Haiku 4.5)');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verify API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('❌ ANTHROPIC_API_KEY not set. Add to .env or environment.');
    process.exit(1);
  }
  console.log('✅ Anthropic API key loaded');

  // Quick API test
  try {
    const test = await client.messages.create({
      model: MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say OK' }],
    });
    console.log(`✅ API working (${MODEL})`);
  } catch (err) {
    console.log(`❌ API test failed: ${err.message}`);
    process.exit(1);
  }

  // Determine books
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
  let totalStats = { translated: 0, glossary: 0, api: 0, failed: 0 };

  for (const book of books) {
    const stats = await translateBook(book.code);
    totalStats.translated += stats.translated;
    totalStats.glossary += stats.glossary;
    totalStats.api += stats.api;
    totalStats.failed += stats.failed;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  DONE: ${totalStats.translated} tokens translated to English`);
  console.log(`  Glossary hits: ${totalStats.glossary}`);
  console.log(`  Claude API:    ${totalStats.api}`);
  console.log(`  Failed:        ${totalStats.failed}`);
  console.log(`  Time:          ${elapsed}s`);
  console.log(`  API calls:     ~${Math.ceil(totalStats.api / BATCH_SIZE)}`);
  console.log(`═══════════════════════════════════════════════════════════`);

  // Cleanup temp file
  const f = join(projectRoot, '_en_claude_batch.sql');
  if (existsSync(f)) { try { execSync(`rm "${f}"`); } catch {} }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

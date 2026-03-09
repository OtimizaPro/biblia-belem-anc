// ============================================================================
// Dead Sea Scrolls (DSS) — API Routes
// Qumran manuscript data from ETCBC/dss (Martin Abegg transcriptions)
// ============================================================================

import { Hono } from 'hono';
import type { Env } from '../types';

const dss = new Hono<{ Bindings: Env }>();

// GET /manuscripts — List all DSS manuscripts
dss.get('/manuscripts', async (c) => {
  const biblical = c.req.query('biblical'); // 'true' or 'false'
  const cave = c.req.query('cave');
  const book = c.req.query('book');
  const limit = parseInt(c.req.query('limit') || '100');
  const offset = parseInt(c.req.query('offset') || '0');

  let sql = 'SELECT * FROM dss_manuscripts WHERE 1=1';
  const params: (string | number)[] = [];

  if (biblical === 'true') {
    sql += ' AND is_biblical = 1';
  } else if (biblical === 'false') {
    sql += ' AND is_biblical = 0';
  }

  if (cave) {
    sql += ' AND cave = ?';
    params.push(parseInt(cave));
  }

  if (book) {
    sql += ' AND (canonical_books_json LIKE ? OR canonical_book_id IN (SELECT id FROM books WHERE code = ?))';
    params.push(`%${book}%`, book);
  }

  sql += ' ORDER BY is_biblical DESC, total_words DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all();

  // Count total
  let countSql = 'SELECT COUNT(*) as total FROM dss_manuscripts WHERE 1=1';
  const countParams: (string | number)[] = [];
  if (biblical === 'true') countSql += ' AND is_biblical = 1';
  else if (biblical === 'false') countSql += ' AND is_biblical = 0';
  if (cave) { countSql += ' AND cave = ?'; countParams.push(parseInt(cave)); }

  const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first<{ total: number }>();

  return c.json({
    success: true,
    data: result.results,
    meta: {
      count: result.results.length,
      total: countResult?.total || 0,
      limit,
      offset,
    },
  });
});

// GET /manuscripts/:sigla — Single manuscript details
dss.get('/manuscripts/:sigla', async (c) => {
  const sigla = c.req.param('sigla');

  const ms = await c.env.DB.prepare(
    'SELECT * FROM dss_manuscripts WHERE sigla = ?'
  ).bind(sigla).first();

  if (!ms) {
    return c.json({ success: false, error: `Manuscript '${sigla}' not found` }, 404);
  }

  // Get fragment count
  const fragments = await c.env.DB.prepare(
    'SELECT fragment_name, total_lines, total_words FROM dss_fragments WHERE manuscript_id = ? ORDER BY id'
  ).bind(ms.id).all();

  // Get verse coverage (if biblical)
  const verseCoverage = await c.env.DB.prepare(
    'SELECT DISTINCT book, chapter FROM dss_verses WHERE manuscript_id = ? ORDER BY book, chapter'
  ).bind(ms.id).all();

  return c.json({
    success: true,
    data: {
      ...ms,
      fragments: fragments.results,
      verse_coverage: verseCoverage.results,
    },
  });
});

// GET /manuscripts/:sigla/tokens — Tokens for a manuscript
dss.get('/manuscripts/:sigla/tokens', async (c) => {
  const sigla = c.req.param('sigla');
  const chapter = c.req.query('chapter');
  const verse = c.req.query('verse');
  const limit = parseInt(c.req.query('limit') || '500');
  const offset = parseInt(c.req.query('offset') || '0');

  const ms = await c.env.DB.prepare(
    'SELECT id FROM dss_manuscripts WHERE sigla = ?'
  ).bind(sigla).first<{ id: number }>();

  if (!ms) {
    return c.json({ success: false, error: `Manuscript '${sigla}' not found` }, 404);
  }

  let sql = 'SELECT * FROM dss_tokens WHERE manuscript_id = ?';
  const params: (string | number)[] = [ms.id];

  if (chapter) {
    sql += ' AND chapter = ?';
    params.push(parseInt(chapter));
  }
  if (verse) {
    sql += ' AND verse = ?';
    params.push(parseInt(verse));
  }

  sql += ' ORDER BY position LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await c.env.DB.prepare(sql).bind(...params).all();

  return c.json({
    success: true,
    data: result.results,
    meta: { count: result.results.length, limit, offset },
  });
});

// GET /compare/:sigla/:chapter/:verse — Compare DSS vs canonical
dss.get('/compare/:sigla/:chapter/:verse', async (c) => {
  const sigla = c.req.param('sigla');
  const chapter = parseInt(c.req.param('chapter'));
  const verse = parseInt(c.req.param('verse'));

  // Get DSS verse
  const ms = await c.env.DB.prepare(
    'SELECT id, canonical_book_id FROM dss_manuscripts WHERE sigla = ?'
  ).bind(sigla).first<{ id: number; canonical_book_id: number }>();

  if (!ms) {
    return c.json({ success: false, error: `Manuscript '${sigla}' not found` }, 404);
  }

  const dssVerse = await c.env.DB.prepare(
    'SELECT * FROM dss_verses WHERE manuscript_id = ? AND chapter = ? AND verse = ?'
  ).bind(ms.id, chapter, verse).first();

  if (!dssVerse) {
    return c.json({ success: false, error: `Verse ${chapter}:${verse} not found in ${sigla}` }, 404);
  }

  // Get canonical verse
  let canonicalVerse = null;
  if (ms.canonical_book_id) {
    canonicalVerse = await c.env.DB.prepare(
      'SELECT text_original, text_transliterated, text_translated FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?'
    ).bind(ms.canonical_book_id, chapter, verse).first();
  }

  // Get DSS tokens for this verse
  const dssTokens = await c.env.DB.prepare(
    'SELECT glyph, glyph_translit, lemma, sp, morpho FROM dss_tokens WHERE manuscript_id = ? AND chapter = ? AND verse = ? ORDER BY position'
  ).bind(ms.id, chapter, verse).all();

  // Get canonical tokens
  let canonicalTokens = null;
  if (ms.canonical_book_id) {
    const canonVerse = await c.env.DB.prepare(
      'SELECT id FROM verses WHERE book_id = ? AND chapter = ? AND verse = ?'
    ).bind(ms.canonical_book_id, chapter, verse).first<{ id: number }>();

    if (canonVerse) {
      canonicalTokens = await c.env.DB.prepare(
        'SELECT text_original, text_transliterated, lemma, morph_code, pos FROM tokens WHERE verse_id = ? ORDER BY position'
      ).bind(canonVerse.id).all();
    }
  }

  return c.json({
    success: true,
    data: {
      manuscript: sigla,
      reference: `${chapter}:${verse}`,
      dss: {
        text: dssVerse,
        tokens: dssTokens.results,
      },
      canonical: canonicalVerse ? {
        text: canonicalVerse,
        tokens: canonicalTokens?.results || [],
      } : null,
    },
  });
});

// GET /variants/:book/:chapter — All DSS variants for a chapter
dss.get('/variants/:book/:chapter', async (c) => {
  const book = c.req.param('book');
  const chapter = parseInt(c.req.param('chapter'));

  // Find all DSS verses for this book/chapter across all manuscripts
  const variants = await c.env.DB.prepare(`
    SELECT dv.*, dm.sigla, dm.name as manuscript_name, dm.date_range
    FROM dss_verses dv
    JOIN dss_manuscripts dm ON dv.manuscript_id = dm.id
    WHERE dv.book = ? AND dv.chapter = ?
    ORDER BY dv.verse, dm.sigla
  `).bind(book, chapter).all();

  // Get canonical verses for context
  const bookRecord = await c.env.DB.prepare(
    'SELECT id FROM books WHERE code = ? OR name_original = ?'
  ).bind(book, book).first<{ id: number }>();

  let canonicalVerses = null;
  if (bookRecord) {
    canonicalVerses = await c.env.DB.prepare(
      'SELECT verse, text_original FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse'
    ).bind(bookRecord.id, chapter).all();
  }

  return c.json({
    success: true,
    data: {
      book,
      chapter,
      dss_readings: variants.results,
      canonical_readings: canonicalVerses?.results || [],
    },
    meta: {
      dss_count: variants.results.length,
      manuscripts: [...new Set(variants.results.map((v: any) => v.sigla))],
    },
  });
});

// GET /search?q=term — Search in DSS texts
dss.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q || q.length < 2) {
    return c.json({ success: false, error: 'Query must be at least 2 characters' }, 400);
  }

  const limit = parseInt(c.req.query('limit') || '50');

  // Search in tokens (glyph and lemma)
  const tokenResults = await c.env.DB.prepare(`
    SELECT dt.glyph, dt.lemma, dt.sp, dt.morpho, dt.book, dt.chapter, dt.verse,
           dm.sigla, dm.name as manuscript_name
    FROM dss_tokens dt
    JOIN dss_manuscripts dm ON dt.manuscript_id = dm.id
    WHERE dt.glyph LIKE ? OR dt.lemma LIKE ?
    ORDER BY dm.sigla, dt.position
    LIMIT ?
  `).bind(`%${q}%`, `%${q}%`, limit).all();

  // Search in verse texts
  const verseResults = await c.env.DB.prepare(`
    SELECT dv.book, dv.chapter, dv.verse, dv.text_dss,
           dm.sigla, dm.name as manuscript_name
    FROM dss_verses dv
    JOIN dss_manuscripts dm ON dv.manuscript_id = dm.id
    WHERE dv.text_dss LIKE ?
    ORDER BY dm.sigla, dv.book, dv.chapter, dv.verse
    LIMIT ?
  `).bind(`%${q}%`, limit).all();

  return c.json({
    success: true,
    data: {
      token_matches: tokenResults.results,
      verse_matches: verseResults.results,
    },
    meta: {
      query: q,
      token_count: tokenResults.results.length,
      verse_count: verseResults.results.length,
    },
  });
});

// GET /stats — DSS collection statistics
dss.get('/stats', async (c) => {
  const totalMs = await c.env.DB.prepare('SELECT COUNT(*) as total FROM dss_manuscripts').first<{ total: number }>();
  const biblicalMs = await c.env.DB.prepare('SELECT COUNT(*) as total FROM dss_manuscripts WHERE is_biblical = 1').first<{ total: number }>();
  const totalTokens = await c.env.DB.prepare('SELECT COUNT(*) as total FROM dss_tokens').first<{ total: number }>();
  const totalVerses = await c.env.DB.prepare('SELECT COUNT(*) as total FROM dss_verses').first<{ total: number }>();

  const byCave = await c.env.DB.prepare(
    'SELECT cave, COUNT(*) as count FROM dss_manuscripts WHERE cave IS NOT NULL GROUP BY cave ORDER BY cave'
  ).all();

  const topScrolls = await c.env.DB.prepare(
    'SELECT sigla, name, is_biblical, total_words, cave FROM dss_manuscripts ORDER BY total_words DESC LIMIT 15'
  ).all();

  return c.json({
    success: true,
    data: {
      total_manuscripts: totalMs?.total || 0,
      biblical_manuscripts: biblicalMs?.total || 0,
      non_biblical_manuscripts: (totalMs?.total || 0) - (biblicalMs?.total || 0),
      total_tokens: totalTokens?.total || 0,
      total_verses: totalVerses?.total || 0,
      by_cave: byCave.results,
      top_scrolls: topScrolls.results,
      source: 'ETCBC/dss (Martin Abegg transcriptions)',
      license: 'CC-BY-NC 4.0',
    },
  });
});

export default dss;

-- ============================================================================
-- Dead Sea Scrolls (DSS) — Qumran Manuscripts
-- Migration 004: Tables for DSS manuscript data from ETCBC/dss
-- Source: Martin Abegg transcriptions (CC-BY-NC 4.0)
-- ============================================================================

-- Manuscripts catalog (~1001 scrolls from Qumran caves 1-11)
CREATE TABLE IF NOT EXISTS dss_manuscripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sigla TEXT UNIQUE NOT NULL,            -- e.g. '1Qisaa', '4Q246', '11Q13'
  name TEXT DEFAULT '',                  -- Human name: 'Great Isaiah Scroll'
  is_biblical INTEGER NOT NULL DEFAULT 0,-- 1 = biblical, 0 = non-biblical/sectarian
  language TEXT NOT NULL DEFAULT 'HE',   -- HE, ARM (Aramaic)
  cave INTEGER,                          -- Cave number (1-11)
  site TEXT DEFAULT 'Qumran',            -- Discovery site
  canonical_book_id INTEGER,             -- FK to books table (if biblical)
  canonical_books_json TEXT,             -- JSON array of book codes if multiple
  date_range TEXT,                       -- Dating: '125-100 BCE'
  total_words INTEGER DEFAULT 0,
  total_fragments INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  source TEXT DEFAULT 'ETCBC/dss',
  license TEXT DEFAULT 'CC-BY-NC 4.0',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dss_manuscripts_biblical ON dss_manuscripts(is_biblical);
CREATE INDEX IF NOT EXISTS idx_dss_manuscripts_cave ON dss_manuscripts(cave);
CREATE INDEX IF NOT EXISTS idx_dss_manuscripts_book ON dss_manuscripts(canonical_book_id);

-- Fragments within manuscripts
CREATE TABLE IF NOT EXISTS dss_fragments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manuscript_id INTEGER NOT NULL REFERENCES dss_manuscripts(id),
  fragment_name TEXT,                    -- Fragment identifier
  total_lines INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  text_reconstructed TEXT                -- Full fragment text (reconstructed)
);

CREATE INDEX IF NOT EXISTS idx_dss_fragments_ms ON dss_fragments(manuscript_id);

-- Tokens (word-level data with morphological annotations)
CREATE TABLE IF NOT EXISTS dss_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manuscript_id INTEGER NOT NULL REFERENCES dss_manuscripts(id),
  fragment_id INTEGER REFERENCES dss_fragments(id),
  position INTEGER NOT NULL,             -- Word position in manuscript
  glyph TEXT NOT NULL,                   -- Original script (Hebrew/Aramaic)
  glyph_translit TEXT,                   -- Transliteration
  lemma TEXT,                            -- Dictionary form (pointed)
  lemma_translit TEXT,                   -- Lemma transliteration
  sp TEXT,                               -- Part of speech (subs, verb, ptcl, etc.)
  ps TEXT,                               -- Person (p1, p2, p3)
  nu TEXT,                               -- Number (sg, pl, du)
  gn TEXT,                               -- Gender (m, f)
  morpho TEXT,                           -- Full morphology code
  lang TEXT,                             -- Language code
  book TEXT,                             -- Canonical book (if biblical): 'Is', 'Gn'
  chapter INTEGER,                       -- Canonical chapter
  verse INTEGER                          -- Canonical verse
);

CREATE INDEX IF NOT EXISTS idx_dss_tokens_ms ON dss_tokens(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_dss_tokens_ref ON dss_tokens(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_dss_tokens_lemma ON dss_tokens(lemma);
CREATE INDEX IF NOT EXISTS idx_dss_tokens_glyph ON dss_tokens(glyph);

-- Verse-level reconstructed text (for biblical manuscripts only)
CREATE TABLE IF NOT EXISTS dss_verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  manuscript_id INTEGER NOT NULL REFERENCES dss_manuscripts(id),
  book TEXT NOT NULL,                    -- ETCBC book code: 'Is', 'Gn'
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text_dss TEXT NOT NULL,                -- DSS reading
  canonical_verse_id INTEGER,            -- FK to canonical verses table
  UNIQUE(manuscript_id, book, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_dss_verses_ref ON dss_verses(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_dss_verses_ms ON dss_verses(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_dss_verses_canonical ON dss_verses(canonical_verse_id);

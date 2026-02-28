/**
 * Integration tests for the Biblia Belem An.C 2025 API.
 * Tests run against the production API at biblia.aculpaedasovelhas.org.
 */
import { describe, it, expect } from 'vitest';

const API = 'https://biblia.aculpaedasovelhas.org';

async function get(path: string) {
  const res = await fetch(`${API}${path}`);
  const contentType = res.headers.get('content-type') || '';
  const json = contentType.includes('json') ? await res.json() : null;
  return { status: res.status, headers: res.headers, json };
}

// ─── Root & Health ───────────────────────────────────────────────

describe('Root & Health', () => {
  it('GET / returns API info', async () => {
    const { status, json } = await get('/');
    expect(status).toBe(200);
    expect(json.name).toContain('Bíblia');
    expect(json.philosophy).toBe('Você lê. E a interpretação é sua.');
    expect(json.endpoints).toBeDefined();
  }, 15000);

  it('GET /health returns ok', async () => {
    const { status, json } = await get('/health');
    expect(status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.service).toBe('biblia-belem-api');
    expect(json.timestamp).toBeDefined();
  });

  it('GET /docs returns OpenAPI spec', async () => {
    const { status, json } = await get('/docs');
    expect(status).toBe(200);
    expect(json).toBeDefined();
  });
});

// ─── Security Headers ────────────────────────────────────────────

describe('Security Headers', () => {
  it('includes security headers', async () => {
    const { headers } = await get('/health');
    expect(headers.get('x-content-type-options')).toBe('nosniff');
    expect(headers.get('x-frame-options')).toBe('DENY');
  });

  it('includes CORS headers', async () => {
    const res = await fetch(`${API}/health`, {
      headers: { Origin: 'https://example.com' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────

describe('404 Handler', () => {
  it('returns 404 for unknown routes', async () => {
    const { status, json } = await get('/api/v1/nonexistent');
    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });
});

// ─── Books ───────────────────────────────────────────────────────

describe('Books API', () => {
  it('GET /api/v1/books returns all 66 books', async () => {
    const { status, json } = await get('/api/v1/books');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBe(66);
    expect(json.meta.count).toBe(66);
  });

  it('filters by testament=AT', async () => {
    const { json } = await get('/api/v1/books?testament=AT');
    expect(json.data.length).toBe(39);
    expect(json.data.every((b: { testament: string }) => b.testament === 'AT')).toBe(true);
  });

  it('filters by testament=NT', async () => {
    const { json } = await get('/api/v1/books?testament=NT');
    expect(json.data.length).toBe(27);
    expect(json.data.every((b: { testament: string }) => b.testament === 'NT')).toBe(true);
  });

  it('GET /api/v1/books/GEN returns Genesis', async () => {
    const { status, json } = await get('/api/v1/books/GEN');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.code).toBe('GEN');
    expect(json.data.name_pt).toBeDefined();
    expect(json.data.chapters_count).toBe(50);
  });

  it('book code is case insensitive', async () => {
    const { status, json } = await get('/api/v1/books/gen');
    expect(status).toBe(200);
    expect(json.data.code).toBe('GEN');
  });

  it('returns 404 for unknown book', async () => {
    const { status, json } = await get('/api/v1/books/XYZ');
    expect(status).toBe(404);
    expect(json.success).toBe(false);
  });

  it('sanitizes book code against injection', async () => {
    const { status } = await get('/api/v1/books/GENDROP');
    expect(status).toBe(404);
  });
});

// ─── Verses ──────────────────────────────────────────────────────

describe('Verses API', () => {
  it('GET /api/v1/verses/GEN/1 returns Genesis 1', async () => {
    const { status, json } = await get('/api/v1/verses/GEN/1');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('first verse has expected fields', async () => {
    const { json } = await get('/api/v1/verses/GEN/1');
    const v = json.data[0];
    expect(v.chapter).toBe(1);
    expect(v.verse).toBe(1);
    expect(v.literal_pt).toBeDefined();
    expect(v.canonical_ref).toBe('GEN 1:1');
  });

  it('returns 404 for unknown book', async () => {
    const { status } = await get('/api/v1/verses/XYZ/1');
    expect(status).toBe(404);
  });
});

// ─── Tokens ──────────────────────────────────────────────────────

describe('Tokens API', () => {
  it('GET /api/v1/tokens/:id returns tokens for a verse', async () => {
    const { json: versesJson } = await get('/api/v1/verses/GEN/1');
    const verseId = versesJson.data[0].id;

    const { status, json } = await get(`/api/v1/tokens/${verseId}`);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('interlinear view has original, transliteration, gloss', async () => {
    const { json: versesJson } = await get('/api/v1/verses/GEN/1');
    const verseId = versesJson.data[0].id;

    const { status, json } = await get(`/api/v1/tokens/${verseId}/interlinear`);
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    const first = json.data.interlinear[0];
    expect(first.original).toBeDefined();
    expect(first.transliteration).toBeDefined();
    expect(first.gloss).toBeDefined();
  });
});

// ─── Glossary ────────────────────────────────────────────────────

describe('Glossary API', () => {
  it('GET /api/v1/glossary returns entries', async () => {
    const { status, json } = await get('/api/v1/glossary');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.meta.count).toBeGreaterThan(0);
  });

  it('glossary entries have word and translation', async () => {
    const { json } = await get('/api/v1/glossary');
    const first = json.data[0];
    expect(first.word).toBeDefined();
    expect(first.translation).toBeDefined();
  });
});

// ─── Glosses ─────────────────────────────────────────────────────

describe('Glosses API', () => {
  it('GET /api/v1/glosses/layers returns layer info', async () => {
    const { status, json } = await get('/api/v1/glosses/layers');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
  });
});

// ─── Translation Info ────────────────────────────────────────────

describe('Translation Info API', () => {
  it('GET /api/v1/translation-info returns overview', async () => {
    const { status, json } = await get('/api/v1/translation-info');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.philosophy).toContain('interpretação');
  });

  it('editorial-markers includes [OBJ]', async () => {
    const { status, json } = await get('/api/v1/translation-info/editorial-markers');
    expect(status).toBe(200);
    expect(json.data.markers['[OBJ]']).toBeDefined();
  });

  it('words-not-translated includes yhwh', async () => {
    const { status, json } = await get('/api/v1/translation-info/words-not-translated');
    expect(status).toBe(200);
    expect(json.data.categories.yhwh).toBeDefined();
  });

  it('word/:word returns details for yhwh', async () => {
    const { status, json } = await get('/api/v1/translation-info/word/yhwh');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
  });
});

// ─── Search ──────────────────────────────────────────────────────

describe('Search API', () => {
  it('search for "Elohim" finds results', async () => {
    const { status, json } = await get('/api/v1/search?q=Elohim');
    expect(status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('search highlights matches', async () => {
    const { json } = await get('/api/v1/search?q=Elohim');
    expect(json.data[0].highlight).toContain('<mark>');
  });

  it('rejects queries shorter than 2 chars', async () => {
    const { status, json } = await get('/api/v1/search?q=a');
    expect(status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('rejects empty query', async () => {
    const { status } = await get('/api/v1/search');
    expect(status).toBe(400);
  });

  it('supports book filter', async () => {
    const { status, json } = await get('/api/v1/search?q=Elohim&book=GEN');
    expect(status).toBe(200);
    expect(json.data.every((r: { book: string }) => r.book === 'gen')).toBe(true);
  });

  it('supports limit parameter', async () => {
    const { json } = await get('/api/v1/search?q=Elohim&limit=5');
    expect(json.data.length).toBeLessThanOrEqual(5);
  });
});

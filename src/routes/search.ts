import { Hono } from 'hono';
import type { Env, ApiResponse } from '../types';

const search = new Hono<{ Bindings: Env }>();

const MAX_LIMIT = 100;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 200;

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlight: string;
}

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char] || char
  );
}

function highlightText(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  // Escapar caracteres especiais da regex
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');

  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

const VALID_LAYERS = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];

search.get('/', async (c) => {
  try {
    const { q, book, layer: layerParam, limit = '20' } = c.req.query();
    const layer = (layerParam || 'N0').toUpperCase();

    if (!q || q.trim().length < MIN_QUERY_LENGTH) {
      return c.json(
        {
          success: false,
          error: `Busca deve ter no mínimo ${MIN_QUERY_LENGTH} caracteres`,
        },
        400
      );
    }

    if (q.length > MAX_QUERY_LENGTH) {
      return c.json(
        {
          success: false,
          error: `Busca deve ter no máximo ${MAX_QUERY_LENGTH} caracteres`,
        },
        400
      );
    }

    if (!VALID_LAYERS.includes(layer)) {
      return c.json(
        {
          success: false,
          error: `Layer inválido. Use: ${VALID_LAYERS.join(', ')}`,
        },
        400
      );
    }

    const searchTerm = q.trim();
    const limitNum = Math.min(parseInt(limit) || 20, MAX_LIMIT);

    // Para layers N1-N5 com dados em verse_translations, buscar lá.
    // Para N0 (default), buscar via tokens.pt_literal (mais preciso, sem dependência de verse_translations).
    const useVerseTranslations = layer !== 'N0';

    let bookFilter = '';
    const bookParams: (string | number)[] = [];
    if (book) {
      if (book.length < 2 || book.length > 10) {
        return c.json(
          {
            success: false,
            error: 'Código de livro inválido',
          },
          400
        );
      }
      bookFilter = ' AND b.code = ?';
      bookParams.push(book.toUpperCase());
    }

    let countSql: string;
    let sql: string;
    let params: (string | number)[];
    let searchParams: (string | number)[];

    if (useVerseTranslations) {
      // Busca em verse_translations.literal_pt para layers N1-N5
      params = [`%${searchTerm}%`, layer, ...bookParams];
      countSql = `
        SELECT COUNT(*) as total
        FROM verse_translations vt
        JOIN verses v ON vt.verse_id = v.id
        JOIN books b ON v.book_id = b.id
        WHERE vt.literal_pt LIKE ? AND vt.layer = ?${bookFilter}
      `;
      sql = `
        SELECT v.chapter, v.verse, b.code as book_code, vt.literal_pt as text_translated
        FROM verse_translations vt
        JOIN verses v ON vt.verse_id = v.id
        JOIN books b ON v.book_id = b.id
        WHERE vt.literal_pt LIKE ? AND vt.layer = ?${bookFilter}
        ORDER BY b.canon_order, v.chapter, v.verse
        LIMIT ?
      `;
      searchParams = [...params, limitNum];
    } else {
      // Busca via tokens.pt_literal (N0 — padrão)
      params = [`%${searchTerm}%`, ...bookParams];
      countSql = `
        SELECT COUNT(DISTINCT v.id) as total
        FROM verses v
        JOIN books b ON v.book_id = b.id
        JOIN tokens t ON t.verse_id = v.id
        WHERE t.pt_literal LIKE ?${bookFilter}
      `;
      sql = `
        SELECT
          v.chapter,
          v.verse,
          b.code as book_code,
          GROUP_CONCAT(t.pt_literal, ' ') as text_translated
        FROM verses v
        JOIN books b ON v.book_id = b.id
        JOIN tokens t ON t.verse_id = v.id
        WHERE t.pt_literal LIKE ?${bookFilter}
        GROUP BY v.id
        ORDER BY b.canon_order, v.chapter, v.verse
        LIMIT ?
      `;
      searchParams = [...params, limitNum];
    }

    const countResult = await c.env.DB.prepare(countSql)
      .bind(...params)
      .first<{ total: number }>();

    const total = countResult?.total || 0;

    const result = await c.env.DB.prepare(sql)
      .bind(...searchParams)
      .all<{
        chapter: number;
        verse: number;
        text_translated: string;
        book_code: string;
      }>();

    const results: SearchResult[] = result.results.map((item) => ({
      book: item.book_code.toLowerCase(),
      chapter: item.chapter,
      verse: item.verse,
      text: item.text_translated,
      highlight: highlightText(item.text_translated, searchTerm),
    }));

    const response: ApiResponse<SearchResult[]> = {
      success: true,
      data: results,
      meta: {
        count: results.length,
        total,
        query: searchTerm,
        layer,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error('Search error:', error);
    return c.json(
      {
        success: false,
        error: 'Erro interno ao processar busca',
      },
      500
    );
  }
});

export default search;

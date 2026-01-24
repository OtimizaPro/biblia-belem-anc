import { Hono } from 'hono';
import type { Env } from '../types';

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

search.get('/', async (c) => {
  try {
    const { q, book, limit = '20' } = c.req.query();

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

    const searchTerm = q.trim();
    const limitNum = Math.min(parseInt(limit) || 20, MAX_LIMIT);

    // Base query conditions
    let whereClause = 'v.text_translated LIKE ?';
    const params: (string | number)[] = [`%${searchTerm}%`];

    if (book) {
      // Validação básica do código do livro (geralmente 3-4 caracteres)
      if (book.length < 2 || book.length > 10) {
        return c.json(
          {
            success: false,
            error: 'Código de livro inválido',
          },
          400
        );
      }
      whereClause += ' AND b.code = ?';
      params.push(book.toUpperCase());
    }

    // Contar total de resultados
    const countSql = `
      SELECT COUNT(v.id) as total
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE ${whereClause}
    `;

    const countResult = await c.env.DB.prepare(countSql)
      .bind(...params)
      .first<{ total: number }>();

    const total = countResult?.total || 0;

    // Buscar resultados paginados
    const sql = `
      SELECT v.chapter, v.verse, v.text_translated, b.code as book_code
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE ${whereClause}
      ORDER BY b.canon_order, v.chapter, v.verse
      LIMIT ?
    `;

    // Adicionar limit aos parâmetros para a query principal
    const searchParams = [...params, limitNum];

    // Executar busca
    const result = await c.env.DB.prepare(sql)
      .bind(...searchParams)
      .all<{
        chapter: number;
        verse: number;
        text_translated: string;
        book_code: string;
      }>();

    // Formatar resultados
    const results: SearchResult[] = result.results.map((item) => ({
      book: item.book_code.toLowerCase(),
      chapter: item.chapter,
      verse: item.verse,
      text: item.text_translated,
      highlight: highlightText(item.text_translated, searchTerm),
    }));

    return c.json({
      success: true,
      results,
      total,
      query: searchTerm,
    });
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


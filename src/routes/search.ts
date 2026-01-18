import { Hono } from 'hono';
import type { Env, Verse } from '../types';

const search = new Hono<{ Bindings: Env }>();

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlight: string;
}

function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  // Escapar caracteres especiais da regex
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  
  return text.replace(regex, '<mark>$1</mark>');
}

search.get('/', async (c) => {
  try {
    const { q, book, limit = '20' } = c.req.query();

    if (!q || q.trim().length === 0) {
      return c.json(
        {
          success: false,
          error: 'Termo de busca obrigatório',
        },
        400
      );
    }

    const searchTerm = q.trim();
    const limitNum = parseInt(limit) || 20;

    // Base query conditions
    let whereClause = 'v.text_translated LIKE ?';
    const params: (string | number)[] = [`%${searchTerm}%`];

    if (book) {
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
    let sql = `
      SELECT v.chapter, v.verse, v.text_translated, b.code as book_code
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE ${whereClause}
      ORDER BY b.order_num, v.chapter, v.verse
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
      results,
      total,
      query: searchTerm,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na busca',
      },
      500
    );
  }
});

export default search;

import { Hono } from 'hono';
import type { Env, Book, ApiResponse } from '../types';

const books = new Hono<{ Bindings: Env }>();

// GET /api/v1/books - Lista todos os livros
books.get('/', async (c) => {
  try {
    const { testament } = c.req.query();

    let query = 'SELECT * FROM books';
    const params: string[] = [];

    if (testament) {
      query += ' WHERE testament = ?';
      params.push(testament.toUpperCase());
    }

    query += ' ORDER BY canon_order';

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all<Book>();

    const response: ApiResponse<Book[]> = {
      success: true,
      data: result.results,
      meta: {
        count: result.results.length,
      },
    };

    return c.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar livros',
    };
    return c.json(response, 500);
  }
});

// GET /api/v1/books/:code - Detalhes de um livro
books.get('/:code', async (c) => {
  try {
    const code = c.req.param('code').toUpperCase();

    const result = await c.env.DB.prepare('SELECT * FROM books WHERE code = ?')
      .bind(code)
      .first<Book>();

    if (!result) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Livro '${code}' não encontrado`,
      };
      return c.json(response, 404);
    }

    const response: ApiResponse<Book> = {
      success: true,
      data: result,
    };

    return c.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar livro',
    };
    return c.json(response, 500);
  }
});

export default books;

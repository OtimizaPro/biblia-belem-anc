import { Hono } from 'hono';
import type { Env, Verse, ApiResponse } from '../types';

const verses = new Hono<{ Bindings: Env }>();

const VALID_LAYERS = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];

// GET /api/v1/verses/:book/:chapter - Lista versos de um capítulo
verses.get('/:book/:chapter', async (c) => {
  try {
    const bookCode = c.req
      .param('book')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const chapter = parseInt(c.req.param('chapter'));
    const layer = (c.req.query('layer') || 'N0').toUpperCase();

    if (!VALID_LAYERS.includes(layer)) {
      return c.json(
        {
          success: false,
          error: `Layer inválido. Use: ${VALID_LAYERS.join(', ')}`,
        },
        400
      );
    }

    if (isNaN(chapter) || chapter < 1) {
      return c.json(
        {
          success: false,
          error: 'Capítulo inválido',
        },
        400
      );
    }

    // Buscar book_id pelo código
    const book = await c.env.DB.prepare('SELECT id FROM books WHERE code = ?')
      .bind(bookCode)
      .first<{ id: number }>();

    if (!book) {
      return c.json(
        {
          success: false,
          error: 'Livro não encontrado',
        },
        404
      );
    }

    const result = await c.env.DB.prepare(
      `
      SELECT v.*, vt.literal_pt, vt.readable_pt, vt.layer
      FROM verses v
      LEFT JOIN verse_translations vt ON v.id = vt.verse_id AND vt.layer = ?
      WHERE v.book_id = ? AND v.chapter = ?
      ORDER BY v.verse
    `
    )
      .bind(layer, book.id, chapter)
      .all<Verse>();

    if (result.results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'Capítulo não encontrado',
        },
        404
      );
    }

    const response: ApiResponse<Verse[]> = {
      success: true,
      data: result.results,
      meta: {
        count: result.results.length,
      },
    };

    return c.json(response);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar versos',
      },
      500
    );
  }
});

// GET /api/v1/verses/:book/:chapter/:verse - Verso único com tokens
verses.get('/:book/:chapter/:verse', async (c) => {
  try {
    const bookCode = c.req
      .param('book')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    const chapter = parseInt(c.req.param('chapter'));
    const verseNum = parseInt(c.req.param('verse'));

    if (isNaN(chapter) || isNaN(verseNum)) {
      return c.json(
        {
          success: false,
          error: 'Capítulo ou versículo inválido',
        },
        400
      );
    }

    // Buscar book_id
    const book = await c.env.DB.prepare('SELECT id FROM books WHERE code = ?')
      .bind(bookCode)
      .first<{ id: number }>();

    if (!book) {
      return c.json(
        {
          success: false,
          error: 'Livro não encontrado',
        },
        404
      );
    }

    // Buscar verso com tradução (layer selecionável)
    const layer = (c.req.query('layer') || 'N0').toUpperCase();
    if (!VALID_LAYERS.includes(layer)) {
      return c.json(
        {
          success: false,
          error: `Layer inválido. Use: ${VALID_LAYERS.join(', ')}`,
        },
        400
      );
    }

    const verse = await c.env.DB.prepare(
      `
      SELECT v.*, vt.literal_pt, vt.readable_pt, vt.layer
      FROM verses v
      LEFT JOIN verse_translations vt ON v.id = vt.verse_id AND vt.layer = ?
      WHERE v.book_id = ? AND v.chapter = ? AND v.verse = ?
    `
    )
      .bind(layer, book.id, chapter, verseNum)
      .first<Verse>();

    if (!verse) {
      return c.json(
        {
          success: false,
          error: 'Versículo não encontrado',
        },
        404
      );
    }

    // Buscar tokens do verso
    const tokens = await c.env.DB.prepare(
      `
      SELECT * FROM tokens
      WHERE verse_id = ?
      ORDER BY position
    `
    )
      .bind(verse.id)
      .all();

    return c.json({
      success: true,
      data: {
        ...verse,
        tokens: tokens.results,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar verso',
      },
      500
    );
  }
});

export default verses;

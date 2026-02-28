import { Hono } from 'hono';
import type { Env, Token, ApiResponse } from '../types';

const tokens = new Hono<{ Bindings: Env }>();

// GET /api/v1/tokens/:verseId - Tokens de um verso
tokens.get('/:verseId', async (c) => {
  try {
    const verseId = parseInt(c.req.param('verseId'));

    if (isNaN(verseId)) {
      return c.json(
        {
          success: false,
          error: 'ID de verso inválido',
        },
        400
      );
    }

    const result = await c.env.DB.prepare(
      `
      SELECT * FROM tokens
      WHERE verse_id = ?
      ORDER BY position
    `
    )
      .bind(verseId)
      .all<Token>();

    if (result.results.length === 0) {
      return c.json(
        {
          success: false,
          error: `Nenhum token encontrado para o verso ${verseId}`,
        },
        404
      );
    }

    const response: ApiResponse<Token[]> = {
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
        error: error instanceof Error ? error.message : 'Erro ao buscar tokens',
      },
      500
    );
  }
});

// GET /api/v1/tokens/:verseId/interlinear - Vista interlinear
tokens.get('/:verseId/interlinear', async (c) => {
  try {
    const verseId = parseInt(c.req.param('verseId'));

    if (isNaN(verseId)) {
      return c.json(
        {
          success: false,
          error: 'ID de verso inválido',
        },
        400
      );
    }

    // Buscar verso
    const verse = await c.env.DB.prepare(
      `
      SELECT v.*, b.code as book_code, b.name_pt as book_name
      FROM verses v
      JOIN books b ON v.book_id = b.id
      WHERE v.id = ?
    `
    )
      .bind(verseId)
      .first();

    if (!verse) {
      return c.json(
        {
          success: false,
          error: `Verso ${verseId} não encontrado`,
        },
        404
      );
    }

    // Buscar tokens do verso
    const tokens = await c.env.DB.prepare(
      `
      SELECT *
      FROM tokens
      WHERE verse_id = ?
      ORDER BY position
    `
    )
      .bind(verseId)
      .all();

    return c.json({
      success: true,
      data: {
        verse,
        interlinear: tokens.results.map((t: Record<string, unknown>) => ({
          position: t.position,
          original: t.text_utf8,
          transliteration: t.normalized,
          lemma: t.normalized,
          morphology: null,
          morphDescription: null,
          gloss: t.pt_literal,
        })),
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar interlinear',
      },
      500
    );
  }
});

// GET /api/v1/tokens/:verseId/morphology - Análise morfológica detalhada
tokens.get('/:verseId/morphology', async (c) => {
  try {
    const verseId = parseInt(c.req.param('verseId'));

    if (isNaN(verseId)) {
      return c.json(
        {
          success: false,
          error: 'ID de verso inválido',
        },
        400
      );
    }

    const result = await c.env.DB.prepare(
      `
      SELECT
        position,
        text_utf8,
        normalized,
        pt_literal,
        script
      FROM tokens
      WHERE verse_id = ?
      ORDER BY position
    `
    )
      .bind(verseId)
      .all();

    return c.json({
      success: true,
      data: result.results,
      meta: {
        count: result.results.length,
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar morfologia',
      },
      500
    );
  }
});

export default tokens;

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

    // Buscar tokens com morfologia
    const tokens = await c.env.DB.prepare(
      `
      SELECT t.*, m.description as morph_description
      FROM tokens t
      LEFT JOIN morphology m ON t.morph_code = m.code
      WHERE t.verse_id = ?
      ORDER BY t.position
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
          original: t.text_original,
          transliteration: t.text_transliterated,
          lemma: t.lemma,
          morphology: t.morph_code,
          morphDescription: t.morph_description,
          gloss: t.gloss,
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
        t.position,
        t.text_original,
        t.lemma,
        t.morph_code,
        m.description as morph_description,
        m.part_of_speech,
        m.person,
        m.gender,
        m.number as gram_number,
        m.tense,
        m.voice,
        m.mood,
        m.case_type
      FROM tokens t
      LEFT JOIN morphology m ON t.morph_code = m.code
      WHERE t.verse_id = ?
      ORDER BY t.position
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

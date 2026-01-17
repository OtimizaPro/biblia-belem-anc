import { Hono } from 'hono';
import type { Env, Gloss, ApiResponse } from '../types';

const glosses = new Hono<{ Bindings: Env }>();

// GET /api/v1/glosses/verse/:verseId - Glosses/camadas de um verso
glosses.get('/verse/:verseId', async (c) => {
  try {
    const verseId = parseInt(c.req.param('verseId'));
    const { layer } = c.req.query();

    if (isNaN(verseId)) {
      return c.json(
        {
          success: false,
          error: 'ID de verso inválido',
        },
        400
      );
    }

    let query = `
      SELECT g.*, v.chapter, v.verse, b.code as book_code
      FROM glosses g
      JOIN verses v ON g.verse_id = v.id
      JOIN books b ON v.book_id = b.id
      WHERE g.verse_id = ?
    `;
    const params: (string | number)[] = [verseId];

    if (layer) {
      const validLayers = ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'];
      if (!validLayers.includes(layer.toUpperCase())) {
        return c.json(
          {
            success: false,
            error: `Layer inválido. Use: ${validLayers.join(', ')}`,
          },
          400
        );
      }
      query += ' AND g.layer = ?';
      params.push(layer.toUpperCase());
    }

    query += ' ORDER BY g.layer';

    const result = await c.env.DB.prepare(query)
      .bind(...params)
      .all<Gloss>();

    if (result.results.length === 0) {
      return c.json(
        {
          success: false,
          error: `Nenhum gloss encontrado para o verso ${verseId}`,
        },
        404
      );
    }

    const response: ApiResponse<Gloss[]> = {
      success: true,
      data: result.results,
      meta: {
        count: result.results.length,
        layers: [...new Set(result.results.map((g: { layer: string }) => g.layer))],
      },
    };

    return c.json(response);
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar glosses',
      },
      500
    );
  }
});

// GET /api/v1/glosses/layers - Lista camadas disponíveis
glosses.get('/layers', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `
      SELECT DISTINCT layer, COUNT(*) as count
      FROM glosses
      GROUP BY layer
      ORDER BY layer
    `
    ).all();

    return c.json({
      success: true,
      data: result.results,
      meta: {
        description: {
          N0: 'Texto literal (imutável)',
          N1: 'Glossário mínimo',
          N2: 'Marcação morfológica',
          N3: 'Reordenação de leitura',
          N4: 'Expansão de elipses',
          N5: 'Alternativas lexicais',
        },
      },
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar camadas',
      },
      500
    );
  }
});

export default glosses;

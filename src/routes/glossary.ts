/**
 * API de Glossário - Bíblia Belém An.C 2025
 * Permite contribuição comunitária para traduções
 */

import { Hono } from 'hono';
import type { Env, ApiResponse } from '../types';

const glossaryRoutes = new Hono<{ Bindings: Env }>();

// Listar todas as entradas do glossário
glossaryRoutes.get('/', async (c) => {
  const db = c.env.DB;

  try {
    const { results } = await db
      .prepare(
        `
      SELECT word, translation, strongs, contributor, status, created_at
      FROM glossary
      ORDER BY word
    `
      )
      .all();

    const response: ApiResponse<typeof results> = {
      success: true,
      data: results,
      meta: {
        count: results.length,
      },
    };

    return c.json(response);
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Tabela de glossário não encontrada',
      },
      500
    );
  }
});

// Buscar tradução de uma palavra
glossaryRoutes.get('/:word', async (c) => {
  const db = c.env.DB;
  const word = decodeURIComponent(c.req.param('word'));

  try {
    const result = await db
      .prepare(
        `
      SELECT word, translation, strongs, notes, contributor, status
      FROM glossary
      WHERE word = ?
    `
      )
      .bind(word)
      .first();

    if (!result) {
      return c.json(
        {
          success: false,
          error: 'Palavra não encontrada no glossário',
        },
        404
      );
    }

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return c.json(response);
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Erro ao buscar palavra',
      },
      500
    );
  }
});

// Sugerir nova tradução (contribuição comunitária)
glossaryRoutes.post('/suggest', async (c) => {
  const db = c.env.DB;

  try {
    const body = await c.req.json();
    const { word, translation, strongs, notes, contributor } = body;

    if (!word || !translation) {
      return c.json(
        {
          success: false,
          error: 'Campos obrigatórios: word, translation',
        },
        400
      );
    }

    // Verificar se já existe
    const existing = await db
      .prepare(
        `
      SELECT id FROM glossary WHERE word = ?
    `
      )
      .bind(word)
      .first();

    if (existing) {
      // Criar sugestão de atualização
      await db
        .prepare(
          `
        INSERT INTO glossary_suggestions (word, translation, strongs, notes, contributor, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `
        )
        .bind(word, translation, strongs || null, notes || null, contributor || 'anonymous')
        .run();

      return c.json({
        success: true,
        data: {
          message: 'Sugestão de atualização registrada para revisão',
          status: 'pending_review',
        },
      });
    }

    // Criar nova entrada (pendente de aprovação)
    await db
      .prepare(
        `
      INSERT INTO glossary (word, translation, strongs, notes, contributor, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `
      )
      .bind(word, translation, strongs || null, notes || null, contributor || 'anonymous')
      .run();

    return c.json({
      success: true,
      data: {
        message: 'Sugestão de tradução registrada para revisão',
        status: 'pending_review',
      },
    });
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Erro ao registrar sugestão',
      },
      500
    );
  }
});

// Listar palavras sem tradução (para contribuidores)
glossaryRoutes.get('/missing/:book', async (c) => {
  const db = c.env.DB;
  const bookCode = c.req.param('book').toUpperCase();

  try {
    // Buscar palavras em colchetes que não estão no glossário
    const { results } = await db
      .prepare(
        `
      SELECT DISTINCT t.text_utf8 as word, COUNT(*) as frequency
      FROM tokens t
      JOIN verses v ON t.verse_id = v.id
      JOIN books b ON v.book_id = b.id
      LEFT JOIN glossary g ON t.text_utf8 = g.word
      WHERE b.code = ?
        AND t.pt_literal LIKE '[%]'
        AND g.word IS NULL
      GROUP BY t.text_utf8
      ORDER BY frequency DESC
      LIMIT 100
    `
      )
      .bind(bookCode)
      .all();

    const response: ApiResponse<typeof results> = {
      success: true,
      data: results,
      meta: {
        count: results.length,
        book: bookCode,
      },
    };

    return c.json(response);
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Erro ao buscar palavras faltantes',
      },
      500
    );
  }
});

// Estatísticas do glossário
glossaryRoutes.get('/stats/overview', async (c) => {
  const db = c.env.DB;

  try {
    const total = await db
      .prepare(`SELECT COUNT(*) as count FROM glossary`)
      .first<{ count: number }>();
    const approved = await db
      .prepare(`SELECT COUNT(*) as count FROM glossary WHERE status = 'approved'`)
      .first<{ count: number }>();
    const pending = await db
      .prepare(`SELECT COUNT(*) as count FROM glossary WHERE status = 'pending'`)
      .first<{ count: number }>();
    const contributors = await db
      .prepare(`SELECT COUNT(DISTINCT contributor) as count FROM glossary`)
      .first<{ count: number }>();

    const response: ApiResponse<{
      total_entries: number;
      approved: number;
      pending_review: number;
      contributors: number;
    }> = {
      success: true,
      data: {
        total_entries: Number(total?.count || 0),
        approved: Number(approved?.count || 0),
        pending_review: Number(pending?.count || 0),
        contributors: Number(contributors?.count || 0),
      },
    };

    return c.json(response);
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Tabela de glossário não encontrada',
      },
      500
    );
  }
});

export { glossaryRoutes };

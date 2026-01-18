import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import type { Env } from './types';

// Importar rotas
import books from './routes/books';
import verses from './routes/verses';
import tokens from './routes/tokens';
import glosses from './routes/glosses';
import { glossaryRoutes } from './routes/glossary';
import search from './routes/search';
import { openApiSpec } from './docs/openapi';

const app = new Hono<{ Bindings: Env }>();

// CORS - permitir acesso de qualquer origem (exeg.ai, etc)
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  })
);

// Cache para respostas (1 hora para dados estáticos)
app.use(
  '/api/*',
  cache({
    cacheName: 'biblia-belem-api',
    cacheControl: 'public, max-age=3600',
  })
);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'biblia-belem-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Documentação OpenAPI (para consumo por outros projetos)
app.get('/docs', (c) => {
  return c.json(openApiSpec);
});

// Documentação OpenAPI em formato YAML (para Swagger UI)
app.get('/docs/openapi.json', (c) => {
  return c.json(openApiSpec);
});

// Root - informações da API
app.get('/', (c) => {
  return c.json({
    name: 'Bíblia Belém An.C 2025 API',
    description: 'API REST para consulta da tradução bíblica literal rígida',
    version: '1.0.0',
    philosophy: 'Você lê. E a interpretação é sua.',
    endpoints: {
      health: 'GET /health',
      books: {
        list: 'GET /api/v1/books',
        detail: 'GET /api/v1/books/:code',
      },
      verses: {
        chapter: 'GET /api/v1/verses/:book/:chapter',
        single: 'GET /api/v1/verses/:book/:chapter/:verse',
        search: 'GET /api/v1/verses/search?q=term',
      },
      tokens: {
        list: 'GET /api/v1/tokens/:verseId',
        interlinear: 'GET /api/v1/tokens/:verseId/interlinear',
        morphology: 'GET /api/v1/tokens/:verseId/morphology',
      },
      glosses: {
        verse: 'GET /api/v1/glosses/verse/:verseId',
        layers: 'GET /api/v1/glosses/layers',
      },
    },
    sources: [
      'BHSA (Biblia Hebraica Stuttgartensia)',
      'WLC (Westminster Leningrad Codex)',
      'SBLGNT (SBL Greek New Testament)',
      'TR1550 (Textus Receptus 1550)',
      'Nestle 1904',
    ],
    documentation: '/docs',
  });
});

// Montar rotas
app.route('/api/v1/books', books);
app.route('/api/v1/verses', verses);
app.route('/api/v1/tokens', tokens);
app.route('/api/v1/glosses', glosses);
app.route('/api/v1/glossary', glossaryRoutes);
app.route('/api/v1/search', search);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Endpoint não encontrado',
      path: c.req.path,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      success: false,
      error: 'Erro interno do servidor',
      message: err.message,
    },
    500
  );
});

export default app;

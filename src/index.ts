// ============================================================================
// Bíblia Belem An.C 2025 — Tradução literal rígida por Belem Anderson Costa
// An.C = Anderson Costa | CC BY 4.0
// https://github.com/OtimizaPro/biblia-belem-anc
// ============================================================================

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import type { Env } from './types';
import { PROJECT_ATTRIBUTION } from './types';

// Importar rotas
import books from './routes/books';
import verses from './routes/verses';
import tokens from './routes/tokens';
import glosses from './routes/glosses';
import translationInfo from './routes/translation-info';
import { glossaryRoutes } from './routes/glossary';
import search from './routes/search';
import dss from './routes/dss';
import { openApiSpec } from './docs/openapi';
import { rateLimit } from './middleware/rate-limit';

const app = new Hono<{ Bindings: Env }>();

// CORS - permitir acesso de qualquer origem (exeg.ai, etc)
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'OPTIONS', 'POST'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  })
);

// Security headers + Attribution watermark (CC BY 4.0)
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  // Marca d'água de atribuição — An.C = Anderson Costa
  c.res.headers.set('X-Project', PROJECT_ATTRIBUTION.project);
  c.res.headers.set('X-Author', PROJECT_ATTRIBUTION.author);
  c.res.headers.set('X-License', PROJECT_ATTRIBUTION.license);
  c.res.headers.set('X-Repository', PROJECT_ATTRIBUTION.repository);
});

// Rate limiting (100 req/min per IP)
app.use('/api/*', rateLimit);

// Cache para respostas (1 hora para dados estáticos)
app.use(
  '/api/*',
  cache({
    cacheName: 'biblia-belem-api',
    cacheControl: 'public, max-age=3600',
  })
);

// Health check — com marca d'água de atribuição
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'biblia-belem-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    project: PROJECT_ATTRIBUTION.project,
    author: PROJECT_ATTRIBUTION.author,
    license: PROJECT_ATTRIBUTION.license,
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

// Root - informações da API com marca d'água de atribuição
app.get('/', (c) => {
  return c.json({
    name: 'Bíblia Belem An.C 2025 API',
    description: 'API REST para consulta da tradução bíblica literal rígida',
    version: '1.0.0',
    // Marca d'água de fundação — An.C = Anderson Costa
    attribution: {
      project: PROJECT_ATTRIBUTION.project,
      meaning: PROJECT_ATTRIBUTION.meaning,
      author: PROJECT_ATTRIBUTION.author,
      license: PROJECT_ATTRIBUTION.license,
      repository: PROJECT_ATTRIBUTION.repository,
      website: PROJECT_ATTRIBUTION.website,
      attribution_required: PROJECT_ATTRIBUTION.attribution_required,
    },
    philosophy: PROJECT_ATTRIBUTION.philosophy,
    endpoints: {
      health: 'GET /health',
      books: {
        list: 'GET /api/v1/books',
        detail: 'GET /api/v1/books/:code',
      },
      verses: {
        chapter: 'GET /api/v1/verses/:book/:chapter?layer=N0',
        single: 'GET /api/v1/verses/:book/:chapter/:verse?layer=N0',
        search: 'GET /api/v1/verses/search?q=term&layer=N0',
        layers:
          'N0=literal, N1=glossário, N2=morfologia, N3=reordenação, N4=expansão, N5=alternativas',
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
      translationInfo: {
        overview: 'GET /api/v1/translation-info',
        editorialMarkers: 'GET /api/v1/translation-info/editorial-markers',
        wordsNotTranslated: 'GET /api/v1/translation-info/words-not-translated',
        wordDetail: 'GET /api/v1/translation-info/word/:word',
      },
    },
    sources: [
      'BHSA (Biblia Hebraica Stuttgartensia)',
      'WLC (Westminster Leningrad Codex)',
      'SBLGNT (SBL Greek New Testament)',
      'TR1550 (Textus Receptus 1550)',
      'Nestle 1904',
      'DSS/Qumran (Dead Sea Scrolls — ETCBC/dss, ~1001 manuscripts)',
    ],
    documentation: '/docs',
  });
});

// Montar rotas (search antes de verses para prioridade de matching)
app.route('/api/v1/books', books);
app.route('/api/v1/verses/search', search);
app.route('/api/v1/search', search);
app.route('/api/v1/verses', verses);
app.route('/api/v1/tokens', tokens);
app.route('/api/v1/glosses', glosses);
app.route('/api/v1/glossary', glossaryRoutes);
app.route('/api/v1/translation-info', translationInfo);
app.route('/api/v1/dss', dss);

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

// Error handler - não expõe detalhes internos em produção
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      success: false,
      error: 'Erro interno do servidor',
    },
    500
  );
});

export default app;

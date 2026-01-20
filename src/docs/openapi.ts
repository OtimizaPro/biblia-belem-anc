export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Bíblia Belém An.C 2025 API',
    description:
      'API REST para consulta da tradução bíblica literal rígida. Filosofia: "Você lê. E a interpretação é sua."',
    version: '1.0.0',
    contact: {
      name: 'A Culpa é das Ovelhas',
      url: 'https://aculpaedasovelhas.org',
    },
  },
  servers: [
    {
      url: 'https://biblia-belem-api.anderson-282.workers.dev',
      description: 'Produção',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Sistema'],
        responses: {
          '200': {
            description: 'API funcionando',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'biblia-belem-api' },
                    version: { type: 'string', example: '1.0.0' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/books': {
      get: {
        summary: 'Listar todos os livros',
        tags: ['Livros'],
        parameters: [
          {
            name: 'testament',
            in: 'query',
            description: 'Filtrar por testamento',
            schema: { type: 'string', enum: ['AT', 'NT'] },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de livros',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Book' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        count: { type: 'integer', example: 66 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/books/{code}': {
      get: {
        summary: 'Detalhes de um livro',
        tags: ['Livros'],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Código do livro (ex: GEN, EXO, MAT, JHN)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Detalhes do livro',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Book' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Livro não encontrado',
          },
        },
      },
    },
    '/api/v1/verses/{book}/{chapter}': {
      get: {
        summary: 'Versículos de um capítulo',
        tags: ['Versículos'],
        parameters: [
          {
            name: 'book',
            in: 'path',
            required: true,
            description: 'Código do livro',
            schema: { type: 'string' },
          },
          {
            name: 'chapter',
            in: 'path',
            required: true,
            description: 'Número do capítulo',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de versículos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Verse' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/verses/{book}/{chapter}/{verse}': {
      get: {
        summary: 'Versículo único com tokens',
        tags: ['Versículos'],
        parameters: [
          {
            name: 'book',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'chapter',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'verse',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Versículo com tokens morfológicos',
          },
        },
      },
    },
    '/api/v1/verses/search': {
      get: {
        summary: 'Buscar versículos',
        tags: ['Versículos'],
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Termo de busca',
            schema: { type: 'string' },
          },
          {
            name: 'book',
            in: 'query',
            description: 'Filtrar por livro',
            schema: { type: 'string' },
          },
          {
            name: 'testament',
            in: 'query',
            description: 'Filtrar por testamento',
            schema: { type: 'string', enum: ['AT', 'NT'] },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Limite de resultados (padrão: 100)',
            schema: { type: 'integer', default: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Resultados da busca',
          },
        },
      },
    },
    '/api/v1/tokens/{verseId}': {
      get: {
        summary: 'Tokens de um versículo',
        tags: ['Tokens'],
        parameters: [
          {
            name: 'verseId',
            in: 'path',
            required: true,
            description: 'ID do versículo',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de tokens',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Token' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/tokens/{verseId}/interlinear': {
      get: {
        summary: 'Vista interlinear',
        tags: ['Tokens'],
        parameters: [
          {
            name: 'verseId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Dados interlineares' },
        },
      },
    },
    '/api/v1/tokens/{verseId}/morphology': {
      get: {
        summary: 'Análise morfológica',
        tags: ['Tokens'],
        parameters: [
          {
            name: 'verseId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Dados morfológicos detalhados' },
        },
      },
    },
    '/api/v1/glosses/verse/{verseId}': {
      get: {
        summary: 'Glosses de um versículo',
        tags: ['Glosses'],
        parameters: [
          {
            name: 'verseId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'layer',
            in: 'query',
            description: 'Filtrar por camada',
            schema: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'] },
          },
        ],
        responses: {
          '200': { description: 'Glosses do versículo' },
        },
      },
    },
    '/api/v1/glosses/layers': {
      get: {
        summary: 'Listar camadas de glosses',
        tags: ['Glosses'],
        responses: {
          '200': {
            description: 'Lista de camadas com descrição',
          },
        },
      },
    },
    '/api/v1/translation-info': {
      get: {
        summary: 'Informações sobre anotações de tradução',
        tags: ['Tradução'],
        description:
          'Retorna documentação completa sobre marcadores editoriais e palavras não traduzidas',
        responses: {
          '200': {
            description: 'Informações sobre tradução e filosofia literal rígida',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        philosophy: {
                          type: 'string',
                          example: 'Você lê. E a interpretação é sua.',
                        },
                        editorial_markers: { type: 'object' },
                        words_not_translated: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/translation-info/editorial-markers': {
      get: {
        summary: 'Marcadores editoriais',
        tags: ['Tradução'],
        description:
          'Detalhes sobre [OBJ], [elipse], etc - por que cada marcador está em colchetes',
        responses: {
          '200': {
            description: 'Documentação de marcadores editoriais com exemplos',
          },
        },
      },
    },
    '/api/v1/translation-info/words-not-translated': {
      get: {
        summary: 'Palavras não traduzidas',
        tags: ['Tradução'],
        description: 'Explicação de por que yhwh, Theos, Iesous e Christos não são traduzidas',
        responses: {
          '200': {
            description: 'Lista de categorias com motivos, contexto histórico e orientações',
          },
        },
      },
    },
    '/api/v1/translation-info/word/{word}': {
      get: {
        summary: 'Informação de uma palavra específica',
        tags: ['Tradução'],
        parameters: [
          {
            name: 'word',
            in: 'path',
            required: true,
            description: 'Palavra ou marcador (ex: yhwh, [OBJ], Theos)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Informações detalhadas sobre a palavra',
          },
          '404': {
            description: 'Palavra não encontrada',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Book: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          code: { type: 'string', example: 'GEN' },
          name_pt: { type: 'string', example: 'Gênesis' },
          name_original: { type: 'string', example: 'בְּרֵאשִׁית' },
          testament: { type: 'string', enum: ['AT', 'NT'], example: 'AT' },
          trad_group: { type: 'string', example: 'HEB_TM' },
          chapters_count: { type: 'integer', example: 50 },
          canon_order: { type: 'integer', example: 1 },
        },
      },
      Verse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 6383 },
          book_id: { type: 'integer', example: 1 },
          chapter: { type: 'integer', example: 1 },
          verse: { type: 'integer', example: 1 },
          text_original: { type: 'string' },
          text_translated: { type: 'string' },
          language: { type: 'string', enum: ['HE', 'ARM', 'GRC'] },
        },
      },
      Token: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          verse_id: { type: 'integer' },
          position: { type: 'integer' },
          text_utf8: { type: 'string', example: 'בְּרֵאשִׁ֖ית' },
          script: { type: 'string', example: 'HE' },
          normalized: { type: 'string', example: 'בראשית' },
          pt_literal: { type: 'string', example: 'No-princípio' },
        },
      },
      Gloss: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          verse_id: { type: 'integer' },
          layer: { type: 'string', enum: ['N0', 'N1', 'N2', 'N3', 'N4', 'N5'] },
          text: { type: 'string' },
        },
      },
    },
  },
  tags: [
    { name: 'Sistema', description: 'Endpoints de sistema' },
    { name: 'Livros', description: 'Consulta de livros bíblicos' },
    { name: 'Versículos', description: 'Consulta de versículos' },
    { name: 'Tokens', description: 'Análise morfológica de palavras' },
    { name: 'Glosses', description: 'Camadas de anotação' },
    {
      name: 'Tradução',
      description: 'Informações sobre marcadores editoriais e palavras não traduzidas',
    },
  ],
};

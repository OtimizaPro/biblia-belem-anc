import { Hono } from 'hono';
import type { Env } from '../types';
import translationNotes from '../data/translation-notes.json';
import editorialDecisions from '../data/editorial-decisions.json';

interface TranslationNote {
  words?: string[];
  [key: string]: unknown;
}

const translationInfo = new Hono<{ Bindings: Env }>();

// GET /api/v1/translation-info - Informações sobre anotações de tradução
translationInfo.get('/', (c) => {
  return c.json({
    success: true,
    data: translationNotes,
  });
});

// GET /api/v1/translation-info/editorial-markers - Detalhes sobre marcadores editoriais
translationInfo.get('/editorial-markers', (c) => {
  return c.json({
    success: true,
    data: {
      philosophy: translationNotes.philosophy,
      description: 'Marcadores editoriais explicam estratégias de tradução literal rígida',
      markers: translationNotes.editorial_markers,
    },
  });
});

// GET /api/v1/translation-info/words-not-translated - Palavras não traduzidas e seus motivos
translationInfo.get('/words-not-translated', (c) => {
  return c.json({
    success: true,
    data: {
      philosophy: translationNotes.philosophy,
      description: 'Palavras mantidas no original - motivos e contexto',
      categories: translationNotes.words_not_translated,
    },
  });
});

// GET /api/v1/translation-info/editorial-decisions - Decisões editoriais estruturais
translationInfo.get('/editorial-decisions', (c) => {
  return c.json({
    success: true,
    data: editorialDecisions,
  });
});

// GET /api/v1/translation-info/editorial-decisions/verses - Informação sobre remoção de versículos
translationInfo.get('/editorial-decisions/verses', (c) => {
  return c.json({
    success: true,
    data: {
      decision: editorialDecisions.no_verse_markers,
      note: 'Os livros originais não possuíam marcadores de versículos. Esta estrutura foi restaurada para fidelidade literal.',
    },
  });
});

// GET /api/v1/translation-info/word/:word - Informação específica de uma palavra
translationInfo.get('/word/:word', (c) => {
  const word = c.req.param('word').toLowerCase();

  // Procurar em words_not_translated
  for (const [key, value] of Object.entries(
    translationNotes.words_not_translated as Record<string, TranslationNote>
  )) {
    if (
      key.toLowerCase() === word ||
      (value.words &&
        Array.isArray(value.words) &&
        value.words.some((w: string) => w.toLowerCase() === word))
    ) {
      return c.json({
        success: true,
        data: {
          word,
          category: key,
          ...value,
        },
      });
    }
  }

  // Procurar em editorial_markers
  for (const [key, value] of Object.entries(
    translationNotes.editorial_markers as Record<string, TranslationNote>
  )) {
    if (key.toLowerCase() === word) {
      return c.json({
        success: true,
        data: {
          word,
          type: 'editorial_marker',
          ...value,
        },
      });
    }
  }

  return c.json(
    {
      success: false,
      error: `Palavra '${word}' não encontrada na base de dados de notas de tradução`,
    },
    404
  );
});

export default translationInfo;

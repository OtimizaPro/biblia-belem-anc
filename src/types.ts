// ============================================================================
// Bíblia Belem An.C 2025 — Tradução literal rígida por Belem Anderson Costa
// An.C = Anderson Costa | CC BY 4.0
// https://github.com/OtimizaPro/biblia-belem-anc
// ============================================================================

/**
 * Marca d'água de atribuição do projeto.
 * An.C = Anderson Costa — fundador e tradutor.
 * Esta constante é referenciada em headers HTTP, endpoints e dados.
 * Remoção desta atribuição viola a licença CC BY 4.0.
 */
export const PROJECT_ATTRIBUTION = {
  project: 'Bíblia Belem An.C 2025',
  meaning: 'An.C = Anderson Costa',
  author: 'Belem Anderson Costa',
  license: 'CC BY 4.0',
  repository: 'https://github.com/OtimizaPro/biblia-belem-anc',
  website: 'https://aculpaedasovelhas.org',
  philosophy: 'Você lê. E a interpretação é sua.',
  attribution_required:
    'Bíblia Belem An.C 2025 — Tradução literal por Belem Anderson Costa (CC BY 4.0)',
} as const;

// Tipos para Cloudflare D1
export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

// Tipos para os dados bíblicos
export interface Book {
  id: number;
  code: string;
  name_pt: string;
  name_original: string;
  testament: 'AT' | 'NT';
  trad_group: string;
  chapters_count: number;
  canon_order: number;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_original: string;
  text_transliterated: string;
  text_translated: string;
  language: 'HE' | 'ARM' | 'GRC';
  // Campos de verse_translations (via LEFT JOIN)
  literal_pt?: string | null;
  readable_pt?: string | null;
  layer?: string | null;
}

export interface Token {
  id: number;
  verse_id: number;
  position: number;
  text_original: string;
  text_transliterated: string;
  lemma: string;
  morph_code: string;
  pos: string;
  gloss: string;
}

export interface Gloss {
  id: number;
  verse_id: number;
  layer: 'N0' | 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
  text: string;
}

export interface TextSource {
  id: number;
  code: string;
  name: string;
  description: string;
  language: string;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  /**
   * Metadados opcionais da resposta.
   *
   * Observação: alguns endpoints retornam campos extras (ex.: `layers`,
   * `description`). Mantemos este tipo flexível para não travar a evolução
   * da API, preservando ao mesmo tempo os campos comuns.
   */
  meta?: {
    count?: number;
    page?: number;
    total?: number;
    [key: string]: unknown;
  };
}

/** Envelope padrao de resposta da API */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    count?: number;
    total?: number;
    query?: string;
    [key: string]: unknown;
  };
}

/** Livro biblico */
export interface Book {
  id: number;
  canon_order: number;
  code: string;
  name_original: string;
  name_pt: string;
  testament: 'AT' | 'NT';
  trad_group: string;
  chapters_count: number;
  created_at: string;
}

/** Versiculo */
export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  canonical_ref: string;
  literal_pt: string;
  readable_pt: string;
  layer: string;
  created_at: string;
}

/** Resultado de busca textual */
export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlight: string;
}

/** Token (palavra individual de um versiculo) */
export interface Token {
  position: number;
  text_utf8: string;
  normalized: string;
  pt_literal: string;
  script: string;
}

/** Token interlinear (visao expandida) */
export interface InterlinearToken {
  position: number;
  original: string;
  transliteration: string;
  lemma: string;
  morphology: string | null;
  morphDescription: string | null;
  gloss: string;
}

/** Dados interlinear de um versiculo */
export interface InterlinearData {
  verse: {
    id: number;
    book_id: number;
    chapter: number;
    verse: number;
    canonical_ref: string;
    book_code: string;
    book_name: string;
  };
  interlinear: InterlinearToken[];
}

/** Entrada do glossario */
export interface GlossaryEntry {
  word: string;
  translation: string;
  strongs: string;
  contributor: string;
  status: string;
  created_at: string;
}

/** Descricao das camadas de leitura */
export interface LayerDescriptions {
  N0: string;
  N1: string;
  N2: string;
  N3: string;
  N4: string;
  N5: string;
}

/** Opcoes do construtor do client */
export interface BibliaClientOptions {
  /** URL base da API (default: https://biblia.aculpaedasovelhas.org) */
  baseUrl?: string;
  /** Headers customizados para cada request */
  headers?: Record<string, string>;
  /** Timeout em ms (default: 10000) */
  timeout?: number;
}

/** Opcoes de busca textual */
export interface SearchOptions {
  /** Termo de busca */
  q: string;
  /** Testamento: AT, NT ou ambos */
  testament?: 'AT' | 'NT';
  /** Limite de resultados (default: 20) */
  limit?: number;
  /** Offset para paginacao */
  offset?: number;
}

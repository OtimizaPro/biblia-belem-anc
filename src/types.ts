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
}

export interface Token {
  id: number;
  verse_id: number;
  position: number;
  text_original: string;
  text_transliterated: string;
  lemma: string;
  morph_code: string;
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
  meta?: {
    count?: number;
    page?: number;
    total?: number;
  };
}

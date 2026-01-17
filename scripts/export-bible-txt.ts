/**
 * Script de Exportação: Bíblia Belém An.C 2025
 *
 * Exporta os 66 livros em formato TXT usando a tradução literal rígida.
 * Método: Fiel ao códice original, sem suavização, sem normalização.
 *
 * Execução:
 *   npx wrangler d1 execute biblia-belem --remote --file=scripts/export-query.sql > output.json
 */

interface Book {
  id: number;
  code: string;
  name_pt: string;
  testament: string;
  chapters_count: number;
  canon_order: number;
}

interface TokenRow {
  book_code: string;
  book_name: string;
  chapter: number;
  verse: number;
  position: number;
  text_utf8: string;
  pt_literal: string;
}

// SQL queries para exportação
export const queries = {
  // Lista todos os livros
  listBooks: `
    SELECT id, code, name_pt, testament, chapters_count, canon_order
    FROM books
    ORDER BY canon_order
  `,

  // Exporta todos os tokens com pt_literal de um livro
  exportBook: (bookCode: string) => `
    SELECT
      b.code as book_code,
      b.name_pt as book_name,
      v.chapter,
      v.verse,
      t.position,
      t.text_utf8,
      t.pt_literal
    FROM tokens t
    JOIN verses v ON t.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE b.code = '${bookCode}'
    ORDER BY v.chapter, v.verse, t.position
  `,

  // Conta versículos por livro
  countVerses: `
    SELECT b.code, b.name_pt, COUNT(v.id) as verse_count
    FROM books b
    LEFT JOIN verses v ON b.id = v.book_id
    GROUP BY b.id
    ORDER BY b.canon_order
  `,

  // Verifica tokens sem tradução
  missingTranslations: `
    SELECT b.code, COUNT(*) as missing
    FROM tokens t
    JOIN verses v ON t.verse_id = v.id
    JOIN books b ON v.book_id = b.id
    WHERE t.pt_literal IS NULL
    GROUP BY b.id
    ORDER BY b.canon_order
  `
};

/**
 * Formata os tokens de um versículo em texto traduzido
 */
export function formatVerse(tokens: { position: number; pt_literal: string | null }[]): string {
  return tokens
    .sort((a, b) => a.position - b.position)
    .map(t => t.pt_literal || '[?]')
    .join(' ');
}

/**
 * Formata um livro completo em TXT
 */
export function formatBook(bookName: string, tokens: TokenRow[]): string {
  const lines: string[] = [];

  // Cabeçalho
  lines.push(`${'='.repeat(60)}`);
  lines.push(`${bookName.toUpperCase()}`);
  lines.push(`Tradução: Belém An.C 2025`);
  lines.push(`Método: Literal Rígido - Fiel ao códice original`);
  lines.push(`${'='.repeat(60)}`);
  lines.push('');

  // Agrupa por capítulo e versículo
  const chapters = new Map<number, Map<number, TokenRow[]>>();

  for (const token of tokens) {
    if (!chapters.has(token.chapter)) {
      chapters.set(token.chapter, new Map());
    }
    const chapterMap = chapters.get(token.chapter)!;
    if (!chapterMap.has(token.verse)) {
      chapterMap.set(token.verse, []);
    }
    chapterMap.get(token.verse)!.push(token);
  }

  // Formata cada capítulo
  for (const [chapter, verses] of Array.from(chapters.entries()).sort((a, b) => a[0] - b[0])) {
    lines.push(`--- Capítulo ${chapter} ---`);
    lines.push('');

    for (const [verse, verseTokens] of Array.from(verses.entries()).sort((a, b) => a[0] - b[0])) {
      const text = formatVerse(verseTokens);
      lines.push(`${verse}  ${text}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// Códigos dos 66 livros canônicos
export const CANON_66 = [
  // Antigo Testamento (39 livros)
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU',  // Pentateuco
  'JOS', 'JDG', 'RUT', '1SA', '2SA',  // Históricos
  '1KI', '2KI', '1CH', '2CH', 'EZR',
  'NEH', 'EST',
  'JOB', 'PSA', 'PRO', 'ECC', 'SNG',  // Poéticos
  'ISA', 'JER', 'LAM', 'EZK', 'DAN',  // Profetas Maiores
  'HOS', 'JOL', 'AMO', 'OBA', 'JON',  // Profetas Menores
  'MIC', 'NAM', 'HAB', 'ZEP', 'HAG',
  'ZEC', 'MAL',
  // Novo Testamento (27 livros)
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT',  // Evangelhos + Atos
  'ROM', '1CO', '2CO', 'GAL', 'EPH',  // Epístolas Paulinas
  'PHP', 'COL', '1TH', '2TH', '1TI',
  '2TI', 'TIT', 'PHM',
  'HEB', 'JAS', '1PE', '2PE', '1JN',  // Epístolas Gerais
  '2JN', '3JN', 'JUD', 'REV'          // Apocalipse
];

console.log('Script de exportação carregado.');
console.log(`Total de livros: ${CANON_66.length}`);

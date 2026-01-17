/**
 * Exportador da Bíblia Belém An.C 2025
 *
 * Exporta os 66 livros em formato TXT usando a API REST.
 * Método: Fiel, Literal, Rígido ao códice original
 *
 * Execução: node scripts/export-all-books.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const API_BASE = 'https://biblia-belem-api.anderson-282.workers.dev';

// Nomes dos livros em português
const BOOK_NAMES = {
  'GEN': 'Gênesis', 'EXO': 'Êxodo', 'LEV': 'Levítico', 'NUM': 'Números',
  'DEU': 'Deuteronômio', 'JOS': 'Josué', 'JDG': 'Juízes', 'RUT': 'Rute',
  '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Reis', '2KI': '2 Reis',
  '1CH': '1 Crônicas', '2CH': '2 Crônicas', 'EZR': 'Esdras', 'NEH': 'Neemias',
  'EST': 'Ester', 'JOB': 'Jó', 'PSA': 'Salmos', 'PRO': 'Provérbios',
  'ECC': 'Eclesiastes', 'SNG': 'Cantares', 'ISA': 'Isaías', 'JER': 'Jeremias',
  'LAM': 'Lamentações', 'EZK': 'Ezequiel', 'DAN': 'Daniel', 'HOS': 'Oseias',
  'JOL': 'Joel', 'AMO': 'Amós', 'OBA': 'Obadias', 'JON': 'Jonas',
  'MIC': 'Miqueias', 'NAM': 'Naum', 'HAB': 'Habacuque', 'ZEP': 'Sofonias',
  'HAG': 'Ageu', 'ZEC': 'Zacarias', 'MAL': 'Malaquias',
  'MAT': 'Mateus', 'MRK': 'Marcos', 'LUK': 'Lucas', 'JHN': 'João',
  'ACT': 'Atos', 'ROM': 'Romanos', '1CO': '1 Coríntios', '2CO': '2 Coríntios',
  'GAL': 'Gálatas', 'EPH': 'Efésios', 'PHP': 'Filipenses', 'COL': 'Colossenses',
  '1TH': '1 Tessalonicenses', '2TH': '2 Tessalonicenses', '1TI': '1 Timóteo',
  '2TI': '2 Timóteo', 'TIT': 'Tito', 'PHM': 'Filemom', 'HEB': 'Hebreus',
  'JAS': 'Tiago', '1PE': '1 Pedro', '2PE': '2 Pedro', '1JN': '1 João',
  '2JN': '2 João', '3JN': '3 João', 'JUD': 'Judas', 'REV': 'Apocalipse'
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getBooks() {
  const { data } = await fetchJSON(`${API_BASE}/api/v1/books`);
  return data;
}

async function getChapter(bookCode, chapter) {
  const { data } = await fetchJSON(`${API_BASE}/api/v1/verses/${bookCode}/${chapter}`);
  return data;
}

async function getTokens(verseId) {
  try {
    const { data } = await fetchJSON(`${API_BASE}/api/v1/tokens/${verseId}`);
    return data;
  } catch {
    return [];
  }
}

function formatVerseText(tokens) {
  if (!tokens || tokens.length === 0) return '[sem tradução]';
  return tokens
    .sort((a, b) => a.position - b.position)
    .map(t => t.pt_literal || '[?]')
    .join(' ');
}

async function exportBook(book, outputDir) {
  const { code, name_pt, chapters_count } = book;
  console.log(`\n[${code}] ${name_pt} - ${chapters_count} capítulos`);

  const lines = [];

  // Cabeçalho
  lines.push('═'.repeat(70));
  lines.push(`${name_pt.toUpperCase()}`);
  lines.push('');
  lines.push('Tradução: Bíblia Belém An.C 2025');
  lines.push('Método: Literal Rígido - Fiel ao códice original');
  lines.push('Sem suavização. Sem normalização. Sem interferência do tradutor.');
  lines.push('═'.repeat(70));
  lines.push('');

  let totalVerses = 0;
  let translatedVerses = 0;

  // Processar cada capítulo
  for (let chapter = 1; chapter <= chapters_count; chapter++) {
    process.stdout.write(`  Cap. ${chapter}/${chapters_count}\r`);

    try {
      const verses = await getChapter(code, chapter);

      if (verses && verses.length > 0) {
        lines.push(`── Capítulo ${chapter} ──`);
        lines.push('');

        for (const verse of verses) {
          totalVerses++;
          const tokens = await getTokens(verse.id);
          const text = formatVerseText(tokens);

          if (text !== '[sem tradução]') {
            translatedVerses++;
          }

          lines.push(`${verse.verse}  ${text}`);

          // Rate limiting
          await new Promise(r => setTimeout(r, 50));
        }

        lines.push('');
      }
    } catch (err) {
      console.error(`  Erro no capítulo ${chapter}: ${err.message}`);
    }
  }

  // Rodapé com estatísticas
  lines.push('─'.repeat(70));
  lines.push(`Total de versículos: ${totalVerses}`);
  lines.push(`Versículos traduzidos: ${translatedVerses}`);
  lines.push(`Cobertura: ${((translatedVerses / totalVerses) * 100).toFixed(1)}%`);
  lines.push('─'.repeat(70));

  // Salvar arquivo
  const filename = `${String(book.canon_order).padStart(2, '0')}_${code}_${name_pt.replace(/\s/g, '_')}.txt`;
  const filepath = join(outputDir, filename);
  writeFileSync(filepath, lines.join('\n'), 'utf8');

  console.log(`  ✓ ${filename} (${translatedVerses}/${totalVerses} versos)`);

  return { code, name_pt, totalVerses, translatedVerses };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║       EXPORTADOR - BÍBLIA BELÉM An.C 2025                        ║');
  console.log('║       Tradução Literal Rígida - 66 Livros Canônicos              ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // Criar pasta de saída
  const outputDir = join(process.cwd(), 'export', 'txt');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\nPasta de saída: ${outputDir}`);
  console.log('\nBuscando lista de livros...');

  const books = await getBooks();
  console.log(`Encontrados: ${books.length} livros`);

  const stats = [];

  for (const book of books) {
    const result = await exportBook(book, outputDir);
    stats.push(result);
  }

  // Resumo final
  console.log('\n' + '═'.repeat(70));
  console.log('RESUMO DA EXPORTAÇÃO');
  console.log('═'.repeat(70));

  const totalVerses = stats.reduce((sum, s) => sum + s.totalVerses, 0);
  const translatedVerses = stats.reduce((sum, s) => sum + s.translatedVerses, 0);

  console.log(`Livros exportados: ${stats.length}`);
  console.log(`Total de versículos: ${totalVerses}`);
  console.log(`Versículos traduzidos: ${translatedVerses}`);
  console.log(`Cobertura geral: ${((translatedVerses / totalVerses) * 100).toFixed(1)}%`);
  console.log('═'.repeat(70));

  // Salvar índice
  const indexLines = [
    'BÍBLIA BELÉM An.C 2025 - ÍNDICE',
    '═'.repeat(50),
    '',
    'Tradução Literal Rígida',
    'Fiel ao códice original sem suavização',
    '',
    '─'.repeat(50),
    ''
  ];

  for (const s of stats) {
    const coverage = ((s.translatedVerses / s.totalVerses) * 100).toFixed(0);
    indexLines.push(`${s.code.padEnd(4)} ${s.name_pt.padEnd(20)} ${s.translatedVerses}/${s.totalVerses} (${coverage}%)`);
  }

  indexLines.push('');
  indexLines.push('─'.repeat(50));
  indexLines.push(`TOTAL: ${translatedVerses}/${totalVerses} versículos`);

  writeFileSync(join(outputDir, '00_INDICE.txt'), indexLines.join('\n'), 'utf8');
  console.log('\n✓ Índice salvo em 00_INDICE.txt');
}

main().catch(console.error);

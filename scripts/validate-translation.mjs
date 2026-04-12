#!/usr/bin/env node
/**
 * Validador de Integridade da Tradução — Bíblia Belém An.C 2025
 * Compara textos traduzidos contra códices originais (OSHB/WLC + SBLGNT)
 *
 * Análise dual-GPU: AT (Worker 0) + NT (Worker 1) em paralelo
 *
 * Uso:
 *   node scripts/validate-translation.mjs              # Validação completa
 *   node scripts/validate-translation.mjs --book=GEN   # Livro específico
 *   node scripts/validate-translation.mjs --testament=NT
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════

const PATHS = {
  translatedDir: join(projectRoot, 'Bible belem-pt-br', 'txt'),
  oshbDir: join(projectRoot, 'codices', 'hebraico', 'oshb-wlc', 'wlc'),
  sblgntDir: join(projectRoot, 'codices', 'grego', 'sblgnt-morphgnt'),
  nestle1904Dir: join(projectRoot, 'codices', 'grego', 'nestle1904'),
  keepOriginal: join(projectRoot, 'glossary', 'keep_original.json'),
  hebrewGlossary: join(projectRoot, 'glossary', 'hebrew.json'),
  greekGlossary: join(projectRoot, 'glossary', 'greek.json'),
  reportOut: join(projectRoot, 'INTEGRIDADE-TRADUCAO.md'),
};

// Palavras PROIBIDAS na tradução
const FORBIDDEN_WORDS = [
  'Deus',      // Latim — NUNCA deve aparecer
  'Senhor',    // Tradução tradicional de yhwh/Adonai
  'Jesus',     // Forma latina — deve ser Iesous
  'Cristo',    // Forma latina — deve ser Christos
  'Apocalipse' // Nome incorreto — deve ser Desvelação
];

// Palavras que DEVEM ser preservadas no original
const KEEP_ORIGINAL_LATIN = [
  'yhwh', 'Elohim', 'Eloah', 'El', 'Adonai',
  'Theos', 'Iesous', 'Christos'
];

// Mapeamento livro traduzido -> OSHB XML
const BOOK_MAP_OSHB = {
  'GEN': 'Gen', 'EXO': 'Exod', 'LEV': 'Lev', 'NUM': 'Num', 'DEU': 'Deut',
  'JOS': 'Josh', 'JDG': 'Judg', 'RUT': 'Ruth', '1SA': '1Sam', '2SA': '2Sam',
  '1KI': '1Kgs', '2KI': '2Kgs', '1CH': '1Chr', '2CH': '2Chr', 'EZR': 'Ezra',
  'NEH': 'Neh', 'EST': 'Esth', 'JOB': 'Job', 'PSA': 'Ps', 'PRO': 'Prov',
  'ECC': 'Eccl', 'SNG': 'Song', 'ISA': 'Isa', 'JER': 'Jer', 'LAM': 'Lam',
  'EZK': 'Ezek', 'DAN': 'Dan', 'HOS': 'Hos', 'JOL': 'Joel', 'AMO': 'Amos',
  'OBA': 'Obad', 'JON': 'Jonah', 'MIC': 'Mic', 'NAM': 'Nah', 'HAB': 'Hab',
  'ZEP': 'Zeph', 'HAG': 'Hag', 'ZEC': 'Zech', 'MAL': 'Mal'
};

// Mapeamento livro traduzido -> SBLGNT file number
const BOOK_MAP_SBLGNT = {
  'MAT': '61', 'MRK': '62', 'LUK': '63', 'JHN': '64', 'ACT': '65',
  'ROM': '66', '1CO': '67', '2CO': '68', 'GAL': '69', 'EPH': '70',
  'PHP': '71', 'COL': '72', '1TH': '73', '2TH': '74', '1TI': '75',
  '2TI': '76', 'TIT': '77', 'PHM': '78', 'HEB': '79', 'JAS': '80',
  '1PE': '81', '2PE': '82', '1JN': '83', '2JN': '84', '3JN': '85',
  'JUD': '86', 'DES': '87'  // Desvelação = Revelation
};

const SBLGNT_BOOK_NAMES = {
  '61': 'Mt', '62': 'Mk', '63': 'Lk', '64': 'Jn', '65': 'Ac',
  '66': 'Ro', '67': '1Co', '68': '2Co', '69': 'Ga', '70': 'Eph',
  '71': 'Php', '72': 'Col', '73': '1Th', '74': '2Th', '75': '1Ti',
  '76': '2Ti', '77': 'Tit', '78': 'Phm', '79': 'Heb', '80': 'Jas',
  '81': '1Pe', '82': '2Pe', '83': '1Jn', '84': '2Jn', '85': '3Jn',
  '86': 'Jud', '87': 'Re'
};

// ═══════════════════════════════════════════════════════════════════
// PARSE ARGS
// ═══════════════════════════════════════════════════════════════════

let FILTER_BOOK = null;
let FILTER_TESTAMENT = null;

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith('--book=')) FILTER_BOOK = arg.split('=')[1].toUpperCase();
  if (arg.startsWith('--testament=')) FILTER_TESTAMENT = arg.split('=')[1].toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════

function readTranslatedBook(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const result = {
    title: '',
    chapters: {},
    totalLines: 0,
    emptyLines: 0,
    headerLines: 0,
    contentLines: 0,
  };

  let currentChapter = 0;
  let inHeader = true;

  for (const line of lines) {
    result.totalLines++;
    const trimmed = line.trim();

    if (!trimmed) { result.emptyLines++; continue; }

    // Detectar header (linhas ═══ ou com metadata)
    if (trimmed.startsWith('═') || trimmed.startsWith('Tradução:') ||
        trimmed.startsWith('Método:') || trimmed.startsWith('Sem ') ||
        trimmed.startsWith('Total de') || trimmed.startsWith('Versículos') ||
        trimmed.startsWith('Cobertura:')) {
      result.headerLines++;
      if (trimmed.includes('Total de versículos:')) {
        const m = trimmed.match(/Total de versículos:\s*(\d+)/);
        if (m) result.declaredVerses = parseInt(m[1]);
      }
      if (trimmed.includes('Cobertura:')) {
        const m = trimmed.match(/Cobertura:\s*([\d.]+)%/);
        if (m) result.declaredCoverage = parseFloat(m[1]);
      }
      continue;
    }

    // Detectar título do livro (primeira linha de conteúdo maiúscula)
    if (inHeader && trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('──')) {
      result.title = trimmed;
      inHeader = false;
      continue;
    }
    inHeader = false;

    // Detectar capítulo
    const chapterMatch = trimmed.match(/^── Capítulo (\d+) ──$/);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1]);
      if (!result.chapters[currentChapter]) {
        result.chapters[currentChapter] = { verses: [], lineCount: 0 };
      }
      continue;
    }

    // Separador
    if (trimmed.startsWith('──')) continue;

    // Linha de conteúdo (versículo traduzido)
    if (currentChapter > 0) {
      result.contentLines++;
      if (!result.chapters[currentChapter]) {
        result.chapters[currentChapter] = { verses: [], lineCount: 0 };
      }
      result.chapters[currentChapter].verses.push(trimmed);
      result.chapters[currentChapter].lineCount++;
    }
  }

  return result;
}

function countOSHBChaptersVerses(xmlPath) {
  if (!existsSync(xmlPath)) return null;
  const content = readFileSync(xmlPath, 'utf-8');
  const chapters = {};
  // Count <chapter> elements and <verse> elements
  const chapterMatches = content.matchAll(/<chapter\s+osisID="[^"]*?\.(\d+)"/g);
  for (const m of chapterMatches) {
    chapters[parseInt(m[1])] = { verseCount: 0 };
  }
  const verseMatches = content.matchAll(/<verse\s+osisID="[^"]*?\.(\d+)\.(\d+)"/g);
  for (const m of verseMatches) {
    const ch = parseInt(m[1]);
    if (!chapters[ch]) chapters[ch] = { verseCount: 0 };
    chapters[ch].verseCount++;
  }
  // Count <w> (word) elements
  const wordCount = (content.match(/<w\s/g) || []).length;
  return { chapters, wordCount, totalChapters: Object.keys(chapters).length };
}

function countSBLGNTTokens(fileNum) {
  const files = readdirSync(PATHS.sblgntDir).filter(f => f.startsWith(fileNum + '-'));
  if (files.length === 0) return null;
  const content = readFileSync(join(PATHS.sblgntDir, files[0]), 'utf-8');
  const lines = content.trim().split('\n');
  const chapters = {};
  let totalTokens = 0;
  for (const line of lines) {
    // Format: CCVVWW POS MORPH TEXT NORM LEMMA (space-separated, first field is ref)
    const ref = line.substring(0, 6).trim();
    if (!ref || ref.length < 4) continue;
    // CCVV format: first 2 digits = chapter, next 2 = verse
    const ch = parseInt(ref.substring(0, 2));
    const vs = parseInt(ref.substring(2, 4));
    if (isNaN(ch) || isNaN(vs)) continue;
    if (!chapters[ch]) chapters[ch] = { verseTokens: {}, tokenCount: 0 };
    if (!chapters[ch].verseTokens[vs]) chapters[ch].verseTokens[vs] = 0;
    chapters[ch].verseTokens[vs]++;
    chapters[ch].tokenCount++;
    totalTokens++;
  }
  return {
    chapters,
    totalTokens,
    totalChapters: Object.keys(chapters).length,
    totalVerses: Object.values(chapters).reduce((sum, ch) =>
      sum + Object.keys(ch.verseTokens).length, 0)
  };
}

function checkForbiddenWords(text, bookCode) {
  const issues = [];
  for (const word of FORBIDDEN_WORDS) {
    // Word boundary check - case sensitive for most, case insensitive for "Apocalipse"
    const regex = word === 'Apocalipse'
      ? new RegExp(`\\b${word}\\b`, 'gi')
      : new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) {
      issues.push({ word, count: matches.length, bookCode });
    }
  }
  return issues;
}

function checkKeepOriginal(text) {
  const found = {};
  for (const word of KEEP_ORIGINAL_LATIN) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = text.match(regex);
    if (matches) found[word] = matches.length;
  }
  return found;
}

function checkGreekScriptLeakage(text) {
  // Check for Greek Unicode characters that shouldn't be in translated text
  const greekPattern = /[\u0370-\u03FF\u1F00-\u1FFF]+/g;
  const matches = [...text.matchAll(greekPattern)];
  return matches.map(m => ({ text: m[0], index: m.index }));
}

function checkHebrewScriptLeakage(text) {
  // Check for Hebrew Unicode characters that shouldn't be in translated text
  // (except in keep_original words which use Latin transliteration)
  const hebrewPattern = /[\u0590-\u05FF\uFB1D-\uFB4F]+/g;
  const matches = [...text.matchAll(hebrewPattern)];
  return matches.map(m => ({ text: m[0], index: m.index }));
}

// ═══════════════════════════════════════════════════════════════════
// ANÁLISE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function analyzeBook(filePath) {
  const fileName = basename(filePath);
  const match = fileName.match(/^(\d+)_([A-Z0-9]+)_(.+)\.txt$/);
  if (!match) return null;

  const [, num, code, name] = match;
  const bookNum = parseInt(num);
  const isAT = bookNum <= 39;
  const isNT = bookNum >= 40;

  const book = readTranslatedBook(filePath);
  const content = readFileSync(filePath, 'utf-8');

  const result = {
    num: bookNum,
    code,
    name: name.replace(/_/g, ' '),
    testament: isAT ? 'AT' : 'NT',
    totalLines: book.totalLines,
    contentLines: book.contentLines,
    chapters: Object.keys(book.chapters).length,
    declaredVerses: book.declaredVerses || 0,
    declaredCoverage: book.declaredCoverage || 0,
    // Integrity checks
    forbiddenWords: checkForbiddenWords(content, code),
    keepOriginal: checkKeepOriginal(content),
    greekLeakage: checkGreekScriptLeakage(content),
    hebrewLeakage: checkHebrewScriptLeakage(content),
    // Codex comparison
    codexMatch: null,
    issues: [],
  };

  // Compare against source codex
  if (isAT && BOOK_MAP_OSHB[code]) {
    const oshbFile = join(PATHS.oshbDir, BOOK_MAP_OSHB[code] + '.xml');
    const oshbData = countOSHBChaptersVerses(oshbFile);
    if (oshbData) {
      result.codexMatch = {
        source: 'OSHB/WLC',
        sourceChapters: oshbData.totalChapters,
        sourceWords: oshbData.wordCount,
        translatedChapters: result.chapters,
        chapterMatch: oshbData.totalChapters === result.chapters,
      };
      if (!result.codexMatch.chapterMatch) {
        result.issues.push(
          `Capitulos: tradução tem ${result.chapters}, OSHB tem ${oshbData.totalChapters}`
        );
      }
    }
  } else if (isNT && BOOK_MAP_SBLGNT[code]) {
    const sblgntData = countSBLGNTTokens(BOOK_MAP_SBLGNT[code]);
    if (sblgntData) {
      result.codexMatch = {
        source: 'SBLGNT',
        sourceChapters: sblgntData.totalChapters,
        sourceTokens: sblgntData.totalTokens,
        sourceVerses: sblgntData.totalVerses,
        translatedChapters: result.chapters,
        chapterMatch: sblgntData.totalChapters === result.chapters,
      };
      if (!result.codexMatch.chapterMatch) {
        result.issues.push(
          `Capitulos: tradução tem ${result.chapters}, SBLGNT tem ${sblgntData.totalChapters}`
        );
      }
    }
  }

  // Flag forbidden words
  if (result.forbiddenWords.length > 0) {
    for (const fw of result.forbiddenWords) {
      result.issues.push(`PROIBIDA: "${fw.word}" encontrada ${fw.count}x`);
    }
  }

  // Flag Greek script leakage
  if (result.greekLeakage.length > 0) {
    result.issues.push(`Script grego Unicode: ${result.greekLeakage.length} ocorrências`);
  }

  // Flag Hebrew script leakage
  if (result.hebrewLeakage.length > 0) {
    result.issues.push(`Script hebraico Unicode: ${result.hebrewLeakage.length} ocorrências`);
  }

  return result;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VALIDAÇÃO DE INTEGRIDADE — Bíblia Belém An.C 2025');
  console.log('  Análise dual: AT (OSHB/WLC) + NT (SBLGNT)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  // List all translated books
  const files = readdirSync(PATHS.translatedDir)
    .filter(f => f.match(/^\d+_[A-Z0-9]+_/) && f.endsWith('.txt'))
    .sort();

  console.log(`📚 Livros encontrados: ${files.length}`);

  // Check codex availability
  const oshbExists = existsSync(PATHS.oshbDir);
  const sblgntExists = existsSync(PATHS.sblgntDir);
  console.log(`📜 OSHB/WLC: ${oshbExists ? 'Disponível' : 'NÃO ENCONTRADO'}`);
  console.log(`📜 SBLGNT:   ${sblgntExists ? 'Disponível' : 'NÃO ENCONTRADO'}`);
  console.log('');

  // Split into AT and NT for parallel analysis
  const atFiles = files.filter(f => parseInt(f.substring(0, 2)) <= 39);
  const ntFiles = files.filter(f => parseInt(f.substring(0, 2)) >= 40);

  // Apply filters
  let filesToProcess = files;
  if (FILTER_TESTAMENT === 'AT') filesToProcess = atFiles;
  if (FILTER_TESTAMENT === 'NT') filesToProcess = ntFiles;
  if (FILTER_BOOK) filesToProcess = files.filter(f => f.includes(`_${FILTER_BOOK}_`));

  console.log(`🔍 Analisando ${filesToProcess.length} livros...`);
  console.log(`   AT: ${atFiles.length} livros | NT: ${ntFiles.length} livros\n`);

  // Parallel analysis (simulating dual-GPU: AT + NT concurrently)
  const atAnalysis = filesToProcess
    .filter(f => parseInt(f.substring(0, 2)) <= 39)
    .map(f => analyzeBook(join(PATHS.translatedDir, f)));

  const ntAnalysis = filesToProcess
    .filter(f => parseInt(f.substring(0, 2)) >= 40)
    .map(f => analyzeBook(join(PATHS.translatedDir, f)));

  console.log('⚡ Worker AT: processando Antigo Testamento...');
  console.log('⚡ Worker NT: processando Novo Testamento...');

  const [atResults, ntResults] = await Promise.all([
    Promise.all(atAnalysis),
    Promise.all(ntAnalysis),
  ]);

  const allResults = [...atResults, ...ntResults].filter(Boolean);

  // ═══════════════════════════════════════════════════════════════
  // RESULTADOS
  // ═══════════════════════════════════════════════════════════════

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RESULTADOS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Summary stats
  let totalContentLines = 0;
  let totalForbidden = 0;
  let totalGreekLeak = 0;
  let totalHebrewLeak = 0;
  let totalIssues = 0;
  let chapterMismatches = 0;
  let booksWithIssues = [];
  const keepOriginalTotals = {};

  for (const r of allResults) {
    totalContentLines += r.contentLines;
    totalForbidden += r.forbiddenWords.reduce((s, fw) => s + fw.count, 0);
    totalGreekLeak += r.greekLeakage.length;
    totalHebrewLeak += r.hebrewLeakage.length;
    totalIssues += r.issues.length;
    if (r.codexMatch && !r.codexMatch.chapterMatch) chapterMismatches++;
    if (r.issues.length > 0) booksWithIssues.push(r);
    for (const [word, count] of Object.entries(r.keepOriginal)) {
      keepOriginalTotals[word] = (keepOriginalTotals[word] || 0) + count;
    }
  }

  console.log('📊 RESUMO GERAL');
  console.log(`   Livros analisados:     ${allResults.length}`);
  console.log(`   Linhas de conteúdo:    ${totalContentLines.toLocaleString()}`);
  console.log(`   Palavras proibidas:    ${totalForbidden} ${totalForbidden === 0 ? '✅' : '❌'}`);
  console.log(`   Script grego vazado:   ${totalGreekLeak} ${totalGreekLeak === 0 ? '✅' : '⚠️'}`);
  console.log(`   Script hebraico vaz.:  ${totalHebrewLeak} ${totalHebrewLeak === 0 ? '✅' : '⚠️'}`);
  console.log(`   Capítulos divergentes: ${chapterMismatches} ${chapterMismatches === 0 ? '✅' : '⚠️'}`);
  console.log(`   Livros com issues:     ${booksWithIssues.length}`);
  console.log('');

  console.log('📖 PALAVRAS PRESERVADAS (keep_original)');
  for (const word of KEEP_ORIGINAL_LATIN) {
    const count = keepOriginalTotals[word] || 0;
    console.log(`   ${word.padEnd(12)} ${count.toLocaleString().padStart(6)} ocorrências ${count > 0 ? '✅' : '⚠️'}`);
  }
  console.log('');

  // Per-book details
  console.log('📋 DETALHES POR LIVRO');
  console.log('─'.repeat(100));
  console.log(
    'Livro'.padEnd(8) +
    'Nome'.padEnd(22) +
    'T'.padEnd(4) +
    'Cap'.padEnd(5) +
    'Linhas'.padEnd(8) +
    'Cob%'.padEnd(8) +
    'Fonte'.padEnd(10) +
    'CapOK'.padEnd(7) +
    'Issues'
  );
  console.log('─'.repeat(100));

  for (const r of allResults) {
    const codexSrc = r.codexMatch ? r.codexMatch.source : '-';
    const capOK = r.codexMatch
      ? (r.codexMatch.chapterMatch ? '✅' : '❌')
      : '-';
    const issueStr = r.issues.length > 0
      ? `⚠️ ${r.issues.length}`
      : '✅';
    console.log(
      r.code.padEnd(8) +
      r.name.substring(0, 20).padEnd(22) +
      r.testament.padEnd(4) +
      String(r.chapters).padEnd(5) +
      String(r.contentLines).padEnd(8) +
      (r.declaredCoverage ? r.declaredCoverage.toFixed(1) + '%' : '-').padEnd(8) +
      codexSrc.padEnd(10) +
      capOK.padEnd(7) +
      issueStr
    );
  }
  console.log('─'.repeat(100));

  // Issues detail
  if (booksWithIssues.length > 0) {
    console.log('\n⚠️  ISSUES ENCONTRADAS');
    console.log('─'.repeat(60));
    for (const r of booksWithIssues) {
      console.log(`\n  ${r.code} (${r.name}):`);
      for (const issue of r.issues) {
        console.log(`    ⚠️  ${issue}`);
      }
      if (r.greekLeakage.length > 0) {
        const samples = r.greekLeakage.slice(0, 5);
        for (const gl of samples) {
          console.log(`       Grego: "${gl.text}" (posição ${gl.index})`);
        }
        if (r.greekLeakage.length > 5) {
          console.log(`       ... e mais ${r.greekLeakage.length - 5} ocorrências`);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // GERAR RELATÓRIO MD
  // ═══════════════════════════════════════════════════════════════

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Tempo: ${elapsed}s`);

  let report = `# Integridade da Traducao — Biblia Belem An.C 2025\n\n`;
  report += `**Data:** ${new Date().toISOString().split('T')[0]}\n`;
  report += `**Script:** \`scripts/validate-translation.mjs\`\n`;
  report += `**Tempo de execucao:** ${elapsed}s\n\n`;
  report += `---\n\n`;

  report += `## Resumo\n\n`;
  report += `| Metrica | Valor | Status |\n`;
  report += `|---------|-------|--------|\n`;
  report += `| Livros analisados | ${allResults.length} | ${allResults.length === 66 ? 'PASS' : 'FAIL'} |\n`;
  report += `| Linhas de conteudo | ${totalContentLines.toLocaleString()} | - |\n`;
  report += `| Palavras proibidas | ${totalForbidden} | ${totalForbidden === 0 ? 'PASS' : 'FAIL'} |\n`;
  report += `| Script grego vazado | ${totalGreekLeak} | ${totalGreekLeak === 0 ? 'PASS' : 'WARN'} |\n`;
  report += `| Script hebraico vazado | ${totalHebrewLeak} | ${totalHebrewLeak === 0 ? 'PASS' : 'WARN'} |\n`;
  report += `| Capitulos vs codice | ${chapterMismatches} divergencias | ${chapterMismatches === 0 ? 'PASS' : 'WARN'} |\n`;
  report += `| Livros com issues | ${booksWithIssues.length} | ${booksWithIssues.length === 0 ? 'PASS' : 'WARN'} |\n`;
  report += `\n---\n\n`;

  report += `## Palavras Preservadas (keep_original)\n\n`;
  report += `| Palavra | Ocorrencias | Status |\n`;
  report += `|---------|-------------|--------|\n`;
  for (const word of KEEP_ORIGINAL_LATIN) {
    const count = keepOriginalTotals[word] || 0;
    report += `| ${word} | ${count.toLocaleString()} | ${count > 0 ? 'PASS' : 'WARN'} |\n`;
  }
  report += `\n---\n\n`;

  report += `## Cobertura por Livro\n\n`;
  report += `| # | Codigo | Nome | Test. | Cap | Linhas | Cob% | Fonte | CapOK | Issues |\n`;
  report += `|---|--------|------|-------|-----|--------|------|-------|-------|--------|\n`;
  for (const r of allResults) {
    const codexSrc = r.codexMatch ? r.codexMatch.source : '-';
    const capOK = r.codexMatch ? (r.codexMatch.chapterMatch ? 'PASS' : 'FAIL') : '-';
    const issueStr = r.issues.length > 0 ? `${r.issues.length} issues` : 'OK';
    report += `| ${r.num} | ${r.code} | ${r.name.substring(0, 18)} | ${r.testament} | ${r.chapters} | ${r.contentLines} | ${r.declaredCoverage ? r.declaredCoverage.toFixed(1) + '%' : '-'} | ${codexSrc} | ${capOK} | ${issueStr} |\n`;
  }
  report += `\n---\n\n`;

  if (booksWithIssues.length > 0) {
    report += `## Issues Encontradas\n\n`;
    for (const r of booksWithIssues) {
      report += `### ${r.code} — ${r.name}\n\n`;
      for (const issue of r.issues) {
        report += `- ${issue}\n`;
      }
      if (r.greekLeakage.length > 0) {
        report += `\nScript grego encontrado:\n`;
        for (const gl of r.greekLeakage.slice(0, 10)) {
          report += `- \`${gl.text}\` (posicao ${gl.index})\n`;
        }
        if (r.greekLeakage.length > 10) {
          report += `- ... e mais ${r.greekLeakage.length - 10} ocorrencias\n`;
        }
      }
      report += '\n';
    }
    report += `---\n\n`;
  }

  report += `## Fontes de Comparacao\n\n`;
  report += `| Testamento | Fonte | Licenca | Local |\n`;
  report += `|------------|-------|---------|-------|\n`;
  report += `| AT | OSHB/WLC (Westminster Leningrad Codex) | PD + CC BY 4.0 | \`codices/hebraico/oshb-wlc/\` |\n`;
  report += `| NT | SBLGNT (MorphGNT) | CC BY 4.0 | \`codices/grego/sblgnt-morphgnt/\` |\n`;
  report += `\n---\n\n`;
  report += `**Biblia Belem An.C 2025** — CC BY 4.0 — Belem Anderson Costa\n`;

  writeFileSync(PATHS.reportOut, report, 'utf-8');
  console.log(`\n📄 Relatório salvo em: ${PATHS.reportOut}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
